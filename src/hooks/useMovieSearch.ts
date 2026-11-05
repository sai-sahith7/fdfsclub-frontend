import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAllMovies } from '@/api/movies'
import type { Movie } from '@/types'

const DEFAULT_LIMIT = 20

export function useMovieSearch() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  const result = useQuery({
    queryKey: ['movies', debouncedQuery, page],
    queryFn: () =>
      getAllMovies({
        search: debouncedQuery || undefined,
        page,
        limit: DEFAULT_LIMIT,
      }),
  })

  const movies: Movie[] = result.data?.movies ?? []
  const total = result.data?.total ?? 0
  const totalPages = result.data?.totalPages ?? 1
  const currentPage = result.data?.page ?? 1

  return {
    query,
    setQuery,
    page: currentPage,
    totalPages,
    total,
    setPage,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    isError: result.isError,
    data: movies,
  }
}