import type { BoardState, Position, Player, MoveRecord } from '../types/index.ts'
import { evaluate } from './evaluate.ts'
import { getAllLegalMoves } from '../game/moves.ts'
import { applyMove, getPieceAt, opponent } from '../game/board.ts'
import { isCheckmate, checkBikjang } from '../game/rules.ts'
import { MATERIAL_VALUES } from './tables.ts'

interface ScoredMove {
  from: Position
  to: Position
  score: number
}

function orderMoves(board: BoardState, moves: { from: Position; to: Position }[]): ScoredMove[] {
  return moves
    .map(m => {
      let score = 0
      const captured = getPieceAt(board, m.to)
      const attacker = getPieceAt(board, m.from)

      // MVV-LVA
      if (captured && attacker) {
        score += MATERIAL_VALUES[captured.type] * 10 - MATERIAL_VALUES[attacker.type]
      }

      // Prefer chariot moves
      if (attacker?.type === 'chariot') score += 30

      // Prefer cannon moves
      if (attacker?.type === 'cannon') score += 20

      return { ...m, score }
    })
    .sort((a, b) => b.score - a.score)
}

function minimax(
  board: BoardState,
  turn: Player,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  moveHistory: MoveRecord[],
): number {
  if (depth === 0) {
    return evaluate(board, turn, moveHistory)
  }

  // Check terminal states
  if (isCheckmate(board, turn)) {
    return isMaximizing ? -99999 + (4 - depth) : 99999 - (4 - depth)
  }
  if (checkBikjang(board)) {
    return 0
  }

  const moves = getAllLegalMoves(board, turn)

  // If no legal moves, the player can only pass
  if (moves.length === 0) {
    // Pass: same board, switch turn
    return minimax(board, opponent(turn), depth - 1, alpha, beta, !isMaximizing, moveHistory)
  }

  const orderedMoves = orderMoves(board, moves)

  if (isMaximizing) {
    let maxEval = -Infinity
    for (const move of orderedMoves) {
      const newBoard = applyMove(board, move.from, move.to)
      const evaluation = minimax(newBoard, opponent(turn), depth - 1, alpha, beta, false, moveHistory)
      maxEval = Math.max(maxEval, evaluation)
      alpha = Math.max(alpha, evaluation)
      if (beta <= alpha) break
    }
    return maxEval
  } else {
    let minEval = Infinity
    for (const move of orderedMoves) {
      const newBoard = applyMove(board, move.from, move.to)
      const evaluation = minimax(newBoard, opponent(turn), depth - 1, alpha, beta, true, moveHistory)
      minEval = Math.min(minEval, evaluation)
      beta = Math.min(beta, evaluation)
      if (beta <= alpha) break
    }
    return minEval
  }
}

export function findBestMove(
  board: BoardState,
  turn: Player,
  depth: number,
  moveHistory: MoveRecord[],
): { from: Position; to: Position; isPass: boolean } | null {
  const moves = getAllLegalMoves(board, turn)

  // If no moves, return pass
  if (moves.length === 0) {
    return { from: { row: 0, col: 0 }, to: { row: 0, col: 0 }, isPass: true }
  }

  const isCho = turn === 'cho'
  const orderedMoves = orderMoves(board, moves)

  let bestMove: ScoredMove | null = null
  let bestEval = isCho ? -Infinity : Infinity

  for (const move of orderedMoves) {
    const newBoard = applyMove(board, move.from, move.to)
    const evaluation = minimax(
      newBoard,
      opponent(turn),
      depth - 1,
      -Infinity,
      Infinity,
      !isCho,
      moveHistory,
    )

    if (isCho) {
      if (evaluation > bestEval) {
        bestEval = evaluation
        bestMove = move
      }
    } else {
      if (evaluation < bestEval) {
        bestEval = evaluation
        bestMove = move
      }
    }
  }

  if (!bestMove) return null

  return {
    from: bestMove.from,
    to: bestMove.to,
    isPass: false,
  }
}
