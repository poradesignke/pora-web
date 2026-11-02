import re,os,shutil,json
SRC='site/index.html'; OUT='dist'
s=open(SRC).read()
# strip the artifact-only title line; we create our own head
body=s
body=re.sub(r'^<title>.*?</title>\n','',body)
body=re.sub(r'^<meta name="description"[^>]*>\n','',body)
# remove font links from body (moved to head)
links=re.findall(r'^<link [^>]*>\n',body,flags=re.M)
body=re.sub(r'^<link [^>]*>\n','',body,flags=re.M)
# alt texts for featured cards
body=body.replace('<img src="${p.img}" alt="" loading="${i<2?\'eager\':\'lazy\'}">','<img src="${p.img}" alt="${p.code} – ${p.type} | PORA interiér" loading="${i<2?\'eager\':\'lazy\'}">')
# URL sync of language on real domain
body=body.replace("function setLang(l){LANG=l;const D=l==='en'?EN:SK;document.documentElement.lang=l;",
"function setLang(l){LANG=l;const D=l==='en'?EN:SK;document.documentElement.lang=l;try{if(location.hostname.endsWith('pora.sk')){const want=l==='en'?'/en/':'/';if(location.pathname!==want)history.replaceState(null,'',want+location.hash);}}catch(_){}")
body=body.replace("(function(){let l=null;try{l=localStorage.getItem('pora_lang');}catch(_){}","(function(){let l=window.__LANG||null;if(!l){try{l=localStorage.getItem('pora_lang');}catch(_){}}")
# SEO footer paragraph (bilingual via data-t)
body=body.replace('<div class="bot"><span>© 2026 PORA s.r.o.</span>','<p class="seo" data-t="seo_p">PORA je interiérové štúdio z Košíc: návrh interiéru bytov a rodinných domov, dizajn kaviarní, bistier, reštaurácií, salónov, ambulancií a kancelárií. Fotorealistické vizualizácie, podklady k realizácii a autorský dozor. Pracujeme v Košiciach, po celom Slovensku a online pre klientov kdekoľvek na svete.</p>\n    <div class="bot"><span>© 2026 PORA s.r.o.</span>')
body=body.replace("footer .bot{display:flex;","footer .seo{margin:40px 0 0;font-size:13px;line-height:1.6;color:var(--muted);max-width:820px}\nfooter .bot{display:flex;")
body=body.replace("hero_eyebrow:'Interior design studio · Košice → worldwide',","hero_eyebrow:'Interior design studio · Košice → worldwide',seo_p:'PORA is an interior design studio from Košice, Slovakia: interior design of apartments and family houses, design of cafés, bistros, restaurants, salons, clinics and offices. Photorealistic visualisations, construction documents and author\\'s supervision. We work in Košice, across Slovakia and online for clients anywhere in the world.',")
assert 'seo_p' in body
HEAD_SK='''<!doctype html>
<html lang="sk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>PORA | Interiérový dizajn a návrh interiéru – Košice, Slovensko | F***ing cool interiors</title>
<meta name="description" content="PORA – interiérový dizajn a návrh interiéru, štúdio Košice, celé Slovensko. Návrh interiéru bytov, domov, kaviarní, reštaurácií a kancelárií. Vizualizácie, podklady k realizácii, autorský dozor. Online pre celý svet.">
<link rel="canonical" href="https://www.pora.sk/">
<link rel="alternate" hreflang="sk" href="https://www.pora.sk/">
<link rel="alternate" hreflang="en" href="https://www.pora.sk/en/">
<link rel="alternate" hreflang="x-default" href="https://www.pora.sk/">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="theme-color" content="#FAF9F6">
<meta property="og:type" content="website">
<meta property="og:site_name" content="PORA">
<meta property="og:locale" content="sk_SK">
<meta property="og:locale:alternate" content="en_US">
<meta property="og:title" content="PORA – F***ing cool interiors">
<meta property="og:description" content="Interiérové štúdio Košice. Byty, domy, gastro a komerčné priestory, ktoré nie sú len pekné. Online pre klientov kdekoľvek na svete.">
<meta property="og:url" content="https://www.pora.sk/">
<meta property="og:image" content="https://www.pora.sk/img/og.jpg">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="PORA – F***ing cool interiors">
<meta name="twitter:description" content="Interiérové štúdio Košice · návrh interiéru bytov, domov a gastro priestorov · online worldwide.">
<meta name="twitter:image" content="https://www.pora.sk/img/og.jpg">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=Syne:wght@800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap">
<link rel="preload" as="image" href="/img/POSTER_havanska.jpg">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"ProfessionalService","@id":"https://www.pora.sk/#org","name":"PORA – interiérové štúdio","alternateName":"PORA s.r.o.","url":"https://www.pora.sk/","logo":"https://www.pora.sk/img/logo-coral.png","image":"https://www.pora.sk/img/og.jpg","description":"Interiérové štúdio v Košiciach – návrh interiéru bytov, domov, gastro a komerčných priestorov, vizualizácie, podklady k realizácii a autorský dozor. Online pre klientov po celom svete.","telephone":"+421903494977","email":"info@pora.sk","priceRange":"€€€","vatID":"SK2121506618","taxID":"53834691","address":{"@type":"PostalAddress","streetAddress":"Námestie osloboditeľov 3/A","addressLocality":"Košice","postalCode":"04001","addressCountry":"SK"},"geo":{"@type":"GeoCoordinates","latitude":48.7146,"longitude":21.2559},"areaServed":[{"@type":"Country","name":"Slovakia"},{"@type":"Place","name":"Worldwide"}],"sameAs":["https://www.instagram.com/pora_atelier/","https://www.facebook.com/poradizajn/"],"knowsAbout":["návrh interiéru","interiérový dizajn","dizajn kaviarne","dizajn reštaurácie","návrh bytu","návrh rodinného domu","3D vizualizácie interiéru"],"makesOffer":[{"@type":"Offer","name":"Balík Mini – návrh interiéru do 20 m²","price":"2490","priceCurrency":"EUR"},{"@type":"Offer","name":"Variant 1 Design – návrh interiéru do 100 m²","price":"4990","priceCurrency":"EUR"},{"@type":"Offer","name":"Variant 2 Realizácia – návrh, podklady k realizácii a autorský dozor","price":"15000","priceCurrency":"EUR"},{"@type":"Offer","name":"Interiérové konzultácie","price":"500","priceCurrency":"EUR","unitText":"hodina"}]}
</script>
<style>
:root{color-scheme:dark;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
body{margin:0;background:#0E0E10}
img{max-width:100%}
[hidden]{display:none!important}
</style>
</head>
<body>
'''
HEAD_EN=HEAD_SK.replace('<html lang="sk">','<html lang="en">').replace('<title>PORA | Interiérový dizajn a návrh interiéru – Košice, Slovensko | F***ing cool interiors</title>','<title>PORA | Interior Design Studio Košice, Slovakia – apartments, houses, hospitality | F***ing cool interiors</title>').replace('<meta name="description" content="PORA – interiérový dizajn a návrh interiéru, štúdio Košice, celé Slovensko. Návrh interiéru bytov, domov, kaviarní, reštaurácií a kancelárií. Vizualizácie, podklady k realizácii, autorský dozor. Online pre celý svet.">','<meta name="description" content="PORA – interior design studio in Košice, Slovakia. Interiors of apartments, houses, cafés, restaurants and offices. Visualisations, construction documents, author\'s supervision. Online worldwide.">').replace('<link rel="canonical" href="https://www.pora.sk/">','<link rel="canonical" href="https://www.pora.sk/en/">').replace('<meta property="og:locale" content="sk_SK">\n<meta property="og:locale:alternate" content="en_US">','<meta property="og:locale" content="en_US">\n<meta property="og:locale:alternate" content="sk_SK">').replace('<meta property="og:description" content="Interiérové štúdio Košice. Byty, domy, gastro a komerčné priestory, ktoré nie sú len pekné. Online pre klientov kdekoľvek na svete.">','<meta property="og:description" content="Interior design studio, Košice → worldwide. Apartments, houses, hospitality and commercial spaces that are not just pretty.">').replace('<meta property="og:url" content="https://www.pora.sk/">','<meta property="og:url" content="https://www.pora.sk/en/">').replace('<meta name="twitter:description" content="Interiérové štúdio Košice · návrh interiéru bytov, domov a gastro priestorov · online worldwide.">','<meta name="twitter:description" content="Interior design studio Košice · apartments, houses, hospitality · online worldwide.">').replace('<link rel="preload" as="image" href="/img/POSTER_havanska.jpg">','<link rel="preload" as="image" href="/img/POSTER_havanska.jpg">\n<script>window.__LANG="en"</script>')
API=open('pora_api.txt').read().strip() if os.path.exists('pora_api.txt') else ''
ADS=open('pora_ads.txt').read().split() if os.path.exists('pora_ads.txt') else []
if API:
    HEAD_SK=HEAD_SK.replace('</head>','<script>window.PORA_API="'+API+'"</script>\n</head>');HEAD_EN=HEAD_EN.replace('</head>','<script>window.PORA_API="'+API+'"</script>\n</head>')
