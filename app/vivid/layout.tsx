"use client"

import React from "react"

export default function VividLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-background text-foreground">
      {children}
    </div>
  )
}
