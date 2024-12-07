/* eslint-disable @typescript-eslint/no-unused-vars */
import { useRef } from 'react'

export const useRenameFolders = (folderId: string) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const folderCardRef = useRef<HTMLDivElement | null>(null)

  return { inputRef, folderCardRef }
}
