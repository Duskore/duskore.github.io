# Duskore website

Multi-game, English/Korean portfolio at **https://duskore.github.io/**.
The existing GitHub Pages host and the domain-root AdMob declaration are retained.
No framework, client JavaScript, analytics, external fonts, or runtime dependency is required.

## Published structure

| Route                                  | Purpose                                                               |
| -------------------------------------- | --------------------------------------------------------------------- |
| `/` · `/ko/`                           | Developer homepage and game collection                                |
| `/games/<slug>/` · `/ko/games/<slug>/` | Individual game introductions                                         |
| `/support/` · `/ko/support/`           | Directory of game-specific support links                              |
| `/privacy/` · `/ko/privacy/`           | Directory of game-specific privacy policies, not a shared game policy |
| `/app-ads.txt`                         | Shared publisher declaration at the developer-domain root             |
| `/hexa-merge-support/`                 | Existing Hexa Merge project site; maintained in a separate repository |

The first collection contains **Hexa Merge** (available on iOS), **Star Jumper**,
**Stack & Pop**, and **2048** (in development). App Store availability varies by
region. A development listing is not an announcement of a release date or a
claim that a game has passed App Review.

## Edit, build and check

Use Node.js 22 or later. No `npm install` is needed.

```sh
npm run build
npm test
npm run check
```

- `data/games.json`: single source of truth for game identity, bilingual copy,
  release status, artwork and links.
- `scripts/build.mjs`: shared templates, catalog validation and deterministic
  generation of static HTML, sitemap and robots file.
- `assets/site.css`: responsive shared design; respects reduced-motion settings.
- `assets/games/`: existing game icons, reused without regenerating the art.
- `test/site.test.mjs`: route/fragment checks, bilingual metadata, release-link
  gates, input safety, future-game fixture and protected seller declaration.
- `scripts/verify-live.mjs`: read-only HTTP status and deployed content/asset
  checksum verification, including the protected legacy pages.
- `.generated-pages.json`: owned output manifest. Do not edit it or generated
  HTML by hand; change the catalog/templates and rebuild.

Pages are checked in because this site uses GitHub Pages **legacy deployment
from `main`, repository root**. No new hosting service or build action is needed.
Preview locally with any static HTTP server serving this directory; for example:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

The three legacy `/hexa-merge-support/` links are intentionally served by the
separate project website, so they will not resolve on this local server.

## Add another game

1. Add an approved icon under `assets/games/<slug>.png` (or `.jpg`/`.webp`).
   Keep its source/provenance with the game. Review appearance at card size.
2. Copy one **development** entry in `data/games.json`, give it a unique stable
   lowercase hyphenated `slug`, and fill both `en` and `ko` copy. Supply exactly
   three feature descriptions. Supported color accents are `violet`, `blue`,
   `orange` and `pink`.
3. Leave `status: "development"` and all three release URLs `null` until release.
   No invented download URLs, dates, testimonials or unsupported gameplay claims.
4. Run the three commands above. The homepage, two detail pages, support/privacy
   directories and sitemap update automatically. Inspect English/Korean copy,
   narrow layouts and keyboard navigation before publishing.

To list a game as available, independently confirm its **public** App Store URL,
provide game-specific HTTPS support and privacy pages, then set `status` to
`available` and fill `appStoreUrl`, `supportUrl`, `privacyUrl`. App Store links use
`https://apps.apple.com/app/id<id>`; local support links use a stable trailing-slash
route. `featuredSlug` must identify an available game. Never reuse another game's
policy without checking that it actually describes the new game's services.

Slugs are permanent public links. If an already published route must move,
add an explicit compatibility page/redirect and validation before removing it;
the generator cleans obsolete files listed in its owned manifest.

## Protected URLs and AdMob

Do not rename, remove, redirect or overwrite these existing registered URLs:

- https://duskore.github.io/hexa-merge-support/
- https://duskore.github.io/hexa-merge-support/support/
- https://duskore.github.io/hexa-merge-support/privacy/
- https://duskore.github.io/app-ads.txt

The Hexa Merge support site is maintained at `Duskore/hexa-merge-support`, not
generated here. Introducing the portfolio does not change App Store Connect's
registered support, marketing or privacy URLs.

The root seller record remains exactly:

```text
google.com, pub-4052570878695866, DIRECT, f08c47fec0942fa0
```

Its SHA-256 is guarded in the build and tests. Games with this publisher can use
the same domain-root declaration; each still needs its own App Store listing,
AdMob app/unit IDs, store linkage and AdMob verification. A successful website
deployment or HTTP 200 **does not establish** AdMob crawl/review success or lift
an ad-serving limit. Do not retry or change console settings as part of a website
build. Never add secrets or personal, tax or banking details to this repository.

## Publish and verify

1. Run build, tests and the stale-output check; inspect the scoped diff.
2. Commit only website changes and push `main` to the existing remote.
3. Confirm GitHub Pages deploys that commit, then fetch the public English/Korean
   home, detail and directory pages. Check `/app-ads.txt` is HTTPS 200, text/plain,
   and matches the guarded hash. Recheck all three legacy support URLs.
4. Report website deployment separately from App Store and AdMob status.

Run `npm run verify:live` after deployment. For local HTTP checks, use
`npm run verify:live -- http://127.0.0.1:4173` (legacy project links are skipped
locally). These are source/HTTP checks, not browser interaction or physical-device
layout verification.

## Existing artwork provenance

The initial icons are unchanged copies of existing 512px VibeGameLab web icons
(about 1.5 MB combined, instead of serving the full-resolution source artwork):

| Website asset                    | Existing source                             |
| -------------------------------- | ------------------------------------------- |
| `assets/games/hexa-merge.png`    | `apps/hexa_merge/web/icons/Icon-512.png`    |
| `assets/games/star-jumper.png`   | `apps/star_jumper/web/icons/Icon-512.png`   |
| `assets/games/stack-and-pop.png` | `apps/stack_and_pop/web/icons/Icon-512.png` |
| `assets/games/2048.png`          | `apps/2048/web/icons/Icon-512.png`          |

No new artwork or game binary is produced by this website build. The original
game repositories remain the source for asset approval and production records.
