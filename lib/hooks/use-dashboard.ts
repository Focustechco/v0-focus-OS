import useSWR from "swr"

const fetcher = async () => {
  const res = await fetch('/api/dashboard')
  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw new Error(json?.error || `Erro ${res.status} ao carregar dashboard`)
  }
  return res.json()
}

export function useDashboard() {
  const { data, error, isLoading, mutate } = useSWR("dashboard-consolidated", fetcher, {
    refreshInterval: 60000,
    shouldRetryOnError: false,
    revalidateOnFocus: false,
  })

  return {
    data,
    isLoading,
    isError: !!error,
    errorMessage: error?.message,
    mutate,
  }
}
