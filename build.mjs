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
fs.cpSync('assets/img', `${OUT}/assets/img`, { recursive: true });

const e = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const D = site.domain;
const abs = u => u.startsWith('/') ? D + u : u;
const tel = (p = site.phone) => `tel:+33${p.replace(/\s/g, '').slice(1)}`;
const pic = (k, { eager = false, sizes = '(max-width: 900px) 100vw, 50vw' } = {}) => { const i = img[k]; const [W, H] = i.r; const srcset = i.w.map(w => `/assets/img/${i.f}-${w}.webp ${w}w`).join(', '); return `<img src="${i.src}" srcset="${srcset}" sizes="${sizes}" alt="${e(i.alt)}" width="${W}" height="${H}" style="object-position:${i.pos}"${eager ? ' fetchpriority="high" decoding="async"' : ' loading="lazy" decoding="async"'}>`; };
const svg = (d, c = '') => `<svg class="ico${c ? ' ' + c : ''}" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const ic = {
  arr: svg('<path d="M4 12h15M13 6l6 6-6 6"/>', 'ico-arr'), chev: svg('<path d="m6 9 6 6 6-6"/>', 'chev'), phone: svg('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'),
  check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>'), dash: svg('<path d="M7 12h10"/>'), close: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  shield: svg('<path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/>'), list: svg('<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>'),
  chat: svg('<path d="M4 5h16v11H9l-5 4z"/>'), users: svg('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14a6.5 6.5 0 0 1 3.5 6"/>'),
  lock: svg('<rect x="4.5" y="10.5" width="15" height="10" rx="1"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>'), truck: svg('<path d="M2.5 6h11v10h-11zM13.5 9.5h4.5l3.5 3.5v3h-8"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/>'),
  clock: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'), pin: svg('<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>'),
};
const star = f => `<svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="g${Math.round(f * 100)}"><stop offset="${f * 100}%" stop-color="currentColor"/><stop offset="${f * 100}%" stop-color="#E2E6EC"/></linearGradient></defs><path fill="url(#g${Math.round(f * 100)})" d="m12 2.8 2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"/></svg>`;
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
const DEVIS = '/devis-calculateur-volume/';
const maps = a => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Déménagements Postel ${a.street} ${a.zip} ${a.locality}`)}`;

// ---------- Schéma entreprise (une seule entité cohérente) ----------
const branch = a => ({ '@type': 'MovingCompany', '@id': D + a.url + '#agence', name: `${site.name} ${a.city}`, url: D + a.url, telephone: a.intl, parentOrganization: { '@id': ORG },
  address: { '@type': 'PostalAddress', ...(a.street ? { streetAddress: a.street } : {}), postalCode: a.zip, addressLocality: a.locality, addressRegion: 'Normandie', addressCountry: 'FR' },
  geo: { '@type': 'GeoCoordinates', latitude: a.lat, longitude: a.lng },
  openingHoursSpecification: site.hoursSchema.map(h => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.days, opens: h.opens, closes: h.closes })) });
const orgSchema = {
  '@type': 'MovingCompany', '@id': ORG, name: site.name, legalName: site.legal, url: D + '/', logo: D + img.logo, image: D + img.hero.src, description: site.canonical,
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
const SVC_IMG = { particulier: 'equipeCarton', 'longue-distance': 'tracteur', militaire: 'flotte', professionnel: 'chargement', international: 'chargementConteneur', 'garde-meubles': 'conteneurs', 'monte-meubles': 'monteMeubles', piano: 'pianoQueue', 'coffre-fort': 'coffreFort', fournitures: 'cartons' };
services.forEach(s => { if (SVC_IMG[s.id]) s.image = SVC_IMG[s.id]; });
const SUB_IMG = { 'location-garde-meubles': 'conteneurs', 'location-box-self-stockage': 'selfStockage', archivage: 'entrepot', 'entreposage-objet-art': 'caisse' };
storageSub.forEach(s => { const k = Object.keys(SUB_IMG).find(x => s.url.includes(x)); if (k) s.image = SUB_IMG[k]; });
const MENU = {
  move: [['particulier', 'Maison, appartement, trois formules'], ['longue-distance', 'N°1 au départ de la Normandie'], ['professionnel', 'Bureaux, commerces, administrations'], ['militaire', 'Mutations, dossier administratif'], ['international', 'Europe et au-delà']],
  spec: [['monte-meubles', 'Par la fenêtre ou le balcon'], ['piano', 'Pianos droits et à queue'], ['coffre-fort', 'Particuliers et professionnels'], ['fournitures', 'Cartons, adhésifs, protections']],
  store: [['/garde-meubles-stockage/', 'Garde-meubles', 'Conteneurs bois, enlèvement à domicile'], ['/garde-meubles-stockage/location-box-self-stockage/', 'Box en self-stockage', 'De 2 à 80 m², au Grand-Quevilly'], ['/garde-meubles-stockage/archivage/', 'Archivage', 'Documents des particuliers et entreprises'], ['/garde-meubles-stockage/entreposage-objet-art/', 'Œuvres d\'art', 'Entreposage et transport sécurisés']],
  co: [['/entreprise/', 'Notre histoire', 'Trois générations depuis 1946'], ['/avis/', 'Avis clients', 'Note et avis vérifiables'], ['/faq/', 'Questions fréquentes', 'Devis, formules, assurance'], ['/contact/', 'Contact', 'Agences et demande de rappel']],
};
const mi = (u, t, d) => `<a class="mi" href="${u}"><b>${e(t)}</b><span>${e(d)}</span></a>`;
const msvc = ([id, d]) => mi(svc(id).url, svc(id).nav === 'Piano' ? 'Pianos' : svc(id).nav === 'Coffre-fort' ? 'Coffres-forts' : svc(id).nav, d);
const cur = (p, u) => p === u || (u !== '/' && p.startsWith(u)) ? ' aria-current="page"' : '';
const header = p => `<a class="skip" href="#main">Aller au contenu</a>
<div class="topbar"><div class="wrap topbar-in"><span>Le plus ancien déménageur de Rouen, depuis 1946</span><span class="tb-ag">${agencies.map(a => `<span>${a.city} <a href="${tel(a.phone)}">${a.phone}</a></span>`).join('')}</span></div></div>
<header class="hd"><div class="wrap hd-in">
<a class="hd-logo" href="/" aria-label="Déménagements Postel, accueil"><img src="${img.logo}" alt="Déménagements Postel, garde-meubles et self-stockage" width="263" height="140"></a>
<nav class="nav" aria-label="Navigation principale"><ul>
<li class="ni has-mega"><button class="nl" type="button" aria-expanded="false" aria-controls="m-svc">Prestations ${ic.chev}</button>
<div class="mega" id="m-svc"><div class="mega-in" style="--cols:3"><div><h4>Déménager</h4>${MENU.move.map(msvc).join('')}</div><div><h4>Manutention spécialisée</h4>${MENU.spec.map(msvc).join('')}</div>
<a class="mega-feat" href="${svc('longue-distance').url}">${pic('tracteur', { sizes: '400px' })}<div><b>N°1 de la longue distance au départ de la Normandie</b><span>Un seul interlocuteur, partout en France</span></div></a>
<div class="mega-foot"><span>Particuliers, entreprises, administrations, militaires : un déménageur, tous les déménagements.</span><a class="link-arrow" href="/demenageur/">Toutes nos prestations</a></div></div></div></li>
<li class="ni has-mega"><button class="nl" type="button" aria-expanded="false" aria-controls="m-gm">Garde-meubles ${ic.chev}</button>
<div class="mega" id="m-gm"><div class="mega-in" style="--cols:3"><div><h4>Stockage</h4>${MENU.store.slice(0, 2).map(x => mi(...x)).join('')}</div><div><h4>Services</h4>${MENU.store.slice(2).map(x => mi(...x)).join('')}</div>
<a class="mega-feat" href="/garde-meubles-stockage/">${pic('conteneurs', { sizes: '400px' })}<div><b>3 000 m² de stockage, 400 conteneurs bois</b><span>Entrepôts sous vidéosurveillance</span></div></a></div></div></li>
<li class="ni has-mega"><button class="nl" type="button" aria-expanded="false" aria-controls="m-ag">Agences ${ic.chev}</button>
<div class="mega" id="m-ag"><div class="mega-in" style="--cols:4">${agencies.map(a => `<div class="ag-mini"><h4>${e(a.role)}</h4><b>${a.city}</b><p>${a.street ? e(a.street) + '<br>' : ''}${a.zip} ${a.locality}</p><a href="${tel(a.phone)}">${a.phone}</a><br><a class="meta" href="${a.url}">Page de l'agence</a></div>`).join('')}
<div class="ag-mini"><h4>Zones</h4><b>${C.length} communes</b><p>Seine-Maritime et Eure, et toute la France pour la longue distance.</p><a href="/zones-intervention/">Zones d'intervention</a></div></div></div></li>
<li class="ni has-mega"><button class="nl" type="button" aria-expanded="false" aria-controls="m-co">L'entreprise ${ic.chev}</button>
<div class="mega" id="m-co"><div class="mega-in" style="--cols:3"><div><h4>Déménagements Postel</h4>${MENU.co.slice(0, 2).map(x => mi(...x)).join('')}</div><div><h4>Vous informer</h4>${MENU.co.slice(2).map(x => mi(...x)).join('')}</div>
<a class="mega-feat" href="/entreprise/">${pic('equipeAgence', { sizes: '400px' })}<div><b>Trois générations, une même exigence depuis 1946</b><span>L'histoire de la famille Postel</span></div></a></div></div></li>
<li class="ni"><a class="nl" href="/blog/"${cur(p, '/blog/')}>Conseils</a></li>
</ul></nav>
<a class="hd-tel" href="${tel()}">${ic.phone}<span><b>${site.phone}</b><small>Lun. au ven., 8h-12h, 14h-18h</small></span></a>
<a class="btn btn-primary hd-cta" href="${DEVIS}">Demander un devis</a>
<button class="burger" type="button" aria-controls="mnav" aria-expanded="false" aria-label="Ouvrir le menu"><i></i><i></i><i></i></button>
</div></header>
<div class="mnav" id="mnav" role="dialog" aria-modal="true" aria-label="Menu" aria-hidden="true">
<div class="mnav-top"><img src="${img.logo}" alt="Déménagements Postel" width="263" height="140"><button class="mnav-close" type="button" aria-label="Fermer le menu">${ic.close}</button></div>
<div class="mnav-body">
<details><summary>Prestations ${ic.chev}</summary><ul>${[...MENU.move, ...MENU.spec].map(([id, d]) => `<li><a href="${svc(id).url}">${svc(id).nav}<small>${e(d)}</small></a></li>`).join('')}<li><a href="/demenageur/"><b>Toutes nos prestations</b></a></li></ul></details>
<details><summary>Garde-meubles ${ic.chev}</summary><ul>${MENU.store.map(([u, t, d]) => `<li><a href="${u}">${e(t)}<small>${e(d)}</small></a></li>`).join('')}</ul></details>
<details><summary>Agences ${ic.chev}</summary><ul>${agencies.map(a => `<li><a href="${a.url}">${a.city}<small>${a.phone}</small></a></li>`).join('')}<li><a href="/zones-intervention/">Zones d'intervention<small>${C.length} communes en Seine-Maritime et dans l'Eure</small></a></li></ul></details>
<details><summary>L'entreprise ${ic.chev}</summary><ul>${MENU.co.map(([u, t, d]) => `<li><a href="${u}">${e(t)}<small>${e(d)}</small></a></li>`).join('')}</ul></details>
<a class="ml" href="/blog/">Conseils</a>
</div>
<div class="mnav-foot"><a class="btn btn-primary" href="${DEVIS}">Demander un devis gratuit</a><div class="mnav-tels">${agencies.map(a => `<a href="${tel(a.phone)}"><b>${a.city}</b>${a.phone}</a>`).join('')}</div></div>
</div>`;

const footer = () => `<footer class="ft"><div class="wrap">
<div class="ft-top">
<div class="ft-brand"><a class="ft-logo" href="/"><img src="${img.logo}" alt="Déménagements Postel" width="263" height="140" loading="lazy"></a>
<p>La plus ancienne entreprise de déménagement de Rouen, fondée en 1946 et transmise sur trois générations de la famille Postel. Numéro 1 de la longue distance au départ de la Normandie.</p>
<div class="ft-csd"><img src="/assets/img/csd.png" alt="Logo de la Chambre Syndicale du Déménagement" width="44" height="44" loading="lazy"><span>Adhérent de la Chambre Syndicale du Déménagement</span></div></div>
<div><h3>Déménagement</h3><ul>${['particulier', 'longue-distance', 'professionnel', 'militaire', 'international'].map(id => `<li><a href="${svc(id).url}">${svc(id).nav}</a></li>`).join('')}<li><a href="/demenageur/">Toutes les prestations</a></li></ul></div>
<div><h3>Stockage et services</h3><ul>${MENU.store.map(([u, t]) => `<li><a href="${u}">${e(t)}</a></li>`).join('')}${['monte-meubles', 'piano', 'coffre-fort', 'fournitures'].map(id => `<li><a href="${svc(id).url}">${svc(id).nav}</a></li>`).join('')}</ul></div>
<div><h3>Entreprise</h3><ul>${MENU.co.map(([u, t]) => `<li><a href="${u}">${e(t)}</a></li>`).join('')}<li><a href="/blog/">Conseils déménagement</a></li><li><a href="/zones-intervention/">Zones d'intervention</a></li><li><a href="${DEVIS}">Devis et calculateur de volume</a></li></ul></div>
<div class="ft-ag"><h3>Nos agences</h3><ul>${agencies.map(a => `<li><b>${a.city}</b>${a.street ? e(a.street) + ', ' : ''}${a.zip} ${a.locality}<br><a href="${tel(a.phone)}">${a.phone}</a></li>`).join('')}<li>${site.hours}</li></ul></div>
</div>
<div class="ft-bottom"><span>© ${new Date().getFullYear()} ${site.name}. Tous droits réservés.</span>
<nav aria-label="Liens légaux"><a href="/mentions-legales/">Mentions légales</a><a href="/protection-de-la-vie-privee/">Protection de la vie privée</a><a href="/contact/">Contact</a></nav></div>
</div></footer>
<div class="mbar" role="region" aria-label="Actions rapides"><a class="btn btn-ghost" href="${tel()}">${ic.phone} Appeler</a><a class="btn btn-primary" href="${DEVIS}">Demander un devis</a></div>`;

function page({ url, title, desc, body, schema = [], crumbs, scripts = '', ogImg = img.hero.src, type = 'WebPage' }) {
  if (title.length > 65) console.warn('TITLE LONG', title.length, url);
  if (desc.length > 160) console.warn('DESC LONG', desc.length, url);
  const graph = [orgSchema, { '@type': 'WebSite', '@id': D + '/#site', url: D + '/', name: site.name, publisher: { '@id': ORG }, inLanguage: 'fr-FR' },
    { '@type': type, '@id': D + url + '#page', url: D + url, name: title, description: desc, isPartOf: { '@id': D + '/#site' }, about: { '@id': ORG }, inLanguage: 'fr-FR' },
    ...(crumbs ? [crumbSchema(crumbs)] : []), ...schema];
  if (url === '/') graph.push(...agencies.map(branch));
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${e(title)}</title><meta name="description" content="${e(desc)}">
<link rel="canonical" href="${D + url}">${PREVIEW ? '\n<meta name="robots" content="noindex,nofollow">' : '<meta name="robots" content="index,follow,max-image-preview:large">'}
<meta property="og:type" content="website"><meta property="og:locale" content="fr_FR"><meta property="og:site_name" content="${site.name}"><meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(desc)}"><meta property="og:url" content="${D + url}"><meta property="og:image" content="${abs(ogImg)}">
<meta name="theme-color" content="#12213A"><link rel="icon" href="${img.logo}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,300..700&display=swap">
<link rel="stylesheet" href="${CSS}">
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}</script>
</head><body>${header(url)}<main id="main">${crumbs && crumbs.length > 1 ? `<nav class="crumbs" aria-label="Fil d'Ariane"><ol class="wrap">${crumbs.map(([n, u], i) => i === crumbs.length - 1 ? `<li aria-current="page">${e(n)}</li>` : `<li><a href="${u}">${e(n)}</a></li>`).join('')}</ol></nav>` : ''}
${body}</main>${url === DEVIS ? footer().replace(/<div class="mbar"[\s\S]*$/, '') : footer()}<script src="${JS}" defer></script>${scripts}</body></html>`;
  const file = url === '/404' ? `${OUT}/404.html` : `${OUT}${url}index.html`;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  if (url !== '/404') pages.push(url);
}

