'use client'

import Link from 'next/link'
import React from 'react'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  message: string
  ctaText: string
  ctaHref: string
}

export function EmptyState({
  icon,
  title,
  message,
  ctaText,
  ctaHref,
}: EmptyStateProps) {
  return (
    <div className="rounded-lg border-2 border-dashed border-slate-700 bg-slate-900/50 p-12 text-center">
      <div className="mx-auto mb-4 text-slate-500">{icon}</div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-slate-400">{message}</p>
      <Link
        href={ctaHref}
        className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700"
      >
        {ctaText}
      </Link>
    </div>
  )
}
