// Données réelles Postel (sources : site actuel, mentions légales, annuaires).
// Toute donnée non vérifiée est marquée TODO dans le rapport client.
export const IMG = 'https://www.postel-demenagement.fr/wp-content/uploads/sites/6010/';

export const site = {
  domain: 'https://www.postel-demenagement.fr',
  name: 'Déménagements Postel',
  legal: 'SOC EXPLOIT DES DEMENAG POSTEL (Déménagements Postel SARL)',
  founded: 1946,
  manager: 'Jean-Charles Postel',
  siret: '312 669 336 00090',
  phone: '02 35 72 41 51',
  phoneIntl: '+33235724151',
  hours: 'Du lundi au vendredi, 8h à 12h et 14h à 18h',
  hoursSchema: [{ days: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '08:00', closes: '12:00' }, { days: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '14:00', closes: '18:00' }],
  canonical: "Déménagements Postel est la plus ancienne entreprise de déménagement de Rouen, fondée en 1946 et transmise sur trois générations de la famille Postel, numéro 1 de la longue distance au départ de la Normandie, avec des agences à Rouen, Évreux et Elbeuf, pour les particuliers, entreprises, administrations, militaires et gendarmes, en France et à l'international, avec garde-meubles et self-stockage.",
  csd: 'https://www.csdemenagement.fr/',
  pagesjaunesRating: '4,4/5',
  pagesjaunesCount: '89 avis récents',
  stats: [
    { v: '1946', l: 'fondée à Rouen, 3 générations' },
    { v: '3', l: 'agences en Normandie' },
    { v: '1 200', l: 'déménagements par an' },
    { v: '25', l: 'collaborateurs formés' },
    { v: '3 000 m²', l: 'de stockage sécurisé' },
    { v: '400', l: 'conteneurs bois' },
  ],
};

// Photos réelles Postel, recadrées et converties en WebP (assets/img). r = dimensions de la plus grande version.
const I = (f, w, r, alt, pos = '50% 50%') => ({ f, w, r, alt, pos, src: `/assets/img/${f}-${w[w.length - 1]}.webp` });
export const img = {
  logo: '/assets/img/logo-postel.png',
  hero: I('hero-camion', [800, 1280, 1920], [1920, 976], 'Semi-remorque Déménagements Postel aux couleurs de l\'agence de Rouen', '40% 50%'),
  flotte: I('flotte', [560, 960], [960, 450], 'Flotte de camions et de porteurs Déménagements Postel alignés devant le dépôt'),
  tracteur: I('tracteur', [560, 960], [960, 599], 'Tracteur routier rouge Postel devant les conteneurs bois du garde-meubles', '30% 50%'),
  chargementConteneur: I('chargement-conteneur', [560, 960], [960, 398], 'Camion Postel devant les conteneurs bois du garde-meubles'),
  conteneurs: I('conteneurs', [560, 960], [960, 398], 'Conteneurs bois numérotés empilés dans l\'entrepôt Postel'),
  equipeCarton: I('equipe-carton', [560, 960], [960, 398], 'Déménageur Postel portant un carton siglé devant les conteneurs', '60% 50%'),
  equipeDos: I('equipe-dos', [560, 960], [960, 399], 'Déménageur Postel en tenue de l\'entreprise dans l\'entrepôt', '70% 50%'),
  entrepot: I('entrepot', [560, 720], [720, 810], 'Rayonnages de l\'entrepôt de stockage Postel'),
  monteMeubles: I('monte-meubles', [560, 720], [720, 810], 'Monte-meubles déployé le long d\'une façade d\'immeuble'),
  box: I('box', [560, 960], [960, 598], 'Box de self-stockage ouvert, rempli de cartons et de meubles'),
  selfStockage: I('self-stockage', [560, 946], [946, 450], 'Client rangeant ses affaires dans un box de self-stockage'),
  chargement: I('chargement', [560, 960], [960, 499], 'Déménageur Postel arrimant le chargement dans un camion', '40% 50%'),
  pianoQueue: I('piano-queue', [560, 960], [960, 400], 'Piano à queue prêt à être transporté'),
  pianoDroit: I('piano-droit', [560, 960], [960, 400], 'Déménageurs Postel manipulant un piano droit protégé'),
  coffreFort: I('coffre-fort', [560, 960], [960, 400], 'Déménageurs Postel déplaçant un coffre-fort'),
  caisse: I('caisse', [560, 960], [960, 400], 'Caisse bois déplacée au chariot élévateur dans l\'entrepôt Postel'),
  cabine: I('cabine', [560, 960], [960, 400], 'Cabine d\'un camion Postel devant les conteneurs bois', '30% 50%'),
  equipeAgence: I('equipe-agence', [560, 960], [960, 500], 'L\'équipe Déménagements Postel réunie devant une agence'),
  cartons: I('cartons', [560, 960], [960, 400], 'Carton de déménagement au logo Postel'),
  conditionnement: I('conditionnement', [560, 960], [960, 400], 'Fermeture métallique d\'un conteneur bois du garde-meubles'),
};
// Anciennes clés (articles de blog, services) vers les nouvelles photos
Object.assign(img, { truck: img.hero, truckDepot: img.chargementConteneur, cab: img.tracteur, fleet: img.flotte, building: img.equipeAgence, containers: img.conteneurs, piano: img.pianoQueue, safe: img.coffreFort, boxes: img.equipeCarton, archives: img.entrepot, selfstorage: img.selfStockage, lift: img.monteMeubles });

