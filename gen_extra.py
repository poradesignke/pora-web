# Extra SEO / AI-visibility output, run at the end of build.py (shares OUT).
import json, re, unicodedata, html, os, datetime
OUT = 'dist'
SITE = 'https://www.pora.sk'
TODAY = datetime.date.today().isoformat()
D = json.load(open('projects.json'))
P, TYPE_EN, DESC_EN = D['P'], D['TYPE_EN'], D['DESC_EN']

def slug(t):
    t = unicodedata.normalize('NFD', t)
    t = ''.join(c for c in t if unicodedata.category(c) != 'Mn').lower()
    return re.sub(r'[^a-z0-9]+', '-', t).strip('-')

def en_code(p):
    return p['code'].replace('PROJEKT ', 'PROJECT ')

for p in P:
    p['code_en'] = en_code(p)
    p['type_en'] = TYPE_EN.get(p['type'], p['type'])
    p['desc_en'] = DESC_EN.get(p['key'], p['desc'])
    p['sk_url'] = f"/projekty/{slug(p['code'])}/"
    p['en_url'] = f"/en/projects/{slug(p['code_en'])}/"
    p['biz'] = p['cat'] != 'byt'
E = html.escape

CSS = '''
:root{--bg:#0E0E10;--panel:#1C1C20;--line:#2A2A30;--fg:#F0EEE9;--muted:#A7A4AC;--lime:#D1FF05;--violet:#7548A8;--coral:#EF5A45;--ink:#111113;--display:'Syne',system-ui,sans-serif;--body:'DM Sans',system-ui,sans-serif;--g:clamp(16px,4vw,56px);color-scheme:dark}
*{box-sizing:border-box}html,body{margin:0;background:var(--bg);color:var(--fg);font-family:var(--body);font-size:17px;line-height:1.6;-webkit-font-smoothing:antialiased}
a{color:inherit}img{max-width:100%;display:block}
.wrap{max-width:1480px;margin:0 auto;padding:0 var(--g)}
header{position:sticky;top:0;z-index:10;background:rgba(14,14,16,.85);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
header .wrap{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:68px}
header img{height:26px;width:auto}
nav{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.btn{display:inline-flex;align-items:center;gap:10px;border-radius:999px;font:700 13px/1 var(--display);letter-spacing:.05em;text-transform:uppercase;padding:14px 20px;min-height:44px;text-decoration:none;white-space:nowrap}
.btn.lime{background:var(--lime);color:var(--ink)}.btn.ghost{border:1.5px solid var(--line)}.btn.ghost:hover{border-color:var(--lime);color:var(--lime)}
.crumb{font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin:42px 0 0}
.crumb a{text-decoration:none}.crumb a:hover{color:var(--lime)}
h1{font:800 clamp(40px,8vw,128px)/.9 var(--display);letter-spacing:-.035em;text-transform:uppercase;margin:18px 0 0;overflow-wrap:anywhere}
.meta{display:flex;flex-wrap:wrap;gap:10px;margin:22px 0 0}
.meta span{font-size:12px;letter-spacing:.12em;text-transform:uppercase;border:1px solid var(--line);border-radius:999px;padding:8px 12px;color:var(--muted)}
.meta .v{background:var(--violet);border-color:var(--violet);color:#fff}
.lead{max-width:760px;font-size:clamp(18px,1.6vw,22px);margin:28px 0 0;color:#DDDAE0}
.lead+p{max-width:760px;color:var(--muted)}
.gal{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin:44px 0 0}
.gal figure{margin:0;border-radius:18px;overflow:hidden;background:var(--panel)}
.gal figure:first-child{grid-column:1/-1}
.gal img{width:100%;height:100%;object-fit:cover;aspect-ratio:4/3}
.gal figure:first-child img{aspect-ratio:16/9}
.gal video{width:100%;display:block;max-height:80vh;background:#000}
.cta{display:flex;flex-wrap:wrap;gap:14px;align-items:center;margin:48px 0 0;padding:34px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.cta p{margin:0 auto 0 0;font:800 clamp(22px,2.6vw,34px)/1.1 var(--display);text-transform:uppercase;letter-spacing:-.02em}
.cta p i{font-style:normal;color:var(--lime)}
.pn{display:flex;justify-content:space-between;gap:14px;margin:30px 0 0;flex-wrap:wrap}
h2{font:800 clamp(28px,4vw,56px)/1 var(--display);letter-spacing:-.03em;text-transform:uppercase;margin:80px 0 20px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px}
.tile{display:block;text-decoration:none;border-radius:18px;overflow:hidden;background:var(--panel);transition:transform .35s}
.tile:hover{transform:translateY(-4px)}.tile:hover b{color:var(--lime)}
.tile img{width:100%;height:auto;aspect-ratio:4/3;object-fit:cover}
.tile div{padding:14px 16px 18px}.tile b{display:block;font:800 20px/1.1 var(--display);text-transform:uppercase;letter-spacing:-.02em}
.tile span{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.intro{max-width:820px;color:#DDDAE0;font-size:19px;margin:24px 0 0}
footer{margin:100px 0 0;border-top:1px solid var(--line);padding:40px 0 60px;color:var(--muted);font-size:14px}
footer .wrap{display:flex;flex-wrap:wrap;gap:12px 30px;justify-content:space-between}
footer a{text-decoration:none}footer a:hover{color:var(--lime)}
@media (max-width:640px){.gal{grid-template-columns:1fr}.gal figure:first-child{grid-column:auto}header .btn.ghost{display:none}}
'''

