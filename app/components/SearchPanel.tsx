"use client"

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { SearchForm } from "./SearchForm"
import { useSearchStore } from "@/store/searchStore"
import { ArticleList } from "./ArticleList"
import { CategorizationPanel } from "./CategorizationPanel"

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
          <ResizablePanel defaultSize={35} className="">
            <div className="flex flex-col justify-end p-6 overflow-y-scroll">
              <SearchForm />
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={65}>
            <CategorizationPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}