import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getEmbedding(text) {
  try {
    const response = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    return response.data[0].embedding; // ✅ no need for Array.from

  } catch (error) {
    console.error("Embedding error:", error.message);
    throw error;
  }
}