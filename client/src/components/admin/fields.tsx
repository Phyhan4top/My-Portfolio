import { createContext, useContext, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { MAX_UPLOAD_BYTES } from "@shared/routes";
import type { PortfolioData } from "@shared/schema";

export type ImageValue = PortfolioData["practice"]["portrait"];

/** Field errors, keyed by their path in the content, such as "projects.2.name". */
export const ErrorsContext = createContext<Record<string, string>>({});

/** Uploads a file and resolves to its URL. */
export const UploadContext = createContext<(file: File) => Promise<string>>(async () => {
  throw new Error("Uploads aren't available.");
});

type BaseProps = {
  label: string;
  hint?: string;
  path?: string;
};

function Shell({ label, hint, path, children }: BaseProps & { children: (ids: { id: string; describedBy?: string; invalid: boolean }) => ReactNode }) {
  const id = useId();
  const error = useContext(ErrorsContext)[path ?? ""];
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <label htmlFor={id} className="t-head block text-[0.95rem]">
        {label}
      </label>
      {hint && (
        <p id={hintId} className="t-mono mt-0.5 text-graphite">
          {hint}
        </p>
      )}
      <div className="mt-1.5">{children({ id, describedBy, invalid: Boolean(error) })}</div>
      {error && (
        <p id={errorId} className="t-mono mt-1 font-medium text-pen">
          {error}
        </p>
      )}
    </div>
  );
}

type TextProps = BaseProps & {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
};

export function TextField({ value, onChange, type = "text", placeholder, disabled, ...base }: TextProps) {
  return (
    <Shell {...base}>
      {({ id, describedBy, invalid }) => (
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          onChange={(event) => onChange(event.target.value)}
          className="admin-input"
        />
      )}
    </Shell>
  );
}

export function TextArea({ value, onChange, rows = 3, placeholder, ...base }: TextProps & { rows?: number }) {
  return (
    <Shell {...base}>
      {({ id, describedBy, invalid }) => (
        <textarea
          id={id}
          rows={rows}
          value={value}
          placeholder={placeholder}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          onChange={(event) => onChange(event.target.value)}
          className="admin-input resize-y"
        />
      )}
    </Shell>
  );
}

export function SelectField<T extends string>({
  value,
  onChange,
  options,
  ...base
}: BaseProps & { value: T; onChange: (value: T) => void; options: { value: T; label: string }[] }) {
  return (
    <Shell {...base}>
      {({ id, describedBy, invalid }) => (
        <select
          id={id}
          value={value}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          onChange={(event) => onChange(event.target.value as T)}
          className="admin-input"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </Shell>
  );
}

export function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-[0.95rem]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-pen"
      />
      {label}
    </label>
  );
}

