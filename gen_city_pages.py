# -*- coding: utf-8 -*-
"""Generate local SEO city pages, pretty-URL sitemap, footer links and Netlify redirects."""
from __future__ import annotations

from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SITE = "https://stellarweb.pt"
TODAY = date.today().isoformat()

CITIES = [
    {
        "slug": "lisboa",
        "name": "Lisboa",
        "region": "Lisboa",
        "title": "Criação de Websites Profissionais em Lisboa | Stellar Web",
        "desc": "Criamos websites premium, rápidos e otimizados para telemóveis em Lisboa. A sua agência de Web Design de elite na capital. Peça já um orçamento!",
        "h1": "Criação de Websites e Web Design em Lisboa",
        "keywords": "criação de websites lisboa, web design lisboa, criar site lisboa, agência web design portugal, websites premium lisboa",
    },
    {
        "slug": "cascais",
        "name": "Cascais",
        "region": "Lisboa",
        "title": "Criação de Websites Premium em Cascais | Stellar Web",
        "desc": "Desenvolvimento de websites de luxo, lojas online e SEO em Cascais. Design exclusivo para negócios de elite. Peça o seu orçamento!",
        "h1": "Criação de Websites e Lojas Online em Cascais",
        "keywords": "criação de websites cascais, web design cascais, lojas online cascais, websites de luxo cascais, agência web design portugal",
    },
    {
        "slug": "oeiras",
        "name": "Oeiras",
        "region": "Lisboa",
        "title": "Criação de Websites e Desenvolvimento Web em Oeiras | Stellar Web",
        "desc": "Criamos websites profissionais, ultra-rápidos e otimizados para empresas em Oeiras. O seu parceiro tecnológico de Web Design. Peça orçamento!",
        "h1": "Criação de Websites Profissionais em Oeiras",
        "keywords": "criação de websites oeiras, desenvolvimento web oeiras, web design oeiras, criar site oeiras, agência web design portugal",
    },
    {
        "slug": "almada",
        "name": "Almada",
        "region": "Lisboa",
        "title": "Criação de Websites Profissionais em Almada | Stellar Web",
        "desc": "Desenvolvimento web, lojas online e web design de alta performance em Almada. Otimizado para telemóveis e Google. Peça já um orçamento!",
        "h1": "Criação de Websites e Web Design em Almada",
        "keywords": "criação de websites almada, web design almada, lojas online almada, criar site almada, agência web design portugal",
    },
    {
        "slug": "porto",
        "name": "Porto",
        "region": "Porto",
        "title": "Criação de Websites Profissionais em Porto | Stellar Web",
        "desc": "Criamos websites premium, rápidos e otimizados para telemóveis em Porto. Agência de Web Design de elite para empresas no Norte. Peça orçamento!",
        "h1": "Criação de Websites e Web Design em Porto",
        "keywords": "criação de websites porto, web design porto, criar site porto, agência web design norte, websites premium porto",
    },
    {
        "slug": "braga",
        "name": "Braga",
        "region": "Braga",
        "title": "Criação de Websites Profissionais em Braga | Stellar Web",
        "desc": "Desenvolvimento de websites modernos, lojas online e SEO em Braga. O seu parceiro de Web Design de elite em Portugal. Peça já um orçamento!",
        "h1": "Criação de Websites e Lojas Online em Braga",
        "keywords": "criação de websites braga, web design braga, lojas online braga, criar site braga, agência web design portugal",
    },
    {
        "slug": "viseu",
        "name": "Viseu",
        "region": "Viseu",
        "title": "Criação de Websites Profissionais em Viseu | Stellar Web",
        "desc": "Criamos websites premium, rápidos e otimizados para telemóveis em Viseu. Agência de Web Design de elite no Centro de Portugal. Peça já um orçamento!",
        "h1": "Criação de Websites e Web Design em Viseu",
        "keywords": "criação de websites viseu, web design viseu, criar site viseu, agência web design centro, websites premium viseu",
    },
    {
        "slug": "faro",
        "name": "Faro",
        "region": "Faro",
        "title": "Criação de Websites Profissionais em Faro | Stellar Web",
        "desc": "Criamos websites premium, ultra-rápidos e otimizados para telemóveis em Faro e Algarve. Agência de Web Design de elite. Peça o seu orçamento!",
        "h1": "Criação de Websites e Web Design em Faro (Algarve)",
        "keywords": "criação de websites faro, web design faro, web design algarve, criar site faro, agência web design portugal",
    },
]

HOME_TITLE = "Criação de Websites Profissionais em Portugal | Stellar Web"
HOME_DESC = "Criamos websites premium e rápidos para empresas em Porto, Braga, Lisboa, Viseu e Faro. O seu parceiro de Web Design em Portugal. Peça já um orçamento!"
HOME_H1 = '<h1 class="hero-seo" data-i18n="hero.h1">Criação de Websites Profissionais e Lojas Online em Portugal</h1>'
HOME_KEYWORDS = "criamos website, criação de websites portugal, web design lisboa, web designer sintra, criar site cascais, agência web design portugal"

