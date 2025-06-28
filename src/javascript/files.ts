import type {Node} from "acorn";
import {findReferences} from "./references.js";
import {Sourcemap} from "./sourcemap.js";
import {simple} from "./walk.js";

export function rewriteFileExpressions(output: Sourcemap, body: Node): void {
  const files = new Set(findReferences(body, {filterReference: ({name}) => name === "FileAttachment"}));
  simple(body, {
    CallExpression(node) {
      const {callee} = node;
      if (callee.type !== "Identifier" || !files.has(callee)) return;
      const args = node.arguments;
      if (args.length === 0) return;
      const [arg] = args;
      output.insertLeft(arg.start, "new URL(");
      output.insertRight(arg.end, ", import.meta.url).href");
    }
  });
}