export const agencies = [
  { id: 'rouen', city: 'Rouen', url: '/contact-rouen/', phone: '02 35 72 41 51', intl: '+33235724151', street: '33 Quai de France', zip: '76100', locality: 'Rouen', region: 'Seine-Maritime', lat: 49.4378, lng: 1.0815, role: 'Siège et agence principale',
    intro: "L'agence historique de Rouen, quai de France, pilote les déménagements de la métropole rouennaise, de la Seine-Maritime et les grands départs vers toute la France. Le self-stockage est situé au Grand-Quevilly, à quelques minutes.",
    local: [
      ["Pourquoi passer par une agence installée à Rouen ?", "Parce que les contraintes rouennaises se règlent mieux sur place : rues étroites du centre historique, quais, immeubles sans ascenseur de la rive droite, accès des résidences de la rive gauche. Nos équipes connaissent ces configurations et prévoient le bon véhicule, le monte-meubles si nécessaire et la demande d'autorisation de stationnement."],
      ["Quels quartiers et communes desservez-vous autour de Rouen ?", "Toute la métropole : Rouen centre, Mont-Saint-Aignan, Bois-Guillaume, Bihorel, Darnétal, Le Petit-Quevilly, Le Grand-Quevilly, Sotteville-lès-Rouen, Saint-Étienne-du-Rouvray, Canteleu, Déville-lès-Rouen, Maromme, Barentin et au-delà."],
    ] },
  { id: 'evreux', city: 'Évreux', url: '/contact-evreux/', phone: '02 32 38 34 34', intl: '+33232383434', street: '34 rue de Verdun', zip: '27000', locality: 'Évreux', region: 'Eure', lat: 49.0246, lng: 1.1508, role: 'Agence de l\'Eure',
    intro: "L'agence d'Évreux, rue de Verdun, couvre l'Eure : Évreux et son agglomération, la vallée de l'Eure, Pacy-sur-Eure, Vernon, Louviers, Bernay et les mutations du personnel de la base aérienne.",
    local: [
      ["Déménagez-vous les militaires de la base aérienne d'Évreux ?", "Oui. Postel déménage les militaires et les gendarmes à l'occasion de leurs mutations, au départ ou à destination d'Évreux. Nous établissons le devis selon les pièces demandées par votre administration et organisons le calendrier autour de votre date de prise de poste."],
      ["Quelles communes de l'Eure couvrez-vous depuis Évreux ?", "Évreux, Gravigny, Guichainville, Saint-Sébastien-de-Morsent, Pacy-sur-Eure, Vernon, Saint-Marcel, Gaillon, Louviers, Val-de-Reuil, Conches-en-Ouche, Breteuil, Bernay, Verneuil d'Avre et d'Iton, et l'ensemble du département."],
    ] },
  { id: 'elbeuf', city: 'Elbeuf', url: '/contact-elbeuf/', phone: '02 35 78 98 33', intl: '+33235789833', street: '', zip: '76500', locality: 'Elbeuf', region: 'Seine-Maritime', lat: 49.2866, lng: 1.0086, role: 'Agence de la boucle d\'Elbeuf',
    intro: "L'agence d'Elbeuf dessert la boucle d'Elbeuf, le sud de la métropole rouennaise et le nord de l'Eure, avec un accès rapide aux autoroutes A13 et A28 pour les départs longue distance.",
    local: [
      ["Quelles communes couvre l'agence d'Elbeuf ?", "Elbeuf, Caudebec-lès-Elbeuf, Saint-Aubin-lès-Elbeuf, Saint-Pierre-lès-Elbeuf, Cléon, Tourville-la-Rivière, Oissel, Grand-Couronne, ainsi que Louviers, Pont-de-l'Arche et Le Neubourg côté Eure."],
      ["Faut-il une visite à domicile pour un devis à Elbeuf ?", "Pour un appartement ou une petite maison, une estimation sur notre calculateur de volume suffit souvent. Au-delà, ou s'il y a des objets lourds, un conseiller se déplace gratuitement pour établir un devis exact."],
    ] },
];

