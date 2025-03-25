// components/SearchForm.tsx
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { searchAction } from "@/actions/search"
import { Ban, Loader } from "lucide-react"
import { toast } from "sonner"
import { useSearchStore } from "@/store/searchStore"

const formSchema = z.object({
  query: z.string().min(2, {
    message: "La consulta debe tener al menos 2 caracteres.",
  }),
})

export function SearchForm() {
  const { setResult, setError, setLoading, loading } = useSearchStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    const response = await searchAction(values.query)
    if (response.success) {
      setResult(response.data)
    } else {
      setError(response.error || "Error desconocido")
      toast.error('¡Error!', {
        description: 'Ocurrió un error al buscar, intenta de nuevo más tarde o contacta a soporte',
        icon: <Ban size={20} className="text-red-500" />,
      })
    }
    setLoading(false)
  }

  return (
    <div className="flex-grow flex flex-col justify-end items-center p-6 gap-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex items-center justify-center min-w-sm max-w-3xl gap-4"
        >
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem className="md:min-w-sm">
                <FormControl>
                  <Input
                    placeholder="¿Qué tema investigamos hoy?"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          {!loading && <Button type="submit">Buscar</Button>}
          {loading && <Loader className="animate-spin" />}
        </form>
      </Form>
    </div>
  )
}