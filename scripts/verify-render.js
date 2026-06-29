const { chromium } = require("playwright");
const { pathToFileURL } = require("url");
const path = require("path");

const viewports = [
  [1440, 900],
  [1280, 900],
  [1024, 900],
  [768, 900],
  [430, 1100],
  [390, 1100],
  [360, 1100]
];

const addTimePaymentPages = [
  "cash.html",
  "vouchers.html",
  "monero.html",
  "bitcoin.html",
  "bitcoin-cash.html",
  "bitcoin-lightning.html",
  "credit-card.html",
  "paypal.html",
  "bank-wire.html",
  "swish.html",
  "eps-transfer.html",
  "bancontact.html",
  "ideal-wero.html",
  "przelewy24.html"
];

const sidebarPages = [
  { file: path.join("devices", "index.html"), label: "Devices" },
  { file: path.join("request-a-receipt", "index.html"), label: "Request A Receipt" },
  { file: path.join("downloads", "index.html"), label: "Downloads" },
  { file: path.join("wire-guard-configuration", "index.html"), label: "WireGuard Configuration" },
  { file: path.join("change-your-online-habits", "index.html"), label: "Change Your Online Habits", expectSidebar: false },
  { file: path.join("recover-lost-account-credit-card", "index.html"), label: "Recover Lost Account", expectSidebar: false }
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const [width, height] of viewports) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];

    page.on("console", (message) => {
      if (message.type() === "error") {
        errors.push(message.text());
      }
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto(pathToFileURL(path.resolve("index.html")).href, { waitUntil: "load" });
    await page.waitForTimeout(300);

    const info = await page.evaluate(() => {
      const registerView = document.querySelector("[data-auth-view='register']");

      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        brokenImages: Array.from(document.images)
          .filter((image) => !image.complete || image.naturalWidth === 0)
          .map((image) => image.getAttribute("src")),
        loginVisible: !document.querySelector("[data-auth-view='login']")?.hidden,
        registerHidden: !registerView || Boolean(registerView.hidden)
      };
    });

    results.push({ width, height, ...info, errors });
    await page.close();
  }

  for (const [width, height] of viewports) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];

    page.on("console", (message) => {
      if (message.type() === "error") {
        errors.push(message.text());
      }
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto(pathToFileURL(path.resolve("register.html")).href, { waitUntil: "load" });
    await page.waitForTimeout(300);

    const info = await page.evaluate(() => {
      const loginView = document.querySelector("[data-auth-view='login']");

      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        brokenImages: Array.from(document.images)
          .filter((image) => !image.complete || image.naturalWidth === 0)
          .map((image) => image.getAttribute("src")),
        registerVisible: !document.querySelector("[data-auth-view='register']")?.hidden,
        loginHidden: !loginView || Boolean(loginView.hidden)
      };
    });

    results.push({ width, height, registerViewport: true, ...info, errors });
    await page.close();
  }

  for (const [width, height] of viewports) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];

    page.on("console", (message) => {
      if (message.type() === "error") {
        errors.push(message.text());
      }
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto(pathToFileURL(path.resolve("add-time", "index.html")).href, { waitUntil: "load" });
    await page.waitForTimeout(300);

    const info = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      brokenImages: Array.from(document.images)
        .filter((image) => !image.complete || image.naturalWidth === 0)
        .map((image) => image.getAttribute("src")),
      addTimePageVisible: Boolean(document.querySelector("[data-add-time-page]")),
      addTimeSidebarActive: document.querySelector("[aria-current='page']")?.textContent?.includes("Add Time")
    }));

    results.push({ width, height, addTimeViewport: true, ...info, errors });
    await page.close();
  }

  for (const sidebarPage of sidebarPages) {
    for (const [width, height] of [[1440, 900], [390, 1100], [360, 1100]]) {
      const page = await browser.newPage({ viewport: { width, height } });
      const errors = [];

      page.on("console", (message) => {
        if (message.type() === "error") {
          errors.push(message.text());
        }
      });
      page.on("pageerror", (error) => errors.push(error.message));

      await page.goto(pathToFileURL(path.resolve(sidebarPage.file)).href, { waitUntil: "load" });
      await page.waitForTimeout(300);

      const info = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        brokenImages: Array.from(document.images)
          .filter((image) => !image.complete || image.naturalWidth === 0)
          .map((image) => image.getAttribute("src")),
        authPageVisible: Boolean(document.querySelector("[data-auth-page]")),
        activeSidebarText: document.querySelector("[aria-current='page']")?.textContent?.replace(/\s+/g, " ").trim()
      }));

      results.push({ width, height, sidebarViewport: true, ...sidebarPage, ...info, errors });
      await page.close();
    }
  }

  const receiptPage = await browser.newPage({ viewport: { width: 390, height: 1100 } });
  const receiptErrors = [];
  receiptPage.on("console", (message) => {
    if (message.type() === "error") {
      receiptErrors.push(message.text());
    }
  });
  receiptPage.on("pageerror", (error) => receiptErrors.push(error.message));

  await receiptPage.goto(pathToFileURL(path.resolve("request-a-receipt", "index.html")).href, { waitUntil: "load" });

  const receiptStates = {};
  for (const receiptType of ["paypal", "swish", "other", "credit-card"]) {
    await receiptPage.locator("[data-select-button]").first().click();
    await receiptPage.locator(`[data-receipt-option='${receiptType}']`).click();

    const hiddenBeforeSubmit = await receiptPage.evaluate((type) => (
      Boolean(document.querySelector(`[data-receipt-panel="${type}"]`)?.hidden)
    ), receiptType);

    await receiptPage.click("[data-receipt-submit]");
    await receiptPage.waitForFunction((type) => (
      !document.querySelector(`[data-receipt-panel="${type}"]`)?.hidden
    ), receiptType, { timeout: 2500 });

    const visibleOnlySelected = await receiptPage.evaluate((type) => (
      Array.from(document.querySelectorAll("[data-receipt-panel]")).every((panel) => (
        (panel.dataset.receiptPanel === type) === !panel.hidden
      ))
    ), receiptType);

    receiptStates[receiptType] = { hiddenBeforeSubmit, visibleOnlySelected };
  }

  const receiptInfo = await receiptPage.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    brokenImages: Array.from(document.images)
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.getAttribute("src")),
    receiptSidebarActive: document.querySelector("[aria-current='page']")?.textContent?.includes("Request A Receipt"),
    receiptSelectValue: document.querySelector("[data-receipt-form] [data-select-value]")?.textContent?.trim()
  }));

  await receiptPage.close();
  results.push({
    width: 390,
    height: 1100,
    receiptInteraction: true,
    receiptStates,
    ...receiptInfo,
    errors: receiptErrors
  });

  for (const file of addTimePaymentPages) {
    for (const [width, height] of [[1440, 900], [390, 1100], [360, 1100]]) {
      const page = await browser.newPage({ viewport: { width, height } });
      const errors = [];

      page.on("console", (message) => {
        if (message.type() === "error") {
          errors.push(message.text());
        }
      });
      page.on("pageerror", (error) => errors.push(error.message));

      await page.goto(pathToFileURL(path.resolve("add-time", file)).href, { waitUntil: "load" });
      await page.waitForTimeout(300);

      const info = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        brokenImages: Array.from(document.images)
          .filter((image) => !image.complete || image.naturalWidth === 0)
          .map((image) => image.getAttribute("src")),
        addTimePaymentPageVisible: Boolean(document.querySelector("[data-addtime-payment-page]")),
        addTimeSidebarActive: document.querySelector("[aria-current='page']")?.textContent?.includes("Add Time")
      }));

      results.push({ width, height, addTimePaymentViewport: true, file, ...info, errors });
      await page.close();
    }
  }

  const interactionPage = await browser.newPage({ viewport: { width: 390, height: 1100 } });
  const interactionErrors = [];
  interactionPage.on("console", (message) => {
    if (message.type() === "error") {
      interactionErrors.push(message.text());
    }
  });
  interactionPage.on("pageerror", (error) => interactionErrors.push(error.message));

  await interactionPage.goto(pathToFileURL(path.resolve("index.html")).href, { waitUntil: "load" });
  await interactionPage.click("[data-mobile-menu-button]");
  await interactionPage.waitForSelector("[data-mobile-menu]:not([hidden])", { timeout: 2000 });
  await interactionPage.click("[data-mobile-menu-close]");
  await interactionPage.waitForFunction(() => document.querySelector("[data-mobile-menu]")?.hidden, { timeout: 2000 });
  await interactionPage.click("[data-login-submit]");
  await interactionPage.fill("[data-login-account]", "2345 6567 7890 9090");
  const loginErrorHiddenAfterInput = await interactionPage.evaluate(() => (
    Boolean(document.querySelector("#login-account-error")?.hidden)
  ));
  await interactionPage.click("[data-generate-qr]");
  await interactionPage.waitForSelector("[data-qr-panel]:not([hidden])", { timeout: 2000 });
  const qrVisibleBeforeRegister = await interactionPage.evaluate(() => (
    !document.querySelector("[data-qr-panel]")?.hidden
  ));
  await interactionPage.click("a[href='./register.html']");
  await interactionPage.waitForURL(/register\.html$/, { timeout: 2000 });
  await interactionPage.fill("[data-register-account]", "2345 6567 7890 9090");
  await interactionPage.locator("label").filter({
    has: interactionPage.locator("[data-confirm-saved]")
  }).click({ force: true });

  const interactionInfo = await interactionPage.evaluate(() => ({
    mobileMenuClosed: Boolean(document.querySelector("[data-mobile-menu]")?.hidden),
    registerVisible: !document.querySelector("[data-auth-view='register']")?.hidden,
    registerSubmitEnabled: !document.querySelector("[data-register-submit]")?.disabled
  }));
  interactionInfo.qrVisible = qrVisibleBeforeRegister;
  interactionInfo.loginErrorHiddenAfterInput = loginErrorHiddenAfterInput;

  await interactionPage.close();
  results.push({ width: 390, height: 1100, interaction: true, ...interactionInfo, errors: interactionErrors });

  const statePage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const stateErrors = [];
  statePage.on("console", (message) => {
    if (message.type() === "error") {
      stateErrors.push(message.text());
    }
  });
  statePage.on("pageerror", (error) => stateErrors.push(error.message));

  await statePage.goto(pathToFileURL(path.resolve("index.html")).href, { waitUntil: "load" });
  await statePage.click("header nav [data-demo-loading]");
  await statePage.waitForFunction(() => document.querySelector("header nav [data-demo-loading]")?.dataset.loading === "true", { timeout: 1000 });
  const headerLinkLoadingText = await statePage.locator("header nav [data-demo-loading]").first().textContent();
  await statePage.waitForFunction(() => !document.querySelector("header nav [data-demo-loading]")?.dataset.loading, { timeout: 2500 });
  await statePage.locator("footer [data-select-button]").click();
  await statePage.locator("footer [data-select-option]").filter({ hasText: "Deutsch" }).click();

  const stateInfo = await statePage.evaluate(() => ({
    headerLinkLoadingCleared: !document.querySelector("header nav [data-demo-loading]")?.dataset.loading,
    headerLinkTextRestored: document.querySelector("header nav [data-demo-loading]")?.textContent?.trim() === "VPN",
    headerSelectAbsent: !document.querySelector("header [data-select-button]"),
    footerSelectValue: document.querySelector("footer [data-select-value]")?.textContent?.trim()
  }));
  stateInfo.headerLinkLoadingText = headerLinkLoadingText?.trim();

  await statePage.close();
  results.push({ width: 1440, height: 900, stateInteraction: true, ...stateInfo, errors: stateErrors });

  const addTimePage = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const addTimeErrors = [];
  addTimePage.on("console", (message) => {
    if (message.type() === "error") {
      addTimeErrors.push(message.text());
    }
  });
  addTimePage.on("pageerror", (error) => addTimeErrors.push(error.message));

  await addTimePage.goto(pathToFileURL(path.resolve("index.html")).href, { waitUntil: "load" });
  await addTimePage.fill("[data-login-account]", "2345 6567 7890 9090");
  await addTimePage.click("[data-login-submit]");
  await addTimePage.waitForURL(/add-time\/index\.html$/, { timeout: 2500 });
  await addTimePage.click("[data-addtime-payment-link][data-method='bitcoin']");
  await addTimePage.waitForURL(/add-time\/bitcoin\.html$/, { timeout: 2500 });
  await addTimePage.click("[data-crypto-create]");
  await addTimePage.waitForSelector("[data-crypto-error]:not([hidden])", { timeout: 1000 });
  const addTimeErrorText = await addTimePage.locator("[data-crypto-error]").textContent();
  await addTimePage.locator("[data-crypto-understood]").check({ force: true });
  await addTimePage.click("[data-crypto-create]");
  await addTimePage.waitForSelector("[data-crypto-result]:not([hidden])", { timeout: 2500 });
  await addTimePage.waitForSelector("img[alt='Payment QR code']", { timeout: 1000 });

  const addTimeInfo = await addTimePage.evaluate(() => ({
    addTimeVisible: Boolean(document.querySelector("[data-add-time-page]")),
    addTimePaymentVisible: Boolean(document.querySelector("[data-addtime-payment-page]")),
    addTimeSuccessVisible: !document.querySelector("[data-crypto-result]")?.hidden,
    addTimeSidebarActive: document.querySelector("[aria-current='page']")?.textContent?.includes("Add Time")
  }));
  addTimeInfo.addTimeErrorReachable = Boolean(addTimeErrorText?.trim());
  await addTimePage.click("header [data-logout]");
  await addTimePage.waitForURL(/index\.html$/, { timeout: 2500 });
  addTimeInfo.logoutReturnedToLogin = await addTimePage.evaluate(() => (
    !document.querySelector("[data-auth-view='login']")?.hidden
  ));

  await addTimePage.close();
  results.push({ width: 1440, height: 1100, addTimeInteraction: true, ...addTimeInfo, errors: addTimeErrors });

  const cashPage = await browser.newPage({ viewport: { width: 390, height: 1100 } });
  const cashErrors = [];
  cashPage.on("console", (message) => {
    if (message.type() === "error") {
      cashErrors.push(message.text());
    }
  });
  cashPage.on("pageerror", (error) => cashErrors.push(error.message));

  await cashPage.goto(pathToFileURL(path.resolve("add-time", "cash.html")).href, { waitUntil: "load" });
  await cashPage.click("[data-cash-token-button]");
  await cashPage.waitForSelector("[data-cash-token]:not([hidden])", { timeout: 2500 });

  const cashInfo = await cashPage.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    brokenImages: Array.from(document.images)
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.getAttribute("src")),
    cashTokenVisible: !document.querySelector("[data-cash-token]")?.hidden,
    cashTokenButtonHidden: Boolean(document.querySelector("[data-cash-token-button]")?.hidden),
    cashTokenText: document.querySelector("[data-cash-token]")?.textContent?.trim()
  }));

  await cashPage.close();
  results.push({ width: 390, height: 1100, cashTokenInteraction: true, ...cashInfo, errors: cashErrors });

  await browser.close();

  const failed = results.filter((result) => {
    if (result.errors.length > 0 || (result.brokenImages || []).length > 0) {
      return true;
    }

    if (result.stateInteraction) {
      return result.headerLinkLoadingText !== "Loading..." ||
        !result.headerLinkLoadingCleared ||
        !result.headerLinkTextRestored ||
        !result.headerSelectAbsent ||
        result.footerSelectValue !== "Deutsch";
    }

    if (result.addTimeInteraction) {
      return !result.addTimeVisible ||
        !result.addTimeErrorReachable ||
        !result.addTimePaymentVisible ||
        !result.addTimeSuccessVisible ||
        !result.addTimeSidebarActive ||
        !result.logoutReturnedToLogin;
    }

    if (result.cashTokenInteraction) {
      return result.scrollWidth > result.clientWidth ||
        !result.cashTokenVisible ||
        !result.cashTokenButtonHidden ||
        result.cashTokenText !== "4DM4-G4EP-8JGG";
    }

    if (result.receiptInteraction) {
      return result.scrollWidth > result.clientWidth ||
        !result.receiptSidebarActive ||
        result.receiptSelectValue !== "Credit Card" ||
        Object.values(result.receiptStates).some((state) => !state.hiddenBeforeSubmit || !state.visibleOnlySelected);
    }

    if (result.registerViewport) {
      return result.scrollWidth > result.clientWidth || !result.registerVisible || !result.loginHidden;
    }

    if (result.addTimeViewport) {
      return result.scrollWidth > result.clientWidth || !result.addTimePageVisible || !result.addTimeSidebarActive;
    }

    if (result.addTimePaymentViewport) {
      return result.scrollWidth > result.clientWidth || !result.addTimePaymentPageVisible || !result.addTimeSidebarActive;
    }

    if (result.sidebarViewport) {
      return result.scrollWidth > result.clientWidth ||
        !result.authPageVisible ||
        (result.expectSidebar !== false && !result.activeSidebarText?.includes(result.label));
    }

    if (result.interaction) {
      return !result.loginErrorHiddenAfterInput || !result.mobileMenuClosed || !result.qrVisible || !result.registerVisible || !result.registerSubmitEnabled;
    }

    return result.scrollWidth > result.clientWidth || !result.loginVisible || !result.registerHidden;
  });

  console.log(JSON.stringify(results, null, 2));

  if (failed.length > 0) {
    process.exit(1);
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
