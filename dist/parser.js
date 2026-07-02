/**
 * Parse {{variables}} and {{variables=defaults}} from template strings.
 */
const VAR_PATTERN = /\{\{(\w+)(?:=([^}]*))?\}\}/g;
export function parseVars(template) {
    const seen = new Set();
    const vars = [];
    for (const match of template.matchAll(VAR_PATTERN)) {
        const name = match[1];
        if (seen.has(name))
            continue;
        seen.add(name);
        vars.push({
            name,
            defaultValue: match[2],
            raw: match[0],
        });
    }
    return vars;
}
export function expand(template, values) {
    return template.replace(VAR_PATTERN, (_match, name, defaultValue) => {
        if (name in values)
            return values[name];
        if (defaultValue !== undefined)
            return defaultValue;
        return `{{${name}}}`;
    });
}
//# sourceMappingURL=parser.js.map