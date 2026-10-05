# Lokálne SEO stránky: mestá na Slovensku + CZ / HU / PL / AT v ich jazykoch.
# Spúšťa sa z build.py po gen_extra.py (zdieľa OUT, SITE, P, CSS…).
import json, os, html
# (spúšťa sa cez exec v build.py – OUT, SITE, TODAY, P, CSS, E, ORG sú už definované)

LOCAL_CSS = '''
.prices{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px;margin:10px 0 0}
.prices div{background:var(--panel);border-radius:18px;padding:20px}
.prices b{display:block;font:800 22px/1.1 var(--display);text-transform:uppercase}
.prices em{display:block;font-style:normal;color:var(--lime);font:800 26px/1.2 var(--display);margin:8px 0}
.prices span{color:var(--muted);font-size:15px}
.txt{max-width:820px;color:#DDDAE0}
.txt p{margin:0 0 14px}
details{border-top:1px solid var(--line);padding:16px 0;max-width:900px}
details summary{cursor:pointer;font:700 19px/1.3 var(--body)}
details p{color:#DDDAE0;margin:10px 0 0}
.cities{display:flex;flex-wrap:wrap;gap:10px;margin:10px 0 0}
.cities a{border:1.5px solid var(--line);border-radius:999px;padding:10px 16px;text-decoration:none;font-size:15px}
.cities a:hover{border-color:var(--lime);color:var(--lime)}
.cpbox{display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:space-between;border:1.5px solid var(--lime);border-radius:20px;padding:20px 24px;margin:40px 0 0}
.cpbox p{margin:0;max-width:640px}.cpbox b{color:var(--lime)}
'''

# ---------------- texty podľa jazyka ----------------
L = {
 'sk': dict(home='/', cp='/#ponuka', cpbtn='Cenová ponuka na počkanie →', proj='Projekty', projurl='/projekty/', contact='Kontakt',
   cpbox='<b>Cenová ponuka na počkanie:</b> náš AI asistent sa vás na webe spýta na pár vecí a indikatívnu cenovú ponuku v PDF vám hneď pošle e-mailom.',
   prices_h='Služby a ceny', prices=[('Balík Mini', '2 490 €', 'jedna miestnosť do 20 m² · dispozícia, vizualizácie, výber materiálov'),
     ('Variant 1 – Design', 'od 4 990 €', 'byt alebo priestor do 100 m² · zameranie, dispozícia, návrh, vizualizácie, výpis produktov'),
     ('Variant 2 – Realizácia', 'od 15 000 €', 'Design + podklady k realizácii pre remeselníkov + autorský dozor'),
     ('Konzultácia', '500 € / hod', 'osobne alebo online · ceny sú bez DPH')],
   proj_h='Vybrané projekty', faq_h='Časté otázky', more_h='Pôsobíme aj v ďalších mestách', crumb_hub='Interiérový dizajn'),
 'cs': dict(home='/cs/', cp='/en/#ponuka', cpbtn='Cenová nabídka ihned →', proj='Projekty', projurl='/en/projects/', contact='Kontakt',
   cpbox='<b>Cenová nabídka ihned:</b> náš AI asistent se vás na webu zeptá na pár věcí a orientační cenovou nabídku v PDF vám hned pošle e-mailem (asistent komunikuje i česky).',
   prices_h='Služby a ceny', prices=[('Balíček Mini', '2 490 €', 'jedna místnost do 20 m² · dispozice, vizualizace, výběr materiálů'),
     ('Varianta 1 – Design', 'od 4 990 €', 'byt nebo prostor do 100 m² · zaměření, dispozice, návrh, vizualizace, seznam produktů'),
     ('Varianta 2 – Realizace', 'od 15 000 €', 'Design + podklady pro realizaci pro řemeslníky + autorský dozor'),
     ('Konzultace', '500 € / hod', 'osobně nebo online · ceny jsou bez DPH')],
   proj_h='Vybrané projekty', faq_h='Časté dotazy', more_h='Další města', crumb_hub='Česko'),
 'hu': dict(home='/hu/', cp='/en/#ponuka', cpbtn='Azonnali árajánlat →', proj='Projektek', projurl='/en/projects/', contact='Kapcsolat',
   cpbox='<b>Azonnali árajánlat:</b> AI asszisztensünk néhány kérdést tesz fel a weboldalon, majd a tájékoztató árajánlatot PDF-ben azonnal elküldi e-mailben (magyarul is kommunikál).',
   prices_h='Szolgáltatások és árak', prices=[('Mini csomag', '2 490 €', 'egy helyiség 20 m²-ig · alaprajz, látványtervek, anyagválasztás'),
     ('1. változat – Design', '4 990 €-tól', 'lakás vagy helyiség 100 m²-ig · felmérés, alaprajz, belsőépítészeti terv, látványtervek, terméklista'),
     ('2. változat – Kivitelezés', '15 000 €-tól', 'Design + kiviteli dokumentáció a szakembereknek + tervezői művezetés'),
     ('Konzultáció', '500 € / óra', 'személyesen vagy online · az árak ÁFA nélkül értendők')],
   proj_h='Válogatott projektek', faq_h='Gyakori kérdések', more_h='További városok', crumb_hub='Magyarország'),
 'pl': dict(home='/pl/', cp='/en/#ponuka', cpbtn='Wycena od ręki →', proj='Projekty', projurl='/en/projects/', contact='Kontakt',
   cpbox='<b>Wycena od ręki:</b> nasz asystent AI zada na stronie kilka pytań i od razu wyśle orientacyjną wycenę w PDF na Twój e-mail (rozmawia także po polsku).',
   prices_h='Usługi i ceny', prices=[('Pakiet Mini', '2 490 €', 'jedno pomieszczenie do 20 m² · układ funkcjonalny, wizualizacje, dobór materiałów'),
     ('Wariant 1 – Design', 'od 4 990 €', 'mieszkanie lub lokal do 100 m² · inwentaryzacja, układ, projekt wnętrza, wizualizacje, lista produktów'),
     ('Wariant 2 – Realizacja', 'od 15 000 €', 'Design + dokumentacja wykonawcza dla ekip + nadzór autorski'),
     ('Konsultacja', '500 € / godz.', 'osobiście lub online · ceny netto (bez VAT)')],
   proj_h='Wybrane projekty', faq_h='Najczęstsze pytania', more_h='Inne miasta', crumb_hub='Polska'),
 'de': dict(home='/de/', cp='/en/#ponuka', cpbtn='Sofort-Angebot →', proj='Projekte', projurl='/en/projects/', contact='Kontakt',
   cpbox='<b>Angebot sofort:</b> Unser KI-Assistent stellt Ihnen auf der Website ein paar Fragen und schickt Ihnen das unverbindliche Richtangebot als PDF sofort per E-Mail (er spricht auch Deutsch).',
   prices_h='Leistungen und Preise', prices=[('Paket Mini', '2 490 €', 'ein Raum bis 20 m² · Grundriss, Visualisierungen, Materialauswahl'),
     ('Variante 1 – Design', 'ab 4 990 €', 'Wohnung oder Fläche bis 100 m² · Aufmaß, Grundriss, Entwurf, Visualisierungen, Produktliste'),
     ('Variante 2 – Umsetzung', 'ab 15 000 €', 'Design + Ausführungsunterlagen für Handwerker + künstlerische Oberleitung'),
     ('Beratung', '500 € / Std.', 'persönlich oder online · Preise netto (ohne MwSt.)')],
   proj_h='Ausgewählte Projekte', faq_h='Häufige Fragen', more_h='Weitere Städte', crumb_hub='Österreich'),
}

