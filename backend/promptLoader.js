import fs from "fs";

export const SYSTEM_PROMPT = fs.readFileSync(
  "./bot_system_prompt.md",
  "utf-8"
);

export const BOT_INSTRUCTIONS = fs.readFileSync(
  "./bot_instructions.md",
  "utf-8"
);

export const URL_MAP = fs.readFileSync(
  "./kb_url_references.md",
  "utf-8"
);