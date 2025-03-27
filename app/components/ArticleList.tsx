"use client"

import { useState, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { ArticleCard } from "./ArticleCard"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Ban } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import ReactMarkdown from "react-markdown"
import { useClassificationStore } from "@/store/classificationStore"

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
  const { selectedArticleIds, classifyArticles } = useClassificationStore()
  const [manualSelections, setManualSelections] = useState<Record<string, boolean>>({})
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

  useEffect(() => {
    classifyArticles(articles)
  }, [articles, classifyArticles])

  const handleToggleSelect = (id: string) => {
    setManualSelections((prev) => {
      const isCurrentlySelected = prev[id] !== undefined ? prev[id] : selectedArticleIds.includes(id)
      return {
        ...prev,
        [id]: !isCurrentlySelected,
      }
    })
  }

  const finalSelections = articles
    .map((article) => article.id)
    .filter((id) => {
      if (manualSelections[id] !== undefined) {
        return manualSelections[id]
      }
      return selectedArticleIds.includes(id)
    })

    const handleSelected = async () => {
      const selected = articles.filter((article) => finalSelections.includes(article.id))
      
      const prompt = `
        Eres un periodista experto de nivel mundial, con un estilo narrativo comparable al de las mejores publicaciones internacionales como el New York Times o The Economist. Tu tarea es generar un artículo profesional, exhaustivo y atractivo basado en la siguiente información de los artículos seleccionados. Utiliza todos los datos proporcionados (títulos, autores, fechas de publicación, textos, URLs, imágenes y favicon) para crear un artículo que no solo resuma, sino que analice, contextualice y amplíe la información de manera creativa y precisa, manteniendo la veracidad y relevancia. Sigue estas instrucciones:
    
        1. **Estructura**: 
          - Comienza con un titular impactante y profesional que sintetice el tema principal.
          - Incluye una introducción breve pero cautivadora que enganche al lector y presente el contexto.
          - Desarrolla el cuerpo del artículo en secciones lógicas con subtítulos (puedes inventarlos según el contenido).
          - Termina con una conclusión sólida que ofrezca una reflexión o perspectiva sobre el tema.
    
        2. **Estilo**:
          - Usa un tono formal pero accesible, con un lenguaje rico, preciso y evocador.
          - Incorpora metáforas, datos históricos o referencias culturales relevantes si enriquecen el texto.
          - Evita repeticiones y clichés; busca originalidad en la narrativa.
    
        3. **Contenido**:
          - Integra la información de los artículos seleccionados: títulos (${selected.map((article) => article.title).join(", ")}), autores (${selected.map((article) => article.author).join(", ")}), fechas (${selected.map((article) => article.publishedDate).join(", ")}), y textos (resúmelos o cítalos parcialmente si es necesario).
          - Añade valor más allá de los datos proporcionados: incluye análisis crítico, conexiones con eventos actuales (hasta el 27 de marzo de 2025), estadísticas relevantes o implicaciones sociales, económicas o tecnológicas, según corresponda.
          - Si las imágenes (${selected.map((article) => article.image).join(", ")}) o URLs (${selected.map((article) => article.url).join(", ")}) sugieren algo visual o contextual, incorpóralo narrativamente.
    
        4. **Extensión**: 
          - El artículo debe tener entre 800 y 1200 palabras para permitir profundidad y detalle.
    
        5. **Objetivo**: 
          - Crear un texto que sea informativo, persuasivo y memorable, digno de una publicación de prestigio global.
    
        Aquí están los datos completos de los artículos seleccionados para que los uses como base:
        ${selected.map((article) => `
          - Título: ${article.title}
          - Autor: ${article.author}
          - Fecha: ${article.publishedDate}
          - Texto: ${article.text.substring(0, 500)}... (resúmelo si es necesario)
          - URL: ${article.url}
          - Imagen: ${article.image}
          - Favicon: ${article.favicon}
        `).join("\n")}
    
        Genera el artículo completo ahora.
      `
    
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
            isSelected={finalSelections.includes(article.id)}
            onToggleSelect={handleToggleSelect}
          />
        ))}
      </div>

      {finalSelections.length > 0 && (
        <div className="flex fixed bottom-[6vh] left-[14vw] items-center gap-4 mt-6 p-4 bg-muted rounded-lg">
          <p className="font-medium">
            {finalSelections.length} artículo{finalSelections.length !== 1 ? "s" : ""} seleccionado
            {finalSelections.length !== 1 ? "s" : ""}
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
                <DialogDescription></DialogDescription>
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