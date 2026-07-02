/**
 * Resolve variable values: flags → auto-detect → defaults → ask.
 * Handles array expansion (comma-separated, globs, @file, stdin).
 */

import { createInterface } from 'node:readline';
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { autodetect } from './autodetect.js';
import type { TemplateVar } from './parser.js';

export interface ResolvedValues {
  values: Record<string, string>;
  iterations: Record<string, string>[];
}

function expandArrayValue(raw: string): string[] {
  // @file — read lines from file
  if (raw.startsWith('@') && existsSync(raw.slice(1))) {
    return readFileSync(raw.slice(1), 'utf8')
      .split('\n')
      .map((l: string) => l.trim())
      .filter(Boolean);
  }

  // - (stdin) handled at CLI level before this
  if (raw === '-') return [raw];

  // Glob pattern
  if (raw.includes('*') || raw.includes('?')) {
    try {
      const files = execSync(`ls -1 ${raw}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] })
        .trim()
        .split('\n')
        .filter(Boolean);
      if (files.length > 0) return files;
    } catch {
      // Not a valid glob, treat as literal
    }
  }

  // Comma-separated
  if (raw.includes(',')) {
    return raw.split(',').map(s => s.trim()).filter(Boolean);
  }

  return [raw];
}

function cartesian(arrays: string[][]): string[][] {
  if (arrays.length === 0) return [[]];
  const [first, ...rest] = arrays;
  const restCombos = cartesian(rest);
  const result: string[][] = [];
  for (const val of first) {
    for (const combo of restCombos) {
      result.push([val, ...combo]);
    }
  }
  return result;
}

export async function resolve(
  vars: TemplateVar[],
  flags: Record<string, string>,
  interactive: boolean,
  cross = false,
): Promise<ResolvedValues> {
  const values: Record<string, string> = {};
  const arrayVars: Record<string, string[]> = {};
  let hasArrays = false;

  for (const v of vars) {
    // 1. Check flags
    if (v.name in flags) {
      const expanded = expandArrayValue(flags[v.name]);
      if (expanded.length > 1) {
        arrayVars[v.name] = expanded;
        hasArrays = true;
      } else {
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
      } else {
        values[v.name] = expanded[0];
      }
    }
  }

  // Build iterations
  if (!hasArrays) {
    return { values, iterations: [values] };
  }

  const arrayNames = Object.keys(arrayVars);
  const iterations: Record<string, string>[] = [];

  if (cross) {
    const arrays = arrayNames.map(n => arrayVars[n]);
    const combos = cartesian(arrays);
    for (const combo of combos) {
      const iter = { ...values };
      for (let j = 0; j < arrayNames.length; j++) {
        iter[arrayNames[j]] = combo[j];
      }
      iterations.push(iter);
    }
  } else {
    const maxLen = Math.max(...arrayNames.map(n => arrayVars[n].length));
    for (let i = 0; i < maxLen; i++) {
      const iter = { ...values };
      for (const name of arrayNames) {
        const arr = arrayVars[name];
        iter[name] = arr[i % arr.length];
      }
      iterations.push(iter);
    }
  }

  return { values, iterations };
}

function ask(prompt: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stderr });
  return new Promise(resolve => {
    rl.question(prompt, (answer: string) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}