# ---------------- Slovensko ----------------
SK_HUB = ('/interierovy-dizajn/', 'Interiérový dizajn Slovensko')
SK = [
 # slug, mesto, "v meste", km z Košíc, lokálny odsek
 ('bratislava', 'Bratislava', 'v Bratislave', 400,
  'Bratislava je dnes trh plný novostavieb, od veľkých projektov v nových štvrtiach až po menšie rezidencie na Kolibe či v Ružinove. Pri bytoch v novostavbe riešime najmä dispozíciu, kuchyňu, úložné priestory a svetlo, aby byt nepôsobil ako katalógový štandard. V Starom Meste a v pamiatkovej zóne pracujeme s historickými bytmi, kde sa novým interiérom snažíme zachovať charakter domu. Na sídliskách, napríklad v Petržalke, sú najčastejšie kompletné rekonštrukcie panelákových bytov.',
  'Bratislavskí klienti s nami často komunikujú online: konzultácie a odsúhlasovanie návrhu robíme cez videohovor, zameranie a kľúčové stretnutia osobne.'),
 ('kosice', 'Košice', 'v Košiciach', 0,
  'Košice sú náš domov. Štúdio máme na Námestí osloboditeľov v budove DUETT 1, pár krokov od Hlavnej. Navrhujeme byty v historickom centre aj na sídliskách ako Terasa, KVP či Dargovských hrdinov, rodinné domy v okolí mesta a veľkú časť našich gastro projektov: kaviarne, bistrá, reštaurácie a bary.',
  'V Košiciach sa vieme stretnúť u nás v štúdiu, u vás doma alebo priamo na stavbe. Cestovné v rámci mesta neúčtujeme.'),
 ('presov', 'Prešov', 'v Prešove', 36,
  'Do Prešova to máme z Košíc necelú pol hodinu, takže zameranie, stretnutia aj autorský dozor robíme osobne bez problémov. Navrhujeme byty na sídliskách ako Sekčov či Sídlisko III, novostavby v meste aj rodinné domy v obciach okolo Prešova, kde sa veľa nových domov stavia práve teraz.',
  'Vďaka krátkej vzdialenosti je spolupráca v Prešove rovnako plynulá ako v Košiciach.'),
 ('zilina', 'Žilina', 'v Žiline', 245,
  'Žilina rastie a s ňou aj počet nových bytov a domov. Pracujeme na bytoch na Vlčincoch, Hlinách či Solinkách, v novostavbách aj v rodinných domoch v okolí. Pre podnikateľov navrhujeme prevádzky, ktoré majú vlastnú tvár, od kaviarne v centre až po kanceláriu.',
  'Do Žiliny chodíme na zameranie a dôležité stretnutia osobne, priebežné konzultácie robíme online.'),
 ('banska-bystrica', 'Banská Bystrica', 'v Banskej Bystrici', 215,
  'V Banskej Bystrici sa stretáva historické centrum okolo Námestia SNP so sídliskami ako Fončorda, Sásová či Radvaň a s novými domami pod horami. Pri starších bytoch riešime rekonštrukcie a lepšie využitie priestoru, pri domoch prepojenie interiéru so záhradou a výhľadom.',
  'Do Banskej Bystrice dochádzame na zameranie a kľúčové stretnutia, zvyšok spolupráce prebieha online.'),
 ('nitra', 'Nitra', 'v Nitre', 315,
  'Nitra je mesto, kde sa veľa stavia, od nových bytových domov až po rodinné domy pod Zoborom. Robíme dispozície novostavieb, rekonštrukcie bytov na Klokočine či Chrenovej a interiéry prevádzok, ktoré sa majú odlíšiť od konkurencie.',
  'Do Nitry chodíme na zameranie a dôležité stretnutia osobne, konzultácie robíme cez videohovor.'),
 ('trnava', 'Trnava', 'v Trnave', 350,
  'Trnava, „malý Rím“, spája historické centrum s rýchlo rastúcimi novými štvrťami. Veľa Trnavčanov kupuje byt v novostavbe alebo stavia dom v okolí, a práve tam pomáhame s dispozíciou, materiálmi a svetlom, aby priestor fungoval aj vyzeral výnimočne.',
  'Do Trnavy dochádzame na zameranie a kľúčové stretnutia, ostatné riešime online.'),
 ('trencin', 'Trenčín', 'v Trenčíne', 300,
  'Trenčín, Európske hlavné mesto kultúry 2026, žije novými projektmi a podnikmi. Navrhujeme byty na Juhu aj v centre pod hradom, rodinné domy v okolí a gastro či komerčné priestory, ktoré majú ľudí zaujať od prvého pohľadu.',
  'Do Trenčína chodíme na zameranie a dôležité stretnutia osobne, priebežne komunikujeme online.'),
 ('poprad', 'Poprad', 'v Poprade', 120,
  'Poprad a Vysoké Tatry sú špecifické: okrem bytov a domov tu navrhujeme aj apartmány na prenájom a chaty, kde musí interiér vydržať veľa hostí a zároveň dobre vyzerať na fotkách v rezervačných portáloch. Pri trvalom bývaní riešime byty na sídliskách aj rodinné domy pod Tatrami.',
  'Z Košíc to máme do Popradu necelé dve hodiny, takže osobné stretnutia aj autorský dozor sú bežnou súčasťou spolupráce.'),
 ('zvolen', 'Zvolen', 'vo Zvolene', 200,
  'Vo Zvolene navrhujeme byty na sídliskách ako Západ či Sekier, rodinné domy v okolí a menšie prevádzky. Pri rekonštrukciách starších bytov hľadáme, kde sa dá získať priestor a svetlo bez veľkých stavebných zásahov.',
  'Do Zvolena dochádzame na zameranie a kľúčové stretnutia, ostatné konzultácie robíme online.'),
 ('martin', 'Martin', 'v Martine', 220,
  'V Martine a v Turci navrhujeme byty na Ľadovni, v Košútoch aj v centre, rodinné domy pod Martinskými hoľami a interiéry prevádzok. Klienti od nás dostanú návrh, ktorý vychádza z ich života, nie z katalógu.',
  'Do Martina chodíme na zameranie a dôležité stretnutia osobne, zvyšok spolupráce prebieha online.'),
 ('michalovce', 'Michalovce', 'v Michalovciach', 60,
  'Michalovce a Zemplín máme blízko. Navrhujeme byty a rodinné domy v meste aj v okolí a tiež rekreačné chaty a apartmány pri Zemplínskej šírave, kde má interiér pôsobiť uvoľnene, ale vydržať intenzívne používanie.',
  'Do Michaloviec je to z Košíc približne hodina, takže stretnutia aj autorský dozor robíme osobne.'),
 ('spisska-nova-ves', 'Spišská Nová Ves', 'v Spišskej Novej Vsi', 95,
  'Spišská Nová Ves je bránou do Slovenského raja. Navrhujeme byty a rodinné domy v meste a okolí, ale aj chaty a ubytovanie pre turistov, kde chcú majitelia interiér, ktorý hostia nezabudnú a radi sa vrátia.',
  'Do Spišskej Novej Vsi je to z Košíc asi hodina cesty, preto väčšinu stretnutí robíme osobne.'),
]