def head(lang, title, desc, canon, alt_sk, alt_en, image, ld):
    return f'''<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{E(title)}</title>
<meta name="description" content="{E(desc)}">
<link rel="canonical" href="{SITE}{canon}">
<link rel="alternate" hreflang="sk" href="{SITE}{alt_sk}">
<link rel="alternate" hreflang="en" href="{SITE}{alt_en}">
<link rel="alternate" hreflang="x-default" href="{SITE}{alt_sk}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="theme-color" content="#0E0E10">
<meta property="og:type" content="article"><meta property="og:site_name" content="PORA">
<meta property="og:title" content="{E(title)}"><meta property="og:description" content="{E(desc)}">
<meta property="og:url" content="{SITE}{canon}"><meta property="og:image" content="{SITE}{image}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
<style>{CSS}</style>
</head>
<body>
'''

def header(lang, other_url):
    home = '/' if lang == 'sk' else '/en/'
    t = {'sk': ('Projekty', 'Konzultácia →', 'EN'), 'en': ('Projects', 'Consultation →', 'SK')}[lang]
    hub = '/projekty/' if lang == 'sk' else '/en/projects/'
    return f'''<header><div class="wrap"><a href="{home}" aria-label="PORA"><img src="/img/logo-coral.png" alt="PORA – interiérové štúdio" width="900" height="243"></a>
<nav><a class="btn ghost" href="{hub}">{t[0]}</a><a class="btn ghost" href="{other_url}" hreflang="{t[2].lower()}">{t[2]}</a><a class="btn lime" href="{home}#kontakt">{t[1]}</a></nav></div></header>
'''

def footer(lang):
    if lang == 'sk':
        return '''<footer><div class="wrap"><span>© 2026 PORA s.r.o. · interiérové štúdio Košice → worldwide</span><span><a href="mailto:info@pora.sk">info@pora.sk</a> · <a href="tel:+421903494977">+421 903 494 977</a> · Námestie osloboditeľov 3/A, 040 01 Košice</span><span><a href="/">Domov</a> · <a href="/projekty/">Projekty</a> · <a href="/#sluzby">Služby a cenník</a> · <a href="/#faq">Časté otázky</a></span></div></footer>
</body></html>
'''
    return '''<footer><div class="wrap"><span>© 2026 PORA s.r.o. · interior design studio Košice → worldwide</span><span><a href="mailto:info@pora.sk">info@pora.sk</a> · <a href="tel:+421903494977">+421 903 494 977</a> · Námestie osloboditeľov 3/A, 040 01 Košice, Slovakia</span><span><a href="/en/">Home</a> · <a href="/en/projects/">Projects</a> · <a href="/en/#sluzby">Services &amp; pricing</a> · <a href="/en/#faq">FAQ</a></span></div></footer>
</body></html>
'''

