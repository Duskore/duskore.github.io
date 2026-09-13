import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  unlinkSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createHash } from "node:crypto";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const ORIGIN = "https://duskore.github.io";
export const ADS_SHA256 =
  "99fd3cb80ed5081cfcd3a8f494671249b4b6c4e2f7ef4ae12b5b2fdf45c25564";
const LOCALES = ["en", "ko"];
const text = {
  en: {
    games: "Games",
    about: "About",
    support: "Support",
    privacy: "Privacy",
    skip: "Skip to content",
    language: "한국어",
    languageLabel: "Read this page in Korean",
    eyebrow: "INDEPENDENT MOBILE GAMES",
    hero: "Small games.<br>Good moments.",
    intro:
      "A little challenge. A satisfying next move. Games made for the moments in between.",
    explore: "Explore our games",
    featured: "IN THE SPOTLIGHT",
    collection: "THE COLLECTION",
    collectionTitle: "Find your next little challenge.",
    collectionIntro: "Play what’s here. Take a look at what’s next.",
    available: "Available on iOS",
    development: "In development",
    viewGame: "Explore game",
    appStore: "View on App Store",
    aboutTitle: "Made for the joy of playing.",
    aboutBody:
      "Duskore is an independent mobile game studio exploring simple ideas: a well-timed jump, a perfect placement, a clever merge. Small games with a little room to surprise you.",
    supportPrompt: "Need a hand?",
    supportIntro:
      "Find help and privacy information for your game, all in one place.",
    supportAction: "Visit the support hub",
    footer: "Small games. Good moments.",
    allGames: "All games",
    details: "A closer look",
    howItFeels: "THE IDEA",
    pending:
      "This game is in development. Details may change; a release date has not been announced.",
    pendingLinks:
      "Download, support, and privacy links will be added before release.",
    regional: "App Store availability varies by region.",
    gameSupport: "Game support",
    gamePrivacy: "Privacy policy",
    moreGames: "More from Duskore",
    directorySupport: "A little help, for every game.",
    directoryPrivacy: "Privacy, game by game.",
    supportDescription:
      "Choose a released game for troubleshooting, account questions, and contact information.",
    privacyDescription:
      "Each game has its own privacy policy. Read the policy for the game you use; one game’s policy does not apply to the whole collection.",
    directoryPending:
      "Links are not published yet. This game is still in development.",
    legacyNote:
      "Existing Hexa Merge support and privacy addresses remain unchanged.",
    notFound: "This page wandered off.",
    notFoundBody: "The game you’re looking for may be back at home.",
    home: "Back to home",
    pageDescription:
      "Discover Duskore’s independent mobile games, from Hexa Merge to new games in development. Find official game, support, and privacy links.",
  },
  ko: {
    games: "게임",
    about: "소개",
    support: "지원",
    privacy: "개인정보",
    skip: "본문으로 이동",
    language: "English",
    languageLabel: "Read this page in English",
    eyebrow: "INDEPENDENT MOBILE GAMES",
    hero: "작은 게임,<br>기분 좋은 순간.",
    intro:
      "가벼운 도전, 딱 맞아떨어지는 한 수.<br>일상의 짧은 틈을 채우는 게임을 만듭니다.",
    explore: "게임 둘러보기",
    featured: "지금 만나보세요",
    collection: "OUR GAMES",
    collectionTitle: "다음 작은 도전을 찾아보세요.",
    collectionIntro: "지금 즐길 수 있는 게임과 앞으로 만나게 될 게임들.",
    available: "iOS 출시",
    development: "출시 준비 중",
    viewGame: "게임 알아보기",
    appStore: "App Store에서 보기",
    aboutTitle: "플레이하는 즐거움을 위해.",
    aboutBody:
      "Duskore는 작은 아이디어에서 시작하는 독립 모바일 게임 스튜디오입니다. 타이밍이 맞는 점프, 정확한 배치, 영리한 합치기. 간단한 조작 속에서 발견하는 재미를 담습니다.",
    supportPrompt: "도움이 필요하신가요?",
    supportIntro: "게임별 이용 안내와 개인정보처리방침을 한곳에서 찾으세요.",
    supportAction: "게임 지원 안내",
    footer: "작은 게임, 기분 좋은 순간.",
    allGames: "모든 게임",
    details: "게임 소개",
    howItFeels: "이런 게임이에요",
    pending:
      "현재 개발 중인 게임입니다. 내용은 변경될 수 있으며 출시일은 아직 정해지지 않았습니다.",
    pendingLinks:
      "다운로드, 지원 및 개인정보처리방침 링크는 출시 전에 안내합니다.",
    regional: "App Store에서의 이용 가능 여부는 지역에 따라 다릅니다.",
    gameSupport: "게임 지원",
    gamePrivacy: "개인정보처리방침",
    moreGames: "Duskore의 다른 게임",
    directorySupport: "게임마다, 필요한 도움을.",
    directoryPrivacy: "게임별 개인정보 안내.",
    supportDescription:
      "출시된 게임을 선택해 문제 해결, 계정 관련 안내와 문의 방법을 확인하세요.",
    privacyDescription:
      "각 게임은 별도의 개인정보처리방침을 제공합니다. 이용 중인 게임의 방침을 확인해 주세요. 한 게임의 방침이 모든 게임에 적용되는 것은 아닙니다.",
    directoryPending:
      "아직 개발 중인 게임으로, 관련 링크는 출시 전에 공개합니다.",
    legacyNote:
      "기존 Hexa Merge 지원 및 개인정보처리방침 주소는 그대로 유지됩니다.",
    notFound: "페이지가 잠시 길을 잃었네요.",
    notFoundBody: "홈에서 찾으시는 게임을 다시 만나보세요.",
    home: "홈으로 돌아가기",
    pageDescription:
      "Duskore의 독립 모바일 게임을 만나보세요. 출시된 Hexa Merge와 개발 중인 게임 소개, 공식 지원 및 개인정보처리방침을 안내합니다.",
  },
};