def sk_faq(name, loc, km):
    travel = ('Áno. Zameranie a kľúčové stretnutia robíme osobne, konzultácie a odsúhlasovanie návrhu môžu prebiehať aj online. '
              f'Cestovné mimo Košíc účtujeme 18 € za hodinu a 0,50 € za kilometer (z Košíc je to do mesta {name} približne {km} km), presnú sumu uvedieme v ponuke.') if km else \
             'Áno, v Košiciach sa stretneme v štúdiu, u vás doma alebo na stavbe. Cestovné v rámci mesta neúčtujeme.'
    return [
     (f'Navrhujete interiéry aj {loc}?', travel),
     (f'Koľko stojí návrh interiéru {loc}?', 'Ceny sú rovnaké pre celé Slovensko: Balík Mini 2 490 € (do 20 m²), Variant 1 Design od 4 990 € (do 100 m², nad 100 m² podľa výmery) a Variant 2 Realizácia od 15 000 €. Ceny sú bez DPH. Presnú indikatívnu ponuku vám pripraví náš asistent na webe na počkanie.'),
     ('Ako dlho trvá návrh interiéru?', 'Balík Mini spravidla 2 až 4 týždne, Variant 1 Design 8 až 12 týždňov a technická dokumentácia ďalších 4 až 6 týždňov. Termíny závisia aj od rýchlosti spätnej väzby a od dodávateľov.'),
     ('Robíte aj projekt pre stavebné povolenie?', 'Nie, navrhujeme interiér a dodávame podklady k realizácii pre remeselníkov a autorský dozor. Projekt stavby a vybavenie stavebného povolenia zabezpečí naše partnerské projekčné štúdio, ktoré ho nacení samostatne.'),
    ]

