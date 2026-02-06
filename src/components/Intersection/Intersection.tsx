import type { ReactNode } from 'react'
import styles from './Intersection.module.css'

interface IntersectionProps {
  isSelected: boolean
  isLegalMove: boolean
  isLastMove: boolean
  isCheck: boolean
  hasPiece: boolean
  isCapture: boolean
  onClick: () => void
  children?: ReactNode
}

export function Intersection({
  isSelected,
  isLegalMove,
  isLastMove,
  isCheck,
  hasPiece,
  isCapture,
  onClick,
  children,
}: IntersectionProps) {
  const classNames = [
    styles.intersection,
    isSelected && styles.selected,
    isLastMove && styles.lastMove,
    isCheck && styles.check,
  ].filter(Boolean).join(' ')

  return (
    <div className={classNames} onClick={onClick}>
      {children}
      {isLegalMove && !hasPiece && (
        <div className={styles.legalMoveDot} />
      )}
      {isLegalMove && hasPiece && isCapture && (
        <div className={styles.captureRing} />
      )}
    </div>
  )
}
