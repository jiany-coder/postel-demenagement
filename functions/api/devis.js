// Cloudflare Pages Function : réception des demandes de devis.
// Variables à définir dans Cloudflare (Settings > Environment variables) :
//   RESEND_API_KEY  clé API Resend (domaine postel-demenagement.fr vérifié)
//   DEVIS_TO        adresse(s) de réception, séparées par des virgules
//   DEVIS_FROM      ex. "Déménagements Postel <devis@postel-demenagement.fr>"
// Sans ces variables, la fonction répond 503 et le site affiche la solution de repli
// (téléphone + e-mail prérempli) : aucun faux succès n'est jamais affiché.
const esc = s => String(s ?? '').replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const LABELS = { type: 'Type', formule: 'Formule', date: 'Date souhaitée', flexible: 'Date flexible', dep_adresse: 'Départ adresse', dep_cp: 'Départ CP', dep_ville: 'Départ ville', dep_logement: 'Départ logement', dep_surface: 'Départ surface m²', dep_etage: 'Départ étage', dep_ascenseur: 'Départ ascenseur', arr_adresse: 'Arrivée adresse', arr_cp: 'Arrivée CP', arr_ville: 'Arrivée ville', arr_logement: 'Arrivée logement', arr_etage: 'Arrivée étage', arr_ascenseur: 'Arrivée ascenseur', volume: 'Volume estimé (m³)', mode_volume: 'Méthode volume', inventaire: 'Inventaire', options: 'Prestations', message: 'Message', nom: 'Nom', tel: 'Téléphone', email: 'E-mail', rappel: 'Créneau de rappel' };

export async function onRequestPost({ request, env }) {
  let d;
  try { d = await request.json(); } catch { return json({ ok: false, error: 'bad_json' }, 400); }
  if (d.website) return json({ ok: true }); // pot de miel : robot ignoré
  const email = String(d.email || '').trim(), tel = String(d.tel || '').trim(), nom = String(d.nom || '').trim();
  if (!nom || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || tel.replace(/\D/g, '').length < 9 || !d.consent)
    return json({ ok: false, error: 'invalid' }, 422);
  if (!env.RESEND_API_KEY || !env.DEVIS_TO || !env.DEVIS_FROM) return json({ ok: false, error: 'not_configured' }, 503);

  const rows = Object.keys(LABELS).filter(k => d[k] !== undefined && d[k] !== '' && !(Array.isArray(d[k]) && !d[k].length))
    .map(k => `<tr><td style="padding:6px 12px;color:#55657c">${LABELS[k]}</td><td style="padding:6px 12px"><b>${esc(Array.isArray(d[k]) ? d[k].join(', ') : d[k] === true ? 'oui' : d[k])}</b></td></tr>`).join('');
  const html = `<h2 style="font-family:Arial">Nouvelle demande de devis</h2><table style="font-family:Arial;font-size:14px;border-collapse:collapse">${rows}</table>`;
  const send = body => fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

  const r = await send({ from: env.DEVIS_FROM, to: env.DEVIS_TO.split(',').map(s => s.trim()), reply_to: email, subject: `Devis ${esc(d.type || '')} ${esc(d.dep_ville || '')} > ${esc(d.arr_ville || '')} : ${esc(nom)}`, html });
  if (!r.ok) return json({ ok: false, error: 'send_failed' }, 502);
  await send({ from: env.DEVIS_FROM, to: [email], subject: 'Votre demande de devis Déménagements Postel', html: `<p style="font-family:Arial">Bonjour ${esc(nom)},</p><p style="font-family:Arial">Nous avons bien reçu votre demande. Un conseiller vous rappelle du lundi au vendredi, de 8h à 12h et de 14h à 18h.</p>${html}<p style="font-family:Arial">Déménagements Postel, 02 35 72 41 51</p>` }).catch(() => {});
  return json({ ok: true });
}
function json(o, s = 200) { return new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json; charset=utf-8' } }); }
