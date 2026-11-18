import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { site, img, IMG, agencies, services, storageSub, faq, inventory } from './data.mjs';
import { C } from './cities.mjs';
import { B1 } from './blog1.mjs'; import { B2 } from './blog2.mjs'; import { B3 } from './blog3.mjs'; import { B4 } from './blog4.mjs';
const BLOG = [...B1, ...B2, ...B3, ...B4];

const PREVIEW = process.env.PREVIEW === '1';
const OUT = 'dist';
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT + '/assets', { recursive: true });

// Empreinte des fichiers statiques (cache)
const asset = f => { const c = fs.readFileSync('assets/' + f); const h = crypto.createHash('md5').update(c).digest('hex').slice(0, 8); const n = f.replace(/\.(\w+)$/, `.${h}.$1`); fs.writeFileSync(`${OUT}/assets/${n}`, c); fs.writeFileSync(`${OUT}/assets/${f}`, c); return '/assets/' + n; };
const CSS = asset('site.css'), JS = asset('site.js'), DJS = asset('devis.js');

const e = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const D = site.domain;
const tel = (p = site.phone) => `tel:+33${p.replace(/\s/g, '').slice(1)}`;
const pic = (k, { eager = false, w = 1200, h = 800, cls = '' } = {}) => { const i = img[k]; return `<img src="${i.src}" alt="${e(i.alt)}" width="${w}" height="${h}" style="object-position:${i.pos}"${eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}${cls ? ` class="${cls}"` : ''}>`; };
const svc = id => services.find(s => s.id === id);
const ag = id => agencies.find(a => a.id === id);
const SPECIAL = { 'Grand-Quevilly': ['au Grand-Quevilly', 'du Grand-Quevilly'], 'Petit-Quevilly': ['au Petit-Quevilly', 'du Petit-Quevilly'] };
const prep = n => SPECIAL[n] ? SPECIAL[n][0] : n.startsWith('Les ') ? 'aux ' + n.slice(4) : n.startsWith('Le ') ? 'au ' + n.slice(3) : 'à ' + n;
const fromP = n => SPECIAL[n] ? SPECIAL[n][1] : n.startsWith('Les ') ? 'des ' + n.slice(4) : n.startsWith('Le ') ? 'du ' + n.slice(3) : /^[AEIOUYÉÈÊaeiouy]/.test(n) ? "d'" + n : 'de ' + n;
const cityUrl = c => `/demenagement-${c.s}/`;
const ldUrl = c => `/demenagement-longue-distance-${c.s}/`;
const boxUrl = c => `/box-stockage-${c.s}/`;
const ORG = D + '/#org';
const pages = [];

// ---------- Schéma entreprise (une seule entité cohérente) ----------
const branch = a => ({ '@type': 'MovingCompany', '@id': D + a.url + '#agence', name: `${site.name} ${a.city}`, url: D + a.url, telephone: a.intl, parentOrganization: { '@id': ORG },
  address: { '@type': 'PostalAddress', ...(a.street ? { streetAddress: a.street } : {}), postalCode: a.zip, addressLocality: a.locality, addressRegion: 'Normandie', addressCountry: 'FR' },
  geo: { '@type': 'GeoCoordinates', latitude: a.lat, longitude: a.lng },
  openingHoursSpecification: site.hoursSchema.map(h => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.days, opens: h.opens, closes: h.closes })) });
const orgSchema = {
  '@type': 'MovingCompany', '@id': ORG, name: site.name, legalName: site.legal, url: D + '/', logo: img.logo, image: img.truck.src, description: site.canonical,
  foundingDate: String(site.founded), telephone: site.phoneIntl, priceRange: 'Devis gratuit', numberOfEmployees: { '@type': 'QuantitativeValue', value: 25 },
  address: { '@type': 'PostalAddress', streetAddress: '33 Quai de France', postalCode: '76100', addressLocality: 'Rouen', addressRegion: 'Normandie', addressCountry: 'FR' },
  areaServed: [{ '@type': 'AdministrativeArea', name: 'Seine-Maritime' }, { '@type': 'AdministrativeArea', name: 'Eure' }, { '@type': 'AdministrativeArea', name: 'Normandie' }, { '@type': 'Country', name: 'France' }],
  memberOf: { '@type': 'Organization', name: 'Chambre Syndicale du Déménagement', url: site.csd },
  department: agencies.map(a => ({ '@id': D + a.url + '#agence' })),
  knowsAbout: ['déménagement de particuliers', 'déménagement longue distance', 'déménagement militaire', 'transfert d\'entreprise', 'garde-meubles', 'self-stockage', 'location de monte-meubles', 'transport de piano', 'transport de coffre-fort'],
  openingHoursSpecification: site.hoursSchema.map(h => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.days, opens: h.opens, closes: h.closes })),
};
const crumbSchema = c => ({ '@type': 'BreadcrumbList', itemListElement: c.map(([n, u], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: D + u })) });
const faqSchema = q => ({ '@type': 'FAQPage', mainEntity: q.map(([a, b]) => ({ '@type': 'Question', name: a, acceptedAnswer: { '@type': 'Answer', text: b } })) });

// ---------- Gabarit ----------
const NAV_SVC = ['particulier', 'longue-distance', 'professionnel', 'militaire', 'international', 'monte-meubles', 'piano', 'coffre-fort', 'fournitures'];
const header = p => `<a class="skip" href="#main">Aller au contenu</a>
<header class="hd"><div class="wrap hd-in">
<a class="hd-logo" href="/" aria-label="Déménagements Postel, accueil"><img src="${img.logo}" alt="Déménagements Postel" width="263" height="140"></a>
<nav class="nav" id="nav" aria-label="Navigation principale">
<div class="dd"><button type="button" aria-haspopup="true">Déménagement</button><div class="dd-menu">
${NAV_SVC.map(id => { const s = svc(id); return `<a href="${s.url}">${s.nav}</a>`; }).join('')}<a href="/demenageur/"><small>Toutes nos prestations</small></a></div></div>
<a href="/garde-meubles-stockage/"${p.startsWith('/garde') ? ' aria-current="page"' : ''}>Garde-meubles</a>
<a href="/zones-intervention/"${p.startsWith('/zones') ? ' aria-current="page"' : ''}>Agences</a>
<a href="/entreprise/"${p.startsWith('/entreprise') ? ' aria-current="page"' : ''}>L'entreprise</a>
<a href="/avis/"${p.startsWith('/avis') ? ' aria-current="page"' : ''}>Avis</a>
<a href="/faq/"${p.startsWith('/faq') ? ' aria-current="page"' : ''}>FAQ</a>
</nav>
<a class="hd-tel" href="${tel()}">${site.phone}<span>Lun. au ven., 8h-12h, 14h-18h</span></a>
<a class="btn btn-red" href="/devis-calculateur-volume/">Obtenir mon devis</a>
<button class="burger" type="button" aria-controls="nav" aria-expanded="false" aria-label="Menu"><i></i><i></i><i></i></button>
</div></header>`;

const footer = () => `<footer class="ft"><div class="wrap">
<div class="ft-grid">
<div><a class="ft-logo" href="/"><img src="${img.logo}" alt="Déménagements Postel" width="263" height="140" loading="lazy"></a>
<p>${e(site.canonical)}</p></div>
<div><h3>Déménagement</h3><ul>${['particulier', 'longue-distance', 'professionnel', 'militaire', 'international', 'garde-meubles', 'monte-meubles'].map(id => `<li><a href="${svc(id).url}">${svc(id).nav}</a></li>`).join('')}</ul></div>
<div><h3>Agences</h3><ul>${agencies.map(a => `<li><a href="${a.url}">${a.city}</a> <a href="${tel(a.phone)}">${a.phone}</a></li>`).join('')}<li>${site.hours}</li></ul></div>
<div><h3>Zones</h3><ul>${C.slice(0, 8).map(c => `<li><a href="${cityUrl(c)}">Déménagement ${c.n}</a></li>`).join('')}<li><a href="/zones-intervention/">Toutes les zones</a></li></ul></div>
</div>
<div class="ft-bottom"><span>© ${new Date().getFullYear()} ${site.name}. Adhérent de la Chambre Syndicale du Déménagement.</span>
<span><a href="/mentions-legales/">Mentions légales</a> · <a href="/protection-de-la-vie-privee/">Vie privée</a> · <a href="/blog/">Conseils</a> · <a href="/contact/">Contact</a></span></div>
</div></footer>
<div class="mbar" role="region" aria-label="Actions rapides"><a class="btn btn-ghost" href="${tel()}">Appeler</a><a class="btn btn-red" href="/devis-calculateur-volume/">Obtenir mon devis</a></div>`;

