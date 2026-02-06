import type { GameState, GameConfig } from '../../types/index.ts'
import styles from './GameInfo.module.css'

interface GameInfoProps {
  gameState: GameState
  config: GameConfig | null
}

export function GameInfo({ gameState, config }: GameInfoProps) {
  const turnLabel = gameState.turn === 'cho' ? '초 (楚)' : '한 (漢)'
  const turnColor = gameState.turn === 'cho' ? '#3b82f6' : '#ef4444'

  let statusText = ''
  if (gameState.isGameOver && gameState.result) {
    if (gameState.result.winner) {
      const winnerLabel = gameState.result.winner === 'cho' ? '초 (楚)' : '한 (漢)'
      const reasonLabel = gameState.result.reason === 'checkmate' ? '외통수' : '항복'
      statusText = `${winnerLabel} 승리! (${reasonLabel})`
    } else {
      statusText = '무승부 (빅장)'
    }
  } else if (gameState.isBikjang) {
    statusText = '빅장!'
  } else if (gameState.isCheck) {
    statusText = '장군!'
  }

  const modeLabel = config?.mode === 'ai'
    ? `AI 대전 (${config.difficulty === 'easy' ? '쉬움' : config.difficulty === 'medium' ? '보통' : '어려움'})`
    : '로컬 대전'

  return (
    <div className={styles.gameInfo}>
      <div className={styles.mode}>{modeLabel}</div>
      <div className={styles.turnRow}>
        <div className={styles.turnLabel}>차례</div>
        <div className={styles.turnValue} style={{ color: turnColor }}>
          {turnLabel}
        </div>
      </div>
      {gameState.isAiThinking && (
        <div className={styles.thinking}>AI 생각 중...</div>
      )}
      {statusText && (
        <div className={`${styles.status} ${gameState.isGameOver ? styles.gameOver : ''}`}>
          {statusText}
        </div>
      )}
    </div>
  )
}
