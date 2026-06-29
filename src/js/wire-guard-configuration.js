(function () {
  const root = document.querySelector("[data-wireguard-page]");

  if (!root) {
    return;
  }

  const runButtonAction = async (button, action) => {
    if (!button || button.dataset.loading === "true") return;

    await window.Web3UI?.runWithLoading?.(button, action, { min: 800, max: 1200 });
  };

  const tabs = root.querySelectorAll("[data-wire-tab]");
  const panels = root.querySelectorAll("[data-wire-panel]");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.wireTab;

      tabs.forEach((item) => {
        const isActive = item === tab;
        item.dataset.active = String(isActive);
        item.setAttribute("aria-selected", String(isActive));
      });

      panels.forEach((panel) => {
        panel.hidden = panel.dataset.wirePanel !== target;
      });
    });
  });

  const setup = root.querySelector("[data-wire-setup]");
  const generated = root.querySelector("[data-wire-generated]");
  const keyOutput = root.querySelector("[data-wire-key-output]");
  const qrImage = root.querySelector("[data-wire-qr]");
  const privateKeyInput = root.querySelector("[data-wire-private-key]");
  const generatedKey = "UQJ3WXbsI1R9I1ms4mXcKcDu9Z1gjEwBwa+CpQkAxgc=";

  root.querySelector("[data-wire-platform-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    await runButtonAction(root.querySelector("[data-wire-platform-submit]"), () => {
      if (setup) {
        setup.hidden = false;
      }
    });
  });

  const revealGeneratedSettings = (value = generatedKey) => {
    if (keyOutput) {
      keyOutput.textContent = value.trim() || generatedKey;
      keyOutput.classList.remove("text-auth-secondary");
      keyOutput.classList.add("text-white");
    }

    if (generated) {
      generated.hidden = false;
    }
  };

  root.querySelector("[data-wire-generate-key]")?.addEventListener("click", async (event) => {
    await runButtonAction(event.currentTarget, () => {
      revealGeneratedSettings();
    });
  });

  root.querySelector("[data-wire-import-key]")?.addEventListener("click", async (event) => {
    await runButtonAction(event.currentTarget, () => {
      revealGeneratedSettings(privateKeyInput?.value || generatedKey);
    });
  });

  const advanced = root.querySelector("[data-wire-advanced]");
  const advancedToggle = root.querySelector("[data-wire-advanced-toggle]");
  const advancedContent = root.querySelector("[data-wire-advanced-content]");
  const advancedArrow = root.querySelector("[data-wire-advanced-arrow]");

  advancedToggle?.addEventListener("click", () => {
    const isOpen = advanced?.dataset.open === "true";
    const nextOpen = !isOpen;

    if (advanced) {
      advanced.dataset.open = String(nextOpen);
    }
    if (advancedContent) {
      advancedContent.hidden = !nextOpen;
    }
    if (advancedArrow) {
      advancedArrow.classList.toggle("rotate-180", nextOpen);
    }
    advancedToggle.setAttribute("aria-expanded", String(nextOpen));
  });

  root.querySelector("[data-wire-download-button]")?.addEventListener("click", async (event) => {
    await runButtonAction(event.currentTarget);
  });

  root.querySelector("[data-wire-qr-button]")?.addEventListener("click", async (event) => {
    await runButtonAction(event.currentTarget, () => {
      qrImage?.classList.remove("hidden");
    });
  });

  root.querySelectorAll("[data-wire-delete-device]").forEach((button) => {
    button.addEventListener("click", async () => {
      await runButtonAction(button, () => {
        button.closest("[data-wire-key-card]")?.remove();
      });
    });
  });
})();
