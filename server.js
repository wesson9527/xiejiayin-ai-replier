import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.join(__dirname, "site");
const personaConfigs = {
  xiejiayin: {
    label: "谢家印AI",
    skillPath: path.join(__dirname, "xiejiayin-ai-replier", "SKILL.md"),
    referencePaths: [path.join(__dirname, "xiejiayin-ai-replier", "references", "style-samples.md")]
  },
  kajiq: {
    label: "卡姐AI",
    skillPath: path.join(__dirname, "kajiq-ai-replier", "SKILL.md"),
    referencePaths: [
      path.join(__dirname, "kajiq-ai-replier", "references", "kajiq-style-samples.md"),
      path.join(__dirname, "kajiq-ai-replier", "references", "content-library.md")
    ]
  }
};

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

const kajiqTemplates = {
  complaint: [
    "诶诶，宝子先别急。卡姐帮你记下，找对应团队看一下{emoji}",
    "收到，这条体验不该让你来回折腾。你把截图和钱包 ID 发我，卡姐帮你核实{emoji}",
    "别怕，能确认的卡姐直接说，不能确认的我先帮你推进{emoji}"
  ],
  support: [
    "宝子先别急，卡姐看到了。你把页面截图和钱包 ID 发我，我去帮你确认{emoji}",
    "收到，卡姐立刻反馈，别让你白等{emoji}",
    "诶诶，这个我帮你盯下，进展有了就来喊你{emoji}"
  ],
  feature: [
    "嘿嘿，这个需求卡姐先收下。好用的东西要慢慢磨，很快给家人们惊喜{emoji}",
    "心动可以先等等，卡姐帮你盯进度{emoji}",
    "收到，需求记上了，别漏拍，后面有动静我来喊{emoji}"
  ],
  crisis: [
    "宝子先别急，这类问题卡姐不乱承诺。我先核实清楚，能确认的直接说{emoji}",
    "我看到了，这个要认真处理。你把关键信息发我，我先同步对应团队{emoji}",
    "别怕，先把事实捋清楚，不让你白反馈{emoji}"
  ],
  promo: [
    "心动行动💳 先小额体验，好用再安利，不顺手就回来骂卡姐{emoji}",
    "支付无感，磨损无感，自己用着方便，这才是真正的日常金融入口{emoji}",
    "嘿嘿，宝子先体验。好用再带朋友来开张卡，不上头最重要{emoji}"
  ],
  tweet: [
    "卡姐AI上线：宝子先别急，问题我来接。会玩梗，也会认真帮你推进{emoji}",
    "PayFi 不是多学一个新词，而是少想一步。支付无感，磨损无感，生活才会真的丝滑{emoji}",
    "把用户吐槽丢进来，生成卡姐式回复：可爱一点、实用一点、福利感也多一点{emoji}"
  ]
};

const toneAddons = {
  xie: "",
  service: "你先别担心。",
  pr: "用户利益第一。",
  web3: "gm，收到。",
  redbook: "真实体验最重要。"
};