// Univers de services. url = URL conservée de l'ancien site quand elle existe.
export const services = [
  { id: 'particulier', url: '/demenageur/demenagement-particulier/', nav: 'Particuliers', title: 'Déménagement de particuliers en Normandie et en France | Postel', h1: 'Déménagement de particuliers, de la maison à l\'appartement', kw: 'déménagement particulier Rouen',
    lead: "Un déménagement de particulier chez Postel, c'est une visite technique gratuite, un devis écrit, un inventaire détaillé et une équipe formée du chargement à la remise en place des meubles, en Normandie comme partout en France.",
    image: 'boxes',
    blocks: [
      ["Quelles formules de déménagement proposez-vous ?", "Trois niveaux, adaptés à votre budget : une formule économique où vous emballez vous-même et nous chargeons, transportons et livrons ; une formule sur mesure où nous prenons en charge le fragile et le démontage ; une formule haut de gamme où l'équipe emballe tout, démonte, remonte et remet en place. Le contenu exact de chaque formule est confirmé dans votre devis."],
      ["Comment estimez-vous le volume de mon logement ?", "Vous pouvez faire une première estimation en ligne avec notre calculateur de volume, pièce par pièce. Pour un devis ferme, un conseiller vient chez vous gratuitement : il note les meubles, les accès, l'étage et les objets particuliers."],
      ["Que se passe-t-il le jour du déménagement ?", "L'équipe protège les meubles (couvertures, housses, film), démonte ce qui doit l'être, charge selon un plan qui préserve le fragile, puis décharge et remonte à l'arrivée en suivant l'inventaire."],
      ["Fournissez-vous les cartons ?", "Oui : cartons standard, cartons livres, cartons penderie, papier bulle, adhésif et film. Ils peuvent être livrés avant le jour J."],
    ],
    table: [['Formule', 'Emballage', 'Démontage et remontage', 'Pour qui'], ['Économique', 'Par vous', 'Par vous', 'Budget serré, temps disponible'], ['Sur mesure', 'Fragile par Postel', 'Par Postel', 'Le meilleur équilibre'], ['Haut de gamme', 'Tout par Postel', 'Par Postel, avec remise en place', 'Aucun stress, agenda chargé']],
    faq: [
      ["Combien de temps à l'avance réserver ?", "Idéalement un à deux mois avant, et davantage pour un déménagement entre juin et septembre ou en fin de mois, périodes les plus demandées."],
      ["Le devis est-il payant ?", "Non. La visite technique et le devis sont gratuits et sans engagement."],
      ["Pouvez-vous stocker mes meubles entre deux logements ?", "Oui, dans nos conteneurs de garde-meubles, pour la durée de votre choix, sans durée minimale imposée."],
      ["Vous occupez-vous du stationnement du camion ?", "Nous vous indiquons la démarche d'autorisation de stationnement à effectuer auprès de la mairie et le métrage à réserver pour le véhicule."],
    ] },
  { id: 'longue-distance', url: '/demenageur/demenagement-longue-distance/', nav: 'Longue distance', isNew: true, title: 'Déménagement longue distance depuis la Normandie | Postel', h1: 'N°1 du déménagement longue distance au départ de la Normandie', kw: 'déménagement longue distance Normandie',
    lead: "Numéro 1 de la longue distance au départ de la Normandie, Postel organise les départs de Normandie vers toute la France et arrivées en Normandie, en camion dédié ou en groupage, avec un interlocuteur unique du devis à la livraison.",
    image: 'cab',
    blocks: [
      ["Comment se déroule un déménagement national avec Postel ?", "Visite technique gratuite, devis écrit, planification de l'itinéraire et des dates, chargement par nos équipes, transport par nos véhicules et livraison à la date convenue. Un seul interlocuteur suit votre dossier de bout en bout."],
      ["Camion dédié ou groupage : que choisir ?", "Le camion dédié transporte uniquement vos biens, avec une date de livraison resserrée. Le groupage mutualise le trajet avec d'autres clients sur le même axe : il coûte moins cher en échange d'une fenêtre de livraison plus souple. Nous vous conseillons selon le volume et vos délais."],
      ["Quels véhicules utilisez-vous ?", "Une flotte de véhicules de 6 m³ à 100 m³, du porteur urbain à la semi-remorque, pour adapter le transport au volume et aux accès."],
      ["Pouvez-vous stocker en attendant la remise des clés ?", "Oui. Vos biens peuvent rester dans nos conteneurs bois entre le départ et l'arrivée, puis être livrés à la date que vous fixez."],
    ],
    table: [['Option', 'Camion dédié', 'Groupage'], ['Biens transportés', 'Uniquement les vôtres', 'Partagé avec d\'autres clients'], ['Date de livraison', 'Fixe et rapide', 'Fenêtre plus large'], ['Prix', 'Plus élevé', 'Plus économique'], ['Idéal pour', 'Gros volume, délai serré', 'Petit volume, date souple']],
    faq: [
      ["Combien coûte un déménagement Rouen Paris, Rouen Lyon ou Rouen Bordeaux ?", "Le prix dépend du volume, de la distance, des accès, de la formule et de la période. Il est fixé dans un devis gratuit après estimation du volume, en ligne ou lors de la visite."],
      ["Vos déménageurs font-ils aussi le remontage à l'arrivée ?", "Oui, selon la formule choisie : démontage au départ, remontage et remise en place à l'arrivée."],
      ["Déménagez-vous vers l'étranger ?", "Oui, avec un accompagnement pour les formalités douanières. Voir la page déménagement international."],
    ] },
  { id: 'militaire', url: '/demenageur/demenagement-militaire/', nav: 'Militaires et gendarmes', isNew: true, title: 'Déménagement militaire et gendarme, mutation | Postel', h1: 'Déménagement des militaires et des gendarmes lors d\'une mutation', kw: 'déménagement militaire mutation',
    lead: "Postel déménage les militaires et les gendarmes mutés, au départ ou à destination de la Normandie. Nous établissons les devis dans les formes demandées par votre administration et calons l'opération sur votre date de prise de poste.",
    image: 'fleet',
    blocks: [
      ["Que prévoit Postel pour une mutation ?", "Une visite technique rapide, des devis rédigés selon les pièces exigées par votre administration, un calendrier serré sur la date de prise de poste et, si le logement d'arrivée n'est pas prêt, une mise en garde-meubles."],
      ["Combien de devis faut-il fournir ?", "Cela dépend de votre armée ou de la gendarmerie et des règles en vigueur au moment de la mutation. Vérifiez la procédure auprès de votre service et indiquez-la nous : nous fournissons le devis dans le format attendu."],
      ["Déménagez-vous vers une autre région ou outre-mer ?", "Oui, partout en France. Pour l'outre-mer et l'étranger, nous organisons le transport et l'accompagnement douanier avec nos partenaires."],
    ],
    faq: [
      ["Pouvez-vous intervenir en urgence après une mutation tardive ?", "Contactez l'agence la plus proche dès réception de votre ordre de mutation : nous cherchons la première date compatible avec nos plannings."],
      ["Gérez-vous les logements de fonction et casernes ?", "Oui, en respectant les règles d'accès du site, à préciser lors de la visite."],
    ] },
  { id: 'professionnel', url: '/demenageur/demenagement-professionnel/', nav: 'Entreprises', title: 'Déménagement d\'entreprise, transfert de bureaux Rouen | Postel', h1: 'Déménagement professionnel, transferts d\'entreprises et d\'administrations', kw: 'déménagement entreprise Rouen',
    lead: "Transferts de bureaux, de commerces, de sièges sociaux et d'administrations : Postel planifie chaque tâche, protège postes de travail et matériel, et livre un dossier de synthèse pour que votre activité reprenne sans interruption.",
    image: 'building',
    blocks: [
      ["Comment organisez-vous un transfert d'entreprise ?", "Un chef de projet visite les locaux, établit un planning des tâches et un plan d'implantation, étiquette mobilier et cartons par bureau d'arrivée, puis coordonne les équipes pour déménager hors des heures d'activité si besoin."],
      ["Quels types de transferts réalisez-vous ?", "Bureaux, plateaux tertiaires, commerces, sièges sociaux, administrations et collectivités, archives, matériel lourd et coffres-forts."],
      ["Pouvez-vous gérer les archives ?", "Oui : transport, archivage en box sécurisés et destruction d'archives sur demande."],
    ],
    table: [['Étape', 'Ce que fait Postel'], ['Audit', 'Visite des locaux, relevé des volumes et des accès'], ['Planification', 'Planning des tâches, plan d\'implantation, étiquetage'], ['Transfert', 'Protection du matériel, véhicules de 6 à 100 m³'], ['Livraison', 'Mise en place par bureau, dossier de synthèse']],
    faq: [
      ["Pouvez-vous déménager un week-end ?", "Oui, sur devis, pour éviter toute coupure d'activité."],
      ["Débarrassez-vous l'ancien mobilier ?", "Nous proposons le tri des déchets et l'évacuation. Le détail figure dans le devis."],
    ] },
  { id: 'international', url: '/demenageur/demenagement-international/', nav: 'International', isNew: true, title: 'Déménagement international au départ de Normandie | Postel', h1: 'Déménagement international depuis Rouen, Évreux et la Normandie', kw: 'déménagement international Rouen',
    lead: "Pour un départ à l'étranger ou un retour en France, Postel organise l'emballage export, le transport et vous accompagne dans les démarches douanières.",
    image: 'truckDepot',
    blocks: [
      ["Quelles destinations ?", "L'Europe par la route et le reste du monde par transport maritime ou aérien, en lien avec nos partenaires. La faisabilité et le délai sont précisés au devis."],
      ["Qui s'occupe des formalités douanières ?", "Nous vous indiquons les documents à préparer (inventaire valorisé, justificatifs selon le pays) et accompagnons les démarches douanières."],
      ["Comment protégez-vous les biens pour un long transit ?", "Emballage renforcé, caisses pour les objets fragiles ou de valeur et inventaire détaillé contrôlé au chargement et à la livraison."],
    ],
    faq: [["Pouvez-vous stocker une partie de mes biens en France ?", "Oui, en garde-meubles, pendant toute la durée de votre expatriation."]] },
  { id: 'garde-meubles', url: '/garde-meubles-stockage/', nav: 'Garde-meubles', title: 'Garde-meubles, self-stockage et archivage à Rouen | Postel', h1: 'Garde-meubles, self-stockage et archivage près de Rouen', kw: 'garde-meubles Rouen',
    lead: "3 000 m² de stockage, 400 conteneurs bois et des box de self-stockage au Grand-Quevilly : stockez meubles, archives et œuvres d'art pour la durée de votre choix.",
    image: 'containers',
    blocks: [
      ["Quelle différence entre garde-meubles et self-stockage ?", "En garde-meubles, nos équipes chargent vos biens dans des conteneurs bois fermés et plombés que nous gérons pour vous. En self-stockage, vous louez un box de 2 m² à 80 m² au Grand-Quevilly et y accédez librement aux horaires d'ouverture."],
      ["Combien de temps puis-je stocker ?", "Aussi longtemps que nécessaire : la durée est libre, de quelques semaines à plusieurs années."],
      ["Comment mes biens sont-ils protégés ?", "Les espaces sont sécurisés, sous vidéosurveillance, avec plombage des conteneurs pour les objets de valeur. Les box sont aérés et équipés d'étagères."],
    ],
    table: [['Solution', 'Accès', 'Taille', 'Idéal pour'], ['Garde-meubles', 'Par nos équipes', 'Conteneurs bois', 'Entre deux logements, mutation'], ['Self-stockage', 'Libre, aux horaires', '2 m² à 80 m²', 'Stock, saisonnier, travaux'], ['Archivage', 'Sur demande', 'Box ou pièces équipées', 'Entreprises, professions réglementées'], ['Objets d\'art', 'Sur demande', 'Espace sécurisé', 'Œuvres et objets de valeur']],
    children: [
      { url: '/garde-meubles-stockage/location-garde-meubles/', t: 'Location de garde-meubles' },
      { url: '/garde-meubles-stockage/location-box-self-stockage/', t: 'Box de self-stockage' },
      { url: '/garde-meubles-stockage/archivage/', t: 'Archivage de documents' },
      { url: '/garde-meubles-stockage/entreposage-objet-art/', t: 'Entreposage d\'œuvres d\'art' },
    ],
    faq: [["Où se trouvent vos espaces de stockage ?", "Le self-stockage est au Grand-Quevilly, près de Rouen. L'adresse exacte vous est communiquée avec le devis."], ["Pouvez-vous venir chercher mes biens ?", "Oui, nous enlevons et livrons à domicile, partout en Normandie."]] },
  { id: 'monte-meubles', url: '/location-monte-meubles/', nav: 'Monte-meubles', title: 'Location de monte-meubles à Rouen et Évreux | Postel', h1: 'Location de monte-meubles près de Rouen et d\'Évreux', kw: 'location monte-meubles Rouen',
    lead: "Escalier trop étroit, étage élevé, meuble volumineux : le monte-meubles passe par la fenêtre ou le balcon et sécurise la manutention. Postel le loue pour la durée souhaitée, avec opérateur.",
    image: 'lift',
    blocks: [
      ["Quand faut-il un monte-meubles ?", "Dès que l'escalier ne permet pas de passer un meuble, à partir des étages élevés sans ascenseur adapté, ou pour gagner du temps et limiter les risques sur les parties communes."],
      ["Quelles démarches prévoir ?", "Une autorisation d'occupation du domaine public peut être nécessaire auprès de la mairie. Nous vous indiquons l'emprise à réserver."],
    ],
    faq: [["Louez-vous le monte-meubles sans déménagement ?", "Oui, pour une livraison de mobilier ou un chantier, à la durée souhaitée."]] },
  { id: 'piano', url: '/transport-piano/', nav: 'Piano', title: 'Transport et déménagement de piano à Rouen et Évreux | Postel', h1: 'Transport de pianos et objets délicats en Normandie', kw: 'transport piano Rouen',
    lead: "Piano droit, demi-queue ou à queue : manutention par une équipe équipée, protection sur mesure et transport partout en France.",
    image: 'piano',
    blocks: [
      ["Comment transportez-vous un piano ?", "Repérage des accès, protection intégrale, matériel de manutention adapté (sangles, chariots, planche à piano), et monte-meubles si l'escalier ne passe pas."],
      ["Faut-il réaccorder le piano après le transport ?", "C'est recommandé après un déménagement : laissez-le s'acclimater quelques semaines puis faites intervenir un accordeur."],
    ],
    faq: [["Transportez-vous un piano seul, sans déménagement ?", "Oui, sur devis."]] },
  { id: 'coffre-fort', url: '/transport-coffre-fort/', nav: 'Coffre-fort', title: 'Transport et déménagement de coffre-fort à Rouen, Évreux | Postel', h1: 'Déménagement et transport de coffre-fort près de Rouen et Évreux', kw: 'transport coffre-fort Rouen',
    lead: "Un coffre-fort pèse de quelques dizaines de kilos à plusieurs centaines. Postel l'évalue, prépare l'itinéraire et le déplace avec le matériel adapté, pour les particuliers comme les professionnels.",
    image: 'safe',
    blocks: [
      ["Comment préparez-vous le transport d'un coffre ?", "Évaluation du poids et des dimensions, vérification de la résistance des sols et des escaliers, choix du matériel et de l'équipe, puis transport sécurisé."],
    ],
    faq: [["Déplacez-vous un coffre à l'intérieur d'un même bâtiment ?", "Oui, d'un étage à l'autre ou d'une pièce à l'autre."]] },
  { id: 'fournitures', url: '/demenageur/fournitures-demenagement/', nav: 'Cartons et fournitures', title: 'Cartons de déménagement et fournitures à Rouen et Évreux | Postel', h1: 'Cartons de déménagement et fournitures à Rouen et Évreux', kw: 'cartons déménagement Rouen',
    lead: "Cartons standard, cartons livres, cartons penderie, papier bulle, films et adhésifs : tout le matériel d'emballage professionnel, disponible en agence ou livré avant votre déménagement.",
    image: 'boxes',
    blocks: [["Combien de cartons prévoir ?", "Comptez en moyenne une dizaine de cartons par pièce, davantage pour une cuisine ou une bibliothèque. Votre conseiller vous donne une quantité précise avec le devis."]],
    faq: [["Puis-je acheter des cartons sans déménager avec vous ?", "Oui, contactez l'agence de Rouen, Évreux ou Elbeuf."]] },
];

