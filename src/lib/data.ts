// Faction Data - Complete information for all 7 major factions

export interface FactionUnit {
  name: string
  type: 'Personaje' | 'Tropas' | 'Elite' | 'Ataque Rapido' | 'Apoyo Pesado' | 'Lord of War' | 'Transporte'
  description: string
  lore: string
  points: number
  image: string
  stats?: {
    M: string
    WS: string
    BS: string
    S: string
    T: string
    W: string
    A: string
    Ld: string
    Sv: string
  }
}

export interface FactionLoreSection {
  title: string
  content: string
  quote?: {
    text: string
    author: string
    source?: string
  }
}

export interface Faction {
  id: string
  name: string
  shortName: string
  tagline: string
  description: string
  longDescription: string

  // Visual
  color: string
  accentColor: string
  image: string
  heroImage: string
  galleryImages: string[]

  // Stats display
  stats: {
    unitsCount: string
    codexEdition: string
    difficulty: 'Facil' | 'Media' | 'Dificil' | 'Muy Dificil'
    playstyle: string
  }

  // Content
  loreSections: FactionLoreSection[]
  units: FactionUnit[]
  notableCharacters: string[]
  strengths: string[]
  weaknesses: string[]
}

export const factions: Faction[] = [
  // ═══════════════════════════════════════════════════════════════════
  // IMPERIUM OF MAN
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'imperium',
    name: 'Imperium of Man',
    shortName: 'Imperium',
    tagline: 'El Emperador Protege',
    description: 'La humanidad unida bajo el Trono Dorado. Space Marines, la Guardia Imperial y el Adeptus Mechanicus defienden un imperio de un millon de mundos contra las tinieblas.',
    longDescription: `El Imperium of Man es la civilizacion humana mas grande de la galaxia, abarcando mas de un millon de mundos unidos bajo el dominio del Dios-Emperador de la Humanidad. Durante mas de diez milenios, el Imperium ha resistido contra xenos, herejes y los horrores del Warp.

Los Space Marines, los guerreros geneticamente modificados conocidos como los Adeptus Astartes, son el martillo del Emperador. La Guardia Imperial, con sus incontables billones de soldados, es el escudo. El Adeptus Mechanicus preserva el conocimiento sagrado de las maquinas.`,

    color: '#C9A227',
    accentColor: '#1a1a2e',
    image: 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=1920&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      'https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?w=800&q=80',
      'https://images.unsplash.com/photo-1597424216809-3ba9864aeb18?w=800&q=80',
      'https://images.unsplash.com/photo-1534996858221-380b92700493?w=800&q=80',
      'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&q=80',
    ],

    stats: {
      unitsCount: '100+',
      codexEdition: '10a Ed.',
      difficulty: 'Media',
      playstyle: 'Versatil',
    },

    loreSections: [
      {
        title: 'El Trono Dorado',
        content: `En lo mas profundo del Palacio Imperial de Terra, el Emperador de la Humanidad yace inmovilizado en el Trono Dorado, un artefacto de tecnologia arcana que lo mantiene atado entre la vida y la muerte. Cada dia, mil psiquicos son sacrificados para alimentar el Astronomican, el faro psiquico que guia las naves a traves del Warp.

El Emperador fue una vez el ser humano mas poderoso que jamas existio. Durante la Gran Cruzada, unifico a la humanidad dispersa y creo a los Primarcas y sus Legiones de Space Marines. Pero la traicion de Horus lo hirio mortalmente, y desde entonces gobierna como un cadaver en su trono de oro.`,
        quote: {
          text: 'Es mejor morir por el Emperador que vivir para uno mismo.',
          author: 'Catecismo Imperial',
          source: 'Libro de los Rezos'
        }
      },
      {
        title: 'Los Adeptus Astartes',
        content: `Los Space Marines son la mas grande creacion del Emperador. Guerreros transhumanos forjados a traves de modificacion genetica, entrenamiento brutal e implantes quirurgicos que los transforman en angeles de la muerte. Cada Marine es una legión por si mismo, capaz de enfrentarse a decenas de enemigos.

Organizados en Capitulos de aproximadamente mil guerreros cada uno, los Adeptus Astartes son el martillo del Emperador. Los Ultramarines, Blood Angels, Dark Angels, Space Wolves y Black Templars son solo algunos de los mas renombrados.`,
        quote: {
          text: 'Y no conoceran el miedo.',
          author: 'Codex Astartes',
          source: 'Prologo'
        }
      },
      {
        title: 'La Guardia Imperial',
        content: `Donde los Space Marines son el escalpelo, la Guardia Imperial es el mazo. Con incontables billones de soldados repartidos por toda la galaxia, el Astra Militarum es la fuerza militar mas grande de la humanidad. Hombres y mujeres ordinarios que enfrentan los horrores del universo con poco mas que un rifle laser y su fe en el Emperador.

Los regimientos famosos como los Cadians, Catachans, Death Korps de Krieg y los Valhallans han defendido la humanidad durante milenios. Sus tanques Leman Russ y artilleria Basilisk traen la furia del Emperador a los enemigos de la humanidad.`,
      },
    ],

    units: [
      {
        name: 'Primaris Intercessors',
        type: 'Tropas',
        description: 'La columna vertebral de los ejercitos Space Marine. Guerreros versatiles equipados con rifles bolt de patron Mk II.',
        lore: 'Creados por Belisarius Cawl durante diez milenios de trabajo secreto, los Primaris representan la nueva generacion de Adeptus Astartes. Mas altos, mas fuertes y mas resistentes que sus predecesores.',
        points: 90,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
        stats: { M: '6"', WS: '3+', BS: '3+', S: '4', T: '4', W: '2', A: '2', Ld: '6+', Sv: '3+' }
      },
      {
        name: 'Adeptus Custodes',
        type: 'Elite',
        description: 'Los guardianes personales del Emperador. Cada uno es una legion por si mismo.',
        lore: 'Los Custodios son los guerreros mas perfectos jamas creados. Donde los Space Marines fueron hechos en masa, cada Custodio fue artesanalmente forjado por el propio Emperador.',
        points: 135,
        image: 'https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?w=600&q=80',
        stats: { M: '6"', WS: '2+', BS: '2+', S: '5', T: '5', W: '3', A: '4', Ld: '5+', Sv: '2+' }
      },
      {
        name: 'Imperial Knight Paladin',
        type: 'Lord of War',
        description: 'Maquinas de guerra colosales pilotadas por nobles caballeros. Devastacion andante.',
        lore: 'Los Knights son reliquias de la Era Oscura de la Tecnologia, maquinas de guerra bipedas que son pilotadas por nobles de casas caballerescas que han jurado lealtad al Emperador.',
        points: 425,
        image: 'https://images.unsplash.com/photo-1597424216809-3ba9864aeb18?w=600&q=80',
        stats: { M: '10"', WS: '3+', BS: '3+', S: '8', T: '12', W: '22', A: '4', Ld: '6+', Sv: '3+' }
      },
      {
        name: 'Leman Russ Battle Tank',
        type: 'Apoyo Pesado',
        description: 'El tanque de batalla principal del Astra Militarum. Robusto, versatil y mortal.',
        lore: 'Nombrado en honor al Primarca de los Space Wolves, el Leman Russ ha servido al Imperium durante diez mil años. Su diseño simple pero efectivo lo convierte en la columna vertebral de las fuerzas acorazadas imperiales.',
        points: 195,
        image: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=600&q=80',
        stats: { M: '10"', WS: '4+', BS: '4+', S: '6', T: '11', W: '13', A: '3', Ld: '7+', Sv: '2+' }
      },
    ],

    notableCharacters: [
      'Roboute Guilliman - Primarca de los Ultramarines',
      'Marneus Calgar - Señor Capitular de los Ultramarines',
      'Commander Dante - Señor Capitular de los Blood Angels',
      'Trajann Valoris - Capitan-General de los Custodes'
    ],

    strengths: [
      'Gran variedad de unidades y subfacciones',
      'Fuerte sinergia entre diferentes elementos',
      'Acceso a la mejor artilleria de la galaxia',
      'Capacidad de adaptacion a cualquier enemigo'
    ],

    weaknesses: [
      'Puede ser costoso en puntos',
      'Requiere buena gestion de recursos',
      'Algunas unidades son muy especializadas'
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // CHAOS SPACE MARINES
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'chaos',
    name: 'Chaos Space Marines',
    shortName: 'Chaos',
    tagline: 'Muerte al Falso Emperador',
    description: 'Los Marines Traidores que vendieron sus almas a los Dioses del Caos. Diez mil años de guerra eterna contra el Imperium que una vez juraron proteger.',
    longDescription: `Los Chaos Space Marines son los descendientes corruptos de las Legiones Traidoras que se rebelaron contra el Emperador durante la Herejia de Horus hace diez milenios. Empoderados por los Dioses Oscuros del Warp, estos guerreros inmortales libran una guerra eterna contra el Imperium.

Khorne, Tzeentch, Nurgle y Slaanesh otorgan terribles dones a sus seguidores. Mutaciones, poderes psiquicos prohibidos y una sed insaciable de destruccion impulsan a las hordas del Caos en su cruzada negra.`,

    color: '#DC143C',
    accentColor: '#1a0a0a',
    image: 'https://images.unsplash.com/photo-1633477189729-9290b3261d0a?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&q=80',
      'https://images.unsplash.com/photo-1563207153-f403bf289096?w=800&q=80',
      'https://images.unsplash.com/photo-1571757767119-68b8dbed8c97?w=800&q=80',
      'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&q=80',
      'https://images.unsplash.com/photo-1604076913837-52ab5629fba9?w=800&q=80',
    ],

    stats: {
      unitsCount: '80+',
      codexEdition: '10a Ed.',
      difficulty: 'Dificil',
      playstyle: 'Agresivo',
    },

    loreSections: [
      {
        title: 'La Herejia de Horus',
        content: `Hace diez mil años, Horus Lupercal, el mas querido de los hijos del Emperador, fue corrompido por los Dioses del Caos. La mitad de las Legiones de Space Marines se volvieron contra su creador en una guerra civil que casi destruyo a la humanidad.

La batalla final se libro en Terra misma. El Emperador derroto a Horus, pero fue herido mortalmente. Desde entonces, los Marines Traidores fueron expulsados al Ojo del Terror, un reino donde el Warp se mezcla con la realidad.`,
        quote: {
          text: 'Fui leal durante diez mil años. Solo necesite un momento de duda para caer.',
          author: 'Horus Lupercal',
          source: 'Antes de la Caida'
        }
      },
      {
        title: 'Los Cuatro Dioses',
        content: `Khorne, el Dios de la Sangre, otorga fuerza y furia a sus seguidores. Tzeentch, el Arquitecto del Cambio, bendice a los suyos con poderes psiquicos y conocimiento prohibido. Nurgle, el Abuelo Plaga, concede inmortalidad a traves de la enfermedad. Slaanesh, el Principe del Placer, promete sensaciones mas alla de la comprension mortal.

Algunos Marines del Caos sirven a un solo dios, transformandose en champions dedicados. Otros veneran al Caos Indiviso, buscando el favor de todos los Dioses Oscuros.`,
        quote: {
          text: 'Los dioses son caprichosos, pero sus dones son eternos.',
          author: 'Erebus',
          source: 'Portadores de la Palabra'
        }
      },
      {
        title: 'Las Cruzadas Negras',
        content: `Desde el Ojo del Terror, las hordas del Caos lanzan periodicamente Cruzadas Negras contra el Imperium. Abaddon el Saqueador, heredero de Horus, ha liderado trece de estas campañas de destruccion.

La Decimotercera Cruzada Negra resulto en la caida de Cadia, el mundo fortaleza que guardaba la unica ruta estable fuera del Ojo del Terror. Ahora la Gran Grieta divide la galaxia, y el Caos fluye libremente.`,
      },
    ],

    units: [
      {
        name: 'Chaos Terminators',
        type: 'Elite',
        description: 'Veteranos blindados con armadura tactica dreadnought corrupta por el Warp.',
        lore: 'Estos veteranos han luchado durante diez milenios, sus armaduras fusionadas con sus cuerpos, adornadas con trofeos de incontables matanzas.',
        points: 185,
        image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&q=80',
        stats: { M: '5"', WS: '3+', BS: '3+', S: '4', T: '5', W: '3', A: '3', Ld: '6+', Sv: '2+' }
      },
      {
        name: 'Abaddon the Despoiler',
        type: 'Personaje',
        description: 'El Señor de la Guerra del Caos. Lider de las Cruzadas Negras contra Terra.',
        lore: 'Ezekyle Abaddon fue el Primer Capitan de los Sons of Horus. Tras la muerte de Horus, reclamo el manto de Señor de la Guerra y juro destruir el Imperium.',
        points: 295,
        image: 'https://images.unsplash.com/photo-1563207153-f403bf289096?w=600&q=80',
        stats: { M: '6"', WS: '2+', BS: '2+', S: '5', T: '5', W: '9', A: '6', Ld: '5+', Sv: '2+' }
      },
      {
        name: 'Daemon Prince',
        type: 'Personaje',
        description: 'Un mortal ascendido a la daemonhood. El maximo premio de los Dioses Oscuros.',
        lore: 'Los Principes Daemon son champions del Caos que han complacido tanto a los Dioses que fueron transformados en entidades inmortales del Warp.',
        points: 200,
        image: 'https://images.unsplash.com/photo-1571757767119-68b8dbed8c97?w=600&q=80',
        stats: { M: '8"', WS: '2+', BS: '2+', S: '7', T: '7', W: '10', A: '5', Ld: '6+', Sv: '4+' }
      },
      {
        name: 'Khorne Berzerkers',
        type: 'Tropas',
        description: 'Devotos de Khorne enloquecidos por la sed de sangre. La muerte encarnada.',
        lore: 'Los Berzerkers se sometieron a la cirugia psiquica que elimina todo excepto la rabia asesina. Solo viven para matar en nombre del Dios de la Sangre.',
        points: 105,
        image: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=600&q=80',
        stats: { M: '6"', WS: '3+', BS: '3+', S: '5', T: '4', W: '2', A: '3', Ld: '6+', Sv: '3+' }
      },
    ],

    notableCharacters: [
      'Abaddon el Saqueador - Señor de la Guerra del Caos',
      'Kharn el Traidor - Champion de Khorne',
      'Ahriman - Hechicero Jefe de los Thousand Sons',
      'Typhus - Heraldo de Nurgle'
    ],

    strengths: [
      'Unidades de combate cuerpo a cuerpo devastadoras',
      'Poderes psiquicos poderosos',
      'Marcas del Caos otorgan bonificaciones unicas',
      'Acceso a demonios como aliados'
    ],

    weaknesses: [
      'Menor cantidad de disparos a distancia',
      'Puede ser vulnerable a ejercitos de hordas',
      'Requiere llegar al combate para ser efectivo'
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // NECRONS
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'necrons',
    name: 'Necrons',
    shortName: 'Necrons',
    tagline: 'Los Antiguos Despiertan',
    description: 'Una raza ancestral que vendio sus almas por la inmortalidad. Ahora despiertan de su sueño de sesenta millones de años para reclamar la galaxia.',
    longDescription: `Los Necrons son los remanentes de la antigua civilizacion Necrontyr, que hace eones transfirieron sus consciencias a cuerpos de metal viviente en un pacto con los C'tan, los Dioses Estelares. Durante sesenta millones de años han dormido en mundos tumba dispersos por la galaxia.

Ahora despiertan. Sus falanges de guerreros inmortales, sus constructos arcanos y sus señores dinasticos reclaman lo que una vez fue suyo. La galaxia conocera el dominio de los Necrons una vez mas.`,

    color: '#00FF87',
    accentColor: '#0a1a0a',
    image: 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=1920&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
      'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&q=80',
      'https://images.unsplash.com/photo-1534996858221-380b92700493?w=800&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
    ],

    stats: {
      unitsCount: '60+',
      codexEdition: '10a Ed.',
      difficulty: 'Media',
      playstyle: 'Resistente',
    },

    loreSections: [
      {
        title: 'La Biotransferencia',
        content: `Los Necrontyr fueron una raza condenada. Su sol radiactivo les daba vidas cortas y dolorosas. En su desesperacion, hicieron un pacto con los C'tan, seres de energia pura que se alimentaban de estrellas.

Los C'tan les ofrecieron la inmortalidad a traves de la Biotransferencia: sus cuerpos organicos serian reemplazados por formas de metal viviente llamado necrodermis. Pero el precio fue sus almas. La mayoria de los Necrons perdieron toda emocion y personalidad, convirtiendose en autómatas sin voluntad.`,
        quote: {
          text: 'Fuimos dioses una vez. Volveremos a serlo.',
          author: 'Szarekh, el Rey Silente',
          source: 'Cronicas de la Triarca'
        }
      },
      {
        title: 'La Guerra en el Cielo',
        content: `Tras la Biotransferencia, los Necrons libraron una guerra contra los Antiguos, una raza ancestral que habia rechazado ayudarlos. La Guerra en el Cielo duro millones de años y devasto la galaxia.

Los Necrons finalmente se volvieron contra sus amos C'tan, fragmentandolos en innumerables pedazos. Pero la guerra los habia debilitado, y eligieron entrar en el Gran Sueño, esperando que la galaxia se recuperara.`,
        quote: {
          text: 'Incluso los dioses pueden morir. Lo demostramos.',
          author: 'Orikan el Adivino',
          source: 'Profecias del Despertar'
        }
      },
      {
        title: 'El Despertar',
        content: `Sesenta millones de años despues, los mundos tumba comienzan a activarse. Señores Necron despiertan de su letargo, algunos con sus mentes intactas, otros irremediablemente dañados por el paso del tiempo.

El Rey Silente, Szarekh, ha regresado de su exilio autoimpuesto con una advertencia terrible: los Tiranidos son solo la avanzadilla de algo peor. Ahora busca unir a todas las dinastias Necron para enfrentar la amenaza que viene.`,
      },
    ],

    units: [
      {
        name: 'Necron Warriors',
        type: 'Tropas',
        description: 'La espina dorsal de las legiones Necron. Implacables, incansables, inmortales.',
        lore: 'Los Guerreros son los restos de los plebeyos Necrontyr, despojados de toda individualidad. Avanzan en falanges silenciosas, sus armas gauss desintegrando a los enemigos atomo por atomo.',
        points: 130,
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80',
        stats: { M: '5"', WS: '4+', BS: '4+', S: '4', T: '4', W: '1', A: '1', Ld: '7+', Sv: '4+' }
      },
      {
        name: 'Canoptek Wraiths',
        type: 'Ataque Rapido',
        description: 'Constructos fantasmales que atraviesan la materia solida para destruir a sus presas.',
        lore: 'Los Espectros Canoptek fueron diseñados para el mantenimiento de las tumbas, pero sus capacidades de cambio de fase los convierten en asesinos letales.',
        points: 145,
        image: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=600&q=80',
        stats: { M: '10"', WS: '4+', BS: '4+', S: '6', T: '5', W: '3', A: '4', Ld: '7+', Sv: '4+' }
      },
      {
        name: 'The Silent King',
        type: 'Lord of War',
        description: 'Szarekh, el Rey Silente. Gobernante supremo de todos los Necrons.',
        lore: 'Szarekh ordeno la Biotransferencia y luego se exilio en verguenza. Ahora regresa para liderar a su pueblo contra una amenaza que podria destruir toda la vida en la galaxia.',
        points: 450,
        image: 'https://images.unsplash.com/photo-1534996858221-380b92700493?w=600&q=80',
        stats: { M: '8"', WS: '2+', BS: '2+', S: '6', T: '7', W: '16', A: '6', Ld: '5+', Sv: '2+' }
      },
      {
        name: 'Triarch Praetorians',
        type: 'Elite',
        description: 'Guardianes de la Triarca, los jueces y ejecutores de la ley Necron.',
        lore: 'Los Pretorianos nunca durmieron. Han vigilado los mundos tumba durante sesenta millones de años, manteniendo el orden y castigando a los que despiertan antes de tiempo.',
        points: 140,
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
        stats: { M: '10"', WS: '3+', BS: '3+', S: '5', T: '5', W: '2', A: '3', Ld: '6+', Sv: '3+' }
      },
    ],

    notableCharacters: [
      'Szarekh, el Rey Silente - Gobernante de los Necrons',
      'Imotekh el Señor de la Tormenta - Faaraón de la Dinastia Sautekh',
      'Trazyn el Infinito - Coleccionista Obsesivo',
      'Orikan el Adivino - Criptoarquitecto del Tiempo'
    ],

    strengths: [
      'Protocolos de Reanimacion restauran unidades caidas',
      'Armas gauss ignoran armaduras',
      'Comandos y habilidades dinasticas poderosas',
      'Extremadamente dificiles de destruir permanentemente'
    ],

    weaknesses: [
      'Movimiento generalmente lento',
      'Pocas unidades de ataque rapido',
      'Vulnerables a ataques que ignoran Reanimacion'
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // AELDARI (ELDAR)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'aeldari',
    name: 'Aeldari',
    shortName: 'Aeldari',
    tagline: 'Los Hijos de las Estrellas',
    description: 'Una raza antigua que una vez goberno la galaxia. Ahora luchan para evitar la extincion mientras huyen de la entidad que su decadencia creo.',
    longDescription: `Los Aeldari son una raza psiquicamente dotada cuya civilizacion dominaba la galaxia cuando la humanidad aun vivia en cuevas. Su imperio cayo cuando sus excesos dieron nacimiento a Slaanesh, el Dios del Placer, cuya creacion destruyo sus mundos y devoro sus almas.

Los supervivientes se dividieron: los Asuryani viven en colosales naves espaciales llamadas Mundos Astronave, los Drukhari se esconden en la dimension paralela de Commorragh, y los Ynnari siguen al Dios de la Muerte renacido.`,

    color: '#4169E1',
    accentColor: '#050510',
    image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
      'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800&q=80',
      'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=800&q=80',
      'https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=800&q=80',
      'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=800&q=80',
    ],

    stats: {
      unitsCount: '70+',
      codexEdition: '10a Ed.',
      difficulty: 'Muy Dificil',
      playstyle: 'Movil y Tactico',
    },

    loreSections: [
      {
        title: 'La Caida',
        content: `En su apogeo, los Aeldari eran dioses entre mortales. Su dominio psiquico era absoluto, sus tecnologias incomprensibles. Pero la inmortalidad trajo aburrimiento, y el aburrimiento trajo excesos cada vez mas depravados.

Durante milenios, sus emociones colectivas se acumularon en el Warp hasta que cristalizaron en una nueva entidad: Slaanesh, el Principe del Placer. Su nacimiento destruyo el corazon del imperio Aeldari y creo el Ojo del Terror.`,
        quote: {
          text: 'Nosotros, que creamos dioses, creamos tambien a nuestro destructor.',
          author: 'Eldrad Ulthran',
          source: 'Lamento de Ulthwe'
        }
      },
      {
        title: 'Los Senderos',
        content: `Para evitar caer de nuevo en la decadencia, los Asuryani siguen estrictas disciplinas llamadas Senderos. Un Aeldari dedica decadas o siglos a dominar un Sendero antes de pasar al siguiente.

El Sendero del Guerrero es seguido por los Guerreros Aspecto, cada santuario dedicado a un aspecto diferente de Kaela Mensha Khaine, el Dios de la Guerra. Los Vengadores Implacables, Dragones de Fuego, Segadores Sombrios y muchos mas forman la elite militar Aeldari.`,
        quote: {
          text: 'El Sendero es estrecho. Un paso en falso y caemos.',
          author: 'Asurmen',
          source: 'La Mano de Asuryan'
        }
      },
      {
        title: 'Piedras Espiritu',
        content: `Cada Aeldari lleva una Piedra Espiritu, una gema psiquica que captura su alma al morir, protegiendola de Slaanesh. Estas piedras son luego llevadas al Circuito Infinito de su Mundo Astronave, donde los muertos pueden seguir aconsejando a los vivos.

En tiempos desesperados, los espiritus pueden ser despertados y colocados en constructos de guerra: los colosales Wraithlords y los agiles Wraithguard luchan con la fuerza de los muertos.`,
      },
    ],

    units: [
      {
        name: 'Guardian Defenders',
        type: 'Tropas',
        description: 'Ciudadanos Aeldari que toman las armas en defensa de su Mundo Astronave.',
        lore: 'Aunque no son guerreros profesionales, los Guardianes son mas habiles que los mejores soldados de razas menores. Defienden sus hogares con catapultas shuriken.',
        points: 110,
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80',
        stats: { M: '7"', WS: '3+', BS: '3+', S: '3', T: '3', W: '1', A: '1', Ld: '6+', Sv: '4+' }
      },
      {
        name: 'Howling Banshees',
        type: 'Elite',
        description: 'Guerreras Aspecto que atacan con gritos psiquicos que paralizan a sus enemigos.',
        lore: 'Las Banshees Aullantes canalizan el aspecto del lamento de Morai-Heg. Sus mascaras amplifican gritos psiquicos que aterran a los enemigos antes de que las espadas los despedacen.',
        points: 75,
        image: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=600&q=80',
        stats: { M: '8"', WS: '3+', BS: '3+', S: '3', T: '3', W: '1', A: '3', Ld: '6+', Sv: '4+' }
      },
      {
        name: 'Wraithknight',
        type: 'Lord of War',
        description: 'Un constructo colosal pilotado por el alma gemela de su piloto muerto.',
        lore: 'Los Wraithknights son pilotados por Aeldari cuyos gemelos murieron en batalla. El lazo entre gemelos permite controlar estos titanes con precision sobrenatural.',
        points: 470,
        image: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=600&q=80',
        stats: { M: '10"', WS: '3+', BS: '3+', S: '8', T: '11', W: '22', A: '4', Ld: '6+', Sv: '2+' }
      },
      {
        name: 'Fire Dragons',
        type: 'Elite',
        description: 'Guerreros Aspecto especializados en destruir vehiculos y fortificaciones.',
        lore: 'Los Dragones de Fuego son maestros de la destruccion. Sus fusiles de fusion reducen blindaje y carne a escoria con igual facilidad.',
        points: 90,
        image: 'https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=600&q=80',
        stats: { M: '7"', WS: '3+', BS: '3+', S: '3', T: '3', W: '1', A: '1', Ld: '6+', Sv: '3+' }
      },
    ],

    notableCharacters: [
      'Eldrad Ulthran - Vidente Supremo de Ulthwe',
      'Yvraine - Emisaria de Ynnead',
      'Asurmen - El Primero de los Fenix',
      'Jain Zar - La Tormenta del Silencio'
    ],

    strengths: [
      'Velocidad y maniobrabilidad excepcionales',
      'Poderes psiquicos devastadores',
      'Unidades especializadas muy efectivas',
      'Habilidad Batalla: Golpe de Dardos permite reposicionar unidades'
    ],

    weaknesses: [
      'Baja resistencia - mueren facilmente',
      'Costosos en puntos por modelo',
      'Requiere planificacion tactica precisa',
      'Errores se castigan severamente'
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // ORKS
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'orks',
    name: 'Orks',
    shortName: 'Orks',
    tagline: 'WAAAGH!',
    description: 'Una raza de barbaros verdes que viven solo para la guerra. Donde los Orks van, la destruccion sigue. Y los Orks van a todas partes.',
    longDescription: `Los Orks son una plaga verde que infesta cada rincon de la galaxia. Creados como armas biologicas por los Antiguos, han sobrevivido y prosperado mucho despues de que sus creadores desaparecieran. Son hongos simbioticos que liberan esporas al morir, asegurando que donde haya habido un Ork, siempre habra mas.

Su unica motivacion es la guerra. Los Orks creen que el rojo hace las cosas mas rapidas, el azul trae suerte, y el amarillo produce mejores explosiones. Y debido a su campo psiquico colectivo, estas creencias se vuelven realidad.`,

    color: '#228B22',
    accentColor: '#080A05',
    image: 'https://images.unsplash.com/photo-1569982175971-d92b01cf8694?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1504890673930-48a2846f0a64?w=1920&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1614854262318-831574f15f1f?w=800&q=80',
      'https://images.unsplash.com/photo-1590479773265-7464e5d48118?w=800&q=80',
      'https://images.unsplash.com/photo-1580982324076-d95e5a41f499?w=800&q=80',
      'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&q=80',
      'https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=800&q=80',
    ],

    stats: {
      unitsCount: '75+',
      codexEdition: '10a Ed.',
      difficulty: 'Facil',
      playstyle: 'Agresivo y Caotico',
    },

    loreSections: [
      {
        title: 'El WAAAGH!',
        content: `Cuando suficientes Orks se reunen, generan un campo psiquico colectivo llamado WAAAGH! Este poder alimenta a los Weirdboyz, les permite hacer funcionar tecnologia que no deberia operar, y une hordas dispares bajo el liderazgo del Ork mas grande y malo.

Un WAAAGH! es tanto una cruzada como una migracion. Millones de Orks avanzan, destruyendo todo a su paso, incorporando a los conquistados en su horda. Solo la muerte o la falta de enemigos pueden detener un WAAAGH!`,
        quote: {
          text: 'WAAAGH!',
          author: 'Todos los Orks',
          source: 'Siempre'
        }
      },
      {
        title: 'Kultur Orko',
        content: `Los Orks se organizan en klanes, cada uno con su propia cultura y estilo de guerra. Los Goffs son los mas brutales, prefiriendo el combate cuerpo a cuerpo. Los Evil Sunz adoran la velocidad. Los Bad Moons tienen los mejores dientes (la moneda Ork) y las armas mas grandes.

Los Mekboys construyen vehiculos y armas imposibles. Los Painboyz practican una cirugia brutal pero efectiva. Los Weirdboyz canalizan la energia psiquica del WAAAGH! Los Kommandos... bueno, son todo lo sigilosos que un Ork puede ser.`,
        quote: {
          text: 'Red wunz go fasta!',
          author: 'Proverbio Orko',
          source: 'Sabiduria Mekanika'
        }
      },
      {
        title: 'Ghazghkull Mag Uruk Thraka',
        content: `El Profeta del WAAAGH!, Ghazghkull, es el Ork mas grande y peligroso de la galaxia. Cree haber sido elegido por Gork y Mork (los dioses Ork gemelos) para liderar el mayor WAAAGH! de la historia.

Ya ha lanzado tres guerras de Armageddon contra el Imperium, cada una mayor que la anterior. Algunos temen que su siguiente ataque sera contra Terra misma.`,
      },
    ],

    units: [
      {
        name: 'Boyz',
        type: 'Tropas',
        description: 'La masa de infanteria verde que forma el nucleo de cada WAAAGH!',
        lore: 'Los Boyz son el Ork promedio: brutales, escandalosos y siempre listos para una buena pelea. En grupos grandes, su entusiasmo es contagioso y mortal.',
        points: 90,
        image: 'https://images.unsplash.com/photo-1614854262318-831574f15f1f?w=600&q=80',
        stats: { M: '6"', WS: '3+', BS: '5+', S: '4', T: '5', W: '1', A: '2', Ld: '7+', Sv: '6+' }
      },
      {
        name: 'Ghazghkull Thraka',
        type: 'Personaje',
        description: 'El Profeta del Dios de la Guerra. El Ork mas grande y malo de la galaxia.',
        lore: 'Ghazghkull fue un simple Nob hasta que un disparo en la cabeza lo llevo a un Painboy. Desperto con una placa de metal en el craneo y visiones de Gork y Mork.',
        points: 235,
        image: 'https://images.unsplash.com/photo-1590479773265-7464e5d48118?w=600&q=80',
        stats: { M: '6"', WS: '2+', BS: '5+', S: '7', T: '8', W: '12', A: '6', Ld: '6+', Sv: '2+' }
      },
      {
        name: 'Gorkanaut',
        type: 'Lord of War',
        description: 'Una estatua andante de Gork (o Mork). Puro poder Orko desatado.',
        lore: 'Los Gorkanauts son construidos para parecerse a Gork, el dios Orko de la fuerza brutal. Estan armados con mas dakka de la que parece fisicamente posible.',
        points: 300,
        image: 'https://images.unsplash.com/photo-1580982324076-d95e5a41f499?w=600&q=80',
        stats: { M: '8"', WS: '3+', BS: '5+', S: '8', T: '12', W: '24', A: '5', Ld: '6+', Sv: '3+' }
      },
      {
        name: 'Warbikers',
        type: 'Ataque Rapido',
        description: 'Orks en motos trukkeadas que van a toda velocidad hacia el enemigo.',
        lore: 'Los Warbikers son Evil Sunz por excelencia. Sus motos estan equipadas con motores sobrealimentados y mas armas de las que deberian poder montar.',
        points: 80,
        image: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=600&q=80',
        stats: { M: '12"', WS: '3+', BS: '5+', S: '4', T: '6', W: '3', A: '2', Ld: '7+', Sv: '4+' }
      },
    ],

    notableCharacters: [
      'Ghazghkull Mag Uruk Thraka - Profeta del WAAAGH!',
      'Makari - El Grot Mas Afortunado',
      'Boss Snikrot - Kommando Legendario',
      'Mad Dok Grotsnik - El Painboy Mas Loco'
    ],

    strengths: [
      'Gran cantidad de modelos por bajo coste',
      'Extremadamente resistentes en combate',
      'Campo psiquico WAAAGH! otorga beneficios',
      'Muy divertidos de jugar'
    ],

    weaknesses: [
      'Precision de disparo terrible',
      'Tacticas limitadas - basicamente cargar',
      'Vulnerables a ejercitos de disparo',
      'Requieren pintar MUCHOS modelos'
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // T'AU EMPIRE
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'tau',
    name: "T'au Empire",
    shortName: "T'au",
    tagline: 'Por el Bien Mayor',
    description: 'Un imperio joven y expansionista que busca unir a todas las razas bajo su filosofia del Bien Mayor. Su tecnologia avanzada compensa su inexperiencia en combate.',
    longDescription: `Los T'au son recien llegados a la escena galactica. Hace apenas seis mil años eran primitivos, pero han avanzado a una velocidad sin precedentes. Su sociedad esta organizada en castas: los Guerreros de Fuego luchan, los Eteros gobiernan, los de la Tierra construyen, los del Agua negocian y los del Aire vuelan.

Su filosofia del Tau'va, el Bien Mayor, predica la cooperacion entre especies. Muchas razas se han unido voluntariamente al Imperio T'au. Otras... menos voluntariamente.`,

    color: '#00CED1',
    accentColor: '#030810',
    image: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
    ],

    stats: {
      unitsCount: '55+',
      codexEdition: '10a Ed.',
      difficulty: 'Media',
      playstyle: 'Disparo a Distancia',
    },

    loreSections: [
      {
        title: 'Las Cinco Castas',
        content: `La sociedad T'au esta dividida en cinco castas, cada una derivada de los distintos pueblos que habitaban T'au hace milenios. Los Shas (Guerreros de Fuego) luchan, los Kor (del Aire) pilotan, los Fio (de la Tierra) construyen, los Por (del Agua) negocian y gobiernan, y los Aun (Etereos) lideran a todos.

Los Etereos aparecieron misteriosamente durante un periodo de guerra civil, unificando a los T'au bajo el concepto del Bien Mayor. Desde entonces, los T'au obedecen a los Etereos sin cuestionamiento.`,
        quote: {
          text: 'El individuo no importa. Solo el Bien Mayor perdura.',
          author: "Aun'va",
          source: 'Meditaciones del Bien Mayor'
        }
      },
      {
        title: 'Tecnologia T\'au',
        content: `Los T'au compensan su debilidad fisica con la tecnologia mas avanzada de la galaxia despues de los Necrons. Sus armaduras de combate Crisis y Riptide son portadas por guerreros de elite, equipados con sistemas de armas modulares y campos de proteccion.

Sus naves emplean motores de impulso exoticos que, aunque mas lentos que el viaje Warp, son infinitamente mas seguros. Sus drones IA apoyan a las tropas en todas las funciones, desde exploracion hasta combate directo.`,
        quote: {
          text: 'No necesitamos ser fuertes. Nuestras armas lo son por nosotros.',
          author: "O'Shovah",
          source: 'Tacticas del Comandante'
        }
      },
      {
        title: 'Las Esferas de Expansion',
        content: `El Imperio T'au crece a traves de Esferas de Expansion, campañas coordinadas de conquista y asimilacion. Ya han completado cinco esferas, incorporando docenas de mundos y varias especies aliadas.

Los Kroot son carnivoros que absorben rasgos geneticos de lo que comen. Los Vespid son insectoides con alas cristalinas. Los Nicassar son psiquicos nomadas. Todos sirven al Bien Mayor... voluntariamente o no.`,
      },
    ],

    units: [
      {
        name: 'Fire Warriors',
        type: 'Tropas',
        description: 'La infanteria estandar T\'au, armada con rifles de pulso de largo alcance.',
        lore: 'Los Guerreros de Fuego son la casta Shas en accion. Entrenados desde el nacimiento para el combate, son tiradores expertos pero evitan el cuerpo a cuerpo.',
        points: 80,
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80',
        stats: { M: '6"', WS: '5+', BS: '4+', S: '3', T: '3', W: '1', A: '1', Ld: '7+', Sv: '4+' }
      },
      {
        name: 'Commander Farsight',
        type: 'Personaje',
        description: "O'Shovah, el Comandante renegado que lidera los Enclaves Farsight.",
        lore: "Farsight descubrio verdades sobre los Etereos que lo llevaron a separarse del Imperio. Su espada, la Hoja del Alba, es un artefacto de origen desconocido que drena la vida de sus victimas.",
        points: 120,
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80',
        stats: { M: '10"', WS: '2+', BS: '2+', S: '5', T: '5', W: '7', A: '5', Ld: '6+', Sv: '3+' }
      },
      {
        name: 'Riptide Battlesuit',
        type: 'Apoyo Pesado',
        description: 'Armadura de combate pesada con sistemas de armas devastadores.',
        lore: 'El Riptide es el pinàculo de la tecnologia de armaduras T\'au. Su piloto esta conectado neuralmente al traje, permitiendo reflejos sobrehumanos.',
        points: 190,
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
        stats: { M: '10"', WS: '5+', BS: '4+', S: '6', T: '8', W: '14', A: '3', Ld: '7+', Sv: '2+' }
      },
      {
        name: 'Crisis Battlesuits',
        type: 'Elite',
        description: 'Armaduras de combate versatiles que pueden equiparse para cualquier rol.',
        lore: 'Los trajes Crisis son el icono del poderio militar T\'au. Cada piloto elige su configuracion de armas, desde lanzamisiles hasta lanzallamas de fusion.',
        points: 155,
        image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=80',
        stats: { M: '10"', WS: '5+', BS: '4+', S: '5', T: '5', W: '4', A: '2', Ld: '7+', Sv: '3+' }
      },
    ],

    notableCharacters: [
      "O'Shovah (Comandante Farsight) - El Renegado",
      "Aun'va - Maestro Etereo Supremo",
      "O'Shassera (Comandante Shadowsun) - Campeona del Bien Mayor",
      "Longstrike - As de los Tanques"
    ],

    strengths: [
      'El mejor ejercito de disparo del juego',
      'Armaduras de combate extremadamente versatiles',
      'Excelente alcance y precision',
      'Drones proporcionan apoyo y proteccion'
    ],

    weaknesses: [
      'Terribles en combate cuerpo a cuerpo',
      'Sin psiquicos propios',
      'Infanteria fragil',
      'Dependientes de lineas de vision'
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // TYRANIDS
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'tyranids',
    name: 'Tyranids',
    shortName: 'Tyranids',
    tagline: 'La Gran Devoradora',
    description: 'Una amenaza extragalactica que consume toda vida organica. Enjambres sin fin de monstruosidades biologicas avanzan hacia la galaxia, y no pueden ser razonados, sobornados o detenidos.',
    longDescription: `Los Tiranidos no son nativos de esta galaxia. Vienen del vacio intergalactico, atraidos por el faro psiquico del Astronomican. Son una superinteligencia colectiva llamada la Mente Enjambre, dividida en flotas enjambre que contienen billones de bio-organismos diseñados para un unico proposito: consumir.

Cada mundo que cae ante los Tiranidos es despojado de toda biomasa, desde la atmosfera hasta el nucleo. Esta materia es procesada en las naves colmena para crear mas Tiranidos. Son la entropia biologica encarnada.`,

    color: '#8B008B',
    accentColor: '#080308',
    image: 'https://images.unsplash.com/photo-1604076913837-52ab5629fba9?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1920&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&q=80',
      'https://images.unsplash.com/photo-1571757767119-68b8dbed8c97?w=800&q=80',
      'https://images.unsplash.com/photo-1535957998253-26ae1ef29506?w=800&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
      'https://images.unsplash.com/photo-1605379399642-870262d3d051?w=800&q=80',
    ],

    stats: {
      unitsCount: '65+',
      codexEdition: '10a Ed.',
      difficulty: 'Dificil',
      playstyle: 'Hordas Adaptables',
    },

    loreSections: [
      {
        title: 'La Mente Enjambre',
        content: `La Mente Enjambre es una inteligencia psiquica distribuida entre todos los Tiranidos. No es un ser individual sino una consciencia colectiva que abarca billones de organismos. Cada Tiranido es una neurona en un cerebro del tamaño de una flota.

Las criaturas sinápticas como los Hive Tyrants y Warriors actuan como nodos de esta red. Si son destruidos, los Tiranidos menores pierden su conexion con la Mente y se vuelven ferales, actuando por puro instinto.`,
        quote: {
          text: 'No puedes negociar con el hambre.',
          author: 'Inquisidor Kryptman',
          source: 'Archivos del Ordo Xenos'
        }
      },
      {
        title: 'Adaptacion Biologica',
        content: `Los Tiranidos no inventan tecnologia; la evolucionan. Cada criatura es diseñada geneticamente para su proposito. Los Gaunts son producidos en masa para abrumar. Los Carnifex son tanques vivientes. Los Lictores son asesinos perfectos.

Y lo mas aterrador: aprenden. Cada encuentro con un enemigo es analizado, y las siguientes generaciones nacen con contramedidas. Usaste lanzallamas? La proxima oleada tiene piel ignifuga.`,
        quote: {
          text: 'La evolucion no tiene meta. Solo hambre.',
          author: 'Magos Biologis Xenex',
          source: 'Estudio Taxonomico'
        }
      },
      {
        title: 'Las Flotas Enjambre',
        content: `Los Tiranidos viajan en flotas enjambre, cada una nombrada por el Imperium segun el primer sistema que consumieron. Behemoth fue la primera en llegar, detenida en Macragge a costa terrible. Kraken disperso tentaculos por toda la galaxia. Leviathan ataca desde abajo del plano galactico.

Estas flotas son solo tentaculos de algo mucho mas grande que se acerca desde el vacio. Los augures profetizan que la biomasa de la galaxia entera no saciarìa el hambre de lo que viene.`,
      },
    ],

    units: [
      {
        name: 'Termagants',
        type: 'Tropas',
        description: 'Enjambres de pequenas criaturas armadas con armas biologicas de proyectiles.',
        lore: 'Los Termagants son producidos en masa en las naves colmena. Cada uno lleva un devorador, spinefist u otra arma simbionte que dispara proyectiles vivientes.',
        points: 80,
        image: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=600&q=80',
        stats: { M: '6"', WS: '4+', BS: '4+', S: '3', T: '3', W: '1', A: '1', Ld: '8+', Sv: '5+' }
      },
      {
        name: 'Hive Tyrant',
        type: 'Personaje',
        description: 'El comandante del enjambre. Un monstruo psiquico de intelecto aterrador.',
        lore: 'Los Hive Tyrants son los generales de la Mente Enjambre. Cada uno contiene un fragmento significativo de la consciencia colectiva, capaz de dirigir oleadas de criaturas menores.',
        points: 235,
        image: 'https://images.unsplash.com/photo-1571757767119-68b8dbed8c97?w=600&q=80',
        stats: { M: '8"', WS: '2+', BS: '3+', S: '7', T: '7', W: '11', A: '5', Ld: '5+', Sv: '2+' }
      },
      {
        name: 'Carnifex',
        type: 'Apoyo Pesado',
        description: 'Un tanque viviente diseñado para demoler fortificaciones y vehiculos.',
        lore: 'Los Carnifex son armas de asedio biologicas. Sus garras pueden atravesar el blindaje de un tanque, y su caparazon desvía la mayoría de los disparos.',
        points: 135,
        image: 'https://images.unsplash.com/photo-1535957998253-26ae1ef29506?w=600&q=80',
        stats: { M: '8"', WS: '3+', BS: '4+', S: '7', T: '9', W: '10', A: '4', Ld: '8+', Sv: '2+' }
      },
      {
        name: 'Genestealers',
        type: 'Elite',
        description: 'Infiltradores letales que preparan mundos para la llegada de la flota.',
        lore: 'Los Genestealers se adelantan a las flotas, infiltrandose en poblaciones y creando cultos. Cuando la flota llega, los cultistas dan la bienvenida a sus "salvadores".',
        points: 145,
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
        stats: { M: '8"', WS: '2+', BS: '5+', S: '4', T: '4', W: '2', A: '4', Ld: '7+', Sv: '5+' }
      },
    ],

    notableCharacters: [
      'The Swarmlord - Avatar de la Mente Enjambre',
      'Old One Eye - Carnifex Legendario',
      'Deathleaper - El Lictor Supremo',
      'The Red Terror - Terror de los Tuneles'
    ],

    strengths: [
      'Numeros abrumadores de unidades',
      'Adaptaciones biologicas contra cualquier amenaza',
      'La Sombra en el Warp anula psiquicos enemigos',
      'Monstruos extremadamente poderosos'
    ],

    weaknesses: [
      'Dependientes de criaturas sinápticas',
      'Pocas opciones de disparo de largo alcance',
      'Vulnerables a ataques que eliminen sinápticos',
      'Requieren pintar MUCHOS modelos (de nuevo)'
    ],
  },
]

