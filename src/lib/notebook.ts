export type NotebookTheme =
  | "air"
  | "coffee"
  | "cotton"
  | "deep-space"
  | "glacier"
  | "ink"
  | "midnight"
  | "near-midnight"
  | "ocean-floor"
  | "parchment"
  | "slate"
  | "stark"
  | "sun-faded";

export interface NotebookSpec {
  /** the notebook’s cells, in top-to-bottom document order */
  cells?: CellSpec[];
  /** the notebook title, if any; extracted from the first h1 */
  title?: string;
  /** the notebook theme; defaults to "air" */
  theme?: NotebookTheme;
  /** if true, don’t allow editing */
  readOnly?: boolean;
}

export interface Notebook extends NotebookSpec {
  cells: Cell[];
  title: NonNullable<NotebookSpec["title"]>;
  theme: NonNullable<NotebookSpec["theme"]>;
  readOnly: NonNullable<NotebookSpec["readOnly"]>;
}

export interface CellSpec {
  /** the unique identifier for this cell */
  id: number;
  /** the committed cell value; defaults to empty */
  value?: string;
  /** the mode; affects how the value is evaluated; defaults to js */
  mode?: "js" | "ojs" | "md" | "html" | "tex" | "dot" | "sql";
  /** if true, the editor will stay open when not focused; defaults to false */
  pinned?: boolean;
}

export interface Cell extends CellSpec {
  value: NonNullable<CellSpec["value"]>;
  mode: NonNullable<CellSpec["mode"]>;
  pinned: NonNullable<CellSpec["pinned"]>;
}

export function toNotebook({
  cells = [],
  title = "Untitled",
  theme = "air",
  readOnly = false
}: NotebookSpec): Notebook {
  return {
    cells: cells.map(toCell),
    title,
    theme,
    readOnly
  };
}

export function toCell({
  id,
  value = "",
  mode = "js",
  pinned = defaultPinned(mode)
}: CellSpec): Cell {
  return {
    id,
    value,
    mode,
    pinned
  };
}

export function defaultPinned(mode: Cell["mode"]): boolean {
  return mode === "js" || mode === "ojs";
}
