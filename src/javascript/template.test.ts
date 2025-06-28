import {expect, it} from "vitest";
import {parseTemplate, transpileTemplate} from "./template.js";

it("parses a simple template", () => {
  expect(parseTemplate(`Hello, world!`)).toMatchSnapshot();
});

it("parses an empty template", () => {
  expect(parseTemplate(``)).toMatchSnapshot();
});

it("parses a template with an interpolated expression", () => {
  expect(parseTemplate(`Hello, $\{"world"}!`)).toMatchSnapshot();
});

it("parses a template with backquotes", () => {
  expect(parseTemplate(`Hello, \`world\`!`)).toMatchSnapshot();
});

it("parses a template with backslashes", () => {
  expect(parseTemplate(`Hello, \\world\\!`)).toMatchSnapshot();
});

it("transpiles a simple template", () => {
  expect(transpileTemplate(`Hello, world!`)).toMatchSnapshot();
});

it("transpiles an empty template", () => {
  expect(transpileTemplate(``)).toMatchSnapshot();
});

it("transpiles a template with an interpolated expression", () => {
  expect(transpileTemplate(`Hello, $\{"world"}!`)).toMatchSnapshot();
});

it("transpiles a template with backquotes", () => {
  expect(transpileTemplate(`Hello, \`world\`!`)).toMatchSnapshot();
});

it("transpiles a template with backslashes", () => {
  expect(transpileTemplate(`Hello, \\world\\!`)).toMatchSnapshot();
});
