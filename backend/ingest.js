import fs from "fs";
import { pool } from "./db.js";
import { chunkText } from "./utils/chunk.js";
import { getEmbedding } from "./embedding.js";

// ✅ NEW: Map file → intent + default URL
function getMetadataFromFile(filePath) {
  if (filePath.includes("kb_01")) {
    return {
      intent: "product-info",
      url: "https://www.axisbank.com/retail/cards/credit-card",
    };
  }

  if (filePath.includes("kb_02")) {
    return {
      intent: "eligibility",
      url: "https://www.axisbank.com/progress-with-us-articles/managing-credit/credit-card-eligibility",
    };
  }

  if (filePath.includes("kb_03")) {
    return {
      intent: "fees-charges",
      url: "https://www.axisbank.com/retail/cards/credit-card/axis-bank-ace-credit-card/fees-and-charges",
    };
  }

  if (filePath.includes("kb_04")) {
    return {
      intent: "rewards",
      url: "https://www.axisbank.com/axis-edge-rewards",
    };
  }

  if (filePath.includes("kb_05")) {
    return {
      intent: "billing-payment",
      // ❌ OLD (BROKEN)
      // url: "https://application.axis.bank.in/webforms/axis-support/cc-statement.aspx",

      // ✅ NEW (WORKING PUBLIC PAGE)
      url: "https://application.axis.bank.in/webforms/axis-support/sub-issues/Cards-Credit-statement-2.aspx",
    };
  }

  if (filePath.includes("kb_06")) {
    return {
      intent: "fraud-security",
      url: "https://application.axis.bank.in/webforms/axis-support/report-fraud-dispute.aspx",
    };
  }

  if (filePath.includes("kb_07")) {
    return {
      intent: "regulatory-rights",
      url: "https://www.axisbank.com/contact-us/grievance-redressal/retail-banking-grievance-redressal",
    };
  }

  if (filePath.includes("kb_08")) {
    return {
      intent: "account-mgmt",
      url: "https://application.axis.bank.in/webforms/axis-support/index.aspx",
    };
  }

  // fallback
  return {
    intent: "general",
    url: "https://application.axis.bank.in/webforms/axis-support/index.aspx",
  };
}

// ✅ NEW: Extra safety layer for bad URLs
function sanitizeUrl(url, intent) {
  // avoid known broken/session-based URLs
  if (url.includes("cc-statement.aspx")) {
    return "https://application.axis.bank.in/webforms/axis-support/sub-issues/Cards-Credit-statement-2.aspx";
  }

  // fallback safety
  if (!url || url.trim() === "") {
    return "https://application.axis.bank.in/webforms/axis-support/index.aspx";
  }

  return url;
}

async function ingest(filePath) {
  console.log(`📂 Processing: ${filePath}`);

  const text = fs.readFileSync(filePath, "utf-8");
  const chunks = chunkText(text);

  console.log(`✂️ Total chunks: ${chunks.length}`);

  // ✅ NEW: get metadata
  let { intent, url } = getMetadataFromFile(filePath);

  // ✅ NEW: sanitize URL once
  url = sanitizeUrl(url, intent);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    try {
      const embedding = await getEmbedding(chunk);

      // ✅ SAFETY CHECK (VERY IMPORTANT)
      if (embedding.length !== 1536) {
        console.error("❌ Wrong embedding dimension:", embedding.length);
        continue;
      }

      // ✅ OPTIONAL SMART OVERRIDE (based on chunk content)
      let finalUrl = url;

      if (intent === "billing-payment") {
        if (chunk.toLowerCase().includes("statement")) {
          finalUrl = "https://application.axis.bank.in/webforms/axis-support/sub-issues/Cards-Credit-statement-2.aspx";
        }
      }

      await pool.query(
        `INSERT INTO knowledge_base (content, embedding, source_url, intent)
         VALUES ($1, $2::vector, $3, $4)`,
        [
          chunk,
          `[${embedding.join(",")}]`, // ✅ FIXED FORMAT
          finalUrl,                  // ✅ UPDATED
          intent                     // ✅ NEW
        ]
      );

      console.log(`✅ Inserted chunk ${i + 1}/${chunks.length}`);

    } catch (err) {
      console.error("❌ Error inserting chunk:", err.message);
    }
  }
}

async function run() {
  console.log("🚀 Starting ingestion...");

  await ingest("./kb_01_credit_card_products.md");
  await ingest("./kb_02_eligibility_application.md");
  await ingest("./kb_03_fees_charges.md");
  await ingest("./kb_04_rewards_benefits.md");
  await ingest("./kb_05_billing_payments.md");
  await ingest("./kb_06_disputes_fraud_security.md");
  await ingest("./kb_07_rbi_regulations.md");
  await ingest("./kb_08_account_management.md");

  console.log("🎉 Ingestion complete!");
  process.exit();
}

run();