function page({ url, title, desc, body, schema = [], crumbs, scripts = '', ogImg = img.truck.src, type = 'WebPage' }) {
  if (title.length > 65) console.warn('TITLE LONG', title.length, url);
  if (desc.length > 160) console.warn('DESC LONG', desc.length, url);
  const graph = [orgSchema, { '@type': 'WebSite', '@id': D + '/#site', url: D + '/', name: site.name, publisher: { '@id': ORG }, inLanguage: 'fr-FR' },
    { '@type': type, '@id': D + url + '#page', url: D + url, name: title, description: desc, isPartOf: { '@id': D + '/#site' }, about: { '@id': ORG }, inLanguage: 'fr-FR' },
    ...(crumbs ? [crumbSchema(crumbs)] : []), ...schema];
  if (url === '/') graph.push(...agencies.map(branch));
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${e(title)}</title><meta name="description" content="${e(desc)}">
<link rel="canonical" href="${D + url}">${PREVIEW ? '\n<meta name="robots" content="noindex,nofollow">' : '<meta name="robots" content="index,follow,max-image-preview:large">'}
<meta property="og:type" content="website"><meta property="og:locale" content="fr_FR"><meta property="og:site_name" content="${site.name}"><meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(desc)}"><meta property="og:url" content="${D + url}"><meta property="og:image" content="${ogImg}">
<meta name="theme-color" content="#0f1d31"><link rel="icon" href="${img.logo}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="preconnect" href="https://www.postel-demenagement.fr">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,400..800&display=swap">
<link rel="stylesheet" href="${CSS}">
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}</script>
</head><body>${header(url)}<main id="main">${crumbs && crumbs.length > 1 ? `<nav class="crumbs wrap" aria-label="Fil d'Ariane"><ol>${crumbs.map(([n, u], i) => i === crumbs.length - 1 ? `<li aria-current="page">${e(n)}</li>` : `<li><a href="${u}">${e(n)}</a></li>`).join('')}</ol></nav>` : ''}
${body}</main>${footer()}<script src="${JS}" defer></script>${scripts}</body></html>`;
  const file = url === '/404' ? `${OUT}/404.html` : `${OUT}${url}index.html`;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  if (url !== '/404') pages.push(url);
}

// ---------- Blocs réutilisables ----------
const finalCta = (h = 'Votre devis gratuit, sans engagement', p = 'Estimez votre volume en ligne en quelques minutes. Un conseiller vous rappelle, confirme le prix et propose une visite si besoin.') => `<section><div class="wrap"><div class="final rv"><div><h2>${h}</h2><p>${p}</p></div><div class="cta-row"><a class="btn btn-red" href="/devis-calculateur-volume/">Obtenir mon devis</a><a class="btn btn-ghost" href="${tel()}">Appeler le ${site.phone}</a></div></div></div></section>`;
const details = q => q.map(([a, b]) => `<details><summary>${e(a)}</summary><p>${e(b)}</p></details>`).join('');
const table = t => `<div class="tbl-scroll"><table><thead><tr>${t[0].map(x => `<th scope="col">${e(x)}</th>`).join('')}</tr></thead><tbody>${t.slice(1).map(r => `<tr>${r.map((x, i) => i ? `<td>${e(x)}</td>` : `<th scope="row">${e(x)}</th>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const aside = (agId) => { const a = ag(agId) || ag('rouen'); return `<aside class="aside"><div class="card-cta"><h3>Devis gratuit</h3><p>Estimation du volume en ligne, rappel par un conseiller, visite technique si nécessaire.</p><a class="btn btn-red" href="/devis-calculateur-volume/">Obtenir mon devis</a><a class="btn btn-ghost" href="${tel(a.phone)}">Appeler ${a.phone}</a></div>
<div class="card-info"><h3>Nos agences</h3><ul>${agencies.filter(x => !x.secondary).map(x => `<li><a href="${x.url}"><b>${x.city}</b></a> · <a href="${tel(x.phone)}">${x.phone}</a></li>`).join('')}<li class="meta">${site.hours}</li></ul></div></aside>`; };
const relatedSvc = (except) => `<div class="related">${services.filter(s => s.id !== except).map(s => `<a href="${s.url}">${s.nav}</a>`).join('')}</div>`;

// ================= ACCUEIL =================
const tiles = `<div class="bento">
<a class="tile img big rv" href="${svc('particulier').url}">${pic('truckDepot', { w: 1920, h: 400 })}<span class="go" aria-hidden="true">→</span><h3>Particuliers</h3><p>Maison, appartement, studio : trois formules, du transport seul au déménagement clé en main.</p></a>
<a class="tile img rv" href="${svc('longue-distance').url}">${pic('cab', { w: 1920, h: 600 })}<span class="go" aria-hidden="true">→</span><h3>Longue distance</h3><p>Notre cœur de métier, partout en France.</p></a>
<a class="tile dark rv" href="${svc('professionnel').url}"><span class="go" aria-hidden="true">→</span><h3>Entreprises et administrations</h3><p>Bureaux, commerces, sièges sociaux : planning, étiquetage, reprise sans coupure.</p></a>
<a class="tile red rv" href="${svc('militaire').url}"><span class="go" aria-hidden="true">→</span><h3>Militaires et gendarmes</h3><p>Mutations organisées sur votre date de prise de poste.</p></a>
<a class="tile img rv" href="${svc('garde-meubles').url}">${pic('containers', { w: 1920, h: 400 })}<span class="go" aria-hidden="true">→</span><h3>Garde-meubles</h3><p>3 000 m², 400 conteneurs, box de 2 à 80 m².</p></a>
</div>
<p class="rv" style="margin-top:22px"><a class="link-arrow" href="/demenageur/">Pianos, coffres-forts, monte-meubles, international : toutes nos prestations</a></p>`;

const cmp = `<div class="tbl-scroll rv"><table class="cmp"><thead><tr><th></th><th scope="col">Économique</th><th scope="col" class="hl">Sur mesure<small>Le plus choisi</small></th><th scope="col">Haut de gamme</th></tr></thead><tbody>
${[['Emballage des cartons', 'Par vous', 'Par vous', 'Par Postel'], ['Emballage du fragile', 'Par vous', 'Par Postel', 'Par Postel'], ['Démontage et remontage', 'Par vous', 'Par Postel', 'Par Postel'], ['Protection des meubles', 'Par Postel', 'Par Postel', 'Par Postel'], ['Transport et livraison', 'Par Postel', 'Par Postel', 'Par Postel'], ['Remise en place', 'Non', 'Non', 'Par Postel'], ['Pour qui', 'Budget serré, temps disponible', 'Le meilleur équilibre', 'Agenda chargé, zéro stress']].map(r => `<tr><th scope="row">${r[0]}</th><td>${r[1]}</td><td class="hl">${r[2]}</td><td>${r[3]}</td></tr>`).join('')}
</tbody></table></div><p class="meta" style="margin-top:14px">Le contenu exact de chaque formule est confirmé dans votre devis écrit.</p>`;

const dept = (d, list) => `<div class="dept"><h3>${d}</h3><div class="pills">${list}</div></div>`;
const zonesBlock = `<div class="zones">
<div class="ag-list rv">${agencies.map(a => `<a class="ag" href="${a.url}"><h3>${a.city}</h3><small>${a.role}${a.street ? ', ' + a.street : ''}</small><span class="tel">${a.phone}</span></a>`).join('')}</div>
<div class="rv">${dept('Seine-Maritime (76)', C.filter(c => c.d === 76).map(c => `<a href="${cityUrl(c)}">${c.n}</a>`).join(''))}
${dept('Eure (27)', C.filter(c => c.d === 27).map(c => `<a href="${cityUrl(c)}">${c.n}</a>`).join(''))}
${dept('Et au-delà', `<a href="${svc('longue-distance').url}">Toute la France</a><a href="${svc('international').url}">International</a>`)}
<p><a class="link-arrow" href="/zones-intervention/">Voir toutes les zones d'intervention</a></p></div></div>`;

const trustItems = [
  ['Adhérent de la Chambre Syndicale du Déménagement', 'Postel est référencée dans l\'annuaire de la CSD, l\'organisation professionnelle du métier.', 'csd'],
  ['Inventaire détaillé', 'Chaque bien est listé au chargement et contrôlé à la livraison.'],
  ['Enquête de satisfaction', 'Après chaque déménagement, vous évaluez l\'équipe : nous suivons la qualité chantier par chantier.'],
  ['Équipes formées', 'Nos déménageurs sont formés aux techniques actuelles de protection et de manutention.'],
  ['Stockage sécurisé', 'Entrepôts sous vidéosurveillance, conteneurs bois plombés pour les objets de valeur.'],
  ['Véhicules de 6 à 100 m³', 'Du porteur urbain à la semi-remorque, le bon gabarit pour chaque rue et chaque volume.'],
];
const trust = `<div class="trust"><div class="trust-media rv">${pic('building', { w: 1920, h: 400 })}</div><div class="trust-list">${trustItems.map(t => t[2] ? `<div class="tr csd rv"><img src="${IMG}2021/11/CSD-logo-ol1yzddlahiyq6ul0p8yzqd36yihthgqwmh0wv6dow.png" alt="Logo Chambre Syndicale du Déménagement" width="64" height="64" loading="lazy"><div><h3>${t[0]}</h3><p>${t[1]}</p></div></div>` : `<div class="tr rv"><h3>${t[0]}</h3><p>${t[1]}</p></div>`).join('')}</div></div>`;

page({ url: '/', title: 'Déménageur en Normandie depuis 1946 : Rouen, Évreux | Postel', desc: 'Déménageur normand depuis 1946 : particuliers, entreprises, militaires, longue distance, garde-meubles. Agences à Rouen, Évreux et Elbeuf. Devis gratuit.',
  crumbs: [['Accueil', '/']],
  body: `<section class="hero" style="padding:0"><div class="hero-media">${pic('truck', { eager: true, w: 1920, h: 976 })}</div>
<div class="wrap" style="width:100%"><div class="hero-in"><span class="eyebrow">Le plus ancien déménageur de Rouen · depuis 1946</span>
<h1>Déménageur en Normandie depuis 1946</h1>
<p>Numéro 1 de la longue distance au départ de la Normandie. Trois générations Postel, 1 200 déménagements par an.</p>
<div class="cta-row"><a class="btn btn-red" href="/devis-calculateur-volume/">Obtenir mon devis</a><a class="btn btn-ghost" href="${tel()}">Appeler le ${site.phone}</a></div></div></div></section>
<div class="stats"><div class="wrap"><div class="stats-in">${site.stats.map(s => `<div class="stat"><b>${s.v}</b><span>${s.l}</span></div>`).join('')}</div></div></div>

<section><div class="wrap"><div class="sec-head rv"><h2>Un déménageur, tous les déménagements</h2><p>Depuis 1946 et sur trois générations, la famille Postel déménage les familles, les entreprises, les administrations et les militaires de Seine-Maritime et de l'Eure, sur place comme à l'autre bout de la France.</p></div>${tiles}</div></section>

<section class="dark-sec"><div class="wrap ld"><div class="rv"><h2>N°1 de la longue distance au départ de la Normandie</h2><p>Rouen Paris, Évreux Lyon, Le Havre Marseille, ou l'inverse : un seul interlocuteur organise votre déménagement national de bout en bout, avec nos propres véhicules de 6 à 100 m³.</p>
<ol class="steps"><li><div><b>Visite technique gratuite</b><span>Volume, accès, objets particuliers.</span></div></li><li><div><b>Devis écrit et détaillé</b><span>Camion dédié ou groupage, selon votre délai.</span></div></li><li><div><b>Emballage et protection</b><span>Couvertures, housses, cartons adaptés.</span></div></li><li><div><b>Transport par nos équipes</b><span>Itinéraire planifié, inventaire contrôlé.</span></div></li><li><div><b>Livraison et remontage</b><span>À la date convenue, ou après un passage en garde-meubles.</span></div></li></ol>
<p style="margin-top:26px"><a class="btn btn-red" href="${svc('longue-distance').url}">Découvrir la longue distance</a></p></div>
<div class="ld-media rv">${pic('fleet', { w: 1920, h: 450 })}</div></div></section>

<section><div class="wrap"><div class="sec-head rv"><h2>Trois formules, la même exigence</h2><p>Vous choisissez ce que vous faites vous-même et ce que nous prenons en charge. Le prix suit.</p></div>${cmp}</div></section>

<section style="background:var(--paper)"><div class="wrap"><div class="sec-head rv"><h2>Trois agences pour la Seine-Maritime et l'Eure</h2><p>Rouen, Évreux et Elbeuf : des équipes proches de chez vous, qui connaissent vos rues, vos accès et vos mairies.</p></div>${zonesBlock}</div></section>

<section><div class="wrap"><div class="sec-head rv"><h2>Pourquoi confier son déménagement à Postel</h2></div>${trust}</div></section>

<section style="padding-top:0"><div class="wrap"><div class="reviews rv"><div class="score"><b>${site.pagesjaunesRating}</b><span>sur PagesJaunes, ${site.pagesjaunesCount}</span></div><div><h2>Ce que disent nos clients</h2><p>Les avis de nos clients sont publiés sur PagesJaunes et sur notre fiche Google. Une enquête de satisfaction suit chaque déménagement pour mesurer le travail de chaque équipe.</p><a class="link-arrow" href="/avis/">Voir les avis clients</a></div></div></div></section>

<section style="padding-top:0"><div class="wrap faq-grid"><div class="rv"><h2>Vos questions, nos réponses</h2><p>Devis, formules, assurances, délais : l'essentiel avant de réserver.</p><a class="link-arrow" href="/faq/">Toute la FAQ</a></div><div class="rv">${details(faq.slice(0, 6))}</div></div></section>

<section style="padding-top:0"><div class="wrap"><div class="sec-head rv"><h2>Conseils pour bien déménager</h2></div><div class="posts">${[BLOG[39], BLOG[0]].map(b => `<a class="post rv" href="/blog/${b.s}/"><div><h3>${e(b.h)}</h3><p>${e(b.m)}</p></div><span>${b.cat}</span></a>`).join('')}</div><p class="rv" style="margin-top:22px"><a class="link-arrow" href="/blog/">Nos ${BLOG.length} guides pratiques</a></p></div></section>
${finalCta()}`,
  schema: [faqSchema(faq.slice(0, 6))] });

// ================= SERVICES =================
for (const s of services) {
  const crumbs = [['Accueil', '/'], ...(s.url.startsWith('/demenageur/') ? [['Déménagement', '/demenageur/']] : []), [s.nav, s.url]];
  const nearCities = (s.id === 'longue-distance' ? C.slice(0, 12).map(c => `<a href="${ldUrl(c)}">Depuis ${c.n}</a>`) : s.id === 'garde-meubles' ? C.slice(0, 12).map(c => `<a href="${boxUrl(c)}">Box près ${fromP(c.n)}</a>`) : C.slice(0, 12).map(c => `<a href="${cityUrl(c)}">Déménagement ${c.n}</a>`)).join('');
  page({ url: s.url, title: s.title, desc: s.lead.slice(0, 155).replace(/\s\S*$/, '') + '.', crumbs,
    schema: [{ '@type': 'Service', '@id': D + s.url + '#service', name: s.h1, serviceType: s.nav, description: s.lead, provider: { '@id': ORG }, areaServed: orgSchema.areaServed, url: D + s.url }, ...(s.faq ? [faqSchema(s.faq)] : [])],
    body: `<section class="ph"><div class="wrap ph-in"><div class="rv"><h1>${e(s.h1)}</h1><p class="lead">${e(s.lead)}</p><div class="cta-row"><a class="btn btn-red" href="/devis-calculateur-volume/${s.id === 'militaire' ? '?type=Militaire ou gendarme' : s.id === 'professionnel' ? '?type=Entreprise ou administration' : ''}">Obtenir mon devis</a><a class="btn btn-line" href="${tel()}">Appeler le ${site.phone}</a></div></div><div class="ph-media rv">${pic(s.image, { eager: true })}</div></div></section>
<section style="padding-top:0"><div class="wrap body-grid"><article class="prose">
${s.blocks.map(([h, p]) => `<h2>${e(h)}</h2><p>${e(p)}</p>`).join('')}
${s.table ? `<h2>En résumé</h2>${table(s.table)}` : ''}
${s.children ? `<h2>Nos solutions de stockage</h2><div class="related">${s.children.map(c => `<a href="${c.url}">${c.t}</a>`).join('')}</div>` : ''}
${s.faq ? `<h2>Questions fréquentes</h2>${details(s.faq)}` : ''}
<h2>Où intervenons-nous ?</h2><p>Partout en Seine-Maritime et dans l'Eure depuis nos agences de Rouen, Évreux et Elbeuf, et dans toute la France.</p><div class="related">${nearCities}</div>
<h2>Nos autres prestations</h2>${relatedSvc(s.id)}
</article>${aside('rouen')}</div></section>${finalCta()}` });
}
page({ url: '/demenageur/', title: 'Services de déménagement local, national, international | Postel', desc: 'Prestations Déménagements Postel : particuliers, entreprises, militaires, longue distance, international, garde-meubles, monte-meubles, piano.',
  crumbs: [['Accueil', '/'], ['Déménagement', '/demenageur/']],
  body: `<section class="ph"><div class="wrap ph-in"><div><h1>Nos services de déménagement pour particuliers et professionnels</h1><p class="lead">Déménagements Postel prend en charge tous les déménagements, du studio rouennais au transfert d'un siège social, en Normandie, partout en France et à l'international, avec garde-meubles et matériel de manutention en propre.</p><div class="cta-row"><a class="btn btn-red" href="/devis-calculateur-volume/">Obtenir mon devis</a></div></div><div class="ph-media">${pic('fleet', { eager: true })}</div></div></section>
<section style="padding-top:0"><div class="wrap">${tiles}<h2 style="margin-top:64px">Toutes nos prestations</h2>${relatedSvc('')}</div></section>${finalCta()}` });

for (const s of storageSub) {
  const gm = svc('garde-meubles');
  page({ url: s.url, title: s.title, desc: s.lead.slice(0, 150).replace(/\s\S*$/, '') + '.', crumbs: [['Accueil', '/'], ['Garde-meubles', gm.url], [s.h1, s.url]],
    schema: [{ '@type': 'Service', name: s.h1, provider: { '@id': ORG }, areaServed: 'Rouen et Normandie', url: D + s.url }, faqSchema(s.q)],
    body: `<section class="ph"><div class="wrap ph-in"><div><h1>${e(s.h1)}</h1><p class="lead">${e(s.lead)}</p><div class="cta-row"><a class="btn btn-red" href="/devis-calculateur-volume/?type=Garde-meubles seul">Obtenir mon devis</a><a class="btn btn-line" href="${tel()}">Appeler le ${site.phone}</a></div></div><div class="ph-media">${pic(s.image, { eager: true })}</div></div></section>
<section style="padding-top:0"><div class="wrap body-grid"><article class="prose">${s.q.map(([h, p]) => `<h2>${e(h)}</h2><p>${e(p)}</p>`).join('')}<h2>Comparer nos solutions</h2>${table(gm.table)}<h2>Voir aussi</h2><div class="related">${gm.children.filter(c => c.url !== s.url).map(c => `<a href="${c.url}">${c.t}</a>`).join('')}<a href="${gm.url}">Garde-meubles et stockage</a></div></article>${aside('rouen')}</div></section>${finalCta()}` });
}

// ================= VILLES (3 pages par commune) =================
const D_ = site.domain;
const R = 6371, rad = x => x * Math.PI / 180;
const km = (a, b) => { const dLa = rad(b[0] - a[0]), dLo = rad(b[1] - a[1]); const h = Math.sin(dLa / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLo / 2) ** 2; return Math.round(2 * R * Math.asin(Math.sqrt(h))); };
const SITE_GQ = [49.409, 1.042];
const DEST = [['Paris', [48.857, 2.352]], ['Lille', [50.629, 3.057]], ['Nantes', [47.218, -1.554]], ['Rennes', [48.117, -1.678]], ['Bordeaux', [44.838, -0.579]], ['Lyon', [45.764, 4.836]], ['Strasbourg', [48.573, 7.752]], ['Toulouse', [43.605, 1.444]], ['Marseille', [43.296, 5.370]], ['Nice', [43.710, 7.262]]];
const nearestAg = c => c.agency ? ag(c.agency) : ['rouen', 'elbeuf', 'evreux'].map(ag).sort((x, y) => km(c.ll, [x.lat, x.lng]) - km(c.ll, [y.lat, y.lng]))[0];
const neighbors = (c, n = 5) => C.filter(x => x !== c).sort((x, y) => km(c.ll, x.ll) - km(c.ll, y.ll)).slice(0, n);
const deptName = d => d === 76 ? 'Seine-Maritime (76)' : 'Eure (27)';
const v = (i, arr) => arr[i % arr.length];
const fit = (t, alt) => t.length <= 62 ? t : alt.find(x => x.length <= 62) || alt[alt.length - 1];
const list = a => a.length > 1 ? a.slice(0, -1).join(', ') + ' et ' + a[a.length - 1] : a[0];

C.forEach((c, i) => {
  const a = nearestAg(c), P = prep(c.n), D = fromP(c.n), dAg = km(c.ll, [a.lat, a.lng]), dGQ = km(c.ll, SITE_GQ), here = c.agency || dAg < 3;
  const U = { dem: cityUrl(c), ld: ldUrl(c), box: boxUrl(c) };
  const near = neighbors(c);
  const agTxt = here ? `son agence ${P}` : `son agence ${fromP(a.city)}, à environ ${dAg} km à vol d'oiseau`;
  const trio = (cur) => `<h2>${e(v(i, ['Nos trois services ', 'Tout pour votre projet ', 'Les autres pages utiles ']))}${e(P)}</h2><div class="related">${[['dem', `Déménagement ${c.n}`], ['ld', `Longue distance depuis ${c.n}`], ['box', `Box de stockage près ${D}`]].filter(x => x[0] !== cur).map(x => `<a href="${U[x[0]]}">${e(x[1])}</a>`).join('')}<a href="${a.url}">Agence Postel ${e(a.city)}</a></div>`;
  const nearBlock = (kind, label) => `<h2>${e(label)}</h2><div class="related">${near.map(x => `<a href="${kind === 'dem' ? cityUrl(x) : kind === 'ld' ? ldUrl(x) : boxUrl(x)}">${e(x.n)} <small style="opacity:.7">(${km(c.ll, x.ll)} km)</small></a>`).join('')}</div>`;
  const media = k => `<div class="ph-media">${pic(k, { eager: true })}</div>`;
  const imgs = ['truck', 'fleet', 'cab', 'truckDepot', 'building'];
  const svcSchema = (name, type, url) => ({ '@type': 'Service', name, serviceType: type, provider: { '@id': D_ + a.url + '#agence' }, areaServed: { '@type': 'City', name: c.n, containedInPlace: { '@type': 'AdministrativeArea', name: deptName(c.d) }, geo: { '@type': 'GeoCoordinates', latitude: c.ll[0], longitude: c.ll[1] } }, url: D_ + url });

  // ---- A. Déménagement ----
  const fA = [[v(i, [`Combien coûte un déménagement ${P} ?`, `Quel est le prix d'un déménagement ${P} ?`, `Comment est calculé le prix d'un déménagement ${P} ?`]), `Il dépend du volume, des accès (étage, ascenseur, stationnement), de la formule et de la date. Postel établit un devis gratuit après estimation du volume, en ligne ou lors d'une visite ${P}.`],
    [`Intervenez-vous autour ${D} ?`, `Oui : ${list(c.vois)}, et l'ensemble de ${c.d === 76 ? 'la Seine-Maritime' : "l'Eure"}.`],
    [`Faut-il une autorisation de stationnement ${P} ?`, `Oui, pour réserver la place du camion devant le logement : elle se demande à la mairie ${D}. Nous vous indiquons le métrage à réserver.`]];
  const qA = [[v(i, [`À quoi ressemble un déménagement ${P} ?`, `Quels logements et quels accès ${P} ?`, `Comment s'organise un déménagement ${P} ?`]), `${c.hab} ${c.acc}`],
    [`Qui déménage ${P} ?`, `${c.prof} Nous adaptons la formule à chaque situation : économique si vous emballez vous-même, sur mesure pour confier le fragile, haut de gamme pour ne rien avoir à faire.`],
    c.apt ? [`Faut-il un monte-meubles ${P} ?`, `Souvent dans les immeubles et les maisons à étages ${D} : il passe les meubles par une fenêtre ou un balcon, protège les parties communes et raccourcit la journée. Nous le prévoyons dès la visite technique.`]
      : [`Combien de temps à l'avance réserver ${P} ?`, `Un à deux mois avant en moyenne, davantage entre juin et septembre. Pour une maison ou un volume important ${P}, la visite technique gratuite se planifie dès que la date est connue.`]];
  page({ url: U.dem, title: fit(`Déménagement ${c.n} : déménageur depuis 1946 | Postel`, [`Déménagement ${c.n} : devis gratuit | Postel`, `Déménageur ${c.n} | Postel`, `Déménagement ${c.n}`]),
    desc: `Déménageur ${P} depuis 1946 : particuliers, entreprises, militaires. Agence ${fromP(a.city)} ${here ? 'sur place' : `à ${dAg} km`}. Visite et devis gratuits.`.replace('Agence de ', 'Agence de ').slice(0, 158),
    crumbs: [['Accueil', '/'], ['Zones d\'intervention', '/zones-intervention/'], [`Déménagement ${c.n}`, U.dem]],
    schema: [svcSchema(`Déménagement ${P}`, 'Déménagement', U.dem), faqSchema(fA)],
    body: `<section class="ph"><div class="wrap ph-in"><div><h1>Déménagement ${e(P)} : votre déménageur depuis 1946</h1><p class="lead">Pour déménager ${e(P)} (${deptName(c.d)}), Déménagements Postel, plus ancien déménageur de Rouen, intervient depuis ${e(agTxt)} : visite technique et devis gratuits, trois formules et des véhicules de 6 à 100 m³ adaptés aux rues ${e(D)}.</p><div class="cta-row"><a class="btn btn-red" href="/devis-calculateur-volume/">Obtenir mon devis</a><a class="btn btn-line" href="${tel(a.phone)}">Appeler le ${a.phone}</a></div></div>${media(v(i, imgs))}</div></section>
<section style="padding-top:0"><div class="wrap body-grid"><article class="prose">
<div class="facts"><div><b>Agence ${e(a.city)}</b><span>${here ? 'sur place' : `${dAg} km à vol d'oiseau`}</span></div><div><b>Depuis 1946</b><span>3 générations Postel</span></div><div><b>Devis gratuit</b><span>visite à domicile</span></div><div><b>6 à 100 m³</b><span>véhicules adaptés</span></div><div><b>Box à ${dGQ} km</b><span>self-stockage Grand-Quevilly</span></div><div><b>${a.phone}</b><span>lun. au ven.</span></div></div>
${qA.map(([h, p]) => `<h2>${e(h)}</h2><p>${e(p)}</p>`).join('')}
<h2>${e(v(i + 1, [`Quelles communes autour ${D} desservons-nous ?`, `Où intervenons-nous près ${D} ?`, `Quelles communes voisines ${D} couvrons-nous ?`]))}</h2><p>Nos équipes interviennent ${e(P)} et dans les communes voisines : ${e(list(c.vois))}.</p>
<h2>Questions fréquentes</h2>${details(fA)}
${nearBlock('dem', `Déménagement près ${D}`)}
${trio('dem')}
</article>${aside(a.id)}</div></section>${finalCta(`Votre déménagement ${e(P)}`, `Devis gratuit et sans engagement. L'agence ${e(fromP(a.city))} vous rappelle du lundi au vendredi.`)}` });

  // ---- B. Longue distance ----
  const dd = DEST.map(([n, ll]) => [n, km(c.ll, ll)]);
  const paris = dd[0][1], far = dd.slice().sort((x, y) => y[1] - x[1])[0];
  const fB = [[`Combien de temps dure un déménagement ${c.n} Paris ?`, `Paris est à environ ${paris} km à vol d'oiseau ${D} : pour un appartement, chargement et livraison se font souvent dans la même journée, selon le volume et les accès.`],
    [`Et pour ${far[0]}, la destination la plus lointaine ?`, `À environ ${far[1]} km à vol d'oiseau, comptez en général une livraison le lendemain ou le surlendemain, en camion dédié, ou une fenêtre plus large en groupage.`],
    [`Pouvez-vous stocker mes meubles avant le départ ${D} ?`, `Oui, en garde-meubles près de Rouen, à ${dGQ} km à vol d'oiseau ${D}, puis livraison à la date de votre choix.`]];
  page({ url: U.ld, title: fit(`Déménagement longue distance ${c.n} | Postel`, [`Déménagement longue distance ${c.n}`, `Longue distance ${c.n} : déménagement`]),
    desc: `Déménager loin depuis ${c.n} : Paris à ${paris} km, Lyon, Bordeaux, Marseille. N°1 de la longue distance au départ de la Normandie.`.slice(0, 158),
    crumbs: [['Accueil', '/'], ['Longue distance', svc('longue-distance').url], [`Depuis ${c.n}`, U.ld]],
    schema: [svcSchema(`Déménagement longue distance depuis ${c.n}`, 'Déménagement longue distance', U.ld), faqSchema(fB)],
    body: `<section class="ph"><div class="wrap ph-in"><div><h1>Déménagement longue distance depuis ${e(c.n)}</h1><p class="lead">Numéro 1 de la longue distance au départ de la Normandie, Déménagements Postel organise votre déménagement ${e(D)} vers toute la France : Paris à ${paris} km, Lyon à ${dd[5][1]} km, Marseille à ${dd[8][1]} km à vol d'oiseau, en camion dédié ou en groupage.</p><div class="cta-row"><a class="btn btn-red" href="/devis-calculateur-volume/">Obtenir mon devis</a><a class="btn btn-line" href="${tel(a.phone)}">Appeler le ${a.phone}</a></div></div>${media(v(i + 2, ['cab', 'fleet', 'truck']))}</div></section>
<section style="padding-top:0"><div class="wrap body-grid"><article class="prose">
<h2>${e(v(i, [`Vers quelles villes déménage-t-on depuis ${c.n} ?`, `Quelles distances depuis ${c.n} ?`, `Où partent nos camions au départ ${D} ?`]))}</h2><p>Voici les principales destinations de nos déménagements nationaux au départ ${e(D)}, avec la distance à vol d'oiseau (le trajet routier est plus long).</p>
${table([['Destination', `Distance à vol d'oiseau depuis ${c.n}`, 'Formule conseillée'], ...dd.map(([n, k]) => [n, `${k} km`, k < 180 ? 'Camion dédié, livraison le jour même possible' : k < 600 ? 'Camion dédié ou groupage' : 'Groupage pour un petit volume, dédié sinon'])])}
<h2>${e(`Par quelles routes partent nos camions ${D} ?`)}</h2><p>Depuis ${e(c.n)}, nos véhicules empruntent ${e(c.axes)}. Nous planifions l'itinéraire, les pauses réglementaires et l'heure d'arrivée pour livrer à la date convenue.</p>
<h2>${e(`Qui déménage loin au départ ${D} ?`)}</h2><p>${e(c.prof)} Quel que soit le profil, un seul interlocuteur Postel suit le dossier du devis à la livraison.</p>
<h2>${e(`Camion dédié ou groupage au départ ${D} ?`)}</h2><p>Le camion dédié transporte uniquement vos biens, avec une date de livraison fixe : idéal pour ${paris < 200 ? 'un déménagement vers Paris dans la journée' : 'un gros volume ou une date impérative'}. Le groupage partage le trajet avec d'autres clients vers la même région ${e(D)} : plus économique, avec une fenêtre de livraison plus souple.</p>
<h2>${e(`Et pour s'installer ${P} en venant d'une autre région ?`)}</h2><p>Nous organisons aussi les arrivées ${e(P)} : chargement partout en France, livraison et remontage sur place. ${e(c.acc)}</p>
<h2>Questions fréquentes</h2>${details(fB)}
${nearBlock('ld', 'Longue distance depuis une commune voisine')}
${trio('ld')}
</article>${aside(a.id)}</div></section>${finalCta(`Partir loin ${D}`, `Devis gratuit et sans engagement, camion dédié ou groupage, partout en France.`)}` });

  // ---- C. Box de stockage ----
  const closeBox = dGQ <= 15;
  const fC = [[`Où se trouvent vos box de stockage pour les habitants ${D} ?`, c.site ? `Sur la commune même, au Grand-Quevilly : les box de 2 à 80 m² y sont accessibles librement aux horaires d'ouverture.` : `Au Grand-Quevilly, à environ ${dGQ} km à vol d'oiseau ${D}. L'adresse exacte vous est donnée avec le devis.`],
    [`Pouvez-vous venir chercher mes meubles ${P} ?`, `Oui : avec le garde-meubles, l'équipe Postel enlève vos biens ${P}, les stocke en conteneurs bois fermés et les relivre où et quand vous le souhaitez.`],
    [`Pour combien de temps peut-on louer ?`, `La durée est libre, de quelques semaines à plusieurs années, sans durée minimale imposée.`]];
  page({ url: U.box, title: fit(`Location box de stockage ${c.n} | Postel`, [`Box de stockage ${c.n} : location`, `Box de stockage ${c.n}`]),
    desc: `Box de stockage de 2 à 80 m² ${c.site ? 'au Grand-Quevilly' : `à ${dGQ} km ${D}`}, garde-meubles avec enlèvement ${P}. Durée libre, accès sécurisé. Devis gratuit.`.slice(0, 158),
    crumbs: [['Accueil', '/'], ['Garde-meubles', svc('garde-meubles').url], [`Box de stockage ${c.n}`, U.box]],
    schema: [{ '@type': 'Service', name: `Location de box de stockage ${c.site ? 'au Grand-Quevilly' : 'près ' + D}`, serviceType: 'Self-stockage et garde-meubles', provider: { '@id': ORG }, areaServed: { '@type': 'City', name: c.n }, url: D_ + U.box }, faqSchema(fC)],
    body: `<section class="ph"><div class="wrap ph-in"><div><h1>Location de box de stockage ${c.site ? 'au Grand-Quevilly' : 'près ' + e(D)}</h1><p class="lead">${c.site ? `Les box de self-stockage Postel, de 2 à 80 m², sont installés au Grand-Quevilly même : aérés, protégés, équipés d'étagères et accessibles librement aux horaires d'ouverture.` : `Les box de self-stockage Postel, de 2 à 80 m², sont au Grand-Quevilly, à environ ${dGQ} km à vol d'oiseau ${e(D)}. ${closeBox ? 'Vous y venez librement aux horaires d\'ouverture' : 'Pour éviter le trajet, notre garde-meubles enlève vos biens à domicile'} et la durée de location est libre.`}</p><div class="cta-row"><a class="btn btn-red" href="/devis-calculateur-volume/?type=Garde-meubles seul">Obtenir mon devis</a><a class="btn btn-line" href="${tel()}">Appeler le ${site.phone}</a></div></div>${media(v(i, ['containers', 'selfstorage', 'truckDepot']))}</div></section>
<section style="padding-top:0"><div class="wrap body-grid"><article class="prose">
<h2>${e(v(i, [`Pourquoi louer un box quand on habite ${c.n} ?`, `Quels besoins de stockage ${P} ?`, `Dans quels cas stocker ses biens ${P} ?`]))}</h2><p>${e(c.stock)} ${e(v(i, [`Travaux, vente, mutation, succession ou archives : le box évite d'encombrer votre logement ${D}.`, `C'est aussi une solution pour les entreprises ${D} qui manquent de place pour leur stock ou leurs archives.`, `Près ${D}, beaucoup de clients stockent aussi entre la vente d'un bien et l'achat du suivant.`]))}</p>
<h2>${e(`Box en libre accès ou garde-meubles avec enlèvement ${P} ?`)}</h2><p>${closeBox ? `À ${dGQ} km du site, le box en libre accès est souvent le plus pratique : vous déposez et reprenez vos affaires quand vous voulez.` : `À ${dGQ} km du site, le garde-meubles avec enlèvement à domicile est souvent plus simple : notre équipe charge ${e(P)}, stocke en conteneurs bois plombés et relivre.`} ${e(v(i + 1, ['Les deux solutions se combinent avec un déménagement Postel.', `Pour les communes autour ${D}, comme ${c.vois[0]} ou ${c.vois[1]}, le principe est le même.`, 'Vous pouvez aussi passer de l\'un à l\'autre en cours de location.']))}</p>
${table([['Logement ou besoin', 'Surface de box conseillée'], ['Cartons, petits meubles', '2 à 3 m²'], ['Studio', '3 à 5 m²'], ['T2', '6 à 10 m²'], ['T3 ou T4', '10 à 15 m²'], ['Maison', '15 m² et plus'], ['Stock professionnel ou archives', 'Sur mesure, jusqu\'à 80 m²']])}
<h2>${e(`Comment rejoindre le site du Grand-Quevilly ${D} ?`)}</h2><p>${c.site ? `Le site est sur la commune, à quelques minutes de chez vous, avec un accès direct à la N338 et à l'A13.` : `Depuis ${e(c.n)}, on rejoint Rouen par ${e(c.axes.split(',')[0])}, puis la rive gauche et Le Grand-Quevilly. Si vous ne souhaitez pas faire le trajet, nous venons à vous.`}</p>
<h2>${e(`Quelle taille de box pour un logement ${D} ?`)}</h2><p>${e(c.hab)} ${c.apt ? `Pour un appartement ${e(D)}, un box de 6 à 10 m² suffit souvent ; pour une maison, prévoyez 15 m² et plus.` : `Les maisons ${e(D)} et de ses environs (${e(list(c.vois.slice(0, 3)))}) demandent souvent un box de 15 m² et plus, surtout avec garage ou dépendances.`}</p>
<h2>${e(v(i, ['Que peut-on stocker, et en quelle sécurité ?', 'Vos biens sont-ils en sécurité ?', 'Quels objets accepter dans un box ?']))}</h2><p>${v(i, ['Meubles, cartons, électroménager, archives, matériel professionnel : tout sauf les produits inflammables, les denrées périssables et les êtres vivants. Les espaces sont sous vidéosurveillance.', 'Les espaces de stockage Postel sont sous vidéosurveillance, les box aérés et équipés d\'étagères, et les conteneurs du garde-meubles plombés pour les objets de valeur.', 'Mobilier, électroménager, cartons, archives et stock professionnel sont acceptés ; carburants, gaz, produits toxiques et denrées périssables sont exclus, pour la sécurité de tous.'])}</p>
<h2>Questions fréquentes</h2>${details(fC)}
${nearBlock('box', 'Stockage pour les communes voisines')}
${trio('box')}
</article>${aside(a.id)}</div></section>${finalCta(`Stocker vos biens ${c.site ? 'au Grand-Quevilly' : 'près ' + e(D)}`, 'Box de 2 à 80 m² ou garde-meubles avec enlèvement, durée libre. Devis gratuit.')}` });
});

// ================= AGENCES =================
for (const a of agencies) {
  const att = C.filter(c => nearestAg(c) === a);
  const P = prep(a.city);
  const h1 = `Agence Déménagements Postel ${fromP(a.city)}`;
  const title = `Agence Postel ${a.city} : adresse, téléphone, horaires`;
  const lead = `L'agence Déménagements Postel ${fromP(a.city)} (${a.role.toLowerCase()}) vous accueille du lundi au vendredi, de 8h à 12h et de 14h à 18h, au ${a.phone}. Devis gratuit, visite technique, garde-meubles et longue distance partout en France.`;
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Déménagements Postel ${a.street} ${a.zip} ${a.locality}`)}`;
  page({ url: a.url, title, desc: `${site.name} ${P} : ${a.street ? a.street + ', ' + a.zip + ' ' + a.locality + ', ' : ''}${a.phone}. Déménagement particuliers, entreprises, garde-meubles. Devis gratuit.`.slice(0, 158),
    crumbs: [['Accueil', '/'], ['Contact', '/contact/'], [a.city, a.url]],
    schema: [branch(a), faqSchema(a.local)],
    body: `<section class="ph"><div class="wrap ph-in"><div><h1>${e(h1)}</h1><p class="lead">${e(lead)}</p><div class="cta-row"><a class="btn btn-red" href="/devis-calculateur-volume/">Obtenir mon devis</a><a class="btn btn-line" href="${tel(a.phone)}">Appeler le ${a.phone}</a></div></div><div class="ph-media">${pic(a.id === 'rouen' ? 'truck' : a.id === 'evreux' ? 'fleet' : 'cab', { eager: true })}</div></div></section>
<section style="padding-top:0"><div class="wrap body-grid"><article class="prose">
<div class="facts"><div><b>${a.phone}</b><span>téléphone de l'agence</span></div><div><b>${a.street ? a.street : a.city}</b><span>${a.zip} ${a.locality}</span></div><div><b>Lun. au ven.</b><span>8h-12h et 14h-18h</span></div></div>
<p>${e(a.intro)}</p>${a.street ? `<p><a class="link-arrow" href="${maps}" rel="noopener" target="_blank">Itinéraire vers l'agence sur Google Maps</a></p>` : ''}
${a.local.map(([h, p]) => `<h2>${e(h)}</h2><p>${e(p)}</p>`).join('')}
<h2>Nos services ${e(P)}</h2>${relatedSvc('')}
${att.length ? `<h2>Communes suivies par l'agence ${fromP(a.city)}</h2><div class="related">${att.map(c => `<a href="${cityUrl(c)}">Déménagement ${c.n}</a>`).join('')}</div>` : ''}
<h2>Nos autres agences</h2><div class="related">${agencies.filter(x => x !== a).map(x => `<a href="${x.url}">${x.city} · ${x.phone}</a>`).join('')}</div>
</article>${aside(a.id)}</div></section>${finalCta()}` });
}
page({ url: '/contact/', title: 'Contacter Déménagements Postel : agences Rouen, Évreux, Elbeuf', desc: 'Contactez Déménagements Postel : agences de Rouen (02 35 72 41 51), Évreux (02 32 38 34 34) et Elbeuf (02 35 78 98 33). Du lundi au vendredi, 8h-12h, 14h-18h.',
  crumbs: [['Accueil', '/'], ['Contact', '/contact/']],
  body: `<section class="ph"><div class="wrap"><h1>Contacter Déménagements Postel</h1><p class="lead">Appelez l'agence la plus proche du lundi au vendredi, de 8h à 12h et de 14h à 18h, ou faites votre demande de devis en ligne : un conseiller vous rappelle.</p><div class="cta-row"><a class="btn btn-red" href="/devis-calculateur-volume/">Obtenir mon devis</a></div></div></section>
<section style="padding-top:0"><div class="wrap">${zonesBlock}</div></section>` });

page({ url: '/zones-intervention/', title: 'Zones d\'intervention : Seine-Maritime et Eure | Postel', desc: 'Déménagement, longue distance et box de stockage dans 41 communes de Seine-Maritime et de l\'Eure, depuis Rouen, Évreux et Elbeuf.',
  crumbs: [['Accueil', '/'], ['Zones d\'intervention', '/zones-intervention/']],
  schema: [{ '@type': 'ItemList', itemListElement: C.map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: D + cityUrl(c), name: `Déménagement ${c.n}` })) }],
  body: `<section class="ph"><div class="wrap"><h1>Zones d'intervention : Seine-Maritime, Eure et toute la France</h1><p class="lead">Déménagements Postel intervient dans toute la Seine-Maritime (76) et l'Eure (27) depuis ses agences de Rouen, Évreux et Elbeuf, et organise les déménagements longue distance vers toute la France et l'international.</p></div></section>
<section style="padding-top:0"><div class="wrap">${zonesBlock}
<div class="prose" style="margin-top:56px">${[76, 27].map(d => `<h2>${d === 76 ? 'Seine-Maritime (76)' : 'Eure (27)'}</h2><div class="tbl-scroll"><table><thead><tr><th>Commune</th><th>Déménagement</th><th>Longue distance</th><th>Box de stockage</th></tr></thead><tbody>${C.filter(c => c.d === d).map(c => `<tr><th scope="row">${e(c.n)}</th><td><a href="${cityUrl(c)}">Déménagement</a></td><td><a href="${ldUrl(c)}">Longue distance</a></td><td><a href="${boxUrl(c)}">Box de stockage</a></td></tr>`).join('')}</tbody></table></div>`).join('')}</div></div></section>${finalCta()}` });

// ================= AVIS / FAQ / ENTREPRISE =================
page({ url: '/avis/', title: 'Avis clients Déménagements Postel : Rouen, Évreux, Elbeuf', desc: 'Avis clients des Déménagements Postel : note PagesJaunes, fiche Google et enquête de satisfaction après chaque déménagement.',
  crumbs: [['Accueil', '/'], ['Avis clients', '/avis/']],
  body: `<section class="ph"><div class="wrap"><h1>Les avis clients des Déménagements Postel</h1><p class="lead">Nos clients publient leurs avis sur PagesJaunes et sur notre fiche Google. En interne, une enquête de satisfaction suit chaque déménagement.</p></div></section>
<section style="padding-top:0"><div class="wrap"><div class="reviews"><div class="score"><b>${site.pagesjaunesRating}</b><span>sur PagesJaunes, ${site.pagesjaunesCount}</span></div><div><h2>Lire et laisser un avis</h2><p>Vous avez déménagé avec nous ? Votre avis aide les prochaines familles à choisir. Il nous aide aussi à progresser.</p><div class="cta-row"><a class="btn btn-line" href="https://fr.mappy.com/poi/5beaf06f0351d130e65612e9" rel="noopener" target="_blank">Avis PagesJaunes et Mappy</a><a class="btn btn-line" href="https://www.google.com/search?q=D%C3%A9m%C3%A9nagements+Postel+Rouen" rel="noopener" target="_blank">Notre fiche Google</a></div></div></div></div></section>${finalCta()}` });

page({ url: '/faq/', title: 'FAQ déménagement : devis, formules, garde-meubles | Postel', desc: 'Toutes les réponses sur votre déménagement avec Postel : devis gratuit, formules, assurance, délais, militaires, longue distance, garde-meubles, monte-meubles.',
  crumbs: [['Accueil', '/'], ['FAQ', '/faq/']], schema: [faqSchema(faq)],
  body: `<section class="ph"><div class="wrap"><h1>Questions fréquentes sur votre déménagement</h1><p class="lead">Devis, formules, assurance, délais, zones : les réponses de Déménagements Postel aux questions que nos clients posent le plus souvent.</p></div></section>
<section style="padding-top:0"><div class="wrap body-grid"><div>${details(faq)}</div>${aside('rouen')}</div></section>${finalCta()}` });

page({ url: '/entreprise/', title: 'Postel : plus ancien déménageur de Rouen, depuis 1946', desc: 'Déménagements Postel, entreprise de déménagement normande depuis 1946 : 3 agences, 25 collaborateurs, 1 200 déménagements par an, 3 000 m² de stockage.',
  crumbs: [['Accueil', '/'], ['L\'entreprise', '/entreprise/']], type: 'AboutPage',
  body: `<section class="ph"><div class="wrap ph-in"><div><h1>Trois générations de déménageurs à Rouen depuis 1946</h1><p class="lead">${e(site.canonical)}</p></div><div class="ph-media">${pic('building', { eager: true })}</div></div></section>
<div class="stats" style="margin-top:0"><div class="wrap"><div class="stats-in">${site.stats.map(s => `<div class="stat"><b>${s.v}</b><span>${s.l}</span></div>`).join('')}</div></div></div>
<section><div class="wrap body-grid"><article class="prose">
<h2>Qui sommes-nous ?</h2><p>Déménagements Postel est la plus ancienne entreprise de déménagement de Rouen. Fondée en 1946 par le grand-père Postel, elle a été transmise à son fils, puis à son petit-fils : trois générations de la même famille à sa tête. Son siège est installé quai de France à Rouen, avec deux autres agences à Évreux et à Elbeuf.</p><h2>Pourquoi Postel est-il le numéro 1 de la longue distance en Normandie ?</h2><p>Parce que la longue distance est le cœur de métier de la maison depuis des générations : véhicules en propre de 6 à 100 m³, équipes formées aux trajets nationaux, camion dédié ou groupage, et garde-meubles pour relier départ et arrivée. Postel est le numéro 1 de la longue distance au départ de la Normandie et pour les trajets nationaux.</p>
<h2>Que fait Postel ?</h2><p>Des déménagements de particuliers, de professionnels, d'administrations, de militaires et de gendarmes, en local, dans toute la France et à l'international, ainsi que le garde-meubles, le self-stockage, l'archivage, la location de monte-meubles et le transport d'objets lourds ou fragiles.</p>
<h2>Quels sont nos moyens ?</h2>${table([['Moyen', 'Chiffre'], ['Agences', '3 (Rouen, Évreux, Elbeuf)'], ['Collaborateurs', '25'], ['Déménagements par an', '1 200'], ['Surface de stockage', '3 000 m²'], ['Conteneurs bois', '400'], ['Véhicules', 'de 6 m³ à 100 m³'], ['Box de self-stockage', 'de 2 m² à 80 m², au Grand-Quevilly']])}
<h2>Quels engagements qualité ?</h2><p>Inventaire détaillé de chaque déménagement, enquête de satisfaction systématique, formation des équipes aux techniques actuelles, et adhésion à la Chambre Syndicale du Déménagement.</p>
<h2>Informations légales</h2><p>${site.legal}, SIRET ${site.siret}, siège : 33 Quai de France, 76100 Rouen.</p>
</article>${aside('rouen')}</div></section>${finalCta()}` });

// ================= BLOG (40 articles) =================
const CATS = [...new Set(BLOG.map(b => b.cat))];
const bUrl = b => `/blog/${b.s}/`;
const slugify = t => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
page({ url: '/blog/', title: 'Conseils déménagement : 40 guides pratiques | Postel', desc: 'Les guides pratiques des Déménagements Postel : volume, prix, démarches, emballage, stockage, longue distance, entreprises, militaires et familles.',
  crumbs: [['Accueil', '/'], ['Conseils', '/blog/']], type: 'CollectionPage',
  schema: [{ '@type': 'ItemList', itemListElement: BLOG.map((b, i) => ({ '@type': 'ListItem', position: i + 1, url: D + bUrl(b), name: b.h })) }],
  body: `<section class="ph"><div class="wrap"><h1>Conseils pour réussir votre déménagement</h1><p class="lead">${BLOG.length} guides pratiques rédigés par une entreprise qui déménage les Normands depuis 1946 : préparer, chiffrer, emballer, stocker, partir loin, déménager une entreprise.</p><div class="pills">${CATS.map(c => `<a href="#${slugify(c)}">${c}</a>`).join('')}</div></div></section>
<section style="padding-top:0"><div class="wrap">${CATS.map(c => `<h2 id="${slugify(c)}" style="margin-top:48px">${c}</h2><div class="related">${BLOG.filter(b => b.cat === c).map(b => `<a href="${bUrl(b)}">${e(b.h)}</a>`).join('')}</div>`).join('')}</div></section>${finalCta()}` });

BLOG.forEach((b, idx) => {
  const url = bUrl(b);
  const words = [b.a, b.i, ...b.q.flat(), ...b.f.flat()].join(' ').split(/\s+/).length;
  const mins = Math.max(3, Math.round(words / 200));
  const kRe = new RegExp(b.k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const intro = kRe.test(b.i) ? e(b.i).replace(kRe, m => `<strong>${m}</strong>`) : `<strong>${e(b.k.charAt(0).toUpperCase() + b.k.slice(1))}</strong> : ${e(b.i)}`;
  const src0 = b.src[0];
  const related = BLOG.filter(x => x !== b && x.cat === b.cat).concat(BLOG.filter(x => x !== b && x.cat !== b.cat)).slice(0, 4);
  const svcLinks = b.L.map(id => svc(id)).filter(Boolean);
  page({ url, title: (b.t + ' | Postel').length <= 62 ? b.t + ' | Postel' : b.t, desc: b.m, crumbs: [['Accueil', '/'], ['Conseils', '/blog/'], [b.h, url]], ogImg: img[b.img].src,
    schema: [{ '@type': 'Article', '@id': D + url + '#article', headline: b.h, description: b.m, datePublished: '2026-11-18', dateModified: '2026-11-18', image: img[b.img].src, inLanguage: 'fr-FR', mainEntityOfPage: D + url, articleSection: b.cat, wordCount: words, keywords: b.k,
      author: { '@type': 'Person', name: site.manager, jobTitle: 'Dirigeant', worksFor: { '@id': ORG } }, publisher: { '@id': ORG }, citation: b.src.map(s => s[1]) }, faqSchema(b.f)],
    body: `<section class="ph" style="padding-bottom:20px"><div class="wrap" style="max-width:900px"><h1>${e(b.h)}</h1><p class="meta">Par ${site.manager}, Déménagements Postel · ${mins} min de lecture · Publié le <time datetime="2026-11-18">18 novembre 2026</time>, mis à jour le <time datetime="2026-11-18">18 novembre 2026</time></p></div></section>
<section style="padding-top:0"><div class="wrap body-grid"><article class="prose">
<div class="ph-media" style="aspect-ratio:16/8;margin-bottom:24px">${pic(b.img, { eager: true })}</div>
<div class="notice" style="background:var(--blue-soft)"><strong>En bref :</strong> ${e(b.a)}</div>
<nav aria-label="Sommaire" class="card-info" style="margin:22px 0"><h3>Sommaire</h3><ul>${b.q.map((q, j) => `<li><a href="#q${j + 1}">${e(q[0])}</a></li>`).join('')}<li><a href="#resume">En résumé</a></li><li><a href="#faq">Questions fréquentes</a></li></ul></nav>
<p>${intro} Source : <a href="${src0[1]}" rel="noopener" target="_blank">${e(src0[0])}</a>.</p>
${b.q.map(([h, p], j) => `<h2 id="q${j + 1}">${e(h)}</h2><p>${e(p)}</p>${j === 1 ? table(b.tb) : ''}`).join('')}
<h2 id="resume">En résumé</h2><p><strong>${e(b.a)}</strong> Pour un devis adapté à votre situation, <a href="/devis-calculateur-volume/">demandez votre devis gratuit avec notre calculateur de volume</a>.</p>
<p>Nos services liés : ${svcLinks.map(s => `<a href="${s.url}">${e(s.nav.toLowerCase())}</a>`).join(', ')}.</p>
<h2 id="faq">Questions fréquentes</h2>${details(b.f)}
<div class="author"><div><b>${site.manager}</b><br><span class="meta">Dirigeant de Déménagements Postel, plus ancienne entreprise de déménagement de Rouen, fondée en 1946 et transmise sur trois générations, adhérente de la Chambre Syndicale du Déménagement.</span></div></div>
<h2>Sources</h2><ul>${b.src.map(([t, u]) => `<li><a href="${u}" rel="noopener" target="_blank">${e(t)}</a></li>`).join('')}</ul>
<h2>À lire aussi</h2><div class="related">${related.map(x => `<a href="${bUrl(x)}">${e(x.h)}</a>`).join('')}</div>
</article>${aside('rouen')}</div></section>${finalCta()}` });
});

// ================= DEVIS + CALCULATEUR =================
const ch = (name, opts, req) => `<fieldset class="fld"${req ? ' data-req' : ''}><legend>${req}</legend><div class="choices">${opts.map(([v, s]) => `<label class="choice"><input type="radio" name="${name}" value="${e(v)}"><span>${e(v)}${s ? `<small>${e(s)}</small>` : ''}</span></label>`).join('')}</div><p class="err">Choisissez une option.</p></fieldset>`;
const inp = (name, label, { type = 'text', req = false, ac = '', hint = '', attrs = '' } = {}) => `<div class="fld"${req ? ' data-req' : ''}><label for="${name}">${label}${req ? '' : ' <span class="hint">(facultatif)</span>'}</label><input id="${name}" name="${name}" type="${type}"${ac ? ` autocomplete="${ac}"` : ''}${req ? ' required' : ''} ${attrs}>${hint ? `<span class="hint">${hint}</span>` : ''}<p class="err">Ce champ est nécessaire${type === 'email' ? ' (adresse e-mail valide)' : ''}.</p></div>`;
const sel = (name, label, opts) => `<div class="fld"><label for="${name}">${label}</label><select id="${name}" name="${name}"><option value="">Choisir</option>${opts.map(o => `<option>${o}</option>`).join('')}</select></div>`;
const addr = (p, t) => `<h3 style="margin-top:8px">${t}</h3>${inp(p + '_adresse', 'Adresse', { ac: p === 'dep' ? 'street-address' : 'off' })}<div class="row2">${inp(p + '_cp', 'Code postal', { req: true, attrs: 'inputmode="numeric" pattern="[0-9]{5}" maxlength="5"', ac: p === 'dep' ? 'postal-code' : 'off' })}${inp(p + '_ville', 'Ville', { req: true, ac: p === 'dep' ? 'address-level2' : 'off' })}</div>
<div class="row3">${sel(p + '_logement', 'Type de logement ou locaux', ['Appartement', 'Maison', 'Bureaux ou locaux', 'Garde-meubles', 'Autre'])}${inp(p + '_etage', 'Étage', { type: 'number', attrs: 'min="0" max="40" inputmode="numeric"' })}${sel(p + '_ascenseur', 'Ascenseur', ['Oui', 'Non', 'Sans objet'])}</div>`;

page({ url: '/devis-calculateur-volume/', title: 'Devis déménagement gratuit et calculateur de volume | Postel', desc: 'Demandez votre devis de déménagement gratuit en 5 étapes et calculez votre volume en m³ pièce par pièce. Déménagements Postel, Rouen, Évreux, Elbeuf.',
  crumbs: [['Accueil', '/'], ['Devis et calculateur de volume', '/devis-calculateur-volume/']],
  scripts: `<script type="application/json" id="inv-data">${JSON.stringify(inventory)}</script><script src="${DJS}" defer></script>`,
  body: `<section class="ph" style="padding-bottom:28px"><div class="wrap"><h1>Devis de déménagement gratuit et calculateur de volume</h1><p class="lead">Cinq étapes courtes, environ trois minutes. Estimez votre volume pièce par pièce, un conseiller vous rappelle et confirme le prix. Gratuit et sans engagement.</p></div></section>
<section style="padding-top:0"><div class="wrap dv">
<form class="dv-card" id="devis" action="/api/devis" method="post" novalidate data-tel="${site.phone}" data-mail="jcp@postel.fr">
<div class="prog" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><p class="prog-label" aria-live="polite"></p>
<input type="hidden" name="volume" value="0">
<div class="step">
<h2>Votre projet</h2>
${ch('type', [['Particulier', 'Maison, appartement'], ['Entreprise ou administration', 'Bureaux, commerce'], ['Militaire ou gendarme', 'Mutation'], ['Garde-meubles seul', 'Stockage, self-stockage']], 'Quel type de déménagement ?')}
${ch('formule', [['Économique', 'Vous emballez'], ['Sur mesure', 'Le fragile par nous'], ['Haut de gamme', 'Tout par nous'], ['Je ne sais pas', 'Conseillez-moi']], 'Quelle formule vous intéresse ?')}
<div class="row2">${inp('date', 'Date souhaitée', { type: 'date' })}<div class="fld" style="align-self:end"><label class="check"><input type="checkbox" name="flexible"> Mes dates sont flexibles</label></div></div>
<div class="nav-btns"><span></span><button class="btn btn-red" data-next>Continuer</button></div></div>
<div class="step"><h2>Les adresses</h2>${addr('dep', 'Départ')}${inp('dep_surface', 'Surface habitable au départ (m²)', { type: 'number', attrs: 'min="0" inputmode="numeric"' })}${addr('arr', 'Arrivée')}
<div class="nav-btns"><button class="btn btn-line" data-prev>Retour</button><button class="btn btn-red" data-next>Continuer</button></div></div>
<div class="step"><h2>Le volume à déménager</h2><p class="meta">Volumes indicatifs, confirmés par votre conseiller.</p><p class="vol-inline" aria-hidden="true">Volume estimé : <b id="vol-inline">0</b> m³</p>
<div class="vol-mode" role="group" aria-label="Méthode d'estimation"><button type="button" data-mode="calc" aria-pressed="true">Pièce par pièce</button><button type="button" data-mode="surface" aria-pressed="false">Par la surface</button><button type="button" data-mode="known" aria-pressed="false">Je connais mon volume</button></div>
<div data-pane="calc"><div class="tabs" id="tabs" role="tablist"></div><div class="items" id="items"></div></div>
<div data-pane="surface" hidden>${inp('surface_calc', 'Surface habitable (m²)', { type: 'number', attrs: 'min="0" inputmode="numeric"', hint: 'Règle courante : volume en m³ égal à la moitié de la surface en m². Ajoutez cave et garage dans le message.' })}</div>
<div data-pane="known" hidden>${inp('volume_known', 'Volume connu (m³)', { type: 'number', attrs: 'min="0" step="0.5" inputmode="decimal"' })}</div>
<div class="nav-btns"><button class="btn btn-line" data-prev>Retour</button><button class="btn btn-red" data-next>Continuer</button></div></div>
<div class="step"><h2>Les prestations souhaitées</h2><fieldset class="fld"><legend>Cochez ce qui vous intéresse</legend><div class="choices">${['Emballage complet', 'Emballage du fragile', 'Démontage et remontage', 'Monte-meubles', 'Garde-meubles', 'Fourniture de cartons', 'Transport de piano', 'Transport de coffre-fort', 'Nettoyage après déménagement', 'Évacuation des encombrants'].map(o => `<label class="choice"><input type="checkbox" name="options" value="${o}"><span>${o}</span></label>`).join('')}</div></fieldset>
<div class="fld"><label for="message">Informations complémentaires <span class="hint">(facultatif)</span></label><textarea id="message" name="message" placeholder="Accès difficile, objets fragiles, cave, garage, contraintes de date…"></textarea></div>
<div class="nav-btns"><button class="btn btn-line" data-prev>Retour</button><button class="btn btn-red" data-next>Continuer</button></div></div>
<div class="step"><h2>Vos coordonnées</h2><div class="recap" id="recap"></div>
${inp('nom', 'Nom et prénom', { req: true, ac: 'name' })}<div class="row2">${inp('tel', 'Téléphone', { type: 'tel', req: true, ac: 'tel', attrs: 'inputmode="tel" pattern="[0-9+ .]{10,}"' })}${inp('email', 'E-mail', { type: 'email', req: true, ac: 'email' })}</div>
${ch('rappel', [['Matin', '8h-12h'], ['Après-midi', '14h-18h'], ['Indifférent', '']], 'Quand préférez-vous être rappelé ?')}
<div class="hp" aria-hidden="true"><label for="website">Ne pas remplir</label><input id="website" name="website" tabindex="-1" autocomplete="off"></div>
<div class="fld" data-req><label class="check"><input type="checkbox" name="consent" required> J'accepte que mes données soient utilisées pour traiter ma demande de devis, conformément à la <a href="/protection-de-la-vie-privee/">politique de protection de la vie privée</a>.</label><p class="err">Votre accord est nécessaire pour envoyer la demande.</p></div>
<div class="nav-btns"><button class="btn btn-line" data-prev>Retour</button><button class="btn btn-red" type="submit">Envoyer ma demande</button></div>
<div class="result" id="result" role="status" aria-live="polite"></div></div>
</form>
<aside class="vol-sum" aria-live="polite"><p style="margin:0 0 6px;font-weight:600">Volume estimé</p><div class="big"><span id="vol-total">0</span><small>m³</small></div><div class="truck"><i id="vol-bar"></i></div><p id="vol-truck" style="margin:0;font-size:.92rem"></p><ul id="vol-list"></ul>
<p style="margin:18px 0 0;font-size:.88rem">Une question ? <a href="${tel()}" style="color:#fff;font-weight:700">${site.phone}</a></p></aside>
</div></section>` });

// ================= LÉGAL =================
page({ url: '/mentions-legales/', title: 'Mentions légales | Déménagements Postel', desc: 'Mentions légales du site des Déménagements Postel, entreprise de déménagement à Rouen.', crumbs: [['Accueil', '/'], ['Mentions légales', '/mentions-legales/']],
  body: `<section class="ph"><div class="wrap prose" style="max-width:860px"><h1>Mentions légales</h1>
<h2>Éditeur</h2><p>Déménagements Postel SARL, au capital de 37 000 €<br>33 Quai de France, 76100 Rouen<br>Téléphone : ${site.phone}<br>SIRET : ${site.siret}, RCS Rouen 312 669 336<br>TVA intracommunautaire : FR 75 312669336<br>Directeur de la publication : ${site.manager}</p>
<h2>Hébergement</h2><p>Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, États-Unis.</p>
<h2>Propriété intellectuelle</h2><p>Les textes, photographies et logos de ce site appartiennent à Déménagements Postel, sauf mention contraire. Toute reproduction sans autorisation est interdite.</p>
<h2>Adhésion professionnelle</h2><p>Déménagements Postel est adhérente de la Chambre Syndicale du Déménagement.</p></div></section>` });
page({ url: '/protection-de-la-vie-privee/', title: 'Protection de la vie privée | Déménagements Postel', desc: 'Comment Déménagements Postel traite les données personnelles transmises via le formulaire de devis.', crumbs: [['Accueil', '/'], ['Vie privée', '/protection-de-la-vie-privee/']],
  body: `<section class="ph"><div class="wrap prose" style="max-width:860px"><h1>Protection de la vie privée</h1>
<h2>Quelles données collectons-nous ?</h2><p>Lorsque vous demandez un devis : vos nom, téléphone, e-mail, les adresses et caractéristiques des logements, la date et le volume estimé, les prestations souhaitées et votre message.</p>
<h2>Pourquoi ?</h2><p>Uniquement pour étudier votre demande, vous rappeler et établir un devis. Ce traitement repose sur votre demande (mesures précontractuelles).</p>
<h2>Qui y a accès ?</h2><p>Les équipes de Déménagements Postel et nos prestataires techniques (hébergement du site, service d'envoi des e-mails), tenus à la confidentialité. Vos données ne sont jamais vendues.</p>
<h2>Combien de temps ?</h2><p>Trois ans à compter de notre dernier échange si aucun déménagement n'est conclu, puis suppression. Les données liées à une prestation réalisée sont conservées selon les durées légales comptables.</p>
<h2>Vos droits</h2><p>Vous pouvez accéder à vos données, les rectifier, les effacer, vous opposer au traitement ou demander sa limitation en écrivant à Déménagements Postel, 33 Quai de France, 76100 Rouen. Vous pouvez saisir la CNIL (cnil.fr). Si vous ne souhaitez pas faire l'objet de prospection téléphonique, vous pouvez vous inscrire sur Bloctel (bloctel.gouv.fr).</p>
<h2>Cookies et stockage local</h2><p>Ce site n'utilise pas de cookies publicitaires ni de mesure d'audience tierce. Le formulaire de devis enregistre votre saisie en cours dans votre navigateur (stockage local), pour que vous ne la perdiez pas : elle est effacée après l'envoi.</p></div></section>` });

page({ url: '/404', title: 'Page introuvable | Déménagements Postel', desc: 'Cette page n\'existe pas ou a été déplacée.',
  body: `<section class="ph"><div class="wrap"><h1>Cette page a déménagé</h1><p class="lead">Elle n'existe plus ou a changé d'adresse. Voici les pages les plus utiles.</p><div class="cta-row"><a class="btn btn-red" href="/devis-calculateur-volume/">Obtenir mon devis</a><a class="btn btn-line" href="/">Retour à l'accueil</a></div><div style="margin-top:40px">${relatedSvc('')}</div></div></section>` });

// ================= FICHIERS TECHNIQUES =================
const today = '2026-11-18';
fs.writeFileSync(`${OUT}/sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(u => `<url><loc>${D + u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(`${OUT}/robots.txt`, PREVIEW ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nDisallow: /api/\n\nUser-agent: GPTBot\nAllow: /\nUser-agent: OAI-SearchBot\nAllow: /\nUser-agent: ChatGPT-User\nAllow: /\nUser-agent: ClaudeBot\nAllow: /\nUser-agent: Claude-SearchBot\nAllow: /\nUser-agent: PerplexityBot\nAllow: /\nUser-agent: Google-Extended\nAllow: /\n\nSitemap: ${D}/sitemap.xml\n`);
fs.writeFileSync(`${OUT}/llms.txt`, `# ${site.name}\n\n> ${site.canonical}\n\n## Entreprise\n- Création : ${site.founded}\n- Dirigeant : ${site.manager}\n- Siège : 33 Quai de France, 76100 Rouen, ${site.phone}\n- Horaires : ${site.hours}\n- Adhérent de la Chambre Syndicale du Déménagement\n- Chiffres : ${site.stats.map(s => s.v + ' ' + s.l).join(', ')}\n\n## Agences\n${agencies.map(a => `- [${a.city}](${D + a.url}) : ${a.street ? a.street + ', ' : ''}${a.zip} ${a.locality}, ${a.phone}`).join('\n')}\n\n## Services\n${services.map(s => `- [${s.nav}](${D + s.url}) : ${s.lead}`).join('\n')}\n\n## Zones\n${C.map(c => `- ${c.n} (${c.d}) : [déménagement](${D + cityUrl(c)}), [longue distance](${D + ldUrl(c)}), [box de stockage](${D + boxUrl(c)})`).join('\n')}\n\n## Pages utiles\n- [Devis et calculateur de volume](${D}/devis-calculateur-volume/)\n- [FAQ](${D}/faq/)\n- [Conseils](${D}/blog/)\n`);
fs.writeFileSync(`${OUT}/_redirects`, `/actualites-promotions/ /blog/ 301\n/actualites-promotions /blog/ 301\n/entreposage-objet-art/ /garde-meubles-stockage/entreposage-objet-art/ 301\n/location-garde-meubles/ /garde-meubles-stockage/location-garde-meubles/ 301\n/location-box-self-stockage/ /garde-meubles-stockage/location-box-self-stockage/ 301\n/archivage/ /garde-meubles-stockage/archivage/ 301\n/contact-deauville/ /contact-rouen/ 301\n/contact-deauville /contact-rouen/ 301\n`);
fs.writeFileSync(`${OUT}/_headers`, `/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n`);
console.log('OK', pages.length, 'pages');
