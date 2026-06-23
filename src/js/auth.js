(function () {
  const generatedAccountNumber = "2345 6567 7890 9090";
  const normalizeAccount = (value) => value.replace(/\s+/g, "").trim();
  const wait = () => window.Web3UI?.wait?.(800, 1200) || new Promise((resolve) => {
    window.setTimeout(resolve, 800 + Math.round(Math.random() * 400));
  });

  const goToAccountPage = () => {
    window.location.href = "./add-time/index.html";
  };

  const setButtonLoading = (button, isLoading) => {
    if (!button) return;
    if (window.Web3UI?.setLoading) {
      window.Web3UI.setLoading(button, isLoading);
      return;
    }

    const label = button.querySelector("[data-button-text]");
    const loader = button.querySelector("[data-button-loader]");

    if (isLoading) {
      button.dataset.loading = "true";
    } else {
      delete button.dataset.loading;
    }

    button.classList.toggle("pointer-events-none", isLoading);
    button.disabled = button.dataset.locked === "true";
    button.setAttribute("aria-busy", String(isLoading));
    button.setAttribute("aria-disabled", String(isLoading || button.disabled));

    if (label) {
      label.classList.toggle("hidden", isLoading);
    }
    if (loader) {
      loader.classList.toggle("hidden", !isLoading);
    }
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

    setButtonLoading(loginButton, true);
    await wait();
    setButtonLoading(loginButton, false);
    goToAccountPage();
  });

  qrButton?.addEventListener("click", async () => {
    if (qrButton.dataset.loading === "true") {
      return;
    }

    setButtonLoading(qrButton, true);
    await wait();
    setButtonLoading(qrButton, false);
    qrButton.hidden = true;
    qrPanel.hidden = false;
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

    setButtonLoading(registerButton, true);
    await wait();
    setButtonLoading(registerButton, false);
    goToAccountPage();
  });

  copyButton?.addEventListener("click", async () => {
    if (copyButton.dataset.loading === "true") {
      return;
    }

    const label = copyButton.querySelector("[data-button-text]");
    const previous = label?.textContent || "Copy";

    setButtonLoading(copyButton, true);

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

    await wait();
    setButtonLoading(copyButton, false);

    if (label) {
      label.textContent = "Copied";
      window.setTimeout(() => {
        label.textContent = previous;
      }, 1200);
    }
  });

  downloadButton?.addEventListener("click", async () => {
    if (downloadButton.dataset.loading === "true") {
      return;
    }

    setButtonLoading(downloadButton, true);
    await wait();

    const blob = new Blob([`${generatedAccountNumber}\n`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "web3-vpn-account-number.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setButtonLoading(downloadButton, false);
  });

  updateRegisterState();
})();