if ADS:
    _a='<script>window.PORA_ADS="'+ADS[0]+'";window.PORA_ADS_LABEL="'+(ADS[1] if len(ADS)>1 else '')+'"</script>\n</head>'
    HEAD_SK=HEAD_SK.replace('</head>',_a);HEAD_EN=HEAD_EN.replace('</head>',_a)
# absolute asset paths so /en/ works
b2=body.replace('url(img/','url(/img/').replace("url('img/","url('/img/").replace('src="img/','src="/img/').replace("'img/","'/img/").replace('`img/','`/img/').replace('src="vid/','src="/vid/').replace("'vid/","'/vid/").replace('poster="img/','poster="/img/')
b2=b2.replace("const G=(p,n)=>Array.from({length:n},(_,i)=>`img/","const G=(p,n)=>Array.from({length:n},(_,i)=>`/img/").replace("const G0=(p,n)=>Array.from({length:n},(_,i)=>`img/","const G0=(p,n)=>Array.from({length:n},(_,i)=>`/img/")
TAIL='\n</body>\n</html>\n'
os.makedirs(OUT+'/en',exist_ok=True)
open(OUT+'/index.html','w').write(HEAD_SK+b2+TAIL)
open(OUT+'/en/index.html','w').write(HEAD_EN+b2+TAIL)
# assets
for d in ['img','vid','cp','sk']:
    if os.path.exists(OUT+'/'+d): shutil.rmtree(OUT+'/'+d)
    shutil.copytree('site/'+d,OUT+'/'+d)
