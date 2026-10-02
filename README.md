# PORA web – zdrojové súbory

- `site/index.html` – jediný zdroj stránky (HTML + CSS + JS, SK texty v DOM, EN v slovníku `EN` v JS). Rovnaký súbor je publikovaný ako náhľad (artefakt) v Claude.
- `build.py` – z `site/index.html` + `site/img` + `site/vid` vytvorí `dist/` (SEO hlavička, `/en/`, sitemap, robots, CNAME, presmerovania zo starých Wix adries).
- Obrázky a videá sú vo vetve `main` v priečinkoch `img/` a `vid/` (do `site/img`, `site/vid` ich skopírujte pred buildom).

Nasadenie: obsah `dist/` sa commitne do vetvy `main` a `gh-pages` (GitHub Pages servíruje `gh-pages`, doména www.pora.sk, HTTPS vynútené).
DNS: Wix (A → GitHub Pages 185.199.108–111.153, CNAME www → poradesignke.github.io), e-mail MX → Websupport.
Formulár: FormSubmit (info@pora.sk, aktivované).
