import type { SearchInput, SearchResult } from '@xiangqi/contracts';

/**
 * IPC contract between the supervisor and the CPU search worker.
 * Every message carries the job identity triple (jobId, expectedVersion, jobVersion)
 * so a late or foreign result can never be applied to a different turn (spec 09 §7.2).
 */
export interface SearchJobRequest {
  type: 'SEARCH';
  jobId: string;
  matchId: string;
  expectedVersion: number;
  /** `public.ai_jobs.job_version` captured when the job was queued. */
  jobVersion: number;
  input: SearchInput;
  // Shared cancel buffer: 1-byte Int32Array (1 = cancelled)
  cancelBuffer: SharedArrayBuffer;
}

export interface SearchJobResult {
  type: 'RESULT';
  jobId: string;
  matchId: string;
  expectedVersion: number;
  jobVersion: number;
  result: SearchResult;
}

export interface SearchJobError {
  type: 'ERROR';
  jobId: string;
  matchId: string;
  expectedVersion: number;
  jobVersion: number;
  error: string;
}

export type WorkerMessage = SearchJobResult | SearchJobError;