# favicon svg (PLUS)
open(OUT+'/favicon.svg','w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0E0E10"/><rect x="24" y="8" width="16" height="48" rx="3" fill="#D1FF05"/><rect x="8" y="24" width="48" height="16" rx="3" fill="#D1FF05"/></svg>')
open(OUT+'/robots.txt','w').write('User-agent: *\nAllow: /\nSitemap: https://www.pora.sk/sitemap.xml\n')
open(OUT+'/sitemap.xml','w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n<url><loc>https://www.pora.sk/</loc><lastmod>2026-10-02</lastmod><changefreq>monthly</changefreq><priority>1.0</priority><xhtml:link rel="alternate" hreflang="sk" href="https://www.pora.sk/"/><xhtml:link rel="alternate" hreflang="en" href="https://www.pora.sk/en/"/></url>\n<url><loc>https://www.pora.sk/en/</loc><lastmod>2026-10-02</lastmod><changefreq>monthly</changefreq><priority>0.9</priority><xhtml:link rel="alternate" hreflang="sk" href="https://www.pora.sk/"/><xhtml:link rel="alternate" hreflang="en" href="https://www.pora.sk/en/"/></url>\n</urlset>\n')
open(OUT+'/CNAME','w').write('www.pora.sk\n')
open(OUT+'/.nojekyll','w').write('')
# redirects from old Wix URLs
old={'1':'projekty/','2':'projekty/','3':'projekty/','4':'projekty/','5':'projekty/','6':'projekty/','copy-of-palko-lorincik':'projekty/','copy-of-palko-lorincik-1':'projekty/','copy-of-panorama':'projekty/','copy-of-4':'projekty/','copy-of-narodna-trieda':'projekty/','copy-of-narodna-trieda-1':'projekty/','copy-of-illes-euforia':'projekty/','copy-of-illes-euforia-1':'projekty/','services-1':'','team-1':'','about':''}
for k,v in old.items():
    os.makedirs(f'{OUT}/{k}',exist_ok=True)
    open(f'{OUT}/{k}/index.html','w').write(f'<!doctype html><html lang="sk"><head><meta charset="utf-8"><title>PORA – interiérový dizajn</title><link rel="canonical" href="https://www.pora.sk/{v}"><meta http-equiv="refresh" content="0;url=/{v}"><script>location.replace("/{v}")</script></head><body><a href="/{v}">PORA – interiérový dizajn</a></body></html>')
