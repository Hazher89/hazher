# Hazher HQ (privat admin)

Usynlig kontrollrom på **https://hazher.no/hq**

## Sikkerhet

- **IP-allowlist** (`HQ_ALLOWED_IPS`): andre IP-er får **404** (siden finnes «ikke»).
- **Kun bruker `HAZHER`** med passord du satte (lagret som PBKDF2-hash, ikke klartekst i git).
- HttpOnly / Secure / SameSite session-cookie.
- `X-Robots-Tag: noindex`.

Viktig: passordet ble skrevet i chat — bytt det senere hvis det brukes andre steder.

## Cloudflare-oppsett (påkrevd)

### 1) Finn din IP

Åpne: https://hazher.no/cdn-cgi/trace  
Se linjen `ip=…`

### 2) Environment variables

Cloudflare Dashboard → **Workers & Pages** → prosjektet for hazher.no → **Settings** → **Environment variables** (Production):

| Navn | Verdi |
|------|--------|
| `HQ_ALLOWED_IPS` | Din IP (flere: `1.2.3.4,5.6.7.8`) |
| `HQ_USER` | `HAZHER` (valgfritt — default er HAZHER) |
| `HQ_SESSION_SECRET` | Lang tilfeldig streng |
| `HQ_PASS_SALT` | (valgfritt — innebygd default finnes) |
| `HQ_PASS_HASH` | (valgfritt — innebygd default for ditt valgte passord) |

### 3) KV for trafikklogg

1. **Workers & Pages** → **KV** → Create namespace (f.eks. `hazher-hq`)
2. Pages-prosjekt → **Settings** → **Functions** → **KV namespace bindings**
3. Variable name: **`HAZHER_HQ`** → velg namespacen
4. Redeploy

Uten KV fungerer login, men trafikklisten er tom.

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
