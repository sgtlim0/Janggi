import type { PieceType, Player } from '../types/index.ts'

/**
 * Piece-Square Tables for Janggi (10 rows x 9 cols = 90 squares)
 * Values are from Cho's perspective (bottom).
 * For Han (top), the table is mirrored vertically.
 *
 * Higher values = better position for that piece.
 */

// King: prefers center of palace
const KING_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0, -5, -5, -5,  0,  0,  0,
  0,  0,  0, -5, 10, -5,  0,  0,  0,
  0,  0,  0,  0, -5,  0,  0,  0,  0,
]

// Advisor: prefers center of palace
const ADVISOR_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  5,  0,  5,  0,  0,  0,
  0,  0,  0,  0, 10,  0,  0,  0,  0,
  0,  0,  0,  5,  0,  5,  0,  0,  0,
]

// Elephant: prefers to stay back but with mobility
const ELEPHANT_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  5,  0,  0,  0,  5,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0, 10,  0,  0,  0, 10,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  5,  0,  0,  0,  0,  0,  5,  0,
]

// Horse: prefers center and forward positions
const HORSE_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  5,  0,  5,  0,  5,  0,  5,  0,
  0,  0, 10,  0, 10,  0, 10,  0,  0,
  5,  0, 10, 15, 10, 15, 10,  0,  5,
  0, 10, 15, 15, 15, 15, 15, 10,  0,
  0, 10, 15, 15, 15, 15, 15, 10,  0,
  5,  0, 10, 15, 10, 15, 10,  0,  5,
  0,  0, 10,  0,  0,  0, 10,  0,  0,
  0,  5,  0,  0,  0,  0,  0,  5,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,
]

// Chariot: prefers open files and central positions
const CHARIOT_TABLE = [
  5, 10, 10, 10, 15, 10, 10, 10,  5,
  5, 10, 10, 10, 15, 10, 10, 10,  5,
  5, 10, 10, 10, 15, 10, 10, 10,  5,
  5, 10, 10, 10, 15, 10, 10, 10,  5,
  5, 10, 10, 15, 20, 15, 10, 10,  5,
  5, 10, 10, 15, 20, 15, 10, 10,  5,
  5, 10, 10, 10, 15, 10, 10, 10,  5,
  0,  5,  5,  5, 10,  5,  5,  5,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,
  5,  0,  5,  0, 10,  0,  5,  0,  5,
]

// Cannon: prefers positions with good mount availability
const CANNON_TABLE = [
  0,  5,  0, 10, 15, 10,  0,  5,  0,
  5, 10, 10,  5, 10,  5, 10, 10,  5,
  0,  5,  0,  5,  0,  5,  0,  5,  0,
  0,  0,  5,  0, 10,  0,  5,  0,  0,
  5,  5, 10, 10, 15, 10, 10,  5,  5,
  5,  5, 10, 10, 15, 10, 10,  5,  5,
  0,  0,  5,  0, 10,  0,  5,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,
]

// Soldier: heavily incentivized to advance
const SOLDIER_TABLE = [
  0,  0,  0, 20, 25, 20,  0,  0,  0,
  0,  0,  0, 20, 25, 20,  0,  0,  0,
  0,  0,  0, 15, 20, 15,  0,  0,  0,
  5,  0, 10, 10, 15, 10, 10,  0,  5,
 10,  0, 15, 15, 20, 15, 15,  0, 10,
 10,  0, 15, 15, 20, 15, 15,  0, 10,
  5,  0, 10, 10, 10, 10, 10,  0,  5,
  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,
]

const TABLES: Record<PieceType, number[]> = {
  king: KING_TABLE,
  advisor: ADVISOR_TABLE,
  elephant: ELEPHANT_TABLE,
  horse: HORSE_TABLE,
  chariot: CHARIOT_TABLE,
  cannon: CANNON_TABLE,
  soldier: SOLDIER_TABLE,
}

/**
 * Get the piece-square table value for a piece at a position.
 * Tables are from Cho's perspective; Han's are mirrored.
 */
export function getPstValue(pieceType: PieceType, player: Player, row: number, col: number): number {
  const table = TABLES[pieceType]
  if (player === 'cho') {
    return table[row * 9 + col]
  }
  // Mirror for han (flip row)
  return table[(9 - row) * 9 + col]
}

export const MATERIAL_VALUES: Record<PieceType, number> = {
  king: 20000,
  chariot: 1300,
  cannon: 700,
  horse: 500,
  elephant: 300,
  advisor: 300,
  soldier: 200,
}
