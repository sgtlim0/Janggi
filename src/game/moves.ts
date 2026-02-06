import type { BoardState, Position, Player } from '../types/index.ts'
import { getRawMoves } from './pieces/index.ts'
import { findKing, findAllPieces, applyMove, opponent, getPieceAt } from './board.ts'

/** Check if a position is attacked by any piece of the given player */
export function isAttackedBy(board: BoardState, pos: Position, attacker: Player): boolean {
  const pieces = findAllPieces(board, attacker)
  for (const { pos: piecePos, piece } of pieces) {
    const rawMoves = getRawMoves(board, piecePos, attacker, piece.type)
    if (rawMoves.some(m => m.row === pos.row && m.col === pos.col)) {
      return true
    }
  }
  return false
}

/** Check if the given player's king is in check */
export function isInCheck(board: BoardState, player: Player): boolean {
  const kingPos = findKing(board, player)
  if (!kingPos) return false
  return isAttackedBy(board, kingPos, opponent(player))
}

/** Get legal moves for a specific piece (filtered for check) */
export function getLegalMoves(board: BoardState, pos: Position, player: Player): Position[] {
  const piece = getPieceAt(board, pos)
  if (!piece || piece.player !== player) return []

  const rawMoves = getRawMoves(board, pos, player, piece.type)

  return rawMoves.filter(target => {
    // Apply the move and check if own king is still in check
    const newBoard = applyMove(board, pos, target)
    return !isInCheck(newBoard, player)
  })
}

/** Get all legal moves for a player, returns array of { from, to } */
export function getAllLegalMoves(
  board: BoardState,
  player: Player,
): { from: Position; to: Position }[] {
  const result: { from: Position; to: Position }[] = []
  const pieces = findAllPieces(board, player)

  for (const { pos } of pieces) {
    const legalMoves = getLegalMoves(board, pos, player)
    for (const to of legalMoves) {
      result.push({ from: pos, to })
    }
  }

  return result
}

/** Check if a player has any legal moves */
export function hasLegalMoves(board: BoardState, player: Player): boolean {
  const pieces = findAllPieces(board, player)
  for (const { pos } of pieces) {
    const legalMoves = getLegalMoves(board, pos, player)
    if (legalMoves.length > 0) return true
  }
  return false
}
