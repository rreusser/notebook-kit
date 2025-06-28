import type {Expression, Identifier, Node, Pattern, VariableDeclaration} from "acorn";
import {defaultGlobals} from "./globals.js";
import {syntaxError} from "./syntaxError.js";
import {simple} from "./walk.js";

type Assignable = Expression | Pattern | VariableDeclaration;

export function checkAssignments(node: Node, references: Identifier[], input: string): void {
  function checkConst(node: Assignable) {
    switch (node.type) {
      case "Identifier":
        if (references.includes(node))
          throw syntaxError(`Assignment to external variable '${node.name}'`, node, input);
        if (defaultGlobals.has(node.name))
          throw syntaxError(`Assignment to global '${node.name}'`, node, input);
        break;
      case "ObjectPattern":
        node.properties.forEach((node) => checkConst(node.type === "Property" ? node.value : node));
        break;
      case "ArrayPattern":
        node.elements.forEach((node) => node && checkConst(node));
        break;
      case "RestElement":
        checkConst(node.argument);
        break;
    }
  }
  function checkConstLeft({left}: {left: Assignable}) {
    checkConst(left);
  }
  function checkConstArgument({argument}: {argument: Assignable}) {
    checkConst(argument);
  }
  simple(node, {
    AssignmentExpression: checkConstLeft,
    AssignmentPattern: checkConstLeft,
    UpdateExpression: checkConstArgument,
    ForOfStatement: checkConstLeft,
    ForInStatement: checkConstLeft
  });
}
