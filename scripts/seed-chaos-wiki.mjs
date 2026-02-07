/**
 * Seed script: Legendary Chaos Characters - Wiki Articles
 * Run with: node scripts/seed-chaos-wiki.mjs
 *
 * Uses the Supabase service role key to bypass RLS and insert
 * comprehensive wiki articles for the Chaos faction.
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://yvjflhvbtjjmdwkgqqfs.supabase.co'
const SUPABASE_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2amZsaHZidGpqbWR3a2dxcWZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTIwNTc4MCwiZXhwIjoyMDg0NzgxNzgwfQ.LZrjtPsWkb3RhjDsYVMAFncZvQaLJRfRQAl7tl7fvTg'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

/* ── BlockNote helpers ── */
let _id = 0
const uid = () => `blk-${++_id}`

const heading = (text, level = 2) => ({
  id: uid(), type: 'heading',
  props: { textColor: 'default', backgroundColor: 'default', textAlignment: 'left', level },
  content: [{ type: 'text', text, styles: {} }], children: [],
})

const para = (text) => ({
  id: uid(), type: 'paragraph',
  props: { textColor: 'default', backgroundColor: 'default', textAlignment: 'left' },
  content: [{ type: 'text', text, styles: {} }], children: [],
})

const paraBold = (boldPart, rest) => ({
  id: uid(), type: 'paragraph',
  props: { textColor: 'default', backgroundColor: 'default', textAlignment: 'left' },
  content: [
    { type: 'text', text: boldPart, styles: { bold: true } },
    { type: 'text', text: rest, styles: {} },
  ],
  children: [],
})

const bullet = (text) => ({
  id: uid(), type: 'bulletListItem',
  props: { textColor: 'default', backgroundColor: 'default', textAlignment: 'left' },
  content: [{ type: 'text', text, styles: {} }], children: [],
})

const bulletBold = (boldPart, rest) => ({
  id: uid(), type: 'bulletListItem',
  props: { textColor: 'default', backgroundColor: 'default', textAlignment: 'left' },
  content: [
    { type: 'text', text: boldPart, styles: { bold: true } },
    { type: 'text', text: rest, styles: {} },
  ],
  children: [],
})

const lore = (title, text, icon = 'book') => ({
  id: uid(), type: 'loreBlock',
  props: { title, icon },
  content: [{ type: 'text', text, styles: {} }], children: [],
})

const quote = (text, author, source = '') => ({
  id: uid(), type: 'quoteBlock',
  props: { author, source },
  content: [{ type: 'text', text, styles: {} }], children: [],
})

const alert = (text, type = 'heresy', title = '') => ({
  id: uid(), type: 'alertBlock',
  props: { type, title },
  content: [{ type: 'text', text, styles: {} }], children: [],
})

const spacer = () => ({
  id: uid(), type: 'paragraph',
  props: { textColor: 'default', backgroundColor: 'default', textAlignment: 'left' },
  content: [], children: [],
})

/* ═══════════════════════════════════════════════════════
   ARTICLE DATA
   ═══════════════════════════════════════════════════════ */

