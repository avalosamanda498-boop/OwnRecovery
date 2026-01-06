'use client'

import { useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { BadgeRecord } from '@/lib/badges'

interface BadgeCelebrationToastProps {
  badges: BadgeRecord[]
  onClose?: () => void
  duration?: number
}

const CONFETTI_COLORS = ['#f97316', '#facc15', '#38bdf8', '#34d399', '#a855f7', '#fb7185']
const CONFETTI_SHAPES: Array<'rounded-sm' | 'rounded-full' | 'rotate-45'> = ['rounded-sm', 'rounded-full', 'rotate-45']

interface ConfettiPiece {
  left: number
  delay: number
  duration: number
  color: string
  shape: string
  rotate: number
  drift: number
}

export function BadgeCelebrationToast({ badges, onClose, duration = 6000 }: BadgeCelebrationToastProps) {
  const shouldShowConfetti = badges.some((badge) => badge.badge_type !== 'bravery_log')

  const confettiPieces = useMemo<ConfettiPiece[]>(() => {
    if (!shouldShowConfetti) return []
    return Array.from({ length: 42 }).map((_, idx) => {
      const left = Math.random() * 100
      const delay = Math.random() * 0.7
      const duration = 2.4 + Math.random()
      const color = CONFETTI_COLORS[idx % CONFETTI_COLORS.length]
      const shape = CONFETTI_SHAPES[idx % CONFETTI_SHAPES.length] || 'rounded-sm'
      const rotate = Math.random() * 180
      const drift = Math.random() * 40 - 20
      return { left, delay, duration, color, shape, rotate, drift }
    })
  }, [shouldShowConfetti])

  useEffect(() => {
    if (!onClose) return

    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [onClose, duration])

  return (
    <AnimatePresence>
      {badges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 160, damping: 20 }}
          className="relative overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-100 via-orange-50 to-white p-6 shadow-xl"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(253,230,138,0.6),_transparent_60%)]" />

          <div className="relative flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <motion.div
                initial={{ rotate: -18, scale: 0.7 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                className="rounded-full bg-white/80 p-3 shadow-md"
              >
                <span className="text-3xl">🎉</span>
              </motion.div>
              <div>
                <h3 className="text-lg font-semibold text-amber-900">
                  {badges.length === 1 ? 'Major win unlocked!' : 'Stacking up the wins!'}
                </h3>
                <p className="text-sm text-amber-800/90">
                  We’re spotlighting this moment because it matters. Take a breath—your honesty and consistency deserve to
                  be celebrated.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {badges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.08, duration: 0.35 }}
                  className="flex min-w-[200px] flex-1 items-center gap-3 rounded-2xl bg-white/90 px-4 py-3 shadow-sm"
                >
                  <span className="text-2xl drop-shadow-sm">{badge.icon ?? '🌟'}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{badge.badge_name}</p>
                    {badge.description && <p className="text-xs text-gray-600">{badge.description}</p>}
                  </div>
                </motion.div>
              ))}
            </div>

            {onClose && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-amber-300/60 bg-white/90 px-3 py-1.5 text-xs font-medium text-amber-800 shadow-sm transition hover:bg-white"
                >
                  Keep going ✨
                </button>
              </div>
            )}
          </div>

          {shouldShowConfetti && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {confettiPieces.map((piece, idx) => (
                <motion.span
                  key={`${piece.left}-${idx}`}
                  initial={{ opacity: 0, y: -160, x: piece.left - 50, rotate: piece.rotate, scale: 0.8 }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    y: [ -160, 120, 220 ],
                    x: [piece.left - 50, piece.left - 50 + piece.drift, piece.left - 50 + piece.drift * 1.4],
                    rotate: [piece.rotate, piece.rotate + 90, piece.rotate + 160],
                    scale: [0.8, 1, 1],
                  }}
                  transition={{
                    duration: piece.duration,
                    delay: piece.delay,
                    repeat: Infinity,
                    repeatDelay: 2.2,
                    ease: 'easeOut',
                  }}
                  style={{
                    left: `${piece.left}%`,
                    backgroundColor: piece.color,
                    boxShadow: `0 0 8px ${piece.color}40`,
                  }}
                  className={`absolute top-0 h-2 w-3 ${piece.shape}`}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}


