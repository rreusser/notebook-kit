type Template = (template: TemplateStringsArray, ...values: unknown[]) => Promise<unknown>;

export function __sql(db: {sql: Template}, render: (data: unknown) => unknown): Template {
  return (template, ...values) => {
    return db.sql.call(db, template, ...values).then(render);
  };
}
