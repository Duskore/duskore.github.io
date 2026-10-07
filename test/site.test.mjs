import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import {
  ROOT,
  ORIGIN,
  ADS_SHA256,
  validateCatalog,
  renderSite,
  isOwnedOutput,
  escapeHtml,
} from "../scripts/build.mjs";

const catalog = JSON.parse(
  readFileSync(resolve(ROOT, "data/games.json"), "utf8"),
);
const pages = renderSite(catalog);
const htmlPages = [...pages].filter(([file]) => file.endsWith(".html"));
const clone = () => structuredClone(catalog);
test("restored leaderboards have current bilingual privacy and support", () => {
  for (const slug of ["stack-and-pop", "2048"]) {
    const game = catalog.games.find(game => game.slug === slug);
    for (const locale of ["en", "ko"]) {
      const policy = game.documents.privacy[locale];
      assert.ok(policy.some(section => section.heading.includes("Game Center")));
      const text = JSON.stringify(game.documents);
      assert.doesNotMatch(text, /No Game Center score sharing is enabled|Online leaderboard sharing and background music are not enabled|Game Center 점수 공유를 활성화하지 않았습니다/);
      assert.match(JSON.stringify(policy), /SCORE SHARING/);
    }
  }
});
const legacyRoutes = new Set([
  "/hexa-merge-support/",
  "/hexa-merge-support/support/",
  "/hexa-merge-support/privacy/",
]);

test("the actual catalog is valid and every page is current on disk", () => {
  validateCatalog(catalog);
  for (const [file, html] of pages)
    assert.equal(readFileSync(resolve(ROOT, file), "utf8"), html, file);
});

