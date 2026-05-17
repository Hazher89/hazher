#!/usr/bin/env python3
"""Genererer rike produktsider for hazher.no fra app-kunnskap."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def page_head(title, description, theme, extra_css, depth, nav_name, email):
    p = "../" * depth
    return f"""<!DOCTYPE html>
<html lang="nb">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>{title}</title>
<meta name="description" content="{description}"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="{p}styles.css"/>
<link rel="stylesheet" href="{p}hazher-apple.css"/>
<link rel="stylesheet" href="{p}hazher-apple-ext.css"/>
<link rel="stylesheet" href="{p}{extra_css}"/>
<script src="{p}main.js" defer></script>
<script src="{p}hazher-apple.js" defer></script>
</head>
<body class="apple-site apple-product theme-{theme}">
<div class="scroll-progress" aria-hidden="true"></div>
<div class="bg-mesh" aria-hidden="true" data-parallax="0.02"></div>
<div class="bg-grid" aria-hidden="true" data-parallax="0.04"></div>
<header class="nav"><div class="wrap nav-inner">
<a href="{p}index.html" class="logo">Hazher</a>
<button type="button" class="nav-toggle" aria-label="Meny" id="navToggle"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>
<nav class="nav-links" id="navLinks">
<a href="{p}index.html">Forside</a>
<a href="index.html">{nav_name}</a>
<a href="Support/">Support</a>
<a href="Privacy/">Personvern</a>
<a href="mailto:{email}" class="nav-cta">Kontakt</a>
</nav></div></header>
<main>
""".replace("div", "div")


def hero(eyebrow, h1, lead, icon, btn_class, extra_links=""):
    return f"""
<section class="apple-hero">
<div class="apple-hero__glow" aria-hidden="true"></div>
<div class="apple-hero__inner wrap">
<p class="apple-hero__eyebrow" data-reveal="up">{eyebrow}</p>
<h1 data-reveal="up">{h1}</h1>
<p class="apple-hero__lead" data-reveal="up">{lead}</p>
<div class="apple-hero__actions" data-reveal="up">
<a href="Support/" class="btn {btn_class}">Support</a>
<a href="Privacy/" class="btn btn-ghost">Personvern</a>
{extra_links}
</div>
<div class="apple-hero__icon" data-reveal="scale">
<div class="app-squircle app-squircle--{btn_class.replace('btn-','').replace('-primary','')}">
<img src="../images/{icon}" width="140" height="140" alt=""/>
</div></div></div>
<span class="apple-scroll-hint" aria-hidden="true">Scroll</span>
</section>
""".replace("div", "div").replace("<div>", "<div>").replace("</div>", "</div>")


def feature(fid, label, h2, p, stats):
    lines = ""
    for color, title, sub in stats:
        lines += f'<div class="apple-stat-line"><span class="apple-stat-line__dot" style="background:{color}"></span><div><strong>{title}</strong><span>{sub}</span></div>\n'
    return f"""
<section class="apple-feature" id="{fid}" data-reveal="up">
<div class="apple-feature__grid">
<div><p class="apple-feature__label">{label}</p><h2>{h2}</h2><p>{p}</p></div>
<div class="apple-feature__visual" data-stagger>{lines}</div>
</div></section>
"""


def bento(title, cells):
    html = "".join(
        f'<article class="apple-bento__cell{" apple-bento__cell--wide" if c.get("w") else ""}{" apple-bento__cell--tall" if c.get("t") else ""}"><h3>{c["h"]}</h3><p>{c["p"]}</p></article>'
        for c in cells
    )
    return f'<section class="apple-bento" data-reveal="up"><h2>{title}</h2><div class="apple-bento__grid" data-stagger>{html}</div></section>'


def spec_section(title, intro, cards):
    cards_html = ""
    for c in cards:
        items = "".join(f"<li>{i}</li>" for i in c["items"])
        cards_html += f'<div class="apple-spec-card"><h3>{c["h"]}</h3><ul>{items}</ul></div>'
    return f"""
