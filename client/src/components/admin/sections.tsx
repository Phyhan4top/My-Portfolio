import { useEffect, useState, type ReactNode } from "react";
import { portfolioSchema, type PortfolioData, type Project, type SkillTier } from "@shared/schema";
import { defaultPortfolio } from "@shared/content";
import {
  CheckField,
  FileField,
  ImageEditor,
  Repeater,
  SelectField,
  StringList,
  TagsField,
  TextArea,
  TextField,
  type ImageValue,
} from "./fields";

type SectionProps = {
  draft: PortfolioData;
  set: <K extends keyof PortfolioData>(key: K, value: PortfolioData[K]) => void;
};

function Group({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="space-y-4 border-t border-ink pt-4">
      {title && <h3 className="t-label">{title}</h3>}
      {children}
    </section>
  );
}

const Row = ({ children }: { children: ReactNode }) => <div className="grid gap-4 sm:grid-cols-2">{children}</div>;

const emptyImage = (): ImageValue => ({ src: "", alt: "", caption: "", width: 1200, height: 800 });

export function ProfileSection({ draft, set }: SectionProps) {
  const { identity } = draft;
  const update = (changes: Partial<PortfolioData["identity"]>) => set("identity", { ...identity, ...changes });

  return (
    <div className="space-y-6">
      <Group title="About you">
        <Row>
          <TextField label="Full name" path="identity.fullName" value={identity.fullName} onChange={(fullName) => update({ fullName })} />
          <TextField
            label="Short name"
            hint="The giant word at the top of the site."
            path="identity.shortName"
            value={identity.shortName}
            onChange={(shortName) => update({ shortName })}
          />
        </Row>
        <TextField label="Job title" path="identity.title" value={identity.title} onChange={(title) => update({ title })} />
        <Row>
          <TextField label="Location" path="identity.location" value={identity.location} onChange={(location) => update({ location })} />
          <TextField
            label="Email"
            type="email"
            hint="Shown on the site, and used for the contact links."
            path="identity.email"
            value={identity.email}
            onChange={(email) => update({ email })}
          />
        </Row>
        <TextField
          label="Availability"
          hint="For example, what kind of work you’re open to."
          path="identity.availability"
          value={identity.availability}
          onChange={(availability) => update({ availability })}
        />
      </Group>
      <Group title="CV">
        <FileField
          label="CV link"
          hint="Upload a PDF, or paste a link. Your CV is public once published."
          path="identity.cvUrl"
          value={identity.cvUrl}
          accept="application/pdf"
          buttonLabel="Upload PDF"
          onChange={(cvUrl) => update({ cvUrl })}
        />
      </Group>
      <Group title="Social links">
        <Repeater
          label="Links"
          items={identity.socials}
          onChange={(socials) => update({ socials })}
          makeNew={() => ({ label: "", href: "" })}
          addLabel="Add a link"
          itemName="link"
          renderItem={(link, change, index) => (
            <Row>
              <TextField label="Name" placeholder="GitHub" path={`identity.socials.${index}.label`} value={link.label} onChange={(label) => change({ ...link, label })} />
              <TextField label="Address" placeholder="https://" path={`identity.socials.${index}.href`} value={link.href} onChange={(href) => change({ ...link, href })} />
            </Row>
          )}
        />
      </Group>
    </div>
  );
}

export function IntroSection({ draft, set }: SectionProps) {
  const { intro } = draft;
  return (
    <div className="space-y-6">
      <Group>
        <TextArea
          label="Your statement"
          hint="The large sentence under your name."
          path="intro.statement"
          rows={4}
          value={intro.statement}
          onChange={(statement) => set("intro", { ...intro, statement })}
        />
        <StringList
          label="Phrases to underline"
          hint="Copy these from the statement exactly, word for word."
          items={intro.emphasis}
          onChange={(emphasis) => set("intro", { ...intro, emphasis })}
          addLabel="Add a phrase"
          itemName="phrase"
          rows={1}
          path="intro.emphasis"
        />
      </Group>
    </div>
  );
}

