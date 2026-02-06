import type {
  BoardState,
  Position,
  Player,
  Piece,
  Move,
  MoveRecord,
  Formation,
  GameResult,
  SerializedGameState,
} from '../types/index.ts'
import { createInitialBoard } from './constants.ts'
import { cloneBoard, applyMove, getPieceAt, opponent, findKing, moveNotation } from './board.ts'
import { getLegalMoves, getAllLegalMoves, isInCheck } from './moves.ts'
import { checkBikjang, isCheckmate } from './rules.ts'

export class JanggiGame {
  private board: BoardState
  private turn: Player
  private moveHistory: MoveRecord[]
  private boardHistory: BoardState[]
  private capturedCho: Piece[]
  private capturedHan: Piece[]
  private gameOver: boolean
  private result: GameResult | null

  constructor(choFormation: Formation = 'inner', hanFormation: Formation = 'inner') {
    this.board = createInitialBoard(choFormation, hanFormation)
    this.turn = 'cho' // 초 goes first
    this.moveHistory = []
    this.boardHistory = [cloneBoard(this.board)]
    this.capturedCho = []
    this.capturedHan = []
    this.gameOver = false
    this.result = null
  }

  getBoard(): BoardState {
    return this.board
  }

  getTurn(): Player {
    return this.turn
  }

  getMoveHistory(): MoveRecord[] {
    return this.moveHistory
  }

  getCapturedPieces(): { cho: Piece[]; han: Piece[] } {
    return { cho: this.capturedCho, han: this.capturedHan }
  }

  isGameOver(): boolean {
    return this.gameOver
  }

  getResult(): GameResult | null {
    return this.result
  }

  isCheck(): boolean {
    return isInCheck(this.board, this.turn)
  }

  isBikjang(): boolean {
    return checkBikjang(this.board)
  }

  isCheckmate(): boolean {
    return isCheckmate(this.board, this.turn)
  }

  getLegalMovesFor(pos: Position): Position[] {
    if (this.gameOver) return []
    const piece = getPieceAt(this.board, pos)
    if (!piece || piece.player !== this.turn) return []
    return getLegalMoves(this.board, pos, this.turn)
  }

  getAllMoves(): { from: Position; to: Position }[] {
    if (this.gameOver) return []
    return getAllLegalMoves(this.board, this.turn)
  }

  /** Make a move. Returns the Move if successful, null otherwise. */
  makeMove(from: Position, to: Position): Move | null {
    if (this.gameOver) return null

    const piece = getPieceAt(this.board, from)
    if (!piece || piece.player !== this.turn) return null

    const legalMoves = getLegalMoves(this.board, from, this.turn)
    if (!legalMoves.some(m => m.row === to.row && m.col === to.col)) return null

    const captured = getPieceAt(this.board, to)

    // Apply the move
    this.board = applyMove(this.board, from, to)
    this.boardHistory.push(cloneBoard(this.board))

    // Record captured piece
    if (captured) {
      if (captured.player === 'cho') {
        this.capturedCho = [...this.capturedCho, captured]
      } else {
        this.capturedHan = [...this.capturedHan, captured]
      }
    }

    const move: Move = { from, to, piece, captured, isPass: false }
    const notation = moveNotation(piece.type, piece.player, from, to, captured, false)
    this.moveHistory = [...this.moveHistory, { ...move, notation }]

    // Switch turn
    this.turn = opponent(this.turn)

    // Check game-ending conditions
    this.checkGameEnd()

    return move
  }

  /** Pass the turn (allowed in Janggi unless in check) */
  pass(): boolean {
    if (this.gameOver) return false
    if (isInCheck(this.board, this.turn)) return false // can't pass while in check

    const passPiece: Piece = { type: 'king', player: this.turn }
    const kingPos = findKing(this.board, this.turn) ?? { row: 0, col: 0 }

    const record: MoveRecord = {
      from: kingPos,
      to: kingPos,
      piece: passPiece,
      captured: null,
      isPass: true,
      notation: '패스',
    }
    this.moveHistory = [...this.moveHistory, record]
    this.boardHistory.push(cloneBoard(this.board))

    this.turn = opponent(this.turn)
    this.checkGameEnd()

    return true
  }

  /** Undo the last move */
  undo(): boolean {
    if (this.moveHistory.length === 0) return false

    const lastMove = this.moveHistory[this.moveHistory.length - 1]

    // Remove last board state
    this.boardHistory.pop()
    this.board = cloneBoard(this.boardHistory[this.boardHistory.length - 1])

    // Remove captured piece if any
    if (lastMove.captured) {
      if (lastMove.captured.player === 'cho') {
        this.capturedCho = this.capturedCho.slice(0, -1)
      } else {
        this.capturedHan = this.capturedHan.slice(0, -1)
      }
    }

    this.moveHistory = this.moveHistory.slice(0, -1)
    this.turn = opponent(this.turn)
    this.gameOver = false
    this.result = null

    return true
  }

  /** Resign */
  resign(player: Player): void {
    this.gameOver = true
    this.result = { winner: opponent(player), reason: 'resign' }
  }

  private checkGameEnd(): void {
    // Check for checkmate
    if (isCheckmate(this.board, this.turn)) {
      this.gameOver = true
      this.result = { winner: opponent(this.turn), reason: 'checkmate' }
      return
    }

    // Check for bikjang
    if (checkBikjang(this.board)) {
      // Bikjang: the player who created the bikjang position offers a draw
      // For simplicity, we auto-draw when bikjang occurs
      this.gameOver = true
      this.result = { winner: null, reason: 'bikjang' }
    }
  }

  /** Serialize for AI worker communication */
  serialize(): SerializedGameState {
    return {
      board: this.board,
      turn: this.turn,
      moveHistory: this.moveHistory,
    }
  }

  /** Create a game from serialized state */
  static fromSerialized(state: SerializedGameState): JanggiGame {
    const game = new JanggiGame()
    game.board = state.board.map(row => [...row])
    game.turn = state.turn
    game.moveHistory = [...state.moveHistory]
    game.boardHistory = [cloneBoard(game.board)]

    // Reconstruct captured pieces from move history
    game.capturedCho = []
    game.capturedHan = []
    for (const move of state.moveHistory) {
      if (move.captured) {
        if (move.captured.player === 'cho') {
          game.capturedCho.push(move.captured)
        } else {
          game.capturedHan.push(move.captured)
        }
      }
    }

    return game
  }
}
