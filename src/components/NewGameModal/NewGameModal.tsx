import { useState } from 'react'
import type { GameConfig, GameMode, Difficulty, Player, Formation } from '../../types/index.ts'
import styles from './NewGameModal.module.css'

interface NewGameModalProps {
  onStart: (config: GameConfig) => void
}

const FORMATIONS: { value: Formation; label: string; desc: string }[] = [
  { value: 'inner', label: '안상', desc: '馬象___象馬' },
  { value: 'outer', label: '바깥상', desc: '象馬___馬象' },
  { value: 'left', label: '왼상', desc: '象馬___象馬' },
  { value: 'right', label: '오른상', desc: '馬象___馬象' },
]

export function NewGameModal({ onStart }: NewGameModalProps) {
  const [mode, setMode] = useState<GameMode>('ai')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [playerSide, setPlayerSide] = useState<Player>('cho')
  const [choFormation, setChoFormation] = useState<Formation>('inner')
  const [hanFormation, setHanFormation] = useState<Formation>('inner')

  const handleStart = () => {
    onStart({ mode, difficulty, playerSide, choFormation, hanFormation })
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>장기 (Janggi)</h2>

        {/* Game Mode */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>게임 모드</div>
          <div className={styles.options}>
            <button
              className={`${styles.option} ${mode === 'ai' ? styles.active : ''}`}
              onClick={() => setMode('ai')}
            >
              AI 대전
            </button>
            <button
              className={`${styles.option} ${mode === 'local' ? styles.active : ''}`}
              onClick={() => setMode('local')}
            >
              로컬 대전
            </button>
          </div>
        </div>

        {/* Difficulty (AI only) */}
        {mode === 'ai' && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>난이도</div>
            <div className={styles.options}>
              <button
                className={`${styles.option} ${difficulty === 'easy' ? styles.active : ''}`}
                onClick={() => setDifficulty('easy')}
              >
                쉬움
              </button>
              <button
                className={`${styles.option} ${difficulty === 'medium' ? styles.active : ''}`}
                onClick={() => setDifficulty('medium')}
              >
                보통
              </button>
              <button
                className={`${styles.option} ${difficulty === 'hard' ? styles.active : ''}`}
                onClick={() => setDifficulty('hard')}
              >
                어려움
              </button>
            </div>
          </div>
        )}

        {/* Player Side (AI only) */}
        {mode === 'ai' && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>진영</div>
            <div className={styles.options}>
              <button
                className={`${styles.option} ${styles.choOption} ${playerSide === 'cho' ? styles.active : ''}`}
                onClick={() => setPlayerSide('cho')}
              >
                초 (楚) 선수
              </button>
              <button
                className={`${styles.option} ${styles.hanOption} ${playerSide === 'han' ? styles.active : ''}`}
                onClick={() => setPlayerSide('han')}
              >
                한 (漢) 후수
              </button>
            </div>
          </div>
        )}

        {/* Cho Formation */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>초 (楚) 상마 배치</div>
          <div className={styles.formationGrid}>
            {FORMATIONS.map(f => (
              <button
                key={`cho-${f.value}`}
                className={`${styles.formationOption} ${choFormation === f.value ? styles.activeFormation : ''}`}
                onClick={() => setChoFormation(f.value)}
              >
                <div className={styles.formationLabel}>{f.label}</div>
                <div className={styles.formationDesc}>{f.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Han Formation */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>한 (漢) 상마 배치</div>
          <div className={styles.formationGrid}>
            {FORMATIONS.map(f => (
              <button
                key={`han-${f.value}`}
                className={`${styles.formationOption} ${hanFormation === f.value ? styles.activeFormation : ''}`}
                onClick={() => setHanFormation(f.value)}
              >
                <div className={styles.formationLabel}>{f.label}</div>
                <div className={styles.formationDesc}>{f.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button className={styles.startBtn} onClick={handleStart}>
          게임 시작
        </button>
      </div>
    </div>
  )
}
