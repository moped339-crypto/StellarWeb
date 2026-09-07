export const handler = async (event) => {
  const json = (status, body) => ({
    statusCode: status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify(body)
  });

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      },
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return json(500, { error: "Assistant is temporarily unavailable." });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (err) {
    return json(400, { error: "Invalid JSON" });
  }

  const lang = ["pt", "en", "ru"].indexOf(payload.lang) >= 0 ? payload.lang : "pt";
  const incoming = Array.isArray(payload.messages) ? payload.messages : [];
  const messages = [];

  for (let i = 0; i < incoming.length && messages.length < 12; i++) {
    const item = incoming[i] || {};
    const role = item.role === "assistant" ? "assistant" : item.role === "user" ? "user" : null;
    const content = String(item.content || "").trim().slice(0, 2000);
    if (!role || !content) continue;
    messages.push({ role: role, content: content });
  }

  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return json(400, { error: "A user message is required." });
  }

  const system =
    "Tu és a Sofia, a assistente virtual inteligente da Stellar Web Studio (gerida por Vadym Minzilevskyi, NIF 310300118). O teu objetivo é saudar cordialmente os utilizadores em português, esclarecer dúvidas de forma profissional e qualificar potenciais clientes (leads).\n" +
    "Regras cruciais sobre os nossos serviços:\n" +
    "- Landing Page (Página Única): Desde 249€.\n" +
    "- Website Institucional (Até 5 páginas): Desde 499€.\n" +
    "- Lojas Online / E-commerce & Integrações de IA: Preços sob consulta (Investimento personalizado).\n" +
    "- Alojamento ultra-rápido em Netlify, conformidade total com o RGPD, velocidade <1s.\n" +
    "- Caso o utilizador demonstre interesse real em avançar ou solicitar um orçamento, pede cordialmente o Nome, E-mail ou contacto de WhatsApp para que o Vadym possa entrar em contacto. Nunca inventes informações que não estejam aqui.\n" +
    "Responde no idioma do utilizador. Código de idioma da página: " + lang + ".";

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.5,
        max_tokens: 450,
        messages: [{ role: "system", content: system }].concat(messages)
      })
    });

    const data = await res.json();
    if (!res.ok) {
      return json(res.status >= 400 && res.status <= 599 ? res.status : 502, {
        error: "Assistant is temporarily unavailable."
      });
    }

    const reply = data && data.choices && data.choices[0] && data.choices[0].message
      ? String(data.choices[0].message.content || "").trim()
      : "";

    if (!reply) {
      return json(502, { error: "Empty assistant reply." });
    }

    return json(200, { reply: reply });
  } catch (error) {
    return json(500, {
      error: "Assistant is temporarily unavailable."
    });
  }
};
