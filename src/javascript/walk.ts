import {walk} from "@observablehq/parser";
import type {Node} from "acorn";
import type {AncestorVisitors, RecursiveVisitors, SimpleVisitors} from "acorn-walk";
import {ancestor as _ancestor} from "acorn-walk";
import {recursive as _recursive} from "acorn-walk";
import {simple as _simple} from "acorn-walk";

export function ancestor<T>(node: Node, visitors: AncestorVisitors<T>): void {
  return _ancestor(node, visitors, walk as RecursiveVisitors<T>);
}

export function recursive<T>(node: Node, state: T, functions: RecursiveVisitors<T>): void {
  return _recursive(node, state, functions, walk as RecursiveVisitors<T>);
}

export function simple<T>(node: Node, visitors: SimpleVisitors<T>): void {
  return _simple(node, visitors, walk as RecursiveVisitors<T>);
}
