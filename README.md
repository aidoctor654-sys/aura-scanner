# 🔮 Aura Scanner

> Reveal the color of your energy. A mystical aura scanner for entertainment.

PWA (Progressive Web App) — działa w przeglądarce, instaluje się jak natywna apka, pakuje się do Google Play Store przez Bubblewrap jako TWA (Trusted Web Activity).

## ✨ Features

- 🌑 Mistyczny ciemny klimat (kosmiczna czerń, gwiazdy, mgławice)
- 📷 Live kamera z celownikiem, pierścieniami i efektem skanowania (3s)
- 🎲 7 unikalnych aur (Gold, Violet, Blue, Green, Red, White, Orange) — każda z osobnym opisem osobowości
- 💫 Animowana świecąca kula w kolorze aury + pierścień i pulsowanie
- 📤 Share jako obrazek (Web Share API → PNG 1080x1080) z fallbackiem do pobrania
- 📱 PWA: instalowalna, offline-ready, działa na pełnym ekranie
- ♿ Dostępna, dotykowa, z `prefers-reduced-motion`

## 📁 Struktura

```
aura-scanner/
├── index.html              # Trzy ekrany: intro, scan, result
├── manifest.webmanifest    # PWA metadata (z 'id' dla TWA)
├── sw.js                   # Service worker (network-first HTML, versioned cache)
├── css/
│   └── styles.css          # ~720 linii mistycznego designu
├── js/
│   ├── aura-data.js        # 7 aur z opisami + pickRandomAura()
│   └── app.js              # Logika: kamera, skaning, share
├── icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-maskable-512.png
│   └── icon.svg
├── scripts/
│   └── gen-icons.py        # Regeneruje ikony (Pillow)
├── share-preview.html      # QA helper do podglądu share card
├── .github/workflows/
│   └── build-aab.yml       # GitHub Actions → PWABuilder Cloud API → AAB
├── .well-known/
│   ├── assetlinks.json     # TWA Digital Asset Links (placeholder)
│   └── README.md           # instrukcja po deployu
├── previews/               # screenshoty QA (intro + wyniki)
└── README.md
```

## 🚀 Quick start (test lokalny)

```bash
# 1. Serwer (port 8766 to tylko przykład — 8765 zajmuje body gateway)
cd aura-scanner
python3 -m http.server 8766 --bind 127.0.0.1

# 2. Otwórz w chromie na telefonie
#    http://<IP-S21>:8766/
#    (komórka musi być w tej samej sieci WiFi)

# 3. Demo mode — pomiń kamerę
#    ?demo=intro
#    ?demo=scan
#    ?demo=result&aura=violet   # lub: gold|blue|green|red|white|orange
```

## 📦 Deploy do Google Play Store (jako TWA / AAB)

### Krok 0 — narzędzia open source

| Narzędzie | Wymaga JDK? | Co robi | Strona |
|---|---|---|---|
| **PWABuilder.com** | ❌ nie | **Web UI: wklejasz URL PWA → dostajesz AAB gotowe do Play Store** | https://www.pwabuilder.com/ |
| **Bubblewrap CLI** | ✅ tak | Wrapper Google (to samo co PWABuilder pod spodem), w terminalu | https://github.com/GoogleChromeLabs/bubblewrap |
| **Lighthouse** | ❌ nie | Audyt PWA (score, dostępność, SEO) | https://developer.chrome.com/docs/lighthouse/overview |
| **PWABuilder Studio** | ❌ nie | Rozszerzenie VS Code do budowy i pakowania | https://marketplace.visualstudio.com/items?itemName=PWABuilder.pwa-studio |
| **Workbox** | ❌ nie | Service worker library (Google) | https://developer.chrome.com/docs/workbox/ |
| **fastlane** | ⚠️ runtime | CI/CD do Play Store | https://fastlane.tools/ |
| **GitHub Actions** | ❌ nie | Darmowy CI/CD dla open source | https://github.com/features/actions |

### Najszybsza ścieżka (zero setupu, zero JDK)

1. Wrzucasz to repo na **GitHub Pages** / Cloudflare Pages / Netlify
2. Wchodzisz na **https://www.pwabuilder.com/**
3. Wklejasz URL → klikasz "Package for Stores" → "Google Play"
4. Pobierasz AAB → wgrywasz do Play Console

Jedyna opłata: **25 USD** jednorazowo za konto deweloperskie Google.

### Ścieżka z PWABuilder Cloud API (zero JDK, automatycznie)

Publiczny endpoint: `https://pwabuilder-cloudapk.azurewebsites.net/generateAppPackage` (POST JSON → ZIP z AAB). Pod spodem bubblewrap w ich Docker image. **Nie wymaga konta ani tokena.**

Workflow w `.github/workflows/build-aab.yml`:
1. Hostuj PWA na GitHub Pages
2. Ustaw secret `PWA_HOST` w Settings → Secrets
3. Push do main → workflow buduje AAB i uploaduje jako artifact
4. (Opcjonalnie) dodaj `SERVICE_ACCOUNT_JSON` secret → automatyczny upload do Play Store internal track

Wymagane 14 pól JSON: `appVersion, appVersionCode, backgroundColor, display, fallbackType, host, iconUrl, launcherName, navigationColor, packageId, signingMode, startUrl, themeColor, webManifestUrl`. Pełna konfiguracja w workflow file.

### Ścieżka z Bubblewrap CLI (wiecej kontroli)

```bash
# Wymaga: Node.js 18+, JDK 17+
npm i -g @bubblewrap/cli
bubblewrap init --manifest=https://twoja-domena.pl/manifest.webmanifest
bubblewrap build
# Wynik: app-release-bundle.aab
```

Bubblewrap działa lokalnie, ale JDK jest dostępne tylko na runnerze GitHub Actions (`ubuntu-latest` ma go z pudełka), więc build idzie w cloud.

### Opcjonalnie — CI/CD z GitHub Actions

Workflow `.github/workflows/deploy.yml` może automatycznie budować i uploadować AAB. Cały toolchain jest open source (YAML + fastlane + Google Play service account JSON w secrets).

## 🎨 Design notes

- **Fonts**: Cinzel (display, rzymskie łuki) + Cormorant Garamond (body, klasyczna elegancja)
- **Palette**: głęboka czerń `#0a0612` + akcent fioletowy `#a97cff`, kule aur mają własne kolory/glow
- **Motion**: płynne krzywe `cubic-bezier(0.16, 1, 0.3, 1)`, particle effects, breathing orbs
- **Mobile-first**: 412x915 (S21 reference), safe-area insets, viewport-fit=cover

## 📝 Content

Każda aura ma swój unikalny opis — bez generycznych tekstów. Napisane tak, żeby każdy user poczuł *"o kurde, to o mnie"*. Znajdziesz je w `js/aura-data.js`.

## ⚖️ Legal

"For entertainment purposes only." To nie jest diagnoza medyczna, psychologiczna ani duchowa. Aplikacja nie zbiera żadnych danych — wszystko jest lokalne, kamera nie jest nigdzie wysyłana.

## License

MIT — forkuj, modyfikuj, wrzucaj do sklepu. Tylko nie udawaj że to diagnoza.
