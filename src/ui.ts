import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { autodetect, AUTODETECT_VARS } from './autodetect.js';

const DEFAULT_PORT = 3700;
const OPEN_DELAY_MS = 500;
const DIFF_PREVIEW_MAX_CHARS = 60;

function collectEnvVars(): Record<string, string> {
  const env: Record<string, string> = {};
  for (const name of AUTODETECT_VARS) {
    const value = autodetect(name);
    if (value !== undefined) {
      env[name] = name === 'diff' && value.length > DIFF_PREVIEW_MAX_CHARS
        ? value.slice(0, DIFF_PREVIEW_MAX_CHARS) + '...'
        : value;
    }
  }
  return env;
}

export function startUI(port = DEFAULT_PORT): void {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const htmlPath = join(__dirname, 'ui.html');
  let rawHtml: string;

  try {
    rawHtml = readFileSync(htmlPath, 'utf-8');
  } catch {
    console.error('UI file not found. Reinstall @kubestellar/promptargs.');
    process.exit(1);
  }

  const envVars = collectEnvVars();
  const envScript = `<script>window.__PROMPTARGS_ENV__ = ${JSON.stringify(envVars)};</script>`;
  const html = rawHtml.replace('<script>', envScript + '\n<script>');

  const server = createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  });

  server.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(`promptargs builder running at ${url}`);
    console.log('Press Ctrl+C to stop.\n');

    setTimeout(() => {
      import('node:child_process').then(({ exec }) => {
        const cmd = process.platform === 'darwin' ? 'open' :
                    process.platform === 'win32' ? 'start' : 'xdg-open';
        exec(`${cmd} ${url}`);
      });
    }, OPEN_DELAY_MS);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is in use. Try: promptargs ui --port=${port + 1}`);
      process.exit(1);
    }
    throw err;
  });
}
