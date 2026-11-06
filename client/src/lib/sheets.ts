/** The site's table of contents. Each home page section is a numbered sheet. */
export const SHEETS = [
  { id: "intro", no: "01", label: "Intro" },
  { id: "work", no: "02", label: "Work" },
  { id: "practice", no: "03", label: "Practice" },
  { id: "record", no: "04", label: "Record" },
  { id: "toolkit", no: "05", label: "Toolkit" },
  { id: "contact", no: "06", label: "Contact" },
] as const;

export type SheetId = (typeof SHEETS)[number]["id"];

export const sheetNo = (id: SheetId) => SHEETS.find((sheet) => sheet.id === id)!.no;
