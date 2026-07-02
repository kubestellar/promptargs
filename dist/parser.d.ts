/**
 * Parse {{variables}} and {{variables=defaults}} from template strings.
 */
export interface TemplateVar {
    name: string;
    defaultValue?: string;
    raw: string;
}
export declare function parseVars(template: string): TemplateVar[];
export declare function expand(template: string, values: Record<string, string>): string;
