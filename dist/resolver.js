/**
 * Resolve variable values: flags → auto-detect → defaults → ask.
 * Handles array expansion (comma-separated, globs, @file, stdin).
 */
import { createInterface } from 'node:readline';
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { autodetect } from './autodetect.js';
function expandArrayValue(raw) {
    // @file — read lines from file
    if (raw.startsWith('@') && existsSync(raw.slice(1))) {
        return readFileSync(raw.slice(1), 'utf8')
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean);
    }
    // - (stdin) handled at CLI level before this
    if (raw === '-')
        return [raw];
    // Glob pattern
    if (raw.includes('*') || raw.includes('?')) {
        try {
            const files = execSync(`ls -1 ${raw}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] })
                .trim()
                .split('\n')
                .filter(Boolean);
            if (files.length > 0)
                return files;
        }
        catch {
            // Not a valid glob, treat as literal
        }
    }
    // Comma-separated
    if (raw.includes(',')) {
        return raw.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [raw];
}
export async function resolve(vars, flags, interactive) {
    const values = {};
    const arrayVars = {};
    let hasArrays = false;
    for (const v of vars) {
        // 1. Check flags
        if (v.name in flags) {
            const expanded = expandArrayValue(flags[v.name]);
            if (expanded.length > 1) {
                arrayVars[v.name] = expanded;
                hasArrays = true;
            }
            else {
                values[v.name] = expanded[0];
            }
            continue;
        }
        // 2. Auto-detect
        const auto = autodetect(v.name);
        if (auto !== undefined) {
            values[v.name] = auto;
            continue;
        }
        // 3. Default
        if (v.defaultValue !== undefined) {
            values[v.name] = v.defaultValue;
            continue;
        }
        // 4. Ask interactively
        if (interactive) {
            const answer = await ask(`  ${v.name}: `);
            const expanded = expandArrayValue(answer);
            if (expanded.length > 1) {
                arrayVars[v.name] = expanded;
                hasArrays = true;
            }
            else {
                values[v.name] = expanded[0];
            }
        }
    }
    // Build iterations
    if (!hasArrays) {
        return { values, iterations: [values] };
    }
    // Zip mode: iterate over the longest array, cycling shorter ones
    const arrayNames = Object.keys(arrayVars);
    const maxLen = Math.max(...arrayNames.map(n => arrayVars[n].length));
    const iterations = [];
    for (let i = 0; i < maxLen; i++) {
        const iter = { ...values };
        for (const name of arrayNames) {
            const arr = arrayVars[name];
            iter[name] = arr[i % arr.length];
        }
        iterations.push(iter);
    }
    return { values, iterations };
}
function ask(prompt) {
    const rl = createInterface({ input: process.stdin, output: process.stderr });
    return new Promise(resolve => {
        rl.question(prompt, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}
//# sourceMappingURL=resolver.js.map