import { SHEETS, type SheetId } from "@/lib/sheets";

type SheetHeaderProps = {
  sheet: SheetId;
  title: string;
  note: string;
};

/** The ruled heading that opens every sheet of the set. */
export function SheetHeader({ sheet, title, note }: SheetHeaderProps) {
  const entry = SHEETS.find((item) => item.id === sheet)!;

  return (
    <header>
      <div className="ruler" aria-hidden="true" />
      <div className="gutter grid-12 items-end pb-10 pt-5 md:pb-16">
        <p className="t-label col-span-6 md:col-span-2" aria-hidden="true">
          Sheet {entry.no} / {String(SHEETS.length).padStart(2, "0")}
        </p>
        <p className="t-label col-span-6 text-right md:order-3 md:col-span-3">{note}</p>
        <h2 className="t-condensed col-span-12 mt-6 text-[clamp(3.25rem,8.5vw,8rem)] md:col-span-7 md:mt-0">
          {title}
        </h2>
      </div>
    </header>
  );
}
