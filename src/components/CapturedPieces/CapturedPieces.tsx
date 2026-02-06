import type { Piece } from '../../types/index.ts'
import { Piece as PieceComponent } from '../Piece/Piece.tsx'
import { PIECE_VALUES } from '../../game/constants.ts'
import styles from './CapturedPieces.module.css'

interface CapturedPiecesProps {
  pieces: { cho: Piece[]; han: Piece[] }
}

export function CapturedPieces({ pieces }: CapturedPiecesProps) {
  const choScore = pieces.han.reduce((sum, p) => sum + (PIECE_VALUES[p.type] ?? 0), 0)
  const hanScore = pieces.cho.reduce((sum, p) => sum + (PIECE_VALUES[p.type] ?? 0), 0)
  const diff = choScore - hanScore

  return (
    <div className={styles.captured}>
      <div className={styles.section}>
        <div className={styles.header}>
          <span className={styles.label} style={{ color: '#3b82f6' }}>초 (楚)</span>
          {diff > 0 && <span className={styles.scoreDiff}>+{diff}</span>}
        </div>
        <div className={styles.pieces}>
          {pieces.han.map((p, i) => (
            <div key={i} className={styles.piece}>
              <PieceComponent type={p.type} player={p.player} size={28} />
            </div>
          ))}
        </div>
      </div>
      <div className={styles.section}>
        <div className={styles.header}>
          <span className={styles.label} style={{ color: '#ef4444' }}>한 (漢)</span>
          {diff < 0 && <span className={styles.scoreDiff}>+{-diff}</span>}
        </div>
        <div className={styles.pieces}>
          {pieces.cho.map((p, i) => (
            <div key={i} className={styles.piece}>
              <PieceComponent type={p.type} player={p.player} size={28} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