# ---------------- zahraničie ----------------
# lang: (hub slug, hub title, hub h1, hub intro, hub meta desc, [cities], faq)
INTL = {
 'cs': dict(country='Česko', h1='Interiérový design Česko',
   title='Interiérový design a návrh interiéru – Praha, Brno, Ostrava | PORA',
   desc='Interiérové studio PORA navrhuje byty, domy, kavárny a restaurace pro klienty v Česku. Návrh interiéru, vizualizace, podklady pro realizaci. Cenová nabídka ihned.',
   intro='PORA je interiérové studio z Košic, které navrhuje interiéry bytů, rodinných domů, kaváren, bister, restaurací a kanceláří. Pro klienty v Česku pracujeme převážně online: konzultace a odsouhlasení návrhu řešíme přes videohovor, na zaměření a klíčové schůzky přijedeme osobně. Komunikujeme česky i slovensky, takže spolupráce je stejně snadná jako doma.',
   cities=[('praha', 'Praha', 'v Praze', 'Praha nabízí obrovskou škálu prostorů: od činžovních bytů na Vinohradech a v Holešovicích přes nové developerské projekty až po vily na okraji města. Navrhujeme interiéry, které využijí každý metr a zároveň mají vlastní charakter, a pro podnikatele prostory, které se zapíšou do paměti.'),
           ('brno', 'Brno', 'v Brně', 'Brno je od Košic i od Bratislavy dobře dostupné. Navrhujeme byty v centru a v nových čtvrtích, rodinné domy v okolí a kavárny či bistra, kterých v Brně stále přibývá a kde rozhoduje originální interiér.'),
           ('ostrava', 'Ostrava', 'v Ostravě', 'Ostrava je nám geograficky blízko. Navrhujeme rekonstrukce bytů v Porubě i v centru, novostavby a rodinné domy v Moravskoslezském kraji a interiéry provozoven, které mají odvahu být jiné.')],
   faq=[('Pracujete i pro klienty v Česku?', 'Ano. Konzultace a odsouhlasení návrhu probíhají online, na zaměření a klíčové schůzky přijedeme osobně. Cestovné účtujeme 18 € za hodinu a 0,50 € za kilometr, přesnou částku uvedeme v nabídce.'),
        ('V jaké měně jsou ceny?', 'Ceny uvádíme v eurech bez DPH. Fakturujeme jako slovenská společnost PORA s.r.o.'),
        ('Děláte i projekt pro stavební povolení?', 'Ne. Navrhujeme interiér a dodáváme podklady pro realizaci pro řemeslníky a autorský dozor. Projekt stavby zajistí partnerské projekční studio.')]),
 'hu': dict(country='Magyarország', h1='Belsőépítészet Magyarország',
   title='Belsőépítész és lakberendezés – Budapest, Miskolc, Debrecen | PORA',
   desc='A PORA belsőépítészeti stúdió lakásokat, házakat, kávézókat és éttermeket tervez magyarországi ügyfeleknek. Belsőépítészeti terv, látványtervek, kiviteli dokumentáció. Azonnali árajánlat.',
   intro='A PORA egy kassai (Košice) belsőépítészeti stúdió, amely lakások, családi házak, kávézók, bisztrók, éttermek és irodák belső tereit tervezi. Kassa közvetlenül a magyar határ mellett fekszik, Miskolc alig másfél órára van tőlünk. Magyarországi ügyfeleinkkel a konzultációkat és a terv jóváhagyását online intézzük, a felmérésre és a fontos egyeztetésekre személyesen érkezünk.',
   cities=[('budapest', 'Budapest', 'Budapesten', 'Budapesten a belvárosi polgári lakásoktól az új építésű lakóparkokig és a budai villákig sokféle térrel dolgozunk. Olyan belső tereket tervezünk, amelyek minden négyzetmétert kihasználnak, és mégis egyedi karakterük van, vállalkozóknak pedig emlékezetes vendéglátóhelyeket és üzleteket.'),
           ('miskolc', 'Miskolc', 'Miskolcon', 'Miskolc közel van hozzánk, ezért a felmérés, a személyes egyeztetések és a tervezői művezetés is gördülékenyen megy. Tervezünk lakásfelújításokat, új építésű lakásokat, családi házakat Miskolc környékén, valamint kávézókat és üzleteket.'),
           ('debrecen', 'Debrecen', 'Debrecenben', 'Debrecen gyorsan fejlődik, egyre több az új lakás és családi ház. Segítünk az alaprajzban, az anyagválasztásban és a fényekben, hogy az otthon jól működjön és különleges is legyen, a vállalkozásoknak pedig karakteres belső teret tervezünk.')],
   faq=[('Dolgoznak magyarországi ügyfeleknek is?', 'Igen. A konzultációk és a terv jóváhagyása online zajlanak, a felmérésre és a fontos egyeztetésekre személyesen érkezünk. Az utazási költség 18 € óránként és 0,50 € kilométerenként, a pontos összeget az ajánlatban feltüntetjük.'),
        ('Milyen pénznemben vannak az árak?', 'Az árakat euróban, ÁFA nélkül adjuk meg. A számlát a szlovák PORA s.r.o. állítja ki.'),
        ('Készítenek engedélyezési tervet is?', 'Nem. Belsőépítészeti tervet, kiviteli dokumentációt és tervezői művezetést biztosítunk. Az épület engedélyezési tervét partner tervezőirodánk készíti el.')]),
 'pl': dict(country='Polska', h1='Projektowanie wnętrz Polska',
   title='Projektowanie wnętrz – Kraków, Rzeszów, Warszawa | PORA',
   desc='Studio PORA projektuje wnętrza mieszkań, domów, kawiarni i restauracji dla klientów w Polsce. Projekt wnętrza, wizualizacje, dokumentacja wykonawcza. Wycena od ręki.',
   intro='PORA to studio projektowania wnętrz z Koszyc (Słowacja), które projektuje mieszkania, domy jednorodzinne, kawiarnie, bistra, restauracje i biura. Z klientami w Polsce pracujemy głównie online: konsultacje i akceptację projektu prowadzimy przez wideorozmowę, a na inwentaryzację i kluczowe spotkania przyjeżdżamy osobiście.',
   cities=[('krakow', 'Kraków', 'w Krakowie', 'W Krakowie projektujemy wnętrza kamienic na Kazimierzu i Starym Mieście, mieszkań w nowych inwestycjach i domów pod miastem. Tworzymy przestrzenie, które wykorzystują każdy metr, a jednocześnie mają własny charakter, a dla przedsiębiorców lokale, które zapadają w pamięć.'),
           ('rzeszow', 'Rzeszów', 'w Rzeszowie', 'Rzeszów jest od Koszyc oddalony o kilka godzin jazdy i dynamicznie się rozwija. Projektujemy mieszkania w nowych osiedlach, domy jednorodzinne na Podkarpaciu oraz kawiarnie i lokale usługowe, które mają wyróżniać się na tle konkurencji.'),
           ('warszawa', 'Warszawa', 'w Warszawie', 'Warszawa to rynek pełen nowych inwestycji i wymagających klientów. Projektujemy mieszkania w nowych budynkach, apartamenty w kamienicach i lokale gastronomiczne, a współpraca w dużej mierze odbywa się online.')],
   faq=[('Czy pracujecie dla klientów w Polsce?', 'Tak. Konsultacje i akceptacja projektu odbywają się online, a na inwentaryzację i kluczowe spotkania przyjeżdżamy osobiście. Koszty dojazdu to 18 € za godzinę i 0,50 € za kilometr, dokładną kwotę podajemy w ofercie.'),
        ('W jakiej walucie są ceny?', 'Ceny podajemy w euro netto (bez VAT). Fakturę wystawia słowacka spółka PORA s.r.o.'),
        ('Czy przygotowujecie projekt budowlany?', 'Nie. Przygotowujemy projekt wnętrza, dokumentację wykonawczą dla ekip i nadzór autorski. Projekt budowlany zapewnia nasze partnerskie biuro projektowe.')]),
 'de': dict(country='Österreich', h1='Innenarchitektur Österreich',
   title='Innenarchitektur und Interior Design – Wien | PORA',
   desc='Das Interior-Design-Studio PORA plant Wohnungen, Häuser, Cafés und Restaurants für Kunden in Österreich und Wien. Entwurf, Visualisierungen, Ausführungsunterlagen. Angebot sofort.',
   intro='PORA ist ein Interior-Design-Studio aus Košice (Slowakei) und plant Wohnungen, Einfamilienhäuser, Cafés, Bistros, Restaurants und Büros. Mit Kunden in Österreich arbeiten wir überwiegend online: Beratungen und Entwurfsabstimmungen per Videocall, zum Aufmaß und zu wichtigen Terminen kommen wir persönlich.',
   cities=[('wien', 'Wien', 'in Wien', 'In Wien planen wir Altbauwohnungen mit hohen Decken genauso wie Neubauwohnungen und Dachgeschossausbauten. Wir entwerfen Räume, die jeden Quadratmeter nutzen und trotzdem Charakter haben, und für Unternehmer Lokale, die man nicht vergisst. Von Bratislava aus ist Wien in einer Stunde erreichbar.')],
   faq=[('Arbeiten Sie auch für Kunden in Österreich?', 'Ja. Beratungen und Entwurfsabstimmungen finden online statt, zum Aufmaß und zu wichtigen Terminen kommen wir persönlich. Reisekosten: 18 € pro Stunde und 0,50 € pro Kilometer, den genauen Betrag nennen wir im Angebot.'),
        ('In welcher Währung sind die Preise?', 'Die Preise verstehen sich in Euro netto (ohne MwSt.). Die Rechnung stellt die slowakische PORA s.r.o. aus.'),
        ('Erstellen Sie auch Einreichpläne?', 'Nein. Wir liefern den Innenraumentwurf, Ausführungsunterlagen für Handwerker und die künstlerische Oberleitung. Einreichplanung übernimmt unser Partner-Planungsbüro.')]),
}
CITY_TITLE = {'cs': ('Interiérový design {c}', 'Interiérový design a bytový architekt {c} | PORA', 'Návrh interiéru {loc}: byty, domy, kavárny a restaurace. Vizualizace, podklady pro realizaci, autorský dozor. Cenová nabídka ihned. PORA studio.'),
              'hu': ('Belsőépítész {c}', 'Belsőépítész és lakberendezés {c} | PORA', 'Belsőépítészet {loc}: lakások, házak, kávézók és éttermek. Látványtervek, kiviteli dokumentáció, tervezői művezetés. Azonnali árajánlat. PORA stúdió.'),
              'pl': ('Projektowanie wnętrz {c}', 'Projektowanie wnętrz {c} – architekt wnętrz | PORA', 'Projektowanie wnętrz {loc}: mieszkania, domy, kawiarnie i restauracje. Wizualizacje, dokumentacja wykonawcza, nadzór autorski. Wycena od ręki. Studio PORA.'),
              'de': ('Innenarchitekt {c}', 'Innenarchitekt und Interior Design {c} | PORA', 'Interior Design {loc}: Wohnungen, Häuser, Cafés und Restaurants. Visualisierungen, Ausführungsunterlagen, Oberleitung. Sofort-Angebot. Studio PORA.')}
