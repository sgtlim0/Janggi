import type { BoardState, Position, Player } from '../../types/index.ts'
import { isInBounds, getPieceAt, isInAnyPalace } from '../board.ts'
import { PALACE_DIAGONALS } from '../constants.ts'

/**
 * Cannon (砲/包) moves: Must jump exactly 1 piece (mount/포대) to move or capture.
 * - Cannot use another cannon as a mount
 * - Cannot capture another cannon
 * - Applies to orthogonal lines and palace diagonals
 */
export function getCannonMoves(board: BoardState, pos: Position, player: Player): Position[] {
  const moves: Position[] = []

  // Orthogonal directions
  const directions: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]]

  for (const [dr, dc] of directions) {
    let r = pos.row + dr
    let c = pos.col + dc
    let foundMount = false

    while (isInBounds({ row: r, col: c })) {
      const target: Position = { row: r, col: c }
      const piece = getPieceAt(board, target)

      if (!foundMount) {
        // Looking for the mount piece
        if (piece) {
          // Cannot use a cannon as mount
          if (piece.type === 'cannon') break
          foundMount = true
        }
      } else {
        // After the mount, can land or capture
        if (piece) {
          // Cannot capture a cannon
          if (piece.type === 'cannon') break
          if (piece.player !== player) {
            moves.push(target) // capture
          }
          break // blocked after first piece beyond mount
        }
        moves.push(target)
      }

      r += dr
      c += dc
    }
  }

  // Palace diagonal cannon movement
  if (isInAnyPalace(pos)) {
    addPalaceDiagonalCannonMoves(board, pos, player, moves)
  }

  return moves
}

function addPalaceDiagonalCannonMoves(
  board: BoardState,
  pos: Position,
  player: Player,
  moves: Position[],
): void {
  // Cannon can jump along palace diagonals too
  // From corner → center → opposite corner (or center → corner)
  // We need to trace diagonals and find exactly 1 mount piece

  const visited = new Set<string>()
  visited.add(`${pos.row},${pos.col}`)

  // Trace each diagonal direction from pos
  function traceDiag(current: Position, foundMount: boolean, dirRow: number, dirCol: number): void {
    const diags = PALACE_DIAGONALS.get(`${current.row},${current.col}`) ?? []
    for (const next of diags) {
      const key = `${next.row},${next.col}`
      if (visited.has(key)) continue

      const dr = next.row - current.row
      const dc = next.col - current.col
      // Must continue in the same diagonal direction
      if (dirRow !== 0 && Math.sign(dr) !== Math.sign(dirRow)) continue
      if (dirCol !== 0 && Math.sign(dc) !== Math.sign(dirCol)) continue

      visited.add(key)
      const piece = getPieceAt(board, next)

      if (!foundMount) {
        if (piece) {
          if (piece.type === 'cannon') return // can't use cannon as mount
          traceDiag(next, true, dr, dc)
        } else {
          traceDiag(next, false, dr, dc)
        }
      } else {
        if (piece) {
          if (piece.type === 'cannon') return
          if (piece.player !== player) {
            moves.push(next)
          }
          return // blocked
        }
        moves.push(next)
        traceDiag(next, true, dr, dc)
      }
    }
  }

  // Start tracing in each diagonal direction from pos
  const diags = PALACE_DIAGONALS.get(`${pos.row},${pos.col}`) ?? []
  for (const next of diags) {
    const dr = next.row - pos.row
    const dc = next.col - pos.col
    const key = `${next.row},${next.col}`
    visited.add(key)
    const piece = getPieceAt(board, next)
    if (piece) {
      if (piece.type === 'cannon') {
        visited.delete(key)
        continue
      }
      // This piece is the mount
      traceDiag(next, true, dr, dc)
    } else {
      traceDiag(next, false, dr, dc)
    }
    visited.delete(key)
  }
}
