import type { BoardState, Player, MoveRecord } from '../types/index.ts'
import { ROWS, COLS } from '../game/constants.ts'
import { getPieceAt, findKing } from '../game/board.ts'
import { isInCheck } from '../game/moves.ts'
import { isCheckmate, checkBikjang } from '../game/rules.ts'
import { MATERIAL_VALUES, getPstValue } from './tables.ts'

/**
 * Evaluate board position from Cho's perspective.
 * Positive = good for Cho, Negative = good for Han.
 */
export function evaluate(board: BoardState, turn: Player, _moveHistory: MoveRecord[]): number {
  // Terminal states
  if (isCheckmate(board, turn)) {
    return turn === 'cho' ? -99999 : 99999
  }
  if (isCheckmate(board, turn === 'cho' ? 'han' : 'cho')) {
    return turn === 'cho' ? 99999 : -99999
  }
  if (checkBikjang(board)) {
    return 0
  }

  let score = 0

  // Material and positional evaluation
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const piece = getPieceAt(board, { row, col })
      if (!piece) continue

      const material = MATERIAL_VALUES[piece.type]
      const positional = getPstValue(piece.type, piece.player, row, col)
      const pieceScore = material + positional

      if (piece.player === 'cho') {
        score += pieceScore
      } else {
        score -= pieceScore
      }
    }
  }

  // Check bonus
  if (isInCheck(board, 'han')) score += 50
  if (isInCheck(board, 'cho')) score -= 50

  // King safety: penalize exposed king
  const choKing = findKing(board, 'cho')
  const hanKing = findKing(board, 'han')
  if (choKing) {
    // Bonus for keeping king in center of palace
    if (choKing.row === 8 && choKing.col === 4) score += 20
  }
  if (hanKing) {
    if (hanKing.row === 1 && hanKing.col === 4) score -= 20
  }

  return score
}