const articles = [
  // ─────────────────────────────────────────
  // 1. ABADDON EL SAQUEADOR
  // ─────────────────────────────────────────
  {
    title: 'Abaddon el Saqueador',
    slug: 'abaddon-el-saqueador',
    excerpt: 'Ezekyle Abaddon, Señor de la Guerra del Caos y lider de la Legion Negra, es el mortal mas poderoso al servicio de los Dioses Oscuros. Heredero del legado de Horus, ha lanzado trece Cruzadas Negras contra el Imperium, culminando con la destruccion de Cadia.',
    gallery_images: [
      'https://images.nightcafe.studio/aaig/xG28tWZkT8e0xfR2QpbP.jpg',
      'https://cdna.artstation.com/p/assets/images/images/052/319/792/large/mikhail-savier-abaddon.jpg',
    ],
    content: () => [
      lore('El Heredero de Horus', 'En el vacio helado del Ojo del Terror, donde la realidad se desgarra y los sueños se pudren, un nombre resuena con la fuerza de un trueno eterno: Abaddon. El Saqueador. El Señor de la Guerra. Aquel que tomo el manto de la traicion y lo convirtio en una cruzada interminable contra la luz agonizante del Falso Emperador.', 'scroll'),
      spacer(),
      alert('Los contenidos de este archivo estan clasificados como Excommunicate Traitoris. Su lectura sin autorizacion inquisitorial constituye herejia de primer grado.', 'heresy', 'Advertencia del Ordo Malleus'),
      spacer(),

      heading('Origenes: El Primer Capitan', 2),
      para('Ezekyle Abaddon fue el Primer Capitan de la Legion de los Hijos de Horus durante la Gran Cruzada, la epoca dorada en que la humanidad conquisto las estrellas bajo el liderazgo del Emperador. Nacido en la luna de Cthonia, un mundo minero brutal donde solo los mas fuertes sobrevivian, Abaddon fue reclutado por la XVI Legion y ascendio rapidamente gracias a su ferocidad inigualable y su genio tactico.'),
      para('Como lider de los Justaerin, la elite terminadora de la Legion, Abaddon era temido incluso entre los Astartes. Su devocion a Horus era absoluta — no veia al Primarca solo como un comandante, sino como la encarnacion del destino de la humanidad. Cuando Horus cayo bajo la influencia del Caos en Davin, Abaddon no dudo ni un instante en seguirlo al abismo.'),
      spacer(),
      quote('Horus fue debil. Horus fue un tonto. Fracaso, y esa fue su naturaleza. Yo no fracasare.', 'Abaddon el Saqueador', 'Tras la destruccion de Horus'),
      spacer(),

      heading('La Herejia de Horus y la Caida', 2),
      para('Durante la Herejia de Horus, Abaddon combatio en las batallas mas brutales del conflicto. Estuvo presente en la Masacre del Punto de Caida de Isstvan V, donde tres Legiones leales fueron aniquiladas en una emboscada devastadora. Lidero asaltos contra mundos imperiales con una crueldad que eclipsaba incluso a otros traidores.'),
      para('En el Asedio de Terra, Abaddon fue de los primeros en pisar el suelo del Palacio Imperial, abriendo camino a traves de las defensas con los Justaerin. Cuando Horus cayo derrotado ante el Emperador en la Vengeful Spirit, fue Abaddon quien recupero el cuerpo del Primarca y ordeno la retirada hacia el Ojo del Terror.'),
      para('La muerte de Horus lo cambio para siempre. Abaddon no lloró; se endurecio. Vio en la derrota de su padre no una tragedia, sino una leccion. Horus habia sido debil porque dependo de los Dioses del Caos como sirviente. Abaddon juraria ser su igual.'),
      spacer(),

      heading('La Legion Negra', 2),
      para('En el Ojo del Terror, las Legiones traidoras se fragmentaron en facciones rivales, luchando entre si por los restos del poder de Horus. Abaddon desaparecio durante un tiempo, peregrinando por los mundos demoniacos del Inmaterium en busca de artefactos de poder. Cuando regreso, ya no era simplemente un Capitan: era el Señor de la Guerra.'),
      para('Abaddon destruyo el cadaver clonado de Horus, renegando del nombre de los Hijos de Horus. Repinto su armadura de negro y declaro el nacimiento de la Legion Negra, una fuerza que no serviria a ningun Primarca muerto sino a la vision de un nuevo orden bajo su mando. Marines de todas las Legiones traidoras acudieron a su estandarte, atraidos por su carisma y su promesa de venganza.'),
      bulletBold("Drach'nyen: ", 'El Daemon espada que Abaddon arranco de las entrañas del Warp, una entidad nacida del primer asesinato de la humanidad. Su mero contacto destruye almas.'),
      bulletBold('La Garra de Horus: ', 'El legendario guantelete de energia con garras que Horus uso para herir mortalmente al Emperador. Abaddon lo reclamo como simbolo de su derecho al trono de la guerra.'),
      bulletBold('La Marca del Caos Ascendente: ', 'Abaddon porta la bendicion de los cuatro Dioses del Caos simultaneamente sin ser esclavo de ninguno, un logro casi unico en la historia del Warp.'),
      spacer(),

      heading('Las Trece Cruzadas Negras', 2),
      para('A lo largo de diez mil años, Abaddon ha lanzado trece Cruzadas Negras desde el Ojo del Terror, cada una un asalto devastador contra el Imperium. Aunque muchas parecieron derrotas tacticas, cada Cruzada tenia un objetivo oculto que fue cumplido meticulosamente.'),
      lore('Cruzadas Negras Clave', "La Primera Cruzada Negra (781.M31) establecio a Abaddon como el heredero indiscutible de Horus. La Cuarta aseguro la Fortaleza de El'Phanor. La Sexta destruyo los mundos astillero del Sector Cadian. La Decima desato al demonio Doombreed sobre los mundos del Segmentum Obscurus. La Duodecima aseguro los artefactos Blackstone. Y la Decimotercera... la Decimotercera rompio Cadia.", 'scroll'),
      spacer(),

      heading('La Caida de Cadia', 3),
      para('La Decimotercera Cruzada Negra, conocida tambien como la Guerra de la Grieta, fue la culminacion de diez milenios de planificacion. Abaddon reunio la mayor fuerza militar jamas vista desde la Herejia de Horus y la lanzo contra Cadia, el mundo fortaleza que custodiaba la unica ruta estable fuera del Ojo del Terror.'),
      para('Tras semanas de combate apocaliptico, Abaddon estrello una Fortaleza Blackstone contra la superficie de Cadia, destruyendo los pilones que estabilizaban el espacio real. El planeta se resquebrajo y fue consumido por el Warp, abriendo la Cicatrix Maledictum — la Gran Grieta — que dividio la galaxia en dos.'),
      quote('El planeta se rompe antes que la Guardia.', 'Lord Castellano Ursarkar Creed', 'Ultimas palabras transmitidas desde Cadia'),
      spacer(),

      heading('Poderes y Habilidades', 2),
      para('Abaddon es posiblemente el guerrero mortal mas poderoso de la galaxia. Su fuerza de voluntad es tan indomable que ha rechazado la ascension demoniaca repetidamente, prefiriendo mantener su humanidad y su ambicion intactas.'),
      bulletBold('Maestria en Combate: ', 'Milenios de guerra ininterrumpida lo han convertido en uno de los mejores duelistas del universo, capaz de enfrentar a Primarcas.'),
      bulletBold('Genio Estrategico: ', 'Abaddon no es solo un bruto; es un estratega brillante que planifica campañas con siglos de anticipacion.'),
      bulletBold('Carisma Oscuro: ', 'Su presencia inspira devocion fanatica en sus seguidores y terror absoluto en sus enemigos.'),
      bulletBold('Favor de los Cuatro: ', 'Porta las bendiciones de Khorne, Tzeentch, Nurgle y Slaanesh sin ser peon de ninguno.'),
      spacer(),

      heading('Legado', 2),
      para('Abaddon el Saqueador representa la mayor amenaza existencial para el Imperium del Hombre. Con la Gran Grieta abierta y la galaxia dividida, su Legion Negra acecha como nunca antes. Ya no busca simplemente destruir el Imperium; busca reclamarlo. Donde Horus fracaso, Abaddon pretende triunfar — no como siervo de los Dioses del Caos, sino como su igual, como el verdadero Señor de la Guerra.'),
      alert('En la era actual, Abaddon ha sido confirmado operando en el Segmentum Obscurus con una flota de tamaño sin precedentes. Se recomienda maxima alerta a todas las fuerzas imperiales de la region.', 'danger', 'Alerta Estrategica'),
    ],
  },

  // ─────────────────────────────────────────
  // 2. HORUS LUPERCAL
  // ─────────────────────────────────────────
  {
    title: 'Horus Lupercal',
    slug: 'horus-lupercal',
    excerpt: 'Horus Lupercal, Primarca de los Lobos Lunares y primer Señor de la Guerra del Imperium, fue el hijo predilecto del Emperador antes de convertirse en el mayor traidor de la historia humana. Su rebelion — la Herejia de Horus — casi destruyo el Imperium y condeno a la humanidad a diez mil años de oscuridad.',
    gallery_images: [
      'https://cdnb.artstation.com/p/assets/images/images/032/948/453/large/adrian-smith-horus-lupercal.jpg',
      'https://cdna.artstation.com/p/assets/images/images/024/671/946/large/mikhail-savier-horus-final.jpg',
    ],
    content: () => [
      lore('El Hijo Predilecto', 'Antes de la traicion, antes de la sangre y el fuego, antes de que la galaxia ardiera con la furia de dioses hambrientos, hubo un momento en que Horus Lupercal fue la mayor esperanza de la humanidad. El mas brillante de los Primarcas. El mas amado. El mas peligroso.', 'scroll'),
      spacer(),
      alert('Este registro contiene informacion sobre el Archi-Traidor. La Inquisicion recomienda que solo personal con autorizacion Vermillion acceda a estos datos.', 'heresy'),
      spacer(),

      heading('El Primarca Perfecto', 2),
      para('Horus fue creado en los laboratorios geneticos del Emperador en Terra como uno de los veinte Primarcas, seres sobrehumanos diseñados para liderar los ejercitos de la humanidad en la Gran Cruzada. Cuando los Primarcas infantes fueron dispersados por los Dioses del Caos a traves de la galaxia, Horus fue encontrado en Cthonia, un mundo minero brutal en las cercanias de Terra.'),
      para('De todos los Primarcas recuperados, Horus fue el primero y el que mas tiempo paso junto al Emperador. Esta relacion privilegiada forjo un vinculo que otros Primarcas envidiaban: Horus no solo era un general, era un hijo en el sentido mas profundo de la palabra. El Emperador le enseño diplomacia, estrategia y la vision de una humanidad unida bajo la razon y la ciencia.'),
      para('Horus poseia un carisma sobrenatural. Donde otros Primarcas inspiraban temor o reverencia distante, Horus generaba autentico afecto. Recordaba los nombres de los soldados rasos, compartia historias junto al fuego, y hacia sentir a cada guerrero que su contribucion era vital. Los Marines Espaciales de su Legion — los Lobos Lunares, renombrados despues como los Hijos de Horus — lo adoraban con una devocion que rozaba la idolatria.'),
      spacer(),
      quote('De todos mis hijos, Horus es el mas parecido a mi. Es mi orgullo y mi mayor esperanza para la humanidad.', 'El Emperador de la Humanidad', 'Antes de la Herejia'),
      spacer(),

      heading('Señor de la Guerra', 2),
      para('Cuando el Emperador decidio retirarse a Terra para trabajar en el Proyecto Webway en secreto, designo a Horus como Señor de la Guerra, comandante supremo de todas las fuerzas militares del Imperium. Esta decision provoco resentimiento entre otros Primarcas, pero la eleccion era logica: nadie igualaba la combinacion de carisma, habilidad militar y vision politica de Horus.'),
      para('Sin embargo, el titulo trajo consigo una carga insoportable. Horus se encontro gestionando no solo campañas militares, sino tambien la creciente burocracia del Imperium, las rivalidades entre sus hermanos, y la frustrante falta de comunicacion con su padre. La semilla de la duda fue plantada: ¿por que el Emperador lo habia abandonado? ¿Que secretos le ocultaba?'),
      spacer(),

      heading('La Caida en Davin', 2),
      para('La corrupcion de Horus fue un proceso orquestado con precision diabólica por los Dioses del Caos, con Erebus de los Portadores de la Palabra como su instrumento principal. Durante una campaña en la luna de Davin, Horus fue herido mortalmente por un arma imbuida de energia Warp.'),
      para('Los chamanes de la Logia del Guerrero lo llevaron al Templo de la Serpiente, donde realizaron un ritual que proyecto el alma de Horus al Immaterium. Alli, los Dioses del Caos le mostraron visiones del futuro: un Imperium estancado donde el Emperador seria adorado como un dios mientras sus hijos eran olvidados, un tirano inmortal que habia usado a sus Primarcas como herramientas desechables.'),
      para('Las visiones eran manipulaciones habilmente diseñadas, mezclando verdades a medias con mentiras absolutas. Pero Horus, debilitado por la herida y el veneno del Warp, no pudo distinguir la diferencia. Acepto el poder de los Cuatro Dioses y resucito — ya no como el campeon de la humanidad, sino como su verdugo.'),
      spacer(),
      lore('El Momento de la Caida', 'En las profundidades del Templo de la Serpiente, Horus Lupercal abrio los ojos. Ya no brillaban con la luz dorada de su padre; ardian con el fuego del Warp. Mil destinos posibles convergieron en ese instante: la galaxia contuvo el aliento, y algo antiguo y hambriento sonrio en la oscuridad.', 'book'),
      spacer(),

      heading('La Herejia', 2),
      para('La rebelion de Horus fue la mayor guerra civil en la historia de la humanidad. La mitad de las Legiones Astartes, junto con titanes, flotas enteras y sectores completos del Imperium, se alzaron contra Terra. La galaxia ardio durante siete años de guerra total.'),
      para('Horus demostro su genio tactico dividiendo las fuerzas leales, asegurandose de que los Primarcas mas peligrosos — como Guilliman, Russ y el Leon — estuvieran lejos de Terra cuando lanzara su ataque final. La Masacre de Isstvan, la Batalla de Calth, la Sombra Cruzada de Curze, el Asedio de Terra... cada batalla fue una pieza en un tablero galactico.'),
      para('Pero el poder del Caos cobra su precio. A medida que la Herejia avanzaba, Horus se volvia mas erratico, mas cruel, mas poseido por las energias del Warp. El lider carismatico que sus hombres adoraban fue reemplazado por algo que apenas parecia humano, una marioneta cada vez mas controlada por las mismas entidades que habia creido poder dominar.'),
      spacer(),

      heading('El Asedio de Terra y la Muerte', 2),
      para('El Asedio de Terra fue el climax de la Herejia. Las fuerzas de Horus bombardearon el Palacio Imperial durante semanas, abriendo brechas en las murallas con la fuerza combinada de ocho Legiones traidoras, demonios invocados del Warp y titanes corruptos.'),
      para('Cuando la victoria parecia inminente, Horus cometio su error fatal: bajo los escudos de su nave insignia, la Vengeful Spirit, en lo que los eruditos debaten si fue arrogancia, un destello de su antigua nobleza buscando un duelo honorable, o una trampa para el Emperador. Fuera cual fuera la razon, el Emperador se teletransporto a bordo junto a sus Custodes y los Puños Imperiales de Rogal Dorn.'),
      para('El duelo final entre padre e hijo fue un evento de proporciones cosmicas. El Emperador, contenido por su amor paterno, no lucho con toda su fuerza hasta que Horus mato al custodio Ollanius Pius (o segun otras fuentes, a un Marine Espacial o un Custodes). Al ver la crueldad absoluta de Horus al destruir a un mortal indefenso, el Emperador comprendio que su hijo estaba perdido para siempre.'),
      para('Desatando todo su poder psiquico, el Emperador destruyo el alma de Horus con un ataque tan devastador que elimino toda posibilidad de reencarnacion o resurreccion por parte de los Dioses del Caos. Pero el esfuerzo lo dejo mortalmente herido, condenandolo al Trono Dorado por la eternidad.'),
      spacer(),
      quote('He vuelto, padre. Soy yo, Horus, tu hijo. ¿Que me han hecho? ¿Que he hecho?', 'Horus Lupercal', 'Supuestas ultimas palabras antes de la destruccion de su alma'),
      spacer(),

      heading('Legado del Archi-Traidor', 2),
      para('Horus Lupercal es simultaneamente la mayor tragedia y la mayor advertencia del Imperium. Su caida demostro que incluso el mas poderoso y noble de los seres puede ser corrompido, y que la confianza ciega — incluso en aquellos que amamos — puede conducir a la destruccion total.'),
      para('Diez mil años despues, su nombre sigue siendo la maxima blasfemia en el Imperium. Su Legion fue destruida, sus monumentos borrados, sus logros atribuidos a otros. Y sin embargo, su sombra se extiende sobre toda la galaxia: la Gran Grieta, los Dioses del Caos fortalecidos, el Emperador agonizante en el Trono... todo es consecuencia de la eleccion de un hijo que se creyo traicionado por su padre.'),
    ],
  },

  // ─────────────────────────────────────────
  // 3. KHARN EL TRAIDOR
  // ─────────────────────────────────────────
  {
    title: 'Kharn el Traidor',
    slug: 'kharn-el-traidor',
    excerpt: 'Kharn el Traidor es el campeon mortal mas mortifero de Khorne, el Dios de la Sangre. Antaño capitan honrado de los Devoradores de Mundos, su descenso a la locura berserker lo convirtio en una fuerza de destruccion pura que no distingue entre amigos y enemigos.',
    gallery_images: [
      'https://cdnb.artstation.com/p/assets/images/images/042/476/741/large/adrian-smith-kharn.jpg',
    ],
    content: () => [
      lore('La Furia Encarnada', 'Donde Kharn camina, la sangre fluye como rios. No hay aliados a su lado, solo victimas que aun no han caido. El Traidor no lucha por gloria ni por venganza — lucha porque la matanza es lo unico que silencia los gritos dentro de su mente destrozada.', 'scroll'),
      spacer(),

      heading('El Capitan de la XII Legion', 2),
      para('Antes de la locura, Kharn fue uno de los guerreros mas respetados de la Gran Cruzada. Como Octavo Capitan de los Devoradores de Mundos — la XII Legion Astartes liderada por el Primarca Angron — Kharn era conocido no solo por su habilidad marcial excepcional, sino sorprendentemente por su ecuanimidad y moderacion.'),
      para('En una Legion de berserkers impulsados por los Clavos de Carnicero — implantes neurales que estimulaban una furia asesina incontrolable — Kharn actuaba como la voz de la razon. Era el intermediario entre Angron, cuya ira era tan incontrolable que apenas podia comunicarse con sus propios hijos, y el resto de la Legion. Sus hermanos lo respetaban porque, a pesar de portar los Clavos, mantenia el control. Era la prueba viviente de que se podia ser un Devorador de Mundos sin perder la humanidad.'),
      spacer(),
      quote('Angron me enseño que la furia es un arma. Lo que no me enseño es como volver a envainarla.', 'Kharn', 'Antes de la Herejia'),
      spacer(),

      heading('La Herejia y los Clavos de Carnicero', 2),
      para('Cuando Angron se unio a la traicion de Horus, los Devoradores de Mundos lo siguieron sin cuestionarlo — la mayoria ya estaban demasiado dañados por los Clavos para tomar decisiones racionales. Kharn, que aun conservaba restos de lucidez, lucho con una eficacia aterradora en cada batalla de la Herejia.'),
      para('En Isstvan III, cuando Horus ordeno el bombardeo viral para purgar a los leales dentro de sus propias Legiones, Kharn combatio en la superficie contra sus antiguos hermanos. Fue durante esta batalla fratricida donde su leyenda sangrienta comenzo a cristalizar: combatio durante horas sin descanso, matando a decenas de Marines leales en combate cuerpo a cuerpo.'),
      para('A medida que la Herejia avanzaba, los Clavos de Carnicero erosionaron lo que quedaba de su racionalidad. El guerrero equilibrado y diplomatico fue reemplazado lentamente por algo mas primitivo, mas puro en su proposito: un motor de destruccion que solo encontraba paz en el acto de matar.'),
      spacer(),

      heading('La Noche de Skalathrax', 2),
      para('El evento que definio el destino de Kharn — y que le gano el titulo de "el Traidor" — ocurrio en el mundo helado de Skalathrax. Los Devoradores de Mundos y la Legion de los Hijos del Emperador luchaban juntos contra fuerzas imperiales cuando las temperaturas nocturnas descendieron a niveles letales, obligando a ambos bandos a buscar refugio.'),
      para('Kharn no podia aceptar la pausa. La furia de los Clavos de Carnicero no admitia descanso. Enloquecido, tomo un lanzallamas y comenzo a incendiar los refugios de sus propios compañeros, obligandolos a salir al frio mortal para luchar. No distinguia entre amigos y enemigos: todo lo que vivia era un objetivo.'),
      para('La carniceria que siguio destruyo cualquier cohesion que quedara en los Devoradores de Mundos. La Legion se fragmento en partidas de guerra independientes, bandas de berserkers que vagan por la galaxia saciando una sed de sangre que nunca puede ser satisfecha. Kharn fue su arquitecto involuntario.'),
      spacer(),
      alert('Kharn el Traidor ha sido confirmado en mas de 700 zonas de combate en los ultimos 10.000 años. Cada aparicion resulta en bajas catastroficas para TODOS los bandos presentes, incluyendo las fuerzas del Caos.', 'danger', 'Registro de Amenazas del Ordo Malleus'),
      spacer(),

      heading('Gorechild: La Sed del Hacha', 2),
      para('Kharn porta Gorechild, una de las dos hachas de cadena que fueron forjadas originalmente para Angron. Esta arma legendaria tiene dientes de adamantio capaces de atravesar la ceramita de una armadura de Exterminador como si fuera papel. Se dice que el arma esta imbuida de una fraccion de la furia del propio Khorne, y que gime de placer cuando bebe sangre.'),
      para('Ademas de Gorechild, Kharn porta una pistola de plasma y una armadura de batalla cubierta con las marcas de incontables matanzas. Cada hueso, cada craneo, cada marca es un recordatorio de que la cuenta de Kharn ante Khorne nunca deja de crecer.'),
      spacer(),

      heading('El Bendito de Khorne', 2),
      para('A lo largo de los milenios, Kharn ha muerto innumerables veces, solo para ser resucitado por Khorne. El Dios de la Sangre lo considera su campeon mortal mas valioso — no porque Kharn sea devoto, sino porque es la encarnacion perfecta de la filosofia de Khorne: la sangre fluye, sin importar de quien sea.'),
      para('La ironia definitiva de Kharn es que su titulo de "Traidor" no se refiere a la traicion contra el Imperium, sino a la traicion contra sus propios aliados. Es tan peligroso para las fuerzas del Caos como para las del Imperium. Combatir junto a Kharn es casi tan mortifero como combatir contra el.'),
      spacer(),
      quote('Sangre para el Dios de la Sangre. Craneos para el Trono de Craneos. ¡MATAR! ¡QUEMAR! ¡ARRASAR!', 'Kharn el Traidor', 'Grito de guerra recurrente'),
      spacer(),

      heading('Legado de Sangre', 2),
      para('Kharn el Traidor es la demostracion mas visceral de lo que el Caos hace con sus seguidores. Un guerrero noble reducido a un animal rabioso, una mente brillante consumida por implantes defectuosos y la sed de un dios sediento. Y sin embargo, en algun rincon oscuro de su psique fracturada, dicen que aun queda un destello del capitan que fue — un destello que hace que su condena sea infinitamente mas tragica.'),
    ],
  },

  // ─────────────────────────────────────────
  // 4. AHRIMAN
  // ─────────────────────────────────────────
  {
    title: 'Ahriman, Archihechicero de los Mil Hijos',
    slug: 'ahriman-archihechicero',
    excerpt: 'Ahzek Ahriman es el hechicero mas poderoso entre los Marines Espaciales del Caos y antiguo Bibliotecario Jefe de la Legion de los Mil Hijos. Su obsesion por revertir la Rubrica que condeno a sus hermanos lo ha llevado a cometer atrocidades inimaginables en su busqueda del conocimiento prohibido.',
    gallery_images: [
      'https://cdna.artstation.com/p/assets/images/images/048/517/688/large/mikhail-savier-ahriman.jpg',
    ],
    content: () => [
      lore('El Buscador de la Verdad', 'Ahriman busca. Siempre busca. A traves de bibliotecas ardientes y mundos muertos, a traves del tiempo mismo y las puertas de la locura, persigue una respuesta a la pregunta que lo consume: ¿como puedo deshacer lo que hice? La tragedia de Ahriman es que cada paso hacia la redencion lo hunde mas en la condena.', 'book'),
      spacer(),

      heading('El Erudito de Prospero', 2),
      para('Ahzek Ahriman nacio en Terra, en la region que una vez fue Achaemenia. Desde joven mostro un talento psiquico extraordinario que lo llevo a ser reclutado por la XV Legion, los Mil Hijos, bajo el mando del Primarca Magnus el Rojo. En Prospero, el mundo natal adoptivo de la Legion, Ahriman florecio.'),
      para('Prospero era un mundo dedicado al conocimiento y las artes misticas. Los Mil Hijos eran unicos entre las Legiones Astartes: mas eruditos que guerreros, mas bibliotecarios que soldados. Ahriman ascendio hasta convertirse en el Bibliotecario Jefe de la Legion y lider de la Hermandad de la Corvidae, una de las cinco sectas psiquicas que formaban la estructura de los Mil Hijos.'),
      para('Su hermano gemelo Ohrmuzd murio victima de las mutaciones descontroladas que plagaban a la Legion — el fenomeno conocido como la Carne Cambiante. Esta perdida personal marco profundamente a Ahriman y sembro en el la obsesion por encontrar una cura para las aflicciones que diezmaban a sus hermanos.'),
      spacer(),

      heading('La Quema de Prospero', 2),
      para('Cuando Magnus uso hechiceria prohibida para advertir al Emperador sobre la traicion de Horus — rompiendo las protecciones del Proyecto Webway en el proceso — el Emperador envio a los Lobos Espaciales a arrestar a Magnus. Lo que siguio fue la destruccion total de Prospero.'),
      para('Ahriman lucho desesperadamente para defender su mundo y sus bibliotecas, pero la ferocidad de los Lobos Espaciales y la negativa inicial de Magnus a defenderse condenaron a Prospero. La destruccion de siglos de conocimiento acumulado fue un trauma del que Ahriman nunca se recuperaria. La caida de Prospero no solo destruyo un mundo: destruyo la identidad de los Mil Hijos.'),
      spacer(),
      quote('El conocimiento es poder. Guardalo bien. Pero mejor aun: usalo sin piedad.', 'Ahriman', 'Grimorio de Ahriman'),
      spacer(),

      heading('La Rubrica de Ahriman', 2),
      para('Exiliados en el Planeta de los Hechiceros dentro del Ojo del Terror, los Mil Hijos continuaron sufriendo mutaciones cada vez mas grotescas. Ahriman, incapaz de soportar ver a mas hermanos transformarse en abominaciones de carne retorcida, diseño un hechizo masivo para detener las mutaciones de una vez por todas: la Rubrica de Ahriman.'),
      para('El ritual fue un exito tecnico y un desastre absoluto. La Rubrica detuvo las mutaciones, pero lo hizo de la forma mas cruel posible: todos los Mil Hijos sin poder psiquico suficiente fueron reducidos a polvo dentro de sus armaduras. Sus espiritus quedaron atrapados en la ceramita, convirtiendolos en autómatas sin mente — los Marines de Polvo, soldados fantasmales que obedecen ordenes pero carecen de alma o voluntad propia.'),
      para('Solo los hechiceros mas poderosos sobrevivieron intactos. Ahriman habia salvado a los Mil Hijos de la mutacion al precio de condenarlos a una existencia peor que la muerte.'),
      spacer(),
      alert('La Rubrica de Ahriman es considerada uno de los mayores actos de brujeria en la historia de la galaxia. Se estima que entre 80.000 y 100.000 Astartes fueron reducidos a polvo animado por este unico acto.', 'heresy', 'Clasificacion: Omega-Extremis'),
      spacer(),

      heading('El Exilio y la Busqueda Eterna', 2),
      para('Magnus, enfurecido por la destruccion de su Legion, desterro a Ahriman. Desde entonces, Ahriman vaga por la galaxia con su propia partida de guerra de Mil Hijos, buscando incansablemente una forma de revertir la Rubrica. Su objetivo ultimo es acceder a la Biblioteca Negra de la Telaraña Aeldari, donde cree que existe el conocimiento para deshacer su error.'),
      para('En su busqueda, Ahriman ha saqueado bibliotecas, destruido mundos, esclavizado a psiquicos, y manipulado a imperios enteros. Ha invadido la Telaraña Aeldari multiples veces, provocando la ira de los Arlequines y los Aeldari Oscuros. Cada fracaso solo fortalece su determinacion.'),
      bulletBold('El Baculo Negro: ', 'Ahriman porta un poderoso baculo de fuerza que canaliza sus enormes poderes psiquicos, capaz de desgarrar la realidad misma.'),
      bulletBold('El Disco de Tzeentch: ', 'Frecuentemente cabalga sobre un Disco de Tzeentch, una plataforma demoniaca que le permite volar por el campo de batalla.'),
      bulletBold('Dominio Psiquico: ', 'Es considerado el hechicero mortal mas poderoso de la galaxia, capaz de manipular el tiempo, el espacio y la materia a voluntad.'),
      spacer(),

      heading('La Tragedia de Ahriman', 2),
      para('Lo que hace a Ahriman verdaderamente fascinante es que sus intenciones, en su nucleo, son nobles. Quiere salvar a sus hermanos. Quiere corregir su error. Pero el camino del conocimiento prohibido es una espiral descendente sin fondo, y cada atrocidad que comete en nombre de la salvacion lo aleja mas de la humanidad que intenta preservar.'),
      para('Ahriman es la encarnacion perfecta de la filosofia de Tzeentch: el cambio por el cambio, la busqueda del conocimiento como fin en si mismo, y la cruel ironia de que los mayores esfuerzos a menudo producen los peores resultados.'),
      quote('Todo lo que he hecho, lo he hecho por mis hermanos. Si eso me condena, que asi sea. Pero no me detendre.', 'Ahriman', 'Reflexiones desde el exilio'),
    ],
  },

  // ─────────────────────────────────────────
  // 5. TYPHUS
  // ─────────────────────────────────────────
  {
    title: 'Typhus, Heraldo de Nurgle',
    slug: 'typhus-heraldo-de-nurgle',
    excerpt: 'Calas Typhon, renombrado Typhus el Viajero, es el Primer Capitan de la Guardia de la Muerte y el Huesped del Enjambre Destructor. Portador de las peores plagas jamas concebidas, Typhus es la mano derecha de Mortarion y uno de los mortales mas favorecidos por Nurgle.',
    gallery_images: [],
    content: () => [
      lore('La Pestilencia Encarnada', 'Alli donde Typhus camina, la vida se pudre y renace en formas grotescas. Las flores se marchitan, el metal se oxida, y la carne se descompone y vuelve a crecer en ciclos interminables de decadencia y renovacion. Es la bendicion del Abuelo Nurgle hecha carne — un jardin ambulante de muerte y renacimiento.', 'scroll'),
      spacer(),

      heading('Calas Typhon: El Traidor Original', 2),
      para('Antes de ser Typhus, fue Calas Typhon, Primer Capitan de la XIV Legion — la Guardia de la Muerte. Nacido en el mundo de Barbarus, el mismo planeta toxico donde crecio el Primarca Mortarion, Typhon fue uno de los primeros guerreros en unirse a la Legion. Pero lo que nadie sabia era que Typhon albergaba un secreto: era un psiquico, algo que Mortarion despreciaba profundamente, y habia sido contactado por agentes del Caos mucho antes de la Herejia.'),
      para('Typhon fue un traidor antes de que la traicion tuviera nombre. Mientras sus hermanos creian que marchaban por el Emperador, Typhon ya habia vendido su alma a Nurgle, esperando pacientemente el momento de entregar a toda su Legion al Dios de la Plaga.'),
      spacer(),

      heading('La Trampa en el Warp', 2),
      para('Cuando la Herejia de Horus estallo, Typhon encontro su oportunidad. La Guardia de la Muerte, aun leal a Horus pero no comprometida con el Caos, navegaba por el Warp rumbo a Terra. Typhon, como Primer Capitan y navegante de facto de la flota, deliberadamente los guio hacia las corrientes Warp mas peligrosas, desactivando los campos Geller que protegian las naves.'),
      para('La flota de la Guardia de la Muerte quedo atrapada en una tormenta Warp de proporciones apocalipticas. Sin las protecciones de los campos Geller, las energias del Inmaterium invadieron las naves. Y con ellas llego la Plaga del Destructor: una enfermedad demoniaca diseñada por el propio Nurgle.'),
      para('Los Marines de la Guardia de la Muerte, los guerreros mas resistentes del Imperium, fueron devastados. Sus cuerpos superhumanos — diseñados para soportar cualquier toxico, cualquier enfermedad — se retorcieron de dolor mientras sus organos se licuaban y su carne se pudria en vida. Lloraron, suplicaron, y finalmente, cuando el sufrimiento se volvio insoportable, aceptaron la unica salvacion disponible: la bendicion de Nurgle.'),
      spacer(),
      alert('La conversion de la Guardia de la Muerte es considerada una de las mayores victorias del Caos en la Herejia. Mas de 70.000 Astartes fueron corrompidos en un solo acto de traicion.', 'danger', 'Archivo Historico Sellado'),
      spacer(),

      heading('El Huesped del Enjambre Destructor', 2),
      para('Typhon fue el primero en abrazar la plaga voluntariamente. Nurgle, complacido con su siervo mas devoto, lo recompenso generosamente. El cuerpo de Typhon se convirtio en el huesped del Enjambre Destructor — una colmena viviente de moscas demoniacas, bacterias sobrenaturales y parasitos del Warp que habita dentro de su armadura distendida.'),
      para('Renombrado como Typhus el Viajero, se convirtio en el heraldo de Nurgle mas poderoso en el plano material. Su mera presencia desata epidemias que pueden despoblar mundos enteros. Las moscas que emanan de su cuerpo llevan enfermedades para las que no existe cura, y su armadura — la legendaria armadura de Exterminador conocida como el Ropaje del Destructor — esta tan imbuida de pestilencia que rezuma enfermedad como un organismo vivo.'),
      spacer(),
      quote('La enfermedad no es un castigo. Es un regalo. Nurgle te ama, y el amor del Abuelo se manifiesta en cada llaga, cada fiebre, cada grito de agonía.', 'Typhus el Viajero'),
      spacer(),

      heading('Poderes y Armamento', 2),
      bulletBold('Manreaper: ', 'La guadaña de guerra de Typhus, un arma masiva de poder imbuida con la esencia de Nurgle. Un solo corte inflinge enfermedades incurables ademas de daño fisico devastador.'),
      bulletBold('El Enjambre Destructor: ', 'Typhus puede liberar nubes de moscas demoniacas que devoran la carne y transmiten plagas warp. El enjambre es una extension de su voluntad.'),
      bulletBold('Poderes Psiquicos: ', 'A pesar del odio de Mortarion hacia los psiquicos, Typhus es un hechicero poderoso que canaliza las energias de Nurgle para invocar plagas, maldiciones y pestilencias sobrenaturales.'),
      bulletBold('Inmortalidad Putrida: ', 'Su cuerpo, mantenido en un estado de descomposicion perpetua por Nurgle, es practicamente indestructible. Las heridas se pudren y cierran, los organos destruidos son reemplazados por parasitos funcionales.'),
      spacer(),

      heading('El Conflicto con Mortarion', 2),
      para('Paradojicamente, Typhus y su Primarca Mortarion mantienen una relacion de profunda animosidad. Mortarion nunca perdono a Typhon por haberlo obligado a someterse a Nurgle; el Primarca se ve a si mismo como un prisionero del Dios de la Plaga, no un devoto voluntario. Typhus, por su parte, desprecia la ingratitud de Mortarion y considera que el Primarca es indigno de los dones que Nurgle le ha otorgado.'),
      para('Esta rivalidad ha dividido a la Guardia de la Muerte en facciones: los seguidores de Mortarion y los seguidores de Typhus. A pesar de sus diferencias, ambos sirven a los propositos de Nurgle, y el Abuelo se deleita en su conflicto como un padre divertido por las peleas de sus hijos.'),
      spacer(),

      heading('Legado Pestilente', 2),
      para('Typhus ha desatado mas plagas, epidemias y pandemias que cualquier otro ser en la historia de la galaxia. Mundos enteros han sido despoblados por su paso, convertidos en jardines de Nurgle donde la vida florece en formas nuevas y horrendas. Para el Imperium, es una de las mayores amenazas biologicas existentes; para Nurgle, es su hijo favorito.'),
    ],
  },

  // ─────────────────────────────────────────
  // 6. LUCIUS EL ETERNO
  // ─────────────────────────────────────────
  {
    title: 'Lucius el Eterno',
    slug: 'lucius-el-eterno',
    excerpt: 'Lucius el Eterno es el campeon inmortal de Slaanesh y el duelista mas mortifero del Caos. Antiguo espadachin de los Hijos del Emperador, porta una maldicion que lo hace virtualmente imposible de matar: cualquiera que sienta orgullo al derrotarlo se transforma en Lucius.',
    gallery_images: [],
    content: () => [
      lore('El Duelista Inmortal', 'Lucius ha muerto mil veces. Y mil veces ha renacido, emergiendo de la carne de su matador como una mariposa de una crisalida de hueso y sufrimiento. Slaanesh no permite que su juguete favorito descanse — el espectaculo debe continuar, y Lucius es el actor principal en una obra de crueldad eterna.', 'book'),
      spacer(),

      heading('El Espadachin de la III Legion', 2),
      para('Lucius fue una vez el mejor espadachin de los Hijos del Emperador, la III Legion Astartes dedicada a la perfeccion en todas sus formas. Incluso entre una Legion obsesionada con la excelencia, Lucius destacaba por su habilidad sobrenatural con la espada. Era capaz de derrotar a oponentes mucho mas grandes y fuertes con una elegancia que parecia mas danza que combate.'),
      para('Pero la perfeccion tiene un precio: Lucius era vanidoso hasta la obsesion. Cada victoria alimentaba su ego, y cada cicatriz de derrota era un recordatorio intolerable de imperfeccion. Comenzo a marcarse el rostro con cicatrices autoinfligidas, una por cada rival que consideraba digno — una practica que sus hermanos veian con una mezcla de admiracion y perturbacion.'),
      spacer(),

      heading('La Caida en el Exceso', 2),
      para('Cuando los Hijos del Emperador cayeron bajo la influencia de Slaanesh, Lucius abrazo la corrupcion con entusiasmo. La busqueda de la perfeccion se transformo en la busqueda del exceso: ya no buscaba ser el mejor espadachin, sino experimentar la forma mas pura de sensacion en el combate.'),
      para('En Isstvan III, Lucius inicio como lealista, luchando contra los traidores. Pero cuando vio la destreza marcial de los guerreros del Caos, la emocion del combate contra enemigos verdaderamente dignos lo sedujo. Traiciono a sus compañeros leales y se unio a Fulgrim, completando su caida.'),
      spacer(),
      quote('Cada cicatriz es una historia. Cada herida, una leccion. Y la leccion siempre es la misma: nadie es mejor que yo.', 'Lucius', 'Antes del combate ritual en Iydris'),
      spacer(),

      heading('La Maldicion de la Eternidad', 2),
      para('El don mas terrible y definitorio de Lucius fue concedido por Slaanesh tras una de sus muchas muertes en combate. La maldicion funciona asi: cualquiera que mate a Lucius y sienta la mas minima chispa de satisfaccion, orgullo o placer por la victoria, comenzara a transformarse. Su piel se endurece, su cuerpo se retuerce, y lentamente, dolorosamente, Lucius renace dentro de su cuerpo, consumiendo al matador desde dentro.'),
      para('El rostro del derrotado queda atrapado para siempre en la armadura de Lucius, añadido a la coleccion de almas atormentadas que decoran su ceramita. Estas almas estan conscientes eternamente, atrapadas en un tormento sin fin mientras Lucius las usa como trofeos vivientes.'),
      para('Esta maldicion hace que matar a Lucius sea casi imposible. Solo un ser completamente desprovisto de emocion — ni siquiera un instante de alivio al eliminarlo — podria matarlo permanentemente. Incluso un Culexus Asesino, un arma viviente sin emocion, fracaso: la maldicion encontro satisfaccion en el arma que lo mato y lo resucito a traves de un operario de una fabrica que sintio orgullo al completar el proyectil.'),
      spacer(),
      alert('La maldicion de Lucius ha funcionado incluso a traves de cadenas causales extremadamente largas. NO se recomienda el combate directo bajo ninguna circunstancia. Consultar al Ordo Malleus para protocolos de contencion.', 'danger', 'Protocolo Inquisitorial'),
      spacer(),

      heading('Armamento', 2),
      bulletBold('El Latigo del Lacerante: ', 'Un latigo de combate neural que causa dolor agonizante con cada golpe, alimentando el placer de Slaanesh.'),
      bulletBold('Espada del Lacerante: ', 'Una hoja maestra forjada con la esencia del dolor, capaz de cortar a traves de cualquier armadura.'),
      bulletBold('Armadura de las Almas: ', 'Su armadura contiene los rostros de todos aquellos que lo mataron y fueron consumidos. Las almas gritan eternamente, distrayendo y aterrorizando a sus enemigos.'),
      spacer(),

      heading('La Eterna Busqueda', 2),
      para('Lucius vaga por la galaxia buscando dos cosas: oponentes dignos y la sensacion perfecta del combate. Cada duelo es una experiencia sensorial total para el: el canto del acero, el olor de la sangre, la expresion de terror en los ojos de un rival superado. Para Lucius, el combate no es guerra — es arte, y el es el artista supremo.'),
      para('Su existencia es una paradoja cruel creada por Slaanesh: un guerrero inmortal condenado a buscar eternamente un combate que lo satisfaga, sabiendo que nunca lo encontrara. La perfeccion es una meta que se aleja con cada paso, y Lucius correra tras ella por la eternidad.'),
    ],
  },

  // ─────────────────────────────────────────
  // 7. MAGNUS EL ROJO
  // ─────────────────────────────────────────
  {
    title: 'Magnus el Rojo, Primarca Demonio',
    slug: 'magnus-el-rojo',
    excerpt: 'Magnus el Rojo, el Ciclope Carmesi, es el Primarca demonio de los Mil Hijos y señor del Planeta de los Hechiceros. El psiquico mas poderoso entre los Primarcas, su historia es una tragedia de buenas intenciones destruidas por la desconfianza, la manipulacion y un error catastrofico que condeno a toda su Legion.',
    gallery_images: [
      'https://cdnb.artstation.com/p/assets/images/images/031/668/399/large/adrian-smith-magnus-red.jpg',
    ],
    content: () => [
      lore('El Ciclope Carmesi', 'Magnus el Rojo era un gigante entre gigantes, una mente que abarcaba galaxias y un alma que ardia con el fuego de mil soles. Vio mas lejos que cualquier mortal y comprendio verdades que harian enloquecer a mentes menores. Y sin embargo, con toda su sabiduria, no pudo ver la trampa que se cerraba a su alrededor.', 'scroll'),
      spacer(),

      heading('El Señor de Prospero', 2),
      para('Magnus fue encontrado en Prospero, un mundo que habia desarrollado una civilizacion avanzada basada en el conocimiento psiquico y la hechiceria. A diferencia de otros Primarcas que conquistaron mundos barbaros, Magnus heredo una sociedad de eruditos. Bajo su guia, Prospero se convirtio en el faro del conocimiento humano: sus bibliotecas rivalizaban con las de Terra, sus universidades atraian a los mejores intelectuales de la galaxia.'),
      para('Fisicamente, Magnus era imponente: un gigante de piel rojiza, un unico ojo ciclópeo que brillaba con poder psiquico, y una presencia que irradiaba autoridad intelectual. Era el psiquico mas poderoso entre todos los Primarcas, capaz de hazañas que desafiaban las leyes de la realidad.'),
      para('Pero esta misma naturaleza psiquica lo ponia en conflicto directo con el Emperador, quien habia prohibido la hechiceria en el Edicto de Nikaea. Magnus creia fervientemente que los poderes psiquicos eran una herramienta esencial para la humanidad y que la prohibicion era un error. Esta desobediencia intelectual sembraria las semillas de su destruccion.'),
      spacer(),
      quote('El conocimiento no es inherentemente peligroso. Es la ignorancia la que destruye imperios.', 'Magnus el Rojo', 'Discurso ante el Concilio de Nikaea'),
      spacer(),

      heading('El Error Fatal', 2),
      para('Cuando Magnus descubrio la traicion de Horus mediante sus poderes psiquicos, intento advertir al Emperador por el metodo mas rapido disponible: una proyeccion astral directa a Terra. Pero para atravesar las defensas psiquicas del Palacio Imperial, Magnus tuvo que usar una cantidad de poder tan inmensa que destrozo las protecciones del Proyecto Webway — el proyecto secreto del Emperador para crear una red de viaje segura para la humanidad, libre del Warp.'),
      para('Este unico acto, nacido de la desesperacion y las buenas intenciones, arruino siglos de trabajo del Emperador. Hordas demoniacas invadieron los tuneles del Webway bajo Terra, obligando al Emperador a sellarlos y sentarse permanentemente en el Trono Dorado para mantener la brecha cerrada. En esencia, Magnus condeno a su padre al Trono Dorado antes de que Horus pudiera siquiera atacar Terra.'),
      para('El Emperador, furioso, envio a Leman Russ y los Lobos Espaciales a arrestar a Magnus. Pero Horus, manipulando los mensajes, convirtio la mision de arresto en una orden de exterminio. Russ, que ya despreciaba a Magnus, no necesito mucho convencimiento.'),
      spacer(),
      alert('El error de Magnus causo indirectamente la destruccion del Proyecto Webway, la mutilacion permanente del Emperador, y la necesidad del sacrificio diario de mil psiquicos para alimentar el Trono Dorado. Un unico acto de desobediencia bien intencionada altero el destino de la humanidad para siempre.', 'imperial', 'Analisis del Ordo Hereticus'),
      spacer(),

      heading('La Quema de Prospero', 2),
      para('Cuando los Lobos Espaciales llegaron a Prospero, Magnus tomo una decision que definiria su destino: se nego a luchar. Abrumado por la culpa de haber destruido el Webway y creyendo que merecia el castigo, ordeno a sus hijos que no se defendieran. Las defensas orbitales permanecieron en silencio mientras los Lobos bombardeaban la superficie.'),
      para('Fue Ahriman quien desobedecio y organizo la defensa. Para cuando Magnus finalmente reacciono, Prospero estaba en llamas. Sus bibliotecas, sus universidades, diez mil años de conocimiento acumulado — todo destruido. En ese momento de desesperacion absoluta, Magnus acepto el pacto que Tzeentch le habia ofrecido desde siempre, y la Legion fue transportada al Planeta de los Hechiceros dentro del Ojo del Terror.'),
      spacer(),

      heading('El Primarca Demonio', 2),
      para('Magnus ascendio a Principe Demonio de Tzeentch, ganando un poder inmenso al precio de su libertad. Su cuerpo se transformo: alas iridiscentes, cuernos arcanos, y un poder psiquico amplificado hasta niveles que rivalizan con los del Emperador.'),
      para('Pero la ascension demoniaca fragmento su alma. Partes de Magnus — la bondad, la compasion, la racionalidad — fueron arrancadas y dispersadas. Lo que quedo es un ser de poder colosal pero emocionalmente incompleto, atrapado entre la ira por lo que le hicieron y la culpa por lo que el hizo.'),
      spacer(),

      heading('La Invasion de Fenris', 2),
      para('En el 41° Milenio, Magnus lanzo un asalto devastador contra Fenris, el mundo natal de los Lobos Espaciales, en un acto de venganza milenaria por la destruccion de Prospero. La invasion culmino con un ritual masivo que acerco el Planeta de los Hechiceros al espacio real, una hazaña de poder psiquico sin precedentes.'),
      para('Aunque la invasion fue finalmente repelida, Magnus demostro que sigue siendo una de las mayores amenazas para el Imperium: un ser con el poder de un dios y el rencor de diez mil años de exilio.'),
      spacer(),

      heading('Legado', 2),
      para('Magnus el Rojo es quizas la figura mas tragica del universo de Warhammer. Un erudito que queria salvar a la humanidad y termino condenandola. Un padre que intento curar a sus hijos y los convirtio en polvo. Un hijo que intento advertir a su padre y lo encadeno al Trono. La historia de Magnus es un recordatorio brutal de que el camino al infierno esta pavimentado con las mejores intenciones.'),
      quote('No hice nada malo.', 'Magnus el Rojo', 'Frase que repite obsesivamente, medio verdad y medio autoengaño'),
    ],
  },

  // ─────────────────────────────────────────
  // 8. MORTARION
  // ─────────────────────────────────────────
  {
    title: 'Mortarion, Señor de la Muerte',
    slug: 'mortarion-senor-de-la-muerte',
    excerpt: 'Mortarion, el Señor de la Muerte, es el Primarca demonio de la Guardia de la Muerte y principe demonio de Nurgle. Criado en un mundo toxico bajo la tirania de un señor de la guerra alienigena, Mortarion despreciaba tanto a los tiranos como a los hechiceros — y termino convirtiendose en ambas cosas.',
    gallery_images: [],
    content: () => [
      lore('El Prisionero del Jardin', 'Mortarion odia lo que es. Odia a Nurgle por hacerlo su esclavo. Odia al Emperador por abandonarlo. Odia a Typhus por traicionarlo. Y sobre todo, se odia a si mismo por ser demasiado debil para resistir. El Señor de la Muerte es un prisionero en un jardin de pestilencia eterna, y las cadenas que lo atan son sus propias decisiones.', 'scroll'),
      spacer(),

      heading('Infancia en Barbarus', 2),
      para('Mortarion fue encontrado en Barbarus, un mundo perpetuamente envuelto en nieblas toxicas. Las tierras bajas, apenas respirables, estaban habitadas por humanos miserables. Las cumbres montañosas, donde las toxinas eran mas letales, eran el dominio de los Señores de la Muerte — brujos alienigenas que gobernaban a los humanos como ganado, cosechando sus cuerpos para experimentos necromantes.'),
      para('Mortarion fue adoptado por el mas poderoso de estos Señores: el Señor de la Muerte sin nombre que gobernaba desde la fortaleza mas alta. El brujo lo crio como un instrumento, probando los limites de su resistencia sobrehumana exponiéndolo a toxinas cada vez mas letales. Mortarion sobrevivio a todo, desarrollando una resistencia al veneno y la enfermedad sin igual entre los Primarcas.'),
      para('Eventualmente, Mortarion escapo y lidero una rebelion contra los Señores de la Muerte, liberando a los humanos de Barbarus pueblo a pueblo, montaña a montaña. Pero cuando llego a la fortaleza de su padre adoptivo, las toxinas eran demasiado potentes incluso para el. Fue el Emperador quien completo la tarea, matando al Señor de la Muerte y "rescatando" a Mortarion.'),
      spacer(),
      quote('Llegue cuando podias haber triunfado solo. Nunca te lo perdonaste. Nunca me lo perdonaste.', 'El Emperador', 'Reflexion sobre Mortarion'),
      spacer(),

      heading('El Resentimiento del Primarca', 2),
      para('Mortarion nunca perdono al Emperador por robarle su victoria en Barbarus. Ese resentimiento se convirtio en el nucleo de su personalidad: un odio profundo a los tiranos, a los psiquicos (que le recordaban a los brujos de Barbarus), y a cualquiera que pretendiera gobernar por derecho divino.'),
      para('La ironia es devastadora: Mortarion odiaba a los tiranos y termino sirviendo al mayor tirano del Warp. Odiaba a los hechiceros y se convirtio en un principe demonio. Odiaba la debilidad y fue demasiado debil para resistir la corrupcion de Nurgle.'),
      spacer(),

      heading('La Caida al Servicio de Nurgle', 2),
      para('Durante la Herejia, Mortarion se unio a Horus por resentimiento hacia el Emperador. Pero su verdadera caida ocurrio en el Warp, cuando Typhus guio deliberadamente a la flota de la Guardia de la Muerte hacia una tormenta demoniaca y desactivo los campos Geller.'),
      para('La Plaga del Destructor ataco a la Guardia de la Muerte con una violencia que superaba incluso la resistencia legendaria de estos guerreros. Mortarion aguanto mas que nadie — dias, semanas de agonia — negandose a rendirse mientras veia a sus hijos morir a su alrededor. Pero finalmente, cuando el dolor se volvio insoportable y la muerte de sus Marines era segura, Mortarion pronuncio las palabras que Nurgle esperaba: acepto su "bendicion" a cambio de la supervivencia de su Legion.'),
      para('Fue el acto mas altruista y mas condenatorio de su existencia: se sacrifico por sus hijos, y al hacerlo los condeno a una eternidad de servicio al Dios de la Plaga.'),
      spacer(),

      heading('El Principe Demonio', 2),
      para('Mortarion ascendio a Principe Demonio de Nurgle, ganando alas raidas de insecto, una estatura aun mas colosal, y un poder para desatar pestilencias a escala planetaria. Gobierna sobre el Planeta de la Plaga, un mundo demoniaco en el Warp que es un jardin grotesco de vida descontrolada y putrefaccion eterna.'),
      bulletBold('Silencio: ', 'Su guadaña legendaria, un arma masiva que puede segar la vida de decenas de guerreros con un solo golpe. La hoja esta imbuida con las peores toxinas del Warp.'),
      bulletBold('La Linterna: ', 'Un artefacto antiguo de Barbarus que Mortarion lleva como recordatorio de su mundo natal. Emite una luz enfermiza que debilita a los enemigos.'),
      bulletBold('Aura de Pestilencia: ', 'Su mera presencia causa enfermedades en un radio de decenas de metros. Las heridas se infectan instantaneamente, la carne se pudre, y la moral se desploma.'),
      spacer(),

      heading('La Guerra de la Plaga', 2),
      para('En la era actual, Mortarion ha lanzado multiples invasiones contra el Imperium, incluyendo un asalto devastador contra Ultramar que lo enfrento directamente con Roboute Guilliman, el Primarca leal resucitado. El conflicto culmino en un duelo entre ambos Primarcas que Guilliman gano por escaso margen, pero Mortarion escapo para continuar su cruzada pestilente.'),
      para('A pesar de su poder, Mortarion sigue siendo un ser atormentado. No es un devoto gozoso de Nurgle como Typhus; es un prisionero que ha aceptado sus cadenas porque la alternativa era la extincion de sus hijos. Es el Señor de la Muerte, y la muerte que mas desea es la suya propia — una liberacion que Nurgle jamas le concedera.'),
    ],
  },

  // ─────────────────────────────────────────
  // 9. ANGRON
  // ─────────────────────────────────────────
  {
    title: 'Angron, El Clavo Rojo',
    slug: 'angron-el-clavo-rojo',
    excerpt: 'Angron es el Primarca demonio de los Devoradores de Mundos y principe demonio de Khorne. Esclavizado desde su nacimiento, torturado con los Clavos de Carnicero que destruyeron su mente, Angron es la personificacion de la furia sin sentido — un gladiador cosmico encadenado a una eternidad de rabia.',
    gallery_images: [
      'https://cdna.artstation.com/p/assets/images/images/053/849/068/large/mikhail-savier-angron.jpg',
    ],
    content: () => [
      lore('El Esclavo Eterno', 'Angron nunca fue libre. Nacio esclavo. Fue convertido en arma. Fue robado de los unicos seres que alguna vez amo. Y cuando finalmente podria haber encontrado la paz en la muerte, los Dioses del Caos lo resucitaron como su perro de guerra inmortal. La furia de Angron no es locura — es la unica respuesta racional a una existencia de sufrimiento interminable.', 'scroll'),
      spacer(),

      heading('El Gladiador de Nuceria', 2),
      para('Angron aterrizo en Nuceria, un mundo donde la aristocracia mantenía vastas arenas de gladiadores para su entretenimiento. El infante Primarca fue capturado inmediatamente y convertido en esclavo de combate. Los amos de Nuceria, reconociendo su naturaleza sobrehumana, le implantaron los Clavos de Carnicero: dispositivos arcanos insertados directamente en el cerebro que estimulaban la corteza limbica para producir furia asesina incontrolable, al tiempo que suprimian toda emocion positiva.'),
      para('Los Clavos de Carnicero destruyeron lentamente la mente de Angron. Cada momento sin violencia se convertia en una agonia de abstinencia. La compasion, la alegria, el amor — todo fue quemado por los implantes, reemplazado por una necesidad constante de matar. Angron fue reducido a lo que sus amos querian: la perfecta maquina de muerte.'),
      para('Y sin embargo, a pesar de todo, Angron encontro humanidad. En las arenas, forjo lazos con sus compañeros gladiadores. Los protegio, los entreno, los considero hermanos. Cuando finalmente lidero una rebelion de esclavos, no luchaba solo por si mismo — luchaba por ellos.'),
      spacer(),

      heading('La Traicion del Emperador', 2),
      para('La rebelion de Angron estaba condenada. Superados en numero y rodeados por los ejercitos de Nuceria, Angron y sus gladiadores se prepararon para una ultima batalla — una muerte gloriosa junto a los unicos seres que alguna vez le importaron.'),
      para('Fue entonces cuando llego el Emperador. Pero no vino a ayudar: vino a reclamar a su hijo. El Emperador teletransportó a Angron a su nave sin su consentimiento, dejando a los gladiadores para morir. Angron observo impotente desde la orbita mientras sus hermanos y hermanas eran masacrados.'),
      para('Este acto de "rescate" fue el trauma definitivo. Angron nunca perdono al Emperador. No veia un padre — veia otro amo, otro tirano que lo habia arrancado de su familia para usarlo como arma. La semilla de la Herejia fue plantada en ese momento, no por los Dioses del Caos, sino por la indiferencia calculada del Emperador.'),
      spacer(),
      quote('No queria un imperio. No queria Legiones. Solo queria morir con mis hermanos. Y el me robo incluso eso.', 'Angron', 'Ante Lorgar en Nuceria'),
      spacer(),

      heading('Los Devoradores de Mundos', 2),
      para('Angron fue asignado al mando de la XII Legion, los Perros de Guerra, renombrados como Devoradores de Mundos. Su relacion con sus Marines fue catastrofica. Angron no queria hijos; queria a sus gladiadores muertos. Despreciaba a los Astartes como herramientas del Emperador y se negaba a liderarlos con algo que se pareciera a afecto.'),
      para('Peor aun, ordeno que los Clavos de Carnicero fueran implantados en toda la Legion. Miles de Marines Espaciales perfectamente funcionales fueron sometidos al mismo tormento que destruyo la mente de Angron, convirtiendo a la XII Legion en una horda de berserkers cuya unica tactica era la carga frontal. La tasa de bajas era astronomica, pero a Angron no le importaba: no eran sus hermanos.'),
      spacer(),

      heading('La Ascension Demoniaca', 2),
      para('Durante la batalla por el mundo de Nuceria — donde Angron regreso para completar la destruccion de los amos esclavistas — Lorgar de los Portadores de la Palabra realizo un ritual de ascension demoniaca. Los Clavos de Carnicero estaban matando a Angron lentamente; la unica forma de preservarlo era transformarlo en un ser inmortal.'),
      para('Angron fue elevado a Principe Demonio de Khorne en una explosion de furia que mato a miles de soldados en ambos bandos. Su cuerpo crecio hasta proporciones titánicas, alas de fuego y bronce brotaron de su espalda, y su furia — amplificada por el poder de Khorne — se volvio capaz de devastar ejercitos enteros.'),
      para('La ironia suprema: Angron, que odiaba la esclavitud mas que nada, fue ascendido contra su voluntad y encadenado al servicio de Khorne por toda la eternidad. El esclavo fue convertido en el esclavo definitivo.'),
      spacer(),
      alert('La presencia de Angron en un campo de batalla genera un fenomeno psiquico conocido como la Marea Roja: una ola de furia homicida que afecta a todos los seres sensibles en un radio de kilometros, convirtiendo a aliados y enemigos por igual en berserkers incontrolables.', 'danger', 'Alerta del Ordo Malleus'),
      spacer(),

      heading('Arrakis y el 41° Milenio', 2),
      para('En la era actual, Angron ha sido invocado al plano material en multiples ocasiones. Su aparicion mas devastadora fue durante la Primera Guerra de Armageddon, donde lidero una invasion demoniaca que casi destruyo el planeta industrial. Fue necesaria la intervencion de los Caballeros Grises al completo para desterrarlo al Warp.'),
      para('Angron sigue siendo una de las mayores amenazas del Caos: un Primarca demonio cuya furia es literalmente infinita, alimentada por los Clavos de Carnicero que siguen torturandolo incluso en su forma inmortal. Cada grito de dolor se convierte en un rugido de guerra, y cada momento de existencia es una agonia que solo el combate puede aliviar temporalmente.'),
      spacer(),

      heading('Legado', 2),
      para('Angron es quizas el Primarca mas tragico de todos. No eligio caer — fue empujado, paso a paso, por un universo que nunca le ofreció otra cosa que sufrimiento. Los Clavos de Carnicero le robaron la capacidad de ser mas que un arma. El Emperador le robo su familia. Lorgar le robo su mortalidad. Y Khorne le robo su descanso. El Clavo Rojo es un recordatorio de que en el universo de Warhammer 40.000, las victimas a menudo se convierten en los monstruos mas terribles.'),
    ],
  },

  // ─────────────────────────────────────────
  // 10. EREBUS
  // ─────────────────────────────────────────
  {
    title: 'Erebus, El Primer Hereje',
    slug: 'erebus-el-primer-hereje',
    excerpt: 'Erebus, Primer Capellan de los Portadores de la Palabra, es el arquitecto mortal de la Herejia de Horus. Fue el quien orquesto la caida de Horus, el quien planeo la Masacre de Isstvan, y el quien prendio la mecha que incendio la galaxia. Es posiblemente el ser mas odiado de la historia del Warhammer 40.000 — por leales y traidores por igual.',
    gallery_images: [],
    content: () => [
      lore('El Arquitecto de la Ruina', 'Hay traidores, y hay villanos, y hay monstruos. Y luego esta Erebus. El que sonrie mientras el universo arde. El que planeo cada detalle, movio cada pieza, y observo satisfecho mientras diez mil años de oscuridad se desplegaban exactamente como habia previsto. Si el mal tuviera un rostro, seria el suyo: sonriente, confiado, y absolutamente carente de remordimiento.', 'book'),
      spacer(),
      alert('Erebus es considerado el individuo mortal mas responsable de la caida del Imperium. Su eliminacion es prioridad Omega para toda organizacion imperial. Se advierte que es extremadamente peligroso, manipulador, y capaz de corromper incluso a los mas devotos.', 'heresy', 'Decreto del Alto Señor de Terra'),
      spacer(),

      heading('Los Portadores de la Palabra', 2),
      para('Erebus sirvio como Primer Capellan de los Portadores de la Palabra, la XVII Legion Astartes liderada por el Primarca Lorgar Aureliano. Los Portadores de la Palabra eran unicos entre las Legiones: eran genuinamente devotos. Mientras otras Legiones conquistaban mundos por deber o ambicion, los Portadores de la Palabra lo hacian por fe, levantando catedrales al Emperador en cada mundo que tomaban.'),
      para('Cuando el Emperador censuro publicamente a Lorgar por su devocion religiosa — llegando a destruir la ciudad santa de Monarchia como castigo y obligando a toda la Legion a arrodillarse ante los Ultramarines — la fe de los Portadores de la Palabra no murio. Se transformo. Si el Emperador rechazaba su adoracion, encontrarian dioses que la aceptaran.'),
      para('Erebus fue instrumental en esta transicion. Ya habia establecido contacto con los cultos del Caos en el mundo de Colchis antes incluso de que Lorgar fuera encontrado. Era un verdadero creyente en los Dioses Oscuros mucho antes de que la Herejia fuera siquiera una posibilidad, y trabajo pacientemente durante decadas para posicionar todas las piezas.'),
      spacer(),

      heading('La Corrupcion de Horus', 2),
      para('El acto mas significativo de Erebus fue la corrupcion de Horus Lupercal. Fue un plan ejecutado con una paciencia y precision que rivalizan con las maquinaciones de Tzeentch:'),
      bulletBold('El Anathame: ', 'Erebus obtuvo una espada ritual xenos del mundo de Interex — una hoja capaz de matar incluso a un Primarca. Organizo las circunstancias para que esta arma fuera usada contra Horus en la luna de Davin.'),
      bulletBold('La Logia del Guerrero: ', 'Erebus habia sembrado logias secretas — cultos al Caos disfrazados de hermandades guerreras — dentro de multiples Legiones. Estas logias aseguraron que los aliados de Horus estuvieran listos cuando llegara el momento.'),
      bulletBold('El Templo de la Serpiente: ', 'Cuando Horus cayo herido por el Anathame, Erebus convencio a la logia de los Lobos Lunares para llevar al Primarca al Templo de la Serpiente de Davin, donde los Dioses del Caos podrian alcanzar su alma.'),
      para('El resultado fue la caida de Horus — y con el, la caida de medio Imperium. Todo por las maquinaciones de un solo capellan con demasiada paciencia y ningun escrúpulo.'),
      spacer(),
      quote('El universo esta a punto de cambiar. Y nosotros seremos el catalizador.', 'Erebus', 'A Lorgar, antes de la Peregrinacion al Ojo del Terror'),
      spacer(),

      heading('Crímenes Contra la Humanidad', 2),
      para('La lista de atrocidades de Erebus es interminable:'),
      bulletBold('La Masacre del Punto de Caida: ', 'Organizo la emboscada de Isstvan V donde tres Legiones leales fueron masacradas por las fuerzas traidoras.'),
      bulletBold('El Asesinato de Argel Tal: ', 'Mato a puñaladas a Argel Tal, uno de los guerreros mas respetados de su propia Legion y uno de sus escasos amigos, porque su lealtad a Lorgar amenazaba con interferir con los planes de Erebus.'),
      bulletBold('El Primer Poseído: ', 'Erebus fue el primer Marine Espacial en someterse voluntariamente a la posesion demoniaca, creando el concepto de los Marines Poseídos que aterrorizarian a la galaxia.'),
      bulletBold('La Corrupcion de la Fe: ', 'Transformo la genuina devocion religiosa de los Portadores de la Palabra en un culto al Caos, corrompiendo a una Legion entera.'),
      spacer(),

      heading('El Ser Mas Odiado de la Galaxia', 2),
      para('Lo que hace a Erebus verdaderamente detestable no es su poder — es su actitud. Mientras otros villanos del Caos tienen tragedias que explican su caida (Horus fue manipulado, Angron fue torturado, Magnus fue engañado), Erebus eligio el mal con plena conciencia y satisfaccion. No fue corrompido; fue corruptor. No cayo; empujo a otros.'),
      para('Incluso entre las fuerzas del Caos, Erebus es despreciado. Kharn le arranco la cara en combate. Horus lo despreciaba como un manipulador rastrero. Abaddon lo toleraba solo por utilidad. Argel Tal, su unico verdadero amigo, fue asesinado por su mano. Erebus es la prueba de que en el universo de Warhammer, la maldad mas peligrosa no viene con cuernos y garras — viene con una sonrisa y un plan.'),
      spacer(),
      quote('Todo fue segun el plan.', 'Erebus', 'Respuesta habitual cuando sus actos causan sufrimiento inconmensurable'),
      spacer(),

      heading('En la Era Actual', 2),
      para('Erebus continua operando desde las sombras, manipulando eventos a escala galáctica. Su rostro — reconstruido tras la paliza de Kharn — lleva los tatuajes del Libro de Lorgar inscritos en su piel. Sigue siendo el Primer Capellan de los Portadores de la Palabra, aunque su verdadera lealtad es unicamente a los Dioses del Caos y a su propia ambicion.'),
      para('Diez mil años despues de encender la mecha de la Herejia, Erebus sigue sonriendo. La galaxia arde, el Imperium se desmorona, y la Gran Grieta rasga el cielo. Todo segun el plan.'),
    ],
  },
]

