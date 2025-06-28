import {readFile} from "node:fs/promises";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {JSDOM} from "jsdom";
import type {PluginOption} from "vite";
import {deserialize} from "../lib/serialize.js";
import {Sourcemap} from "../javascript/sourcemap.js";
import {transpile} from "../javascript/transpile.js";
import {parseTemplate} from "../javascript/template.js";
import {highlight} from "../runtime/stdlib/highlight.js";
import {md} from "../runtime/stdlib/md.js";

export function observable({
  window = new JSDOM().window,
  parser = new window.DOMParser(),
  serializer = new window.XMLSerializer(),
  template = fileURLToPath(import.meta.resolve("../templates/default.html"))
} = {}): PluginOption {
  return {
    name: "observable",
    buildStart() {
      this.addWatchFile(template);
    },
    handleHotUpdate(context) {
      if (context.file === resolve(template)) {
        context.server.hot.send({type: "full-reload"});
      }
    },
    transformIndexHtml: {
      order: "pre",
      async handler(input) {
        const notebook = deserialize(input, {parser});
        const tsource = await readFile(template, "utf-8");
        const document = parser.parseFromString(tsource, "text/html");

        const version = (await import("../../package.json", {with: {type: "json"}})).default.version;
        let generator = document.querySelector("meta[name=generator]");
        generator ??= document.head.appendChild(document.createElement("meta"));
        generator.setAttribute("name", "generator");
        generator.setAttribute("content", `Observable Notebooks v${version}`);

        let title = document.querySelector("title");
        title ??= document.head.appendChild(document.createElement("title"));
        title.insertBefore(document.createTextNode(notebook.title), title.firstChild);

        let cells = document.querySelector("main");
        cells ??= document.body.appendChild(document.createElement("main"));
        for (const cell of notebook.cells) {
          const div = cells.appendChild(document.createElement("div"));
          div.id = `cell-${cell.id}`;
          div.className = "observablehq observablehq--cell";
          if (cell.mode === "md") {
            md.document = document;
            div.appendChild(md([stripExpressions(cell.value)]));
          } else if (cell.mode === "html") {
            div.innerHTML = stripExpressions(cell.value);
          }
          if (cell.pinned) {
            const pre = cells.appendChild(document.createElement("pre"));
            const code = pre.appendChild(document.createElement("code"));
            code.className = `language-${cell.mode}`;
            code.textContent = cell.value;
            await highlight(code);
          }
        }

        const output = serializer.serializeToString(document);
        const i = output.indexOf("</body>");
        if (!(i >= 0)) throw new Error("body not found");
        return (
          output.slice(0, i) +
          `<style type="text/css">
@import url("observable:styles/theme-${notebook.theme}.css");
</style><script type="module">
import {define} from "observable:runtime/define";
${notebook.cells
  .map((cell) => {
    const transpiled = transpile(cell.value, cell.mode, {resolveFiles: true});
    return `
define(
  {
    root: document.getElementById(\`cell-${cell.id}\`),
    expanded: [],
    variables: []
  },
  {
    id: ${cell.id},
    body: ${escapeScript(transpiled.body)},
    inputs: ${JSON.stringify(transpiled.inputs)},
    outputs: ${JSON.stringify(transpiled.outputs)},
    output: ${JSON.stringify(transpiled.output)},
    autodisplay: ${transpiled.autodisplay},
    autoview: ${transpiled.autoview},
    automutable: ${transpiled.automutable}
  }
);`;
  })
  .join("")}
</script>` +
          output.slice(i)
        );
      }
    }
  };
}

function stripExpressions(input: string): string {
  const source = new Sourcemap(input);
  const node = parseTemplate(input);
  let index = node.start;
  for (const q of node.quasis) {
    if (q.start > index) source.replaceLeft(index, q.start, "…");
    index = q.end;
  }
  return String(source);
}

/** Note: only suitable for use in a script element. */
function escapeScript(script: string): string {
  return script.replace(/<\/script>/g, "<\\/script>"); // TODO handle other contexts
}
