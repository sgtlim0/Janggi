import { useState } from 'react'
import { useJanggiGame } from './hooks/useJanggiGame.ts'
import { Board } from './components/Board/Board.tsx'
import { GameInfo } from './components/GameInfo/GameInfo.tsx'
import { MoveHistory } from './components/MoveHistory/MoveHistory.tsx'
import { CapturedPieces } from './components/CapturedPieces/CapturedPieces.tsx'
import { GameControls } from './components/GameControls/GameControls.tsx'
import { NewGameModal } from './components/NewGameModal/NewGameModal.tsx'
import type { GameConfig } from './types/index.ts'
import styles from './App.module.css'

export default function App() {
  const { gameState, config, startGame, selectPosition, pass, undo, resign } = useJanggiGame()
  const [showNewGame, setShowNewGame] = useState(true)

  const handleStartGame = (newConfig: GameConfig) => {
    startGame(newConfig)
    setShowNewGame(false)
  }

  const handleNewGame = () => {
    setShowNewGame(true)
  }

  const flipped = config?.mode === 'ai' && config.playerSide === 'han'

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>장기</h1>
        <span className={styles.subtitle}>Janggi</span>
      </header>

      <div className={styles.layout}>
        <div className={styles.leftPanel}>
          <CapturedPieces pieces={gameState.capturedPieces} />
        </div>

        <div className={styles.centerPanel}>
          <Board
            gameState={gameState}
            flipped={flipped}
            onIntersectionClick={selectPosition}
          />
        </div>

        <div className={styles.rightPanel}>
          <GameInfo gameState={gameState} config={config} />
          <MoveHistory moves={gameState.moveHistory} />
          <GameControls
            gameState={gameState}
            onNewGame={handleNewGame}
            onUndo={undo}
            onPass={pass}
            onResign={resign}
          />
        </div>
      </div>

      {showNewGame && (
        <NewGameModal onStart={handleStartGame} />
      )}
    </div>
  )
}
