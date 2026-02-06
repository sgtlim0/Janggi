import { useState, useCallback, useRef, useEffect } from 'react'
import { JanggiGame } from '../game/JanggiGame.ts'
import { posEqual } from '../game/board.ts'
import type {
  GameConfig,
  GameState,
  Position,
  Player,
  AiWorkerMessage,
  AiWorkerResponse,
} from '../types/index.ts'

const DIFFICULTY_DEPTH: Record<string, number> = {
  easy: 2,
  medium: 3,
  hard: 4,
}

function createInitialState(): GameState {
  return {
    board: [],
    turn: 'cho',
    isCheck: false,
    isGameOver: false,
    result: null,
    moveHistory: [],
    capturedPieces: { cho: [], han: [] },
    selectedPosition: null,
    legalMoves: [],
    lastMove: null,
    isAiThinking: false,
    isBikjang: false,
  }
}

export function useJanggiGame() {
  const gameRef = useRef<JanggiGame>(new JanggiGame())
  const workerRef = useRef<Worker | null>(null)
  const [gameState, setGameState] = useState<GameState>(createInitialState)
  const [config, setConfig] = useState<GameConfig | null>(null)
  const configRef = useRef<GameConfig | null>(null)

  const syncState = useCallback((
    overrides?: Partial<Pick<GameState, 'selectedPosition' | 'legalMoves' | 'lastMove' | 'isAiThinking'>>,
  ) => {
    const game = gameRef.current
    const history = game.getMoveHistory()
    const lastMoveRecord = history.length > 0 ? history[history.length - 1] : null

    setGameState({
      board: game.getBoard(),
      turn: game.getTurn(),
      isCheck: game.isCheck(),
      isGameOver: game.isGameOver(),
      result: game.getResult(),
      moveHistory: history,
      capturedPieces: game.getCapturedPieces(),
      selectedPosition: overrides?.selectedPosition ?? null,
      legalMoves: overrides?.legalMoves ?? [],
      lastMove: overrides?.lastMove ?? (
        lastMoveRecord && !lastMoveRecord.isPass
          ? { from: lastMoveRecord.from, to: lastMoveRecord.to }
          : null
      ),
      isAiThinking: overrides?.isAiThinking ?? false,
      isBikjang: game.isBikjang(),
    })
  }, [])

  const triggerAi = useCallback(() => {
    const cfg = configRef.current
    if (!cfg || cfg.mode !== 'ai') return

    const game = gameRef.current
    if (game.isGameOver()) return
    if (game.getTurn() === cfg.playerSide) return

    setGameState(prev => ({ ...prev, isAiThinking: true }))

    if (workerRef.current) {
      workerRef.current.terminate()
    }

    const worker = new Worker(
      new URL('../engine/ai.worker.ts', import.meta.url),
      { type: 'module' },
    )
    workerRef.current = worker

    worker.onmessage = (e: MessageEvent<AiWorkerResponse>) => {
      const { from, to, isPass } = e.data
      const game = gameRef.current

      if (isPass) {
        game.pass()
      } else {
        game.makeMove(from, to)
      }

      const history = game.getMoveHistory()
      const lastMoveRecord = history.length > 0 ? history[history.length - 1] : null
      const lastMoveData = lastMoveRecord && !lastMoveRecord.isPass
        ? { from: lastMoveRecord.from, to: lastMoveRecord.to }
        : null

      syncState({ lastMove: lastMoveData, isAiThinking: false })
      worker.terminate()
      workerRef.current = null
    }

    const msg: AiWorkerMessage = {
      type: 'search',
      board: game.getBoard(),
      turn: game.getTurn(),
      depth: DIFFICULTY_DEPTH[cfg.difficulty] ?? 3,
      moveHistory: game.getMoveHistory(),
    }
    worker.postMessage(msg)
  }, [syncState])

  const startGame = useCallback((newConfig: GameConfig) => {
    gameRef.current = new JanggiGame(newConfig.choFormation, newConfig.hanFormation)
    configRef.current = newConfig
    setConfig(newConfig)
    syncState()

    // If AI plays cho (first player), trigger AI move
    if (newConfig.mode === 'ai' && newConfig.playerSide !== 'cho') {
      setTimeout(() => triggerAi(), 100)
    }
  }, [syncState, triggerAi])

  const selectPosition = useCallback((pos: Position) => {
    const game = gameRef.current
    const cfg = configRef.current

    if (game.isGameOver()) return
    if (gameState.isAiThinking) return

    // In AI mode, only allow moves on player's turn
    if (cfg?.mode === 'ai' && game.getTurn() !== cfg.playerSide) return

    const piece = game.getBoard()[pos.row][pos.col]

    // If a piece is already selected
    if (gameState.selectedPosition) {
      // Clicking same square -> deselect
      if (posEqual(gameState.selectedPosition, pos)) {
        syncState({ lastMove: gameState.lastMove })
        return
      }

      // Clicking own piece -> reselect
      if (piece && piece.player === game.getTurn()) {
        const moves = game.getLegalMovesFor(pos)
        syncState({
          selectedPosition: pos,
          legalMoves: moves,
          lastMove: gameState.lastMove,
        })
        return
      }

      // Try to make the move
      const from = gameState.selectedPosition
      const result = game.makeMove(from, pos)

      if (result) {
        const history = game.getMoveHistory()
        const lastMoveRecord = history[history.length - 1]
        const lastMoveData = lastMoveRecord && !lastMoveRecord.isPass
          ? { from: lastMoveRecord.from, to: lastMoveRecord.to }
          : null
        syncState({ lastMove: lastMoveData })

        // Trigger AI
        if (cfg?.mode === 'ai' && !game.isGameOver()) {
          setTimeout(() => triggerAi(), 200)
        }
      } else {
        syncState({ lastMove: gameState.lastMove })
      }
      return
    }

    // No piece selected -> select own piece
    if (piece && piece.player === game.getTurn()) {
      const moves = game.getLegalMovesFor(pos)
      syncState({
        selectedPosition: pos,
        legalMoves: moves,
        lastMove: gameState.lastMove,
      })
    }
  }, [gameState.selectedPosition, gameState.lastMove, gameState.isAiThinking, syncState, triggerAi])

  const pass = useCallback(() => {
    const game = gameRef.current
    const cfg = configRef.current
    if (gameState.isAiThinking) return

    const success = game.pass()
    if (success) {
      syncState()
      if (cfg?.mode === 'ai' && !game.isGameOver()) {
        setTimeout(() => triggerAi(), 200)
      }
    }
  }, [gameState.isAiThinking, syncState, triggerAi])

  const undo = useCallback(() => {
    const game = gameRef.current
    const cfg = configRef.current
    if (gameState.isAiThinking) return

    if (cfg?.mode === 'ai') {
      // Undo both AI and player moves
      game.undo()
      game.undo()
    } else {
      game.undo()
    }
    syncState()
  }, [gameState.isAiThinking, syncState])

  const resign = useCallback(() => {
    const game = gameRef.current
    const cfg = configRef.current
    const player: Player = cfg?.mode === 'ai' ? cfg.playerSide : game.getTurn()
    game.resign(player)
    syncState()
  }, [syncState])

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      workerRef.current?.terminate()
    }
  }, [])

  return {
    gameState,
    config,
    startGame,
    selectPosition,
    pass,
    undo,
    resign,
  }
}