SEC = {'cs': ('Jak pracujeme {loc}', 'Konzultace a odsouhlasení návrhu probíhají online, na zaměření a klíčové schůzky přijedeme osobně. Výsledkem je návrh, vizualizace a podklady, podle kterých řemeslníci interiér postaví.'),
       'hu': ('Hogyan dolgozunk {loc}', 'A konzultációk és a terv jóváhagyása online zajlanak, a felmérésre és a fontos egyeztetésekre személyesen érkezünk. Az eredmény a terv, a látványtervek és a kiviteli dokumentáció, amely alapján a szakemberek megvalósítják a belső teret.'),
       'pl': ('Jak pracujemy {loc}', 'Konsultacje i akceptacja projektu odbywają się online, na inwentaryzację i kluczowe spotkania przyjeżdżamy osobiście. Efektem jest projekt, wizualizacje i dokumentacja, według której ekipy zrealizują wnętrze.'),
       'de': ('So arbeiten wir {loc}', 'Beratungen und Entwurfsabstimmungen laufen online, zum Aufmaß und zu wichtigen Terminen kommen wir persönlich. Sie erhalten Entwurf, Visualisierungen und Ausführungsunterlagen, nach denen die Handwerker Ihr Interieur umsetzen.')}
HUB_LBL = {'cs': 'Města', 'hu': 'Városok', 'pl': 'Miasta', 'de': 'Städte'}
WHAT = {'cs': ('Co navrhujeme', 'Byty a rodinné domy, novostavby i rekonstrukce, kavárny, bistra, restaurace a bary, salony, ordinace a kanceláře. Za námi je přes 80 realizací, z toho více než 20 gastro a komerčních prostorů.'),
        'hu': ('Mit tervezünk', 'Lakásokat és családi házakat, új építésű és felújítandó tereket, kávézókat, bisztrókat, éttermeket és bárokat, szalonokat, rendelőket és irodákat. Több mint 80 megvalósult projekt, ebből több mint 20 vendéglátó- és üzlethelyiség.'),
        'pl': ('Co projektujemy', 'Mieszkania i domy jednorodzinne, nowe budownictwo i remonty, kawiarnie, bistra, restauracje i bary, salony, gabinety i biura. Ponad 80 zrealizowanych projektów, w tym ponad 20 lokali gastronomicznych i komercyjnych.'),
        'de': ('Was wir planen', 'Wohnungen und Einfamilienhäuser, Neubau und Sanierung, Cafés, Bistros, Restaurants und Bars, Salons, Praxen und Büros. Über 80 realisierte Projekte, davon mehr als 20 Gastronomie- und Gewerbeflächen.')}

