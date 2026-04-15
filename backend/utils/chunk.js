export function chunkText(text, chunkSize = 500, overlap = 100) {
  const chunks = [];

  let start = 0;
  while (start < text.length) {
    let end = start + chunkSize;

    // ✅ Try to end at sentence boundary
    if (end < text.length) {
      const nextPeriod = text.indexOf(".", end);
      if (nextPeriod !== -1 && nextPeriod - end < 100) {
        end = nextPeriod + 1;
      }
    }

    const chunk = text.slice(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    // ✅ Overlap for context retention
    start += chunkSize - overlap;
  }

  return chunks;
}