(function () {
  var STORAGE_KEY = "stellar-lang";
  // Previous brand's key: keep reading it so visitors who already chose a
  // language before the rename don't get reset back to Portuguese.
  var LEGACY_STORAGE_KEY = "nexis-lang";
  var currentLang = "pt";

  function applyLang(lang) {
    currentLang = lang;
    var dict = I18N[lang] || I18N.pt;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (key && Object.prototype.hasOwnProperty.call(dict, key)) {
        el.textContent = dict[key];
      }
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-html");
      if (dict[key]) el.innerHTML = dict[key];
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-placeholder");
      if (dict[key]) el.setAttribute("placeholder", dict[key]);
    });
    document.querySelectorAll("[data-i18n-label]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-label");
      if (dict[key]) el.setAttribute("aria-label", dict[key]);
    });
    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
    });
    document.documentElement.setAttribute("lang", lang);
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    if (sofiaHistory && sofiaHistory.length <= 1) {
      sofiaHistory = [{ role: "assistant", content: dict["chat.welcome"] || "" }];
    }
  }

  document.querySelectorAll(".lang-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyLang(btn.getAttribute("data-lang"));
    });
  });

  var saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY); } catch (e) {}
  applyLang(saved || "pt");

  var privacyLink = document.getElementById("privacyLink");
  var privacyModal = document.getElementById("privacyModal");
  var privacyClose = document.getElementById("privacyModalClose");
  var privacyDismiss = document.getElementById("privacyModalDismiss");
  var privacyPanel = privacyModal && privacyModal.querySelector(".modal-panel");

  function openPrivacyModal() {
    privacyModal.classList.add("open");
    privacyModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    privacyClose.focus();
  }

  function closePrivacyModal() {
    if (!privacyModal.classList.contains("open")) return;
    privacyModal.classList.remove("open");
    privacyModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    privacyLink.focus();
  }

  if (privacyLink && privacyModal && privacyClose) {
    privacyLink.addEventListener("click", function (e) {
      e.preventDefault();
      openPrivacyModal();
    });
    privacyClose.addEventListener("click", closePrivacyModal);
    if (privacyDismiss) privacyDismiss.addEventListener("click", closePrivacyModal);
    privacyModal.addEventListener("click", function (e) {
      if (e.target === privacyModal) closePrivacyModal();
    });
    document.addEventListener("keydown", function (e) {
      if (!privacyModal.classList.contains("open")) return;
      if (e.key === "Escape") {
        closePrivacyModal();
      } else if (e.key === "Tab") {
        // The panel now holds two close controls plus the dispute-resolution
        // link, so cycle focus through them instead of pinning it to one button.
        var items = privacyPanel.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!items.length) {
          e.preventDefault();
          return;
        }
        var first = items[0];
        var last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  var auditForm = document.getElementById("auditForm");
  var auditInput = document.getElementById("auditUrl");
  var auditSubmit = document.getElementById("auditSubmit");
  var auditLoader = document.getElementById("auditLoader");
  var auditResults = document.getElementById("auditResults");
  var auditError = document.getElementById("auditError");
  var auditErrorText = document.getElementById("auditErrorText");
  var auditInlineError = document.getElementById("auditInlineError");
  var auditPct = document.getElementById("auditPct");
  var auditPctFill = document.getElementById("auditPctFill");
  var auditTested = document.getElementById("auditTested");
  var auditWa = document.getElementById("auditWa");
  var auditRetry = document.getElementById("auditRetry");
  var auditAgain = document.getElementById("auditAgain");
  var RING = 2 * Math.PI * 42;
  var auditTick = null;
  var auditAbort = null;

  function setAuditAccordion(cat, forceOpen) {
    var current = cat
      ? document.querySelector('.audit-acc[data-cat="' + cat + '"]')
      : null;
    var willOpen = forceOpen
      ? !!current
      : !!(current && !current.classList.contains("is-open"));
    document.querySelectorAll(".audit-acc").forEach(function (item) {
      var open = willOpen && item.getAttribute("data-cat") === cat;
      item.classList.toggle("is-open", open);
      var btn = item.querySelector(".audit-acc-trigger");
      if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".audit-gauge").forEach(function (gauge) {
      var open = willOpen && gauge.getAttribute("data-cat") === cat;
      gauge.classList.toggle("is-open", open);
      gauge.setAttribute("aria-expanded", open ? "true" : "false");
    });
    if (willOpen && !forceOpen && current && typeof current.scrollIntoView === "function") {
      current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  document.querySelectorAll(".audit-gauge").forEach(function (gauge) {
    gauge.addEventListener("click", function () {
      setAuditAccordion(gauge.getAttribute("data-cat"));
    });
    gauge.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setAuditAccordion(gauge.getAttribute("data-cat"));
      }
    });
  });
  document.querySelectorAll(".audit-acc-trigger").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".audit-acc");
      if (item) setAuditAccordion(item.getAttribute("data-cat"));
    });
  });

  function currentDict() {
    var lang = document.documentElement.getAttribute("lang") || "pt";
    return I18N[lang] || I18N.pt;
  }

  function t(key) {
    return currentDict()[key] || I18N.pt[key] || "";
  }

  function normalizeAuditUrl(raw) {
    var value = (raw || "").trim();
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

  function setAuditView(view) {
    if (auditForm) auditForm.hidden = view !== "form";
    if (auditLoader) auditLoader.hidden = view !== "loading";
    if (auditResults) auditResults.hidden = view !== "results";
    if (auditError) auditError.hidden = view !== "error";
  }

  function setPct(n) {
    var value = Math.max(0, Math.min(100, Math.round(n)));
    if (auditPct) auditPct.textContent = value + "%";
    if (auditPctFill) auditPctFill.style.width = value + "%";
  }

  function stopPct() {
    if (auditTick) {
      clearInterval(auditTick);
      auditTick = null;
    }
  }

  function startPct() {
    stopPct();
    var current = 0;
    setPct(0);
    auditTick = setInterval(function () {
      current = Math.min(92, current + (current < 40 ? 3.2 : current < 75 ? 1.4 : 0.45));
      setPct(current);
    }, 220);
  }

  function scoreTone(score) {
    if (score >= 90) return "is-high";
    if (score >= 50) return "is-mid";
    return "is-low";
  }

  function setGauge(cat, score) {
    var card = document.querySelector('.audit-gauge[data-cat="' + cat + '"]');
    if (!card) return;
    card.classList.remove("is-high", "is-mid", "is-low");
    card.classList.add(scoreTone(score));
    var ring = card.querySelector(".audit-ring");
    var label = card.querySelector(".audit-score");
    if (label) label.textContent = String(score);
    if (ring) {
      ring.style.strokeDasharray = String(RING);
      ring.style.strokeDashoffset = String(RING - (RING * score) / 100);
    }
  }

  function resetGauges() {
    ["performance", "accessibility", "best-practices", "seo"].forEach(function (cat) {
      var card = document.querySelector('.audit-gauge[data-cat="' + cat + '"]');
      if (!card) return;
      card.classList.remove("is-high", "is-mid", "is-low");
      var ring = card.querySelector(".audit-ring");
      var label = card.querySelector(".audit-score");
      if (label) label.textContent = "—";
      if (ring) ring.style.strokeDashoffset = String(RING);
    });
  }

  function showAuditError(message) {
    stopPct();
    if (auditErrorText) auditErrorText.textContent = message;
    setAuditView("error");
    if (auditSubmit) auditSubmit.disabled = false;
  }

  function resetAuditForm() {
    if (auditAbort) {
      try { auditAbort.abort(); } catch (err) {}
      auditAbort = null;
    }
    stopPct();
    if (auditInlineError) {
      auditInlineError.hidden = true;
      auditInlineError.textContent = "";
    }
    resetGauges();
    setAuditAccordion(null);
    setAuditView("form");
    if (auditSubmit) auditSubmit.disabled = false;
    if (auditInput) auditInput.focus();
  }

  function runPagespeed(targetUrl) {
    var endpoint = "/api/lighthouse?url=" + encodeURIComponent(targetUrl);

    auditAbort = typeof AbortController !== "undefined" ? new AbortController() : null;
    return fetch(endpoint, {
      method: "GET",
      signal: auditAbort ? auditAbort.signal : undefined
    }).then(function (res) {
      return res.text().then(function (text) {
        var data = {};
        try { data = text ? JSON.parse(text) : {}; } catch (err) {
          throw new Error(t("audit.busy"));
        }
        var status = (data.error && data.error.code) || res.status;
        if (status === 429 || status >= 500 || !res.ok || data.error) {
          var serverMessage = typeof data.error === "string"
            ? data.error
            : (data.error && data.error.message);
          throw new Error(serverMessage || t("audit.busy"));
        }
        return data;
      });
    });
  }

  function renderAudit(targetUrl, data) {
    var cats = data && data.lighthouseResult && data.lighthouseResult.categories;
        if (!cats) throw new Error(t("audit.busy"));

    function toScore(cat) {
      var raw = cats[cat] && typeof cats[cat].score === "number" ? cats[cat].score : 0;
      return Math.round(raw * 100);
    }

    var scores = {
      performance: toScore("performance"),
      accessibility: toScore("accessibility"),
      "best-practices": toScore("best-practices"),
      seo: toScore("seo")
    };

    setGauge("performance", scores.performance);
    setGauge("accessibility", scores.accessibility);
    setGauge("best-practices", scores["best-practices"]);
    setGauge("seo", scores.seo);

    if (auditTested) auditTested.textContent = t("audit.tested") + " " + targetUrl;

    if (auditWa) {
      var msg = "Olá, quero o plano de correção técnica grátis.\n"
        + "URL: " + targetUrl + "\n"
        + "Desempenho: " + scores.performance
        + " | Acessibilidade: " + scores.accessibility
        + " | Boas Práticas: " + scores["best-practices"]
        + " | SEO: " + scores.seo;
      auditWa.href = "https://wa.me/351937260282?text=" + encodeURIComponent(msg);
    }
  }

  if (auditForm && auditInput && auditLoader && auditResults) {
    auditForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (auditInlineError) {
        auditInlineError.hidden = true;
        auditInlineError.textContent = "";
      }

      var targetUrl = normalizeAuditUrl(auditInput.value);
      if (!targetUrl) {
        if (auditInlineError) {
          auditInlineError.textContent = t("audit.invalid");
          auditInlineError.hidden = false;
        }
        auditInput.focus();
        return;
      }

      if (auditSubmit) auditSubmit.disabled = true;
      setAuditView("loading");
      startPct();

      runPagespeed(targetUrl).then(function (data) {
        stopPct();
        setPct(100);
        renderAudit(targetUrl, data);
        setTimeout(function () {
          setAuditView("results");
          setAuditAccordion("performance", true);
          if (auditSubmit) auditSubmit.disabled = false;
        }, 380);
      }).catch(function (err) {
        if (err && err.name === "AbortError") return;
        showAuditError((err && err.message) || t("audit.busy"));
      });
    });

    if (auditRetry) auditRetry.addEventListener("click", resetAuditForm);
    if (auditAgain) auditAgain.addEventListener("click", resetAuditForm);
  }

  var sofiaWidget = document.getElementById("sofiaWidget");
  var sofiaToggle = document.getElementById("sofiaToggle");
  var sofiaClose = document.getElementById("sofiaClose");
  var sofiaPanel = document.getElementById("sofiaPanel");
  var sofiaLog = document.getElementById("sofiaLog");
  var sofiaForm = document.getElementById("sofiaForm");
  var sofiaInput = document.getElementById("sofiaInput");
  var sofiaBusy = false;
  var sofiaHistory = [];

  function sofiaEscape(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/\n/g, "<br>");
  }

  function sofiaSeedHistory() {
    sofiaHistory = [{ role: "assistant", content: t("chat.welcome") }];
  }

  function sofiaAppend(role, text) {
    var wrap = document.createElement("div");
    wrap.className = "sofia-msg sofia-msg-" + (role === "user" ? "user" : "bot");
    var p = document.createElement("p");
    p.innerHTML = sofiaEscape(text);
    wrap.appendChild(p);
    sofiaLog.appendChild(wrap);
    sofiaLog.scrollTop = sofiaLog.scrollHeight;
    return wrap;
  }

  function sofiaSetOpen(open) {
    if (!sofiaWidget || !sofiaPanel || !sofiaToggle) return;
    sofiaWidget.classList.toggle("is-open", open);
    sofiaPanel.hidden = !open;
    sofiaToggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (open && sofiaInput) sofiaInput.focus();
  }

  if (sofiaToggle && sofiaPanel && sofiaLog && sofiaForm && sofiaInput) {
    sofiaSeedHistory();

    sofiaToggle.addEventListener("click", function () {
      sofiaSetOpen(sofiaPanel.hidden);
    });
    if (sofiaClose) {
      sofiaClose.addEventListener("click", function () {
        sofiaSetOpen(false);
        sofiaToggle.focus();
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && sofiaWidget && sofiaWidget.classList.contains("is-open")) {
        sofiaSetOpen(false);
        sofiaToggle.focus();
      }
    });

    sofiaForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (sofiaBusy) return;
      var text = (sofiaInput.value || "").trim();
      if (!text) return;

      sofiaInput.value = "";
      sofiaAppend("user", text);
      sofiaHistory.push({ role: "user", content: text });
      if (sofiaHistory.length > 12) sofiaHistory = sofiaHistory.slice(-12);

      sofiaBusy = true;
      sofiaInput.disabled = true;
      var sendBtn = sofiaForm.querySelector(".sofia-send");
      if (sendBtn) sendBtn.disabled = true;

      var typing = document.createElement("div");
      typing.className = "sofia-msg sofia-msg-bot";
      typing.setAttribute("data-typing", "1");
      typing.innerHTML = '<div class="sofia-typing" aria-label="' + sofiaEscape(t("chat.typing")) + '"><span></span><span></span><span></span></div>';
      sofiaLog.appendChild(typing);
      sofiaLog.scrollTop = sofiaLog.scrollHeight;

      fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: sofiaHistory, lang: currentLang })
      })
        .then(function (res) {
          return res.json().then(function (data) {
            return { ok: res.ok, data: data };
          });
        })
        .then(function (result) {
          if (typing.parentNode) typing.parentNode.removeChild(typing);
          var reply = result.ok && result.data && result.data.reply
            ? String(result.data.reply)
            : t("chat.error");
          sofiaAppend("bot", reply);
          if (result.ok && result.data && result.data.reply) {
            sofiaHistory.push({ role: "assistant", content: reply });
          }
        })
        .catch(function () {
          if (typing.parentNode) typing.parentNode.removeChild(typing);
          sofiaAppend("bot", t("chat.error"));
        })
        .then(function () {
          sofiaBusy = false;
          sofiaInput.disabled = false;
          if (sendBtn) sendBtn.disabled = false;
          sofiaInput.focus();
        });
    });
  }
})();