<section class="apple-spec-section"><div class="wrap">
<h2>{title}</h2>
<p class="apple-spec-intro">{intro}</p>
<div class="apple-spec-grid" data-stagger>{cards_html}</div>
</div></section>
"""


def compare_table(rows):
    body = ""
    for r in rows:
        body += f"<tr><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td></tr>"
    return f"""
<div class="apple-compare"><table>
<thead><tr><th>Funksjon</th><th>Gratis</th><th>Pro</th></tr></thead>
<tbody>{body}</tbody></table></div>
"""


def footer_page(p, name, email):
    return f"""
</main>
<footer class="footer"><div class="wrap footer-grid">
<div class="footer-brand"><div class="logo">Hazher</div><p>{name} · hazher.no</p></div>
<div class="footer-links">
<a href="{p}index.html">Forside</a><a href="Support/">Support</a><a href="Privacy/">Personvern</a>
</div>
<div class="footer-meta"><p>&copy; <span id="y"></span> Hazher · <a href="mailto:{email}">{email}</a></p></div>
</div></footer>
<div class="cookie-banner" id="cookieBanner" role="dialog"><div class="cookie-inner">
<p>Informasjonskapsler i tråd med <a href="{p}privacy.html">personvernerklæringen</a>.</p>
<button type="button" class="btn btn-primary" id="cookieAccept">Jeg forstår</button>
</div></div>
</body></html>
""".replace("div", "div")


def build_hurtighjelp():
    c = page_head(
        "Hurtighjelp — komplett produktguide | Hazher",
        "Norsk markedsplass for tjenester: 80+ kategorier, privat chat, taleanrop, live transport, moderering, Hurtighjelp Pro og PDF-kvitteringer.",
        "rapid",
        "hurtighjelp-extra.css",
        1,
        "Hurtighjelp",
        "kontakt@hazher.no",
    )
    c += hero(
        "Norsk markedsplass · iOS & Android",
        "Hurtighjelp.",
        "Finn hjelp i nabolaget — eller tilby det du er god til. Fra snømåking og hundelufting til transport, håndverk og IT. Chat, ring og følg oppdraget live — med kvalitetssjekk før publisering og tydelig fullføringsflyt.",
        "hurtighjelp-app-icon.png",
        "btn-rapid-primary",
    )
    c += feature(
        "marked",
        "Markedsplass",
        "To måter å bruke plattformen.",
        "Publiser enten at du <strong>trenger hjelp</strong> (etterspørsel) eller <strong>tilbyr en tjeneste</strong> (tilbud). Feed med kart, smart søk, filtre på kategori og pris, utvalgte annonser, lagrede favoritter og deling av annonser.",
        [
            ("var(--rapid)", "Trenger hjelp / Tilbyr hjelp", "request og offer"),
            ("#38bdf8", "Kart & radius", "flutter_map med klynger"),
            ("#a78bfa", "Moderering", "Nye annonser godkjennes av admin"),
        ],
    )
    c += feature(
        "kategorier",
        "Kategorier",
        "80+ underkategorier. 14 hovedgrupper.",
        "Hjem & renhold, hage & ute, transport & levering (egen flyt med hent/lever), flytt & montering, håndverk, IT, barn & dyr, velvære, mat, bil, undervisning, event — på norsk og engelsk.",
        [
            ("#34d399", "Transport", "Live GPS og Live Activity"),
            ("#fbbf24", "Haster & featured", "Synlighet i feed"),
            ("#f472b6", "Søkevarsler", "Lagre kriterier og få push"),
        ],
    )
    c += feature(
        "chat",
        "Kommunikasjon",
        "Privat chat. Taleanrop. Avtaler.",
        "På åpne annonser får hver interessent <strong>egen tråd</strong> — ikke én felles chat. Meldinger med bilder, emoji-reaksjoner, lest-status, skriver-indikator og tale-til-tekst. Ring i appen med WebRTC og CallKit på iPhone.",
        [
            ("var(--rapid)", "Én tråd per interessent", "Eiers innboks for alle henvendelser"),
            ("#38bdf8", "Taleanrop", "VoIP-push og samtalelogg i chat"),
            ("#34d399", "Blokkering", "Stopp uønsket kontakt"),
        ],
    )
    c += feature(
        "utføring",
        "Utføring",
        "Wolt-inspirert flyt i chat.",
        "Eier bekrefter oppstart → utfører starter → faser (på vei, ankommet, jobber) med push → utfører leverer med bilder og notat → bestiller godkjenner. Gjensidig vurdering og PDF-kvittering etterpå.",
        [
            ("#fbbf24", "20 min frist", "For valgt hjelper på request"),
            ("#a78bfa", "Tvist", "Registrering ved uenighet"),
            ("#6ee7b7", "Kvittering PDF", "For begge parter"),
        ],
    )
    c += feature(
        "transport",
        "Live transport",
        "Følg leveransen på kartet.",
        "For kategorien Transport & levering: henteadresse, leveringsadresse, pakkeinfo, rute på kart, live GPS fra tildelt hjelper, fullskjerm kart i chat, Live Activity på iOS og forgrunnsvarsel på Android.",
        [
            ("#38bdf8", "Kun tildelt hjelper", "Sender posisjon under oppdrag"),
            ("#818cf8", "Åpne i Maps", "Apple eller Google Maps"),
            ("#34d399", "Varsler", "Når sporing starter/stopper"),
        ],
    )
    c += feature(
        "betaling",
        "Oppgjør & Pro",
        "Avtale mellom partene. Pro for aktive hjelpere.",
        "Oppdrag betales <strong>mellom partene</strong> etter avtale (f.eks. Vipps). Hurtighjelp Pro (App Store) gir ubegrenset kapasitet etter gratisgrenser: 3 tilbudsannonser, 3 fullførte «ta oppdrag», begrenset 4. henvendelse på tilbud uten Pro.",
        [
            ("#ff5c1a", "Stripe/Vipps backend", "Klar for utvidet checkout"),
            ("#5eead4", "Verifisert med Vipps", "OAuth-merke på profil"),
            ("#c4b5fd", "Hurtighjelp Pro", "StoreKit-abonnement"),
        ],
    )
    c += bento("Alt innebygd i én app.", [
        {"h": "Profiler & omdømme", "p": "Avatar, cover, bio, snittvurdering, følgere, favoritthjelpere, offentlig profil.", "w": True},
        {"h": "Innlogging", "p": "Vipps, Apple, Google — gjest kan bla markedet."},
        {"h": "Varsler", "p": "Meldinger, oppdrag, taleanrop, live tracking, moderering — med kategorier."},
        {"h": "Tilgjengelighet", "p": "Høy kontrast, større tekst, redusert animasjon.", "t": True},
        {"h": "Support", "p": "Saker i app med tråd og bilder."},
        {"h": "Superadmin", "p": "Godkjenning, brukere, push, rapporter (internt)."},
        {"h": "Språk", "p": "Norsk og engelsk."},
        {"h": "Deep links", "p": "Del annonse og profil."},
    ])
    c += spec_section(
        "Funksjonsliste — Hurtighjelp",
        "Dette er en utvidet oversikt basert på appen slik den er bygget (Flutter + Supabase, mai 2026).",
        [
            {"h": "Opprett & publiser", "items": [
                "Tittel, beskrivelse, pris i NOK, flere bilder, adresse med autocomplete",
                "ASAP eller planlagt tidspunkt",
                "Valgfri live sporing (standard for transport)",
                "Redigering utløser ny moderering",
            ]},
            {"h": "Chat & anrop", "items": [
                "Sanntidsmeldinger, bilder, systemmeldinger",
                "Avtaleforslag begge må godta",
                "WebRTC taleanrop, CallKit, ringetone",
                "Modereringstråd ved avslått annonse",
            ]},
            {"h": "Trygghet", "items": [
                "Rapporter bruker/annonse, blokkering",
                "RLS på jobs, messages, tracking, payments",
                "Konto utestengt og slett konto (GDPR)",
                "Eksporter mine data",
            ]},
            {"h": "Teknisk", "items": [
                "Riverpod + go_router",
                "120+ SQL-migrasjoner",
                "Edge Functions: push-fcm, apple-verify-helper-subscription",
                "Facebook app events (valgfritt, ATT på iOS)",
            ]},
        ],
    )
    c += compare_table([
        ("Publiserte tilbud", "3", "Ubegrenset"),
        ("Fullførte «ta oppdrag»", "3", "Ubegrenset"),
        ("4. interessent på request", "Stopp", "—"),
        ("4.+ henvendelse på tilbud", "Begrenset 20 min", "Full tilgang"),
    ])
    c += """