open(OUT+'/404.html','w').write('<!doctype html><html lang="sk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>404 – PORA</title><style>body{margin:0;background:#0E0E10;color:#F0EEE9;font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;text-align:center;padding:24px}h1{font-size:clamp(48px,12vw,140px);margin:0;color:#D1FF05;line-height:1}a{display:inline-block;margin-top:24px;background:#D1FF05;color:#111;padding:14px 22px;border-radius:999px;text-decoration:none;font-weight:700}</style></head><body><div><h1>404</h1><p>Táto stránka neexistuje. / This page does not exist.</p><a href="/">Späť na pora.sk →</a></div><script>setTimeout(function(){location.replace("/")},2500)</script></body></html>')
print('built', sum(len(f) for _,_,f in os.walk(OUT)),'files')
exec(open('gen_extra.py').read())
exec(open('gen_local.py').read())
# Google tag (consent mode v2) na všetky podstránky – landing /interierovy-dizajn/, mestá, projekty
if ADS:
    _T=('<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}'
        '(function(){var c;try{c=localStorage.getItem("pora_cookies")}catch(e){}var g=c==="all"?"granted":"denied";'
        'gtag("consent","default",{ad_storage:g,ad_user_data:g,ad_personalization:g,analytics_storage:g,wait_for_update:500});})();'
        'gtag("js",new Date());gtag("config","'+ADS[0]+'");</script>\n'
        '<script async src="https://www.googletagmanager.com/gtag/js?id='+ADS[0]+'"></script>\n</head>')
    _n=0
    for _r,_d,_fs in os.walk(OUT):
        for _f in _fs:
            if not _f.endswith('.html'): continue
            _p=os.path.join(_r,_f); _s=open(_p).read()
            if 'gtag/js' in _s or 'PORA_ADS' in _s or 'name="viewport"' not in _s or 'http-equiv="refresh"' in _s: continue
            open(_p,'w').write(_s.replace('</head>',_T,1)); _n+=1
    print('gtag pridaný na', _n, 'podstránok')
