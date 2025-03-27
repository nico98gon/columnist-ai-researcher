"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const titleFormSchema = z.object({
  count: z
    .number()
    .min(1, "Debes generar al menos 1 título")
    .max(10, "No puedes generar más de 10 títulos")
    .int("El número debe ser entero"),
})

type TitleFormData = z.infer<typeof titleFormSchema>

interface TitlesProps {
  articleContent: string | null
  onTitleSelect: (title: string) => void
}

export const Titles = ({ articleContent, onTitleSelect }: TitlesProps) => {
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([])
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TitleFormData>({
    resolver: zodResolver(titleFormSchema),
    defaultValues: { count: 3 },
  })

  const generateTitles = async (data: TitleFormData) => {
    if (!articleContent) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Genera ${data.count} títulos atractivos y variados basados en este contenido: "${articleContent.slice(0, 500)}". Devuélvelos en una lista numerada como: 1. Título 1\n2. Título 2\n...`,
            },
          ],
        }),
      })

      if (!response.ok) throw new Error("Error al generar títulos")

      const { text } = await response.json()
      console.log("Respuesta recibida:", text)

      const titles = text
        .split("\n")
        .filter((line: string) => line.match(/^\d+\.\s/))
        .map((line: string) => line.replace(/^\d+\.\s/, "").replace(/\*\*/g, ""))

      console.log("Títulos extraídos:", titles)

      setGeneratedTitles(titles)
      if (titles.length === 0) {
        toast.error("No se encontraron títulos en la respuesta")
      } else {
        toast.success("¡Títulos generados con éxito!")
      }
    } catch (error) {
      console.error("Error generando títulos:", error)
      toast.error("¡Error al generar títulos!")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTitleConfirm = () => {
    if (selectedTitle) {
      onTitleSelect(selectedTitle)
      setGeneratedTitles([])
      setSelectedTitle(null)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">
          Generar Títulos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[325px]">
        <DialogHeader>
          <DialogTitle>Generación de Títulos</DialogTitle>
          <DialogDescription>
            Especifica cuántos títulos deseas generar y selecciona el que más te guste.
          </DialogDescription>
        </DialogHeader>

        {!generatedTitles.length ? (
          <form onSubmit={handleSubmit(generateTitles)} className="space-y-4">
            <div>
              <Label htmlFor="count">Número de títulos</Label>
              <div className="flex items-center">
                <Input
                  id="count"
                  type="number"
                  {...register("count", { valueAsNumber: true })}
                  min={1}
                  max={10}
                  className="mt-1 max-w-16"
                  />
                {errors.count && (
                  <p className="text-red-500 text-sm mt-1">{errors.count.message}</p>
                  )}
                <Button type="submit" disabled={isLoading} className="ml-auto">
                  {isLoading ? "Generando..." : "Generar"}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <RadioGroup
              value={selectedTitle || ""}
              onValueChange={setSelectedTitle}
              className="max-h-[325px] overflow-y-scroll"
            >
              {generatedTitles.map((title, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={title} id={`title-${index}`} />
                  <Label htmlFor={`title-${index}`}>{title}</Label>
                </div>
              ))}
            </RadioGroup>
            <Button onClick={handleTitleConfirm} disabled={!selectedTitle}>
              Confirmar selección
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}