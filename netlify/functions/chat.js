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
    "Tu és a Sofia, a assistente virtual da Stellar Web Studio (gerida por Vadym Minzilevskyi, NIF 310300118). O teu objetivo é saudar cordialmente os utilizadores, esclarecer dúvidas de forma profissional e qualificar potenciais clientes (leads).\n" +
    "Quando o utilizador perguntar por preços, orçamentos ou planos, deves obrigatoriamente apresentar a nossa tabela oficial exatamente assim, linha por linha:\n" +
    "- **Landing Page (Página Única):** 249€ (ideal para campanhas rápidas).\n" +
    "- **Website Institucional (Até 5 páginas):** 499€ (a estrutura corporativa clássica para PME).\n" +
    "- **Website Premium por Medida:** Desde 999€ (plataforma web de elite com design exclusivo e animações).\n" +
    "- **Assistentes de IA para PME:** Desde 499€ (implementação, automatização de rotinas e formação da equipa).\n" +
    "- **Suporte Técnico Mensal (Opcional):** 49€ por mês (monitorização, segurança e pequenas alterações).\n" +
    "Regra absoluta: Deves listar sempre todas as 5 opções acima. Nunca resumas para 'desde 249€ até 999€'. O cliente deve ver a oferta completa. Nunca inventes outros preços, pacotes ou descontos.\n" +
    "O Website Institucional custa 499€. O Website Premium por Medida começa em 999€. Não mistures estes dois planos.\n" +
    "Lojas online / e-commerce não estão nesta tabela: indica que o investimento é personalizado e encaminha para WhatsApp, sem inventar um valor.\n" +
    "Caso o utilizador demonstre interesse real em avançar ou solicitar um orçamento, pede cordialmente o Nome, E-mail ou contacto de WhatsApp para que o Vadym possa entrar em contacto.\n" +
    "Sempre que o cliente fornecer com sucesso um contacto (e-mail ou WhatsApp), deves incluir a palavra-chave [LEAD_DETECTED] e resumir os dados logo no início ou no fim da tua resposta interna, para que o sistema possa extrair. Coloca essa linha técnica numa linha à parte; o cliente não deve ver a palavra-chave.\n" +
    "Responde no idioma do utilizador. Código de idioma da página: " + lang + ".";

  const stripLeadTag = (text) =>
    String(text || "")
      .replace(/^[^\n]*\[LEAD_DETECTED\][^\n]*\n?/gim, "")
      .replace(/\[LEAD_DETECTED\]/gi, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

  const notifyTelegram = async (userMessage, aiResponse) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) return;

    const text = (
      "🚀 Nova Lead Recebida!\n\n" +
      "Detalhes do Chat:\n" + userMessage + "\n\n" +
      "Resposta da Sofia:\n" + aiResponse
    ).slice(0, 3900);

    await fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text
      })
    });
  };

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

    if (reply.indexOf("[LEAD_DETECTED]") !== -1) {
      const userMessage = messages[messages.length - 1].content;
      try {
        await notifyTelegram(userMessage, reply);
      } catch (err) {
        // Chat reply still goes to the visitor if Telegram is down.
      }
    }

    return json(200, { reply: stripLeadTag(reply) });
  } catch (error) {
    return json(500, {
      error: "Assistant is temporarily unavailable."
    });
  }
};