// Products with real images
export const featuredProducts = [
  {
    id: 1,
    faction: 'Imperium',
    name: 'Combat Patrol: Space Marines',
    description: 'Todo lo necesario para comenzar tu ejercito Space Marine. Incluye Primaris Captain, Intercessors y mas.',
    price: 150,
    badge: 'Nuevo',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  },
  {
    id: 2,
    faction: 'Chaos',
    name: 'Abaddon the Despoiler',
    description: 'El Señor de la Guerra del Caos en toda su gloria oscura. Miniatura central para cualquier ejercito del Caos.',
    price: 45,
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1563207153-f403bf289096?w=600&q=80',
  },
  {
    id: 3,
    faction: 'Necrons',
    name: 'Necron Warriors + Scarabs',
    description: 'Veinte guerreros inmortales y enjambres de escarabajos Canoptek. La base de toda legion Necron.',
    price: 50,
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80',
  },
  {
    id: 4,
    faction: 'Imperium',
    name: 'Imperial Knight Paladin',
    description: 'Una maquina de guerra colosal. Domina el campo de batalla con su potencia de fuego devastadora.',
    price: 140,
    badge: 'Elite',
    image: 'https://images.unsplash.com/photo-1597424216809-3ba9864aeb18?w=600&q=80',
  },
  {
    id: 5,
    faction: 'Chaos',
    name: 'Daemon Prince',
    description: 'Un mortal ascendido por los Dioses Oscuros. Versatil y letal en cualquier ejercito del Caos.',
    price: 40,
    image: 'https://images.unsplash.com/photo-1571757767119-68b8dbed8c97?w=600&q=80',
  },
  {
    id: 6,
    faction: 'Necrons',
    name: 'Canoptek Doomstalker',
    description: 'Plataforma de armas ambulante con el devastador cañon doomsday. Terror a distancia.',
    price: 40,
    badge: 'Limitado',
    image: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=600&q=80',
  },
]

export const getFactionById = (id: string) => factions.find(f => f.id === id)
