(function () {
  var STORAGE_KEY = "stellar-lang";
  // Previous brand's key: keep reading it so visitors who already chose a
  // language before the rename don't get reset back to Portuguese.
  var LEGACY_STORAGE_KEY = "nexis-lang";

  function applyLang(lang) {
    var dict = I18N[lang] || I18N.pt;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (dict[key]) el.textContent = dict[key];
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-html");
      if (dict[key]) el.innerHTML = dict[key];
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
})();
