import type {Node} from "acorn";
import {recursive} from "./walk.js";

export function findAwaits(node: Node): Node[] {
  const nodes: Node[] = [];

  recursive(node, null, {
    FunctionDeclaration() {},
    FunctionExpression() {},
    ArrowFunctionExpression() {},
    ForOfStatement(node, state, callback) {
      if (node.await) nodes.push(node);
      if (node.left) callback(node.left, state);
      if (node.right) callback(node.right, state);
      if (node.body) callback(node.body, state);
    },
    AwaitExpression(node) {
      nodes.push(node);
    }
  });

  return nodes;
}