const phraseLibrary = {
  xiejiayin: {
    openings: ["收到", "我看到了", "来了来了", "没关系", "先别急"],
    empathy: ["先抱歉让你体验不好", "这条反馈我认真记下", "不让你白等", "真实体验最重要", "用户利益第一"],
    actions: ["我帮你记录推进", "我先同步团队核实", "进展我来跟", "操心的事我们来做", "能确认的我直接说"],
    endings: ["很快给你答复", "很快见惊喜", "来了就是VIP", "你先别担心", "谢谢你愿意直接说"]
  },
  kajiq: {
    openings: ["诶诶，宝子先别急", "收到，卡姐看到了", "嘿嘿，先别慌", "宝子别怕", "心动可以先等等"],
    empathy: ["这条体验不该让你来回折腾", "卡姐帮你记下", "不让你白反馈", "先把事实捋清楚", "家人们的体验最重要"],
    actions: ["我去帮你确认", "我帮你盯进度", "找对应团队看一下", "有进展我来喊你", "你把关键信息发我"],
    endings: ["别漏拍", "很快给家人们惊喜", "先小额体验，别上头", "不顺手就回来找卡姐", "欢迎继续来骂醒我"]
  }
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

function fallbackReplies({ message = "", scene = "complaint", tone = "xie", emoji = true, short = true, persona = "xiejiayin" }) {
  const isKajiq = persona === "kajiq";
  const lib = phraseLibrary[persona] || phraseLibrary.xiejiayin;
  const mark = emoji ? (isKajiq ? "🥰" : "🩵") : "";
  const addon = toneAddons[tone] || "";
  const includesWallet = message.includes("钱包") || message.toLowerCase().includes("wallet");
  const includesCard = message.includes("卡") || message.toLowerCase().includes("card");
  const sceneActions = {
    complaint: includesWallet ? (isKajiq ? "钱包问题卡姐帮你记下，你把截图和钱包 ID 发我" : "钱包最难用的点丢给我，我帮你记录推进") : lib.actions[0],
    support: includesCard && isKajiq ? "你把页面截图和钱包 ID 发我，卡姐帮你排查" : lib.actions[1],
    feature: isKajiq ? "这个需求卡姐先收下，后面有动静我来喊" : "这个需求我先记下，进展我来跟",
    crisis: isKajiq ? "我先核实清楚，能确认的直接说" : "我先同步团队核实，能确认的我直接说",
    promo: isKajiq ? "先小额体验，好用再安利" : "你先体验，感受最重要",
    tweet: isKajiq ? "宝子先别急，问题卡姐来接" : "来了就是VIP，接住社区所有情绪"
  };

  const replies = [
    `${lib.openings[0]}，${lib.empathy[0]}。${sceneActions[scene] || lib.actions[0]}${mark}`,
    `${tone !== "xie" && addon ? addon : ""}${lib.empathy[1]}，${lib.actions[2]}，${lib.endings[0]}${mark}`,
    isKajiq
      ? `${lib.openings[2]}，${lib.empathy[2]}。${lib.actions[3]}，${lib.endings[3]}${mark}`
      : `${lib.openings[3]}，${lib.empathy[3]}。${lib.actions[3]}，${lib.endings[2]}${mark}`
  ];

  return replies.map((line) => {
    let reply = line;
    if (tone === "web3" && scene !== "crisis") {
      reply = isKajiq ? reply.replace("先小额体验，好用再安利", "心动可以，别上头，先小额体验") : reply.replace("你先体验，感受最重要", "alpha 收到，我帮你盯，别上头");
    }
    if (tone === "redbook" && scene !== "crisis") {
      reply = isKajiq ? reply.replace("很快给家人们惊喜", "真实体验完再安利") : reply.replace("很快见惊喜", "好用再安利，不好用我继续改");
    }
    if (short && reply.length > 72) {
      reply = reply.replace("你把最难用的点丢给我，", "").replace("真实反馈我都认真看，", "");
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

function buildPromptParts(payload, skill, references, personaConfig) {
  const instructions = [
    skill,
    references.slice(0, 5000),
    "你现在为官网在线生成器服务。只输出 JSON，不要输出 Markdown。",
    "JSON 格式必须是：{\"replies\":[\"回复1\",\"回复2\",\"回复3\"]}。",
    `当前人格：${personaConfig.label}。`,
    "回复必须中文为主、短、暖、稳，不反击、不抱怨、不承诺未确认的赔偿、审核、空投或收益结果。",
    "3 条回复必须明显不同：第一条偏直接处理，第二条偏安抚解释，第三条偏温暖收尾或后续期待。不要三条换皮重复。"
  ].join("\n\n");

  const input = {
    message: payload.message,
    scene: payload.scene,
    tone: payload.tone,
    withEmoji: payload.emoji,
    shortFirst: payload.short,
    persona: payload.persona
  };

  const userPrompt = `请根据以下用户原话和配置，生成 3 条${personaConfig.label}风格回复：\n${JSON.stringify(input, null, 2)}`;
  return { instructions, userPrompt };
}

async function openaiReplies(payload) {
  if (!process.env.OPENAI_API_KEY) return null;
  const personaConfig = personaConfigs[payload.persona] || personaConfigs.xiejiayin;

  const [skill, ...referenceContents] = await Promise.all([
    readFile(personaConfig.skillPath, "utf8"),
    ...personaConfig.referencePaths.map((referencePath) => readFile(referencePath, "utf8").catch(() => ""))
  ]);
  const references = referenceContents.join("\n\n");

  const { instructions, userPrompt } = buildPromptParts(payload, skill, references, personaConfig);

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
  const personaConfig = personaConfigs[payload.persona] || personaConfigs.xiejiayin;

  const [skill, ...referenceContents] = await Promise.all([
    readFile(personaConfig.skillPath, "utf8"),
    ...personaConfig.referencePaths.map((referencePath) => readFile(referencePath, "utf8").catch(() => ""))
  ]);
  const references = referenceContents.join("\n\n");

  const { instructions, userPrompt } = buildPromptParts(payload, skill, references, personaConfig);
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
      persona: personaConfigs[payload.persona] ? String(payload.persona) : "xiejiayin",
      emoji: payload.emoji !== false,
      short: payload.short !== false
    };

    let replies = null;
    let source = "template";

    try {
      replies = await aiReplies(normalized);
      if (replies) source = provider;
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
