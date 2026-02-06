import { useRef, useEffect } from 'react'
import type { MoveRecord } from '../../types/index.ts'
import styles from './MoveHistory.module.css'

interface MoveHistoryProps {
  moves: MoveRecord[]
}

export function MoveHistory({ moves }: MoveHistoryProps) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [moves.length])

  return (
    <div className={styles.moveHistory}>
      <div className={styles.header}>기보</div>
      <div className={styles.list} ref={listRef}>
        {moves.length === 0 && (
          <div className={styles.empty}>아직 수가 없습니다</div>
        )}
        {moves.map((move, idx) => {
          const moveNumber = Math.floor(idx / 2) + 1
          const isChoMove = idx % 2 === 0
          const playerColor = isChoMove ? '#3b82f6' : '#ef4444'

          return (
            <div key={idx} className={styles.move}>
              {isChoMove && (
                <span className={styles.moveNumber}>{moveNumber}.</span>
              )}
              <span className={styles.notation} style={{ color: playerColor }}>
                {move.notation}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