test("all local navigation, assets and fragments resolve without client JavaScript", () => {
  for (const [file, html] of htmlPages) {
    const base = new URL("/" + file.replace(/index\.html$/, ""), ORIGIN);
    for (const [, value] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const url = new URL(value, base);
      if (url.origin !== ORIGIN || legacyRoutes.has(url.pathname)) continue;
      const target =
        url.pathname.replace(/^\//, "") +
        (url.pathname.endsWith("/") ? "index.html" : "");
      assert.ok(
        pages.has(target) || existsSync(resolve(ROOT, target)),
        `${file}: broken link ${value}`,
      );
      if (url.hash)
        assert.ok(
          pages.get(target)?.includes(`id="${url.hash.slice(1)}"`),
          `${file}: missing fragment ${value}`,
        );
    }
    assert.ok(
      !html.includes("<script"),
      `${file}: unexpected script dependency`,
    );
  }
});

test("every page has a single h1, description, language, viewport and skip target", () => {
  for (const [file, html] of htmlPages) {
    assert.equal([...html.matchAll(/<h1(?:\s|>)/g)].length, 1, file);
    assert.match(html, /<meta name="description" content="[^"]+">/, file);
    assert.match(
      html,
      /<meta name="viewport" content="width=device-width, initial-scale=1">/,
      file,
    );
    assert.ok(
      html.includes(`<html lang="${file.startsWith("ko/") ? "ko" : "en"}">`),
      file,
    );
    assert.match(html, /<main id="main"[^>]*tabindex="-1">/, file);
    assert.match(html, /<a class="skip-link" href="#main">/, file);
    assert.ok(!/undefined|\[object Object\]/.test(html), file);
  }
});

test("all index pages have reciprocal language alternates and a canonical", () => {
  for (const [file, html] of htmlPages.filter(
    ([file]) => file !== "404.html",
  )) {
    const suffix = file.replace(/^ko\//, "").replace(/index\.html$/, "");
    const english = ORIGIN + "/" + suffix;
    const korean = ORIGIN + "/ko/" + suffix;
    assert.ok(
      html.includes(`<link rel="alternate" hreflang="en" href="${english}">`),
      file,
    );
    assert.ok(
      html.includes(`<link rel="alternate" hreflang="ko" href="${korean}">`),
      file,
    );
    assert.ok(
      html.includes(
        `<link rel="canonical" href="${file.startsWith("ko/") ? korean : english}">`,
      ),
      file,
    );
    assert.match(html, /class="language-link"[^>]+lang="(?:en|ko)"/, file);
  }
});

test("only released games provide downloads; prerelease documents stay game-specific", () => {
  for (const game of catalog.games) {
    for (const prefix of ["", "ko/"]) {
      const html = pages.get(`${prefix}games/${game.slug}/index.html`);
      if (game.status === "available") {
        assert.ok(html.includes(`href="${game.appStoreUrl}"`));
        assert.ok(html.includes(`href="${game.supportUrl}"`));
        assert.ok(html.includes(`href="${game.privacyUrl}"`));
      } else {
        assert.ok(!html.includes('href="https://apps.apple.com/'));
        assert.ok(!html.includes('href="/hexa-merge-support/'));
        assert.match(html, /class="development-note"/);
        if (game.documents) {
          assert.ok(html.includes(`href="/${prefix}games/${game.slug}/support/"`));
          assert.ok(html.includes(`href="/${prefix}games/${game.slug}/privacy/"`));
        }
      }
    }
  }
});

test("sitemap contains all localized routes and the error page is noindex", () => {
  const sitemap = pages.get("sitemap.xml");
  for (const [file] of htmlPages.filter(([f]) => f !== "404.html"))
    assert.ok(
      sitemap.includes(
        `<loc>${ORIGIN}/${file.replace(/index\.html$/, "")}</loc>`,
      ),
      file,
    );
  assert.ok(!sitemap.includes("404.html"));
  assert.match(pages.get("404.html"), /<meta name="robots" content="noindex">/);
  assert.equal(
    pages.get("robots.txt"),
    `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`,
  );
});

test("publisher declaration and legacy support route ownership stay protected", () => {
  const raw = readFileSync(resolve(ROOT, "app-ads.txt"));
  assert.equal(createHash("sha256").update(raw).digest("hex"), ADS_SHA256);
  assert.equal(
    raw.toString().trim(),
    "google.com, pub-4052570878695866, DIRECT, f08c47fec0942fa0",
  );
  for (const file of pages.keys()) assert.ok(isOwnedOutput(file), file);
  for (const file of [
    "app-ads.txt",
    "hexa-merge-support/index.html",
    "hexa-merge-support/privacy/index.html",
    "../index.html",
    "/index.html",
    "assets/site.css",
    "games/../../index.html",
    "games/a//index.html",
  ])
    assert.equal(isOwnedOutput(file), false, file);
});

test("adding another game produces both detail routes and every directory entry", () => {
  const next = clone();
  const extra = structuredClone(
    next.games.find((game) => game.status === "development"),
  );
  delete extra.documents;
  extra.supportUrl = null;
  extra.privacyUrl = null;
  extra.slug = "next-game";
  extra.en.name = "Next Game";
  extra.ko.name = "다음 게임";
  next.games.push(extra);
  validateCatalog(next);
  const result = renderSite(next);
  assert.equal(result.size, pages.size + 2);
  for (const prefix of ["", "ko/"]) {
    assert.ok(result.has(`${prefix}games/next-game/index.html`));
    for (const file of [
      "index.html",
      "support/index.html",
      "privacy/index.html",
    ])
      assert.ok(
        result.get(prefix + file).includes(`href="/${prefix}games/next-game/"`),
      );
  }
});

test("invalid slugs, duplicates, incomplete translations and unsafe assets are rejected", () => {
  for (const value of [
    "../privacy",
    "/app-ads.txt",
    "hexa/../../index",
    "UPPERCASE",
    "a?b",
    "a--b",
  ]) {
    const next = clone();
    next.games[1].slug = value;
    assert.throws(() => validateCatalog(next), /Unsafe slug/);
  }
  const duplicate = clone();
  duplicate.games.push(duplicate.games[0]);
  assert.throws(() => validateCatalog(duplicate), /Duplicate slug/);
  const missing = clone();
  delete missing.games[0].ko.description;
  assert.throws(() => validateCatalog(missing), /Missing ko.description/);
  const image = clone();
  image.games[0].image = "/assets/games/../../app-ads.txt";
  assert.throws(() => validateCatalog(image), /Unsafe image/);
});

test("release transitions require real store, support and privacy links", () => {
  const next = clone();
  const candidate = next.games.find((game) => game.status === "development");
  delete candidate.documents;
  candidate.supportUrl = null;
  candidate.privacyUrl = null;
  candidate.status = "available";
  assert.throws(() => validateCatalog(next), /App Store URL/);
  candidate.appStoreUrl = "https://apps.apple.com/app/id123456789";
  assert.throws(() => validateCatalog(next), /support and privacy/);
  candidate.supportUrl = "//external/";
  candidate.privacyUrl = "javascript:alert(1)";
  assert.throws(() => validateCatalog(next), /support and privacy/);
  const premature = clone();
  premature.games.find((game) => game.status === "development").appStoreUrl =
    catalog.games.find((game) => game.status === "available").appStoreUrl;
  assert.throws(() => validateCatalog(premature), /Unreleased game/);
  const feature = clone();
  feature.featuredSlug = feature.games.find(
    (game) => game.status === "development",
  ).slug;
  assert.throws(
    () => validateCatalog(feature),
    /Featured game must be available/,
  );
});

test("catalog copy is rendered as text, never executable markup", () => {
  assert.equal(
    escapeHtml("<script>\"hello\" & 'bye'</script>"),
    "&lt;script&gt;&quot;hello&quot; &amp; &#39;bye&#39;&lt;/script&gt;",
  );
  const next = clone();
  next.games[0].en.name = "<img src=x onerror=alert(1)>";
  const html = renderSite(next).get("games/hexa-merge/index.html");
  assert.ok(!html.includes("<img src=x"));
  assert.ok(html.includes("&lt;img src=x onerror=alert(1)&gt;"));
  const sudoku = next.games.find((game) => game.slug === "sudoku");
  sudoku.documents.privacy.en[0].body = "<script>alert(1)</script>";
  const policy = renderSite(next).get("games/sudoku/privacy/index.html");
  assert.ok(!policy.includes("<script>"));
  assert.ok(policy.includes("&lt;script&gt;alert(1)&lt;/script&gt;"));
});

test("prerelease documents require both languages and cannot claim another game's routes", () => {
  const missing = clone();
  delete missing.games.find((game) => game.slug === "sudoku").documents.privacy.ko;
  assert.throws(() => validateCatalog(missing));
  const wrong = clone();
  wrong.games.find((game) => game.slug === "sudoku").privacyUrl = "/hexa-merge-support/privacy/";
  assert.throws(() => validateCatalog(wrong));
});

test("Star Jumper publishes bilingual prerelease support and privacy without release claims", () => {
  const star = catalog.games.find((game) => game.slug === "star-jumper");
  assert.equal(star.en.name, "Duskore Star Jumper");
  assert.equal(star.ko.name, "Duskore Star Jumper");
  assert.equal(star.status, "development");
  assert.equal(star.appStoreUrl, null);
  assert.equal(star.supportUrl, "/games/star-jumper/support/");
  assert.equal(star.privacyUrl, "/games/star-jumper/privacy/");

  const expected = [
    [
      "games/star-jumper/support/index.html",
      [
        "a public download and release date have not been announced",
        "Opt-in applies only to future completed runs",
        "There are no banner or rewarded ads",
        "No approved background music is included",
      ],
    ],
    [
      "ko/games/star-jumper/support/index.html",
      [
        "공개 다운로드와 출시일은 아직 안내하지 않습니다",
        "이전 점수는 소급 전송하지 않습니다",
        "배너·보상 광고는 사용하지 않습니다",
        "승인된 배경 음악이 포함되지 않으므로",
      ],
    ],
    [
      "games/star-jumper/privacy/index.html",
      [
        "com.duskore.starjumper",
        "disables Firebase Analytics collection and Firebase Crashlytics collection",
        "does not backfill an earlier best height",
        "No banner or rewarded ads are used",
      ],
    ],
    [
      "ko/games/star-jumper/privacy/index.html",
      [
        "com.duskore.starjumper",
        "Firebase Analytics 수집과 Firebase Crashlytics 수집을 비활성화",
        "이전 최고 높이는 소급 전송하지 않습니다",
        "배너·보상 광고는 사용하지 않습니다",
      ],
    ],
  ];
  for (const [file, phrases] of expected) {
    const html = pages.get(file);
    assert.ok(html, file);
    assert.ok(!html.includes('href="https://apps.apple.com/'), file);
    for (const phrase of phrases)
      assert.ok(html.includes(phrase), `${file}: ${phrase}`);
  }
});
