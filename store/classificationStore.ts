import { create } from "zustand"

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

type Rule = {
  field: "text" | "wordCount" | "publishedDate"
  operator: "contains" | ">" | "<" | ">=" | "<="
  value: string | number
}

interface ClassificationState {
  mode: "programmatic" | "heuristic"
  heuristicRules: Rule[]
  selectedArticleIds: string[]
  setMode: (mode: "programmatic" | "heuristic") => void
  setHeuristicRules: (rules: Rule[]) => void
  classifyArticles: (articles: Article[]) => void
}

export const useClassificationStore = create<ClassificationState>((set) => ({
  mode: "programmatic",
  heuristicRules: [],
  selectedArticleIds: [],
  setMode: (mode) => set({ mode }),
  setHeuristicRules: (rules) => set({ heuristicRules: rules }),
  classifyArticles: (articles) => {
    set((state) => {
      let selectedIds: string[] = []

      if (state.mode === "programmatic") {
        selectedIds = articles
          .filter((article) => {
            const wordCount = article.text.split(/\s+/).length
            const hasValidDate = article.publishedDate && !isNaN(new Date(article.publishedDate).getTime())
            const recentDate = new Date()
            recentDate.setMonth(recentDate.getMonth() - 6)
            const publishedDate = hasValidDate ? new Date(article.publishedDate) : null

            return (
              wordCount > 500 &&
              hasValidDate &&
              publishedDate && publishedDate >= recentDate
            )
          })
          .map((article) => article.id)
      } else if (state.mode === "heuristic") {
        selectedIds = articles
          .filter((article) => {
            return state.heuristicRules.every((rule) => {
              if (rule.field === "text" && rule.operator === "contains") {
                return article.text.toLowerCase().includes((rule.value as string).toLowerCase())
              }
              if (rule.field === "wordCount") {
                const wordCount = article.text.split(/\s+/).length
                const value = Number(rule.value)
                switch (rule.operator) {
                  case ">": return wordCount > value
                  case "<": return wordCount < value
                  case ">=": return wordCount >= value
                  case "<=": return wordCount <= value
                  default: return true
                }
              }
              if (rule.field === "publishedDate") {
                const dateValue = new Date()
                dateValue.setMonth(dateValue.getMonth() - Number(rule.value))
                const publishedDate = new Date(article.publishedDate)
                switch (rule.operator) {
                  case ">": return publishedDate > dateValue
                  case "<": return publishedDate < dateValue
                  default: return true
                }
              }
              return true
            })
          })
          .map((article) => article.id)
      }

      return { selectedArticleIds: selectedIds }
    })
  },
}))