"use strict";

var PSI_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

function json(status, body) {
  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify(body)
  };
}

function normalizeUrl(raw) {
  var value = String(raw || "").trim();
  if (!value) return null;
  if (!/^https?:\/\//i.test(value)) value = "https://" + value;
  try {
    var parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    if (!parsed.hostname || parsed.hostname.indexOf(".") === -1) return null;
    return parsed.toString();
  } catch (err) {
    return null;
  }
}

exports.handler = async function (event) {
  if (event.httpMethod !== "GET") {
    return json(405, { error: "Method not allowed" });
  }

  var apiKey = process.env.GOOGLE_LIGHTHOUSE_API_KEY;
  if (!apiKey) {
    return json(500, { error: "Server misconfigured" });
  }

  var params = event.queryStringParameters || {};
  var targetUrl = normalizeUrl(params.url);
  if (!targetUrl) {
    return json(400, { error: "Invalid url" });
  }

  var googleUrl = PSI_ENDPOINT
    + "?url=" + encodeURIComponent(targetUrl)
    + "&strategy=mobile"
    + "&category=performance"
    + "&category=accessibility"
    + "&category=best-practices"
    + "&category=seo"
    + "&locale=pt-PT"
    + "&key=" + encodeURIComponent(apiKey);

  try {
    var res = await fetch(googleUrl);
    var data = await res.json();
    if (!res.ok || (data && data.error)) {
      var status = (data && data.error && data.error.code) || res.status;
      if (typeof status !== "number" || status < 400 || status > 599) status = 502;
      return json(status, { error: "Audit failed" });
    }
    return json(200, data);
  } catch (err) {
    return json(502, { error: "Audit failed" });
  }
};
