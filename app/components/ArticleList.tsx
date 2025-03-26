"use client"

import { useState } from "react"
import { useChat } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { ArticleCard } from "./ArticleCard"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Ban } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import ReactMarkdown from "react-markdown"

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
  const router = useRouter()
  const [selectedArticles, setSelectedArticles] = useState<string[]>([])
  const [generatedId, setGeneratedId] = useState<string | null>(null)

  const { messages, append, status } = useChat({
    api: "/api/generate",
    onError: (error) => {
      console.error("Error en useChat:", error.message, error.stack)
      toast.error("¡Error!", {
        description: `Ocurrió un error al generar el artículo: ${error.message}. Intenta de nuevo más tarde o contacta a soporte.`,
        icon: <Ban size={20} className="text-red-500" />,
      })
    },
    onFinish: (message) => {
      const articleId = Math.random().toString(36).substr(2, 9)
      const content = message.parts
        ?.filter((part): part is { type: "text"; text: string } => part.type === "text")
        .map((part) => part.text)
        .join("") || ""
      localStorage.setItem(`article_${articleId}`, content)
      setGeneratedId(articleId)
    },
  })

  const handleToggleSelect = (id: string) => {
    setSelectedArticles((prev) =>
      prev.includes(id) ? prev.filter((articleId) => articleId !== id) : [...prev, id]
    )
  }

  const handleSelected = async () => {
    const selected = articles.filter((article) => selectedArticles.includes(article.id))
    // Prompt simplificado para prueba
    const prompt = "Genera un artículo corto de prueba basado en: " + selected.map((article) => article.title).join(", ")

    try {
      await append({ role: "user", content: prompt })
    } catch (error: any) {
      console.error("Error al generar el artículo:", error.message, error.stack)
      toast.error("¡Error!", {
        description: `Ocurrió un error al buscar: ${error.message}. Intenta de nuevo más tarde o contacta a soporte.`,
        icon: <Ban size={20} className="text-red-500" />,
      })
    }
  }

  const handleReinterpret = async () => {
    const lastGeneratedMessage = messages.findLast((msg) => msg.role === "assistant")
    const lastGenerated = lastGeneratedMessage?.parts
      ?.filter((part): part is { type: "text"; text: string } => part.type === "text")
      .map((part) => part.text)
      .join("") || ""
    if (!lastGenerated) {
      toast.error("¡Error!", {
        description: "No hay contenido generado para reinterpretar",
        icon: <Ban size={20} className="text-red-500" />,
      })
      return
    }

    try {
      await append(
        { role: "user", content: lastGenerated },
        { data: { reinterpret: lastGenerated } }
      )
    } catch (error: any) {
      console.error("Error al reinterpretar el artículo:", error.message, error.stack)
      toast.error("¡Error!", {
        description: `Ocurrió un error al reinterpretar: ${error.message}. Intenta de nuevo más tarde o contacta a soporte.`,
        icon: <Ban size={20} className="text-red-500" />,
      })
    }
  }

  const handleNavigate = () => {
    if (generatedId) {
      router.push(`/article/${generatedId}`)
    } else {
      toast.error("¡Error!", {
        description: "No hay artículo generado para ver",
        icon: <Ban size={20} className="text-red-500" />,
      })
    }
  }

  const isProcessing = status === "streaming"

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
          <Dialog>
            <DialogTrigger asChild>
              <Button
                onClick={handleSelected}
                disabled={isProcessing}
                className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium ml-auto"
              >
                {isProcessing ? "Generando..." : "Generar artículo"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[425px] sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>Artículo Generado</DialogTitle>
                <DialogDescription>
                  
                </DialogDescription>
              </DialogHeader>
              <div className="h-[75vh] overflow-y-scroll">
                {messages.length > 0 && (
                  <ReactMarkdown>
                    {messages
                      .findLast((msg) => msg.role === "assistant")
                      ?.parts?.filter((part): part is { type: "text"; text: string } => part.type === "text")
                      .map((part) => part.text)
                      .join("") || ""}
                  </ReactMarkdown>
                )}
              </div>
              <DialogFooter>
                <Button
                  onClick={handleReinterpret}
                  disabled={isProcessing}
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-4 py-2 rounded-md text-sm font-medium"
                >
                  {isProcessing ? "Procesando..." : "Reinterpretar"}
                </Button>
                <Button
                  onClick={handleNavigate}
                  disabled={!generatedId}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Ver artículo completo
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  )
}