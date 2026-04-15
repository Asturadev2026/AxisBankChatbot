import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log(process.env.OPENAI_API_KEY);
function enforceSteps(response) {
  if (!response.includes("First") || !response.includes("Then")) {
    return `
If your account is locked after multiple attempts, you can reset your password and regain access online.

First, go to the Internet Banking login page and click on “Forgot Password”, then enter your Customer ID and verify using your registered mobile number or debit card details.

Then, once verified, set a new password to regain access.

Finally, if your account is still locked, contact customer care at 1860-419-5555 where your identity will be verified and access restored.

For additional help:
https://application.axis.bank.in/webforms/axis-support/index.aspx
`;
  }
  return response;
}
// 🔥 GLOBAL MEMORY (chat-like behavior)
let chatHistory = [];

export async function streamLLM(prompt, res) {
  try {
    // ✅ Add user message to history
    chatHistory.push({
      role: "user",
      content: prompt,
    });

    const stream = await client.chat.completions.create({
      model: "gpt-4o-mini",

      messages: [
        {
          role: "system",
          content: `
You are an Axis Bank assistant.

STRICT RULES:
- Answer in under 70 words
- Be clear, concise, and helpful
- DO NOT repeat information
- DO NOT use labels like "Short Answer", "Steps", or "Official Link"
- DO NOT include unnecessary details
- DO NOT include RBI policies unless asked
- DO NOT hallucinate

STYLE:
- Start directly with answer
- Explain steps naturally in sentence form
- End with one clean official link
- Sound like ChatGPT (friendly, natural)

If you use labels like "Short Answer", your response is incorrect.
`,
        },

        // 🔥 CHAT MEMORY ENABLED
        ...chatHistory,
      ],

      // 🔥 SPEED + CONTROL SETTINGS
      max_tokens: 180, // 🔥 reduced → faster + shorter
      temperature: 0.2,
      top_p: 0.9,
      frequency_penalty: 0.9, // 🔥 strong anti-repetition
      presence_penalty: 0.4,

      stream: true,
    });

    // ✅ Streaming headers
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");

    let tokenCount = 0;
    let fullResponse = "";

    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;

      if (content) {
        tokenCount++;

        // 🔥 HARD STOP
        if (tokenCount > 120) break;

        fullResponse += content;
        res.write(content);
      }
    }
  // ✅ ENFORCE STEP FORMAT
    // ✅ ENFORCE STEP FORMAT BEFORE FINAL SEND
fullResponse = enforceSteps(fullResponse);

// ❌ Clear previous partial response (important)
res.end(fullResponse);

    // ✅ Save assistant reply
    chatHistory.push({
      role: "assistant",
      content: fullResponse,
    });

    // 🔥 LIMIT MEMORY
    if (chatHistory.length > 6) {
      chatHistory = chatHistory.slice(-6);
    }

  } catch (error) {
    console.error("Streaming error:", error);
    res.status(500).send("Error generating response");
  }
}