declare module "@observablehq/inspector" {
  export class Inspector {
    constructor(element: HTMLElement);
    pending(): void;
    fulfilled(value: unknown, name?: string): void;
    rejected(error: unknown, name?: string): void;
  }
}
