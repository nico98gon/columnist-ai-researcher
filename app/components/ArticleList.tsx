"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArticleCard } from "./ArticleCard"

interface Article {
  id: string
  title: string
  url: string
  publishedDate: string
  author: string
  text: string
  image: string
  favicon: string
}

interface ArticleListProps {
  articles: Article[]
}

export function ArticleList({ articles }: ArticleListProps) {
  const [selectedArticles, setSelectedArticles] = useState<string[]>([])

  const handleToggleSelect = (id: string) => {
    setSelectedArticles((prev) =>
      prev.includes(id) ? prev.filter((articleId) => articleId !== id) : [...prev, id]
    )
  }

  const handleConvertSelected = () => {
    // !TODO!: Implementar la lógica para "convertir" los artículos seleccionados
    console.log("Artículos seleccionados para convertir:", selectedArticles)
    // !TODO!: Enviar selectedArticles a AI SDK Vercel
  }

  return (
    <div className="w-full h-full p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Resultados de búsqueda</h2>
        <p className="text-muted-foreground">
          {articles.length} artículos encontrados. Selecciona los que deseas convertir.
        </p>
      </div>

      <div className="space-y-4">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            isSelected={selectedArticles.includes(article.id)}
            onToggleSelect={handleToggleSelect}
          />
        ))}
      </div>

      {selectedArticles.length > 0 && (
        <div className="flex fixed bottom-[6vh] left-[14vw] items-center gap-4 mt-6 p-4 bg-muted rounded-lg">
          <p className="font-medium">
            {selectedArticles.length} artículo{selectedArticles.length !== 1 ? "s" : ""} seleccionado
            {selectedArticles.length !== 1 ? "s" : ""}
          </p>
          <Button
            onClick={handleConvertSelected}
            className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium ml-auto"
          >
            Generar artículo
          </Button>
        </div>
      )}
    </div>
  )
}