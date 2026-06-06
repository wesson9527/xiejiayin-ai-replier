import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.join(__dirname, "site");
const skillPath = path.join(__dirname, "xiejiayin-ai-replier", "SKILL.md");
const referencesPath = path.join(__dirname, "xiejiayin-ai-replier", "references", "style-samples.md");

const port = Number(process.env.PORT || 8080);
const provider = (process.env.AI_PROVIDER || (process.env.DEEPSEEK_API_KEY ? "deepseek" : "openai")).toLowerCase();
const model =
  provider === "deepseek"
    ? process.env.DEEPSEEK_MODEL || "deepseek-v4-flash"
    : process.env.OPENAI_MODEL || "gpt-4.1-mini";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml; charset=utf-8",
  ".ico": "image/x-icon"
};

const templates = {
  complaint: [
    "收到，先抱歉让你体验不好。我帮你记录推进，操心的事我们来做{emoji}",
    "我看到了，先抱歉让你着急。你把最难用的点丢给我，我帮你同步团队{emoji}",
    "没关系，这条反馈我先记下。真实体验最重要，我们继续改{emoji}"
  ],
  support: [
    "收到，先抱歉让你等久了。我帮你记录推进，很快给你答复{emoji}",
    "先抱歉让你来回折腾。你先不用重复提交，我帮你确认，进展我来跟{emoji}",
    "理解你的感受，我先替你把这件事捋清楚，不让你白等{emoji}"
  ],
  feature: [
    "来了来了，已经在推进。我先帮你盯着，很快见惊喜{emoji}",
    "收到，这个需求我记下。真实反馈我都认真看，进展我来跟{emoji}",
    "很快。你先别急，操心的事我们来做{emoji}"
  ],
  crisis: [
    "我看到了，先抱歉让你着急。用户利益第一，我先同步团队核实，进展我来跟{emoji}",
    "这件事我不回避。能确认的我直接说，不能确认的我先推进{emoji}",
    "先把问题解决，再把体验补回来。这条我记下，不让你白反馈{emoji}"
  ],
  promo: [
    "你先体验，感受最重要。好用再安利，不好用我继续改{emoji}",
    "Bitget，来了就是VIP{emoji} 你先体验，真实反馈我都认真看。",
    "这波我先替大家踩坑推进。真实体验过关，再来安利{emoji}"
  ],
  tweet: [
    "谢家印AI上线：来了就是VIP，接住你的所有情绪。不还嘴、不抱怨、不下班{emoji}",
    "把用户吐槽丢进来，生成一条短、暖、稳的回复。真正有温度的是人，skill 只是小工具{emoji}",
    "社区运营每天都在接情绪。谢家印AI做的事很简单：先抱歉，再推进，最后把用户当VIP{emoji}"
  ]
};

const toneAddons = {
  xie: "",
  service: "你先别担心。",
  pr: "用户利益第一。",
  web3: "gm，收到。",
  redbook: "真实体验最重要。"
};

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(data));
}

function cleanReply(text) {
  return text.replace(/\s+/g, " ").replace(/\s+([，。！？])/g, "$1").trim();
}

function fallbackReplies({ message = "", scene = "complaint", tone = "xie", emoji = true, short = true }) {
  const selected = templates[scene] || templates.complaint;
  const mark = emoji ? "🩵" : "";
  return selected.map((line, index) => {
    let reply = line.replace("{emoji}", mark);

    if (tone !== "xie" && index === 0) reply = `${toneAddons[tone] || ""}${reply}`;
    if (tone === "web3" && scene !== "crisis" && index === 1) reply = `alpha 收到，我帮你盯。DYOR，别上头${mark}`;
    if (tone === "redbook" && scene !== "crisis" && index === 1) reply = `被种草可以，先小额体验。好用再安利，不好用我继续改${mark}`;
    if (short && reply.length > 68) reply = reply.replace("你把最难用的点丢给我，", "").replace("真实反馈我都认真看，", "");
    if (message.includes("钱包") && scene === "complaint" && index === 0) {
      reply = `收到，先抱歉让你体验不好。钱包最难用的点丢给我，我帮你记录推进${mark}`;
    }

    return cleanReply(reply);
  });
}

async function readRequestBody(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 20_000) throw new Error("request_too_large");
  }
  return JSON.parse(body || "{}");
}

