export const handler = async (event) => {
  const json = (status, body) => ({
    statusCode: status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify(body)
  });

  const serializeError = (error) => {
    if (error instanceof Error) {
      return { name: error.name, message: error.message, stack: error.stack };
    }
    return error;
  };

  const normalizeUrl = (raw) => {
    let value = String(raw || "").trim();
    if (!value) return null;
    if (!/^https?:\/\//i.test(value)) value = "https://" + value;
    try {
      const parsed = new URL(value);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
      if (!parsed.hostname || parsed.hostname.indexOf(".") === -1) return null;
      return parsed.toString();
    } catch (err) {
      return null;
    }
  };

  try {
    if (event.httpMethod !== "GET") {
      return json(405, { error: "Method not allowed" });
    }

    const apiKey =
      (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.GOOGLE_LIGHTHOUSE_API_KEY) ||
      process.env.GOOGLE_LIGHTHOUSE_API_KEY;

    if (!apiKey) {
      return json(500, {
        error: "GOOGLE_LIGHTHOUSE_API_KEY is missing in the Function environment"
      });
    }

    const params = event.queryStringParameters || {};
    const targetUrl = normalizeUrl(params.url);
    if (!targetUrl) {
      return json(400, { error: "Invalid url" });
    }

    const googleUrl = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
    googleUrl.searchParams.set("url", targetUrl);
    googleUrl.searchParams.set("strategy", "mobile");
    googleUrl.searchParams.append("category", "performance");
    googleUrl.searchParams.append("category", "accessibility");
    googleUrl.searchParams.append("category", "best-practices");
    googleUrl.searchParams.append("category", "seo");
    googleUrl.searchParams.set("locale", "pt-PT");
    googleUrl.searchParams.set("key", apiKey);

    const res = await fetch(googleUrl);
    const data = await res.json();

    if (!res.ok || (data && data.error)) {
      const googleError = data && data.error;
      const status = (googleError && googleError.code) || res.status || 500;
      return json(status >= 400 && status <= 599 ? status : 500, {
        error: (googleError && googleError.message) || res.statusText || "Audit failed",
        detail: googleError || data
      });
    }

    return json(200, data);
  } catch (error) {
    return json(500, {
      error: error && error.message ? error.message : String(error),
      detail: serializeError(error)
    });
  }
};