// Sous-pages garde-meubles conservées (contenu propre)
export const storageSub = [
  { url: '/garde-meubles-stockage/location-garde-meubles/', title: 'Location de garde-meubles à Rouen (76) | Déménagements Postel', h1: 'Location de garde-meubles à Rouen', image: 'containers', lead: "Le garde-meubles Postel, c'est un conteneur bois fermé et plombé dans un entrepôt sécurisé. Nos équipes chargent, stockent et vous relivrent quand vous le décidez.", q: [["Pour quelles situations ?", "Entre deux logements, pendant des travaux, lors d'une mutation, d'une succession ou d'une expatriation."], ["Comment est calculé le tarif ?", "Selon le volume stocké et la durée. Le dimensionnement se fait avec vous, sur devis gratuit."]] },
  { url: '/garde-meubles-stockage/location-box-self-stockage/', title: 'Box de self-stockage à louer au Grand-Quevilly, Rouen | Postel', h1: 'Box à louer en self-stockage près de Rouen', image: 'selfstorage', lead: "Au Grand-Quevilly, des box de 2 m² à 80 m², aérés, protégés et équipés d'étagères, accessibles librement aux horaires d'ouverture, pour la durée de votre choix.", q: [["Quelle taille de box choisir ?", "2 à 5 m² pour un studio ou un stock de cartons, 10 à 15 m² pour un appartement familial, davantage pour une maison ou un stock professionnel. Nous vous aidons à choisir."], ["Puis-je accéder à mon box quand je veux ?", "Oui, librement pendant les horaires d'ouverture du site."]] },
  { url: '/garde-meubles-stockage/archivage/', title: 'Archivage de documents en box sécurisés à Rouen | Postel', h1: 'Archivage de vos documents près de Rouen', image: 'archives', lead: "Box et pièces équipées d'étagères pour les archives des particuliers et des professionnels, transport des documents et destruction d'archives sur demande.", q: [["Proposez-vous la destruction d'archives ?", "Oui, sur demande, en fin de durée de conservation."]] },
  { url: '/garde-meubles-stockage/entreposage-objet-art/', title: 'Entreposage et transport d\'œuvres d\'art à Rouen | Postel', h1: 'Entreposage d\'œuvres d\'art près de Rouen', image: 'containers', lead: "Stockage sécurisé sous vidéosurveillance, conteneurs plombés et transport d'œuvres partout en France.", q: [["Transportez-vous les œuvres partout en France ?", "Oui, avec emballage adapté et manutention dédiée."]] },
];