/** Short values such as technologies: type one, press Enter, remove with ×. */
export function TagsField({ value, onChange, placeholder, ...base }: BaseProps & { value: string[]; onChange: (value: string[]) => void; placeholder?: string }) {
  const [text, setText] = useState("");

  const add = () => {
    const next = text.trim().replace(/,$/, "");
    if (next && !value.includes(next)) onChange([...value, next]);
    setText("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      add();
    } else if (event.key === "Backspace" && !text && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <Shell {...base}>
      {({ id, describedBy }) => (
        <div>
          {value.length > 0 && (
            <ul className="mb-1.5 flex flex-wrap gap-1">
              {value.map((tag) => (
                <li key={tag} className="t-mono flex items-center border border-[var(--rule)] bg-vellum pl-2">
                  {tag}
                  <button
                    type="button"
                    aria-label={`Remove ${tag}`}
                    onClick={() => onChange(value.filter((item) => item !== tag))}
                    className="admin-icon-btn !min-h-[30px] !min-w-[30px]"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
          <input
            id={id}
            value={text}
            placeholder={placeholder ?? "Type one, then press Enter"}
            aria-describedby={describedBy}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={onKeyDown}
            onBlur={add}
            className="admin-input"
          />
        </div>
      )}
    </Shell>
  );
}

type RepeaterProps<T> = {
  label: string;
  hint?: string;
  items: T[];
  onChange: (items: T[]) => void;
  makeNew: () => T;
  addLabel: string;
  /** With a title, each item folds away behind it. Without one, items stay open. */
  itemTitle?: (item: T, index: number) => string;
  itemName?: string;
  confirmRemove?: boolean;
  renderItem: (item: T, update: (next: T) => void, index: number) => ReactNode;
};

/** Any list in the content: add, remove and reorder, with the fields left to the caller. */
export function Repeater<T>({
  label,
  hint,
  items,
  onChange,
  makeNew,
  addLabel,
  itemTitle,
  itemName = "item",
  confirmRemove = false,
  renderItem,
}: RepeaterProps<T>) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const move = (from: number, to: number) => {
    const next = [...items];
    [next[from], next[to]] = [next[to], next[from]];
    onChange(next);
    if (openIndex === from) setOpenIndex(to);
    else if (openIndex === to) setOpenIndex(from);
  };

  const remove = (index: number) => {
    const title = itemTitle?.(items[index], index);
    if (confirmRemove && !window.confirm(`Remove ${title ? `“${title}”` : `this ${itemName}`}?`)) return;
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
    setOpenIndex(null);
  };

  return (
    <div>
      <p className="t-head text-[0.95rem]">{label}</p>
      {hint && <p className="t-mono mt-0.5 text-graphite">{hint}</p>}
      <ol className="mt-2 space-y-2">
        {items.map((item, index) => {
          const collapsible = Boolean(itemTitle);
          const open = !collapsible || openIndex === index;
          return (
            <li key={index} className="border border-[var(--rule)]">
              <div className="flex items-center gap-1 bg-ink/[0.03] pl-3 pr-1">
                {collapsible ? (
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenIndex(open ? null : index)}
                    className="t-head min-h-[40px] min-w-0 flex-1 truncate text-left text-[0.95rem] hover:text-pen"
                  >
                    <span aria-hidden="true" className="t-mono mr-2 text-graphite">
                      {open ? "▾" : "▸"}
                    </span>
                    {itemTitle!(item, index) || `New ${itemName}`}
                  </button>
                ) : (
                  <p className="t-label flex-1">
                    {itemName} {index + 1}
                  </p>
                )}
                <button
                  type="button"
                  className="admin-icon-btn"
                  aria-label={`Move ${itemName} ${index + 1} up`}
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="admin-icon-btn"
                  aria-label={`Move ${itemName} ${index + 1} down`}
                  disabled={index === items.length - 1}
                  onClick={() => move(index, index + 1)}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="admin-icon-btn"
                  aria-label={`Remove ${itemName} ${index + 1}`}
                  onClick={() => remove(index)}
                >
                  Remove
                </button>
              </div>
              {open && (
                <div className="space-y-4 p-3">
                  {renderItem(
                    item,
                    (next) => onChange(items.map((current, itemIndex) => (itemIndex === index ? next : current))),
                    index,
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <button
        type="button"
        className="btn btn-ghost mt-2 !min-h-[38px] !px-3 !py-1 !text-[0.9rem]"
        onClick={() => {
          onChange([...items, makeNew()]);
          setOpenIndex(items.length);
        }}
      >
        + {addLabel}
      </button>
    </div>
  );
}

/** A list of plain sentences. */
export function StringList({
  label,
  hint,
  items,
  onChange,
  addLabel,
  itemName = "line",
  rows = 2,
  path,
}: {
  label: string;
  hint?: string;
  items: string[];
  onChange: (items: string[]) => void;
  addLabel: string;
  itemName?: string;
  rows?: number;
  path?: string;
}) {
  return (
    <Repeater
      label={label}
      hint={hint}
      items={items}
      onChange={onChange}
      makeNew={() => ""}
      addLabel={addLabel}
      itemName={itemName}
      renderItem={(item, update, index) => (
        <TextArea
          label={`${itemName[0].toUpperCase()}${itemName.slice(1)} ${index + 1}`}
          value={item}
          onChange={update}
          rows={rows}
          path={path ? `${path}.${index}` : undefined}
        />
      )}
    />
  );
}

function imageSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file doesn’t look like an image."));
    };
    image.src = url;
  });
}

/** Picks a file, uploads it, and reports progress and failures next to the button. */
function UploadButton({ accept, label, onFile }: { accept: string; label: string; onFile: (file: File) => Promise<void> }) {
  const input = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "uploading">("idle");
  const [error, setError] = useState("");

  return (
    <div>
      <input
        ref={input}
        type="file"
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          if (file.size > MAX_UPLOAD_BYTES) {
            setError("That file is over 4 MB. Please use a smaller one.");
            return;
          }
          setError("");
          setState("uploading");
          try {
            await onFile(file);
          } catch (failure) {
            setError(failure instanceof Error ? failure.message : "Upload failed.");
          } finally {
            setState("idle");
          }
        }}
      />
      <button
        type="button"
        className="btn btn-ghost !min-h-[38px] !px-3 !py-1 !text-[0.9rem]"
        disabled={state === "uploading"}
        onClick={() => input.current?.click()}
      >
        {state === "uploading" ? "Uploading…" : label}
      </button>
      {error && (
        <p className="t-mono mt-1 font-medium text-pen" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function FileField({ value, onChange, label, hint, path, accept, buttonLabel }: BaseProps & { value: string; onChange: (url: string) => void; accept: string; buttonLabel: string }) {
  const upload = useContext(UploadContext);
  return (
    <div className="space-y-2">
      <TextField label={label} hint={hint} path={path} value={value} onChange={onChange} />
      <div className="flex flex-wrap items-center gap-3">
        <UploadButton accept={accept} label={buttonLabel} onFile={async (file) => onChange(await upload(file))} />
        {value && (
          <a href={value} target="_blank" rel="noreferrer" className="link-quiet t-mono">
            Open current file ↗
          </a>
        )}
      </div>
    </div>
  );
}

export function ImageEditor({ value, onChange, path, children }: { value: ImageValue; onChange: (value: ImageValue) => void; path: string; children?: ReactNode }) {
  const upload = useContext(UploadContext);
  const error = useContext(ErrorsContext)[`${path}.src`];

  return (
    <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
      <div>
        <div className="flex aspect-[4/3] items-center justify-center overflow-hidden border border-[var(--rule)] bg-vellum">
          {value.src ? (
            <img src={value.src} alt="" className="h-full w-full object-contain" />
          ) : (
            <span className="t-mono text-graphite">No image</span>
          )}
        </div>
        <div className="mt-2">
          <UploadButton
            accept="image/png,image/jpeg,image/webp,image/gif"
            label={value.src ? "Replace image" : "Upload image"}
            onFile={async (file) => {
              const size = await imageSize(file);
              const src = await upload(file);
              onChange({ ...value, src, ...size });
            }}
          />
        </div>
        {error && <p className="t-mono mt-1 font-medium text-pen">{error}</p>}
      </div>
      <div className="min-w-0 space-y-3">
        <TextField
          label="Description for screen readers"
          hint="What the image shows."
          path={`${path}.alt`}
          value={value.alt}
          onChange={(alt) => onChange({ ...value, alt })}
        />
        <TextField
          label="Caption"
          path={`${path}.caption`}
          value={value.caption}
          onChange={(caption) => onChange({ ...value, caption })}
        />
        {children}
      </div>
    </div>
  );
}
