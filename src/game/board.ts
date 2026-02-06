import type { BoardState, Piece, Position, Player, PieceType } from '../types/index.ts'
import { ROWS, COLS, PALACE } from './constants.ts'

export function cloneBoard(board: BoardState): BoardState {
  return board.map(row => [...row])
}

export function getPieceAt(board: BoardState, pos: Position): Piece | null {
  return board[pos.row][pos.col]
}

export function isInBounds(pos: Position): boolean {
  return pos.row >= 0 && pos.row < ROWS && pos.col >= 0 && pos.col < COLS
}

export function isInPalace(pos: Position, player: Player): boolean {
  const p = PALACE[player]
  return pos.row >= p.rowMin && pos.row <= p.rowMax && pos.col >= p.colMin && pos.col <= p.colMax
}

export function isInAnyPalace(pos: Position): boolean {
  return isInPalace(pos, 'han') || isInPalace(pos, 'cho')
}

export function whichPalace(pos: Position): Player | null {
  if (isInPalace(pos, 'han')) return 'han'
  if (isInPalace(pos, 'cho')) return 'cho'
  return null
}

export function applyMove(board: BoardState, from: Position, to: Position): BoardState {
  const newBoard = cloneBoard(board)
  newBoard[to.row][to.col] = newBoard[from.row][from.col]
  newBoard[from.row][from.col] = null
  return newBoard
}

export function findKing(board: BoardState, player: Player): Position | null {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const piece = board[row][col]
      if (piece && piece.type === 'king' && piece.player === player) {
        return { row, col }
      }
    }
  }
  return null
}

export function findAllPieces(board: BoardState, player: Player): { pos: Position; piece: Piece }[] {
  const result: { pos: Position; piece: Piece }[] = []
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const piece = board[row][col]
      if (piece && piece.player === player) {
        result.push({ pos: { row, col }, piece })
      }
    }
  }
  return result
}

export function opponent(player: Player): Player {
  return player === 'cho' ? 'han' : 'cho'
}

export function posKey(pos: Position): string {
  return `${pos.row},${pos.col}`
}

export function posEqual(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col
}

export function serializeBoard(board: BoardState): string {
  return JSON.stringify(board)
}

export function deserializeBoard(str: string): BoardState {
  return JSON.parse(str) as BoardState
}

/** Notation for a move, e.g. "車(0,0)→(0,4)" */
export function moveNotation(
  pieceType: PieceType,
  player: Player,
  from: Position,
  to: Position,
  captured: Piece | null,
  isPass: boolean,
): string {
  if (isPass) return '패스'
  const pieceNames: Record<PieceType, string> = {
    king: '왕',
    advisor: '사',
    elephant: '상',
    horse: '마',
    chariot: '차',
    cannon: '포',
    soldier: player === 'cho' ? '졸' : '병',
  }
  const cap = captured ? 'x' : '→'
  const name = pieceNames[pieceType]
  return `${name}(${from.col},${from.row})${cap}(${to.col},${to.row})`
}
