(function () {
  const page = document.querySelector("[data-add-time-page]");
  if (!page) return;

  const runWithLoading = async (control, callback) => {
    if (!control || control.dataset.loading === "true") return;

    if (window.Web3UI?.runWithLoading) {
      await window.Web3UI.runWithLoading(control, callback, { min: 800, max: 1200 });
    }
  };

  document.querySelectorAll("[data-addtime-payment-link]").forEach((link) => {
    link.addEventListener("click", async (event) => {
      event.preventDefault();
      if (link.dataset.loading === "true") return;

      await runWithLoading(link, () => {
        window.location.href = link.href;
      });
    });
  });

  const cashTokenButton = page.querySelector("[data-cash-token-button]");
  const cashToken = page.querySelector("[data-cash-token]");

  cashTokenButton?.addEventListener("click", () => {
    runWithLoading(cashTokenButton, () => {
      cashTokenButton.hidden = true;

      if (cashToken) {
        cashToken.hidden = false;
        cashToken.scrollIntoView({
          behavior: "smooth",
          block: "nearest"
        });
      }
    });
  });

  page.querySelectorAll("[data-simple-payment-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const submitter = event.submitter instanceof HTMLElement
        ? event.submitter
        : form.querySelector("[data-payment-button], [data-payment-button-secondary]");

      runWithLoading(submitter);
    });
  });

  const cryptoButton = page.querySelector("[data-crypto-create]");
  const cryptoResult = page.querySelector("[data-crypto-result]");
  const cryptoCheckbox = page.querySelector("[data-crypto-understood]");
  const cryptoError = page.querySelector("[data-crypto-error]");

  cryptoButton?.addEventListener("click", () => {
    const requiresCheckbox = cryptoButton.hasAttribute("data-requires-understood");

    if (requiresCheckbox && !cryptoCheckbox?.checked) {
      if (cryptoError) {
        cryptoError.hidden = false;
      }
      cryptoCheckbox?.focus();
      return;
    }

    if (cryptoError) {
      cryptoError.hidden = true;
    }

    runWithLoading(cryptoButton, () => {
      if (!cryptoResult) return;

      cryptoResult.hidden = false;
      cryptoResult.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    });
  });

  cryptoCheckbox?.addEventListener("change", () => {
    if (cryptoError && cryptoCheckbox.checked) {
      cryptoError.hidden = true;
    }
  });

  page.querySelectorAll("[data-copy-value]").forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.dataset.copyValue || "";
      if (!value) return;

      try {
        await navigator.clipboard.writeText(value);
      } catch {
        const fallback = document.createElement("textarea");
        fallback.value = value;
        fallback.setAttribute("readonly", "");
        fallback.style.position = "fixed";
        fallback.style.opacity = "0";
        document.body.appendChild(fallback);
        fallback.select();
        document.execCommand("copy");
        fallback.remove();
      }

      button.dataset.copied = "true";
      window.setTimeout(() => {
        delete button.dataset.copied;
      }, 1200);
    });
  });
})();
