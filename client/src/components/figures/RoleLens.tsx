import { useState } from "react";

const ROLES = ["Learner", "Teacher", "School admin"] as const;
type LensRole = (typeof ROLES)[number];

const SCOPE: Record<LensRole, string> = {
  Learner: "self",
  Teacher: "class",
  "School admin": "school",
};

const MODULES: { name: string; size: string; bars: number; roles: LensRole[] }[] = [
  { name: "Courses", size: "col-span-6 sm:col-span-4", bars: 3, roles: ["Learner", "Teacher"] },
  { name: "Progress", size: "col-span-6 sm:col-span-4", bars: 2, roles: ["Learner", "Teacher", "School admin"] },
  { name: "Assessments", size: "col-span-6 sm:col-span-4", bars: 2, roles: ["Learner", "Teacher"] },
  { name: "Class roster", size: "col-span-6 sm:col-span-5", bars: 4, roles: ["Teacher", "School admin"] },
  { name: "School reports", size: "col-span-6 sm:col-span-3", bars: 3, roles: ["School admin"] },
  { name: "Manage users", size: "col-span-6 sm:col-span-4", bars: 2, roles: ["School admin"] },
];

export function RoleLens() {
  const [role, setRole] = useState<LensRole>("Teacher");

  return (
    <figure aria-label="Wireframe showing how one dashboard changes by role">
      <div className="border border-ink bg-vellum">
        <div className="hairline flex flex-wrap items-center justify-between gap-2 border-b p-2">
          <div className="flex flex-wrap gap-1" role="group" aria-label="View the dashboard as">
            {ROLES.map((item) => (
              <button
                key={item}
                type="button"
                className="chip"
                aria-pressed={item === role}
                onClick={() => setRole(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <p className="t-mono px-1 text-graphite">
            scope: <span className="text-pen">{SCOPE[role]}</span>
          </p>
        </div>
        <ul className="grid grid-cols-12 gap-2 p-2">
          {MODULES.map((module) => {
            const visible = module.roles.includes(role);
            return (
              <li
                key={module.name}
                className={`${module.size} min-h-[104px] border p-3 transition-all duration-300 ${
                  visible ? "border-ink/40 bg-paper" : "border-dashed border-ink/20"
                }`}
              >
                <p className={`t-mono ${visible ? "" : "text-graphite opacity-60"}`}>
                  {module.name}
                  {!visible && <span className="sr-only"> (not shown for this role)</span>}
                </p>
                {visible ? (
                  <div className="mt-3 space-y-1.5" aria-hidden="true">
                    {Array.from({ length: module.bars }, (_, bar) => (
                      <div
                        key={bar}
                        className="h-1.5 bg-ink/25 transition-all duration-500"
                        style={{ width: `${88 - bar * 19}%` }}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="t-label mt-3 opacity-60" aria-hidden="true">
                    Not rendered
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <figcaption className="t-mono mt-3 text-graphite">
        Fig. C. The pattern, as a wireframe: same modules, different audience. Roles and modules here are illustrative;
        this isn’t the SuccessTab interface.
      </figcaption>
    </figure>
  );
}
