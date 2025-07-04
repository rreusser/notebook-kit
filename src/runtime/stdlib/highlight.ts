import type {Parser} from "@lezer/common";
import {highlightCode, tagHighlighter, tags} from "@lezer/highlight";

// A subset of classHighlighter with the classes we’ve styled.
// Please keep in sync with src/codemirror/highlight.ts
// https://github.com/lezer-parser/highlight/blob/95aa69ecd22bfc8b3e1c793610e0d5cda1174e61/src/highlight.ts#L702
export const highlighter = tagHighlighter([
  {tag: tags.link, class: "tok-link"},
  {tag: [tags.heading, tags.strong], class: "tok-strong"},
  {tag: tags.emphasis, class: "tok-emphasis"},
  {tag: [tags.keyword, tags.typeName], class: "tok-keyword"},
  {tag: tags.atom, class: "tok-atom"},
  {tag: [tags.bool, tags.escape, tags.number], class: "tok-literal"},
  {tag: [tags.string, tags.regexp], class: "tok-string"},
  {tag: tags.comment, class: "tok-comment"},
  {tag: tags.invalid, class: "tok-invalid"},
  {tag: tags.variableName, class: "tok-variable"},
  {tag: [tags.definition(tags.variableName), tags.className, tags.propertyName], class: "tok-definition"},
  {tag: tags.meta, class: "tok-meta"}
]);

export async function highlight(code: HTMLElement): Promise<void> {
  const parser = await getParser(code);
  if (!parser) return;

  const document = code.ownerDocument;
  const text = code.textContent!;
  const tree = parser.parse(text);
  while (code.lastChild) code.lastChild.remove();

  function emit(text: string, classes: string) {
    let node: ChildNode = document.createTextNode(text);
    if (classes) {
      const span = document.createElement("span");
      span.appendChild(node);
      span.className = classes;
      node = span;
    }
    code.appendChild(node);
  }

  function emitBreak() {
    code.appendChild(document.createTextNode("\n"));
  }

  highlightCode(text, tree, highlighter, emit, emitBreak);
}

async function getParser(code: HTMLElement): Promise<Parser | undefined> {
  const dialect = getLanguage(code);
  switch (dialect) {
    case "js":
    case "ts":
    case "jsx":
    case "javascript":
    case "typescript":
      return (await import("@lezer/javascript")).parser.configure({dialect});
    case "html":
      return (await import("@lezer/html")).parser;
    case "css":
      return (await import("@lezer/css")).parser;
    case "md":
    case "markdown":
      return (await import("@lezer/markdown")).parser;
  }
}

function getLanguage(code: HTMLElement): string | undefined {
  return [...code.classList]
    .find((c) => c.startsWith("language-"))
    ?.slice("language-".length)
    ?.toLowerCase();
}
