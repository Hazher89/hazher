# hazher.no (statisk site)

Moderne landingsside for Hazher med EcoShelf og Loop Marked.

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
