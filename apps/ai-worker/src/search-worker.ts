import { parentPort } from 'node:worker_threads';
import { searchBestMove } from '@xiangqi/ai';
import type { SearchJobRequest } from './protocol.js';

if (parentPort) {
  parentPort.on('message', (msg: SearchJobRequest) => {
    if (msg.type !== 'SEARCH') return;

    const { jobId, matchId, expectedVersion, input, cancelBuffer } = msg;
    const cancelView = new Int32Array(cancelBuffer);

    try {
      const now = () => performance.now();
      const isCancelled = () => Atomics.load(cancelView, 0) === 1;

      const result = searchBestMove(input, now, isCancelled);

      parentPort?.postMessage({
        type: 'RESULT',
        jobId,
        matchId,
        expectedVersion,
        result,
      });
    } catch (err: unknown) {
      parentPort?.postMessage({
        type: 'ERROR',
        jobId,
        matchId,
        expectedVersion,
        error: String(err),
      });
    }
  });
}
