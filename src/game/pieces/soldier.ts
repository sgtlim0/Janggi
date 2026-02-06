import type { BoardState, Position, Player } from '../../types/index.ts'
import { isInBounds, getPieceAt, isInPalace } from '../board.ts'
import { PALACE_DIAGONALS } from '../constants.ts'

/**
 * Soldier (졸/兵) moves:
 * - Forward 1 step or sideways 1 step (never backward)
 * - Inside enemy palace: can also move along palace diagonals (forward direction only)
 * - No promotion
 *
 * Forward direction: Cho soldiers move up (row decreasing), Han soldiers move down (row increasing)
 */
export function getSoldierMoves(board: BoardState, pos: Position, player: Player): Position[] {
  const moves: Position[] = []
  const forward = player === 'cho' ? -1 : 1

  // Forward
  const fwd: Position = { row: pos.row + forward, col: pos.col }
  if (isInBounds(fwd)) {
    const piece = getPieceAt(board, fwd)
    if (!piece || piece.player !== player) {
      moves.push(fwd)
    }
  }

  // Sideways (left and right)
  const sideways: Position[] = [
    { row: pos.row, col: pos.col - 1 },
    { row: pos.row, col: pos.col + 1 },
  ]

  for (const target of sideways) {
    if (!isInBounds(target)) continue
    const piece = getPieceAt(board, target)
    if (!piece || piece.player !== player) {
      moves.push(target)
    }
  }

  // Palace diagonal moves (only forward-diagonal, when inside enemy palace)
  const enemyPlayer = player === 'cho' ? 'han' : 'cho'
  if (isInPalace(pos, enemyPlayer)) {
    const diags = PALACE_DIAGONALS.get(`${pos.row},${pos.col}`) ?? []
    for (const target of diags) {
      // Only allow forward-direction diagonals
      const dr = target.row - pos.row
      if (Math.sign(dr) !== Math.sign(forward) && dr !== 0) continue
      if (dr === 0) continue // sideways diagonals not allowed beyond normal sideways

      const piece = getPieceAt(board, target)
      if (!piece || piece.player !== player) {
        // Avoid duplicate
        if (!moves.some(m => m.row === target.row && m.col === target.col)) {
          moves.push(target)
        }
      }
    }
  }

  return moves
}
