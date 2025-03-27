"use client"

import { useState } from "react"
import { ChevronDown, ExternalLink } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

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

interface ArticleCardProps {
  article: Article
  isSelected: boolean
  onToggleSelect: (id: string) => void
}

export function ArticleCard({ article, isSelected, onToggleSelect }: ArticleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formattedDate = article.publishedDate
    ? format(new Date(article.publishedDate), "d 'de' MMMM, yyyy", { locale: es })
    : "Fecha no disponible"

  return (
    <Card className="w-full mb-4 overflow-hidden transition-all duration-200">
      <div className="flex items-start">
        <div className="flex-grow" onClick={() => setIsExpanded(!isExpanded)}>
          <CardHeader className="flex flex-row items-start gap-4 pb-2">
            {article.favicon && (
              <img
                src={article.favicon || "/placeholder.svg"}
                alt={`${article.author} favicon`}
                className="w-6 h-6 rounded-sm mt-1"
              />
            )}
            <div className="flex-grow">
              <CardTitle className="text-lg font-semibold line-clamp-1">{article.title}</CardTitle>
              <CardDescription className="flex items-center text-sm text-muted-foreground">
                <span>{article.author}</span>
                <span className="mx-2">•</span>
                <span>{formattedDate}</span>
              </CardDescription>
            </div>
            <ChevronDown
              className={cn(
                "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 cursor-pointer",
                isExpanded && "rotate-180",
              )}
            />
          </CardHeader>

          <CardContent className="pb-0">
            <div className="flex gap-4">
              {article.image && (
                <img
                  src={article.image || "/placeholder.svg"}
                  alt={article.title}
                  className="w-24 h-24 object-cover rounded-md"
                />
              )}
              <p className={cn("text-sm text-muted-foreground line-clamp-3", isExpanded && "line-clamp-none")}>
                {article.text}
              </p>
            </div>
          </CardContent>
        </div>

        <div className="pr-6 pt-6 flex items-center">
          <Switch
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(article.id)}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </div>

      <CardFooter className="flex justify-end">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-sm text-primary hover:underline"
        >
          Ver artículo original
          <ExternalLink className="ml-1 h-3 w-3" />
        </a>
      </CardFooter>
    </Card>
  )
}