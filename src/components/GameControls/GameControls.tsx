import type { GameState } from '../../types/index.ts'
import styles from './GameControls.module.css'

interface GameControlsProps {
  gameState: GameState
  onNewGame: () => void
  onUndo: () => void
  onPass: () => void
  onResign: () => void
}

export function GameControls({ gameState, onNewGame, onUndo, onPass, onResign }: GameControlsProps) {
  const canUndo = gameState.moveHistory.length > 0 && !gameState.isAiThinking && !gameState.isGameOver
  const canPass = !gameState.isCheck && !gameState.isAiThinking && !gameState.isGameOver
  const canResign = !gameState.isAiThinking && !gameState.isGameOver

  return (
    <div className={styles.controls}>
      <button className={styles.btnPrimary} onClick={onNewGame}>
        새 게임
      </button>
      <button className={styles.btnSecondary} onClick={onUndo} disabled={!canUndo}>
        무르기
      </button>
      <button className={styles.btnSecondary} onClick={onPass} disabled={!canPass}>
        패스
      </button>
      <button className={styles.btnDanger} onClick={onResign} disabled={!canResign}>
        항복
      </button>
    </div>
  )
}
