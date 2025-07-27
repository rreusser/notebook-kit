declare module "htl" {
  export const html: (template: readonly string[], ...values: unknown[]) => HTMLElement;
}
