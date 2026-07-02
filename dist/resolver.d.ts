/**
 * Resolve variable values: flags → auto-detect → defaults → ask.
 * Handles array expansion (comma-separated, globs, @file, stdin).
 */
import type { TemplateVar } from './parser.js';
export interface ResolvedValues {
    values: Record<string, string>;
    iterations: Record<string, string>[];
}
export declare function resolve(vars: TemplateVar[], flags: Record<string, string>, interactive: boolean, cross?: boolean): Promise<ResolvedValues>;
