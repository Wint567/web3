(function () {
  const form = document.querySelector("[data-receipt-form]");

  if (!form) {
    return;
  }

  const submitButton = form.querySelector("[data-receipt-submit]");
  const selectButton = form.querySelector("[data-select-button]");
  const receiptOptions = form.querySelectorAll("[data-receipt-option]");
  const panels = document.querySelectorAll("[data-receipt-panel]");

  const hidePanels = () => {
    panels.forEach((panel) => {
      panel.hidden = true;
    });
  };

  receiptOptions.forEach((option) => {
    option.addEventListener("click", () => {
      form.dataset.receiptSelected = option.dataset.receiptOption || "";
      hidePanels();
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (submitButton?.dataset.loading === "true") {
      return;
    }

    const selectedReceipt = form.dataset.receiptSelected || "";
    hidePanels();

    if (!selectedReceipt) {
      selectButton?.focus({ preventScroll: true });
      return;
    }

    await window.Web3UI?.runWithLoading?.(submitButton, () => {
      const activePanel = document.querySelector(`[data-receipt-panel="${selectedReceipt}"]`);

      if (!activePanel) {
        return;
      }

      activePanel.hidden = false;
      activePanel.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, { min: 800, max: 1200 });
  });
})();