<section class="apple-cta-band" data-reveal="scale">
<h2>Support og App Store</h2>
<p>Offisielle URL-er for Apple og Google Play.</p>
<div class="apple-cta-band__actions">
<a href="Support/" class="btn btn-rapid-primary">hazher.no/HURTIGHJELP/Support/</a>
<a href="Privacy/" class="btn btn-ghost">Personvern</a>
</div></section>
"""
    c += footer_page("../", "Hurtighjelp", "kontakt@hazher.no")
    (ROOT / "HURTIGHJELP/index.html").write_text(c, encoding="utf-8")
    print("HURTIGHJELP")


def build_ecoshelf():
    c = page_head(
        "EcoShelf — komplett produktguide | Hazher",
        "Matskap med kjøl, frys, tørr og dyr: strekkode, kvitterings-KI, delt lager, handleliste, EcoShelf Pro og hjemskjerm-widget.",
        "eco",
        "ecoshelf-extra.css",
        1,
        "EcoShelf",
        "kontakt@hazher.no",
    )
    c += hero(
        "Mat · hjem · mindre svinn · v1.0.2",
        "EcoShelf.",
        "Fem faner for hverdagen: Matskap, Skanner, Oppskrifter (Pro), Handleliste og Profil. Registrer det du har, få varsler før utløp, del skap med familien — og la KI lese kvitteringer og skap-bilder før du godkjenner.",
        "ecoshelf-app-icon-v2.png",
        "btn-eco",
        '<a href="https://ecoshelf.app" class="btn btn-ghost" target="_blank" rel="noopener">ecoshelf.app</a>',
    )
    c += feature("matskap", "Matskap", "Fire soner. Én oversikt.", "Kjøleskap, fryser, tørrskap og kjæledyr. Grupper like varer, sorter på utløp, sveip for spist/kastet, hurtigtillegg fra katalog, og «Redd måltidet» for varer som haster.", [("#34d399", "Utløpsvarsler", "Per vare og globalt"), ("#38bdf8", "Offline-kø", "Synker når nett er tilbake"), ("#a78bfa", "Bilde-historikk", "Tidligere skap-snapshots")])
    c += feature("skanner", "Skanner", "Strekkode, kvittering og KI.", "Én hub: skann strekkode (Kassal.app, Open Food Facts m.m.), les kvittering med OCR + sky-KI, eller ta bilde av kjøl/frys/tørr/dyr — du godkjenner alltid listen før lagring.", [("#6ee7b7", "Kvittering", "review_receipt_screen"), ("#fbbf24", "Skap-KI", "3 gratis/mnd, ubegrenset Pro"), ("#818cf8", "Produktbilder", "Fra katalog i sky")])
    c += feature("oppskrifter", "Oppskrifter Pro", "Middag fra lageret.", "Sky-KI foreslår retter basert på registrerte varer. Filter: alle, snart utløpt, klar nå. Ingredienser med «mangler» — legg på handleliste med ett trykk. Hero-bilder fra bilde-API eller fallback.", [("#34d399", "Pro", "App Store måned/år"), ("#f472b6", "Basisvarer", "Salt, olje m.m. håndteres smart"), ("#38bdf8", "Gratis demo", "Begrenset sky-KI-prøve")])
    c += feature("delt", "Delt matskap", "Familie og kollektiv.", "Opprett delt skap med 8-tegns kode, sanntid for alle medlemmer, valgfrie push når andre endrer lager, flytt personlige varer inn i delt skap.", [("#6ee7b7", "Realtime", "Supabase subscriptions"), ("#a78bfa", "Felles handleliste", "Knyttet til delt skap"), ("#fbbf24", "Invitasjon", "Eier styrer medlemmer")])
    c += feature("widget", "Widget & profil", "Fra hjemskjermen.", "iOS og Android-widget: kombinert, oversikt, hurtigskann, utløp først. CSV-eksport av lager, statistikk (spart, kastet, puls), språk nb/en, slett konto.", [("#34d399", "App Group", "group.com.ecoshelf.app"), ("#38bdf8", "Apple & Google", "Innlogging"), ("#818cf8", "AdMob", "Gratis nivå (ikke Pro)")])
    c += bento("EcoShelf i tall og detaljer", [
        {"h": "Strekkode-kilder", "p": "Kassal.app, Open Food Facts, UPCItemDB, brukerbidrag i products-tabell.", "w": True},
        {"h": "Redd måltidet", "p": "Lokale forslag for alle; full sky-KI med Pro."},
        {"h": "Handleliste", "p": "Arkiv, kategorier, «legg i skap» ved kjøp."},
        {"h": "Sikkerhet", "p": "RLS, Edge Functions for OpenAI-nøkler, IAP-verify.", "t": True},
        {"h": "Push", "p": "APNs + FCM, delt skap, shopping-intent."},
        {"h": "Support", "p": "kontakt@hazher.no"},
    ])
    c += spec_section("Alle hovedfunksjoner", "EcoShelf er utviklet av Hazher med Supabase-backend og Flutter-klient.", [
        {"h": "Matskap-fanen", "items": ["Gruppering av partier", "Tøm skap per sone", "Scope: mitt / kombinert / delt", "Markering spist/kastet med statistikk"]},
        {"h": "Skanner-fanen", "items": ["Strekkode", "Kvittering (AI)", "Kjøl/frys/tørr/dyr bilde-KI", "Gjennomgang før lagring"]},
        {"h": "EcoShelf Pro", "items": ["Ubegrenset skap-KI", "Ubegrenset kvitterings-KI", "Full oppskriftsfane", "Uten AdMob"]},
        {"h": "Backend", "items": ["openai-proxy", "recipe-hero-image", "shared-inventory-notify", "iap-verify", "delete_user_complete RPC"]},
    ])
    c += compare_table([
        ("AI skap per måned", "3", "Ubegrenset"),
        ("Kvitterings-KI", "1 demo/mnd", "Ubegrenset"),
        ("Oppskriftsfane", "Paywall", "Full tilgang"),
        ("Annonser", "Ja", "Nei"),
    ])
    c += '<section class="apple-cta-band"><h2>Last ned EcoShelf</h2><p>Juridisk: hazher.no/ECOSHELF og ecoshelf.app</p><div class="apple-cta-band__actions"><a href="Support/" class="btn btn-eco">Support</a><a href="Privacy/" class="btn btn-ghost">Personvern</a></div></section>'
    c += footer_page("../", "EcoShelf", "kontakt@hazher.no")
    (ROOT / "ECOSHELF/index.html").write_text(c, encoding="utf-8")
    print("ECOSHELF")


def build_loop():
    c = page_head(
        "Loop Marked — personvern-først markedsplass | Hazher",
        "Kryptert chat, Lumo-valuta, 22 språk, kart, tilbud, badges og sanntid — fra Hazher.",
        "loop",
        "ecoshelf-extra.css",
        1,
        "Loop Marked",
        "kontakt@hazher.no",
    )
    c = c.replace("ECOSHELF/", "").replace("ecoshelfsupport", "kontakt")
    c = c.replace('href="index.html">EcoShelf', 'href="index.html">Loop Marked')
    c = c.replace("mailto:kontakt@hazher.no", "mailto:kontakt@hazher.no")
    c += hero(
        "Personvern-først · 22 språk · iOS & Android",
        "Loop Marked.",
        "Mer enn et marked — et fellesskap for trygg handel. Meldinger er end-to-end kryptert, handel skjer med Lumo (virtuell valuta i appen), og du finner varer nær deg med kart og radius-søk.",
        "loop-marked-icon.png",
        "btn-loop",
        '<a href="https://loopmarked.com/" class="btn btn-loop" target="_blank" rel="noopener">loopmarked.com</a>',
    )
    c += feature("marked", "Markedsplass", "Handle smartere.", "Smarte filtre: kategori, pris, radius, kartvisning. AI-prisforslag, lagrede søk med push når nye treff dukker opp, ønskeliste.", [("var(--loop)", "Lumo", "Virtuell valuta — ikke bank i app"), ("#38bdf8", "Radius 1–500 km", "GPS uten å dele presis posisjon"), ("#34d399", "Sanntid", "Supabase Realtime")])
    c += feature("chat", "Kryptert chat", "Forhandle trygt.", "E2E-krypterte meldinger, bilder, talemeldinger, live posisjon, lesekvitteringer du kan styre, blokkering og rapportering.", [("#a78bfa", "AES-256 + RSA", "Ifølge produktbeskrivelse"), ("#f472b6", "Tilbudssystem", "Bud, motbud, aksept"), ("#6ee7b7", "Kvitteringer", "Transaksjonshistorikk")])
    c += feature("global", "Globalt", "22 språk. RTL.", "Apple eller Google-innlogging på sekunder. Arabisk, kurdisk, persisk med RTL — hele appen tilpasses.", [("#fbbf24", "Badges", "Handler, streaks, henvisning"), ("#818cf8", "Biometri", "Face ID på lommebok"), ("#38bdf8", "Moderering", "AI + rapporter")])
    c += bento("Loop Marked-funksjoner", [
        {"h": "Smart Marketplace", "p": "Kart, AI-prising, lagrede søk.", "w": True},
        {"h": "Omdømme", "p": "Vurderinger etter hver handel."},
        {"h": "Glassmorphism UI", "p": "Premium mørk design."},
        {"h": "Support i app", "p": "Support-saker innebygd.", "t": True},
        {"h": "Flutter + Supabase", "p": "Én kodebase, RLS, Edge."},
        {"h": "App Store", "p": "Gratis å laste ned."},
    ])
    c += spec_section("Teknologi og sikkerhet", "Loop Marked er utviklet av Hazher — se loopmarked.com for nedlasting.", [
        {"h": "Frontend", "items": ["Flutter 60fps", "Glassmorphic navigasjon", "Push med kategorier"]},
        {"h": "Backend", "items": ["Supabase PostgreSQL", "Row Level Security", "Edge Functions", "Global CDN"]},
        {"h": "Personvern", "items": ["E2E chat", "Read receipt control", "Verified OAuth identity", "Block & report"]},
    ])
    c += '<section class="apple-cta-band"><h2>Last ned Loop Marked</h2><p>Produktnettsted med full feature-liste og App Store-lenker.</p><div class="apple-cta-band__actions"><a href="https://loopmarked.com/" class="btn btn-loop" target="_blank" rel="noopener">loopmarked.com</a><a href="https://apps.apple.com/app/loop-marked/id6757446544" class="btn btn-ghost" target="_blank" rel="noopener">App Store</a></div></section>'
    c += footer_page("../", "Loop Marked", "kontakt@hazher.no")
    (ROOT / "LOOPMARKED").mkdir(exist_ok=True)
    (ROOT / "LOOPMARKED/index.html").write_text(c, encoding="utf-8")
    print("LOOPMARKED")


def build_driftpro():
    c = page_head(
        "DriftPro — feltverktøy for oppdrag | Hazher",
        "Oppdrag, dokumentasjon og kundedialog for fagfolk ute — Flutter og Supabase fra Hazher.",
        "dirf",
        "driftpro-extra.css",
        1,
        "DriftPro",
        "kontakt@hazher.no",
    )
    c += hero(
        "Profesjonelt · sky · mobil",
        "DriftPro.",
        "For deg som jobber ute og trenger oversikt: aktive og fullførte oppdrag, notater og bilder per jobb, og dialog med kunder uten å miste tråden mellom oppdrag. Synkronisert sikkert med tilgangskontroll per bruker (RLS).",
        "driftpro-app-icon.png",
        "btn-dirf-primary",
    )
    c += feature("oppdrag", "Oppdrag", "Status og historikk.", "Se hva som er aktivt, hva som er levert, og hva som krever oppfølging. Notater og bilder knyttes til riktig oppdrag.", [("#6366f1", "Oppdragsliste", "Prioritert arbeidsflate"), ("#38bdf8", "Dokumentasjon", "Bilder og tekst"), ("#34d399", "Sky-synk", "På tvers av enheter")])
    c += feature("kunde", "Kundedialog", "Kontekst, ikke rot.", "Kommunikasjon knyttet til oppdraget du jobber med — slik at kunden og du alltid snakker om samme sak.", [("#a5b4fc", "Varsler", "Push når det trengs"), ("#fbbf24", "Felt-UI", "Store trykkflater"), ("#6ee7b7", "Sikkerhet", "Supabase Auth")])
    c += bento("DriftPro på hazher.no", [
        {"h": "Målgruppe", "p": "Fagfolk, service, feltarbeid — oppdrag ute.", "w": True},
        {"h": "Stack", "p": "Flutter, Supabase, Edge Functions."},
        {"h": "Kontakt", "p": "kontakt@hazher.no"},
        {"h": "Fra Hazher", "p": "Samme kvalitetsnivå som EcoShelf og Hurtighjelp.", "t": True},
    ])
    c += spec_section("Planlagte / markedsførte funksjoner", "DriftPro beskrives på hazher.no som Hazhers profesjonelle feltapp. Kontakt oss for roadmap og App Store-lansering.", [
        {"h": "Kjerne", "items": ["Oppdragsliste med status", "Notater og bilder per oppdrag", "Kundedialog i kontekst", "Push-varsler"]},
        {"h": "Teknisk", "items": ["iOS og Android", "RLS i PostgreSQL", "Innlogging via sky", "Skalerbar Edge-logikk"]},
    ])
    c += '<section class="apple-cta-band"><h2>Mer om DriftPro</h2><p>Vi utvider dokumentasjonen etter hvert som appen lanseres.</p><div class="apple-cta-band__actions"><a href="Support/" class="btn btn-dirf-primary">Support</a><a href="Privacy/" class="btn btn-ghost">Personvern</a></div></section>'
    c += footer_page("../", "DriftPro", "kontakt@hazher.no")
    (ROOT / "DRIFTPRO/index.html").write_text(c, encoding="utf-8")
    print("DRIFTPRO")


def patch_homepage():
    p = ROOT / "index.html"
    t = p.read_text(encoding="utf-8")
    if "hazher-apple-ext.css" not in t:
        t = t.replace(
            '<link rel="stylesheet" href="hazher-apple.css" />',
            '<link rel="stylesheet" href="hazher-apple.css" />\n    <link rel="stylesheet" href="hazher-apple-ext.css" />',
        )
    blocks = {
        "ecoshelf": """<div class="home-product-rich"><ul>
