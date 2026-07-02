/**
 * Status line rendering for Claude Code's status area.
 * Shows current template state: filled vars, unfilled vars, progress.
 */
export function renderStatus(templateName, vars, values, iteration) {
    const parts = [];
    for (const v of vars) {
        const val = values[v.name];
        if (val !== undefined) {
            const source = v.defaultValue === val ? '(default)' : '';
            parts.push(`${v.name}=${val}${source}`);
        }
        else {
            parts.push(`${v.name}=___`);
        }
    }
    const allFilled = vars.every(v => v.name in values);
    const icon = allFilled ? '✅' : '📋';
    const progress = iteration ? ` [${iteration.current}/${iteration.total}]` : '';
    return `${icon} ${templateName}${progress}: ${parts.join('  ')}`;
}
//# sourceMappingURL=status.js.map