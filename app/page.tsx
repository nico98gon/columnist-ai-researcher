"use client"

import { SearchForm } from "./components/SearchForm"
import { SearchPanel } from "./components/SearchPanel"
import { useSearchStore } from "@/store/searchStore"

export default function Home() {
  const { result } = useSearchStore()

  return (
    <div className="flex-grow flex flex-col min-h-0">
      {result ? (
        <SearchPanel />
      ) : (
        <SearchForm />
      )}
    </div>
  )
}