ORG = {"@type": "ProfessionalService", "@id": SITE + "/#org", "name": "PORA – interiérové štúdio", "url": SITE + "/"}

def project_page(p, lang):
    sk = lang == 'sk'
    code = p['code'] if sk else p['code_en']
    typ = p['type'] if sk else p['type_en']
    desc = p['desc'] if sk else p['desc_en']
    url = p['sk_url'] if sk else p['en_url']
    other = p['en_url'] if sk else p['sk_url']
    viz = p['viz']
    if sk:
        kind = 'Komerčný priestor' if p['biz'] else 'Súkromný interiér'
        title = f"{code} – {typ} | návrh interiéru PORA Košice"
        mdesc = f"{code}: {typ.lower()} – {desc} Návrh interiéru: PORA, interiérové štúdio Košice."
        extra = ('Projekt v štádiu vizualizácie – návrh pripravený pred realizáciou. ' if viz else '') + \
                ('Súkromné byty a domy označujeme len číslom – diskrétnosť je samozrejmosť. ' if not p['biz'] else '') + \
                'Interiér navrhlo štúdio PORA z Košíc – návrh interiéru, fotorealistické vizualizácie a podklady k realizácii pre klientov na Slovensku aj online vo svete.'
        cta = 'Chcete <i>podobný</i> interiér?'
        crumb = f'<a href="/">PORA</a> / <a href="/projekty/">Projekty</a> / {E(code)}'
        btn1, btn2 = 'Nezáväzná konzultácia →', 'Služby a cenník'
        prevt, nextt, more = '← Predchádzajúci', 'Ďalší →', 'Ďalšie projekty'
        tags = [typ, p['year'], kind] + (['Vizualizácia'] if viz else [])
        home = '/'
    else:
        kind = 'Commercial space' if p['biz'] else 'Private interior'
        title = f"{code} – {typ} | interior design by PORA, Košice"
        mdesc = f"{code}: {typ.lower()} – {desc} Interior design by PORA, interior design studio in Košice, Slovakia."
        extra = ('Visualisation stage – design prepared ahead of construction. ' if viz else '') + \
                ('Private homes are numbered only – discretion is a given. ' if not p['biz'] else '') + \
                'Interior designed by PORA, an interior design studio from Košice, Slovakia – interior design, photorealistic visualisations and construction documents for clients in Slovakia and online worldwide.'
        cta = 'Want a <i>similar</i> interior?'
        crumb = f'<a href="/en/">PORA</a> / <a href="/en/projects/">Projects</a> / {E(code)}'
        btn1, btn2 = 'Free consultation →', 'Services & pricing'
        prevt, nextt, more = '← Previous', 'Next →', 'More projects'
        tags = [typ, p['year'], kind] + (['Visualisation'] if viz else [])
        home = '/en/'
    alt_base = f"{code} – {typ} | {'interiér' if sk else 'interior'} PORA"
    figs = []
    ordered = [p['img']] + [g for g in p['gal'] if g != p['img']]
    for i, src in enumerate(ordered):
        figs.append(f'<figure><img src="{src}" alt="{E(alt_base)} – {i+1}" loading="{"eager" if i < 2 else "lazy"}" width="1200" height="900"></figure>')
    if p.get('video'):
        figs.insert(1, f'<figure style="grid-column:1/-1"><video src="{p["video"]}" controls muted playsinline preload="none" poster="{p["img"]}"></video></figure>')
    i = P.index(p)
    pv, nx = P[i - 1], P[(i + 1) % len(P)]
    pv_url, nx_url = (pv['sk_url'], nx['sk_url']) if sk else (pv['en_url'], nx['en_url'])
    others = [q for q in P if q is not p and q['biz'] == p['biz']][:3] + [q for q in P if q is not p and q['biz'] != p['biz']][:3]
    tiles = ''.join(f'<a class="tile" href="{q["sk_url"] if sk else q["en_url"]}"><img src="{q["img"]}" alt="{E(q["code"] if sk else q["code_en"])}" loading="lazy" width="1200" height="900"><div><b>{E(q["code"] if sk else q["code_en"])}</b><span>{E(q["type"] if sk else q["type_en"])} · {q["year"]}</span></div></a>' for q in others)
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "CreativeWork", "@id": SITE + url + "#work", "name": f"{code} – {typ}", "description": desc, "inLanguage": lang,
         "url": SITE + url, "dateCreated": p['year'], "genre": "Interior design", "creator": ORG,
         "image": [SITE + g for g in p['gal']], "isPartOf": {"@id": SITE + "/#website"}},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "PORA", "item": SITE + home},
            {"@type": "ListItem", "position": 2, "name": "Projekty" if sk else "Projects", "item": SITE + ('/projekty/' if sk else '/en/projects/')},
            {"@type": "ListItem", "position": 3, "name": code, "item": SITE + url}]}]}
    body = head(lang, title, mdesc, url, p['sk_url'], p['en_url'], p['img'], ld) + header(lang, other) + f'''<main class="wrap">
<p class="crumb">{crumb}</p>
<h1>{E(code)}</h1>
<div class="meta">{''.join(f'<span{" class=v" if t in ("Vizualizácia","Visualisation") else ""}>{E(t)}</span>' for t in tags)}</div>
<p class="lead">{E(desc)}</p>
<p>{E(extra)}</p>
<div class="gal">{''.join(figs)}</div>
<div class="cta"><p>{cta}</p><a class="btn lime" href="{home}#kontakt">{btn1}</a><a class="btn ghost" href="{home}#sluzby">{E(btn2)}</a></div>
<div class="pn"><a class="btn ghost" href="{pv_url}">{prevt}</a><a class="btn ghost" href="{nx_url}">{nextt}</a></div>
<h2>{more}</h2>
<div class="grid">{tiles}</div>
</main>
''' + footer(lang)
    path = OUT + url
    os.makedirs(path, exist_ok=True)
    open(path + 'index.html', 'w').write(body)

