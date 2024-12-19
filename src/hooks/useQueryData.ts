import { useQuery } from '@tanstack/react-query'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useQueryData = <T = any>(
  key: string[],
  queryFn: () => Promise<T>
) => {
  return useQuery({
    queryKey: key,
    queryFn,
  })
}