export const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const e = escapeHtml;
export const route = (locale, suffix = "") =>
  `${locale === "ko" ? "/ko/" : "/"}${suffix}`;
const gameRoute = (locale, game) => route(locale, `games/${game.slug}/`);
const absolute = (url) => new URL(url, ORIGIN).href;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function validUrl(value) {
  if (typeof value !== "string") return false;
  if (/^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\/)+$/.test(value)) return true;
  if (!/^https:\/\/[^\s<>"']+$/.test(value)) return false;
  try {
    const url = new URL(value);
    return Boolean(url.hostname && !url.username && !url.password);
  } catch {
    return false;
  }
}

export function validateCatalog(catalog, root = ROOT) {
  assert(
    Array.isArray(catalog.games) && catalog.games.length > 0,
    "Catalog must contain games",
  );
  const slugs = new Set();
  for (const game of catalog.games) {
    assert(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(game.slug),
      `Unsafe slug: ${game.slug}`,
    );
    assert(!slugs.has(game.slug), `Duplicate slug: ${game.slug}`);
    slugs.add(game.slug);
    assert(
      ["available", "development"].includes(game.status),
      `Invalid status: ${game.slug}`,
    );
    assert(
      ["violet", "blue", "orange", "pink"].includes(game.accent),
      `Invalid accent: ${game.slug}`,
    );
    assert(
      /^\/assets\/games\/[a-z0-9-]+\.(png|jpg|webp)$/.test(game.image),
      `Unsafe image: ${game.slug}`,
    );
    assert(
      existsSync(resolve(root, `.${game.image}`)),
      `Missing image: ${game.image}`,
    );
    for (const locale of LOCALES) {
      for (const field of ["name", "genre", "tagline", "description", "body"]) {
        assert(
          typeof game[locale]?.[field] === "string" &&
            game[locale][field].trim(),
          `Missing ${locale}.${field}: ${game.slug}`,
        );
      }
      assert(
        Array.isArray(game[locale]?.features) &&
          game[locale].features.length === 3 &&
          game[locale].features.every((f) => typeof f === "string" && f.trim()),
        `Need three ${locale} features: ${game.slug}`,
      );
    }
    if (game.status === "available") {
      assert(
        /^https:\/\/apps\.apple\.com\/app\/id\d+$/.test(game.appStoreUrl),
        `Published game needs an App Store URL: ${game.slug}`,
      );
      assert(
        validUrl(game.supportUrl) && validUrl(game.privacyUrl),
        `Published game needs support and privacy URLs: ${game.slug}`,
      );
    } else {
      assert(
        !game.appStoreUrl && !game.supportUrl && !game.privacyUrl,
        `Unreleased game must not advertise release links: ${game.slug}`,
      );
    }
  }
  assert(
    catalog.games.some(
      (g) => g.slug === catalog.featuredSlug && g.status === "available",
    ),
    "Featured game must be available",
  );
  const ads = readFileSync(resolve(root, "app-ads.txt"));
  assert(
    createHash("sha256").update(ads).digest("hex") === ADS_SHA256,
    "Protected app-ads.txt changed: verify publisher declaration before updating the baseline",
  );
}

function layout(
  locale,
  suffix,
  title,
  description,
  content,
  image,
  noindex = false,
) {
  const t = text[locale];
  const other = locale === "en" ? "ko" : "en";
  const canonical = absolute(route(locale, suffix));
  return `<!doctype html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f5f3ef">
  <meta name="description" content="${e(description)}">
  ${
    noindex
      ? '<meta name="robots" content="noindex">'
      : `<link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="en" href="${absolute(route("en", suffix))}">
  <link rel="alternate" hreflang="ko" href="${absolute(route("ko", suffix))}">
  <link rel="alternate" hreflang="x-default" href="${absolute(route("en", suffix))}">`
  }
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Duskore">
  <meta property="og:title" content="${e(title)}">
  <meta property="og:description" content="${e(description)}">
  <meta property="og:url" content="${canonical}">
  ${image ? `<meta property="og:image" content="${absolute(image)}">` : ""}
  <meta name="twitter:card" content="summary">
  <title>${e(title)}</title>
  <link rel="stylesheet" href="/assets/site.css">
</head>
<body>
  <a class="skip-link" href="#main">${t.skip}</a>
  <header class="site-header wrap">
    <a class="wordmark" href="${route(locale)}" aria-label="Duskore ${locale === "ko" ? "홈" : "home"}">duskore<span aria-hidden="true">.</span></a>
    <nav aria-label="${locale === "ko" ? "주 메뉴" : "Main navigation"}">
      <a href="${route(locale)}#games">${t.games}</a><a href="${route(locale)}#about">${t.about}</a><a href="${route(locale, "support/")}">${t.support}</a>
    </nav>
    <a class="language-link" href="${noindex ? route(other) : route(other, suffix)}" lang="${other}" aria-label="${t.languageLabel}">${t.language}</a>
  </header>
  <main id="main" class="wrap" tabindex="-1">${content}</main>
  <footer class="site-footer wrap">
    <div><a class="wordmark" href="${route(locale)}">duskore<span aria-hidden="true">.</span></a><p>${t.footer}</p></div>
    <nav aria-label="${locale === "ko" ? "하단 메뉴" : "Footer navigation"}"><a href="${route(locale, "support/")}">${t.support}</a><a href="${route(locale, "privacy/")}">${t.privacy}</a></nav>
    <small>© Duskore</small>
  </footer>
</body>
</html>
`.replace(/[ \t]+$/gm, "");
}

function status(locale, game) {
  return `<span class="status ${game.status}"><span aria-hidden="true"></span>${text[locale][game.status]}</span>`;
}
function icon(game, { large = false, eager = false } = {}) {
  return `<img class="game-icon${large ? " large-icon" : ""}" src="${game.image}" alt="" width="${large ? 480 : 128}" height="${large ? 480 : 128}" loading="${eager ? "eager" : "lazy"}" decoding="async"${eager ? ' fetchpriority="high"' : ""}>`;
}
function card(locale, game) {
  const c = game[locale];
  return `<article class="game-card accent-${game.accent}">
    <a class="card-link" href="${gameRoute(locale, game)}">
      <div class="card-art">${icon(game)}<span class="card-arrow" aria-hidden="true">↗</span></div>
      <div class="card-copy">${status(locale, game)}<h3>${e(c.name)}</h3><p class="genre">${e(c.genre)}</p><p>${e(c.description)}</p><span class="text-link">${text[locale].viewGame}<span aria-hidden="true"> ↗</span></span></div>
    </a>
  </article>`;
}
function home(locale, catalog) {
  const t = text[locale];
  const featured = catalog.games.find((g) => g.slug === catalog.featuredSlug);
  return layout(
    locale,
    "",
    "Duskore — " + t.footer,
    t.pageDescription,
    `
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-copy"><p class="eyebrow">${t.eyebrow}</p><h1 id="hero-title">${t.hero}</h1><p class="hero-description">${t.intro}</p><a class="button" href="#games">${t.explore}<span aria-hidden="true"> ↘</span></a></div>
      <a class="spotlight accent-${featured.accent}" href="${gameRoute(locale, featured)}" aria-label="${e(featured[locale].name)} — ${t.viewGame}">
        <span class="eyebrow">${t.featured}</span><div class="spotlight-art">${icon(featured, { large: true, eager: true })}</div>
        <div class="spotlight-bottom"><div><h2>${e(featured[locale].name)}</h2>${status(locale, featured)}</div><span class="round-arrow" aria-hidden="true">↗</span></div>
      </a>
    </section>
    <section id="games" class="collection" aria-labelledby="collection-title"><div class="section-heading"><div><p class="eyebrow">${t.collection}</p><h2 id="collection-title">${t.collectionTitle}</h2></div><p>${t.collectionIntro}</p></div><div class="game-grid">${catalog.games.map((g) => card(locale, g)).join("\n")}</div></section>
    <section id="about" class="about-panel" aria-labelledby="about-title"><p class="eyebrow">HELLO, WE’RE DUSKORE</p><h2 id="about-title">${t.aboutTitle}</h2><p>${t.aboutBody}</p><span class="about-mark" aria-hidden="true">d.</span></section>
    <section class="support-strip" aria-labelledby="support-title"><div><h2 id="support-title">${t.supportPrompt}</h2><p>${t.supportIntro}</p></div><a class="button button-outline" href="${route(locale, "support/")}">${t.supportAction}<span aria-hidden="true"> ↗</span></a></section>
  `,
    featured.image,
  );
}
function detail(locale, game, catalog) {
  const t = text[locale];
  const c = game[locale];
  return layout(
    locale,
    `games/${game.slug}/`,
    `${c.name} — Duskore`,
    c.description,
    `
    <a class="back-link" href="${route(locale)}#games"><span aria-hidden="true">← </span>${t.allGames}</a>
    <section class="detail-hero" aria-labelledby="game-title">
      <div class="detail-copy">${status(locale, game)}<p class="eyebrow">${e(c.genre)}</p><h1 id="game-title">${e(c.name)}</h1><p class="tagline">${e(c.tagline)}</p><p class="hero-description">${e(c.description)}</p>
        ${game.status === "available" ? `<a class="button" href="${e(game.appStoreUrl)}">${t.appStore}<span aria-hidden="true"> ↗</span></a><p class="fine-print">${t.regional}</p>` : `<div class="development-note"><p>${t.pending}</p><p>${t.pendingLinks}</p></div>`}
      </div><div class="detail-art accent-${game.accent}">${icon(game, { large: true, eager: true })}</div>
    </section>
    <section class="game-story" aria-labelledby="details-title"><div><p class="eyebrow">${t.howItFeels}</p><h2 id="details-title">${t.details}</h2><p>${e(c.body)}</p></div><ul class="features">${c.features.map((f, i) => `<li><span aria-hidden="true">0${i + 1}</span>${e(f)}</li>`).join("")}</ul></section>
    ${game.status === "available" ? `<section class="support-strip"><div><h2>${t.supportPrompt}</h2><p>${t.supportIntro}</p></div><div class="inline-links"><a href="${e(game.supportUrl)}">${t.gameSupport}<span aria-hidden="true"> ↗</span></a><a href="${e(game.privacyUrl)}">${t.gamePrivacy}<span aria-hidden="true"> ↗</span></a></div></section>` : ""}
    <section class="related" aria-labelledby="more-title"><h2 id="more-title">${t.moreGames}</h2><div class="game-grid related-grid">${catalog.games
      .filter((g) => g.slug !== game.slug)
      .map((g) => card(locale, g))
      .join("\n")}</div></section>
  `,
    game.image,
  );
}
function directory(locale, type, catalog) {
  const t = text[locale];
  const title = type === "support" ? t.directorySupport : t.directoryPrivacy;
  const description =
    type === "support" ? t.supportDescription : t.privacyDescription;
  const property = `${type}Url`;
  return layout(
    locale,
    `${type}/`,
    `${t[type]} — Duskore`,
    description,
    `
    <section class="directory-intro"><p class="eyebrow">DUSKORE / ${type.toUpperCase()}</p><h1>${title}</h1><p class="hero-description">${description}</p></section>
    <div class="directory-list">${catalog.games.map((game) => `<article class="directory-item">${icon(game)}<div><h2><a href="${gameRoute(locale, game)}">${e(game[locale].name)}</a></h2>${status(locale, game)}${game[property] ? "" : `<p>${t.directoryPending}</p>`}</div>${game[property] ? `<a class="button button-outline" href="${e(game[property])}">${type === "support" ? t.gameSupport : t.gamePrivacy}<span aria-hidden="true"> ↗</span></a>` : ""}</article>`).join("\n")}</div>
    <p class="fine-print directory-note">${t.legacyNote}</p>
  `,
  );
}

export function renderSite(catalog) {
  const pages = new Map();
  for (const locale of LOCALES) {
    const prefix = locale === "ko" ? "ko/" : "";
    pages.set(`${prefix}index.html`, home(locale, catalog));
    for (const game of catalog.games)
      pages.set(
        `${prefix}games/${game.slug}/index.html`,
        detail(locale, game, catalog),
      );
    for (const type of ["support", "privacy"])
      pages.set(
        `${prefix}${type}/index.html`,
        directory(locale, type, catalog),
      );
  }
  const urls = [...pages.keys()].map((p) =>
    absolute("/" + p.replace(/index\.html$/, "")),
  );
  pages.set(
    "sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${url}</loc></url>`).join("\n")}\n</urlset>\n`,
  );
  pages.set(
    "robots.txt",
    `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`,
  );
  const t = text.en;
  pages.set(
    "404.html",
    layout(
      "en",
      "",
      "Page not found — Duskore",
      t.notFoundBody,
      `<section class="not-found"><p class="eyebrow">404 / DUSKORE</p><h1>${t.notFound}</h1><p>${t.notFoundBody}</p><a class="button" href="/">${t.home}<span aria-hidden="true"> ↗</span></a></section>`,
      undefined,
      true,
    ),
  );
  return pages;
}

export function isOwnedOutput(file) {
  return /^(?:(?:ko\/)?(?:(?:games\/[a-z0-9]+(?:-[a-z0-9]+)*|support|privacy)\/)?index\.html|404\.html|sitemap\.xml|robots\.txt)$/.test(
    file,
  );
}

export function build({ check = false } = {}) {
  const catalog = JSON.parse(
    readFileSync(resolve(ROOT, "data/games.json"), "utf8"),
  );
  validateCatalog(catalog);
  const pages = renderSite(catalog);
  const manifestPath = resolve(ROOT, ".generated-pages.json");
  const previous = existsSync(manifestPath)
    ? JSON.parse(readFileSync(manifestPath, "utf8"))
    : [];
  assert(
    Array.isArray(previous) && previous.every(isOwnedOutput),
    "Unsafe generated-page manifest",
  );
  const manifest = JSON.stringify([...pages.keys()].sort(), null, 2) + "\n";
  const stale = previous.filter((file) => !pages.has(file));
  const different = [...pages]
    .filter(
      ([file, content]) =>
        !existsSync(resolve(ROOT, file)) ||
        readFileSync(resolve(ROOT, file), "utf8") !== content,
    )
    .map(([file]) => file);
  const manifestChanged =
    !existsSync(manifestPath) ||
    readFileSync(manifestPath, "utf8") !== manifest;
  if (check) {
    assert(
      !different.length && !stale.length && !manifestChanged,
      `Generated site is stale. Run npm run build. Changed: ${[...different, ...stale, ...(manifestChanged ? [".generated-pages.json"] : [])].join(", ")}`,
    );
    console.log(
      `Verified ${pages.size} generated files; app-ads.txt unchanged.`,
    );
    return;
  }
  for (const [file, content] of pages) {
    assert(isOwnedOutput(file), `Refusing to write unowned path: ${file}`);
    mkdirSync(dirname(resolve(ROOT, file)), { recursive: true });
    writeFileSync(resolve(ROOT, file), content);
  }
  for (const file of stale)
    if (existsSync(resolve(ROOT, file))) unlinkSync(resolve(ROOT, file));
  writeFileSync(manifestPath, manifest);
  console.log(
    `Built ${pages.size} files; app-ads.txt and legacy support routes untouched.`,
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  try {
    build({ check: process.argv.includes("--check") });
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
