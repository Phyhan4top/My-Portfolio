import { useState, type FormEvent } from "react";
import { api } from "@shared/routes";
import { insertMessageSchema, type PortfolioData } from "@shared/schema";
import { SHEETS } from "@/lib/sheets";

type ContactProps = {
  identity: PortfolioData["identity"];
  data: PortfolioData["contact"];
};

type FieldName = "name" | "email" | "message";
type Status = "idle" | "sending" | "sent" | "failed";

function useContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [failure, setFailure] = useState("");

  const submit = async (form: HTMLFormElement) => {
    const parsed = insertMessageSchema.safeParse(Object.fromEntries(new FormData(form)));

    if (!parsed.success) {
      const next: Partial<Record<FieldName, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as FieldName;
        next[field] ??= issue.message;
      }
      setErrors(next);
      form.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`)?.focus();
      return;
    }

    setErrors({});
    setFailure("");
    setStatus("sending");

    // A sleeping server on a free tier can be slow to answer, so wait a good while.
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 45000);

    try {
      const res = await fetch(api.contact.submit.path, {
        method: api.contact.submit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
        signal: controller.signal,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(res.status < 500 && body?.message ? body.message : "");
      }
      form.reset();
      setStatus("sent");
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "");
      setStatus("failed");
    } finally {
      window.clearTimeout(timeout);
    }
  };

  return { status, errors, failure, submit, setStatus };
}

export function Contact({ identity, data }: ContactProps) {
  const { status, errors, failure, submit, setStatus } = useContactForm();
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(identity.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${identity.email}`;
    }
  };

  const fields: { name: FieldName; label: string; type?: string; autoComplete?: string; placeholder: string }[] = [
    { name: "name", label: "From", autoComplete: "name", placeholder: "Your name" },
    { name: "email", label: "Reply to", type: "email", autoComplete: "email", placeholder: "you@company.com" },
  ];

  return (
    <section id="contact" aria-label="Contact" className="theme-dark pb-24 md:pb-0">
      <div className="ruler" aria-hidden="true" />
      <div className="gutter pt-5">
        <p className="t-label" aria-hidden="true">
          Sheet {SHEETS[SHEETS.length - 1].no} / {String(SHEETS.length).padStart(2, "0")}
        </p>
        <h2 className="t-condensed mt-10 text-[clamp(4.5rem,18.5vw,19rem)] md:mt-16">{data.heading}</h2>
      </div>

      <div className="gutter grid-12 mt-12 gap-y-14 pb-16 md:mt-20 md:pb-24">
        <div className="col-span-12 md:col-span-5">
          <p className="t-lede max-w-[26em]">{data.body}</p>

          <p className="t-label mt-10">Direct</p>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <a
              href={`mailto:${identity.email}`}
              className="t-head break-all text-[clamp(1.5rem,2.4vw,2.25rem)] underline decoration-1 underline-offset-[0.18em] transition-colors hover:text-pen"
            >
              {identity.email}
            </a>
            <button type="button" onClick={copyEmail} className="t-mono min-h-[36px] underline underline-offset-2 hover:text-pen">
              <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
            </button>
          </p>

          <ul className="mt-8 border-t border-[var(--rule)]">
            {identity.socials.map((social) => (
              <li key={social.href} className="hairline border-b">
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex min-h-[48px] items-center justify-between gap-4 transition-colors hover:text-pen"
                >
                  <span className="t-head text-xl">{social.label}</span>
                  <span className="t-mono text-graphite group-hover:text-pen">
                    {social.href.replace(/^https:\/\/(www\.)?/, "")} <span aria-hidden="true">↗</span>
                  </span>
                </a>
              </li>
            ))}
            <li className="hairline border-b">
              <a
                href={identity.cvUrl}
                target="_blank"
                rel="noreferrer"
                className="group flex min-h-[48px] items-center justify-between gap-4 transition-colors hover:text-pen"
              >
                <span className="t-head text-xl">CV</span>
                <span className="t-mono text-graphite group-hover:text-pen">
                  PDF <span aria-hidden="true">↗</span>
                </span>
              </a>
            </li>
          </ul>
        </div>

        {/* The form is a memo: a header, then the body. */}
        <div className="col-span-12 md:col-span-6 md:col-start-7">
          {status === "sent" ? (
            <div className="border-t border-ink pt-6" role="status">
              <p className="t-statement">Thank you. It’s on my desk, and I’ll reply by email.</p>
              <button type="button" onClick={() => setStatus("idle")} className="link-arrow mt-6">
                Send another
              </button>
            </div>
          ) : (
            <form
              noValidate
              aria-label="Send Phyhan a message"
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                void submit(event.currentTarget);
              }}
            >
              <p className="t-label flex justify-between border-b border-ink pb-2">
                <span>Memo</span>
                <span>To: {identity.shortName}</span>
              </p>

              {fields.map((field) => (
                <div key={field.name}>
                  <div className="field" data-invalid={Boolean(errors[field.name])}>
                    <label className="t-label" htmlFor={`contact-${field.name}`}>
                      {field.label}
                    </label>
                    <input
                      id={`contact-${field.name}`}
                      name={field.name}
                      type={field.type ?? "text"}
                      autoComplete={field.autoComplete}
                      placeholder={field.placeholder}
                      aria-invalid={Boolean(errors[field.name])}
                      aria-describedby={errors[field.name] ? `error-${field.name}` : undefined}
                    />
                  </div>
                  {errors[field.name] && (
                    <p id={`error-${field.name}`} className="t-mono mt-1 text-pen">
                      {errors[field.name]}
                    </p>
                  )}
                </div>
              ))}

              <div className="field" data-invalid={Boolean(errors.message)}>
                <label className="t-label" htmlFor="contact-message">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  placeholder="What are you building, and what’s the hard part?"
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "error-message" : undefined}
                />
              </div>
              {errors.message && (
                <p id="error-message" className="t-mono mt-1 text-pen">
                  {errors.message}
                </p>
              )}

              {/* Honeypot: hidden from people and assistive technology. */}
              <div className="absolute -left-[9999px]" aria-hidden="true">
                <label>
                  Website
                  <input name="website" type="text" tabIndex={-1} autoComplete="off" />
                </label>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button type="submit" className="btn" disabled={status === "sending"}>
                  {status === "sending" ? "Sending…" : "Send memo"}
                </button>
              </div>

              <div aria-live="polite">
                {status === "failed" && (
                  <p className="mt-4 max-w-[34em] text-[1.0625rem]">
                    {failure || "That didn’t go through, and it’s my side, not yours."} You can email me directly at{" "}
                    <a href={`mailto:${identity.email}`} className="underline underline-offset-2">
                      {identity.email}
                    </a>
                    .
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Colophon */}
      <footer className="gutter hairline grid-12 gap-y-2 border-t py-5">
        <p className="t-mono col-span-12 text-graphite md:col-span-4">
          © {new Date().getFullYear()} {identity.fullName}
        </p>
        <p className="t-mono col-span-12 text-graphite md:col-span-6">
          Set in Archivo, Newsreader and IBM Plex Mono. Built with React, TypeScript, Tailwind and Express.
        </p>
        <p className="t-mono col-span-12 md:col-span-2 md:text-right">
          <a href="https://github.com/Phyhan4top/My-Portfolio" target="_blank" rel="noreferrer" className="link-quiet">
            Source ↗
          </a>
        </p>
      </footer>
    </section>
  );
}