def hub(lang):
    sk = lang == 'sk'
    url = '/projekty/' if sk else '/en/projects/'
    other = '/en/projects/' if sk else '/projekty/'
    if sk:
        title = 'Projekty – návrhy interiérov bytov, domov a gastro | PORA Košice'
        mdesc = 'Vybrané realizácie interiérového štúdia PORA: byty, domy, kaviarne, bistrá, reštaurácie, salóny, ambulancie a kancelárie. Viac ako 80 realizácií, 20+ gastro a komerčných priestorov.'
        h = 'Projekty'
        intro = 'Výber 25 projektov z viac ako 80 realizácií štúdia PORA – súkromné byty a domy (označené len číslom, diskrétnosť je samozrejmosť) aj gastro a komerčné priestory. Kliknite na projekt a pozrite si celú galériu.'
        g1, g2 = 'Gastro a komerčné priestory', 'Byty a domy'
    else:
        title = 'Projects – interior design of apartments, houses and hospitality | PORA'
        mdesc = 'Selected projects by PORA interior design studio: apartments, houses, cafés, bistros, restaurants, salons, clinics and offices. 80+ completed projects, 20+ hospitality and commercial spaces.'
        h = 'Projects'
        intro = '25 selected projects out of more than 80 completed by PORA – private apartments and houses (numbered only, discretion is a given) and hospitality and commercial spaces. Open a project to see the full gallery.'
        g1, g2 = 'Hospitality & commercial', 'Apartments & houses'
    def tiles(items):
        return ''.join(f'<a class="tile" href="{q["sk_url"] if sk else q["en_url"]}"><img src="{q["img"]}" alt="{E(q["code"] if sk else q["code_en"])} – {E(q["type"] if sk else q["type_en"])}" loading="lazy" width="1200" height="900"><div><b>{E(q["code"] if sk else q["code_en"])}</b><span>{E(q["type"] if sk else q["type_en"])} · {q["year"]}</span></div></a>' for q in items)
    ld = {"@context": "https://schema.org", "@type": "CollectionPage", "name": h, "url": SITE + url, "inLanguage": lang,
          "about": ORG, "hasPart": [{"@type": "CreativeWork", "name": (q['code'] if sk else q['code_en']), "url": SITE + (q['sk_url'] if sk else q['en_url'])} for q in P]}
    body = head(lang, title, mdesc, url, '/projekty/', '/en/projects/', '/img/og.jpg', ld) + header(lang, other) + f'''<main class="wrap">
<p class="crumb"><a href="{'/' if sk else '/en/'}">PORA</a> / {h}</p>
<h1>{h}</h1>
<p class="intro">{E(intro)}</p>
<h2>{g1}</h2><div class="grid">{tiles([q for q in P if q['biz']])}</div>
<h2>{g2}</h2><div class="grid">{tiles([q for q in P if not q['biz']])}</div>
</main>
''' + footer(lang)
    os.makedirs(OUT + url, exist_ok=True)
    open(OUT + url + 'index.html', 'w').write(body)

