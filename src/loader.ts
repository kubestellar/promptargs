/**
 * Find and load prompt templates from .prompts/ directories.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import { homedir } from 'node:os';

const PROJECT_DIR = '.prompts';
const USER_DIR = join(homedir(), '.prompts');

export interface PromptTemplate {
  name: string;
  content: string;
  path: string;
  source: 'project' | 'user';
}

function loadFromDir(dir: string, source: 'project' | 'user'): PromptTemplate[] {
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .filter((f: string) => f.endsWith('.md'))
    .map((f: string) => ({
      name: basename(f, extname(f)),
      content: readFileSync(join(dir, f), 'utf8'),
      path: join(dir, f),
      source,
    }));
}

export function loadTemplates(cwd?: string): PromptTemplate[] {
  const projectDir = join(cwd || process.cwd(), PROJECT_DIR);
  const projectTemplates = loadFromDir(projectDir, 'project');
  const userTemplates = loadFromDir(USER_DIR, 'user');

  // Project templates override user templates with same name
  const byName = new Map<string, PromptTemplate>();
  for (const t of userTemplates) byName.set(t.name, t);
  for (const t of projectTemplates) byName.set(t.name, t);

  return Array.from(byName.values());
}

export function findTemplate(name: string, cwd?: string): PromptTemplate | undefined {
  return loadTemplates(cwd).find(t => t.name === name);
}
