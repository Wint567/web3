(function () {
  const generatedAccountNumber = "2345 6567 7890 9090";
  const normalizeAccount = (value) => value.replace(/\s+/g, "").trim();

  const goToAccountPage = () => {
    window.location.href = "./add-time/index.html";
  };

  const runButtonLoading = (button, callback) => {
    if (!button || button.dataset.loading === "true") return false;
    return window.Web3UI?.runWithLoading?.(button, callback, { min: 800, max: 1200 });
  };

  const setFieldError = (input, message) => {
    const field = input.closest("[data-field]");
    const error = field?.querySelector("[data-error]");
    input.setAttribute("aria-invalid", "true");
    if (error) {
      error.textContent = message;
      error.hidden = false;
    }
  };

  const clearFieldError = (input) => {
    const field = input.closest("[data-field]");
    const error = field?.querySelector("[data-error]");
    input.removeAttribute("aria-invalid");
    if (error) {
      error.hidden = true;
    }
  };

  const loginForm = document.querySelector("[data-login-form]");
  const loginInput = document.querySelector("[data-login-account]");
  const loginButton = document.querySelector("[data-login-submit]");
  const qrButton = document.querySelector("[data-generate-qr]");
  const qrPanel = document.querySelector("[data-qr-panel]");

  loginInput?.addEventListener("input", () => clearFieldError(loginInput));

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (loginButton?.dataset.loading === "true") {
      return;
    }

    if (!loginInput.value.trim()) {
      setFieldError(loginInput, "Account number is required.");
      loginInput.focus();
      return;
    }

    await runButtonLoading(loginButton, goToAccountPage);
  });

  qrButton?.addEventListener("click", async () => {
    await runButtonLoading(qrButton, () => {
      qrButton.hidden = true;
      qrPanel.hidden = false;
    });
  });

  const registerForm = document.querySelector("[data-register-form]");
  const registerInput = document.querySelector("[data-register-account]");
  const confirmCheckbox = document.querySelector("[data-confirm-saved]");
  const registerButton = document.querySelector("[data-register-submit]");
  const displayedNumber = document.querySelector("[data-generated-account]");
  const copyButton = document.querySelector("[data-copy-account]");
  const downloadButton = document.querySelector("[data-download-account]");

  const updateRegisterState = () => {
    if (!registerInput || !confirmCheckbox || !registerButton) return;

    const matches = normalizeAccount(registerInput.value) === normalizeAccount(generatedAccountNumber);
    const canSubmit = matches && confirmCheckbox.checked;
    registerButton.dataset.locked = String(!canSubmit);
    registerButton.disabled = !canSubmit;

    if (displayedNumber) {
      displayedNumber.classList.toggle("blur-[7.5px]", confirmCheckbox.checked);
    }
  };

  registerInput?.addEventListener("input", () => {
    clearFieldError(registerInput);
    updateRegisterState();
  });

  confirmCheckbox?.addEventListener("change", updateRegisterState);

  registerForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (registerButton?.dataset.loading === "true") {
      return;
    }

    if (!registerInput.value.trim()) {
      setFieldError(registerInput, "Account number is required.");
      registerInput.focus();
      return;
    }

    if (normalizeAccount(registerInput.value) !== normalizeAccount(generatedAccountNumber)) {
      setFieldError(registerInput, "Enter the account number exactly as shown above.");
      registerInput.focus();
      return;
    }

    if (!confirmCheckbox.checked) {
      confirmCheckbox.focus();
      return;
    }

    await runButtonLoading(registerButton, goToAccountPage);
  });

  copyButton?.addEventListener("click", async () => {
    const label = copyButton.querySelector("[data-button-text]");
    const previous = label?.textContent || "Copy";

    await runButtonLoading(copyButton, async () => {
      try {
        await navigator.clipboard.writeText(generatedAccountNumber);
      } catch {
        const fallback = document.createElement("textarea");
        fallback.value = generatedAccountNumber;
        fallback.setAttribute("readonly", "");
        fallback.style.position = "fixed";
        fallback.style.opacity = "0";
        document.body.appendChild(fallback);
        fallback.select();
        document.execCommand("copy");
        fallback.remove();
      }

      if (label) {
        label.textContent = "Copied";
        window.setTimeout(() => {
          label.textContent = previous;
        }, 1200);
      }
    });
  });

  downloadButton?.addEventListener("click", async () => {
    await runButtonLoading(downloadButton, () => {
      const blob = new Blob([`${generatedAccountNumber}\n`], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "web3-vpn-account-number.txt";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    });
  });

  updateRegisterState();
})();
