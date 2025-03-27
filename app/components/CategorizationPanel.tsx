"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSearchStore } from "@/store/searchStore"
import { useClassificationStore } from "@/store/classificationStore"
import { ArrowBigDown, Plus, Trash2 } from "lucide-react"

export function CategorizationPanel() {
  const { mode, setMode, setHeuristicRules, classifyArticles } = useClassificationStore()
  const { result } = useSearchStore()
  const [rules, setRules] = useState<{ field: string; operator: string; value: string }[]>([])

  const handleAddRule = () => {
    setRules([...rules, { field: "text", operator: "contains", value: "" }])
  }

  const handleRuleChange = (index: number, key: string, value: string) => {
    const newRules = [...rules]
    newRules[index] = { ...newRules[index], [key]: value }
    setRules(newRules)
  }

  const handleDeleteRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index))
  }

  const handleApply = () => {
    if (mode === "heuristic") {
      const formattedRules = rules.map((rule) => ({
        field: rule.field as "text" | "wordCount" | "publishedDate",
        operator: rule.operator as "contains" | ">" | "<" | ">=" | "<=",
        value: rule.field === "text" ? rule.value : Number(rule.value),
      }))
      setHeuristicRules(formattedRules)
    }
    if (result) {
      classifyArticles(result)
    }
  }

  return (
    <div className="w-full h-full p-6">
      <Tabs defaultValue="programmatic" onValueChange={(value) => setMode(value as "programmatic" | "heuristic")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="programmatic">Modo Programático</TabsTrigger>
          <TabsTrigger value="heuristic">Modo Heurístico</TabsTrigger>
        </TabsList>
        <TabsContent value="programmatic">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Criterios Predefinidos</h3>
            <ul className="list-disc pl-5">
              <li>Resultados con más de 500 palabras</li>
              <li>Publicado en los últimos 6 meses</li>
              <li>Tiene una fecha de publicación válida</li>
            </ul>
            <Button onClick={handleApply}>Aplicar</Button>
          </div>
        </TabsContent>
        <TabsContent value="heuristic">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Reglas Personalizadas</h3>
            <div className="max-h-44 overflow-y-scroll space-y-4">
              {rules.map((rule, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Select
                    value={rule.field}
                    onValueChange={(value) => handleRuleChange(index, "field", value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Campo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texto</SelectItem>
                      <SelectItem value="wordCount">Conteo de palabras</SelectItem>
                      <SelectItem value="publishedDate">Meses recientes</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={rule.operator}
                    onValueChange={(value) => handleRuleChange(index, "operator", value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Operador" />
                    </SelectTrigger>
                    <SelectContent>
                      {rule.field === "text" ? (
                        <SelectItem value="contains">Contiene</SelectItem>
                      ) : (
                        <>
                          <SelectItem value=">">Mayor que</SelectItem>
                          <SelectItem value="<">Menor que</SelectItem>
                          <SelectItem value=">=">Mayor o igual que</SelectItem>
                          <SelectItem value="<=">Menor o igual que</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <Input
                    value={rule.value}
                    onChange={(e) => handleRuleChange(index, "value", e.target.value)}
                    placeholder={rule.field === "text" ? "Palabra" : "Número"}
                    className="w-[180px]"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteRule(index)}
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-6">
              <Button variant="outline" onClick={handleAddRule}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Regla
              </Button>
              <Button onClick={handleApply}>
                <ArrowBigDown className="mr-2 h-4 w-4" />
                Aplicar
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}