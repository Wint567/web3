const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const authLayoutSource = path.join(rootDir, "devices", "index.html");

const read = (file) => fs.readFileSync(file, "utf8");
const write = (file, content) => fs.writeFileSync(file, content);
const normalize = (file) => path.relative(rootDir, file).replace(/\\/g, "/");

const extractTag = (html, tag) => {
  const match = html.match(new RegExp(`<${tag}\\b[\\s\\S]*?</${tag}>`, "i"));
  if (!match) {
    throw new Error(`Could not find <${tag}> block`);
  }

  return match[0];
};

const replaceTag = (html, tag, replacement) => (
  html.replace(new RegExp(`<${tag}\\b[\\s\\S]*?</${tag}>`, "i"), replacement)
);

const collectHtmlFiles = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".git") {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(fullPath);
    }
  }

  return files;
};

const asideItems = [
  {
    title: "ACCOUNT MANAGEMENT",
    items: [
      ["add-time", "Add Time", "./add-time/index.html", "./img/aside-img/addTime-icon.svg"],
      ["devices", "Devices", "./devices/index.html", "./img/aside-img/devices-icon.svg"],
      ["request-a-receipt", "Request A Receipt", "./request-a-receipt/index.html", "./img/aside-img/requestAReceipt-icon.svg"]
    ]
  },
  {
    title: "DOWNLOADS",
    items: [
      ["downloads", "Downloads", "./downloads/index.html", "./img/aside-img/downloads-icon.svg"],
      ["wire-guard-configuration", "WireGuard Configuration", "./wire-guard-configuration/index.html", "./img/aside-img/wireGuardConfiguration-icon.svg"]
    ]
  },
  {
    title: "GUIDES",
    items: [
      ["change-your-online-habits", "Change Your Online Habits", "./change-your-online-habits/index.html", "./img/aside-img/changeYourOnlineHabits-icon.svg"],
      ["recover-lost-account-credit-card", "Recover Lost Account", "./recover-lost-account-credit-card/index.html", "./img/aside-img/recoverLostAccount.svg"]
    ]
  }
];

const activeKeyFor = (relativeFile) => {
  if (relativeFile.startsWith("add-time/")) return "add-time";
  if (relativeFile === "devices/index.html") return "devices";
  if (relativeFile === "request-a-receipt/index.html") return "request-a-receipt";
  if (relativeFile === "downloads/index.html") return "downloads";
  if (relativeFile === "wire-guard-configuration/index.html") return "wire-guard-configuration";
  return null;
};

const renderAside = (activeKey) => {
  const sectionHtml = asideItems.map((section, sectionIndex) => {
    const headingClass = sectionIndex === 0
      ? "mb-6 px-3 text-[10px] font-semibold uppercase leading-normal text-auth-secondary"
      : "mb-6 mt-17.5 px-3 text-[10px] font-semibold uppercase leading-normal text-auth-secondary";

    const links = section.items.map(([key, label, href, icon], itemIndex) => {
      const isActive = key === activeKey;
      const margin = sectionIndex === 0 && itemIndex === 0 ? "" : "mt-1 ";
      const className = isActive
        ? `${margin}flex h-10 items-center gap-3 rounded-lg bg-auth-aside-active px-3 text-sm font-medium leading-normal text-white`
        : `${margin}flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium leading-normal text-white transition-colors hover:bg-auth-input active:bg-auth-brand-pressed`;
      const current = isActive ? ' aria-current="page"' : "";

      return `              <a class="${className}"
                href="${href}"${current}>
                <img src="${icon}" width="16" height="16" alt="" aria-hidden="true" />
                ${label}
              </a>`;
    }).join("\n");

    return `              <p class="${headingClass}">${section.title}</p>
${links}`;
  }).join("\n");

  return `          <aside class="hidden bg-auth-bg-secondary px-5 py-8 lg:block" aria-label="Account navigation">
            <div class="rounded-xl bg-auth-input p-4">
              <p class="text-[10px] font-semibold uppercase leading-normal text-auth-secondary">PAID UNTIL</p>
              <p class="mt-1 text-[13px] font-semibold leading-normal text-white">25/06/2026 20:34</p>
            </div>

            <nav class="mt-8 flex flex-col" aria-label="Account menu">
${sectionHtml}
            </nav>
          </aside>`;
};

const authLayout = read(authLayoutSource);
const authHeader = extractTag(authLayout, "header");
const authFooter = extractTag(authLayout, "footer");

let changed = 0;

for (const file of collectHtmlFiles(rootDir)) {
  const relativeFile = normalize(file);

  if (relativeFile === "index.html" || relativeFile === "register.html") {
    continue;
  }

  let html = read(file);
  let next = replaceTag(replaceTag(html, "header", authHeader), "footer", authFooter);
  const activeKey = activeKeyFor(relativeFile);

  if (activeKey && /<aside\b/i.test(next)) {
    next = replaceTag(next, "aside", renderAside(activeKey));
  }

  if (next !== html) {
    write(file, next);
    changed += 1;
  }
}

console.log(`Shared layout synced in ${changed} file(s).`);
