"use server"

import dotenv from "dotenv"
import Exa from "exa-js"

dotenv.config()

const exa = new Exa(process.env.EXA_API_KEY)

interface SearchOptions {
  numArticles?: number
  minWords?: number
  maxWords?: number
  keywords?: string
  recentMonths?: number
  text?: boolean
  livecrawl?: boolean
}

export async function searchAction(query: string, options: SearchOptions = {}) {
  try {
    let livecrawlValue: "never" | "fallback" | "always" | "auto" = "auto"
    if (options.livecrawl === true) {
      livecrawlValue = "always"
    } else if (options.livecrawl === false) {
      livecrawlValue = "never"
    }

    const exaOptions: any = {
      type: "auto",                             // Automático para elegir entre neural y keyword
      numResults: options.numArticles || 10,    // Limitar resultados iniciales para optimizar
      text: true,                               // Obtener texto completo
      useAutoprompt: true,                      // Mejorar la query automáticamente
      contents: {
        text: true,
        livecrawl: livecrawlValue,  // Permite rastreo en tiempo real
        livecrawlTimeout: 5000,     // Tiempo de límite de 5 segundos por rastreo
      },
    }

    // Filtro por fecha de publicación
    if (options.recentMonths) {
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - options.recentMonths)
      exaOptions.startPublishedDate = startDate.toISOString().split("T")[0]
    }

    // Filtro por palabras clave
    if (options.keywords) {
      const keywordArray = options.keywords.split(",").map(k => k.trim()).filter(k => k.length > 0)
      if (keywordArray.length > 0) {
        // Exa solo soporta 1 string en includeText (hasta 5 palabras)
        exaOptions.includeText = [keywordArray.slice(0, 5).join(" ")]
      }
    }

    const result = await exa.searchAndContents(query, exaOptions)

    // Filtrar por conteo de palabras (no soportado nativamente por Exa)
    let filteredResults = result.results
    if (options.minWords || options.maxWords) {
      filteredResults = filteredResults.filter((item: any) => {
        if (!item.text) return false
        const wordCount = item.text.split(/\s+/).length
        
        const meetsMin = options.minWords ? wordCount >= options.minWords : true
        const meetsMax = options.maxWords ? wordCount <= options.maxWords : true
        
        return meetsMin && meetsMax
      })
    }

    return { 
      success: true, 
      data: filteredResults 
    }
  } catch (error) {
    console.error("Error fetching from Exa API:", error)
    return { 
      success: false, 
      error: "Failed to fetch data" 
    }
  }
}