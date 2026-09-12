import type { SearchInput, SearchResult } from '@xiangqi/contracts';

export interface SearchJobRequest {
  type: 'SEARCH';
  jobId: string;
  matchId: string;
  expectedVersion: number;
  input: SearchInput;
  // Shared cancel buffer: 1-byte Int32Array (1 = cancelled)
  cancelBuffer: SharedArrayBuffer;
}

export interface SearchJobResult {
  type: 'RESULT';
  jobId: string;
  matchId: string;
  expectedVersion: number;
  result: SearchResult;
}

export interface SearchJobError {
  type: 'ERROR';
  jobId: string;
  matchId: string;
  expectedVersion: number;
  error: string;
}

export type WorkerMessage = SearchJobResult | SearchJobError;
