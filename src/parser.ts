/**
 * Parse {{variables}} and {{variables=defaults}} from template strings.
 */

export interface TemplateVar {
  name: string;
  defaultValue?: string;
  raw: string;
}

const VAR_PATTERN = /\{\{(\w+)(?:=([^}]*))?\}\}/g;

export function parseVars(template: string): TemplateVar[] {
  const seen = new Set<string>();
  const vars: TemplateVar[] = [];

  for (const match of template.matchAll(VAR_PATTERN)) {
    const name = match[1];
    if (seen.has(name)) continue;
    seen.add(name);
    vars.push({
      name,
      defaultValue: match[2],
      raw: match[0],
    });
  }

  return vars;
}

export function expand(template: string, values: Record<string, string>): string {
  return template.replace(VAR_PATTERN, (_match, name: string, defaultValue?: string) => {
    if (name in values) return values[name];
    if (defaultValue !== undefined) return defaultValue;
    return `{{${name}}}`;
  });
}
