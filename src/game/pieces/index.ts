import type { BoardState, Position, Player, PieceType } from '../../types/index.ts'
import { getKingMoves } from './king.ts'
import { getAdvisorMoves } from './advisor.ts'
import { getElephantMoves } from './elephant.ts'
import { getHorseMoves } from './horse.ts'
import { getChariotMoves } from './chariot.ts'
import { getCannonMoves } from './cannon.ts'
import { getSoldierMoves } from './soldier.ts'

/** Get raw moves for a piece (before check filtering) */
export function getRawMoves(
  board: BoardState,
  pos: Position,
  player: Player,
  pieceType: PieceType,
): Position[] {
  switch (pieceType) {
    case 'king': return getKingMoves(board, pos, player)
    case 'advisor': return getAdvisorMoves(board, pos, player)
    case 'elephant': return getElephantMoves(board, pos, player)
    case 'horse': return getHorseMoves(board, pos, player)
    case 'chariot': return getChariotMoves(board, pos, player)
    case 'cannon': return getCannonMoves(board, pos, player)
    case 'soldier': return getSoldierMoves(board, pos, player)
  }
}
