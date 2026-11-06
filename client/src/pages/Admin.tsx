import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { portfolioSchema, type PortfolioData } from "@shared/schema";
import { PORTFOLIO_QUERY_KEY } from "@/hooks/use-portfolio";
import { useSeo } from "@/hooks/use-seo";
import { ErrorsContext, UploadContext } from "@/components/admin/fields";
import { findProblems, type Problem } from "@/components/admin/validate";
import {
  AboutSection,
  AdvancedSection,
  ContactSection,
  ExperienceSection,
  IntroSection,
  ProfileSection,
  ProjectsSection,
  SkillsSection,
} from "@/components/admin/sections";

const TOKEN_KEY = "portfolioAdminToken";
const DRAFT_KEY = "portfolioAdminDraft";

const SECTIONS = [
  { id: "identity", label: "Profile", description: "Your name, title, email, CV and social links." },
  { id: "intro", label: "Intro", description: "The statement at the top of your site." },
  { id: "practice", label: "About", description: "Your portrait, your story and your working notes." },
  { id: "projects", label: "Projects", description: "Everything in the Work section." },
  { id: "record", label: "Experience", description: "Your jobs and education." },
  { id: "toolkit", label: "Skills", description: "Your technologies, and where you used them." },
  { id: "contact", label: "Contact", description: "The closing section." },
  { id: "advanced", label: "Advanced", description: "Backups, starting over and raw editing." },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const storage = {
  get(key: string) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* The editor still works; it just can't recover a draft. */
    }
  },
  remove(key: string) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* Nothing to do. */
    }
  },
};

class AuthError extends Error {}