ALT_MAP = {
    "barber.jpg": "Website premium para barbearia em {place} - Stellar Web Studio",
    "clinic.jpg": "Website premium para clínica médica familiar em {place} - Stellar Web Studio",
    "construction.jpg": "Website premium para construção de luxo em {place} - Stellar Web Studio",
    "law.jpg": "Website premium para sociedade de advogados em {place} - Stellar Web Studio",
    "dental.jpg": "Website premium para clínica de estética dentária em {place} - Stellar Web Studio",
    "rental.jpg": "Website de luxo para aluguer de carros em {place} - Stellar Web Studio",
    "restaurant.jpg": "Website premium para restaurante de alta cozinha em {place} - Stellar Web Studio",
    "studio.jpg": "Website da agência Stellar Web Studio em {place}",
}


def footer_nav(current: str | None = None) -> str:
    links = []
    for city in CITIES:
        current_attr = ' aria-current="page"' if city["slug"] == current else ""
        links.append(f'<a href="/{city["slug"]}"{current_attr}>{city["name"]}</a>')
    inner = "\n    ".join(links)
    return (
        '  <nav class="footer-cities" aria-label="Web design em Portugal">\n'
        '    <span class="footer-cities-label" data-i18n="footer.cities">Web design em Portugal</span>\n'
        f"    {inner}\n"
        "  </nav>"
    )


def apply_portfolio_alts(html: str, place: str) -> str:
    for filename, template in ALT_MAP.items():
        needle = f'src="/images/portfolio/{filename}" alt="'
        start = html.find(needle)
        if start == -1:
            continue
        alt_start = start + len(needle)
        alt_end = html.find('"', alt_start)
        html = html[:alt_start] + template.format(place=place) + html[alt_end:]
    return html


def patch_json_ld(html: str, city: dict) -> str:
    html = html.replace(
        '"description": "' + HOME_DESC + '"',
        '"description": "' + city["desc"] + '"',
        1,
    )
    html = html.replace(
        '"addressLocality": "Massamá"',
        f'"addressLocality": "{city["name"]}"',
        1,
    )
    html = html.replace(
        '"addressRegion": "Lisboa"',
        f'"addressRegion": "{city["region"]}"',
        1,
    )
    html = html.replace(
        '"areaServed": {\n    "@type": "Country",\n    "name": "Portugal"\n  }',
        (
            '"areaServed": {\n'
            '    "@type": "City",\n'
            f'    "name": "{city["name"]}",\n'
            '    "containedInPlace": {\n'
            '      "@type": "Country",\n'
            '      "name": "Portugal"\n'
            "    }\n"
            "  }"
        ),
        1,
    )
    return html


def build_city_page(template: str, city: dict) -> str:
    pretty = f'{SITE}/{city["slug"]}'
    html = template
    html = html.replace(HOME_TITLE, city["title"])
    html = html.replace(HOME_DESC, city["desc"])
    html = html.replace(HOME_KEYWORDS, city["keywords"])
    html = html.replace(
        f'<link rel="canonical" href="{SITE}/" />',
        f'<link rel="canonical" href="{pretty}" />',
    )
    html = html.replace(
        f'<meta property="og:url" content="{SITE}/" />',
        f'<meta property="og:url" content="{pretty}" />',
    )
    html = html.replace(HOME_H1, f'<h1 class="hero-seo">{city["h1"]}</h1>')
    html = html.replace('<a href="#top" class="brand">', '<a href="/" class="brand">')
    html = html.replace(footer_nav(), footer_nav(city["slug"]))
    html = patch_json_ld(html, city)
    html = apply_portfolio_alts(html, city["name"])
    return html


def write_sitemap() -> None:
    urls = [
        f"""  <url>
    <loc>{SITE}/</loc>
    <lastmod>{TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>"""
    ]
    for city in CITIES:
        urls.append(
            f"""  <url>
    <loc>{SITE}/{city["slug"]}</loc>
    <lastmod>{TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>"""
        )
    (ROOT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(urls)
        + "\n</urlset>\n",
        encoding="utf-8",
        newline="\n",
    )


def write_redirects() -> None:
    lines = [
        "# Static files must win over city pretty-URL rules.",
        "/sitemap.xml    /sitemap.xml    200!",
        "/robots.txt     /robots.txt     200!",
        "",
        "# Pretty URLs: /lisboa serves lisboa.html without exposing the extension.",
    ]
    for city in CITIES:
        slug = city["slug"]
        lines.append(f"/{slug}    /{slug}.html    200")
        lines.append(f"/{slug}.html    /{slug}    301")
    lines.append("")
    (ROOT / "_redirects").write_text("\n".join(lines), encoding="utf-8", newline="\n")


def main() -> None:
    template_path = ROOT / "index.html"
    template = template_path.read_text(encoding="utf-8")
    start = template.find('  <nav class="footer-cities"')
    end = template.find("  </nav>", start) + len("  </nav>")
    if start == -1:
        raise SystemExit("footer-cities nav not found in index.html")
    template = template[:start] + footer_nav() + template[end:]
    template_path.write_text(template, encoding="utf-8", newline="\n")

    for city in CITIES:
        page = build_city_page(template, city)
        (ROOT / f'{city["slug"]}.html').write_text(page, encoding="utf-8", newline="\n")
        print(f'wrote {city["slug"]}.html -> {SITE}/{city["slug"]}')

    write_sitemap()
    write_redirects()
    print("wrote sitemap.xml and _redirects")


if __name__ == "__main__":
    main()
