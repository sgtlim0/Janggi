import { useMemo, useCallback } from 'react'
import { Piece } from '../Piece/Piece.tsx'
import type { GameState, Position } from '../../types/index.ts'
import styles from './Board.module.css'

interface BoardProps {
  gameState: GameState
  flipped: boolean
  onIntersectionClick: (pos: Position) => void
}

// Board geometry constants
const CELL = 58          // spacing between intersections
const PAD_X = 40         // left/right padding (frame)
const PAD_Y = 40         // top/bottom padding (frame)
const COLS = 9
const ROWS = 10
const BOARD_W = (COLS - 1) * CELL + PAD_X * 2
const BOARD_H = (ROWS - 1) * CELL + PAD_Y * 2
const PIECE_SIZE = 44
const HIT_SIZE = 52      // clickable area

export function Board({ gameState, flipped, onIntersectionClick }: BoardProps) {
  const { board, selectedPosition, legalMoves, lastMove, isCheck, turn } = gameState

  // Convert logical row/col to SVG x/y
  const cx = useCallback((col: number) => {
    const c = flipped ? 8 - col : col
    return PAD_X + c * CELL
  }, [flipped])

  const cy = useCallback((row: number) => {
    const r = flipped ? 9 - row : row
    return PAD_Y + r * CELL
  }, [flipped])

  const pieces = useMemo(() => {
    const elements: React.ReactElement[] = []

    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 9; col++) {
        const piece = board[row]?.[col]
        if (!piece) continue

        const x = cx(col)
        const y = cy(row)

        elements.push(
          <g key={`piece-${row}-${col}`} transform={`translate(${x - PIECE_SIZE / 2}, ${y - PIECE_SIZE / 2})`}>
            <Piece type={piece.type} player={piece.player} size={PIECE_SIZE} />
          </g>,
        )
      }
    }
    return elements
  }, [board, cx, cy])

  // Highlight layers
  const highlights = useMemo(() => {
    const elements: React.ReactElement[] = []
    const R = 24

    // Last move highlights
    if (lastMove) {
      for (const pos of [lastMove.from, lastMove.to]) {
        elements.push(
          <rect
            key={`last-${pos.row}-${pos.col}`}
            x={cx(pos.col) - R} y={cy(pos.row) - R}
            width={R * 2} height={R * 2}
            rx={6}
            fill="rgba(74, 222, 128, 0.25)"
          />,
        )
      }
    }

    // Selected piece highlight
    if (selectedPosition) {
      elements.push(
        <rect
          key="selected"
          x={cx(selectedPosition.col) - R} y={cy(selectedPosition.row) - R}
          width={R * 2} height={R * 2}
          rx={6}
          fill="rgba(234, 179, 8, 0.35)"
          stroke="rgba(234, 179, 8, 0.7)"
          strokeWidth={2}
        />,
      )
    }

    // Check highlight
    if (isCheck) {
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 9; col++) {
          const p = board[row]?.[col]
          if (p?.type === 'king' && p.player === turn) {
            elements.push(
              <circle
                key="check"
                cx={cx(col)} cy={cy(row)}
                r={R + 2}
                fill="none"
                stroke="rgba(239, 68, 68, 0.7)"
                strokeWidth={3}
              />,
            )
            elements.push(
              <circle
                key="check-glow"
                cx={cx(col)} cy={cy(row)}
                r={R - 2}
                fill="rgba(239, 68, 68, 0.15)"
              />,
            )
          }
        }
      }
    }

    // Legal move indicators
    for (const m of legalMoves) {
      const hasPiece = board[m.row]?.[m.col] != null
      if (hasPiece) {
        // Capture ring
        elements.push(
          <circle
            key={`cap-${m.row}-${m.col}`}
            cx={cx(m.col)} cy={cy(m.row)}
            r={PIECE_SIZE / 2 + 3}
            fill="none"
            stroke="rgba(239, 68, 68, 0.6)"
            strokeWidth={3}
            strokeDasharray="6 3"
          />,
        )
      } else {
        // Move dot
        elements.push(
          <circle
            key={`dot-${m.row}-${m.col}`}
            cx={cx(m.col)} cy={cy(m.row)}
            r={7}
            fill="rgba(34, 197, 94, 0.55)"
          />,
        )
      }
    }

    return elements
  }, [board, selectedPosition, legalMoves, lastMove, isCheck, turn, cx, cy])

  // Invisible hit targets for click interaction
  const hitTargets = useMemo(() => {
    const elements: React.ReactElement[] = []
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 9; col++) {
        const pos: Position = { row, col }
        elements.push(
          <rect
            key={`hit-${row}-${col}`}
            x={cx(col) - HIT_SIZE / 2}
            y={cy(row) - HIT_SIZE / 2}
            width={HIT_SIZE}
            height={HIT_SIZE}
            fill="transparent"
            cursor="pointer"
            onClick={() => onIntersectionClick(pos)}
          />,
        )
      }
    }
    return elements
  }, [cx, cy, onIntersectionClick])

  return (
    <div className={styles.boardWrapper}>
      <svg
        className={styles.boardSvg}
        viewBox={`0 0 ${BOARD_W} ${BOARD_H}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Wood grain texture */}
          <filter id="woodGrain">
            <feTurbulence type="fractalNoise" baseFrequency="0.04 0.15" numOctaves={4} seed={3} />
            <feColorMatrix type="saturate" values="0" />
            <feBlend in="SourceGraphic" mode="multiply" />
          </filter>
        </defs>

        {/* Board background */}
        <rect x={0} y={0} width={BOARD_W} height={BOARD_H} fill="#c4a35a" rx={6} />
        {/* Inner board area */}
        <rect
          x={PAD_X - 16} y={PAD_Y - 16}
          width={(COLS - 1) * CELL + 32}
          height={(ROWS - 1) * CELL + 32}
          fill="#dcb97a"
          rx={2}
        />

        <BoardGrid cx={cx} cy={cy} />
        <PalaceDiagonals cx={cx} cy={cy} />
        <PositionMarkers cx={cx} cy={cy} />
        <RiverText cx={cx} cy={cy} flipped={flipped} />

        {/* Outer thick border around playing area */}
        <rect
          x={cx(0) - 4} y={cy(0) - 4}
          width={(COLS - 1) * CELL + 8}
          height={(ROWS - 1) * CELL + 8}
          fill="none"
          stroke="#3a2a1a"
          strokeWidth={3}
          rx={1}
        />

        {/* Layer order: highlights → pieces → hit targets */}
        <g>{highlights}</g>
        <g>{pieces}</g>
        <g>{hitTargets}</g>
      </svg>
    </div>
  )
}

/** Grid lines */
function BoardGrid({ cx, cy }: { cx: (c: number) => number; cy: (r: number) => number }) {
  const lines: React.ReactElement[] = []

  // Horizontal lines (10 lines, rows 0-9)
  for (let row = 0; row < 10; row++) {
    lines.push(
      <line
        key={`h-${row}`}
        x1={cx(0)} y1={cy(row)}
        x2={cx(8)} y2={cy(row)}
        stroke="#5c4a2a" strokeWidth={1}
      />,
    )
  }

  // Vertical lines
  for (let col = 0; col < 9; col++) {
    if (col === 0 || col === 8) {
      // Edge columns: full height
      lines.push(
        <line
          key={`v-${col}`}
          x1={cx(col)} y1={cy(0)}
          x2={cx(col)} y2={cy(9)}
          stroke="#5c4a2a" strokeWidth={1}
        />,
      )
    } else {
      // Inner columns: break at river
      lines.push(
        <line
          key={`v-${col}-top`}
          x1={cx(col)} y1={cy(0)}
          x2={cx(col)} y2={cy(4)}
          stroke="#5c4a2a" strokeWidth={1}
        />,
      )
      lines.push(
        <line
          key={`v-${col}-bot`}
          x1={cx(col)} y1={cy(5)}
          x2={cx(col)} y2={cy(9)}
          stroke="#5c4a2a" strokeWidth={1}
        />,
      )
    }
  }

  return <g>{lines}</g>
}

/** Palace diagonal lines */
function PalaceDiagonals({ cx, cy }: { cx: (c: number) => number; cy: (r: number) => number }) {
  // Han palace: rows 0-2, cols 3-5
  // Cho palace: rows 7-9, cols 3-5
  return (
    <g stroke="#5c4a2a" strokeWidth={1}>
      {/* Han palace (top) */}
      <line x1={cx(3)} y1={cy(0)} x2={cx(5)} y2={cy(2)} />
      <line x1={cx(5)} y1={cy(0)} x2={cx(3)} y2={cy(2)} />
      {/* Cho palace (bottom) */}
      <line x1={cx(3)} y1={cy(7)} x2={cx(5)} y2={cy(9)} />
      <line x1={cx(5)} y1={cy(7)} x2={cx(3)} y2={cy(9)} />
    </g>
  )
}

/**
 * Position markers (十-shaped crosses) at traditional positions:
 * - Soldier starting positions: rows 3,6 at cols 0,2,4,6,8
 * - Cannon positions: rows 2,7 at cols 1,7
 *
 * Edge positions only show partial markers (no lines extending outside the board).
 */
function PositionMarkers({ cx, cy }: { cx: (c: number) => number; cy: (r: number) => number }) {
  const markers: React.ReactElement[] = []
  const S = 5  // arm length
  const G = 3  // gap from center

  const positions: [number, number][] = [
    // Cannon positions
    [2, 1], [2, 7],
    [7, 1], [7, 7],
    // Soldier positions
    [3, 0], [3, 2], [3, 4], [3, 6], [3, 8],
    [6, 0], [6, 2], [6, 4], [6, 6], [6, 8],
  ]

  for (const [row, col] of positions) {
    const x = cx(col)
    const y = cy(row)

    // Draw 4 L-shaped brackets around the intersection
    // Skip directions that would extend outside the board
    const showLeft = col > 0
    const showRight = col < 8
    const showTop = true    // all marker rows are interior
    const showBottom = true

    if (showRight && showTop) {
      markers.push(
        <path key={`m-${row}-${col}-rt`} d={`M${x + G},${y - G - S} v${S} h${S}`}
          fill="none" stroke="#5c4a2a" strokeWidth={0.8} />,
      )
    }
    if (showRight && showBottom) {
      markers.push(
        <path key={`m-${row}-${col}-rb`} d={`M${x + G},${y + G + S} v${-S} h${S}`}
          fill="none" stroke="#5c4a2a" strokeWidth={0.8} />,
      )
    }
    if (showLeft && showTop) {
      markers.push(
        <path key={`m-${row}-${col}-lt`} d={`M${x - G},${y - G - S} v${S} h${-S}`}
          fill="none" stroke="#5c4a2a" strokeWidth={0.8} />,
      )
    }
    if (showLeft && showBottom) {
      markers.push(
        <path key={`m-${row}-${col}-lb`} d={`M${x - G},${y + G + S} v${-S} h${-S}`}
          fill="none" stroke="#5c4a2a" strokeWidth={0.8} />,
      )
    }
  }

  return <g>{markers}</g>
}

/** River text: 楚河 漢界 */
function RiverText({
  cx, cy, flipped,
}: {
  cx: (c: number) => number
  cy: (r: number) => number
  flipped: boolean
}) {
  const midY = (cy(4) + cy(5)) / 2
  const leftX = (cx(1) + cx(3)) / 2
  const rightX = (cx(5) + cx(7)) / 2

  const leftText = flipped ? '漢  界' : '楚  河'
  const rightText = flipped ? '楚  河' : '漢  界'

  return (
    <g
      fontFamily="'Noto Serif KR', 'Batang', 'SimSun', serif"
      fontWeight="700"
      fontSize={24}
      fill="#7a6a4a"
    >
      <text x={leftX} y={midY} textAnchor="middle" dominantBaseline="central">
        {leftText}
      </text>
      <text x={rightX} y={midY} textAnchor="middle" dominantBaseline="central">
        {rightText}
      </text>
    </g>
  )
}
