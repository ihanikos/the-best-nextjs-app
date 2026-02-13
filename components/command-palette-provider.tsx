"use client"

import * as React from "react"
import { CommandPalette } from "@/components/command-palette"
import { useCommandPalette } from "@/lib/hooks/use-command-palette"

interface CommandPaletteProviderProps {
  children: React.ReactNode
}

export function CommandPaletteProvider({ children }: CommandPaletteProviderProps) {
  const { open, onOpenChange } = useCommandPalette()

  return (
    <>
      {children}
      <CommandPalette open={open} onOpenChange={onOpenChange} />
    </>
  )
}