function SignIn({ error, onSubmit }: { error?: string; onSubmit: (token: string) => void }) {
  const [value, setValue] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (value.trim()) onSubmit(value.trim());
  };

  return (
    <main className="gutter flex min-h-screen items-center justify-center py-10">
      <form onSubmit={submit} className="w-full max-w-sm">
        <p className="t-label">Back office</p>
        <h1 className="t-condensed mt-2 text-6xl">Sign in</h1>
        <label className="t-head mt-6 block text-[0.95rem]" htmlFor="admin-token">
          Admin token
        </label>
        <p className="t-mono mt-0.5 text-graphite">The ADMIN_TOKEN value from your server settings.</p>
        <input
          id="admin-token"
          type="password"
          autoFocus
          autoComplete="current-password"
          value={value}
          aria-invalid={Boolean(error)}
          onChange={(event) => setValue(event.target.value)}
          className="admin-input mt-1.5"
        />
        {error && (
          <p className="t-mono mt-2 font-medium text-pen" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn mt-4 w-full">
          Sign in
        </button>
      </form>
    </main>
  );
}

type Source = "saved" | "code" | "invalid";

function Editor({
  initial,
  source,
  token,
  onSignOut,
}: {
  initial: PortfolioData;
  source: Source;
  token: string;
  onSignOut: () => void;
}) {
  const queryClient = useQueryClient();
  const [published, setPublished] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [section, setSection] = useState<SectionId>("identity");
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ error: boolean; text: string } | null>(null);
  const [everPublished, setEverPublished] = useState(source === "saved");
  const [recoverable, setRecoverable] = useState<PortfolioData | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(published), [draft, published]);
  const publishedSlugs = useMemo(() => new Set(published.projects.map((project) => project.slug)), [published]);

  // Offer back any unpublished work from a previous visit.
  useEffect(() => {
    const stored = storage.get(DRAFT_KEY);
    if (!stored) return;
    try {
      const parsed = portfolioSchema.safeParse(JSON.parse(stored));
      if (parsed.success && JSON.stringify(parsed.data) !== JSON.stringify(initial)) {
        setRecoverable(parsed.data);
      } else {
        storage.remove(DRAFT_KEY);
      }
    } catch {
      storage.remove(DRAFT_KEY);
    }
    // Only on opening the editor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const timer = window.setTimeout(() => storage.set(DRAFT_KEY, JSON.stringify(draft)), 500);
    return () => window.clearTimeout(timer);
  }, [draft, dirty]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = useCallback(<K extends keyof PortfolioData>(key: K, value: PortfolioData[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setNotice(null);
  }, []);

  const errors = useMemo(() => Object.fromEntries(problems.map((problem) => [problem.path, problem.message])), [problems]);

  // Problems clear as they're fixed, but new ones only appear on publishing.
  useEffect(() => {
    if (problems.length === 0) return;
    const current = new Set(findProblems(draft).map((problem) => problem.path));
    setProblems((list) => list.filter((problem) => current.has(problem.path)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  const upload = useCallback(
    async (file: File) => {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch(api.uploads.create.path, {
        method: api.uploads.create.method,
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "The upload failed. Please try again.");
      }
      return api.uploads.create.responses[201].parse(await res.json()).url;
    },
    [token],
  );

  const goTo = (path: string) => {
    const [first, second] = path.split(".");
    if (SECTIONS.some((item) => item.id === first)) setSection(first as SectionId);
    if (first === "projects" && second !== undefined) setSelectedProject(Number(second));
  };

  const publish = async () => {
    const found = findProblems(draft);
    setProblems(found);
    if (found.length > 0) {
      setNotice(null);
      window.requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setSaving(true);
    setNotice(null);
    try {
      const res = await fetch(api.portfolio.update.path, {
        method: api.portfolio.update.method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(draft),
      });
      if (res.status === 401) {
        onSignOut();
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(res.status < 500 && data?.message ? data.message : "The server couldn’t save this. Your changes are still here, so please try again.");
      }
      const saved = api.portfolio.update.responses[200].parse(await res.json());
      setPublished(saved);
      setDraft(saved);
      setEverPublished(true);
      queryClient.setQueryData(PORTFOLIO_QUERY_KEY, saved);
      storage.remove(DRAFT_KEY);
      setNotice({ error: false, text: "Published. Your site is up to date." });
    } catch (failure) {
      setNotice({ error: true, text: failure instanceof Error ? failure.message : "Saving failed." });
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    if (!window.confirm("Discard all your unpublished changes?")) return;
    setDraft(published);
    setProblems([]);
    setSelectedProject(null);
    setNotice(null);
    storage.remove(DRAFT_KEY);
  };

  const current = SECTIONS.find((item) => item.id === section)!;
  const sectionHasProblem = (id: string) => problems.some((problem) => problem.path.split(".")[0] === id);

  return (
    <UploadContext.Provider value={upload}>
      <ErrorsContext.Provider value={errors}>
        {/* Save bar */}
        <header className="gutter sticky top-0 z-40 flex min-h-[60px] flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-ink bg-paper py-2">
          <div className="flex items-baseline gap-3">
            <h1 className="t-wide text-lg leading-none">Phyhan</h1>
            <p className="t-label hidden sm:block">Back office</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <p className={`t-mono ${dirty ? "font-medium text-pen" : "text-graphite"}`} aria-live="polite">
              {dirty ? "Unpublished changes" : "All changes published"}
            </p>
            <button type="button" className="btn btn-ghost !min-h-[38px] !px-3 !py-1 !text-[0.9rem]" disabled={!dirty || saving} onClick={discard}>
              Discard
            </button>
            <button type="button" className="btn !min-h-[38px] !px-3 !py-1 !text-[0.9rem]" disabled={!dirty || saving} onClick={() => void publish()}>
              {saving ? "Publishing…" : "Publish"}
            </button>
          </div>
        </header>

        <div className="gutter grid grid-cols-[minmax(0,1fr)] gap-6 py-6 md:grid-cols-[180px_minmax(0,1fr)] md:gap-10">
          {/* Sections */}
          <nav aria-label="Sections" className="md:sticky md:top-[84px] md:self-start">
            <ul className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 md:mx-0 md:flex-col md:overflow-visible md:p-0">
              {SECTIONS.map((item) => (
                <li key={item.id} className="shrink-0">
                  <button
                    type="button"
                    aria-current={section === item.id ? "page" : undefined}
                    onClick={() => {
                      setSection(item.id);
                      setSelectedProject(null);
                      window.scrollTo({ top: 0 });
                    }}
                    className={`t-head flex min-h-[40px] w-full items-center justify-between gap-2 whitespace-nowrap px-3 text-left text-[0.95rem] ${
                      section === item.id ? "bg-ink text-paper" : "hover:bg-ink/10"
                    }`}
                  >
                    {item.label}
                    {sectionHasProblem(item.id) && <span aria-label="has problems">●</span>}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 hidden space-y-1 md:block">
              <a href="/" target="_blank" rel="noreferrer" className="link-quiet t-mono block">
                View published site ↗
              </a>
              <button type="button" onClick={onSignOut} className="link-quiet t-mono block min-h-[32px]">
                Sign out
              </button>
            </div>
          </nav>

          <main className="min-w-0 max-w-3xl">
            {recoverable && (
              <div className="mb-5 border border-pen p-3">
                <p className="text-[1.0625rem] leading-snug">You have unpublished changes from your last visit.</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn !min-h-[38px] !px-3 !py-1 !text-[0.9rem]"
                    onClick={() => {
                      setDraft(recoverable);
                      setRecoverable(null);
                    }}
                  >
                    Restore them
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost !min-h-[38px] !px-3 !py-1 !text-[0.9rem]"
                    onClick={() => {
                      storage.remove(DRAFT_KEY);
                      setRecoverable(null);
                    }}
                  >
                    Throw them away
                  </button>
                </div>
              </div>
            )}

            {source === "invalid" && (
              <p className="mb-5 border border-pen p-3 text-[1.0625rem] leading-snug">
                Your saved content couldn’t be read, so this shows the content from the code. Publishing will replace the saved copy.
              </p>
            )}
            {source === "code" && !everPublished && (
              <p className="t-mono mb-5 text-graphite">
                Showing the content from the code. Your first publish creates the copy that the site uses from then on.
              </p>
            )}

            <div aria-live="polite">
              {notice && (
                <p className={`mb-5 border p-3 text-[1.0625rem] leading-snug ${notice.error ? "border-pen font-medium text-pen" : "border-ink"}`}>
                  {notice.text}
                </p>
              )}
            </div>

            {problems.length > 0 && (
              <div ref={summaryRef} tabIndex={-1} role="alert" className="mb-5 border-2 border-pen p-3 outline-none">
                <p className="t-head text-lg">
                  Fix {problems.length === 1 ? "this" : `these ${problems.length} things`} before publishing
                </p>
                <ul className="mt-2 space-y-1">
                  {problems.slice(0, 12).map((problem) => (
                    <li key={problem.path}>
                      <button type="button" onClick={() => goTo(problem.path)} className="link-quiet t-mono text-left">
                        {problem.message}
                      </button>
                    </li>
                  ))}
                </ul>
                {problems.length > 12 && <p className="t-mono mt-1 text-graphite">And {problems.length - 12} more.</p>}
              </div>
            )}

            <h2 className="t-condensed text-5xl">{current.label}</h2>
            <p className="t-mono mb-5 mt-1 text-graphite">{current.description}</p>

            {section === "identity" && <ProfileSection draft={draft} set={set} />}
            {section === "intro" && <IntroSection draft={draft} set={set} />}
            {section === "practice" && <AboutSection draft={draft} set={set} />}
            {section === "projects" && (
              <ProjectsSection
                draft={draft}
                set={set}
                publishedSlugs={publishedSlugs}
                selected={selectedProject}
                onSelect={(index) => {
                  setSelectedProject(index);
                  window.scrollTo({ top: 0 });
                }}
              />
            )}
            {section === "record" && <ExperienceSection draft={draft} set={set} />}
            {section === "toolkit" && <SkillsSection draft={draft} set={set} />}
            {section === "contact" && <ContactSection draft={draft} set={set} />}
            {section === "advanced" && <AdvancedSection draft={draft} replace={setDraft} />}

            <div className="mt-6 flex flex-wrap gap-4 md:hidden">
              <a href="/" target="_blank" rel="noreferrer" className="link-quiet t-mono">
                View published site ↗
              </a>
              <button type="button" onClick={onSignOut} className="link-quiet t-mono">
                Sign out
              </button>
            </div>
          </main>
        </div>
      </ErrorsContext.Provider>
    </UploadContext.Provider>
  );
}

export default function Admin() {
  useSeo({ title: "Admin: Phyhan", description: "Content editor.", path: "/admin" });

  const [token, setToken] = useState(() => storage.get(TOKEN_KEY) ?? "");

  const query = useQuery({
    queryKey: [api.admin.portfolio.path, token],
    enabled: Boolean(token),
    retry: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    gcTime: 0,
    queryFn: async () => {
      const res = await fetch(api.admin.portfolio.path, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) throw new AuthError();
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.message === "ADMIN_TOKEN is not configured."
            ? "ADMIN_TOKEN isn’t set on the server yet."
            : "Couldn’t load your content, so editing is off to protect it. Check the database connection and try again.",
        );
      }
      return api.admin.portfolio.responses[200].parse(await res.json());
    },
  });

  const authFailed = query.error instanceof AuthError;

  useEffect(() => {
    if (query.isSuccess) storage.set(TOKEN_KEY, token);
    if (authFailed) storage.remove(TOKEN_KEY);
  }, [query.isSuccess, authFailed, token]);

  const signOut = () => {
    storage.remove(TOKEN_KEY);
    setToken("");
  };

  if (!token || authFailed) {
    return <SignIn error={authFailed ? "That token isn’t right." : undefined} onSubmit={setToken} />;
  }

  if (query.isPending) {
    return (
      <main className="gutter flex min-h-screen items-center justify-center">
        <p className="t-mono" role="status">
          Loading your content…
        </p>
      </main>
    );
  }

  if (query.isError) {
    return (
      <main className="gutter flex min-h-screen items-center justify-center">
        <div className="max-w-md">
          <p className="text-[1.125rem] leading-snug" role="alert">
            {query.error.message}
          </p>
          <div className="mt-4 flex gap-2">
            <button type="button" className="btn" onClick={() => void query.refetch()}>
              Try again
            </button>
            <button type="button" className="btn btn-ghost" onClick={signOut}>
              Sign out
            </button>
          </div>
        </div>
      </main>
    );
  }

  return <Editor initial={query.data.data} source={query.data.source} token={token} onSignOut={signOut} />;
}
