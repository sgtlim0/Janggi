import { useMemo } from 'react'
import { Intersection } from '../Intersection/Intersection.tsx'
import { Piece } from '../Piece/Piece.tsx'
import type { GameState, Position } from '../../types/index.ts'
import styles from './Board.module.css'

interface BoardProps {
  gameState: GameState
  flipped: boolean
  onIntersectionClick: (pos: Position) => void
}

export function Board({ gameState, flipped, onIntersectionClick }: BoardProps) {
  const { board, selectedPosition, legalMoves, lastMove, isCheck, turn } = gameState

  const intersections = useMemo(() => {
    const elements: React.ReactElement[] = []

    for (let displayRow = 0; displayRow < 10; displayRow++) {
      for (let displayCol = 0; displayCol < 9; displayCol++) {
        const row = flipped ? 9 - displayRow : displayRow
        const col = flipped ? 8 - displayCol : displayCol
        const pos: Position = { row, col }
        const piece = board[row]?.[col] ?? null

        const isSelected = selectedPosition !== null &&
          selectedPosition.row === row && selectedPosition.col === col
        const isLegalMove = legalMoves.some(m => m.row === row && m.col === col)
        const isLastMoveSquare = lastMove !== null && (
          (lastMove.from.row === row && lastMove.from.col === col) ||
          (lastMove.to.row === row && lastMove.to.col === col)
        )
        const isCheckSquare = isCheck && piece?.type === 'king' && piece.player === turn
        const isCapture = isLegalMove && piece !== null && piece.player !== turn

        elements.push(
          <Intersection
            key={`${row}-${col}`}
            isSelected={isSelected}
            isLegalMove={isLegalMove}
            isLastMove={isLastMoveSquare}
            isCheck={isCheckSquare}
            hasPiece={piece !== null}
            isCapture={isCapture}
            onClick={() => onIntersectionClick(pos)}
          >
            {piece && <Piece type={piece.type} player={piece.player} />}
          </Intersection>,
        )
      }
    }

    return elements
  }, [board, selectedPosition, legalMoves, lastMove, isCheck, turn, flipped, onIntersectionClick])

  return (
    <div className={styles.boardWrapper}>
      <BoardSVGBackground flipped={flipped} />
      <div className={styles.grid}>
        {intersections}
      </div>
    </div>
  )
}

/** SVG background: grid lines, palace diagonals, river */
function BoardSVGBackground({ flipped }: { flipped: boolean }) {
  const cellSize = 56
  const padding = 28
  const width = 8 * cellSize + padding * 2
  const height = 9 * cellSize + padding * 2

  function cx(col: number): number {
    const c = flipped ? 8 - col : col
    return padding + c * cellSize
  }
  function cy(row: number): number {
    const r = flipped ? 9 - row : row
    return padding + r * cellSize
  }

  const gridLines: React.ReactElement[] = []

  // Horizontal lines
  for (let row = 0; row < 10; row++) {
    gridLines.push(
      <line
        key={`h-${row}`}
        x1={cx(0)} y1={cy(row)}
        x2={cx(8)} y2={cy(row)}
        stroke="#3a2a1a"
        strokeWidth={1.5}
      />,
    )
  }

  // Vertical lines (left and right edges go full height, inner lines have gap at river)
  for (let col = 0; col < 9; col++) {
    if (col === 0 || col === 8) {
      gridLines.push(
        <line
          key={`v-${col}`}
          x1={cx(col)} y1={cy(0)}
          x2={cx(col)} y2={cy(9)}
          stroke="#3a2a1a"
          strokeWidth={1.5}
        />,
      )
    } else {
      // Top half (Han side)
      gridLines.push(
        <line
          key={`v-${col}-top`}
          x1={cx(col)} y1={cy(0)}
          x2={cx(col)} y2={cy(4)}
          stroke="#3a2a1a"
          strokeWidth={1.5}
        />,
      )
      // Bottom half (Cho side)
      gridLines.push(
        <line
          key={`v-${col}-bot`}
          x1={cx(col)} y1={cy(5)}
          x2={cx(col)} y2={cy(9)}
          stroke="#3a2a1a"
          strokeWidth={1.5}
        />,
      )
    }
  }

  // Palace diagonals (Han: rows 0-2, Cho: rows 7-9)
  const palaceDiags: [number, number, number, number][] = [
    [3, 0, 5, 2], [5, 0, 3, 2], // Han palace
    [3, 7, 5, 9], [5, 7, 3, 9], // Cho palace
  ]
  for (const [c1, r1, c2, r2] of palaceDiags) {
    gridLines.push(
      <line
        key={`pd-${c1}-${r1}-${c2}-${r2}`}
        x1={cx(c1)} y1={cy(r1)}
        x2={cx(c2)} y2={cy(r2)}
        stroke="#3a2a1a"
        strokeWidth={1.5}
      />,
    )
  }

  // River text
  const riverY = (cy(4) + cy(5)) / 2

  // Determine which text goes where based on flip
  const leftText = flipped ? '漢 界' : '楚 河'
  const rightText = flipped ? '楚 河' : '漢 界'

  return (
    <svg className={styles.boardSvg} viewBox={`0 0 ${width} ${height}`}>
      {/* Background */}
      <rect x={0} y={0} width={width} height={height} fill="#dcb97a" rx={8} />

      {gridLines}

      {/* River text */}
      <text
        x={width * 0.28}
        y={riverY}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#5c4a2a"
        fontSize={22}
        fontFamily="'Noto Serif KR', 'Batang', serif"
        fontWeight="700"
        opacity={0.6}
      >
        {leftText}
      </text>
      <text
        x={width * 0.72}
        y={riverY}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#5c4a2a"
        fontSize={22}
        fontFamily="'Noto Serif KR', 'Batang', serif"
        fontWeight="700"
        opacity={0.6}
      >
        {rightText}
      </text>
    </svg>
  )
}
