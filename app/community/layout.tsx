"use client"

import React from "react"

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex-1 flex flex-col h-[100dvh] overflow-hidden bg-background text-foreground">
      {children}
    </div>
  )
}
