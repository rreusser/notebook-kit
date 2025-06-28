import "acorn";

// Private types so that we can extend Acorn’s internals.
declare module "acorn" {
  class TokContext {
    constructor(
      token: string,
      isExpr: boolean,
      preserveSpace: boolean,
      override?: (p: Parser) => void
    );
  }
  class ParserImpl extends Parser {
    type: TokenType;
    exprAllowed: boolean;
    start: number;
    pos: number;
    value: unknown;
    startNode(): void;
    next(): void;
    expect(type: TokenType): void;
    finishToken(type: TokenType, value?: unknown): void;
    finishNode(node: Node, type: string): void;
    parseTopLevel(node: Node): Node;
    parseExpression(): Expression;
    parseTemplateElement(ref: {isTagged: boolean}): TemplateElement;
  }
}
