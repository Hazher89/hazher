# Hazher HQ (privat admin)

Usynlig kontrollrom på **https://hazher.no/hq**

## Sikkerhet

- **IP-allowlist** (`HQ_ALLOWED_IPS`): andre IP-er får **404** (siden finnes «ikke»).
- **Kun bruker `HAZHER`** med passord du satte (lagret som SHA-256-hash, ikke klartekst i git).
- HttpOnly / Secure / SameSite session-cookie.
- `X-Robots-Tag: noindex`.

Viktig: passordet ble skrevet i chat — bytt det senere hvis det brukes andre steder.

**Ikke sett** `HQ_PASS_HASH` / `HQ_PASS_SALT` i Cloudflare med mindre du har generert dem med `scripts/hash-hq-pass.mjs`. Feil verdier der overstyrer innebygd hash og gjør at innlogging feiler.

## Cloudflare-oppsett (påkrevd)

### 1) Finn din IP

Åpne: https://hazher.no/cdn-cgi/trace  
Se linjen `ip=…`

### 2) Environment variables / secrets

Cloudflare Dashboard → **Workers & Pages** → **hazher** → **Settings** → **Variables and secrets** (Production):

Type **Secret** for alle:

| Navn | Verdi |
|------|--------|
| `HQ_ALLOWED_IPS` | Din IP (f.eks. `83.109.97.12`) |
| `HQ_SESSION_SECRET` | Lang tilfeldig streng |
| `HQ_USER` | `HAZHER` (valgfritt) |

### 3) KV-binding (valgfritt — `HAZHER_HQ`)

`HAZHER_HQ` brukes **kun** til HQ-trafikklogg. Den ligger under **Bindings** (ikke Variables):

1. **Workers & Pages** → **KV** → namespace (f.eks. `hazher-hq`)
2. Pages-prosjektet **hazher** → **Settings** → **Bindings** → **KV namespace**
3. **Variable name:** `HAZHER_HQ` (nøyaktig)
4. Save → **Redeploy**

**Viktig om KV-kvote:** Tidligere logget *hver* sidevisning ~4–6 KV-operasjoner, som raskt fylte gratis-kvoten og utløste Cloudflare-e-post.  
Nå er logging **av som standard**. For å skru på (kun hvis du trenger trafikklisten i `/hq`):

| Navn | Verdi |
|------|--------|
| `HQ_TRAFFIC_LOG` | `1` |

Uten `HQ_TRAFFIC_LOG=1` bruker siden **nesten ingen KV** (HQ-login fungerer fortsatt via cookie).
Uten KV-binding fungerer login også — trafikklisten blir tom.

### 4) Cloudflare Bot Fight (anbefalt)

Dashboard → **Security** → **Bots** → slå på **Bot Fight Mode** (gratis).
Det demper automatisert skannertrafikk før den treffer siden.

HQ logger ikke lenger søppel-stier / scrapers; ukjente URL-er får ekte **404**.

## Bruk

1. Sett `HQ_ALLOWED_IPS` til din IP og deploy.
2. Gå til https://hazher.no/hq fra den IP-en.
3. Logg inn som **HAZHER**.
4. Se land, by, enhet (iPhone / Android / iPad / Desktop), OS, nettleser, ISP, side og tidspunkt.

## Bytt passord

Kjør lokalt:

```bash
node scripts/hash-hq-pass.mjs 'DittNyePassord'
```

Sett `HQ_PASS_SALT` + `HQ_PASS_HASH` i Cloudflare, redeploy.
