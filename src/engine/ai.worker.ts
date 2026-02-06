import { findBestMove } from './minimax.ts'
import type { AiWorkerMessage, AiWorkerResponse } from '../types/index.ts'

self.onmessage = (e: MessageEvent<AiWorkerMessage>) => {
  const { board, turn, depth, moveHistory } = e.data

  const result = findBestMove(board, turn, depth, moveHistory)

  if (result) {
    const response: AiWorkerResponse = {
      type: 'result',
      from: result.from,
      to: result.to,
      isPass: result.isPass,
    }
    self.postMessage(response)
  }
}
