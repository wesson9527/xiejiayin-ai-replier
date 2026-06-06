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

function emoji() {
  if (!emojiToggle.checked) return "";
  return personaInput.value === "kajiq" ? "🥰" : "🩵";
}

function cleanReply(text) {
  return text.replace(/\s+/g, " ").replace(/\s+([，。])/g, "$1").trim();
}

function fallbackReplies() {
  const scene = sceneSelect.value;
  const tone = toneSelect.value;
  const message = userMessage.value.trim();
  const persona = personaInput.value;
  const isKajiq = persona === "kajiq";
  const selectedTemplates = isKajiq ? kajiqTemplates : templates;
  const base = selectedTemplates[scene] || selectedTemplates.complaint;
  const addon = toneAddons[tone];
  const replies = base.map((line, index) => {
    let reply = line.replace("{emoji}", emoji());

    if (!isKajiq && tone !== "xie" && index === 0) {
      reply = `${addon}${reply}`;
    }

    if (!isKajiq && tone === "web3" && scene !== "crisis" && index === 1) {
      reply = `alpha 收到，我帮你盯。DYOR，别上头${emoji()}`;
    }

    if (!isKajiq && tone === "redbook" && scene !== "crisis" && index === 1) {
      reply = `被种草可以，先小额体验。好用再安利，不好用我继续改${emoji()}`;
    }

    if (isKajiq && tone === "web3" && scene !== "crisis" && index === 1) {
      reply = `心动可以，别上头。先小额体验，风险自己拿稳${emoji()}`;
    }

    if (isKajiq && tone === "redbook" && scene !== "crisis" && index === 1) {
      reply = `嘿嘿，先体验再安利，不顺手就回来骂卡姐，我继续改${emoji()}`;
    }

    if (shortToggle.checked && reply.length > 68) {
      reply = reply.replace("你把最难用的点丢给我，", "").replace("真实反馈我都认真看，", "");
    }

    if (!isKajiq && message.includes("钱包") && scene === "complaint" && index === 0) {
      reply = `收到，先抱歉让你体验不好。钱包最难用的点丢给我，我帮你记录推进${emoji()}`;
    }

    if (isKajiq && message.includes("钱包") && scene === "complaint" && index === 0) {
      reply = `诶诶，宝子先别急。钱包问题卡姐帮你记下，你把截图和钱包 ID 发我${emoji()}`;
    }

    return cleanReply(reply);
  });

  return replies;
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

function renderReplies(replies, scene, tone, source = "本地模板", persona = "xiejiayin") {
  resultList.innerHTML = replies
    .map((reply, index) => {
      return `
        <article class="result-card">
          <header>
            <strong>${personaLabels[persona]} / ${sceneLabels[scene]} / ${toneLabels[tone]} / ${source} / 0${index + 1}</strong>
            <button class="copy-button" type="button" data-copy="${encodeURIComponent(reply)}">复制</button>
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
    personaCards.forEach((item) => item.classList.toggle("is-active", item === card));
    if (card.dataset.persona === "kajiq" && !userMessage.value.trim()) {
      userMessage.placeholder = "例如：Fiat24 开卡一直卡住，是不是又没戏了？";
    } else {
      userMessage.placeholder = "例如：为什么 Bitget 钱包这么难用？客服也没人回。";
    }
    generateReplies();
  });
});

resultList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-copy]");
  if (!button) return;
  const text = decodeURIComponent(button.dataset.copy);
  await navigator.clipboard.writeText(text);
  button.textContent = "已复制";
  setTimeout(() => {
    button.textContent = "复制";
  }, 1200);
});

function bootAnimations() {
  if (!window.gsap) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  const tl = gsap.timeline({ defaults: { duration: 0.72, ease: "power2.out" } });
  tl.from(".site-header", { y: -18, autoAlpha: 0 })
    .from(".gallery-label span", { y: 16, autoAlpha: 0, stagger: 0.08 }, "<0.12")
    .from(".hero-copy > *", { y: 26, autoAlpha: 0, stagger: 0.1 }, "<0.1")
    .from(".hero-art", { y: 34, autoAlpha: 0 }, "<0.18")
    .from(".exhibit-card", { y: 28, autoAlpha: 0, stagger: 0.08 }, "-=0.2");
}

bootAnimations();
generateReplies();
