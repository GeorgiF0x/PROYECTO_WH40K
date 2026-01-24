// Faction Data
export const factions = [
  {
    id: 'imperium',
    name: 'Imperium of Man',
    shortName: 'Imperium',
    tagline: 'El Emperador Protege',
    description: 'La humanidad unida bajo el Trono Dorado. Space Marines, la Guardia Imperial y el Adeptus Mechanicus defienden un imperio de un millón de mundos contra las tinieblas.',
    longDescription: `El Imperium of Man es la civilización humana más grande de la galaxia, abarcando más de un millón de mundos unidos bajo el dominio del Dios-Emperador de la Humanidad. Durante más de diez milenios, el Imperium ha resistido contra xenos, herejes y los horrores del Warp.

Los Space Marines, los guerreros genéticamente modificados conocidos como los Adeptus Astartes, son el martillo del Emperador. La Guardia Imperial, con sus incontables billones de soldados, es el escudo. El Adeptus Mechanicus preserva el conocimiento sagrado de las máquinas.`,
    color: '#C9A227',
    accentColor: '#1a1a2e',
    image: 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=1920&q=80',
    units: [
      {
        name: 'Primaris Intercessors',
        type: 'Tropas',
        description: 'La columna vertebral de los ejércitos Space Marine. Guerreros versátiles equipados con rifles bolt de patrón Mk II.',
        price: 55,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
      },
      {
        name: 'Adeptus Custodes',
        type: 'Élite',
        description: 'Los guardianes personales del Emperador. Cada uno es una legión por sí mismo.',
        price: 60,
        image: 'https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?w=600&q=80',
      },
      {
        name: 'Imperial Knight',
        type: 'Lord of War',
        description: 'Máquinas de guerra colosales pilotadas por nobles caballeros. Devastación andante.',
        price: 140,
        image: 'https://images.unsplash.com/photo-1597424216809-3ba9864aeb18?w=600&q=80',
      },
    ],
  },
  {
    id: 'chaos',
    name: 'Chaos Space Marines',
    shortName: 'Chaos',
    tagline: 'Muerte al Falso Emperador',
    description: 'Los Marines Traidores que vendieron sus almas a los Dioses del Caos. Diez mil años de guerra eterna contra el Imperium que una vez juraron proteger.',
    longDescription: `Los Chaos Space Marines son los descendientes corruptos de las Legiones Traidoras que se rebelaron contra el Emperador durante la Herejía de Horus hace diez milenios. Empoderados por los Dioses Oscuros del Warp, estos guerreros inmortales libran una guerra eterna contra el Imperium.

Khorne, Tzeentch, Nurgle y Slaanesh otorgan terribles dones a sus seguidores. Mutaciones, poderes psíquicos prohibidos y una sed insaciable de destrucción impulsan a las hordas del Caos en su cruzada negra.`,
    color: '#DC143C',
    accentColor: '#1a0a0a',
    image: 'https://images.unsplash.com/photo-1633477189729-9290b3261d0a?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&q=80',
    units: [
      {
        name: 'Chaos Terminators',
        type: 'Élite',
        description: 'Veteranos blindados con armadura táctica dreadnought corrupta por el Warp.',
        price: 50,
        image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&q=80',
      },
      {
        name: 'Abaddon the Despoiler',
        type: 'Personaje',
        description: 'El Señor de la Guerra del Caos. Líder de las Cruzadas Negras contra Terra.',
        price: 45,
        image: 'https://images.unsplash.com/photo-1563207153-f403bf289096?w=600&q=80',
      },
      {
        name: 'Daemon Prince',
        type: 'Personaje',
        description: 'Un mortal ascendido a la daemonhood. El máximo premio de los Dioses Oscuros.',
        price: 40,
        image: 'https://images.unsplash.com/photo-1571757767119-68b8dbed8c97?w=600&q=80',
      },
    ],
  },
  {
    id: 'necrons',
    name: 'Necrons',
    shortName: 'Necrons',
    tagline: 'Los Antiguos Despiertan',
    description: 'Una raza ancestral que vendió sus almas por la inmortalidad. Ahora despiertan de su sueño de sesenta millones de años para reclamar la galaxia.',
    longDescription: `Los Necrons son los remanentes de la antigua civilización Necrontyr, que hace eones transfirieron sus consciencias a cuerpos de metal viviente en un pacto con los C'tan, los Dioses Estelares. Durante sesenta millones de años han dormido en mundos tumba dispersos por la galaxia.

Ahora despiertan. Sus falanges de guerreros inmortales, sus constructos arcanos y sus señores dinásticos reclaman lo que una vez fue suyo. La galaxia conocerá el dominio de los Necrons una vez más.`,
    color: '#00FF87',
    accentColor: '#0a1a0a',
    image: 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=1920&q=80',
    units: [
      {
        name: 'Necron Warriors',
        type: 'Tropas',
        description: 'La espina dorsal de las legiones Necron. Implacables, incansables, inmortales.',
        price: 45,
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80',
      },
      {
        name: 'Canoptek Wraiths',
        type: 'Ataque Rápido',
        description: 'Constructos fantasmales que atraviesan la materia sólida para destruir a sus presas.',
        price: 50,
        image: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=600&q=80',
      },
      {
        name: 'Silent King',
        type: 'Lord of War',
        description: 'Szarekh, el Rey Silente. Gobernante supremo de todos los Necrons.',
        price: 150,
        image: 'https://images.unsplash.com/photo-1534996858221-380b92700493?w=600&q=80',
      },
    ],
  },
]

// Products with real images
export const featuredProducts = [
  {
    id: 1,
    faction: 'Imperium',
    name: 'Combat Patrol: Space Marines',
    description: 'Todo lo necesario para comenzar tu ejército Space Marine. Incluye Primaris Captain, Intercessors y más.',
    price: 150,
    badge: 'Nuevo',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  },
  {
    id: 2,
    faction: 'Chaos',
    name: 'Abaddon the Despoiler',
    description: 'El Señor de la Guerra del Caos en toda su gloria oscura. Miniatura central para cualquier ejército del Caos.',
    price: 45,
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1563207153-f403bf289096?w=600&q=80',
  },
  {
    id: 3,
    faction: 'Necrons',
    name: 'Necron Warriors + Scarabs',
    description: 'Veinte guerreros inmortales y enjambres de escarabajos Canoptek. La base de toda legión Necron.',
    price: 50,
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80',
  },
  {
    id: 4,
    faction: 'Imperium',
    name: 'Imperial Knight Paladin',
    description: 'Una máquina de guerra colosal. Domina el campo de batalla con su potencia de fuego devastadora.',
    price: 140,
    badge: 'Élite',
    image: 'https://images.unsplash.com/photo-1597424216809-3ba9864aeb18?w=600&q=80',
  },
  {
    id: 5,
    faction: 'Chaos',
    name: 'Daemon Prince',
    description: 'Un mortal ascendido por los Dioses Oscuros. Versátil y letal en cualquier ejército del Caos.',
    price: 40,
    image: 'https://images.unsplash.com/photo-1571757767119-68b8dbed8c97?w=600&q=80',
  },
  {
    id: 6,
    faction: 'Necrons',
    name: 'Canoptek Doomstalker',
    description: 'Plataforma de armas ambulante con el devastador cañón doomsday. Terror a distancia.',
    price: 40,
    badge: 'Limitado',
    image: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=600&q=80',
  },
]

export const getFactionById = (id: string) => factions.find(f => f.id === id)
