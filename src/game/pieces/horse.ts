import type { BoardState, Position, Player } from '../../types/index.ts'
import { isInBounds, getPieceAt } from '../board.ts'

/**
 * Horse (馬) moves: L-shape
 * 1 step orthogonal, then 1 step diagonal (away from start)
 * The orthogonal intermediate must be empty (can be blocked, unlike chess knight)
 */
export function getHorseMoves(board: BoardState, pos: Position, player: Player): Position[] {
  const moves: Position[] = []

  const directions: { dr: number; dc: number; diags: { dr: number; dc: number }[] }[] = [
    { dr: -1, dc: 0, diags: [{ dr: -1, dc: -1 }, { dr: -1, dc: 1 }] }, // up
    { dr: 1, dc: 0, diags: [{ dr: 1, dc: -1 }, { dr: 1, dc: 1 }] },   // down
    { dr: 0, dc: -1, diags: [{ dr: -1, dc: -1 }, { dr: 1, dc: -1 }] }, // left
    { dr: 0, dc: 1, diags: [{ dr: -1, dc: 1 }, { dr: 1, dc: 1 }] },   // right
  ]

  for (const dir of directions) {
    // First step: orthogonal
    const mid: Position = { row: pos.row + dir.dr, col: pos.col + dir.dc }
    if (!isInBounds(mid)) continue
    if (getPieceAt(board, mid) !== null) continue // blocked

    for (const diag of dir.diags) {
      // Second step: diagonal
      const target: Position = { row: mid.row + diag.dr, col: mid.col + diag.dc }
      if (!isInBounds(target)) continue

      const targetPiece = getPieceAt(board, target)
      if (targetPiece && targetPiece.player === player) continue

      moves.push(target)
    }
  }

  return moves
}
