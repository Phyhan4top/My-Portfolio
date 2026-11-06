import { useState } from "react";

type Entry = { from: string; to: string; kobo: number; memo: string };

type Step = {
  label: string;
  order: string;
  farmA: string;
  farmB: string;
  note: string;
  entries: Entry[];
};

const ESCROW = "escrow:order";

/** Example values only. They balance, because the real ledger has to. */
const STEPS: Step[] = [
  {
    label: "Checkout",
    order: "PENDING_PAYMENT",
    farmA: "PENDING",
    farmB: "PENDING",
    note: "One cart, two farms. The server re-checks every line, freezes prices and reserves stock. Prices from the client are never trusted, and the idempotency key means a double-tap creates one order.",
    entries: [],
  },
  {
    label: "Payment confirmed",
    order: "CONFIRMED",
    farmA: "PENDING",
    farmB: "PENDING",
    note: "A redirect doesn’t count as proof. Money moves only after a signed webhook and a server-side check of the amount, currency and reference. It is then held for this order.",
    entries: [{ from: "gateway:paystack", to: ESCROW, kobo: 4500000, memo: "Order total" }],
  },
  {
    label: "Farm B rejects",
    order: "IN_FULFILMENT",
    farmA: "ACCEPTED",
    farmB: "REJECTED",
    note: "Each farm answers for its own part. One rejection doesn’t cancel the order: Farm A carries on, and Farm B’s share goes back to the buyer’s wallet automatically.",
    entries: [{ from: ESCROW, to: "wallet:buyer", kobo: 1400000, memo: "Refund, Farm B part" }],
  },
  {
    label: "Carrier matched",
    order: "IN_FULFILMENT",
    farmA: "IN_TRANSIT",
    farmB: "REJECTED",
    note: "Hard filters first: approved, covers both states, can carry the weight, returned a quote. Then a weighted score on price, speed and reliability. Each farm part gets its own shipment.",
    entries: [],
  },
  {
    label: "Delivered",
    order: "DELIVERED",
    farmA: "DELIVERED",
    farmB: "REJECTED",
    note: "Delivery is confirmed by the buyer, or automatically after a configured number of days. The money stays in escrow until then.",
    entries: [],
  },
  {
    label: "Settled",
    order: "COMPLETED",
    farmA: "DELIVERED",
    farmB: "REJECTED",
    note: "Escrow settles into its parts and reaches zero. The rows are immutable: a mistake is fixed by a new entry, so the history always explains the balance.",
    entries: [
      { from: ESCROW, to: "wallet:farm-a", kobo: 2470000, memo: "Farmer’s share" },
      { from: ESCROW, to: "revenue:commission", kobo: 130000, memo: "Commission" },
      { from: ESCROW, to: "revenue:service_fee", kobo: 280000, memo: "Service fee" },
      { from: ESCROW, to: "tax:vat_payable", kobo: 20000, memo: "VAT" },
      { from: ESCROW, to: "payable:delivery", kobo: 200000, memo: "Delivery" },
    ],
  },
];

