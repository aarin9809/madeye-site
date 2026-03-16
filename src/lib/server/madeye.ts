// ── Server-only: MadEyE Python bridge ─────────────────────────────────────
// Builds CLI args and spawns the Python subprocess.
// Import only from +server.ts files (server-side only).

import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { mkdirSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { MADEYE_PYTHON, MADEYE_SCRIPT } from '$env/static/private';

// ── Temp file for raw HTTP ─────────────────────────────────────────────────
export function writeTempRaw(content: string): string {
  const dir = join(tmpdir(), 'madeye_web');
  mkdirSync(dir, { recursive: true });
  const path = join(dir, `raw_${randomUUID()}.txt`);
  writeFileSync(path, content, 'utf-8');
  return path;
}

export function removeTempFile(path: string) {
  try {
    if (existsSync(path)) unlinkSync(path);
  } catch {}
}

// ── Build CLI argument list ────────────────────────────────────────────────
export interface ScanRequest {
  tool: string;
  target?: string;
  params: Record<string, string | number | boolean>;
  outputFile?: string;
}

export function buildArgs(req: ScanRequest): { args: string[]; tempFiles: string[] } {
  const { tool, target, params, outputFile } = req;
  const args: string[] = [tool];
  const tempFiles: string[] = [];

  // Handle raw HTTP content (special: write to temp file and pass as --raw)
  const rawHttp = params['rawHttp'];
  if (rawHttp && typeof rawHttp === 'string' && rawHttp.trim()) {
    const tmpPath = writeTempRaw(rawHttp);
    tempFiles.push(tmpPath);
    args.push('--raw', tmpPath);
  }

  // Positional target argument comes before flags
  if (target && target.trim()) {
    args.push(target.trim());
  }

  // Named flags from form field values
  const skipKeys = new Set(['rawHttp', 'outputFile']);
  for (const [key, val] of Object.entries(params)) {
    if (skipKeys.has(key)) continue;
    if (val === '' || val === null || val === undefined) continue;

    // Boolean flags (--poc, --github, --poc-vscan, etc.)
    if (typeof val === 'boolean') {
      if (val) args.push(`--${key.replace(/_/g, '-')}`);
      continue;
    }

    // Key → CLI flag mapping (special cases)
    const flagMap: Record<string, string> = {
      type_:       '--type',
      cve_id:      '--cve',
      github_token:'--github-token',
      poc_vscan:   '--poc-vscan',
      dbms_scope:  '--dbms-scope',
    };
    const flag = flagMap[key] ?? `--${key.replace(/_/g, '-')}`;
    args.push(flag, String(val));
  }

  if (outputFile) {
    args.push('--output', outputFile);
  }

  return { args, tempFiles };
}

// ── Spawn MadEyE process ───────────────────────────────────────────────────
export function spawnMadeye(args: string[]): ChildProcessWithoutNullStreams {
  // cwd = directory containing run_madeye.py so relative imports work
  const scriptDir = MADEYE_SCRIPT.replace(/[/\\][^/\\]+$/, '');
  return spawn(MADEYE_PYTHON, [MADEYE_SCRIPT, ...args], {
    cwd: scriptDir,
    env: {
      ...process.env,
      PYTHONIOENCODING: 'utf-8',
      PYTHONUNBUFFERED:  '1',
      // Force rich/colorama to emit ANSI codes even when piped
      FORCE_COLOR:       '1',
      TERM:              'xterm-256color',
      COLUMNS:           '160',
    },
  });
}

// ── Result file path ───────────────────────────────────────────────────────
export function makeResultPath(scanId: string): string {
  const dir = join(tmpdir(), 'madeye_web', 'results');
  mkdirSync(dir, { recursive: true });
  return join(dir, `${scanId}.json`);
}
