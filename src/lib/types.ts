// ── Scan event types (SSE) ─────────────────────────────────────────────────
export type SseEvent =
  | { type: 'log'; text: string }
  | { type: 'done'; code: number }
  | { type: 'error'; message: string };

// ── Scan status ────────────────────────────────────────────────────────────
export type ScanStatus = 'idle' | 'running' | 'done' | 'error';

// ── Tool result shapes ─────────────────────────────────────────────────────
export interface FingerFinding {
  category: string;
  name: string;
  version: string | null;
  confidence: 'high' | 'medium' | 'low';
  evidence: string;
}

export interface ProbeFinding {
  severity: 'critical' | 'high' | 'medium' | 'low';
  name: string;
  category: string;
  url: string;
  evidence: string;
}

export interface InjectFinding {
  url: string;
  method: string;
  parameter: string;
  technique: string;
  payload: string;
  evidence: string;
  dbms?: string;
}

export interface CveFinding {
  severity: 'critical' | 'high' | 'medium' | 'low';
  cve_id: string | null;
  vul_name: string;
  vul_type: string;
  technique: string;
  evidence: string | null;
}

export interface ReconAsset {
  method: string;
  url: string;
  data?: string;
}

// ── Scan history entry ─────────────────────────────────────────────────────
export interface ScanRecord {
  id: string;
  tool: string;
  target: string;
  startedAt: string;
  finishedAt?: string;
  status: 'running' | 'done' | 'error';
  exitCode?: number;
  resultFile?: string;
}
