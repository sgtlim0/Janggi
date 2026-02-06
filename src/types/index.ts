export interface Position {
  row: number // 0-9 (top to bottom)
  col: number // 0-8 (left to right)
}

export type Player = 'cho' | 'han'

export type PieceType =
  | 'king'
  | 'advisor'
  | 'elephant'
  | 'horse'
  | 'chariot'
  | 'cannon'
  | 'soldier'

export interface Piece {
  readonly type: PieceType
  readonly player: Player
}

/** 10 rows x 9 cols, null = empty intersection */
export type BoardState = (Piece | null)[][]

/** 상마 배치 (elephant-horse formation) */
export type Formation = 'inner' | 'outer' | 'left' | 'right'

export interface Move {
  readonly from: Position
  readonly to: Position
  readonly piece: Piece
  readonly captured: Piece | null
  readonly isPass: boolean
}

export interface MoveRecord {
  readonly from: Position
  readonly to: Position
  readonly piece: Piece
  readonly captured: Piece | null
  readonly isPass: boolean
  readonly notation: string
}

export type GameMode = 'ai' | 'local'
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface GameConfig {
  readonly mode: GameMode
  readonly difficulty: Difficulty
  readonly playerSide: Player
  readonly choFormation: Formation
  readonly hanFormation: Formation
}

export type GameResult =
  | { winner: Player; reason: 'checkmate' | 'resign' }
  | { winner: null; reason: 'bikjang' }

export interface GameState {
  readonly board: BoardState
  readonly turn: Player
  readonly isCheck: boolean
  readonly isGameOver: boolean
  readonly result: GameResult | null
  readonly moveHistory: MoveRecord[]
  readonly capturedPieces: { cho: Piece[]; han: Piece[] }
  readonly selectedPosition: Position | null
  readonly legalMoves: Position[]
  readonly lastMove: { from: Position; to: Position } | null
  readonly isAiThinking: boolean
  readonly isBikjang: boolean
}

export interface AiWorkerMessage {
  readonly type: 'search'
  readonly board: BoardState
  readonly turn: Player
  readonly depth: number
  readonly moveHistory: MoveRecord[]
}

export interface AiWorkerResponse {
  readonly type: 'result'
  readonly from: Position
  readonly to: Position
  readonly isPass: boolean
}

export interface SerializedGameState {
  readonly board: BoardState
  readonly turn: Player
  readonly moveHistory: MoveRecord[]
}