export const faq = [
  ['Dans quelles zones intervenez-vous ?', "Partout en Seine-Maritime et dans l'Eure depuis nos agences de Rouen, Évreux et Elbeuf, partout en France et à l'international."],
  ['Le devis est-il gratuit ?', 'Oui, la visite technique et le devis sont gratuits et sans engagement.'],
  ['Comment obtenir un devis rapidement ?', "Remplissez notre demande de devis en ligne avec le calculateur de volume, ou appelez l'agence la plus proche du lundi au vendredi, de 8h à 12h et de 14h à 18h."],
  ['Combien de temps à l\'avance faut-il réserver ?', "Un à deux mois à l'avance en moyenne, davantage pour l'été et les fins de mois."],
  ['Quelles formules proposez-vous ?', 'Une formule économique, une formule sur mesure et une formule haut de gamme. Le contenu exact de chacune est détaillé dans le devis.'],
  ['Mes biens sont-ils assurés pendant le déménagement ?', "Avant le déménagement, vous remplissez une déclaration de valeur qui fixe le montant d'indemnisation en cas de dommage. Votre conseiller vous explique les garanties lors du devis."],
  ['Postel est-elle adhérente d\'une organisation professionnelle ?', "Oui, Déménagements Postel est adhérente de la Chambre Syndicale du Déménagement (CSD)."],
  ['Déménagez-vous les militaires et les gendarmes ?', 'Oui, lors des mutations, avec des devis établis selon les pièces demandées par votre administration.'],
  ['Faites-vous des déménagements longue distance ?', "Oui, c'est notre cœur de métier : Postel est le numéro 1 de la longue distance au départ de la Normandie, partout en France, en camion dédié ou en groupage."],
  ['Depuis quand existe Déménagements Postel ?', "Depuis 1946 : c'est la plus ancienne entreprise de déménagement de Rouen, fondée par le grand-père Postel puis transmise à son fils et à son petit-fils."],
  ['Proposez-vous le garde-meubles ?', 'Oui : 3 000 m² de stockage, 400 conteneurs bois, des box de self-stockage de 2 à 80 m² au Grand-Quevilly et de l\'archivage.'],
  ['Louez-vous des monte-meubles ?', 'Oui, avec opérateur, pour un déménagement ou une simple livraison.'],
  ['Transportez-vous les pianos et coffres-forts ?', 'Oui, avec une équipe et un matériel de manutention dédiés.'],
  ['Vendez-vous des cartons ?', 'Oui : cartons standard, livres, penderie, papier bulle, film et adhésif.'],
  ['Proposez-vous des services après le déménagement ?', "Oui : nettoyage après déménagement, tri des déchets et destruction d'archives, sur devis."],
  ['Faites-vous un inventaire ?', "Oui, un inventaire détaillé est établi, et une enquête de satisfaction vous est adressée après chaque déménagement."],
];

