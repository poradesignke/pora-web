# PORA – Google Ads kampane (návrh). Validuje dĺžky RSA a vypíše prehľad.
import json
S = 'https://www.pora.sk'
NEG_SK = ['zadarmo', 'free', 'kurz', 'kurzy', 'škola', 'štúdium', 'vysoká škola', 'práca', 'brigáda', 'plat', 'ponuka práce', 'program', 'aplikácia', 'sketchup', 'šablóna', 'pdf', 'ikea', 'bazár', 'svadba', 'auto', 'interiér auta']
NEG_CS = ['zdarma', 'kurz', 'škola', 'studium', 'práce', 'brigáda', 'plat', 'program', 'aplikace', 'sketchup', 'šablona', 'pdf', 'ikea', 'bazar', 'auto']
NEG_PL = ['za darmo', 'darmowy', 'kurs', 'szkoła', 'studia', 'praca', 'wynagrodzenie', 'program', 'aplikacja', 'sketchup', 'szablon', 'pdf', 'ikea', 'olx', 'auto']
NEG_DE = ['kostenlos', 'gratis', 'ausbildung', 'studium', 'kurs', 'job', 'jobs', 'gehalt', 'stellenangebot', 'software', 'programm', 'app', 'sketchup', 'pdf', 'ikea', 'willhaben', 'auto']

def kw(*phr): return [f'"{p}"' for p in phr]

C = []
# ---------------- SLOVENSKO ----------------
def sk_city(name, slug, loc):
    return dict(name=name, url=f'{S}/interierovy-dizajn/{slug}/',
                keywords=kw(f'interiérový dizajn {loc}', f'návrh interiéru {loc}', f'interiérový dizajnér {loc}', f'bytový dizajnér {loc}', f'dizajn interiéru {loc}', f'interiérový architekt {loc}', f'bytový architekt {loc}'))
SK_H = ['Interiérový dizajn PORA', 'Cenová ponuka na počkanie', 'Návrh interiéru od 4 990 €', 'Byty, domy, gastro', '80+ realizácií', '3D vizualizácie interiéru', 'Podklady pre remeselníkov', 'Autorský dozor na stavbe', 'Interiéry, čo si zapamätáte', 'Ponuka v PDF do e-mailu', 'Štúdio PORA Košice', 'Pôsobíme po celom Slovensku', 'Osobne aj online', 'Balík Mini za 2 490 €', 'Dizajn, ktorý si zapamätáte']
SK_D = ['Navrhneme byt, dom aj gastro prevádzku. Vizualizácie, podklady a autorský dozor.',
        'AI asistent na webe vám pošle indikatívnu cenovú ponuku v PDF hneď do e-mailu.',
        'Viac ako 80 realizácií, 20+ kaviarní, reštaurácií a salónov. Pozrite si portfólio.',
        'Zameranie osobne, konzultácie aj online. Ceny transparentne na webe, bez DPH.']
C.append(dict(name='SK – Interiérový dizajn', country='Slovensko', lang='sk', budget_day=10.0, negatives=NEG_SK, headlines=SK_H, descriptions=SK_D, groups=[
    dict(name='SK – všeobecné', url=f'{S}/interierovy-dizajn/', keywords=kw('interiérový dizajn', 'návrh interiéru', 'návrh interiéru bytu', 'návrh interiéru domu', 'interiérový dizajnér', 'interiérový architekt', 'bytový dizajnér', 'bytový architekt', 'dizajn interiéru', 'interiérové štúdio', 'návrh kuchyne a obývačky', 'rekonštrukcia bytu návrh')),
    dict(name='SK – gastro a komercia', url=f'{S}/', keywords=kw('návrh kaviarne', 'dizajn kaviarne', 'návrh reštaurácie', 'dizajn reštaurácie', 'interiér reštaurácie', 'návrh baru', 'interiér kaviarne', 'návrh salónu', 'interiér ambulancie', 'návrh kancelárie', 'dizajn kancelárie')),
    sk_city('Bratislava', 'bratislava', 'bratislava'), sk_city('Košice', 'kosice', 'košice'), sk_city('Prešov', 'presov', 'prešov'),
    sk_city('Žilina', 'zilina', 'žilina'), sk_city('Banská Bystrica', 'banska-bystrica', 'banská bystrica'), sk_city('Nitra', 'nitra', 'nitra'),
    sk_city('Trnava', 'trnava', 'trnava'), sk_city('Trenčín', 'trencin', 'trenčín'), sk_city('Poprad', 'poprad', 'poprad'),
    sk_city('Zvolen', 'zvolen', 'zvolen'), sk_city('Martin', 'martin', 'martin'), sk_city('Michalovce', 'michalovce', 'michalovce'),
    sk_city('Spišská Nová Ves', 'spisska-nova-ves', 'spišská nová ves')]))