# Výrazný pás na všetkých podstránkach: odkaz na hlavný web + cenová ponuka za pár sekúnd
_BAR = {
 'sk': ('/', 'Toto je len výňatok. Na hlavnom webe nájdete všetky realizácie, ceny a cenovú ponuku do pár sekúnd.', 'Celý web PORA →', 'Cenová ponuka za pár sekúnd →'),
 'en': ('/en/', 'This is just an excerpt. The main site has all our projects, prices and a price quote in seconds.', 'Full PORA website →', 'Price quote in seconds →'),
 'cs': ('/en/', 'Toto je jen výňatek. Na hlavním webu najdete všechny realizace, ceny a cenovou nabídku za pár sekund.', 'Celý web PORA →', 'Cenová nabídka za pár sekund →'),
 'hu': ('/en/', 'Ez csak egy részlet. A fő oldalon minden projektünk, áraink és árajánlat másodpercek alatt.', 'A teljes PORA oldal →', 'Árajánlat másodpercek alatt →'),
 'pl': ('/en/', 'To tylko fragment. Na głównej stronie znajdziesz wszystkie realizacje, ceny i wycenę w kilka sekund.', 'Pełna strona PORA →', 'Wycena w kilka sekund →'),
 'de': ('/en/', 'Das ist nur ein Auszug. Auf der Hauptseite finden Sie alle Projekte, Preise und ein Angebot in Sekunden.', 'Ganze PORA-Website →', 'Angebot in Sekunden →'),
}
_BCSS = ('<style>.porabar{background:#D1FF05;color:#111113;border-bottom:3px solid #111113}'
 '.porabar .in{max-width:1200px;margin:0 auto;padding:18px clamp(16px,4vw,40px);display:flex;flex-wrap:wrap;align-items:center;gap:14px 22px}'
 '.porabar p{margin:0;flex:1 1 320px;font:600 16px/1.4 "DM Sans",system-ui,sans-serif}'
 '.porabar a{display:inline-flex;align-items:center;min-height:48px;padding:12px 22px;border-radius:999px;text-decoration:none;font:900 19px/1 "Big Shoulders Display","Arial Narrow",sans-serif;letter-spacing:.03em;text-transform:uppercase}'
 '.porabar a.full{background:#111113;color:#D1FF05}.porabar a.cp{background:#FAF9F6;color:#111113;border:2px solid #111113}'
 '.porabar a:hover{transform:translateY(-1px)}'
 '.porasticky{position:fixed;left:12px;right:12px;bottom:12px;z-index:90;display:none;justify-content:center;padding:15px 18px;border-radius:999px;background:#111113;color:#D1FF05;text-decoration:none;text-align:center;font:900 18px/1 "Big Shoulders Display","Arial Narrow",sans-serif;letter-spacing:.03em;text-transform:uppercase;box-shadow:0 10px 30px rgba(0,0,0,.35)}'
 '@media (max-width:760px){.porasticky{display:flex}body{padding-bottom:78px}.porabar a{flex:1 1 100%;justify-content:center}}</style>')
_bn = 0
for _r, _d, _fs in os.walk(OUT):
    for _f in _fs:
        if not _f.endswith('.html'): continue
        _p = os.path.join(_r, _f); _s = open(_p).read()
        if '</header>' not in _s or 'id="hero3d"' in _s or 'class="porabar"' in _s or 'http-equiv="refresh"' in _s: continue
        _m = re.search(r'<html lang="([a-z]{2})', _s); _lg = _m.group(1) if _m and _m.group(1) in _BAR else 'sk'
        _home, _txt, _b1, _b2 = _BAR[_lg]
        _html = (f'</header>\n{_BCSS}<div class="porabar"><div class="in"><p>{_txt}</p>'
                 f'<a class="full" href="{_home}">{_b1}</a><a class="cp" href="{_home}#ponuka">{_b2}</a></div></div>'
                 f'<a class="porasticky" href="{_home}#ponuka">{_b2}</a>')
        open(_p, 'w').write(_s.replace('</header>', _html, 1)); _bn += 1
print('pás na hlavný web pridaný na', _bn, 'podstránok')