export function AboutSection({ draft, set }: SectionProps) {
  const { practice } = draft;
  const update = (changes: Partial<PortfolioData["practice"]>) => set("practice", { ...practice, ...changes });

  return (
    <div className="space-y-6">
      <Group title="Portrait">
        <ImageEditor path="practice.portrait" value={practice.portrait} onChange={(portrait) => update({ portrait })} />
      </Group>
      <Group title="Your story">
        <StringList
          label="Paragraphs"
          hint="The first one appears large."
          items={practice.paragraphs}
          onChange={(paragraphs) => update({ paragraphs })}
          addLabel="Add a paragraph"
          itemName="paragraph"
          rows={4}
          path="practice.paragraphs"
        />
      </Group>
      <Group title="Working notes">
        <Repeater
          label="Notes"
          items={practice.notes}
          onChange={(notes) => update({ notes })}
          makeNew={() => ({ title: "", body: "", source: "" })}
          addLabel="Add a note"
          itemName="note"
          itemTitle={(note) => note.title}
          renderItem={(note, change, index) => (
            <>
              <TextField label="Title" path={`practice.notes.${index}.title`} value={note.title} onChange={(title) => change({ ...note, title })} />
              <TextArea label="Text" path={`practice.notes.${index}.body`} value={note.body} onChange={(body) => change({ ...note, body })} />
              <TextField label="Where you learned it" placeholder="From PhyhanAgro" value={note.source} onChange={(source) => change({ ...note, source })} />
            </>
          )}
        />
      </Group>
    </div>
  );
}