# ---------------- HTML ----------------
def page(lang, url, title, desc, h1, eyebrow, body_html, ld, crumbs):
    t = L[lang]
    hd = f'''<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{E(title)}</title>
<meta name="description" content="{E(desc)}">
<link rel="canonical" href="{SITE}{url}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="theme-color" content="#0E0E10">
<meta property="og:type" content="website"><meta property="og:site_name" content="PORA"><meta property="og:locale" content="{ {'sk':'sk_SK','cs':'cs_CZ','hu':'hu_HU','pl':'pl_PL','de':'de_AT'}[lang] }">
<meta property="og:title" content="{E(title)}"><meta property="og:description" content="{E(desc)}">
<meta property="og:url" content="{SITE}{url}"><meta property="og:image" content="{SITE}/img/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
<style>{CSS}{LOCAL_CSS}</style>
</head>
<body>
<header><div class="wrap"><a href="{t['home']}" aria-label="PORA"><img src="/img/logo-coral.png" alt="PORA" width="900" height="243"></a>
<nav><a class="btn ghost" href="{t['projurl']}">{t['proj']}</a><a class="btn lime" href="{t['cp']}">{t['cpbtn']}</a></nav></div></header>
<main class="wrap">
<p class="crumb">{' / '.join(f'<a href="{u}">{E(n)}</a>' if u else E(n) for n, u in crumbs)}</p>
<h1>{E(h1)}</h1>
<div class="meta"><span>{E(eyebrow)}</span></div>
{body_html}
</main>
'''
    foot = f'''<footer><div class="wrap"><span>© 2026 PORA s.r.o. · Košice → worldwide</span><span><a href="mailto:info@pora.sk">info@pora.sk</a> · <a href="tel:+421903494977">+421 903 494 977</a> · Námestie osloboditeľov 3/A, 040 01 Košice, SK</span><span><a href="/">SK</a> · <a href="/en/">EN</a> · <a href="/cs/">CZ</a> · <a href="/hu/">HU</a> · <a href="/pl/">PL</a> · <a href="/de/">AT</a> · <a href="/interierovy-dizajn/">Interiérový dizajn Slovensko</a></span></div></footer>
</body></html>
'''
    os.makedirs(OUT + url, exist_ok=True)
    open(OUT + url + 'index.html', 'w').write(hd + foot)

def prices_html(lang):
    t = L[lang]
    return f'<h2>{t["prices_h"]}</h2><div class="prices">' + ''.join(f'<div><b>{E(a)}</b><em>{E(b)}</em><span>{E(c)}</span></div>' for a, b, c in t['prices']) + '</div>'

def tiles_html(lang, n=6):
    sk = lang == 'sk'
    items = [q for q in P if q['biz']][:3] + [q for q in P if not q['biz']][:3]
    return f'<h2>{L[lang]["proj_h"]}</h2><div class="grid">' + ''.join(
        f'<a class="tile" href="{q["sk_url"] if sk else q["en_url"]}"><img src="{q["img"]}" alt="{E(q["code"] if sk else q["code_en"])}" loading="lazy" width="1200" height="900"><div><b>{E(q["code"] if sk else q["code_en"])}</b><span>{E(q["type"] if sk else q["type_en"])} · {q["year"]}</span></div></a>' for q in items[:n]) + '</div>'

def faq_html(lang, pairs):
    return f'<h2>{L[lang]["faq_h"]}</h2>' + ''.join(f'<details><summary>{E(q)}</summary><p>{E(a)}</p></details>' for q, a in pairs)

