"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { getDriveFiles } from "@/lib/services/drive-api"
import type { DriveFile } from "@/lib/types/drive"

function driveFilesFetcher(folderId: string) {
  return getDriveFiles(folderId)
}

export function useDriveFiles(folderId: string) {
  const [search, setSearch] = useState("")
  const { data, error, isLoading, mutate, isValidating } = useSWR(
    ["drive-files", folderId],
    () => driveFilesFetcher(folderId),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  )

  const rawFiles = data?.files || []
  const files = useMemo(
    () =>
      rawFiles.filter((file) =>
        file.name.toLowerCase().includes(search.toLowerCase().trim()),
      ),
    [rawFiles, search],
  )

  return {
    rawFiles,
    files,
    search,
    setSearch,
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
    isValidating,
  }
}