/* ═══════════════════════════════════════════════════════
   SEED EXECUTION
   ═══════════════════════════════════════════════════════ */

async function main() {
  console.log('🔴 Seeding Chaos legendary characters...\n')

  // Get "personajes" category ID
  const { data: cat, error: catErr } = await supabase
    .from('wiki_categories')
    .select('id')
    .eq('slug', 'personajes')
    .single()

  if (catErr || !cat) {
    console.error('❌ Could not find "personajes" category:', catErr)
    process.exit(1)
  }
  console.log(`✅ Category "personajes" found: ${cat.id}\n`)

  let success = 0
  let skipped = 0

  for (const article of articles) {
    _id = 0 // Reset block ID counter per article
    const content = article.content()

    const payload = {
      faction_id: 'chaos',
      category_id: cat.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content,
      hero_image: null,
      gallery_images: article.gallery_images.length > 0 ? article.gallery_images : null,
      status: 'published',
      published_at: new Date().toISOString(),
      views_count: Math.floor(Math.random() * 500) + 100,
    }

    const { data, error } = await supabase
      .from('faction_wiki_pages')
      .insert(payload)
      .select('id, title, slug')
      .single()

    if (error) {
      if (error.code === '23505') {
        console.log(`⏭️  Skipped (already exists): ${article.title}`)
        skipped++
      } else {
        console.error(`❌ Error inserting "${article.title}":`, error.message)
      }
    } else {
      console.log(`✅ Created: ${data.title}  →  /facciones/chaos/wiki/${data.slug}`)
      success++
    }
  }

  console.log(`\n🏁 Done! ${success} created, ${skipped} skipped.`)
  console.log(`   View at: https://grimdarklegion.com/facciones/chaos/wiki`)
}

main().catch(console.error)
