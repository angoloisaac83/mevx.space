"use client"
import type { ReactNode } from "react"

interface PageTransitionProps {
  children: ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
  return <div className="opacity-0 animate-in fade-in-0 duration-300">{children}</div>
}
