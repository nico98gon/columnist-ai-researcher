import { create } from 'zustand'

type SearchState = {
  result: any | null
  error: string | null
  loading: boolean
  setResult: (result: any) => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
  clear: () => void
};

export const useSearchStore = create<SearchState>((set) => ({
  result: null,
  error: null,
  loading: false,
  setResult: (result) => set({ result, error: null }),
  setError: (error) => set({ error, result: null }),
  setLoading: (loading) => set({ loading }),
  clear: () => set({ result: null, error: null, loading: false }),
}))