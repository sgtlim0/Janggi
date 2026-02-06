import type { BoardState, Position, Player } from '../../types/index.ts'
import { isInBounds, getPieceAt } from '../board.ts'

/**
 * Elephant (象) moves: Y-shape movement
 * 1 step orthogonal, then 2 steps diagonal (away from start)
 * Both intermediate positions must be empty (can be blocked)
 */
export function getElephantMoves(board: BoardState, pos: Position, player: Player): Position[] {
  const moves: Position[] = []

  // 4 orthogonal directions, each with 2 diagonal continuations
  const directions: { dr: number; dc: number; diags: { dr: number; dc: number }[] }[] = [
    { dr: -1, dc: 0, diags: [{ dr: -1, dc: -1 }, { dr: -1, dc: 1 }] }, // up
    { dr: 1, dc: 0, diags: [{ dr: 1, dc: -1 }, { dr: 1, dc: 1 }] },   // down
    { dr: 0, dc: -1, diags: [{ dr: -1, dc: -1 }, { dr: 1, dc: -1 }] }, // left
    { dr: 0, dc: 1, diags: [{ dr: -1, dc: 1 }, { dr: 1, dc: 1 }] },   // right
  ]

  for (const dir of directions) {
    // First step: 1 orthogonal
    const mid1: Position = { row: pos.row + dir.dr, col: pos.col + dir.dc }
    if (!isInBounds(mid1)) continue
    if (getPieceAt(board, mid1) !== null) continue // blocked at step 1

    for (const diag of dir.diags) {
      // Second step: 1 diagonal
      const mid2: Position = { row: mid1.row + diag.dr, col: mid1.col + diag.dc }
      if (!isInBounds(mid2)) continue
      if (getPieceAt(board, mid2) !== null) continue // blocked at step 2

      // Third step: 1 more diagonal (same direction)
      const target: Position = { row: mid2.row + diag.dr, col: mid2.col + diag.dc }
      if (!isInBounds(target)) continue

      const targetPiece = getPieceAt(board, target)
      if (targetPiece && targetPiece.player === player) continue

      moves.push(target)
    }
  }

  return moves
}
