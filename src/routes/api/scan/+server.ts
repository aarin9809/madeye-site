// ── POST /api/scan — MadEyE SSE streaming endpoint ────────────────────────
import type { RequestHandler } from './$types';
import { buildArgs, spawnMadeye, makeResultPath, removeTempFile } from '$lib/server/madeye';
import { SCANNER_MAP } from '$lib/scanners';
import { readFileSync, existsSync } from 'node:fs';

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json() as {
    tool: string;
    target?: string;
    params: Record<string, string | number | boolean>;
  };

  const { tool, target, params } = body;

  if (!tool) {
    return new Response('Missing tool', { status: 400 });
  }

  // Only pass --output for tools that support it (recon/auto have no --output flag)
  const scanner = SCANNER_MAP[tool];
  const hasOutput = scanner?.hasOutput ?? false;
  const scanId = `${tool}_${Date.now()}`;
  const resultFile = hasOutput ? makeResultPath(scanId) : '';

  const { args, tempFiles } = buildArgs({
    tool,
    target,
    params,
    outputFile: hasOutput ? resultFile : undefined,
  });

  const enc = new TextEncoder();
  // Holds the spawned process so cancel() can kill it
  let proc: ReturnType<typeof spawnMadeye> | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          // controller may already be closed
        }
      };

      try {
        proc = spawnMadeye(args);
      } catch (err: unknown) {
        send({ type: 'error', message: `Failed to start MadEyE: ${(err as Error).message}` });
        controller.close();
        return;
      }

      // Buffer output line-by-line so SSE events are coherent
      let stdoutBuf = '';
      let stderrBuf = '';

      proc.stdout.on('data', (chunk: Buffer) => {
        stdoutBuf += chunk.toString('utf8');
        const lines = stdoutBuf.split('\n');
        stdoutBuf = lines.pop() ?? '';
        for (const line of lines) {
          send({ type: 'log', text: line });
        }
      });

      proc.stderr.on('data', (chunk: Buffer) => {
        stderrBuf += chunk.toString('utf8');
        const lines = stderrBuf.split('\n');
        stderrBuf = lines.pop() ?? '';
        for (const line of lines) {
          // Python warnings/tracebacks go to stderr — show dimmed
          send({ type: 'log', text: `\x1b[2m${line}\x1b[0m` });
        }
      });

      proc.on('close', (code: number | null) => {
        // Flush remaining buffered output
        if (stdoutBuf.trim()) send({ type: 'log', text: stdoutBuf });
        if (stderrBuf.trim()) send({ type: 'log', text: `\x1b[2m${stderrBuf}\x1b[0m` });

        const exitCode = code ?? 0;

        // Read structured results from --output file (only for tools that support it)
        if (hasOutput && resultFile) {
          try {
            if (existsSync(resultFile)) {
              const raw = readFileSync(resultFile, 'utf-8');
              const parsed = JSON.parse(raw);
              const arr = Array.isArray(parsed) ? parsed : [parsed];
              if (arr.length > 0) {
                send({ type: 'results', data: arr });
              }
            }
          } catch {
            // Result file may be malformed — not fatal
          }
        }

        send({ type: 'done', code: exitCode });

        // Cleanup temp files
        for (const f of tempFiles) removeTempFile(f);
        if (resultFile) { try { removeTempFile(resultFile); } catch {} }

        try { controller.close(); } catch {}
      });

      proc.on('error', (err: Error) => {
        send({ type: 'error', message: err.message });
        for (const f of tempFiles) removeTempFile(f);
        try { controller.close(); } catch {}
      });
    },

    cancel() {
      // Client disconnected — kill the Python process
      if (proc) {
        try { proc.kill('SIGTERM'); } catch {}
        try { proc.kill(); } catch {}
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',  // disable nginx buffering on NAS reverse proxy
    },
  });
};
