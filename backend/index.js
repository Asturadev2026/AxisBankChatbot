import OpenAI from "openai";
import dotenv from "dotenv";
import { SYSTEM_PROMPT, BOT_INSTRUCTIONS, URL_MAP } from "./promptLoader.js"; // ✅ ADDED

dotenv.config();
console.log("✅ index.js loaded");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ⚠️ SECURITY FIX: do NOT print full key
console.log("✅ OpenAI key loaded:", process.env.OPENAI_API_KEY?.slice(0, 10) + "...");

// 🔥 GLOBAL MEMORY (chat-like behavior)
let chatHistory = [];
function enforceStructure(response) {
  let text = response.trim();

  // 🔹 Extract sentences
  let sentences = text.split(/(?<=\.)\s+/);

  // ✅ PART 1 — Intro (first 1–2 sentences)
  let intro = sentences.slice(0, 2).join(" ");
  if (!intro || intro.length < 20) {
    intro = "Here’s how you can resolve your issue quickly and securely.";
  }

  // ✅ PART 2 — Steps (middle sentences)
  let steps = sentences.slice(2, 5).filter(s => s.length > 10);

  // fallback if no steps
  if (steps.length === 0) {
    steps = [
      "Open Axis Mobile App or Internet Banking and go to the relevant section",
      "Select the required option and enter details like OTP or card information",
      "Confirm the action and the system will process your request"
    ];
  }

  // ✅ PART 3 — Final part (last sentence with URL if exists)
  let urlMatch = text.match(/https?:\/\/[^\s]+/g);
  let url = urlMatch ? urlMatch[urlMatch.length - 1] : "";

  let final = "If you're unable to complete this online, contact customer care at 1860-419-5555 where your identity will be verified and the issue will be resolved.";

  // 🔹 Build response
  let formatted = "";

  // Paragraph
  formatted += `${intro.trim()}\n\n`;

  // Steps
  steps.forEach(step => {
  formatted += `\n• ${step.trim()}`;
});
formatted += `\n\n`;

  // Final paragraph
  formatted += `${final}\n`;

  if (url) {
    formatted += `\n${url}\n`;
  }

  // Follow-up
  formatted += `\nWould you like help checking recent transactions or reporting any suspicious activity?`;

  return formatted;
}
export async function streamLLM(prompt, res) {
  try {
    // ✅ Add user message to history
    chatHistory.push({
      role: "user",
      content: prompt,
    });

    const stream = await client.chat.completions.create({
      model: "gpt-4o",

      messages: [
        {
          role: "system",
          content: `
${SYSTEM_PROMPT}

${BOT_INSTRUCTIONS}

🔴 AXIS BANK URL REFERENCE (STRICT - DO NOT IGNORE)
${URL_MAP}

--------------------------------------------------

You are an Axis Bank assistant.

STRICT RULES:
- Answer in under 70 words
- Be concise, clear, and helpful
- DO NOT repeat information
- DO NOT use labels like "Short Answer", "Steps", or "Official Link"
- DO NOT include unnecessary details
- DO NOT include RBI policies unless asked
- DO NOT hallucinate
- Use ONLY provided context

🔴 LINK FORMAT (STRICT):
- Always return URLs as plain text
- Do NOT use markdown format
- Do NOT wrap URLs in brackets
- URL must be directly clickable in plain text

🔴 URL VALIDITY RULE:
- Avoid URLs that require login/session (like cc-statement.aspx)
- Prefer publicly accessible support pages (sub-issues links)
- If a URL leads to error page, switch to alternate verified URL

🔴 CRITICAL URL RULES (VERY IMPORTANT):
- You MUST ONLY use URLs from the AXIS BANK URL REFERENCE above
- NEVER generate or guess URLs
- NEVER default to https://www.axisbank.com unless explicitly needed
- Identify user intent → match correct section from URL reference
- fraud / failed transaction → use dispute or fraud URL
- billing → use statement/payment URL
- eligibility → use eligibility URL
- account/card issue → use support portal or card services link
- If exact URL not found → use:
  https://application.axis.bank.in/webforms/axis-support/index.aspx

🔴 RESPONSE STRUCTURE (VERY IMPORTANT):
- Start with 1–2 lines explaining the situation clearly
- Then provide step-by-step guidance using “First → Then → Finally”
- Then provide customer care number (if needed)
- Then provide the correct URL at the end
- DO NOT jump directly to links without explanation

🔴 SELF-SERVICE PRIORITY RULE:
- Always prioritize resolving the user’s issue through self-service (Internet Banking or Axis Mobile App) whenever possible
- Clearly guide the user on where to navigate (e.g., Cards section, Profile settings, Payments, etc.)
- Only after self-service steps, provide support portal link
- Always keep calling customer care as the final fallback option only

🔴 STEP GUIDANCE RULE:
- When the query involves an action, provide a clear step-by-step flow in natural sentences (no bullets or numbering)
- Structure the guidance logically using “First → Then → Finally”
- Include all essential steps required to fully resolve the issue (navigation, verification, action, confirmation)
- Mention what the user may need (e.g., Customer ID, OTP, card details) if relevant
- Briefly explain what will happen after each step so the user knows what to expect
- Ensure the steps are complete enough that the user can solve the issue without external help
- Keep the explanation concise (2–3 lines), but do not skip critical steps

🔴 POST-ACTION GUIDANCE RULE:
- After suggesting a call, briefly explain what will happen next
- Mention identity verification, reference number, or next step outcome
- Keep it short (1–2 lines), but informative

🔴 RESPONSE QUALITY RULE:
- Always make the user understand what happened and what to do
- Do not behave like a redirect system
- Provide helpful guidance before giving the link
- Keep explanation short but meaningful (2–3 lines max)

🔴 MULTI-INTENT RULE:
- If user asks multiple things, handle them in logical order
- Prioritize urgent issues first (fraud > failed transaction > general queries)
- Combine into one structured flow using First → Then → Finally

🔴 MANDATORY ENFORCEMENT RULE (CRITICAL):
- Every response MUST include “First”, “Then”, and “Finally”
- If missing, the answer is INVALID and must be rewritten
- You MUST include:
  - where to go (Internet Banking / Axis Mobile App / section name)
  - what to enter (Customer ID / OTP / card details if applicable)
  - what happens after the action (confirmation / resolution)

🔴 SELF-CHECK BEFORE RESPONSE:
- Check if “First → Then → Finally” is present → if NO, rewrite
- Check if explanation is before steps → if NO, fix
- Check if customer care is after steps → if NO, fix
- Check if URL is at the end → if NO, fix
- Do NOT return incomplete answers

🔴 FOLLOW-UP ENGAGEMENT RULE:
- After providing a solution, always ask 1 relevant follow-up question
- Suggest next logical actions (e.g., check statement, report fraud, request replacement)
- Keep it short and helpful (1 sentence)
- Do NOT ask generic questions like “anything else?”

🔴 UI NAVIGATION ENFORCEMENT RULE:
- When suggesting Axis Mobile App or Internet Banking, you MUST provide exact navigation steps
- Always include section flow like:
  Cards → Select Card → Controls → Enable Online/International Usage
- Generic instructions like “go to app and enable settings” are NOT allowed

🔴 EXAMPLE (MANDATORY STYLE):

If your card is not working for online transactions, it may be due to disabled settings.

First, open the Axis Mobile App or Internet Banking and go to the Cards section, then select your credit card and navigate to Card Controls where you can enable online transactions and international usage.

Then, once enabled, your card will start working for online and international payments.

Finally, download your recent statement here to verify transactions:
https://application.axis.bank.in/webforms/axis-support/sub-issues/Cards-Credit-statement-2.aspx

If you're unable to enable these settings, call 1860-419-5555 where your details will be verified and the feature will be activated.

🔴 EXAMPLE OF CORRECT RESPONSE:

If your account is locked after multiple attempts, you can reset your password and unlock access online.

First, go to the Internet Banking login page and click on “Forgot Password”, then enter your Customer ID and verify using your registered mobile number or debit card details.

Then, once verified, set a new password to regain access.

Finally, if you're unable to complete this, call 1860-419-5555 where your identity will be verified and access restored.

For additional help:
https://application.axis.bank.in/webforms/axis-support/index.aspx

If the response does NOT contain “First”, “Then”, or “Finally”, rewrite the answer before responding.

STYLE:
- Start directly with the answer
- Explain steps naturally in sentences (no headings)
- End with URL
- Sound natural and human

If you use wrong or generic URL, your answer is incorrect.
`,
        },

        // 🔥 CHAT MEMORY ENABLED
        ...chatHistory,
      ],

      // 🔥 SPEED + CONTROL SETTINGS
      max_tokens: 260,
      temperature: 0.2,
      top_p: 0.9,
      frequency_penalty: 0.9,
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
    fullResponse += content;
  }
}

    
fullResponse = enforceStructure(fullResponse);
const parts = fullResponse.split("\n\n");

// ✅ Show intro immediately
res.write(parts[0] + "\n\n");


const remaining = parts.slice(1).join("\n\n");

// 🔥 Smooth typing (balanced speed)
for (let char of remaining) {
  res.write(char);
  await new Promise(r => setTimeout(r, 20)); // slower + readable
}

res.end();
    // ✅ Save assistant reply to memory
    chatHistory.push({
      role: "assistant",
      content: fullResponse,
    });

    // 🔥 LIMIT MEMORY (VERY IMPORTANT)
    if (chatHistory.length > 6) {
      chatHistory = chatHistory.slice(-6);
    }

  } catch (error) {
    console.error("Streaming error:", error);
    res.status(500).send("Error generating response");
  }
}

import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// simple test route
app.get("/", (req, res) => {
  res.send("Server running");
});

// chat route
app.post("/chat", async (req, res) => {
  const { query } = req.body;
  await streamLLM(query, res);
});

// ✅ THIS MUST BE OUTSIDE
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});