// ---------- Blocs réutilisables ----------
const finalCta = (h = 'Votre devis gratuit, sans engagement', p = 'Estimez votre volume en ligne en trois minutes. Un conseiller vous rappelle, confirme le prix et propose une visite technique si besoin.') => `<section class="final on-dark"><div class="final-media">${pic('cabine', { sizes: '100vw' })}</div><div class="wrap final-in"><div class="rv"><span class="eyebrow light">Devis gratuit</span><h2>${h}</h2><p>${p}</p></div><div class="rv d1"><div class="cta-row"><a class="btn btn-primary" href="${DEVIS}">Demander un devis gratuit ${ic.arr}</a><a class="btn btn-light" href="/contact/#rappel">Être rappelé</a></div><span class="final-tel">Ou appelez le <a href="${tel()}">${site.phone}</a>, du lundi au vendredi</span></div></div></section>`;
const details = q => q.map(([a, b]) => `<details><summary>${e(a)}</summary><p>${e(b)}</p></details>`).join('');
const table = t => `<div class="tbl-scroll"><table><thead><tr>${t[0].map(x => `<th scope="col">${e(x)}</th>`).join('')}</tr></thead><tbody>${t.slice(1).map(r => `<tr>${r.map((x, i) => i ? `<td>${e(x)}</td>` : `<th scope="row">${e(x)}</th>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const aside = (agId) => { const a = ag(agId) || ag('rouen'); return `<aside class="aside"><div class="card-cta"><h3>Devis gratuit</h3><p>Estimation du volume en ligne, rappel par un conseiller, visite technique si nécessaire.</p><a class="btn btn-primary" href="${DEVIS}">Demander un devis</a><a class="btn btn-light" href="${tel(a.phone)}">${ic.phone} ${a.phone}</a></div>
<div class="card-info"><h3>Nos agences</h3><ul>${agencies.map(x => `<li><a href="${x.url}"><b>${x.city}</b></a> · <a href="${tel(x.phone)}">${x.phone}</a></li>`).join('')}<li class="meta">${site.hours}</li></ul></div></aside>`; };
const relatedSvc = (except) => `<div class="related">${services.filter(s => s.id !== except).map(s => `<a href="${s.url}">${s.nav}</a>`).join('')}</div>`;
const sign = `<div class="ph-sign"><span>Depuis 1946</span><span>Devis et visite gratuits</span><span>Adhérent CSD</span></div>`;

// ================= ACCUEIL =================
const svcBlock = `<div class="feat rv">
<figure class="feat-media" style="margin:0">${pic('equipeCarton', { sizes: '(max-width: 900px) 100vw, 58vw' })}</figure>
<div><span class="num">01 · PARTICULIERS</span><h3>Déménagement de particuliers</h3><p>Du studio rouennais à la maison de famille, un conseiller visite gratuitement votre logement, puis une équipe formée protège, charge, transporte et livre vos biens. Vous choisissez ce que vous faites vous-même.</p>
<ul class="ticks"><li>${ic.check}<span><b>Économique</b>Vous emballez, nous protégeons et transportons.</span></li><li>${ic.check}<span><b>Sur mesure</b>Nous prenons en charge le fragile et le mobilier.</span></li><li>${ic.check}<span><b>Haut de gamme</b>Nous faisons tout, jusqu'à la remise en place.</span></li></ul>
<div class="cta-row"><a class="link-arrow" href="${svc('particulier').url}">Le déménagement de particuliers</a></div></div></div>
<div class="trio">${[['professionnel', 'chargement', '02', 'Entreprises et administrations', 'Bureaux, commerces, sièges sociaux : planning, étiquetage et reprise d\'activité sans coupure.'], ['militaire', 'flotte', '03', 'Militaires et gendarmes', 'Des mutations organisées autour de votre date de prise de poste et des pièces demandées par votre administration.'], ['international', 'chargementConteneur', '04', 'International', 'Un départ de Normandie vers l\'Europe et au-delà, avec un interlocuteur unique du devis à la livraison.']].map(([id, k, n, t, p], i) => `<a class="card rv d${i}" href="${svc(id).url}"><div class="card-media">${pic(k, { sizes: '(max-width: 620px) 100vw, (max-width: 900px) 50vw, 33vw' })}</div><div class="card-body"><span class="num">${n}</span><h3>${t} ${ic.arr}</h3><p>${p}</p></div></a>`).join('')}</div>
<div class="idx"><div class="idx-head rv"><span class="num">05 · SAVOIR-FAIRE</span><h3>Manutention et transports spécialisés</h3><p>Les objets lourds, fragiles ou précieux demandent du matériel et des gestes précis. Nos équipes s'en chargent au quotidien.</p><a class="link-arrow" href="/demenageur/">Toutes nos prestations</a></div>
<div class="idx-list rv d1">${[['monte-meubles', 'monteMeubles', 'Location de monte-meubles', 'Passer les meubles par la fenêtre ou le balcon, sans abîmer les parties communes.'], ['piano', 'pianoDroit', 'Transport de pianos', 'Pianos droits et à queue, protégés et manipulés avec le matériel adapté.'], ['coffre-fort', 'coffreFort', 'Transport de coffres-forts', 'Pour les particuliers et les professionnels, avec une étude des accès.'], ['fournitures', 'cartons', 'Cartons et fournitures', 'Cartons, adhésifs et protections pour préparer votre déménagement.']].map(([id, k, t, p]) => `<a class="ix" href="${svc(id).url}"><div class="ix-media">${pic(k, { sizes: '120px' })}</div><div><b>${t}</b><span>${p}</span></div>${ic.arr}</a>`).join('')}</div></div>`;

const PLANS = [
  ['Économique', 'Vous préparez les cartons, nous protégeons, chargeons et transportons.', 'Budget serré, temps disponible', [1, 0, 0, 0, 1, 1]],
  ['Sur mesure', 'Vous emballez l\'essentiel, nous gérons le fragile et le mobilier.', 'Le meilleur équilibre entre prix et tranquillité', [1, 1, 1, 0, 1, 1]],
  ['Haut de gamme', 'Nous prenons tout en charge, jusqu\'à la remise en place.', 'Agenda chargé, aucun carton à faire', [1, 1, 1, 1, 1, 1]],
];
const PLAN_ROWS = ['Protection des meubles', 'Emballage du fragile', 'Démontage et remontage des meubles', 'Emballage de tous les cartons', 'Transport et livraison', 'Inventaire au chargement et à la livraison'];
const plansBlock = `<div class="plans rv">${PLANS.map(([n, d, w, inc], i) => `<div class="plan${i === 1 ? ' hl' : ''}">${i === 1 ? '<span class="plan-tag">Notre recommandation</span>' : ''}<h3>${n}</h3><p>${d}</p><ul>${PLAN_ROWS.map((r, j) => `<li class="${inc[j] ? '' : 'no'}">${inc[j] ? ic.check : ic.dash}<span>${r}${inc[j] ? '' : '<span class="sr"> : non inclus</span>'}</span></li>`).join('')}${i === 2 ? `<li>${ic.check}<span>Remise en place à l'arrivée</span></li>` : `<li class="no">${ic.dash}<span>Remise en place à l'arrivée<span class="sr"> : non incluse</span></span></li>`}</ul><p class="meta" style="min-height:0">${w}</p><a class="btn ${i === 1 ? 'btn-primary' : 'btn-outline'}" href="${DEVIS}?formule=${encodeURIComponent(n)}">Devis ${n.toLowerCase()}</a></div>`).join('')}</div><p class="plans-note">Le contenu exact de chaque formule est détaillé et confirmé dans votre devis écrit.</p>`;

const trustItems = [
  [ic.shield, 'Adhérent de la Chambre Syndicale du Déménagement', 'Postel est référencée dans l\'annuaire de la CSD, l\'organisation professionnelle du métier.', 'csd'],
  [ic.list, 'Inventaire détaillé', 'Chaque bien est listé au chargement et contrôlé à la livraison.'],
  [ic.chat, 'Enquête de satisfaction', 'Après chaque déménagement, vous évaluez l\'équipe : la qualité est suivie chantier par chantier.'],
  [ic.users, 'Équipes formées', 'Nos déménageurs sont formés aux techniques actuelles de protection et de manutention.'],
  [ic.lock, 'Stockage sécurisé', 'Entrepôts sous vidéosurveillance, conteneurs bois plombés pour les objets de valeur.'],
  [ic.truck, 'Véhicules de 6 à 100 m³', 'Du porteur urbain à la semi-remorque, le bon gabarit pour chaque rue et chaque volume.'],
];
const assur = `<div class="assur">${trustItems.map(([i, h, p, csd]) => `<div class="as">${csd ? '<img src="/assets/img/csd.png" alt="Logo de la Chambre Syndicale du Déménagement" width="40" height="40" loading="lazy">' : i}<div><h3>${h}</h3><p>${p}</p></div></div>`).join('')}</div>`;
const rating = parseFloat(site.pagesjaunesRating.replace(',', '.'));
const scoreBlock = `<div class="score"><span class="eyebrow">Avis clients</span><div class="score-n"><b>${site.pagesjaunesRating.split('/')[0]}</b><span>/ 5</span></div><div class="stars" role="img" aria-label="Note de ${site.pagesjaunesRating}">${[1, 2, 3, 4, 5].map(n => star(Math.max(0, Math.min(1, rating - n + 1)))).join('')}</div><p><b>${site.pagesjaunesCount} sur PagesJaunes.</b> Une enquête de satisfaction suit aussi chaque déménagement, pour évaluer le travail de chaque équipe.</p><div class="cta-row"><a class="btn btn-outline btn-sm" href="https://fr.mappy.com/poi/5beaf06f0351d130e65612e9" rel="noopener" target="_blank">Lire les avis</a><a class="btn btn-outline btn-sm" href="https://www.google.com/search?q=D%C3%A9m%C3%A9nagements+Postel+Rouen" rel="noopener" target="_blank">Notre fiche Google</a></div></div>`;

const agBlock = `<div class="ags">${agencies.map((a, i) => `<div class="agc rv d${i}"><small>${e(a.role)}</small><h3>${a.city}</h3><address>${a.street ? e(a.street) + '<br>' : ''}${a.zip} ${a.locality}</address><a class="tel" href="${tel(a.phone)}">${ic.phone}${a.phone}</a><p class="hrs">Du lundi au vendredi, 8h-12h et 14h-18h</p><div class="agc-links"><a href="${a.url}">Page de l'agence</a>${a.street ? `<a href="${maps(a)}" rel="noopener" target="_blank">Itinéraire</a>` : ''}</div></div>`).join('')}</div>
<div class="zones-c rv"><p><b>${C.length} communes desservies</b> en Seine-Maritime et dans l'Eure, et toute la France pour la longue distance.</p><div class="chips">${['Rouen', 'Le Havre', 'Évreux', 'Dieppe', 'Elbeuf', 'Vernon', 'Louviers', 'Fécamp'].map(n => C.find(c => c.n === n)).filter(Boolean).map(c => `<a href="${cityUrl(c)}">${c.n}</a>`).join('')}<a class="all" href="/zones-intervention/">Toutes les communes</a></div></div>`;

const zonesBlock = agBlock;
const homePosts = [BLOG[39], BLOG[0], BLOG[2]];
page({ url: '/', title: 'Déménageur en Normandie depuis 1946 : Rouen, Évreux | Postel', desc: 'Déménageur normand depuis 1946 : particuliers, entreprises, militaires, longue distance, garde-meubles. Agences à Rouen, Évreux et Elbeuf. Devis gratuit.',
  crumbs: [['Accueil', '/']],
  body: `<section class="hero"><div class="hero-media">${pic('hero', { eager: true, sizes: '100vw' })}</div>
<div class="hero-in"><div class="wrap" style="width:100%"><div class="hero-card"><span class="eyebrow">Plus ancien déménageur de Rouen</span>
<h1>Déménageur en Normandie <em>depuis 1946</em></h1>
<p class="lead">Trois générations de la famille Postel. Le numéro 1 de la longue distance au départ de la Normandie, pour les familles, les entreprises et les militaires.</p>
<div class="cta-row"><a class="btn btn-primary" href="${DEVIS}">Demander un devis gratuit ${ic.arr}</a><a class="btn btn-outline" href="#prestations">Découvrir nos prestations</a></div>
<div class="hero-sign"><span>${ic.pin}Rouen, Évreux, Elbeuf</span><span>${ic.shield}Adhérent CSD</span><span>${ic.phone}<a href="${tel()}" style="color:inherit">${site.phone}</a></span></div></div></div>
<div class="hero-year" aria-hidden="true"><b>1946</b><span>Rouen, Normandie</span></div></div></section>

<section class="figs" aria-labelledby="t-figs"><div class="wrap"><div class="figs-head rv"><h2 id="t-figs">Une maison familiale, une vraie structure</h2><p>Depuis 1946, Déménagements Postel s'est donné les moyens de déménager toute la Normandie, et de l'emmener partout en France.</p></div>
<div class="figs-grid rv d1">${[['1946', '', 'Fondée à Rouen par le grand-père Postel'], ['3', '', 'générations de la même famille'], ['25', '', 'collaborateurs formés'], ['1 200', '', 'déménagements par an'], ['3 000', 'm²', 'de stockage sécurisé'], ['400', '', 'conteneurs bois']].map(([v, u, l]) => `<div class="fig"><b>${v}${u ? `<small>${u}</small>` : ''}</b><span>${l}</span></div>`).join('')}</div></div></section>

<section id="prestations" aria-labelledby="t-svc"><div class="wrap"><div class="sh rv"><div><span class="eyebrow">Nos prestations</span><h2 id="t-svc">Chaque déménagement a son savoir-faire</h2></div><div><p>Particuliers, entreprises, administrations, militaires : un seul déménageur pour tous les projets, sur place comme à l'autre bout de la France.</p></div></div>${svcBlock}</div></section>

<section class="dark on-dark" aria-labelledby="t-ld"><div class="wrap ld"><div class="rv"><span class="eyebrow">Notre cœur de métier</span><h2 id="t-ld">Numéro 1 de la longue distance au départ de la Normandie</h2><p>Rouen Paris, Évreux Lyon, Le Havre Marseille, ou l'inverse : un seul interlocuteur organise votre déménagement national de bout en bout, avec nos propres véhicules de 6 à 100 m³.</p>
<ol class="steps"><li><div><b>Visite technique gratuite</b><span>Volume, accès, objets particuliers.</span></div></li><li><div><b>Devis écrit et détaillé</b><span>Camion dédié ou groupage, selon votre délai.</span></div></li><li><div><b>Emballage et protection</b><span>Couvertures, housses, cartons adaptés.</span></div></li><li><div><b>Transport par nos équipes</b><span>Itinéraire planifié, inventaire contrôlé.</span></div></li><li><div><b>Livraison et remontage</b><span>À la date convenue, ou après un passage en garde-meubles.</span></div></li></ol>
<div class="cta-row"><a class="btn btn-primary" href="${svc('longue-distance').url}">La longue distance ${ic.arr}</a><a class="btn btn-light" href="${DEVIS}">Demander un devis</a></div></div>
<div class="ld-media rv d1">${pic('tracteur', { sizes: '(max-width: 900px) 100vw, 50vw' })}<div class="ld-badge"><b>N°1</b>de la longue distance au départ de la Normandie</div></div></div></section>

<section class="story" aria-labelledby="t-story"><div class="wrap"><div class="story-grid">
<figure class="story-media rv" style="margin:0"><div class="main">${pic('equipeAgence', { sizes: '(max-width: 900px) 100vw, 58vw' })}</div><figcaption>Les équipes Déménagements Postel.</figcaption></figure>
<div class="rv d1"><span class="eyebrow">Depuis 1946</span><h2 id="t-story">Trois générations, une même exigence depuis 1946.</h2><p>Fondée à Rouen par le grand-père Postel, l'entreprise a été transmise à son fils, puis à la génération suivante. Plus ancienne entreprise de déménagement de Rouen, elle a grandi sans jamais perdre ce qui fait sa réputation : le soin des biens confiés et la parole donnée.</p>
<ol class="tl"><li><b>1946</b><span>Le grand-père Postel fonde l'entreprise à Rouen.</span></li><li><b>Deuxième génération</b><span>Son fils reprend et développe la maison.</span></li><li><b>Troisième génération</b><span>La transmission se poursuit au sein de la famille.</span></li><li><b>Aujourd'hui</b><span>3 agences, 25 collaborateurs, 1 200 déménagements par an.</span></li></ol>
<a class="link-arrow" href="/entreprise/">Découvrir l'entreprise</a></div></div>
<div class="strip">${[['equipeDos', 'Des équipes formées', 'Protection, manutention, remontage : des gestes appris et transmis.'], ['flotte', 'Une flotte en propre', 'Du porteur urbain à la semi-remorque, de 6 à 100 m³.'], ['conditionnement', 'Le soin du détail', 'Conteneurs bois fermés et plombés pour vos biens.']].map(([k, t, p], i) => `<figure class="rv d${i}"><div class="m">${pic(k, { sizes: '(max-width: 560px) 100vw, 33vw' })}</div><figcaption><b>${t}</b><span>${p}</span></figcaption></figure>`).join('')}</div></div></section>

<section aria-labelledby="t-gm"><div class="wrap gm"><div class="rv"><span class="eyebrow">Garde-meubles et self-stockage</span><h2 id="t-gm">Une véritable infrastructure de stockage</h2><p>Entre deux logements, pendant des travaux, lors d'une mutation ou d'une succession : vos biens sont stockés dans nos entrepôts sécurisés, le temps qu'il faut.</p>
<div class="gm-figs"><div><b>3 000 m²</b><span>de surface de stockage</span></div><div><b>400</b><span>conteneurs bois</span></div><div><b>80 m²</b><span>box de 2 à 80 m² au Grand-Quevilly</span></div></div>
<ul class="ticks"><li>${ic.lock}<span><b>Sécurité</b>Entrepôts sous vidéosurveillance, conteneurs plombés.</span></li><li>${ic.truck}<span><b>Enlèvement à domicile</b>Nous chargeons, stockons et relivrons à la date choisie.</span></li><li>${ic.clock}<span><b>Accès et durée libres</b>Box accessibles aux horaires d'ouverture, sans durée minimale.</span></li></ul>
<div class="cta-row"><a class="btn btn-primary" href="/garde-meubles-stockage/">Découvrir le garde-meubles ${ic.arr}</a><a class="btn btn-outline" href="${DEVIS}?type=${encodeURIComponent('Garde-meubles seul')}">Devis stockage</a></div></div>
<div class="mosaic rv d1"><figure>${pic('entrepot', { sizes: '(max-width: 900px) 100vw, 30vw' })}<figcaption>Entrepôt de stockage</figcaption></figure><figure>${pic('conteneurs', { sizes: '(max-width: 900px) 50vw, 30vw' })}<figcaption>Conteneurs bois</figcaption></figure><figure>${pic('box', { sizes: '(max-width: 900px) 50vw, 30vw' })}<figcaption>Box de self-stockage</figcaption></figure></div></div></section>

<section class="story" aria-labelledby="t-plans"><div class="wrap"><div class="sh rv"><div><span class="eyebrow">Nos formules</span><h2 id="t-plans">Trois formules, la même exigence</h2></div><div><p>Vous choisissez ce que vous faites vous-même et ce que nous prenons en charge. Le prix suit.</p></div></div>${plansBlock}</div></section>

<section aria-labelledby="t-proof"><div class="wrap proof"><div class="rv">${scoreBlock}</div><div class="rv d1"><h2 id="t-proof" style="margin-bottom:28px">Pourquoi nous faire confiance</h2>${assur}</div></div></section>

<section class="story" aria-labelledby="t-ag"><div class="wrap"><div class="sh rv"><div><span class="eyebrow">Nos agences</span><h2 id="t-ag">Trois agences en Seine-Maritime et dans l'Eure</h2></div><div><p>Des équipes proches de chez vous, qui connaissent vos rues, vos accès et vos mairies.</p></div></div>${agBlock}</div></section>

<section aria-labelledby="t-qa"><div class="wrap qa"><div class="rv"><span class="eyebrow">Questions fréquentes</span><h2 id="t-qa">Vos questions, nos réponses</h2><p>Devis, formules, assurance, délais : l'essentiel avant de réserver.</p><a class="link-arrow" href="/faq/">Toute la FAQ</a>
<h3 style="margin-top:56px">Conseils pour bien déménager</h3><div class="posts">${homePosts.map(b => `<a class="post" href="/blog/${b.s}/"><div class="pm">${pic(b.img, { sizes: '120px' })}</div><div><small>${e(b.cat)}</small><b>${e(b.h)}</b></div></a>`).join('')}</div><p style="margin-top:20px"><a class="link-arrow" href="/blog/">Nos ${BLOG.length} guides pratiques</a></p></div>
<div class="rv d1">${details(faq.slice(0, 7))}</div></div></section>
${finalCta()}`,
  schema: [faqSchema(faq.slice(0, 7))] });

// ================= SERVICES =================
for (const s of services) {
  const crumbs = [['Accueil', '/'], ...(s.url.startsWith('/demenageur/') ? [['Déménagement', '/demenageur/']] : []), [s.nav, s.url]];
  const nearCities = (s.id === 'longue-distance' ? C.slice(0, 12).map(c => `<a href="${ldUrl(c)}">Depuis ${c.n}</a>`) : s.id === 'garde-meubles' ? C.slice(0, 12).map(c => `<a href="${boxUrl(c)}">Box près ${fromP(c.n)}</a>`) : C.slice(0, 12).map(c => `<a href="${cityUrl(c)}">Déménagement ${c.n}</a>`)).join('');
  page({ url: s.url, title: s.title, desc: s.lead.slice(0, 155).replace(/\s\S*$/, '') + '.', crumbs,
    schema: [{ '@type': 'Service', '@id': D + s.url + '#service', name: s.h1, serviceType: s.nav, description: s.lead, provider: { '@id': ORG }, areaServed: orgSchema.areaServed, url: D + s.url }, ...(s.faq ? [faqSchema(s.faq)] : [])],
    body: `<section class="ph"><div class="wrap ph-in"><div class="rv"><h1>${e(s.h1)}</h1><p class="lead">${e(s.lead)}</p><div class="cta-row"><a class="btn btn-red" href="/devis-calculateur-volume/${s.id === 'militaire' ? '?type=Militaire ou gendarme' : s.id === 'professionnel' ? '?type=Entreprise ou administration' : ''}">Demander un devis</a><a class="btn btn-line" href="${tel()}">Appeler le ${site.phone}</a></div></div><div class="ph-media rv">${pic(s.image, { eager: true })}</div></div></section>
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
  body: `<section class="ph"><div class="wrap ph-in"><div><h1>Nos services de déménagement pour particuliers et professionnels</h1><p class="lead">Déménagements Postel prend en charge tous les déménagements, du studio rouennais au transfert d'un siège social, en Normandie, partout en France et à l'international, avec garde-meubles et matériel de manutention en propre.</p><div class="cta-row"><a class="btn btn-red" href="/devis-calculateur-volume/">Demander un devis</a></div></div><div class="ph-media">${pic('fleet', { eager: true })}</div></div></section>
<section style="padding-top:0"><div class="wrap">${svcBlock}<h2 style="margin-top:64px">Toutes nos prestations</h2>${relatedSvc('')}</div></section>${finalCta()}` });

for (const s of storageSub) {
  const gm = svc('garde-meubles');
  page({ url: s.url, title: s.title, desc: s.lead.slice(0, 150).replace(/\s\S*$/, '') + '.', crumbs: [['Accueil', '/'], ['Garde-meubles', gm.url], [s.h1, s.url]],
    schema: [{ '@type': 'Service', name: s.h1, provider: { '@id': ORG }, areaServed: 'Rouen et Normandie', url: D + s.url }, faqSchema(s.q)],
    body: `<section class="ph"><div class="wrap ph-in"><div><h1>${e(s.h1)}</h1><p class="lead">${e(s.lead)}</p><div class="cta-row"><a class="btn btn-red" href="/devis-calculateur-volume/?type=Garde-meubles seul">Demander un devis</a><a class="btn btn-line" href="${tel()}">Appeler le ${site.phone}</a></div></div><div class="ph-media">${pic(s.image, { eager: true })}</div></div></section>
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
    body: `<section class="ph"><div class="wrap ph-in"><div><h1>Déménagement ${e(P)} : votre déménageur depuis 1946</h1><p class="lead">Pour déménager ${e(P)} (${deptName(c.d)}), Déménagements Postel, plus ancien déménageur de Rouen, intervient depuis ${e(agTxt)} : visite technique et devis gratuits, trois formules et des véhicules de 6 à 100 m³ adaptés aux rues ${e(D)}.</p><div class="cta-row"><a class="btn btn-red" href="/devis-calculateur-volume/">Demander un devis</a><a class="btn btn-line" href="${tel(a.phone)}">Appeler le ${a.phone}</a></div></div>${media(v(i, imgs))}</div></section>
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
    body: `<section class="ph"><div class="wrap ph-in"><div><h1>Déménagement longue distance depuis ${e(c.n)}</h1><p class="lead">Numéro 1 de la longue distance au départ de la Normandie, Déménagements Postel organise votre déménagement ${e(D)} vers toute la France : Paris à ${paris} km, Lyon à ${dd[5][1]} km, Marseille à ${dd[8][1]} km à vol d'oiseau, en camion dédié ou en groupage.</p><div class="cta-row"><a class="btn btn-red" href="/devis-calculateur-volume/">Demander un devis</a><a class="btn btn-line" href="${tel(a.phone)}">Appeler le ${a.phone}</a></div></div>${media(v(i + 2, ['cab', 'fleet', 'truck']))}</div></section>
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
    body: `<section class="ph"><div class="wrap ph-in"><div><h1>Location de box de stockage ${c.site ? 'au Grand-Quevilly' : 'près ' + e(D)}</h1><p class="lead">${c.site ? `Les box de self-stockage Postel, de 2 à 80 m², sont installés au Grand-Quevilly même : aérés, protégés, équipés d'étagères et accessibles librement aux horaires d'ouverture.` : `Les box de self-stockage Postel, de 2 à 80 m², sont au Grand-Quevilly, à environ ${dGQ} km à vol d'oiseau ${e(D)}. ${closeBox ? 'Vous y venez librement aux horaires d\'ouverture' : 'Pour éviter le trajet, notre garde-meubles enlève vos biens à domicile'} et la durée de location est libre.`}</p><div class="cta-row"><a class="btn btn-red" href="/devis-calculateur-volume/?type=Garde-meubles seul">Demander un devis</a><a class="btn btn-line" href="${tel()}">Appeler le ${site.phone}</a></div></div>${media(v(i, ['containers', 'selfstorage', 'truckDepot']))}</div></section>
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
    body: `<section class="ph"><div class="wrap ph-in"><div><h1>${e(h1)}</h1><p class="lead">${e(lead)}</p><div class="cta-row"><a class="btn btn-red" href="/devis-calculateur-volume/">Demander un devis</a><a class="btn btn-line" href="${tel(a.phone)}">Appeler le ${a.phone}</a></div></div><div class="ph-media">${pic(a.id === 'rouen' ? 'truck' : a.id === 'evreux' ? 'fleet' : 'cab', { eager: true })}</div></div></section>
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
  body: `<section class="ph"><div class="wrap"><h1>Contacter Déménagements Postel</h1><p class="lead">Appelez l'agence la plus proche du lundi au vendredi, de 8h à 12h et de 14h à 18h, ou faites votre demande de devis en ligne : un conseiller vous rappelle.</p><div class="cta-row"><a class="btn btn-red" href="/devis-calculateur-volume/">Demander un devis</a></div></div></section>
<section style="padding-top:0"><div class="wrap">${zonesBlock}</div></section>
<section class="story" id="rappel"><div class="wrap qa"><div><span class="eyebrow">Être rappelé</span><h2>Un conseiller vous rappelle</h2><p>Laissez vos coordonnées et le créneau qui vous arrange : un conseiller Postel vous rappelle du lundi au vendredi, de 8h à 12h et de 14h à 18h, pour parler de votre projet.</p><p class="meta">Pour un devis chiffré, le <a href="${DEVIS}">formulaire de devis avec calculateur de volume</a> reste le plus rapide.</p></div>
<form class="cb" data-api="/api/devis" novalidate><input type="hidden" name="type" value="Demande de rappel">
<div class="fld" data-req><label for="cb-nom">Nom et prénom</label><input id="cb-nom" name="nom" type="text" autocomplete="name" required><p class="err">Indiquez votre nom.</p></div>
<div class="row2"><div class="fld" data-req><label for="cb-tel">Téléphone</label><input id="cb-tel" name="tel" type="tel" inputmode="tel" autocomplete="tel" pattern="[0-9+ .]{10,}" required><p class="err">Indiquez un numéro valide.</p></div><div class="fld" data-req><label for="cb-email">E-mail</label><input id="cb-email" name="email" type="email" autocomplete="email" required><p class="err">Indiquez une adresse e-mail valide.</p></div></div>
<div class="fld"><label for="cb-rappel">Créneau de rappel</label><select id="cb-rappel" name="rappel"><option>Indifférent</option><option>Matin (8h-12h)</option><option>Après-midi (14h-18h)</option></select></div>
<div class="fld"><label for="cb-msg">Votre projet <span class="hint">(facultatif)</span></label><textarea id="cb-msg" name="message" placeholder="Ville de départ et d'arrivée, date, type de logement…"></textarea></div>
<div class="hp" aria-hidden="true"><label for="cb-w">Ne pas remplir</label><input id="cb-w" name="website" tabindex="-1" autocomplete="off"></div>
<div class="fld" data-req><label class="check"><input type="checkbox" name="consent" required> J'accepte que mes données soient utilisées pour traiter ma demande, conformément à la <a href="/protection-de-la-vie-privee/">politique de protection de la vie privée</a>.</label><p class="err">Votre accord est nécessaire.</p></div>
<button class="btn btn-primary" type="submit">Être rappelé</button><div class="result" role="status" aria-live="polite"></div></form></div></section>` });

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
    schema: [{ '@type': 'Article', '@id': D + url + '#article', headline: b.h, description: b.m, datePublished: '2026-11-18', dateModified: '2026-11-18', image: D + img[b.img].src, inLanguage: 'fr-FR', mainEntityOfPage: D + url, articleSection: b.cat, wordCount: words, keywords: b.k,
      author: { '@type': 'Person', name: site.manager, jobTitle: 'Dirigeant', worksFor: { '@id': ORG } }, publisher: { '@id': ORG }, citation: b.src.map(s => s[1]) }, faqSchema(b.f)],
    body: `<section class="ph" style="padding-bottom:20px"><div class="wrap" style="max-width:900px"><h1>${e(b.h)}</h1><p class="meta">Par ${site.manager}, Déménagements Postel · ${mins} min de lecture · Publié le <time datetime="2026-11-18">18 novembre 2026</time>, mis à jour le <time datetime="2026-11-18">18 novembre 2026</time></p></div></section>
<section style="padding-top:0"><div class="wrap body-grid"><article class="prose">
<div class="art-media">${pic(b.img, { eager: true, sizes: '(max-width: 1000px) 100vw, 800px' })}</div>
<div class="notice" style="background:var(--blue-soft)"><strong>En bref :</strong> ${e(b.a)}</div>
<nav aria-label="Sommaire" class="toc"><b>Sommaire</b><ul>${b.q.map((q, j) => `<li><a href="#q${j + 1}">${e(q[0])}</a></li>`).join('')}<li><a href="#resume">En résumé</a></li><li><a href="#faq">Questions fréquentes</a></li></ul></nav>
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
  body: `<section class="ph" style="padding-bottom:28px"><div class="wrap"><h1>Devis de déménagement gratuit et calculateur de volume</h1><p class="lead">Six étapes courtes, environ trois minutes. Estimez votre volume pièce par pièce, un conseiller vous rappelle et confirme le prix. Gratuit et sans engagement.</p><div class="dv-trust"><span>${ic.check}Devis gratuit et sans engagement</span><span>${ic.check}Rappel par un conseiller</span><span>${ic.check}Vos données ne sont jamais revendues</span></div></div></section>
<section style="padding-top:0"><div class="wrap dv">
<form class="dv-card" id="devis" action="/api/devis" method="post" novalidate data-tel="${site.phone}" data-mail="jcp@postel.fr">
<div class="prog" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div><p class="prog-label" aria-live="polite"></p>
<input type="hidden" name="volume" value="0">
<div class="step">
<h2>Votre projet</h2>
${ch('type', [['Particulier', 'Maison, appartement'], ['Entreprise ou administration', 'Bureaux, commerce'], ['Militaire ou gendarme', 'Mutation'], ['Garde-meubles seul', 'Stockage, self-stockage']], 'Quel type de déménagement ?')}
${ch('formule', [['Économique', 'Vous emballez'], ['Sur mesure', 'Le fragile par nous'], ['Haut de gamme', 'Tout par nous'], ['Je ne sais pas', 'Conseillez-moi']], 'Quelle formule vous intéresse ?')}
<div class="nav-btns"><span></span><button class="btn btn-red" data-next>Continuer ${ic.arr}</button></div></div>
<div class="step"><h2>Adresse de départ</h2>${addr('dep', 'Logement actuel')}${inp('dep_surface', 'Surface habitable au départ (m²)', { type: 'number', attrs: 'min="0" inputmode="numeric"' })}
<div class="nav-btns"><button class="btn btn-line" data-prev>Retour</button><button class="btn btn-red" data-next>Continuer ${ic.arr}</button></div></div>
<div class="step"><h2>Arrivée et date</h2>${addr('arr', 'Nouveau logement')}<div class="row2">${inp('date', 'Date souhaitée', { type: 'date' })}<div class="fld" style="align-self:end"><label class="check"><input type="checkbox" name="flexible"> Mes dates sont flexibles</label></div></div>
<div class="nav-btns"><button class="btn btn-line" data-prev>Retour</button><button class="btn btn-red" data-next>Continuer ${ic.arr}</button></div></div>
<div class="step"><h2>Le volume à déménager</h2><p class="meta">Volumes indicatifs, confirmés par votre conseiller.</p><p class="vol-inline" aria-hidden="true"><span>Volume estimé</span><span><b id="vol-inline">0</b> m³</span></p>
<div class="vol-mode" role="group" aria-label="Méthode d'estimation"><button type="button" data-mode="calc" aria-pressed="true">Pièce par pièce</button><button type="button" data-mode="surface" aria-pressed="false">Par la surface</button><button type="button" data-mode="known" aria-pressed="false">Je connais mon volume</button></div>
<div data-pane="calc"><div class="tabs" id="tabs" role="tablist"></div><div class="items" id="items"></div></div>
<div data-pane="surface" hidden>${inp('surface_calc', 'Surface habitable (m²)', { type: 'number', attrs: 'min="0" inputmode="numeric"', hint: 'Règle courante : volume en m³ égal à la moitié de la surface en m². Ajoutez cave et garage dans le message.' })}</div>
<div data-pane="known" hidden>${inp('volume_known', 'Volume connu (m³)', { type: 'number', attrs: 'min="0" step="0.5" inputmode="decimal"' })}</div>
<div class="nav-btns"><button class="btn btn-line" data-prev>Retour</button><button class="btn btn-red" data-next>Continuer ${ic.arr}</button></div></div>
<div class="step"><h2>Les prestations souhaitées</h2><fieldset class="fld"><legend>Cochez ce qui vous intéresse</legend><div class="choices">${['Emballage complet', 'Emballage du fragile', 'Démontage et remontage', 'Monte-meubles', 'Garde-meubles', 'Fourniture de cartons', 'Transport de piano', 'Transport de coffre-fort', 'Nettoyage après déménagement', 'Évacuation des encombrants'].map(o => `<label class="choice"><input type="checkbox" name="options" value="${o}"><span>${o}</span></label>`).join('')}</div></fieldset>
<div class="fld"><label for="message">Informations complémentaires <span class="hint">(facultatif)</span></label><textarea id="message" name="message" placeholder="Accès difficile, objets fragiles, cave, garage, contraintes de date…"></textarea></div>
<div class="nav-btns"><button class="btn btn-line" data-prev>Retour</button><button class="btn btn-red" data-next>Continuer ${ic.arr}</button></div></div>
<div class="step"><h2>Vos coordonnées</h2><div class="recap" id="recap"></div>
${inp('nom', 'Nom et prénom', { req: true, ac: 'name' })}<div class="row2">${inp('tel', 'Téléphone', { type: 'tel', req: true, ac: 'tel', attrs: 'inputmode="tel" pattern="[0-9+ .]{10,}"' })}${inp('email', 'E-mail', { type: 'email', req: true, ac: 'email' })}</div>
${ch('rappel', [['Matin', '8h-12h'], ['Après-midi', '14h-18h'], ['Indifférent', '']], 'Quand préférez-vous être rappelé ?')}
<div class="hp" aria-hidden="true"><label for="website">Ne pas remplir</label><input id="website" name="website" tabindex="-1" autocomplete="off"></div>
<div class="fld" data-req><label class="check"><input type="checkbox" name="consent" required> J'accepte que mes données soient utilisées pour traiter ma demande de devis, conformément à la <a href="/protection-de-la-vie-privee/">politique de protection de la vie privée</a>.</label><p class="err">Votre accord est nécessaire pour envoyer la demande.</p></div>
<div class="nav-btns"><button class="btn btn-line" data-prev>Retour</button><button class="btn btn-red" type="submit">Envoyer ma demande</button></div>
<div class="result" id="result" role="status" aria-live="polite"></div></div>
</form>
<aside class="vol-sum" aria-live="polite"><p style="margin:0 0 6px;font-weight:600">Volume estimé</p><div class="big"><span id="vol-total">0</span><small>m³</small></div><div class="truck"><i id="vol-bar"></i></div><p id="vol-truck" style="margin:0;font-size:.92rem"></p><ul id="vol-list"></ul>
<p class="vol-sum-help">Une question ? Appelez le <a href="${tel()}">${site.phone}</a>, du lundi au vendredi.</p></aside>
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
  body: `<section class="ph"><div class="wrap"><h1>Cette page a déménagé</h1><p class="lead">Elle n'existe plus ou a changé d'adresse. Voici les pages les plus utiles.</p><div class="cta-row"><a class="btn btn-red" href="/devis-calculateur-volume/">Demander un devis</a><a class="btn btn-line" href="/">Retour à l'accueil</a></div><div style="margin-top:40px">${relatedSvc('')}</div></div></section>` });