<li>Fem faner: Matskap, Skanner, Oppskrifter (Pro), Handleliste, Profil</li>
<li>Kjøl, frys, tørrskap og kjæledyr — gruppering og utløpsvarsler</li>
<li>Strekkode (Kassal.app, Open Food Facts) og kvitterings-KI</li>
<li>KI-skann av skap — godkjenn før lagring (3/mnd gratis, ubegrenset Pro)</li>
<li>Delt matskap med 8-tegns kode og sanntid</li>
<li>Redd måltidet, handleliste med arkiv, hjemskjerm-widget</li>
<li>EcoShelf Pro: uten reklame, full oppskrifter, ubegrenset sky-KI</li>
<li>Apple/Google-innlogging, nb/en, RLS i Supabase</li>
</ul></div>""",
        "loopmarked": """<div class="home-product-rich"><ul>
<li>Personvern-først markedsplass med E2E-kryptert chat</li>
<li>Handel med Lumo — virtuell valuta i appen</li>
<li>22 språk inkl. RTL, radius-søk 1–500 km og kart</li>
<li>Strukturerte tilbud, vurderinger, badges og ønskeliste</li>
<li>Søkevarsler med push, AI-prisforslag, biometrisk lommebok</li>
<li>Flutter + Supabase Realtime — fra Hazher</li>
</ul></div>""",
        "hurtighjelp": """<div class="home-product-rich"><ul>
