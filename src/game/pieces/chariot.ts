import type { BoardState, Position, Player } from '../../types/index.ts'
import { isInBounds, getPieceAt, isInAnyPalace } from '../board.ts'
import { PALACE_DIAGONALS } from '../constants.ts'

/**
 * Chariot (車) moves: unlimited orthogonal sliding + palace diagonal sliding
 */
export function getChariotMoves(board: BoardState, pos: Position, player: Player): Position[] {
  const moves: Position[] = []

  // Orthogonal sliding in 4 directions
  const directions: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]]

  for (const [dr, dc] of directions) {
    let r = pos.row + dr
    let c = pos.col + dc
    while (isInBounds({ row: r, col: c })) {
      const target: Position = { row: r, col: c }
      const piece = getPieceAt(board, target)
      if (piece) {
        if (piece.player !== player) {
          moves.push(target) // capture
        }
        break
      }
      moves.push(target)
      r += dr
      c += dc
    }
  }

  // Palace diagonal sliding (only if chariot is inside a palace)
  if (isInAnyPalace(pos)) {
    addPalaceDiagonalSlides(board, pos, player, moves)
  }

  return moves
}

function addPalaceDiagonalSlides(
  board: BoardState,
  pos: Position,
  player: Player,
  moves: Position[],
): void {
  // From current position, slide along palace diagonals
  const visited = new Set<string>()
  visited.add(`${pos.row},${pos.col}`)

  function slide(current: Position): void {
    const diags = PALACE_DIAGONALS.get(`${current.row},${current.col}`) ?? []
    for (const next of diags) {
      const key = `${next.row},${next.col}`
      if (visited.has(key)) continue

      // Must be moving in a consistent diagonal direction from original pos
      const dr = next.row - current.row
      const dc = next.col - current.col
      // Verify this is along the same diagonal from pos
      const fromDr = next.row - pos.row
      const fromDc = next.col - pos.col
      if (fromDr !== 0 && fromDc !== 0 && Math.abs(fromDr) !== Math.abs(fromDc)) continue
      // Must be moving consistently away
      if (pos.row !== current.row || pos.col !== current.col) {
        const origDr = current.row - pos.row
        const origDc = current.col - pos.col
        if (Math.sign(dr) !== Math.sign(origDr) || Math.sign(dc) !== Math.sign(origDc)) continue
      }

      visited.add(key)
      const piece = getPieceAt(board, next)
      if (piece) {
        if (piece.player !== player) {
          moves.push(next) // capture
        }
        // blocked, don't continue
      } else {
        moves.push(next)
        slide(next) // continue sliding
      }
    }
  }

  slide(pos)
}
