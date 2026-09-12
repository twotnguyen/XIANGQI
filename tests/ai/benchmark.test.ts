import { describe, it } from 'vitest';
import { runBenchmark, exportReports } from './benchmark.js';

describe('AI Benchmark Execution and Report Export', () => {
  it('runs benchmark across 20 corpus positions and exports JSON/CSV reports', () => {
    const results = runBenchmark(2);
    exportReports(results);
  });
});
