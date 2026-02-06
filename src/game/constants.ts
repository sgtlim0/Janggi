import type { Player, PieceType, Position, Formation, BoardState } from '../types/index.ts'

export const ROWS = 10
export const COLS = 9

/** Palace boundaries per player */
export const PALACE: Record<Player, { rowMin: number; rowMax: number; colMin: number; colMax: number }> = {
  han: { rowMin: 0, rowMax: 2, colMin: 3, colMax: 5 },
  cho: { rowMin: 7, rowMax: 9, colMin: 3, colMax: 5 },
}

/**
 * Palace diagonal connections: from a given palace position,
 * which positions are diagonally reachable within the palace.
 * Key: "row,col" -> array of connected positions
 */
function buildPalaceDiagonals(): Map<string, Position[]> {
  const map = new Map<string, Position[]>()

  // Diagonal connections within each palace
  const palaceConnections: [Position, Position][] = [
    // Han palace (top)
    [{ row: 0, col: 3 }, { row: 1, col: 4 }],
    [{ row: 0, col: 5 }, { row: 1, col: 4 }],
    [{ row: 1, col: 4 }, { row: 2, col: 3 }],
    [{ row: 1, col: 4 }, { row: 2, col: 5 }],
    // Cho palace (bottom)
    [{ row: 7, col: 3 }, { row: 8, col: 4 }],
    [{ row: 7, col: 5 }, { row: 8, col: 4 }],
    [{ row: 8, col: 4 }, { row: 9, col: 3 }],
    [{ row: 8, col: 4 }, { row: 9, col: 5 }],
  ]

  for (const [a, b] of palaceConnections) {
    const keyA = `${a.row},${a.col}`
    const keyB = `${b.row},${b.col}`

    if (!map.has(keyA)) map.set(keyA, [])
    if (!map.has(keyB)) map.set(keyB, [])
    map.get(keyA)!.push(b)
    map.get(keyB)!.push(a)
  }

  return map
}

export const PALACE_DIAGONALS = buildPalaceDiagonals()

/** Piece display info */
export const PIECE_DISPLAY: Record<Player, Record<PieceType, string>> = {
  cho: {
    king: '楚',
    advisor: '士',
    elephant: '象',
    horse: '馬',
    chariot: '車',
    cannon: '包',
    soldier: '卒',
  },
  han: {
    king: '漢',
    advisor: '士',
    elephant: '象',
    horse: '馬',
    chariot: '車',
    cannon: '砲',
    soldier: '兵',
  },
}

/** Material values for evaluation and display */
export const PIECE_VALUES: Record<PieceType, number> = {
  king: 20000,
  chariot: 1300,
  cannon: 700,
  horse: 500,
  elephant: 300,
  advisor: 300,
  soldier: 200,
}

/**
 * Create initial board with given formations.
 *
 * Standard Janggi board layout (Han=top, rows 0-2; Cho=bottom, rows 7-9):
 *
 * Row 0: 車 馬 象 士 · 士 象 馬 車  (Han back rank - 상마 varies)
 * Row 1: · · · · 漢 · · · ·          (Han king)
 * Row 2: · 砲 · · · · · 砲 ·          (Han cannons)
 * Row 3: 兵 · 兵 · 兵 · 兵 · 兵      (Han soldiers)
 * Row 4: · · · · · · · · ·            (River)
 * Row 5: · · · · · · · · ·            (River)
 * Row 6: 卒 · 卒 · 卒 · 卒 · 卒      (Cho soldiers)
 * Row 7: · 包 · · · · · 包 ·          (Cho cannons)
 * Row 8: · · · · 楚 · · · ·          (Cho king)
 * Row 9: 車 馬 象 士 · 士 象 馬 車  (Cho back rank - 상마 varies)
 */

type FormPieces = { col: number; type: PieceType }[]

/**
 * Get back-rank piece layout for a given formation.
 * Chariots and advisors are fixed; elephant/horse positions vary.
 */
function getFormationPieces(formation: Formation): FormPieces {
  switch (formation) {
    case 'inner': // 車馬象士_士象馬車
      return [
        { col: 0, type: 'chariot' },
        { col: 1, type: 'horse' },
        { col: 2, type: 'elephant' },
        { col: 3, type: 'advisor' },
        { col: 5, type: 'advisor' },
        { col: 6, type: 'elephant' },
        { col: 7, type: 'horse' },
        { col: 8, type: 'chariot' },
      ]
    case 'outer': // 車象馬士_士馬象車
      return [
        { col: 0, type: 'chariot' },
        { col: 1, type: 'elephant' },
        { col: 2, type: 'horse' },
        { col: 3, type: 'advisor' },
        { col: 5, type: 'advisor' },
        { col: 6, type: 'horse' },
        { col: 7, type: 'elephant' },
        { col: 8, type: 'chariot' },
      ]
    case 'left': // 車象馬士_士象馬車
      return [
        { col: 0, type: 'chariot' },
        { col: 1, type: 'elephant' },
        { col: 2, type: 'horse' },
        { col: 3, type: 'advisor' },
        { col: 5, type: 'advisor' },
        { col: 6, type: 'elephant' },
        { col: 7, type: 'horse' },
        { col: 8, type: 'chariot' },
      ]
    case 'right': // 車馬象士_士馬象車
      return [
        { col: 0, type: 'chariot' },
        { col: 1, type: 'horse' },
        { col: 2, type: 'elephant' },
        { col: 3, type: 'advisor' },
        { col: 5, type: 'advisor' },
        { col: 6, type: 'horse' },
        { col: 7, type: 'elephant' },
        { col: 8, type: 'chariot' },
      ]
  }
}

export function createInitialBoard(choFormation: Formation, hanFormation: Formation): BoardState {
  const board: BoardState = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => null),
  )

  const place = (row: number, col: number, type: PieceType, player: Player) => {
    board[row][col] = { type, player }
  }

  // Han (top, red) - back rank row 0
  const hanPieces = getFormationPieces(hanFormation)
  for (const p of hanPieces) {
    place(0, p.col, p.type, 'han')
  }
  // Han king at row 1, col 4
  place(1, 4, 'king', 'han')
  // Han cannons at row 2
  place(2, 1, 'cannon', 'han')
  place(2, 7, 'cannon', 'han')
  // Han soldiers at row 3
  for (let c = 0; c <= 8; c += 2) {
    place(3, c, 'soldier', 'han')
  }

  // Cho (bottom, blue) - back rank row 9
  const choPieces = getFormationPieces(choFormation)
  for (const p of choPieces) {
    place(9, p.col, p.type, 'cho')
  }
  // Cho king at row 8, col 4
  place(8, 4, 'king', 'cho')
  // Cho cannons at row 7
  place(7, 1, 'cannon', 'cho')
  place(7, 7, 'cannon', 'cho')
  // Cho soldiers at row 6
  for (let c = 0; c <= 8; c += 2) {
    place(6, c, 'soldier', 'cho')
  }

  return board
}