<li>Trenger hjelp / tilbyr tjeneste — 80+ kategorier, 14 grupper</li>
<li>Privat chat per interessent, taleanrop (CallKit), tale-til-tekst</li>
<li>Live transport med kart, Live Activity (iOS)</li>
<li>Moderering før publisering, rapportering og blokkering</li>
<li>Wolt-lignende utføring i chat, PDF-kvittering</li>
<li>Vipps/Apple/Google, «Verifisert med Vipps»-merke</li>
<li>Hurtighjelp Pro for aktive hjelpere (App Store)</li>
<li>Norsk og engelsk, tilgjengelighetsvalg</li>
</ul></div>""",
        "driftpro": """<div class="home-product-rich"><ul>
<li>Oppdragsliste for aktive og fullførte jobber</li>
<li>Notater og bilder knyttet til hvert oppdrag</li>
<li>Kundedialog i jobbkontekst</li>
<li>Sky-synk med RLS per bruker</li>
<li>Push-varsler og feltoptimalisert UI</li>
<li>Flutter + Supabase — fra Hazher</li>
</ul></div>""",
    }
    for key, html in blocks.items():
        marker = f'id="{key}"'
        if marker not in t:
            continue
        # insert before section-cta in that section
        insert_before = '<div class="section-cta">'
        idx = t.find(marker)
        if idx < 0:
            continue
        sec_end = t.find(insert_before, idx)
        if sec_end < 0:
            continue
        chunk = t[idx:sec_end]
        if "home-product-rich" in chunk:
            continue
        t = t[:sec_end] + "\n" + html + "\n            " + t[sec_end:]
    # loop: add link to LOOPMARKED hub
    t = t.replace(
        'href="https://loopmarked.com/" class="btn btn-loop" target="_blank" rel="noopener noreferrer">Les mer om Loop Marked</a>',
        '<a href="LOOPMARKED/" class="btn btn-loop">Les mer på hazher.no</a>\n              <a href="https://loopmarked.com/" class="btn btn-ghost" target="_blank" rel="noopener noreferrer">loopmarked.com</a>',
        1,
    )
    p.write_text(t, encoding="utf-8")
    print("homepage patched")


if __name__ == "__main__":
    build_hurtighjelp()
    build_ecoshelf()
    build_loop()
    build_driftpro()
    patch_homepage()
    # inject ext css link in all product pages
    for sub in ["ECOSHELF", "HURTIGHJELP", "DRIFTPRO", "LOOPMARKED"]:
        for html in (ROOT / sub).rglob("*.html"):
            t = html.read_text(encoding="utf-8")
            if "hazher-apple-ext.css" not in t and "hazher-apple.css" in t:
                t = t.replace(
                    '<link rel="stylesheet" href="../hazher-apple.css"/>',
                    '<link rel="stylesheet" href="../hazher-apple.css"/>\n<link rel="stylesheet" href="../hazher-apple-ext.css"/>',
                )
                html.write_text(t, encoding="utf-8")
    print("done")
