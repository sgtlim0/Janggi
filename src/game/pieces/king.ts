import type { BoardState, Position, Player } from '../../types/index.ts'
import { isInPalace, getPieceAt } from '../board.ts'
import { PALACE_DIAGONALS } from '../constants.ts'

/** King moves: 1 step orthogonal + palace diagonal, must stay in palace */
export function getKingMoves(board: BoardState, pos: Position, player: Player): Position[] {
  const moves: Position[] = []

  // Orthogonal moves within palace
  const orthogonal: Position[] = [
    { row: pos.row - 1, col: pos.col },
    { row: pos.row + 1, col: pos.col },
    { row: pos.row, col: pos.col - 1 },
    { row: pos.row, col: pos.col + 1 },
  ]

  for (const target of orthogonal) {
    if (!isInPalace(target, player)) continue
    const piece = getPieceAt(board, target)
    if (piece && piece.player === player) continue
    moves.push(target)
  }

  // Diagonal moves along palace diagonals
  const diagonals = PALACE_DIAGONALS.get(`${pos.row},${pos.col}`) ?? []
  for (const target of diagonals) {
    if (!isInPalace(target, player)) continue
    const piece = getPieceAt(board, target)
    if (piece && piece.player === player) continue
    moves.push(target)
  }

  return moves
}
