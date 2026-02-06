import type { PieceType, Player } from '../../types/index.ts'
import { PIECE_DISPLAY } from '../../game/constants.ts'

interface PieceProps {
  type: PieceType
  player: Player
  size?: number
}

export function Piece({ type, player, size = 42 }: PieceProps) {
  const char = PIECE_DISPLAY[player][type]
  const isCho = player === 'cho'

  const borderColor = isCho ? '#2563eb' : '#dc2626'
  const textColor = isCho ? '#1d4ed8' : '#b91c1c'
  const bgColor = isCho ? '#eff6ff' : '#fef2f2'
  const borderColor2 = isCho ? '#93c5fd' : '#fca5a5'

  // Octagonal shape using polygon
  const s = size
  const inset = s * 0.22
  const points = [
    `${inset},0`,
    `${s - inset},0`,
    `${s},${inset}`,
    `${s},${s - inset}`,
    `${s - inset},${s}`,
    `${inset},${s}`,
    `0,${s - inset}`,
    `0,${inset}`,
  ].join(' ')

  const fontSize = type === 'king' ? s * 0.48 : s * 0.45

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      style={{ display: 'block', filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.3))' }}
    >
      {/* Outer border */}
      <polygon
        points={points}
        fill={bgColor}
        stroke={borderColor}
        strokeWidth={2.5}
      />
      {/* Inner border */}
      <polygon
        points={[
          `${inset + 3},3`,
          `${s - inset - 3},3`,
          `${s - 3},${inset + 3}`,
          `${s - 3},${s - inset - 3}`,
          `${s - inset - 3},${s - 3}`,
          `${inset + 3},${s - 3}`,
          `3,${s - inset - 3}`,
          `3,${inset + 3}`,
        ].join(' ')}
        fill="none"
        stroke={borderColor2}
        strokeWidth={1}
      />
      {/* Character */}
      <text
        x={s / 2}
        y={s / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill={textColor}
        fontSize={fontSize}
        fontWeight="700"
        fontFamily="'Noto Serif KR', 'Batang', serif"
      >
        {char}
      </text>
    </svg>
  )
}
