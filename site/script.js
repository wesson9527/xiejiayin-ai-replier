const sceneLabels = {
  complaint: "用户吐槽",
  support: "客服慢",
  feature: "功能催更",
  crisis: "公关回应",
  promo: "产品种草",
  tweet: "推文"
};

const toneLabels = {
  xie: "人格原味",
  service: "暖男客服",
  pr: "品牌公关",
  web3: "Web3 社交",
  redbook: "小红书种草"
};

const personaLabels = {
  xiejiayin: "谢家印模式",
  kajiq: "卡姐模式"
};

const personaShortLabels = {
  xiejiayin: "家印",
  kajiq: "卡姐"
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

const form = document.querySelector("#replyForm");
const userMessage = document.querySelector("#userMessage");
const sceneSelect = document.querySelector("#sceneSelect");
const toneSelect = document.querySelector("#toneSelect");
const resultList = document.querySelector("#resultList");
const emojiToggle = document.querySelector("#emojiToggle");
const shortToggle = document.querySelector("#shortToggle");
const personaInput = document.querySelector("#personaInput");
const personaCards = document.querySelectorAll("[data-persona]");
const shareModal = document.querySelector("#shareModal");
const replyActionModal = document.querySelector("#replyActionModal");
const replyActionText = document.querySelector("#replyActionText");
const actionCopyReply = document.querySelector("#actionCopyReply");
const actionOpenShare = document.querySelector("#actionOpenShare");
const exportPersona = document.querySelector("#exportPersona");
const exportTag = document.querySelector("#exportTag");
const exportQuestion = document.querySelector("#exportQuestion");
const exportReply = document.querySelector("#exportReply");
const downloadShareCard = document.querySelector("#downloadShareCard");
const copyShareCard = document.querySelector("#copyShareCard");
const tweetShareCard = document.querySelector("#tweetShareCard");
const phraseButtons = document.querySelectorAll("[data-fill-phrase]");
let currentShareData = null;
let currentActionData = null;

function emoji() {
  if (!emojiToggle.checked) return "";
  return personaInput.value === "kajiq" ? "🥰" : "🩵";
}

function cleanReply(text) {
  return text.replace(/\s+/g, " ").replace(/\s+([，。])/g, "$1").trim();
}

function currentContext(reply = "") {
  const question = userMessage.value.trim() || "为什么钱包这么难用？客服也没人回。";
  return {
    persona: personaInput.value,
    personaLabel: personaLabels[personaInput.value] || "谢家印模式",
    personaShort: personaShortLabels[personaInput.value] || "家印",
    scene: sceneSelect.value,
    sceneLabel: sceneLabels[sceneSelect.value] || "用户吐槽",
    tone: toneSelect.value,
    toneLabel: toneLabels[toneSelect.value] || "人格原味",
    question,
    reply: reply || "收到，先抱歉让你体验不好。我帮你记录推进🩵",
    watermark: "真正有温度的还是人",
    site: "warmreply.xyz"
  };
}

function applyShareData(data) {
  currentShareData = data;
  exportPersona.textContent = data.personaLabel;
  exportTag.textContent = `${data.sceneLabel} / ${data.toneLabel}`;
  exportQuestion.textContent = data.question;
  exportReply.textContent = data.reply;
  const tweetText = `${data.personaShort}式回复：\n\n${data.reply}\n\n真正有温度的还是人。`;
  tweetShareCard.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent("https://warmreply.xyz/")}`;
}

function openShareModal(data) {
  applyShareData(data);
  closeReplyActionModal();
  shareModal.hidden = false;
  document.body.style.overflow = "hidden";
  if (window.gsap) {
    gsap.fromTo(".share-modal-panel", { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.28, ease: "power2.out" });
  }
}

function closeShareModal() {
  shareModal.hidden = true;
  document.body.style.overflow = "";
}

function openReplyActionModal(data) {
  currentActionData = data;
  replyActionText.textContent = data.reply;
  replyActionModal.hidden = false;
  document.body.style.overflow = "hidden";
  if (window.gsap) {
    gsap.fromTo(".reply-action-panel", { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.24, ease: "power2.out" });
  }
}

function closeReplyActionModal() {
  if (!replyActionModal) return;
  replyActionModal.hidden = true;
  if (shareModal?.hidden !== false) {
    document.body.style.overflow = "";
  }
}

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

function buildFallbackReplies({ message = "", scene = "complaint", tone = "xie", emojiMark = "", short = true, persona = "xiejiayin" }) {
  const isKajiq = persona === "kajiq";
  const lib = phraseLibrary[persona] || phraseLibrary.xiejiayin;
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
    `${lib.openings[0]}，${lib.empathy[0]}。${sceneActions[scene] || lib.actions[0]}${emojiMark}`,
    `${tone !== "xie" && addon ? addon : ""}${lib.empathy[1]}，${lib.actions[2]}，${lib.endings[0]}${emojiMark}`,
    isKajiq
      ? `${lib.openings[2]}，${lib.empathy[2]}。${lib.actions[3]}，${lib.endings[3]}${emojiMark}`
      : `${lib.openings[3]}，${lib.empathy[3]}。${lib.actions[3]}，${lib.endings[2]}${emojiMark}`
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

function fallbackReplies() {
  return buildFallbackReplies({
    message: userMessage.value.trim(),
    scene: sceneSelect.value,
    tone: toneSelect.value,
    emojiMark: emoji(),
    short: shortToggle.checked,
    persona: personaInput.value
  });
}

async function generateReplies() {
  const scene = sceneSelect.value;
  const tone = toneSelect.value;
  const payload = {
    message: userMessage.value.trim(),
    persona: personaInput.value,
    scene,
    tone,
    emoji: emojiToggle.checked,
    short: shortToggle.checked
  };

  let replies = null;
  let source = "本地模板";

  try {
    const response = await fetch("/api/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.replies) && data.replies.length) {
        replies = data.replies;
        source = data.source === "template" ? "Skill 模板" : "AI 后端";
      }
    }
  } catch {
    source = "本地模板";
  }

  if (!replies) replies = fallbackReplies();
  renderReplies(replies, scene, tone, source, personaInput.value);
}

function buildSharePayload(reply, scene, tone, persona) {
  return {
    ...currentContext(reply),
    persona,
    personaLabel: personaLabels[persona] || "谢家印模式",
    personaShort: personaShortLabels[persona] || "家印",
    scene,
    sceneLabel: sceneLabels[scene] || "用户吐槽",
    tone,
    toneLabel: toneLabels[tone] || "人格原味"
  };
}

function renderReplies(replies, scene, tone, source = "本地模板", persona = "xiejiayin") {
  resultList.innerHTML = replies
    .map((reply, index) => {
      const sharePayload = encodeURIComponent(JSON.stringify(buildSharePayload(reply, scene, tone, persona)));
      return `
        <article class="result-card" tabindex="0" role="button" aria-label="打开回复操作" data-reply-card="${sharePayload}">
          <header>
            <strong>${personaLabels[persona]} / ${sceneLabels[scene]} / ${toneLabels[tone]} / ${source} / 0${index + 1}</strong>
            <span class="result-hint">点击使用</span>
          </header>
          <p>${reply}</p>
        </article>
      `;
    })
    .join("");

  if (window.gsap) {
    gsap.fromTo(
      ".result-card",
      { y: 16, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.48, ease: "power2.out", stagger: 0.08 }
    );
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  generateReplies();
});

personaCards.forEach((card) => {
  card.addEventListener("click", () => {
    personaInput.value = card.dataset.persona;
    personaCards.forEach((item) => {
      const isActive = item === card;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
    if (card.dataset.persona === "kajiq" && !userMessage.value.trim()) {
      userMessage.placeholder = "例如：Fiat24 开卡一直卡住，是不是又没戏了？";
    } else {
      userMessage.placeholder = "例如：为什么 Bitget 钱包这么难用？客服也没人回。";
    }
    generateReplies();
  });
});

resultList.addEventListener("click", async (event) => {
  const card = event.target.closest("[data-reply-card]");

  if (!card) return;
  const data = JSON.parse(decodeURIComponent(card.dataset.replyCard));
  openReplyActionModal(data);
});

resultList.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest("[data-reply-card]");
  if (!card) return;
  event.preventDefault();
  const data = JSON.parse(decodeURIComponent(card.dataset.replyCard));
  openReplyActionModal(data);
});

document.querySelectorAll("[data-close-action]").forEach((button) => {
  button.addEventListener("click", closeReplyActionModal);
});

actionCopyReply?.addEventListener("click", async () => {
  if (!currentActionData) return;
  await navigator.clipboard.writeText(currentActionData.reply);
  actionCopyReply.textContent = "已复制";
  setTimeout(() => {
    actionCopyReply.textContent = "复制回复";
  }, 1200);
});

actionOpenShare?.addEventListener("click", () => {
  if (currentActionData) {
    openShareModal(currentActionData);
  }
});

document.querySelectorAll("[data-close-share]").forEach((button) => {
  button.addEventListener("click", closeShareModal);
});

phraseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const phrase = button.dataset.fillPhrase;
    userMessage.value = phrase;
    generateReplies();
    document.querySelector("#instrument")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const chars = Array.from(text);
  const lines = [];
  let line = "";

  chars.forEach((char) => {
    const nextLine = line + char;
    if (ctx.measureText(nextLine).width > maxWidth && line) {
      lines.push(line);
      line = char;
    } else {
      line = nextLine;
    }
  });
  if (line) lines.push(line);

  const visibleLines = lines.slice(0, maxLines);
  if (lines.length > maxLines) {
    visibleLines[maxLines - 1] = `${visibleLines[maxLines - 1].slice(0, -1)}...`;
  }

  visibleLines.forEach((lineText, index) => {
    ctx.fillText(lineText, x, y + index * lineHeight);
  });
}

function drawShareCanvas(data = currentShareData || currentContext()) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 675;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#fffaf1";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const gradient = ctx.createLinearGradient(0, 0, 760, 0);
  gradient.addColorStop(0, "rgba(0, 140, 124, 0.22)");
  gradient.addColorStop(0.48, "rgba(0, 140, 124, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(0, 140, 124, 0.12)";
  ctx.beginPath();
  ctx.arc(1040, 110, 190, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(23, 33, 29, 0.14)";
  ctx.lineWidth = 2;
  ctx.strokeRect(42, 42, 1116, 591);

  ctx.fillStyle = "#716a5e";
  ctx.font = "700 24px Arial, sans-serif";
  ctx.fillText(data.personaLabel.toUpperCase(), 76, 86);
  ctx.textAlign = "right";
  ctx.fillText(data.site.toUpperCase(), 1124, 86);
  ctx.textAlign = "left";

  ctx.fillStyle = "rgba(207, 238, 232, 0.72)";
  ctx.fillRect(76, 128, 300, 44);
  ctx.strokeStyle = "rgba(0, 140, 124, 0.42)";
  ctx.strokeRect(76, 128, 300, 44);
  ctx.fillStyle = "#008c7c";
  ctx.font = "800 22px Arial, sans-serif";
  ctx.fillText(`${data.sceneLabel} / ${data.toneLabel}`, 96, 158);

  ctx.fillStyle = "#716a5e";
  ctx.font = '400 32px "PingFang SC", "Noto Serif CJK SC", serif';
  wrapCanvasText(ctx, data.question, 76, 234, 920, 46, 2);

  ctx.fillStyle = "#17211d";
  ctx.font = '900 58px "PingFang SC", "Noto Serif CJK SC", serif';
  wrapCanvasText(ctx, data.reply, 76, 360, 1000, 78, 3);

  ctx.strokeStyle = "rgba(23, 33, 29, 0.14)";
  ctx.beginPath();
  ctx.moveTo(76, 584);
  ctx.lineTo(1124, 584);
  ctx.stroke();

  ctx.fillStyle = "#716a5e";
  ctx.font = "800 22px Arial, sans-serif";
  ctx.fillText(data.watermark, 76, 622);
  ctx.textAlign = "right";
  ctx.fillText("WEB3 AI 回复工具", 1124, 622);
  ctx.textAlign = "left";

  return canvas;
}

function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png", 0.98));
}

downloadShareCard?.addEventListener("click", async () => {
  const canvas = drawShareCanvas();
  const link = document.createElement("a");
  link.download = `warmreply-card-${Date.now()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
});

copyShareCard?.addEventListener("click", async () => {
  const canvas = drawShareCanvas();
  const blob = await canvasToBlob(canvas);
  try {
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    copyShareCard.textContent = "已复制图片";
  } catch {
    const link = document.createElement("a");
    link.download = `warmreply-card-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    copyShareCard.textContent = "已下载图片";
  }
  setTimeout(() => {
    copyShareCard.textContent = "复制图片";
  }, 1400);
});

function bootAnimations() {
  if (!window.gsap) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  const tl = gsap.timeline({ defaults: { duration: 0.72, ease: "power2.out" } });
  tl.from(".site-header", { y: -18, autoAlpha: 0 })
    .from(".gallery-label span", { y: 16, autoAlpha: 0, stagger: 0.08 }, "<0.12")
    .from(".hero-copy > *", { y: 26, autoAlpha: 0, stagger: 0.1 }, "<0.1")
    .from(".hero-side-note", { y: 34, autoAlpha: 0 }, "<0.18")
    .from(".exhibit-card", { y: 28, autoAlpha: 0, stagger: 0.08 }, "-=0.2");
}

bootAnimations();
generateReplies();