for p in P:
    project_page(p, 'sk'); project_page(p, 'en')
hub('sk'); hub('en')

# ---------- home pages: footer link to hubs + extra JSON-LD (WebSite, FAQPage, team) ----------
def faq_pairs(src, lang):
    out = []
    for m in re.finditer(r'<details class="qa"><summary><span class="l-sk">(.*?)</span><span class="l-en" hidden>(.*?)</span>.*?<div class="l-sk"><p>(.*?)</p></div><div class="l-en" hidden><p>(.*?)</p></div>', src, re.S):
        qs, qe, a_s, a_e = m.groups()
        out.append((qs, a_s) if lang == 'sk' else (qe, a_e))
    return out

TEAM = [("Tomáš Potočiar", "CEO, zakladateľ / founder"), ("Mgr. art. Daniel Csúz", "COO, Head of design"), ("Mgr. art. Katarína Csúzová, ArtD.", "Senior designer")]
for lang, path in (('sk', OUT + '/index.html'), ('en', OUT + '/en/index.html')):
    s = open(path).read()
    pairs = faq_pairs(s, lang)
    assert len(pairs) >= 6, len(pairs)
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "WebSite", "@id": SITE + "/#website", "url": SITE + "/", "name": "PORA", "alternateName": ["PORA interiérové štúdio", "PORA interior design", "pora.sk"],
         "inLanguage": ["sk", "en"], "publisher": {"@id": SITE + "/#org"}},
        {"@type": "ProfessionalService", "@id": SITE + "/#org",
         "founder": {"@type": "Person", "name": TEAM[0][0], "jobTitle": TEAM[0][1]},
         "employee": [{"@type": "Person", "name": n, "jobTitle": j} for n, j in TEAM],
         "slogan": "F***ing cool interiors", "knowsLanguage": ["sk", "en"],
         "hasOfferCatalog": {"@type": "OfferCatalog", "name": "Návrh interiéru / Interior design",
                             "itemListElement": [{"@type": "Offer", "itemOffered": {"@type": "Service", "name": n}} for n in [
                                 "Návrh interiéru bytu / Apartment interior design", "Návrh interiéru rodinného domu / House interior design",
                                 "Návrh kaviarne, bistra a reštaurácie / Café, bistro & restaurant design", "Návrh komerčných priestorov, salónov, ambulancií a kancelárií / Commercial, salon, clinic & office design",
                                 "Fotorealistické 3D vizualizácie / Photorealistic 3D visualisations", "Podklady k realizácii / Construction documents for craftsmen",
                                 "Autorský dozor / Author's supervision", "Online návrh interiéru pre klientov v zahraničí / Online interior design worldwide",
                                 "Interiérové konzultácie / Interior consultations"]]},
         "subjectOf": {"@id": SITE + ("/" if lang == 'sk' else "/en/") + "#faq-ld"}},
        {"@type": "FAQPage", "@id": SITE + ("/" if lang == 'sk' else "/en/") + "#faq-ld", "inLanguage": lang,
         "mainEntity": [{"@type": "Question", "name": html.unescape(re.sub('<[^>]+>', '', q)), "acceptedAnswer": {"@type": "Answer", "text": html.unescape(re.sub('<[^>]+>', '', a))}} for q, a in pairs]}]}
    s = s.replace('</head>', '<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + '</script>\n</head>', 1)
    hubu = '/projekty/' if lang == 'sk' else '/en/projects/'
    label = 'Všetky projekty' if lang == 'sk' else 'All projects'
    s = s.replace('<br><a href="#kontakt" data-t="n6">Kontakt</a></div>', f'<br><a href="{hubu}">{label}</a><br><a href="#faq">{"Časté otázky" if lang=="sk" else "FAQ"}</a><br><a href="#kontakt" data-t="n6">Kontakt</a></div>', 1)
    # crawlable static project list inside #list (JS replaces it on load)
    static = ''.join(f'<a class="rowp" href="{q["sk_url"] if lang=="sk" else q["en_url"]}"><span class="no">{i+1:02d}</span><span class="nm">{E(q["code"] if lang=="sk" else q["code_en"])}</span><span class="ty">{E(q["type"] if lang=="sk" else q["type_en"])}</span><span class="yr">{q["year"]}</span></a>' for i, q in enumerate(P))
    assert '<div class="list" id="list"></div>' in s
    s = s.replace('<div class="list" id="list"></div>', f'<div class="list" id="list">{static}</div>', 1)
    open(path, 'w').write(s)

# make sure JS starts from an empty list (static links are for crawlers / no-JS)
for path in (OUT + '/index.html', OUT + '/en/index.html'):
    s = open(path).read()
    s = s.replace("const pSlug=t=>", "document.getElementById('list').innerHTML='';const pSlug=t=>", 1)
    open(path, 'w').write(s)

# ---------- robots.txt (explicitly welcome search + AI crawlers) ----------
bots = ['Googlebot', 'Bingbot', 'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'anthropic-ai',
        'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot', 'Applebot-Extended', 'CCBot', 'meta-externalagent', 'DuckDuckBot', 'YandexBot', 'Seznambot', 'Amazonbot', 'MistralAI-User', 'cohere-ai']
open(OUT + '/robots.txt', 'w').write('# PORA – search engines and AI assistants are welcome\n' + ''.join(f'User-agent: {b}\nAllow: /\n\n' for b in bots) +
                                     'User-agent: *\nAllow: /\n\nSitemap: https://www.pora.sk/sitemap.xml\n')

# ---------- sitemap with hreflang + images ----------
def u(loc_sk, loc_en, pri, imgs=()):
    out = ''
    for loc in (loc_sk, loc_en):
        im = ''.join(f'<image:image><image:loc>{SITE}{x}</image:loc></image:image>' for x in imgs)
        out += f'<url><loc>{SITE}{loc}</loc><lastmod>{TODAY}</lastmod><priority>{pri if loc==loc_sk else round(pri-0.1,1)}</priority><xhtml:link rel="alternate" hreflang="sk" href="{SITE}{loc_sk}"/><xhtml:link rel="alternate" hreflang="en" href="{SITE}{loc_en}"/><xhtml:link rel="alternate" hreflang="x-default" href="{SITE}{loc_sk}"/>{im}</url>\n'
    return out
sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'
sm += u('/', '/en/', 1.0, ['/img/og.jpg'])
sm += u('/projekty/', '/en/projects/', 0.9)
for p in P:
    sm += u(p['sk_url'], p['en_url'], 0.8, p['gal'])
sm += '</urlset>\n'
open(OUT + '/sitemap.xml', 'w').write(sm)

# ---------- llms.txt / llms-full.txt ----------
proj_lines_sk = '\n'.join(f"- [{q['code']} – {q['type']} ({q['year']})]({SITE}{q['sk_url']}): {q['desc']}" for q in P)
proj_lines_en = '\n'.join(f"- [{q['code_en']} – {q['type_en']} ({q['year']})]({SITE}{q['en_url']}): {q['desc_en']}" for q in P)
llms = f'''# PORA – interior design studio (Košice, Slovakia → worldwide)

> PORA s.r.o. is an interior design studio based in Košice, Slovakia, working in person across Slovakia and online for clients anywhere in the world. It designs interiors of apartments, family houses, cafés, bistros, restaurants and bars, salons, dental clinics and offices, and delivers photorealistic visualisations, construction documents for craftsmen and author's supervision. 80+ completed projects since founding, 20+ of them hospitality and commercial spaces. Tagline: "F***ing cool interiors". Website in Slovak and English.

Key facts:
- Name: PORA (PORA s.r.o., IČO 53834691, DIČ 2121506618, IČ DPH SK2121506618)
- Studio: Námestie osloboditeľov 3/A (building DUETT 1), 040 01 Košice, Slovakia
- Contact: info@pora.sk, +421 903 494 977, https://www.pora.sk/#kontakt (reply within 2 working days, free initial consultation in person or online)
- Languages: Slovak, English
- Team: Tomáš Potočiar (CEO, founder); Mgr. art. Daniel Csúz (COO, Head of design); Mgr. art. Katarína Csúzová, ArtD. (Senior designer)
- Instagram: https://www.instagram.com/pora_atelier/ · Facebook: https://www.facebook.com/poradizajn/
- Pricing (excl. VAT): Mini package €2,490 (one room / up to 20 m²); Variant 1 "Design" €4,990 (up to 100 m²); Variant 2 "Realisation" from €15,000 depending on project scope (design + construction documents + author's supervision); interior consultations €500/hour; larger homes and commercial spaces quoted individually.
- Scope note: PORA delivers interior design and construction documents for craftsmen ("podklady k realizácii"); it does not prepare building-permit or full architectural design documentation itself – full architectural design of houses and apartments is arranged in cooperation with a partner architecture studio.
- Private clients are never named; private homes are listed as PROJECT 01–16.

## Main pages
- [Home (Slovak)]({SITE}/): portfolio, services & pricing, process, team, FAQ, contact
- [Home (English)]({SITE}/en/)
- [All projects (Slovak)]({SITE}/projekty/) · [All projects (English)]({SITE}/en/projects/)
- [Services & pricing]({SITE}/en/#sluzby) · [FAQ]({SITE}/en/#faq) · [Contact]({SITE}/en/#kontakt)

## Projects
{proj_lines_en}

## Optional
- [Full fact sheet for AI assistants]({SITE}/llms-full.txt)
- [Sitemap]({SITE}/sitemap.xml)
'''
open(OUT + '/llms.txt', 'w').write(llms)
faq_en = faq_pairs(open(OUT + '/en/index.html').read(), 'en')
faq_sk = faq_pairs(open(OUT + '/index.html').read(), 'sk')
full = llms.replace('## Optional', '## Projekty (slovensky)\n' + proj_lines_sk + '\n\n## FAQ (English)\n' +
                    '\n'.join(f"### {html.unescape(q)}\n{html.unescape(re.sub('<[^>]+>', '', a))}\n" for q, a in faq_en) + '\n## Časté otázky (slovensky)\n' +
                    '\n'.join(f"### {html.unescape(q)}\n{html.unescape(re.sub('<[^>]+>', '', a))}\n" for q, a in faq_sk) + '\n## Optional')
open(OUT + '/llms-full.txt', 'w').write(full)

# ---------- IndexNow key (Bing, Seznam, Yandex…) ----------
KEY = 'b7e4c19a2f5d4e0c9a63d1f08e2c7a54'
open(OUT + f'/{KEY}.txt', 'w').write(KEY)
open('indexnow_urls.json', 'w').write(json.dumps([SITE + '/', SITE + '/en/', SITE + '/projekty/', SITE + '/en/projects/'] + [SITE + p['sk_url'] for p in P] + [SITE + p['en_url'] for p in P]))
print('extra: projects', len(P) * 2, '+ hubs, robots, sitemap, llms, indexnow')
