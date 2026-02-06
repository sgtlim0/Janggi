import type { BoardState, Player } from '../types/index.ts'
import { findKing, getPieceAt } from './board.ts'
import { isInCheck, hasLegalMoves } from './moves.ts'
import { COLS } from './constants.ts'

/**
 * Check for bikjang (빅장): two kings facing each other in the same column
 * with no pieces between them. This is a draw condition in Janggi.
 */
export function checkBikjang(board: BoardState): boolean {
  const choKing = findKing(board, 'cho')
  const hanKing = findKing(board, 'han')

  if (!choKing || !hanKing) return false

  // Must be in the same column
  if (choKing.col !== hanKing.col) return false

  // Check if there are any pieces between the two kings
  const minRow = Math.min(choKing.row, hanKing.row)
  const maxRow = Math.max(choKing.row, hanKing.row)

  for (let row = minRow + 1; row < maxRow; row++) {
    if (getPieceAt(board, { row, col: choKing.col }) !== null) {
      return false // piece between kings
    }
  }

  return true
}

/**
 * Check if the current player is in checkmate (in check with no legal moves)
 */
export function isCheckmate(board: BoardState, player: Player): boolean {
  if (!isInCheck(board, player)) return false
  return !hasLegalMoves(board, player)
}

/**
 * Count material for a player (for score display)
 */
export function countMaterial(board: BoardState, player: Player): number {
  let total = 0
  const values: Record<string, number> = {
    chariot: 13,
    cannon: 7,
    horse: 5,
    elephant: 3,
    advisor: 3,
    soldier: 2,
  }

  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < COLS; col++) {
      const piece = getPieceAt(board, { row, col })
      if (piece && piece.player === player && piece.type !== 'king') {
        total += values[piece.type] ?? 0
      }
    }
  }

  return total
}