def cpbox(lang):
    t = L[lang]
    return f'<div class="cpbox"><p>{t["cpbox"]}</p><a class="btn lime" href="{t["cp"]}">{t["cpbtn"]}</a></div>'

def ld_service(lang, url, name, desc, area, faq):
    return {"@context": "https://schema.org", "@graph": [
        {"@type": "Service", "@id": SITE + url + "#service", "name": name, "description": desc, "serviceType": "Interior design",
         "provider": {"@type": "ProfessionalService", "@id": SITE + "/#org", "name": "PORA", "url": SITE + "/", "telephone": "+421903494977", "email": "info@pora.sk",
                      "address": {"@type": "PostalAddress", "streetAddress": "Námestie osloboditeľov 3/A", "postalCode": "040 01", "addressLocality": "Košice", "addressCountry": "SK"}},
         "areaServed": area, "inLanguage": lang, "url": SITE + url,
         "offers": {"@type": "AggregateOffer", "priceCurrency": "EUR", "lowPrice": "500", "highPrice": "20000"}},
        {"@type": "FAQPage", "inLanguage": lang, "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]}]}

URLS = []
# --- Slovensko: hub + mestá
hub_url, hub_name = SK_HUB
links_sk = ''.join(f'<a href="{hub_url}{s}/">Interiérový dizajn {E(c)}</a>' for s, c, *_ in SK)
for slug, city, loc, km, local, how in SK:
    url = f'{hub_url}{slug}/'
    title = f'Interiérový dizajn {city} – návrh interiéru bytu a domu | PORA'
    desc = f'Interiérový dizajn {loc}: návrh interiéru bytov, domov, kaviarní a prevádzok. Vizualizácie, podklady k realizácii, autorský dozor. Cenová ponuka na počkanie. Štúdio PORA.'
    faq = sk_faq(city, loc, km)
    body = (f'<p class="lead">Interiérový dizajn {E(loc)}: navrhujeme byty, rodinné domy, kaviarne, reštaurácie, salóny a kancelárie. '
            f'Od dispozície a vizualizácií až po podklady pre remeselníkov a autorský dozor na stavbe.</p>'
            f'<div class="txt"><p>{E(local)}</p></div>' + cpbox('sk') +
            f'<h2>Ako pracujeme {E(loc)}</h2><div class="txt"><p>{E(how)} Výsledkom je návrh interiéru, fotorealistické vizualizácie a podklady k realizácii, podľa ktorých remeselníci interiér postavia. Pri Variante 2 dohliadame aj na to, aby realizácia zodpovedala návrhu (autorský dozor, nie stavebný dozor).</p></div>' +
            prices_html('sk') + tiles_html('sk') + faq_html('sk', faq) +
            f'<h2>{L["sk"]["more_h"]}</h2><div class="cities">{links_sk}<a href="/cs/">Česko</a><a href="/hu/">Magyarország</a><a href="/pl/">Polska</a><a href="/de/">Österreich</a></div>')
    page('sk', url, title, desc, f'Interiérový dizajn {city}', 'PORA · ' + ('štúdio v Košiciach' if not km else f'{city} · osobne aj online'), body,
         ld_service('sk', url, f'Interiérový dizajn {city}', desc, {"@type": "City", "name": city, "containedInPlace": {"@type": "Country", "name": "Slovensko"}}, faq),
         [('PORA', '/'), (L['sk']['crumb_hub'], hub_url), (city, None)])
    URLS.append(url)
# hub SK
faq_hub = [('Pracujete po celom Slovensku?', 'Áno. Štúdio máme v Košiciach, ale navrhujeme interiéry na celom Slovensku. Zameranie a kľúčové stretnutia robíme osobne, konzultácie aj online. Cestovné mimo Košíc je 18 € za hodinu a 0,50 € za kilometer.'),
           ('Koľko stojí interiérový dizajn?', 'Balík Mini 2 490 € (do 20 m²), Variant 1 Design od 4 990 € (do 100 m²), Variant 2 Realizácia od 15 000 €, konzultácia 500 € za hodinu. Ceny sú bez DPH a platia pre byty, domy aj komerčné priestory.'),
           ('Ako rýchlo dostanem cenovú ponuku?', 'Hneď. Náš AI asistent na webe sa spýta na pár vecí a indikatívnu cenovú ponuku vám pošle e-mailom v PDF. Finálnu cenu potvrdíme po zameraní.'),
           ('Robíte aj gastro a komerčné priestory?', 'Áno, máme za sebou viac ako 20 kaviarní, bistier, reštaurácií, salónov, ambulancií a kancelárií.')]
desc = 'Interiérový dizajn na celom Slovensku: Bratislava, Košice, Prešov, Žilina, Banská Bystrica, Nitra, Trnava, Trenčín, Poprad a ďalšie. Návrh interiéru bytov, domov a gastro. Cenová ponuka na počkanie.'
body = ('<p class="lead">PORA je interiérové štúdio z Košíc, ktoré navrhuje interiéry bytov, rodinných domov, kaviarní, reštaurácií, salónov a kancelárií po celom Slovensku. '
        'Za sebou máme viac ako 80 realizácií, z toho vyše 20 gastro a komerčných priestorov.</p>'
        '<div class="txt"><p>Interiérový dizajn u nás znamená celý proces: zameranie, dispozíciu, návrh, fotorealistické vizualizácie, výber materiálov a produktov, podklady k realizácii pre remeselníkov a autorský dozor. Pracujeme osobne aj online, takže je jedno, či bývate v Bratislave, Žiline alebo v Poprade.</p></div>'
        + cpbox('sk') + f'<h2>Mestá</h2><div class="cities">{links_sk}</div>' + prices_html('sk') + tiles_html('sk') + faq_html('sk', faq_hub) +
        '<h2>Zahraničie</h2><div class="cities"><a href="/cs/">Česko</a><a href="/hu/">Magyarország</a><a href="/pl/">Polska</a><a href="/de/">Österreich</a><a href="/en/">English</a></div>')
page('sk', hub_url, 'Interiérový dizajn Slovensko – návrh interiéru bytov, domov a gastro | PORA', desc, 'Interiérový dizajn Slovensko', 'PORA · celé Slovensko',
     body, ld_service('sk', hub_url, 'Interiérový dizajn Slovensko', desc, {"@type": "Country", "name": "Slovensko"}, faq_hub), [('PORA', '/'), ('Interiérový dizajn Slovensko', None)])
URLS.append(hub_url)

# --- zahraničie
for lang, d in INTL.items():
    base = f'/{lang}/'
    t = L[lang]
    clinks = ''.join(f'<a href="{base}{s}/">{E(CITY_TITLE[lang][0].format(c=c))}</a>' for s, c, *_ in d['cities'])
    what_h, what_p = WHAT[lang]
    for slug, city, loc, local in d['cities']:
        url = f'{base}{slug}/'
        h1, title, desc = CITY_TITLE[lang][0].format(c=city), CITY_TITLE[lang][1].format(c=city), CITY_TITLE[lang][2].format(loc=loc)
        sec_h, sec_p = SEC[lang]
        body = (f'<p class="lead">{E(d["intro"])}</p><div class="txt"><p>{E(local)}</p></div>' + cpbox(lang) +
                f'<h2>{E(sec_h.format(loc=loc))}</h2><div class="txt"><p>{E(sec_p)}</p></div>' + f'<h2>{E(what_h)}</h2><div class="txt"><p>{E(what_p)}</p></div>' +
                prices_html(lang) + tiles_html(lang) + faq_html(lang, d['faq']) + f'<h2>{t["more_h"]}</h2><div class="cities">{clinks}<a href="{base}">{E(d["country"])}</a><a href="/en/">English</a><a href="/">Slovensky</a></div>')
        page(lang, url, title, desc, h1, f'PORA · {city}', body,
             ld_service(lang, url, h1, desc, {"@type": "City", "name": city, "containedInPlace": {"@type": "Country", "name": d['country']}}, d['faq']),
             [('PORA', base), (d['country'], base), (city, None)])
        URLS.append(url)
    body = (f'<p class="lead">{E(d["intro"])}</p>' + cpbox(lang) + f'<h2>{HUB_LBL[lang]}</h2><div class="cities">{clinks}</div>' +
            f'<h2>{E(what_h)}</h2><div class="txt"><p>{E(what_p)}</p></div>' + prices_html(lang) + tiles_html(lang) + faq_html(lang, d['faq']) +
            '<h2>PORA</h2><div class="cities"><a href="/en/">English</a><a href="/">Slovensky</a><a href="/interierovy-dizajn/">Slovensko</a></div>')
    page(lang, base, d['title'], d['desc'], d['h1'], f'PORA · {d["country"]}', body,
         ld_service(lang, base, d['h1'], d['desc'], {"@type": "Country", "name": d['country']}, d['faq']), [('PORA', base), (d['country'], None)])
    URLS.append(base)

# --- sitemap: pridať nové URL
sm = open(OUT + '/sitemap.xml').read()
add = ''.join(f'<url><loc>{SITE}{u}</loc><lastmod>{TODAY}</lastmod><priority>{0.9 if u.count("/") <= 3 else 0.8}</priority></url>\n' for u in URLS)
open(OUT + '/sitemap.xml', 'w').write(sm.replace('</urlset>', add + '</urlset>'))
# --- IndexNow zoznam
iu = json.load(open('indexnow_urls.json'))
json.dump(iu + [SITE + u for u in URLS], open('indexnow_urls.json', 'w'))
# --- llms.txt: kde pôsobíme
for f in ('/llms.txt', '/llms-full.txt'):
    s = open(OUT + f).read()
    s = s.replace('## Projects', '## Where PORA works (local pages)\n' + '\n'.join(f'- {SITE}{u}' for u in URLS) + '\n\n## Projects', 1)
    open(OUT + f, 'w').write(s)
# --- odkazy z domovských stránok (pätička)
for lang, path in (('sk', OUT + '/index.html'), ('en', OUT + '/en/index.html')):
    s = open(path).read()
    lbl = 'Kde pôsobíme' if lang == 'sk' else 'Where we work'
    block = (f'<nav class="where" aria-label="{lbl}" style="max-width:1480px;margin:0 auto;padding:28px var(--g,24px) 0;font-size:13px;line-height:2;color:var(--muted)"><b style="letter-spacing:.12em;text-transform:uppercase;margin-right:10px">{lbl}:</b>' +
             ' · '.join(f'<a href="{hub_url}{s_}/" style="color:inherit">{"Interiérový dizajn " if lang=="sk" else "Interior design "}{E(c)}</a>' for s_, c, *_ in SK) +
             f' · <a href="{hub_url}" style="color:inherit">{"Celé Slovensko" if lang=="sk" else "All of Slovakia"}</a> · <a href="/cs/" style="color:inherit">Česko</a> · <a href="/hu/" style="color:inherit">Magyarország</a> · <a href="/pl/" style="color:inherit">Polska</a> · <a href="/de/" style="color:inherit">Österreich</a></nav>')
    assert '</footer>' in s
    s = s.replace('</footer>', block + '</footer>', 1)
    open(path, 'w').write(s)
print('local:', len(URLS), 'pages')
