"use server"

import dotenv from "dotenv"
import Exa from "exa-js"

dotenv.config()

const exa = new Exa(process.env.EXA_API_KEY)

export async function searchAction(query: string) {
  try {
    const result = await exa.searchAndContents(query, {
      type: "auto",
      text: true,
    })
    return { success: true, data: result.results }
  } catch (error) {
    console.error("Error fetching from Exa API:", error)
    return { success: false, error: "Failed to fetch data" }
  }
}