const naira = (kobo: number) =>
  `₦${(kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function Status({ value, previous }: { value: string; previous?: string }) {
  const rejected = value === "REJECTED";
  return (
    <span
      key={value}
      className={`t-mono inline-block px-1.5 py-0.5 ${
        rejected ? "line-through opacity-60" : value !== previous ? "bg-pen text-paper" : "border border-[var(--rule)]"
      }`}
    >
      {value}
    </span>
  );
}

export function OrderTrace() {
  const [index, setIndex] = useState(0);
  const step = STEPS[index];
  const previous = STEPS[index - 1];
  const entries = STEPS.slice(0, index + 1).flatMap((item) => item.entries);
  const escrow = entries.reduce(
    (total, entry) => total + (entry.to === ESCROW ? entry.kobo : 0) - (entry.from === ESCROW ? entry.kobo : 0),
    0,
  );
  const isLast = index === STEPS.length - 1;

  return (
    <figure className="theme-dark" aria-label="Interactive trace of one order through PhyhanAgro">
      <div className="gutter py-8 md:py-12">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <p className="t-head text-2xl md:text-3xl">Follow one order</p>
          <p className="t-label">Fig. A. Step through it</p>
        </div>

        {/* Steps */}
        <ol className="mt-6 grid grid-cols-2 gap-px sm:grid-cols-3 lg:grid-cols-6">
          {STEPS.map((item, itemIndex) => (
            <li key={item.label}>
              <button
                type="button"
                aria-pressed={itemIndex === index}
                onClick={() => setIndex(itemIndex)}
                className={`chip flex h-full w-full items-baseline gap-2 text-left ${
                  itemIndex < index ? "text-pen" : ""
                }`}
              >
                <span className="opacity-60">{itemIndex + 1}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ol>

        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-6">
          {/* Order tree */}
          <div className="lg:col-span-5">
            <p className="t-label">Order PA-1042</p>
            <p className="mt-2">
              <Status value={step.order} previous={previous?.order} />
            </p>
            <ul className="mt-4 border-l border-[var(--rule)] pl-5">
              <li className="relative pb-5 before:absolute before:-left-5 before:top-3 before:h-px before:w-4 before:bg-[var(--rule)]">
                <p className="t-head text-xl">Farm A</p>
                <p className="t-mono mt-0.5 opacity-70">2 items · own fulfilment · own shipment</p>
                <p className="mt-2">
                  <Status value={step.farmA} previous={previous?.farmA} />
                </p>
              </li>
              <li className="relative before:absolute before:-left-5 before:top-3 before:h-px before:w-4 before:bg-[var(--rule)]">
                <p className="t-head text-xl">Farm B</p>
                <p className="t-mono mt-0.5 opacity-70">1 item · own fulfilment · own shipment</p>
                <p className="mt-2">
                  <Status value={step.farmB} previous={previous?.farmB} />
                </p>
              </li>
            </ul>
            <p className="t-body mt-6 min-h-[7.5em] text-[1.0625rem]" aria-live="polite">
              {step.note}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setIndex((value) => Math.max(0, value - 1))}
                disabled={index === 0}
              >
                Back
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setIndex((value) => (isLast ? 0 : value + 1))}
              >
                {isLast ? "Start again" : "Next step"}
              </button>
            </div>
          </div>

          {/* Ledger */}
          <div className="min-w-0 lg:col-span-6 lg:col-start-7">
            <div className="flex items-baseline justify-between gap-4 border-b border-ink pb-2">
              <p className="t-label">Ledger, double entry, append only</p>
              <p className="t-mono whitespace-nowrap">
                Escrow <span className="text-pen">{naira(escrow)}</span>
              </p>
            </div>
            {entries.length === 0 ? (
              <div className="mt-4">
                <p className="t-mono">No money has moved yet. These accounts are waiting:</p>
                <ul className="t-mono mt-3 grid gap-x-6 gap-y-1 opacity-70 sm:grid-cols-2">
                  {[
                    "gateway:paystack",
                    "escrow:order",
                    "wallet:buyer",
                    "wallet:farm-a",
                    "revenue:commission",
                    "revenue:service_fee",
                    "tax:vat_payable",
                    "payable:delivery",
                  ].map((account) => (
                    <li key={account}>{account}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <ul>
                {entries.map((entry) => (
                  <li
                    key={`${entry.to}-${entry.memo}`}
                    className="hairline grid grid-cols-[1fr_auto] gap-x-4 border-b py-2.5"
                  >
                    <p className="t-mono min-w-0 break-words">
                      <span className="opacity-70">{entry.from}</span>
                      <span aria-label=" to "> → </span>
                      {entry.to}
                    </p>
                    <p className="t-mono text-right">{naira(entry.kobo)}</p>
                    <p className="t-label col-span-2 mt-0.5">{entry.memo}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <figcaption className="t-mono mt-8 opacity-70">
          A simplified miniature drawn for this page, from the real account names and order states. The farms and
          amounts are examples, not real fees or listings.
        </figcaption>
      </div>
    </figure>
  );
}
