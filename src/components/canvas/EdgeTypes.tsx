"use client"

import React from 'react'
import { EdgeProps, getBezierPath, BaseEdge } from '@xyflow/react'

export function CustomGradientEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  data,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  // Determine colors based on state
  const status = data?.status || 'idle'
  const isRunning = status === 'running'
  
  let gradientStart = "#a855f7" // purple
  let gradientEnd = "#3b82f6"   // blue
  let glowColor = "rgba(168, 85, 247, 0.3)"

  if (status === 'success') {
    gradientStart = "#10b981"; gradientEnd = "#34d399"; glowColor = "rgba(16, 185, 129, 0.2)"
  } else if (status === 'error') {
    gradientStart = "#ef4444"; gradientEnd = "#f87171"; glowColor = "rgba(239, 68, 68, 0.2)"
  }

  const opacity = selected || isRunning ? 1 : 0.3

  return (
    <>
      <defs>
        <linearGradient id={`edge-gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={gradientStart} />
          <stop offset="100%" stopColor={gradientEnd} />
        </linearGradient>
        
        <filter id={`edge-glow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Shadow/Glow Path */}
      <path
        d={edgePath}
        fill="none"
        stroke={gradientStart}
        strokeWidth={isRunning || selected ? 6 : 4}
        className="transition-all duration-500"
        style={{
          opacity: isRunning || selected ? 0.15 : 0.05,
          filter: `blur(8px)`,
        }}
      />

      {/* Main Path */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: `url(#edge-gradient-${id})`,
          strokeWidth: isRunning || selected ? 3 : 2,
          strokeOpacity: opacity,
          transition: 'all 0.5s ease',
          filter: (selected || isRunning) ? `url(#edge-glow-${id})` : 'none',
        }}
      />

      {/* Flowing Particles Path */}
      {(isRunning || selected) && (
        <path
          d={edgePath}
          fill="none"
          stroke={`url(#edge-gradient-${id})`}
          strokeWidth={isRunning ? 3 : 2}
          strokeDasharray="10, 20"
          className="animate-edge-flow"
          style={{
            filter: `brightness(1.5) blur(1px)`,
            opacity: isRunning ? 1 : 0.5,
          }}
        />
      )}
    </>
  )
}
