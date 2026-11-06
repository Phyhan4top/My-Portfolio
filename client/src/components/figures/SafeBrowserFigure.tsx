import { useState, type FormEvent } from "react";

const DEMO_PIN = "4321";

const SITES = [
  { host: "lessons.example", blocked: false },
  { host: "library.example", blocked: false },
  { host: "betting.example", blocked: true },
  { host: "adultsite.example", blocked: true },
];

type Screen =
  | { kind: "start" }
  | { kind: "page"; host: string }
  | { kind: "blocked"; host: string }
  | { kind: "search" }
  | { kind: "pin"; host: string }
  | { kind: "downloaded"; host: string };

type ReportLine = { id: number; text: string; result: string; stopped: boolean };

export function SafeBrowserFigure() {
  const [screen, setScreen] = useState<Screen>({ kind: "start" });
  const [report, setReport] = useState<ReportLine[]>([]);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);

  const log = (text: string, result: string, stopped = false) => {
    setReport((lines) => [{ id: Date.now() + Math.random(), text, result, stopped }, ...lines].slice(0, 6));
  };

  const open = (host: string, blocked: boolean) => {
    setScreen(blocked ? { kind: "blocked", host } : { kind: "page", host });
    log(host, blocked ? "Blocked" : "Opened", blocked);
  };

  const search = () => {
    setScreen({ kind: "search" });
    log("Web search", "Safe search on");
  };

  const askForPin = (host: string) => {
    setPin("");
    setPinError(false);
    setScreen({ kind: "pin", host });
  };

  const submitPin = (event: FormEvent, host: string) => {
    event.preventDefault();
    if (pin === DEMO_PIN) {
      setScreen({ kind: "downloaded", host });
      log(`Download from ${host}`, "PIN accepted");
    } else {
      setPinError(true);
      log(`Download from ${host}`, "Wrong PIN", true);
    }
  };

  const address = screen.kind === "start" ? "Choose a site" : screen.kind === "search" ? "Search" : screen.host;

  return (
    <figure aria-label="Interactive illustration of a controlled student browser">
      <div className="grid border border-ink bg-vellum sm:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        {/* The student's tablet */}
        <div className="hairline border-b p-4 sm:border-b-0 sm:border-r">
          <p className="t-label">Student’s tablet</p>
          <div className="mt-3 rounded-[18px] border-2 border-ink bg-paper p-2">
            <p className="t-mono truncate border border-[var(--rule)] bg-vellum px-2 py-1">{address}</p>
            <div className="flex min-h-[176px] flex-col justify-center p-3" aria-live="polite">
              {screen.kind === "start" && <p className="t-mono text-center text-graphite">Open a site or search.</p>}

              {screen.kind === "page" && (
                <div>
                  <p className="t-head text-lg">Page loaded</p>
                  <div className="mt-2 space-y-1.5" aria-hidden="true">
                    {[92, 76, 54].map((width) => (
                      <div key={width} className="h-1.5 bg-ink/25" style={{ width: `${width}%` }} />
                    ))}
                  </div>
                  <button type="button" className="chip mt-4" onClick={() => askForPin(screen.host)}>
                    Download a file
                  </button>
                </div>
              )}

              {screen.kind === "blocked" && (
                <div className="text-center">
                  <p className="t-head text-lg text-pen">This site is blocked</p>
                  <p className="t-mono mt-2 text-graphite">{screen.host} is on the blocklist.</p>
                </div>
              )}

              {screen.kind === "search" && (
                <div>
                  <p className="t-head text-lg">Search results</p>
                  <p className="t-mono mt-2 text-pen">Safe search is on. The student can’t turn it off.</p>
                </div>
              )}

              {screen.kind === "pin" && (
                <form onSubmit={(event) => submitPin(event, screen.host)}>
                  <label className="t-head block text-lg" htmlFor="safe-browser-pin">
                    Ask your parent for the PIN
                  </label>
                  <div className="mt-2 flex gap-1">
                    <input
                      id="safe-browser-pin"
                      type="password"
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={4}
                      value={pin}
                      onChange={(event) => setPin(event.target.value)}
                      aria-invalid={pinError}
                      className="t-mono h-9 w-24 border border-ink bg-vellum px-2"
                    />
                    <button type="submit" className="chip">
                      Download
                    </button>
                  </div>
                  <p className="t-mono mt-2 text-graphite">
                    {pinError ? <span className="text-pen">Wrong PIN. Nothing downloaded.</span> : `Demo PIN: ${DEMO_PIN}`}
                  </p>
                </form>
              )}

              {screen.kind === "downloaded" && (
                <p className="t-head text-center text-lg">Download approved</p>
              )}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-1">
            {SITES.map((site) => (
              <button
                key={site.host}
                type="button"
                className="chip truncate"
                onClick={() => open(site.host, site.blocked)}
              >
                {site.host}
              </button>
            ))}
            <button type="button" className="chip col-span-2" onClick={search}>
              Search the web
            </button>
          </div>
        </div>

        {/* What the parent receives */}
        <div className="min-w-0 p-4">
          <p className="t-label">Sent to the parent’s email</p>
          {report.length === 0 ? (
            <p className="t-mono mt-3 text-graphite">Use the browser. Activity appears here.</p>
          ) : (
            <ul className="mt-2">
              {report.map((line) => (
                <li key={line.id} className="hairline border-b py-1.5">
                  <p className="t-mono break-words">{line.text}</p>
                  <p className={`t-label mt-0.5 ${line.stopped ? "!text-pen" : ""}`}>{line.result}</p>
                </li>
              ))}
            </ul>
          )}
          <p className="t-mono mt-4 text-graphite">No app or dashboard for the parent to learn.</p>
        </div>
      </div>
      <figcaption className="t-mono mt-3 text-graphite">
        Fig. D. Try it: open a blocked site, search, then download from an allowed page. An illustration written for
        this page, with placeholder sites and a demo PIN. This is not the product’s interface.
      </figcaption>
    </figure>
  );
}
