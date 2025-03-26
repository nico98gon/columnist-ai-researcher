"use client"

import ReactMarkdown from "react-markdown"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { use } from "react"
import { Copy, Loader, Save } from "lucide-react"
import MdEditor from "react-markdown-editor-lite"
import "react-markdown-editor-lite/lib/index.css"
import MarkdownIt from "markdown-it"
import { toast } from "sonner"
import { Titles } from "../components/Titles"

interface ArticlePageProps {
  params: Promise<{ id: string }>
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const { id } = use(params)
  const [articleContent, setArticleContent] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedTitle, setSelectedTitle] = useState<string>("Artículo Generado")

  const mdParser = new MarkdownIt({ html: true, linkify: true, typographer: true })

  useEffect(() => {
    const content = localStorage.getItem(`article_${id}`)
    setArticleContent(content)
    if (!content) {
      notFound()
    }
  }, [id])

  const handleCopy = async () => {
    if (articleContent) {
      try {
        await navigator.clipboard.writeText(articleContent)
        toast.success("¡Copiado al portapapeles!")
      } catch (err) {
        console.error("Error al copiar:", err)
        toast.error("¡Error al copiar!")
      }
    }
  }

  const handleEditorChange = ({ text }: { text: string }) => {
    setArticleContent(text)
  }

  const handleSave = () => {
    if (articleContent) {
      localStorage.setItem(`article_${id}`, articleContent)
      setIsEditing(false)
      toast.success("¡Artículo guardado!")
    }
  }

  const handleTitleSelect = (title: string) => {
    setSelectedTitle(title)

    if (articleContent) {
      const updatedContent = articleContent.replace(/^# .*$/m, `# ${title}`)
      setArticleContent(updatedContent)
      localStorage.setItem(`article_${id}`, updatedContent)
    }
  }

  if (!articleContent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader className="animate-spin" size={40} />
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex">
          <Link href="/">
            <Button className="mb-4 cursor-pointer">Volver al inicio</Button>
          </Link>
          <div className="ml-auto">
            <Titles articleContent={articleContent} onTitleSelect={handleTitleSelect} />
          </div>
        </div>
        <div className="flex justify-between items-center gap-4">
          <h1 className="text-3xl font-bold mb-6">{selectedTitle}</h1>
          {!isEditing && (
            <>
              <Button
                className="mb-4 cursor-pointer ml-auto"
                variant="secondary"
                onClick={() => setIsEditing(true)}
              >
                Editar
              </Button>
              <Button className="mb-4 cursor-pointer" onClick={handleCopy}>
                <Copy size={20} />
              </Button>
            </>
          )}
          {isEditing && (
            <Button className="mb-4 cursor-pointer" onClick={handleSave}>
              <Save size={20} />
            </Button>
          )}
        </div>

        {isEditing ? (
          <MdEditor
            value={articleContent}
            style={{ height: "500px" }}
            renderHTML={(text) => mdParser.render(text)}
            onChange={handleEditorChange}
          />
        ) : (
          <div className="prose prose-lg p-6 rounded-lg shadow-md">
            <ReactMarkdown>{articleContent}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}