/** Fills `{name}` placeholders in a UI string. Fails on a placeholder without a value. */
export function fill(template: string, values: Readonly<Record<string, string | number>>): string {
  return template.replace(/\{([a-z]+)\}/gi, (_match, name: string) => {
    const value = values[name];
    if (value === undefined) throw new Error(`No value for {${name}} in "${template}"`);
    return String(value);
  });
}