// ================= FICHIERS TECHNIQUES =================
const today = '2026-11-18';
fs.writeFileSync(`${OUT}/sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(u => `<url><loc>${D + u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(`${OUT}/robots.txt`, PREVIEW ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nDisallow: /api/\n\nUser-agent: GPTBot\nAllow: /\nUser-agent: OAI-SearchBot\nAllow: /\nUser-agent: ChatGPT-User\nAllow: /\nUser-agent: ClaudeBot\nAllow: /\nUser-agent: Claude-SearchBot\nAllow: /\nUser-agent: PerplexityBot\nAllow: /\nUser-agent: Google-Extended\nAllow: /\n\nSitemap: ${D}/sitemap.xml\n`);
fs.writeFileSync(`${OUT}/llms.txt`, `# ${site.name}\n\n> ${site.canonical}\n\n## Entreprise\n- Création : ${site.founded}\n- Dirigeant : ${site.manager}\n- Siège : 33 Quai de France, 76100 Rouen, ${site.phone}\n- Horaires : ${site.hours}\n- Adhérent de la Chambre Syndicale du Déménagement\n- Chiffres : ${site.stats.map(s => s.v + ' ' + s.l).join(', ')}\n\n## Agences\n${agencies.map(a => `- [${a.city}](${D + a.url}) : ${a.street ? a.street + ', ' : ''}${a.zip} ${a.locality}, ${a.phone}`).join('\n')}\n\n## Services\n${services.map(s => `- [${s.nav}](${D + s.url}) : ${s.lead}`).join('\n')}\n\n## Zones\n${C.map(c => `- ${c.n} (${c.d}) : [déménagement](${D + cityUrl(c)}), [longue distance](${D + ldUrl(c)}), [box de stockage](${D + boxUrl(c)})`).join('\n')}\n\n## Pages utiles\n- [Devis et calculateur de volume](${D}/devis-calculateur-volume/)\n- [FAQ](${D}/faq/)\n- [Conseils](${D}/blog/)\n`);
fs.writeFileSync(`${OUT}/_redirects`, `/actualites-promotions/ /blog/ 301\n/actualites-promotions /blog/ 301\n/entreposage-objet-art/ /garde-meubles-stockage/entreposage-objet-art/ 301\n/location-garde-meubles/ /garde-meubles-stockage/location-garde-meubles/ 301\n/location-box-self-stockage/ /garde-meubles-stockage/location-box-self-stockage/ 301\n/archivage/ /garde-meubles-stockage/archivage/ 301\n/contact-deauville/ /contact-rouen/ 301\n/contact-deauville /contact-rouen/ 301\n`);
fs.writeFileSync(`${OUT}/_headers`, `/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n`);
console.log('OK', pages.length, 'pages');
