(function () {
  const root = document.querySelector("[data-recover-page]");

  if (!root) {
    return;
  }

  const alertIcon = (variant) => `
    <svg class="size-5 shrink-0" viewBox="0 0 20 20" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 18.3333C14.5833 18.3333 18.3333 14.5833 18.3333 10C18.3333 5.41667 14.5833 1.66667 10 1.66667C5.41667 1.66667 1.66667 5.41667 1.66667 10C1.66667 14.5833 5.41667 18.3333 10 18.3333Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="${variant === "danger" ? "M10 6.66667V10.8333" : "M10 13.3333V9.16667"}" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="${variant === "danger" ? "M9.99542 13.3333H10.0029" : "M9.99542 6.66667H10.0029"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `;

  const fillAlert = (node, variant, text) => {
    if (!node) {
      return;
    }

    node.innerHTML = `${alertIcon(variant)}<p>${text}</p>`;
  };

  const dangerText = "Please note that accounts are only traceable for 20 days.";
  const infoText = "If you email us to help resolve a lost account number, you will end up disclosing information about yourself to us (at a bare minimum, your email). If you prefer to remain anonymous, you can instead create a new account.";

  root.querySelectorAll("[data-recover-red-alert]").forEach((alert) => {
    fillAlert(alert, "danger", dangerText);
  });

  root.querySelectorAll("[data-recover-info-alert]").forEach((alert) => {
    fillAlert(alert, "info", infoText);
  });

  const tabs = root.querySelectorAll("[data-recover-tab]");
  const panels = root.querySelectorAll("[data-recover-panel]");

  const activateTab = (activeTab) => {
    const target = activeTab.dataset.recoverTab;

    tabs.forEach((tab) => {
      const isActive = tab === activeTab;
      tab.dataset.active = String(isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });

    panels.forEach((panel) => {
      const isActive = panel.dataset.recoverPanel === target;
      panel.hidden = !isActive;
      panel.setAttribute("aria-hidden", String(!isActive));
    });

    activeTab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activateTab(tab);
    });
  });

  root.querySelectorAll("[data-recover-form]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const button = form.querySelector("[data-recover-find]");

      if (!button || button.dataset.loading === "true") {
        return;
      }

      await window.Web3UI?.runWithLoading?.(button, null, { min: 800, max: 1200 });
    });
  });
})();
