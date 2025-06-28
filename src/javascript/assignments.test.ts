import {assert, test} from "vitest";
import {checkAssignments} from "./assignments.js";
import {parseJavaScript} from "./parse.js";

function check(input: string) {
  const cell = parseJavaScript(input);
  checkAssignments(cell.body, cell.references, input);
}

test("allows non-external assignments", () => {
  assert.doesNotThrow(() => check("let foo = 1;\nfoo = 2;"));
  assert.doesNotThrow(() => check("let foo = 1;\nfor (foo of []);"));
});

test("allows external references", () => {
  assert.doesNotThrow(() => check("foo + 1;"));
});

test("does not allow external assignments", () => {
  assert.throws(() => check("foo = 1;"), /external variable 'foo'/);
  assert.throws(() => check("foo++;"), /external variable 'foo'/);
  assert.throws(() => check("++foo;"), /external variable 'foo'/);
  assert.throws(() => check("({foo} = {});"), /external variable 'foo'/);
  assert.throws(() => check("({foo: bar} = {});"), /external variable 'bar'/);
  assert.throws(() => check("([foo] = []);"), /external variable 'foo'/);
  assert.throws(() => check("let foo = 1;\n({...bar} = {});"), /external variable 'bar'/);
  assert.throws(() => check("let foo = 1;\n([...bar] = []);"), /external variable 'bar'/);
  assert.throws(() => check("let foo = 1;\nbar = 1;"), /external variable 'bar'/);
  assert.throws(() => check("function f() { foo = 1; }"), /external variable 'foo'/);
});

test("does not allow external assignments via for…of or for…in", () => {
  assert.throws(() => check("for (foo of []);"), /external variable 'foo'/);
  assert.throws(() => check("for (foo in {});"), /external variable 'foo'/);
});

test("does not allow global assignments", () => {
  assert.throws(() => check("window = 1;"), /global 'window'/);
});
