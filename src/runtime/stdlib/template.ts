/* eslint-disable @typescript-eslint/no-explicit-any */

export type TemplateRenderer = (template: readonly string[], ...values: any[]) => Node;
export type RawTemplateRenderer = (template: {raw: readonly string[]}, ...values: any[]) => Node;
export type AsyncRawTemplateRenderer = (template: {raw: readonly string[]}, ...values: any[]) => Promise<Node>;