const FIGURES: { value: string; label: string }[] = [
  { value: "", label: "None" },
  { value: "order-trace", label: "Order trace (PhyhanAgro)" },
  { value: "canvas-mini", label: "Canvas editor (Skye Editor)" },
  { value: "role-lens", label: "Role wireframe (SuccessTab)" },
  { value: "safe-browser", label: "Safe Browser simulation" },
  { value: "exam-browser", label: "Exam Browser simulation" },
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function ProjectEditor({
  project,
  index,
  isPublished,
  onChange,
}: {
  project: Project;
  index: number;
  isPublished: boolean;
  onChange: (project: Project) => void;
}) {
  const at = `projects.${index}`;
  const update = (changes: Partial<Project>) => onChange({ ...project, ...changes });

  return (
    <div className="space-y-6">
      <Group title="Basics">
        <TextField
          label="Project name"
          path={`${at}.name`}
          value={project.name}
          onChange={(name) => update(isPublished ? { name } : { name, slug: slugify(name) || project.slug })}
        />
        <TextField
          label="Page address"
          hint={
            isPublished
              ? `/work/${project.slug}. Locked, so links to this page keep working.`
              : `/work/${project.slug}. Filled in from the name.`
          }
          path={`${at}.slug`}
          value={project.slug}
          disabled={isPublished}
          onChange={(slug) => update({ slug })}
        />
        <TextArea
          label="Summary"
          hint="One or two sentences. Shown on the home page and in search results."
          path={`${at}.summary`}
          value={project.summary}
          onChange={(summary) => update({ summary })}
        />
        <Row>
          <TextField label="Company or context" value={project.context} onChange={(context) => update({ context })} />
          <TextField label="Your role" value={project.role} onChange={(role) => update({ role })} />
          <TextField label="When" placeholder="Apr 2025 – present" value={project.period} onChange={(period) => update({ period })} />
          <TextField label="Status" placeholder="Live, private, pre-launch…" value={project.status} onChange={(status) => update({ status })} />
        </Row>
        <TagsField label="Technologies" value={project.stack} onChange={(stack) => update({ stack })} />
        <TextArea
          label="Note"
          hint="Optional. For example, why something can’t be shown."
          value={project.note ?? ""}
          onChange={(note) => update({ note: note || undefined })}
        />
      </Group>

      <Group title="Links">
        <Repeater
          label="Links shown on this project"
          items={project.links}
          onChange={(links) => update({ links })}
          makeNew={() => ({ label: "", href: "" })}
          addLabel="Add a link"
          itemName="link"
          renderItem={(link, change, linkIndex) => (
            <Row>
              <TextField label="Name" placeholder="Live site" path={`${at}.links.${linkIndex}.label`} value={link.label} onChange={(label) => change({ ...link, label })} />
              <TextField label="Address" placeholder="https://" path={`${at}.links.${linkIndex}.href`} value={link.href} onChange={(href) => change({ ...link, href })} />
            </Row>
          )}
        />
      </Group>

      <Group title="What you did">
        <StringList
          label="Your contribution"
          items={project.contribution}
          onChange={(contribution) => update({ contribution })}
          addLabel="Add a point"
          itemName="point"
        />
      </Group>

      <Group title="The hard parts">
        <Repeater
          label="Challenges"
          items={project.challenges}
          onChange={(challenges) => update({ challenges })}
          makeNew={() => ({ title: "", body: "" })}
          addLabel="Add a hard part"
          itemName="hard part"
          itemTitle={(challenge) => challenge.title}
          renderItem={(challenge, change, challengeIndex) => (
            <>
              <TextField label="Title" path={`${at}.challenges.${challengeIndex}.title`} value={challenge.title} onChange={(title) => change({ ...challenge, title })} />
              <TextArea label="Text" rows={4} path={`${at}.challenges.${challengeIndex}.body`} value={challenge.body} onChange={(body) => change({ ...challenge, body })} />
            </>
          )}
        />
      </Group>

      <Group title="Images">
        <Repeater
          label="Screenshots"
          hint="PNG, JPG, WEBP or GIF, up to 4 MB."
          items={project.images}
          onChange={(images) => update({ images })}
          makeNew={emptyImage}
          addLabel="Add an image"
          itemName="image"
          itemTitle={(image) => image.caption || image.alt}
          renderItem={(image, change, imageIndex) => (
            <ImageEditor path={`${at}.images.${imageIndex}`} value={image} onChange={change}>
              <TextField
                label="Journey step"
                hint="Optional. Images with the same step are grouped, like “Browse” or “Cart”."
                value={image.step ?? ""}
                onChange={(step) => change({ ...image, step: step || undefined })}
              />
              <CheckField
                label="Hide on phones (a phone-sized version is next to it)"
                checked={Boolean(image.desktopOnly)}
                onChange={(desktopOnly) => change({ ...image, desktopOnly: desktopOnly || undefined })}
              />
            </ImageEditor>
          )}
        />
      </Group>

      <Group title="Interactive figure">
        <SelectField
          label="Figure on the project page"
          value={project.figure ?? ""}
          options={FIGURES}
          onChange={(figure) => update({ figure: (figure || undefined) as Project["figure"] })}
        />
      </Group>
    </div>
  );
}

export function ProjectsSection({
  draft,
  set,
  publishedSlugs,
  selected,
  onSelect,
}: SectionProps & { publishedSlugs: Set<string>; selected: number | null; onSelect: (index: number | null) => void }) {
  const { projects } = draft;

  const move = (from: number, to: number) => {
    const next = [...projects];
    [next[from], next[to]] = [next[to], next[from]];
    set("projects", next);
  };

  const remove = (index: number) => {
    if (!window.confirm(`Remove “${projects[index].name}”? Its page will stop working once you publish.`)) return;
    set("projects", projects.filter((_, itemIndex) => itemIndex !== index));
  };

  const add = () => {
    let number = projects.length + 1;
    while (projects.some((project) => project.slug === `new-project-${number}`)) number += 1;
    const created: Project = {
      slug: `new-project-${number}`,
      name: "",
      context: "",
      period: "",
      role: "",
      status: "",
      summary: "",
      contribution: [],
      stack: [],
      challenges: [],
      images: [],
      links: [],
    };
    set("projects", [...projects, created]);
    onSelect(projects.length);
  };

  const current = selected === null ? undefined : projects[selected];

  if (selected !== null && current) {
    return (
      <div>
        <button type="button" className="link-quiet t-mono mb-4 min-h-[36px]" onClick={() => onSelect(null)}>
          ← All projects
        </button>
        <h3 className="t-head mb-4 text-2xl">{current.name || "New project"}</h3>
        <ProjectEditor
          key={selected}
          project={current}
          index={selected}
          isPublished={publishedSlugs.has(current.slug)}
          onChange={(project) => set("projects", projects.map((item, index) => (index === selected ? project : item)))}
        />
      </div>
    );
  }

  return (
    <div>
      <p className="t-mono text-graphite">
        This order is the order on your site, and your main projects get the large home page layouts. New projects appear
        in “Also in the drawer” at the end of the Work section.
      </p>
      <ol className="mt-4 border-t border-ink">
        {projects.map((project, index) => (
          <li key={`${project.slug}-${index}`} className="hairline flex items-center gap-1 border-b">
            <button
              type="button"
              onClick={() => onSelect(index)}
              className="group min-h-[56px] min-w-0 flex-1 py-2 pr-2 text-left"
            >
              <span className="t-head block truncate text-lg group-hover:text-pen">{project.name || "New project"}</span>
              <span className="t-mono block truncate text-graphite">{project.role || project.context || "No details yet"}</span>
            </button>
            <button type="button" className="admin-icon-btn" aria-label={`Move ${project.name} up`} disabled={index === 0} onClick={() => move(index, index - 1)}>
              ↑
            </button>
            <button type="button" className="admin-icon-btn" aria-label={`Move ${project.name} down`} disabled={index === projects.length - 1} onClick={() => move(index, index + 1)}>
              ↓
            </button>
            <button type="button" className="admin-icon-btn" aria-label={`Remove ${project.name}`} onClick={() => remove(index)}>
              Remove
            </button>
          </li>
        ))}
      </ol>
      <button type="button" className="btn mt-4" onClick={add}>
        + Add a project
      </button>
    </div>
  );
}

export function ExperienceSection({ draft, set }: SectionProps) {
  const { record, projects } = draft;
  const update = (changes: Partial<PortfolioData["record"]>) => set("record", { ...record, ...changes });
  const projectOptions = [
    { value: "", label: "None" },
    ...projects.map((project) => ({ value: project.slug, label: project.name || project.slug })),
  ];
  type RoleItem = PortfolioData["record"]["roles"][number];

  return (
    <div className="space-y-6">
      <Group title="Jobs, newest first">
        <Repeater
          label="Jobs"
          items={record.roles}
          onChange={(roles) => update({ roles })}
          makeNew={(): RoleItem => ({ company: "", role: "", place: "", start: "", end: null, points: [] })}
          addLabel="Add a job"
          itemName="job"
          confirmRemove
          itemTitle={(role) => [role.role, role.company].filter(Boolean).join(", ")}
          renderItem={(role, change, index) => {
            const at = `record.roles.${index}`;
            return (
              <>
                <Row>
                  <TextField label="Job title" path={`${at}.role`} value={role.role} onChange={(title) => change({ ...role, role: title })} />
                  <TextField label="Company" path={`${at}.company`} value={role.company} onChange={(company) => change({ ...role, company })} />
                  <TextField label="Location" value={role.place} onChange={(place) => change({ ...role, place })} />
                  <TextField
                    label="Company website"
                    hint="Optional."
                    placeholder="https://"
                    path={`${at}.companyUrl`}
                    value={role.companyUrl ?? ""}
                    onChange={(companyUrl) => change({ ...role, companyUrl: companyUrl || undefined })}
                  />
                  <TextField label="Started" type="month" path={`${at}.start`} value={role.start} onChange={(start) => change({ ...role, start })} />
                  <div>
                    {role.end !== null && (
                      <TextField label="Ended" type="month" path={`${at}.end`} value={role.end} onChange={(end) => change({ ...role, end })} />
                    )}
                    <CheckField
                      label="I still work here"
                      checked={role.end === null}
                      onChange={(current) => change({ ...role, end: current ? null : "" })}
                    />
                  </div>
                </Row>
                <StringList label="What you did" items={role.points} onChange={(points) => change({ ...role, points })} addLabel="Add a point" itemName="point" />
                <SelectField
                  label="“See the work” link goes to"
                  value={role.projectSlug ?? ""}
                  options={projectOptions}
                  onChange={(projectSlug) => change({ ...role, projectSlug: projectSlug || undefined })}
                />
                <Repeater
                  label="More project links from this job"
                  items={role.moreProjects ?? []}
                  onChange={(moreProjects) => change({ ...role, moreProjects: moreProjects.length ? moreProjects : undefined })}
                  makeNew={() => ({ label: "", slug: projects[0]?.slug ?? "" })}
                  addLabel="Add a project link"
                  itemName="project link"
                  renderItem={(link, changeLink) => (
                    <SelectField
                      label="Project"
                      value={link.slug}
                      options={projectOptions.filter((option) => option.value)}
                      onChange={(slug) =>
                        changeLink({ slug, label: projects.find((project) => project.slug === slug)?.name ?? slug })
                      }
                    />
                  )}
                />
              </>
            );
          }}
        />
      </Group>
      <Group title="Education">
        <Row>
          <TextField label="Degree" value={record.education.degree} onChange={(degree) => update({ education: { ...record.education, degree } })} />
          <TextField label="School" value={record.education.school} onChange={(school) => update({ education: { ...record.education, school } })} />
          <TextField label="Location" value={record.education.place} onChange={(place) => update({ education: { ...record.education, place } })} />
          <TextField label="Dates" placeholder="Dec 2022 – Aug 2026" value={record.education.period} onChange={(period) => update({ education: { ...record.education, period } })} />
        </Row>
      </Group>
    </div>
  );
}

const TIERS: { value: SkillTier; label: string }[] = [
  { value: "daily", label: "Daily: what I reach for first" },
  { value: "regular", label: "Regular: shipped real work with it" },
  { value: "familiar", label: "Familiar: used it, still learning" },
];

export function SkillsSection({ draft, set }: SectionProps) {
  return (
    <Group>
      <Repeater
        label="Skill groups"
        hint="The first group gets the most room on the page."
        items={draft.toolkit}
        onChange={(toolkit) => set("toolkit", toolkit)}
        makeNew={() => ({ group: "", items: [] })}
        addLabel="Add a group"
        itemName="group"
        confirmRemove
        itemTitle={(group) => group.group}
        renderItem={(group, change, index) => (
          <>
            <TextField label="Group name" path={`toolkit.${index}.group`} value={group.group} onChange={(name) => change({ ...group, group: name })} />
            <Repeater
              label="Skills"
              items={group.items}
              onChange={(items) => change({ ...group, items })}
              makeNew={() => ({ name: "", tier: "regular" as SkillTier, where: "" })}
              addLabel="Add a skill"
              itemName="skill"
              renderItem={(item, changeItem, itemIndex) => (
                <div className="grid gap-3 sm:grid-cols-3">
                  <TextField label="Skill" path={`toolkit.${index}.items.${itemIndex}.name`} value={item.name} onChange={(name) => changeItem({ ...item, name })} />
                  <SelectField label="How often" value={item.tier} options={TIERS} onChange={(tier) => changeItem({ ...item, tier })} />
                  <TextField label="Where you used it" value={item.where} onChange={(where) => changeItem({ ...item, where })} />
                </div>
              )}
            />
          </>
        )}
      />
    </Group>
  );
}

export function ContactSection({ draft, set }: SectionProps) {
  const { contact } = draft;
  return (
    <Group>
      <TextField label="Heading" path="contact.heading" value={contact.heading} onChange={(heading) => set("contact", { ...contact, heading })} />
      <TextArea label="Text" path="contact.body" rows={4} value={contact.body} onChange={(body) => set("contact", { ...contact, body })} />
      <p className="t-mono text-graphite">Your email and social links are edited under Profile.</p>
    </Group>
  );
}

export function AdvancedSection({ draft, replace }: { draft: PortfolioData; replace: (data: PortfolioData) => void }) {
  const [json, setJson] = useState(() => JSON.stringify(draft, null, 2));
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null);

  useEffect(() => {
    setJson(JSON.stringify(draft, null, 2));
  }, [draft]);

  const apply = () => {
    let raw: unknown;
    try {
      raw = JSON.parse(json);
    } catch (failure) {
      setMessage({ error: true, text: failure instanceof Error ? `Not valid JSON: ${failure.message}` : "Not valid JSON." });
      return;
    }
    const parsed = portfolioSchema.safeParse(raw);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      setMessage({ error: true, text: `${issue.path.join(".") || "content"}: ${issue.message}` });
      return;
    }
    replace(parsed.data);
    setMessage({ error: false, text: "Applied to the form. Publish when you’re ready." });
  };

  const backup = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Group title="Backup">
        <p className="max-w-[60ch] text-[1.0625rem] leading-snug">Download everything as one file before a big change.</p>
        <button type="button" className="btn btn-ghost" onClick={backup}>
          Download a backup
        </button>
      </Group>
      <Group title="Start over">
        <p className="max-w-[60ch] text-[1.0625rem] leading-snug">
          Publishing here stores a copy of your content, and that copy replaces <code className="t-mono">shared/content.ts</code>. To use
          what’s in the code again, load it below and publish.
        </p>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            if (window.confirm("Replace everything in this form with the content from the code? Nothing is published until you publish.")) {
              replace(defaultPortfolio);
              setMessage({ error: false, text: "Loaded the code’s content. Publish when you’re ready." });
            }
          }}
        >
          Load the code’s content
        </button>
      </Group>
      <Group title="Edit as JSON">
        <textarea
          aria-label="All content as JSON"
          spellCheck={false}
          value={json}
          onChange={(event) => setJson(event.target.value)}
          className="admin-input t-mono min-h-[50vh] !font-mono"
        />
        <button type="button" className="btn btn-ghost" onClick={apply}>
          Apply to the form
        </button>
      </Group>
      <div aria-live="polite">
        {message && <p className={`t-mono ${message.error ? "font-medium text-pen" : ""}`}>{message.text}</p>}
      </div>
    </div>
  );
}
