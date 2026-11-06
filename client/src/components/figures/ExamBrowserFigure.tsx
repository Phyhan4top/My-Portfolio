import { useState } from "react";

const START_MESSAGE = "The exam is running. Try something.";

const BLOCKED_ACTIONS = [
  { label: "Press the back button", result: "The back button is disabled during the exam." },
  { label: "Take a screenshot", result: "Screenshots are disabled during the exam." },
  { label: "Record the screen", result: "Screen recording is disabled during the exam." },
];

type Session = "running" | "finished" | "ended-early";

export function ExamBrowserFigure() {
  const [session, setSession] = useState<Session>("running");
  const [answer, setAnswer] = useState<string | null>(null);
  const [message, setMessage] = useState(START_MESSAGE);

  const restart = () => {
    setSession("running");
    setAnswer(null);
    setMessage(START_MESSAGE);
  };

  const running = session === "running";

  return (
    <figure aria-label="Interactive illustration of a controlled examination session">
      <div className="grid border border-ink bg-vellum sm:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="hairline border-b p-4 sm:border-b-0 sm:border-r">
          <p className="t-label">Student’s tablet</p>
          <div className="mt-3 flex min-h-[250px] flex-col rounded-[18px] border-2 border-ink bg-paper p-4">
            {running ? (
              <>
                <p className="t-label">Question 1 of 1</p>
                <p className="t-head mt-2 text-lg">Which of these is a prime number?</p>
                <div className="mt-3 grid grid-cols-4 gap-1" role="group" aria-label="Answers">
                  {["9", "11", "15", "21"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      className="chip"
                      aria-pressed={answer === option}
                      onClick={() => setAnswer(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <button type="button" className="btn mt-auto w-full" onClick={() => setSession("finished")}>
                  Submit exam
                </button>
              </>
            ) : (
              <div className="flex flex-1 flex-col justify-center text-center">
                <p className={`t-head text-xl ${session === "ended-early" ? "text-pen" : ""}`}>
                  {session === "ended-early" ? "Exam ended" : "Exam submitted"}
                </p>
                <p className="t-mono mt-2 text-graphite">
                  {session === "ended-early"
                    ? "The student left the exam screen."
                    : "The student finished normally."}
                </p>
                <button type="button" className="btn btn-ghost mt-4 w-full" onClick={restart}>
                  Start again
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex min-w-0 flex-col p-4">
          <p className="t-label">What a student might try</p>
          <ul className="mt-2 grid gap-1">
            {BLOCKED_ACTIONS.map((action) => (
              <li key={action.label}>
                <button
                  type="button"
                  className="chip w-full text-left disabled:opacity-40"
                  disabled={!running}
                  onClick={() => setMessage(action.result)}
                >
                  {action.label}
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                className="chip w-full text-left disabled:opacity-40"
                disabled={!running}
                onClick={() => setSession("ended-early")}
              >
                Leave the exam screen
              </button>
            </li>
          </ul>
          <p className="t-head mt-5 border-t border-ink pt-3 text-xl" aria-live="polite">
            {running ? message : "The rules apply only while the exam runs."}
          </p>
        </div>
      </div>
      <figcaption className="t-mono mt-3 text-graphite">
        Fig. E. Try it: three actions are disabled, and leaving the screen ends the exam. An illustration written for
        this page. This is not the product’s interface.
      </figcaption>
    </figure>
  );
}
