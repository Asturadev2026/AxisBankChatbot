import { pool } from "./db.js";

export async function hybridSearch(queryEmbedding, queryText) {
  // 🔥 Force clean numeric array
  const cleanArray = Array.from(queryEmbedding).map(Number);

  // 🔥 Convert to pgvector format
  const vector = `[${cleanArray.join(",")}]`;

  console.log("VECTOR SENT:", vector.slice(0, 100)); // debug

  const result = await pool.query(
    `
    SELECT content
    FROM knowledge_base
    ORDER BY embedding <-> $1::vector
    LIMIT 3;
    `,
    [vector]
  );

  return result.rows
  .map(r => r.content)
  .join("\n\n")
  .slice(0, 1200); // 🔥 LIMIT TOKENS
}