/**
 * Auto-detect variable values from the current environment.
 */
export declare function autodetect(varName: string): string | undefined;
export declare function autodetectAll(varNames: string[]): Record<string, string>;