# ---------------- ČESKO ----------------
CS_H = ['Interiérový design PORA', 'Cenová nabídka ihned', 'Návrh interiéru od 4 990 €', 'Byty, domy, gastro', '80+ realizací', '3D vizualizace interiéru', 'Podklady pro řemeslníky', 'Autorský dozor', 'Interiéry s charakterem', 'Nabídka v PDF do e-mailu', 'Komunikujeme česky', 'Spolupráce i online', 'Balíček Mini za 2 490 €', 'Design, který si zapamatujete', 'Studio PORA']
CS_D = ['Navrhneme byt, dům i gastro provoz. Vizualizace, podklady pro realizaci a autorský dozor.',
        'AI asistent na webu vám pošle orientační cenovou nabídku v PDF ihned do e-mailu.',
        'Přes 80 realizací, 20+ kaváren, restaurací a salonů. Podívejte se na portfolio.',
        'Konzultace online, zaměření osobně. Ceny transparentně na webu, bez DPH.']
C.append(dict(name='CZ – Interiérový design', country='Česko (Praha, Brno, Ostrava + okolie)', lang='cs', budget_day=2.5, negatives=NEG_CS, headlines=CS_H, descriptions=CS_D, groups=[
    dict(name='CZ – Praha', url=f'{S}/cs/praha/', keywords=kw('interiérový design praha', 'návrh interiéru praha', 'bytový architekt praha', 'interiérový designér praha', 'bytový designér praha')),
    dict(name='CZ – Brno', url=f'{S}/cs/brno/', keywords=kw('interiérový design brno', 'návrh interiéru brno', 'bytový architekt brno', 'interiérový designér brno', 'bytový designér brno')),
    dict(name='CZ – Ostrava', url=f'{S}/cs/ostrava/', keywords=kw('interiérový design ostrava', 'návrh interiéru ostrava', 'bytový architekt ostrava', 'interiérový designér ostrava', 'bytový designér ostrava'))]))

# ---------------- POĽSKO ----------------
PL_H = ['Projektowanie wnętrz PORA', 'Wycena od ręki', 'Projekt wnętrz od 4 990 €', 'Mieszkania, domy, lokale', '80+ realizacji', 'Wizualizacje 3D wnętrz', 'Dokumentacja wykonawcza', 'Nadzór autorski', 'Odważne wnętrza z PORA', 'Wycena w PDF na e-mail', 'Współpraca online', 'Studio z Koszyc', 'Pakiet Mini 2 490 €', 'Wnętrza z charakterem', 'Kraków i Rzeszów']
PL_D = ['Projektujemy mieszkania, domy i lokale gastronomiczne. Wizualizacje i nadzór autorski.',
        'Asystent AI na stronie od razu wyśle Ci orientacyjną wycenę w PDF na e-mail.',
        'Ponad 80 realizacji, w tym 20+ kawiarni, restauracji i salonów. Zobacz portfolio.',
        'Konsultacje online, inwentaryzacja na miejscu. Przejrzyste ceny netto na stronie.']
C.append(dict(name='PL – Projektowanie wnętrz', country='Poľsko (Krakov, Rzeszów, Varšava + okolie)', lang='pl', budget_day=2.5, negatives=NEG_PL, headlines=PL_H, descriptions=PL_D, groups=[
    dict(name='PL – Kraków', url=f'{S}/pl/krakow/', keywords=kw('projektowanie wnętrz kraków', 'projektant wnętrz kraków', 'architekt wnętrz kraków', 'projekt wnętrza kraków', 'projekt mieszkania kraków')),
    dict(name='PL – Rzeszów', url=f'{S}/pl/rzeszow/', keywords=kw('projektowanie wnętrz rzeszów', 'projektant wnętrz rzeszów', 'architekt wnętrz rzeszów', 'projekt wnętrza rzeszów', 'projekt mieszkania rzeszów')),
    dict(name='PL – Warszawa', url=f'{S}/pl/warszawa/', keywords=kw('projektowanie wnętrz warszawa', 'projektant wnętrz warszawa', 'architekt wnętrz warszawa', 'projekt wnętrza warszawa', 'projekt mieszkania warszawa'))]))

