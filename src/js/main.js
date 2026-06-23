(function () {
  const menuButton = document.querySelector("[data-mobile-menu-button]");
  const menu = document.querySelector("[data-mobile-menu]");
  const closeButtons = menu?.querySelectorAll("[data-mobile-menu-close]");

  if (!menuButton || !menu || !closeButtons) {
    return;
  }

  let activeBeforeMenu = null;
  let closeTimer = null;
  const closeAnimationMs = 320;

  const openMenu = () => {
    window.clearTimeout(closeTimer);
    activeBeforeMenu = document.activeElement;
    menu.hidden = false;
    menu.setAttribute("aria-hidden", "false");
    menuButton.setAttribute("aria-expanded", "true");
    document.body.classList.add("overflow-hidden");

    window.requestAnimationFrame(() => {
      menu.dataset.state = "open";
      menu.querySelector("[data-mobile-menu-close]")?.focus({ preventScroll: true });
    });
  };

  const closeMenu = () => {
    if (menu.hidden) {
      return;
    }

    window.clearTimeout(closeTimer);
    menu.dataset.state = "closed";
    menu.setAttribute("aria-hidden", "true");
    menuButton.setAttribute("aria-expanded", "false");
    document.body.classList.remove("overflow-hidden");

    closeTimer = window.setTimeout(() => {
      menu.hidden = true;

      if (activeBeforeMenu instanceof HTMLElement) {
        activeBeforeMenu.focus({ preventScroll: true });
      }
    }, closeAnimationMs);
  };

  menuButton.addEventListener("click", () => {
    if (menu.dataset.state !== "open") {
      openMenu();
    } else {
      closeMenu();
    }
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeMenu);
  });

  menu.addEventListener("click", (event) => {
    const target = event.target;

    if (target === menu || (target instanceof HTMLElement && target.closest("[data-mobile-menu-link]"))) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu.hidden) {
      closeMenu();
    }
  });
})();

(function () {
  const wait = (min = 700, max = 1100) => new Promise((resolve) => {
    window.setTimeout(resolve, min + Math.round(Math.random() * (max - min)));
  });

  const setLoading = (control, isLoading) => {
    if (!control) return;

    const label = control.querySelector("[data-button-text], [data-link-text]");
    const loader = control.querySelector("[data-button-loader], [data-link-loader]");

    if (isLoading) {
      control.dataset.loading = "true";
    } else {
      delete control.dataset.loading;
    }

    control.classList.toggle("pointer-events-none", isLoading);
    control.setAttribute("aria-busy", String(isLoading));

    if (control instanceof HTMLButtonElement) {
      control.disabled = control.dataset.locked === "true";
      control.setAttribute("aria-disabled", String(isLoading || control.disabled));
    } else {
      control.setAttribute("aria-disabled", String(isLoading));
    }

    if (loader) {
      label?.classList.toggle("hidden", isLoading);
      loader.classList.toggle("hidden", !isLoading);
      return;
    }

    if (label) {
      if (!label.dataset.originalText) {
        label.dataset.originalText = label.textContent || "";
      }

      label.textContent = isLoading ? "Loading..." : label.dataset.originalText;
    }
  };

  window.Web3UI = {
    ...(window.Web3UI || {}),
    wait,
    setLoading
  };

  document.querySelectorAll("[data-demo-loading]").forEach((control) => {
    control.addEventListener("click", async (event) => {
      if (control.dataset.loading === "true") {
        event.preventDefault();
        return;
      }

      if (control instanceof HTMLAnchorElement) {
        event.preventDefault();
      }

      setLoading(control, true);
      await wait();
      setLoading(control, false);
    });
  });

  document.querySelectorAll("[data-logout]").forEach((control) => {
    control.addEventListener("click", async (event) => {
      event.preventDefault();
      if (control.dataset.loading === "true") return;

      setLoading(control, true);
      await wait();
      window.location.href = new URL("./index.html", document.baseURI).href;
    });
  });

  const closeSelect = (select) => {
    const button = select.querySelector("[data-select-button]");
    const menu = select.querySelector("[data-select-menu]");
    const arrow = select.querySelector("[data-select-arrow]");

    select.dataset.open = "false";
    if (button) {
      button.dataset.open = "false";
      button.setAttribute("aria-expanded", "false");
    }
    if (arrow) {
      arrow.dataset.open = "false";
    }
    if (menu) {
      menu.hidden = true;
    }
  };

  const openSelect = (select) => {
    document.querySelectorAll("[data-custom-select]").forEach((otherSelect) => {
      if (otherSelect !== select) {
        closeSelect(otherSelect);
      }
    });

    const button = select.querySelector("[data-select-button]");
    const menu = select.querySelector("[data-select-menu]");
    const arrow = select.querySelector("[data-select-arrow]");

    select.dataset.open = "true";
    if (button) {
      button.dataset.open = "true";
      button.setAttribute("aria-expanded", "true");
    }
    if (arrow) {
      arrow.dataset.open = "true";
    }
    if (menu) {
      menu.hidden = false;
    }
  };

  document.querySelectorAll("[data-custom-select]").forEach((select) => {
    const button = select.querySelector("[data-select-button]");
    const value = select.querySelector("[data-select-value]");
    const options = select.querySelectorAll("[data-select-option]");

    button?.addEventListener("click", () => {
      if (select.dataset.open === "true") {
        closeSelect(select);
      } else {
        openSelect(select);
      }
    });

    options.forEach((option) => {
      option.addEventListener("click", () => {
        if (value) {
          value.textContent = option.textContent;
        }

        options.forEach((item) => {
          item.setAttribute("aria-selected", String(item === option));
          item.dataset.selected = String(item === option);
        });

        closeSelect(select);
        button?.focus({ preventScroll: true });
      });
    });
  });

  document.addEventListener("click", (event) => {
    const target = event.target;

    document.querySelectorAll("[data-custom-select]").forEach((select) => {
      if (target instanceof Node && !select.contains(target)) {
        closeSelect(select);
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    document.querySelectorAll("[data-custom-select]").forEach(closeSelect);
  });
})();
