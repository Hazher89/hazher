# hazher.no (statisk site)

Moderne landingsside for Hazher med EcoShelf og Loop Marked.

Undermapper (når **root** er `hazher-site`):

- `ECOSHELF/` — dokumentasjon / produkt-hub for EcoShelf  
- `ECOSHELF/Support/` — support og FAQ  
- `ECOSHELF/Privacy/` — personvern for **appen** (kan brukes som Privacy Policy URL i App Store Connect)

Offentlige URL-er: `https://hazher.no/ECOSHELF/`, `https://hazher.no/ECOSHELF/Support/`, `https://hazher.no/ECOSHELF/Privacy/`.

## Hvit skjerm på hazher.no?

Det skjer når **Cloudflare Pages** bruker **feil mappe** i repoet.

- Hvis GitHub-repoet ditt har **flere mapper** (f.eks. `ECOSHELF`, `hazher-site`, `ECOSHELF.xcodeproj` i roten), må du **ikke** la Pages bygge fra rot.
- Gå til **Cloudflare Dashboard** → ditt **Pages-prosjekt** → **Settings** → **Builds & deployments** → **Build configuration**.
- Sett **Root directory** til: **`hazher-site`** (nøyaktig dette navnet).
- **Framework preset:** None  
- **Build command:** (tom)  
- **Build output directory:** `/` eller `.` (avhengig av hva dashbordet forventer for «samme mappe som rot» — ofte **`/`** når root allerede er `hazher-site`).

Deretter **Save** og kjør **Retry deployment** / ny deploy.

Du trenger **ikke** et eget repo kun med nettsiden — monorepo er OK så lenge **root directory** peker på `hazher-site`.

## GitHub

Legg mappen i et repo (eget repo anbefales for ren Pages-oppsett), commit og push:

```bash
cd hazher-site
git init
git add .
git commit -m "Add Hazher landing page"
# opprett repo på GitHub, deretter:
git remote add origin https://github.com/DEG/hazher-site.git
git branch -M main
git push -u origin main
```

## Cloudflare Pages (anbefalt for hazher.no)

1. I [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Velg GitHub-repoet og grenen `main`.
3. **Build settings** (ren statisk mappe):
   - **Framework preset:** None
   - **Build command:** (tom)
   - **Build output directory:** `/` hvis repoet *kun* inneholder innholdet fra `hazher-site`, eller sett **Root directory** til `hazher-site` hvis siden ligger i en undermappe i et monorepo.
4. **Save and Deploy**.
5. **Custom domains** → legg til **hazher.no** og **www.hazher.no** (følg DNS-veiledningen; ofte CNAME til `*.pages.dev`).

DNS for hazher.no må være hos Cloudflare (eller du peker A/CNAME dit leverandøren sier).

## GitHub Pages (alternativ)

Repo **Settings** → **Pages** → Source: branch `main`, folder `/root` (eller `/hazher-site`). Tilpass domene under **Custom domain** når du er klar.

## Google AdSense / annonser

- Siden har **tykk, egen tekst**, tydelig navigasjon, **personvern** (`privacy.html`) som omtaler informasjonskapsler og annonser, **ads.txt**-mal og **informasjonskapsel-banner**.
- Etter godkjenning i AdSense: lim inn publisher-script i `index.html` (se kommentar nederst i fila), legg inn **annonse-blokker** der `.ad-slot`-boksene står (eller bytt dem ut med `ins.adsbygoogle`), og oppdater **ads.txt** med ditt `pub-…`-ID.
- Opprett faktisk e-post for **kontakt@hazher.no** og **personvern@hazher.no** (eller oppdater adressene i `index.html` og `privacy.html`).
- For brukere i EØS kan Google kreve **samtykke** (Consent Mode / CMP) for personaliserte annonser; vurder offisielt CMP-verktøy når du skrur på målretting.

## Ressurser i mappen

- `images/ecoshelf-app-icon.png` — 1024×1024 appikon (samme som i app-pakken).
- `images/loop-marked-icon.png` — hentet fra produksjonssiden [loopmarked.com](https://loopmarked.com/) (`/images/app-icon.png`).
