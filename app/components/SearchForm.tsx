"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Ban, ChevronDown, ChevronUp, Loader, Search } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useSearchStore } from "@/store/searchStore"
import { searchAction } from "@/actions/search"

const formSchema = z.object({
  query: z.string().min(2, {
    message: "La consulta debe tener al menos 2 caracteres.",
  }),
  numArticles: z.object({
    enabled: z.boolean().default(false),
    value: z.string().optional(),
  }),
  minWords: z.object({
    enabled: z.boolean().default(false),
    value: z.string().optional(),
  }),
  maxWords: z.object({
    enabled: z.boolean().default(false),
    value: z.string().optional(),
  }),
  keywords: z.object({
    enabled: z.boolean().default(false),
    value: z.string().optional(),
  }),
  recentMonths: z.object({
    enabled: z.boolean().default(false),
    value: z.string().optional(),
  }),
  livecrawl: z.object({
    enabled: z.boolean().default(false),
    value: z.boolean().default(true),
  }),
})

export function SearchForm() {
  const { setResult, setError, setLoading, loading } = useSearchStore()
  const [showAdvanced, setShowAdvanced] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
      numArticles: { enabled: false, value: "10" },
      minWords: { enabled: false, value: "500" },
      maxWords: { enabled: false, value: "1000" },
      keywords: { enabled: false, value: "" },
      recentMonths: { enabled: false, value: "6" },
      livecrawl: { enabled: false, value: true },
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)

    try {
      const response = await searchAction(values.query, {
        numArticles: values.numArticles.enabled ? Number(values.numArticles.value) : undefined,
        minWords: values.minWords.enabled ? Number(values.minWords.value) : undefined,
        maxWords: values.maxWords.enabled ? Number(values.maxWords.value) : undefined,
        keywords: values.keywords.enabled ? values.keywords.value : undefined,
        recentMonths: values.recentMonths.enabled ? Number(values.recentMonths.value) : undefined,
        livecrawl: values.livecrawl.enabled ? values.livecrawl.value : undefined,
      })

      if (response.success) {
        setResult(response.data)
      } else {
        setError(response.error || "Error desconocido")
        toast.error("¡Error!", {
          description: "Ocurrió un error al buscar, intenta de nuevo más tarde o contacta a soporte",
          icon: <Ban size={20} className="text-red-500" />,
        })
      }
    } catch (error) {
      setError("Error al procesar la solicitud")
      toast.error("¡Error!", {
        description: "Ocurrió un error al buscar, intenta de nuevo más tarde o contacta a soporte",
        icon: <Ban size={20} className="text-red-500" />,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-grow flex flex-col justify-end items-center p-6 gap-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4 min-w[900px]">
            <Button
              type="button"
              variant="outline"
              className="w-full flex justify-between"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <span>Filtros avanzados</span>
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {showAdvanced && (
              <div className="space-y-6 p-4 border rounded-md bg-muted/30 max-h-80 overflow-y-scroll">
                <FormField
                  control={form.control}
                  name="numArticles"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center space-x-3">
                        <FormControl>
                          <Switch
                            checked={field.value.enabled}
                            onCheckedChange={(checked) =>
                              field.onChange({ ...field.value, enabled: checked })
                            }
                          />
                        </FormControl>
                        <FormLabel className="flex-1">Cantidad de artículos</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="w-24"
                            disabled={!field.value.enabled}
                            value={field.value.value || ""}
                            onChange={(e) =>
                              field.onChange({ ...field.value, value: e.target.value })
                            }
                          />
                        </FormControl>
                      </div>
                      <FormDescription>Filtra por cantidad de artículos</FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minWords"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center space-x-3">
                        <FormControl>
                          <Switch
                            checked={field.value.enabled}
                            onCheckedChange={(checked) =>
                              field.onChange({ ...field.value, enabled: checked })
                            }
                          />
                        </FormControl>
                        <FormLabel className="flex-1">Artículos con más de</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="w-24"
                            disabled={!field.value.enabled}
                            value={field.value.value || ""}
                            onChange={(e) =>
                              field.onChange({ ...field.value, value: e.target.value })
                            }
                          />
                        </FormControl>
                        <span>palabras</span>
                      </div>
                      <FormDescription>Filtra por longitud mínima de artículos</FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxWords"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center space-x-3">
                        <FormControl>
                          <Switch
                            checked={field.value.enabled}
                            onCheckedChange={(checked) =>
                              field.onChange({ ...field.value, enabled: checked })
                            }
                          />
                        </FormControl>
                        <FormLabel className="flex-1">Artículos con menos de</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="w-24"
                            disabled={!field.value.enabled}
                            value={field.value.value || ""}
                            onChange={(e) =>
                              field.onChange({ ...field.value, value: e.target.value })
                            }
                          />
                        </FormControl>
                        <span>palabras</span>
                      </div>
                      <FormDescription>Filtra por longitud máxima de artículos</FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="keywords"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center space-x-3">
                        <FormControl>
                          <Switch
                            checked={field.value.enabled}
                            onCheckedChange={(checked) =>
                              field.onChange({ ...field.value, enabled: checked })
                            }
                          />
                        </FormControl>
                        <FormLabel className="flex-1">Palabras clave</FormLabel>
                        <FormControl>
                          <Input
                            className="w-64"
                            disabled={!field.value.enabled}
                            value={field.value.value || ""}
                            onChange={(e) =>
                              field.onChange({ ...field.value, value: e.target.value })
                            }
                            placeholder="ej: tecnología, IA, futuro"
                          />
                        </FormControl>
                      </div>
                      <FormDescription>
                        Ingresa palabras clave separadas por comas
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recentMonths"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center space-x-3">
                        <FormControl>
                          <Switch
                            checked={field.value.enabled}
                            onCheckedChange={(checked) =>
                              field.onChange({ ...field.value, enabled: checked })
                            }
                          />
                        </FormControl>
                        <FormLabel className="flex-1">Publicado en los últimos</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="w-24"
                            disabled={!field.value.enabled}
                            value={field.value.value || ""}
                            onChange={(e) =>
                              field.onChange({ ...field.value, value: e.target.value })
                            }
                          />
                        </FormControl>
                        <span>meses</span>
                      </div>
                      <FormDescription>Filtra por fecha de publicación reciente</FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="livecrawl"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center space-x-3">
                        <FormControl>
                          <Switch
                            checked={field.value.enabled}
                            onCheckedChange={(checked) =>
                              field.onChange({ ...field.value, enabled: checked })
                            }
                          />
                        </FormControl>
                        <FormLabel className="flex-1">Rastreo en tiempo real</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value.value}
                            onCheckedChange={(checked) =>
                              field.onChange({ ...field.value, value: checked })
                            }
                            disabled={!field.value.enabled}
                          />
                        </FormControl>
                        <span>{field.value.value ? "Siempre" : "Nunca"}</span>
                      </div>
                      <FormDescription>
                        Activa para decidir si rastrear páginas en tiempo real. Por defecto, se decide automáticamente.
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Consulta de búsqueda</FormLabel>
                <div className="flex gap-2 min-w-[350px] sm:min-w-[675px]">
                  <FormControl>
                    <Input placeholder="¿Qué tema investigamos hoy?" className="flex-1" {...field} />
                  </FormControl>
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                    Buscar
                  </Button>
                </div>
                <FormDescription>Ingresa el tema o palabras clave que deseas investigar</FormDescription>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  )
}