# ---------------- RAKÚSKO ----------------
DE_H = ['Interior Design PORA', 'Angebot sofort per E-Mail', 'Innenarchitektur ab 4 990 €', 'Wohnung, Haus, Gastro', '80+ Projekte', '3D-Visualisierungen', 'Ausführungsunterlagen', 'Künstlerische Oberleitung', 'Mutige Interiors von PORA', 'Richtangebot als PDF', 'Beratung auch online', 'Studio aus Košice', 'Paket Mini 2 490 €', 'Räume mit Charakter', 'Interior Design Wien']
DE_D = ['Wir planen Wohnungen, Häuser und Gastronomie. Visualisierungen und Ausführungsunterlagen.',
        'Unser KI-Assistent schickt Ihnen sofort ein unverbindliches Richtangebot als PDF.',
        'Über 80 Projekte, davon 20+ Cafés, Restaurants und Salons. Portfolio ansehen.',
        'Beratung online, Aufmaß vor Ort. Transparente Nettopreise auf der Website.']
C.append(dict(name='AT – Innenarchitektur Wien', country='Rakúsko (Viedeň + 40 km)', lang='de', budget_day=5.0, negatives=NEG_DE, headlines=DE_H, descriptions=DE_D, groups=[
    dict(name='AT – Wien', url=f'{S}/de/wien/', keywords=kw('innenarchitekt wien', 'innenarchitektur wien', 'interior design wien', 'interior designer wien', 'raumplanung wien', 'wohnung einrichten lassen wien', 'innenausbau planung wien'))]))

# ---------------- APARTMÁNY V ZAHRANIČÍ (cielené na SK + CZ) ----------------
AP_H = ['Interiér apartmánu na prenájom', 'Apartmán v Chorvátsku?', 'Investičný byt v Dubaji?', 'Návrh interiéru online', 'Viac hostí, lepšie hodnotenia', 'Cenová ponuka na počkanie', 'Odolné materiály, fotogenické', 'Podklady pre miestnu firmu', '80+ realizácií', 'Štúdio PORA', 'Návrh od 4 990 €', 'Pripravené pre Booking', 'Komunikácia po slovensky', 'Interiér, čo zarába', 'Interiér apartmánu pri mori']
AP_D = ['Interiér apartmánu v Chorvátsku či Dubaji, ktorý vydrží hostí a zaujme na fotkách.',
        'Celý návrh online: pôdorys, vizualizácie, výpis produktov a podklady pre miestnu firmu.',
        'AI asistent na webe vám pošle indikatívnu cenovú ponuku v PDF hneď do e-mailu.',
        'Lepšie fotky, lepšie hodnotenia, vyššia obsadenosť. Pozrite si naše realizácie.']
C.append(dict(name='SK+CZ – Apartmány v zahraničí', country='Slovensko + Česko', lang='sk, cs', budget_day=2.5, negatives=NEG_SK + NEG_CS, headlines=AP_H, descriptions=AP_D, groups=[
    dict(name='Chorvátsko', url=f'{S}/interier-apartmanu-v-zahranici/', keywords=kw('apartmán chorvátsko interiér', 'zariadenie apartmánu chorvátsko', 'apartmán na prenájom interiér', 'návrh interiéru apartmánu', 'interiér apartmánu', 'vybavenie apartmánu na prenájom', 'apartmán chorvatsko interiér', 'zařízení apartmánu chorvatsko', 'návrh interiéru apartmánu chorvatsko')),
    dict(name='Dubaj', url=f'{S}/interier-apartmanu-v-zahranici/', keywords=kw('byt v dubaji zariadenie', 'apartmán dubaj interiér', 'investičný byt dubaj zariadenie', 'byt v dubaji vybavení', 'interiér bytu dubaj'))]))

# ---------------- validácia ----------------
err = []
for c in C:
    for h in c['headlines']:
        if len(h) > 30: err.append((c['name'], 'H', len(h), h))
    for d in c['descriptions']:
        if len(d) > 90: err.append((c['name'], 'D', len(d), d))
    assert len(c['headlines']) <= 15 and len(c['descriptions']) <= 4
if err:
    for e in err: print('PRÍLIŠ DLHÉ', e)
tot = sum(c['budget_day'] for c in C)
for c in C:
    print(f"{c['name']:<32} {c['budget_day']:>5.2f} €/deň ≈ {c['budget_day']*30.4:>4.0f} €/mes · skupín {len(c['groups'])} · kľúč. slov {sum(len(g['keywords']) for g in c['groups'])}")
print(f'SPOLU {tot:.2f} €/deň ≈ {tot*30.4:.0f} €/mes')
json.dump(C, open('/home/claude/pora-cp/ads/campaigns.json', 'w'), ensure_ascii=False, indent=1)