function extractOutputText(data) {
  if (typeof data.output_text === "string" && data.output_text.trim()) return data.output_text.trim();

  const chunks = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) chunks.push(content.text);
      if (content.type === "text" && content.text) chunks.push(content.text);
    }
  }
  return chunks.join("\n").trim();
}

function parseReplies(text) {
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed.replies)) return parsed.replies.map(String).filter(Boolean).slice(0, 3);
  } catch {
    // Plain text fallback below.
  }

  return text
    .split(/\n+/)
    .map((line) => line.replace(/^\s*[-*\d.、)]+\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 3);
}

async function aiReplies(payload) {
  if (provider === "deepseek") return deepseekReplies(payload);
  return openaiReplies(payload);
}

function buildPromptParts(payload, skill, references) {
  const instructions = [
    skill,
    references.slice(0, 5000),
    "你现在为官网在线生成器服务。只输出 JSON，不要输出 Markdown。",
    "JSON 格式必须是：{\"replies\":[\"回复1\",\"回复2\",\"回复3\"]}。",
    "回复必须中文为主、短、暖、稳，不反击、不抱怨、不承诺未确认的赔偿或结果。"
  ].join("\n\n");

  const input = {
    message: payload.message,
    scene: payload.scene,
    tone: payload.tone,
    withEmoji: payload.emoji,
    shortFirst: payload.short
  };

  const userPrompt = `请根据以下用户原话和配置，生成 3 条谢家印AI风格回复：\n${JSON.stringify(input, null, 2)}`;
  return { instructions, userPrompt };
}

async function openaiReplies(payload) {
  if (!process.env.OPENAI_API_KEY) return null;

  const [skill, references] = await Promise.all([
    readFile(skillPath, "utf8"),
    readFile(referencesPath, "utf8").catch(() => "")
  ]);

  const { instructions, userPrompt } = buildPromptParts(payload, skill, references);

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model,
      instructions,
      input: userPrompt,
      max_output_tokens: 500
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`openai_${response.status}: ${errorText.slice(0, 300)}`);
  }

  const data = await response.json();
  const text = extractOutputText(data);
  const replies = parseReplies(text);
  return replies.length ? replies : null;
}

async function deepseekReplies(payload) {
  if (!process.env.DEEPSEEK_API_KEY) return null;

  const [skill, references] = await Promise.all([
    readFile(skillPath, "utf8"),
    readFile(referencesPath, "utf8").catch(() => "")
  ]);

  const { instructions, userPrompt } = buildPromptParts(payload, skill, references);
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: instructions },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`deepseek_${response.status}: ${errorText.slice(0, 300)}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content?.trim() || "";
  const replies = parseReplies(text);
  return replies.length ? replies : null;
}

async function handleApiReply(request, response) {
  try {
    const payload = await readRequestBody(request);
    const normalized = {
      message: String(payload.message || "").slice(0, 1000),
      scene: String(payload.scene || "complaint"),
      tone: String(payload.tone || "xie"),
      emoji: payload.emoji !== false,
      short: payload.short !== false
    };

    let replies = null;
    let source = "template";

    try {
      replies = await aiReplies(normalized);
      if (replies) source = "openai";
    } catch (error) {
      console.error(error.message);
    }

    if (!replies) replies = fallbackReplies(normalized);
    sendJson(response, 200, { replies, source });
  } catch (error) {
    sendJson(response, 400, { error: error.message || "bad_request" });
  }
}

async function serveStatic(request, response) {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  const pathname = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const filePath = path.normalize(path.join(siteDir, pathname));

  if (!filePath.startsWith(siteDir)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const content = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Cache-Control": ext === ".html" ? "no-store" : "public, max-age=3600"
    });
    response.end(content);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}

createServer((request, response) => {
  if (request.method === "GET" && request.url === "/healthz") {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === "POST" && request.url === "/api/reply") {
    void handleApiReply(request, response);
    return;
  }

  if (request.method === "GET" || request.method === "HEAD") {
    void serveStatic(request, response);
    return;
  }

  response.writeHead(405, { Allow: "GET, HEAD, POST" });
  response.end("Method not allowed");
}).listen(port, "0.0.0.0", () => {
  console.log(`xiejiayin-ai-replier listening on http://0.0.0.0:${port}`);
});
