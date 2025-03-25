"use client"

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { SearchForm } from "./SearchForm"
import { useSearchStore } from "@/store/searchStore"
import { ArticleList } from "./ArticleList"

export const SearchPanel = () => {
  const { result } = useSearchStore()

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="rounded-lg border"
    >
      <ResizablePanel defaultSize={50}>
        <div className="flex h-[85vh] max-w-full items-center justify-center p-6 overflow-y-scroll">
          {result ? (
            <ArticleList articles={result} />
          ) : (
            <p>No hay resultados aún</p>
          )}
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50}>
        <ResizablePanelGroup direction="vertical" className="h-full">
          <ResizablePanel defaultSize={55}>
            <div className="flex h-full flex-col justify-end p-6">
              <SearchForm />
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={45}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Three</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}