// Calculateur : volumes indicatifs en m3 (moyennes de la profession)
export const inventory = {
  'Salon et séjour': [['Canapé 2 places', 1.5], ['Canapé 3 places', 2.5], ["Canapé d'angle", 3.5], ['Fauteuil', 0.8], ['Table basse', 0.4], ['Table de séjour', 1], ['Chaise', 0.3], ['Buffet ou meuble living', 1.8], ['Bibliothèque', 1.2], ['Meuble TV', 0.6], ['Télévision', 0.3], ['Piano droit', 1.8], ['Piano à queue', 4], ['Tapis', 0.2], ['Lampadaire', 0.2], ['Tableau ou miroir', 0.1], ['Plante', 0.2]],
  'Cuisine': [['Réfrigérateur', 0.8], ['Réfrigérateur américain', 1.5], ['Congélateur', 0.8], ['Cuisinière ou gazinière', 0.6], ['Four ou micro-ondes', 0.2], ['Lave-vaisselle', 0.5], ['Lave-linge', 0.5], ['Sèche-linge', 0.5], ['Table de cuisine', 0.8], ['Chaise', 0.3], ['Meuble haut ou bas', 0.4], ['Vaisselier', 1.2]],
  'Chambres': [['Lit 1 place', 1], ['Lit 2 places', 2], ['Lit superposé', 2], ['Lit bébé', 0.5], ['Table de chevet', 0.2], ['Armoire 1 porte', 0.8], ['Armoire 2 portes', 1.5], ['Armoire 3 à 4 portes', 2.5], ['Commode', 0.8], ['Coiffeuse', 0.5], ['Bureau', 1], ['Chaise de bureau', 0.4], ['Contenu de penderie (par mètre)', 0.5], ['Coffre à jouets', 0.3]],
  'Bureau et rangements': [['Ordinateur', 0.1], ['Imprimante', 0.1], ['Étagère', 0.6], ['Placard', 1], ['Classeur ou caisson', 0.4], ['Table à repasser', 0.1]],
  'Garage, cave et jardin': [['Vélo', 0.5], ['Scooter', 1.2], ['Tondeuse', 0.5], ['Tracteur tondeuse', 2], ['Établi', 1], ['Lot d\'outils', 0.3], ['Salon de jardin', 1.5], ['Barbecue', 0.5], ['Parasol', 0.2], ['Table de ping-pong', 1], ['Brouette', 0.4], ['Poussette', 0.4]],
  'Cartons': [['Carton standard', 0.1], ['Carton livres', 0.05], ['Carton penderie', 0.5]],
};
