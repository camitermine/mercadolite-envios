import { useEffect, useState } from 'react'
import { errorMessage, isAbortError } from '../../../services/errors'
import type { Page } from '../dashboardService'

const FIRST_PAGE = 1

type PageFetcher<T> = (page: number, signal: AbortSignal) => Promise<Page<T>>

export function useDashboardPage<T>(fetchPage: PageFetcher<T>, errorAction: string) {
  const [data, setData] = useState<Page<T>>()
  const [page, setPage] = useState(FIRST_PAGE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()

  useEffect(() => {
    const controller = new AbortController()

    fetchPage(page - 1, controller.signal)
      .then((pageData) => {
        setData(pageData)
        setError(undefined)
      })
      .catch((loadError) => {
        if (!isAbortError(loadError)) {
          setError(errorMessage(loadError, errorAction))
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [fetchPage, errorAction, page])

  return { data, page, setPage, loading, error }
}
