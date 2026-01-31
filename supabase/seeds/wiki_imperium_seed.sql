-- =============================================================================
-- WIKI SEED DATA: IMPERIUM OF MAN
-- =============================================================================
-- Run this after the wiki migration to populate test content
-- Execute in Supabase Dashboard > SQL Editor
-- =============================================================================

-- First, get category IDs
DO $$
DECLARE
  cat_historia UUID;
  cat_personajes UUID;
  cat_cultura UUID;
BEGIN
  SELECT id INTO cat_historia FROM wiki_categories WHERE slug = 'historia';
  SELECT id INTO cat_personajes FROM wiki_categories WHERE slug = 'personajes';
  SELECT id INTO cat_cultura FROM wiki_categories WHERE slug = 'cultura';

  -- =========================================================================
  -- EL TRONO DORADO
  -- =========================================================================
  INSERT INTO faction_wiki_pages (
    faction_id,
    category_id,
    title,
    slug,
    excerpt,
    content,
    status,
    published_at,
    views_count
  ) VALUES (
    'imperium',
    cat_historia,
    'El Trono Dorado',
    'el-trono-dorado',
    'El artefacto mas sagrado del Imperium, una maquina arcana que sostiene la vida del Emperador de la Humanidad desde hace diez mil años.',
    '{
      "type": "doc",
      "content": [
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [{ "type": "text", "text": "El Corazon del Imperium" }]
        },
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "El Trono Dorado es el artefacto mas importante y sagrado del Imperium del Hombre. Situado en las profundidades del Sanctum Imperialis en Terra, este dispositivo arcano de origen parcialmente xenos mantiene con vida al Emperador de la Humanidad desde el final de la Herejia de Horus hace mas de diez milenios." }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [{ "type": "text", "text": "Funcion Vital" }]
        },
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "El Trono cumple multiples funciones criticas para la supervivencia de la humanidad:" }
          ]
        },
        {
          "type": "bulletList",
          "content": [
            {
              "type": "listItem",
              "content": [{
                "type": "paragraph",
                "content": [{ "type": "text", "marks": [{"type": "bold"}], "text": "Soporte Vital:" }, { "type": "text", "text": " Mantiene el cuerpo destrozado del Emperador en un estado de animacion suspendida, evitando su muerte fisica." }]
              }]
            },
            {
              "type": "listItem",
              "content": [{
                "type": "paragraph",
                "content": [{ "type": "text", "marks": [{"type": "bold"}], "text": "El Astronomican:" }, { "type": "text", "text": " Canaliza el inmenso poder psiquico del Emperador para proyectar el Astronomican, el faro psiquico que permite la navegacion Warp a traves de la galaxia." }]
              }]
            },
            {
              "type": "listItem",
              "content": [{
                "type": "paragraph",
                "content": [{ "type": "text", "marks": [{"type": "bold"}], "text": "Barrera contra el Caos:" }, { "type": "text", "text": " La voluntad del Emperador, amplificada por el Trono, mantiene sellada la brecha dimensional bajo el Palacio Imperial que conduciria directamente al Warp." }]
              }]
            }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [{ "type": "text", "text": "El Sacrificio Diario" }]
        },
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "Cada dia, mil psiquicos son sacrificados para alimentar el Trono Dorado. Estos martires, conocidos como los Elegidos del Emperador, entregan sus almas voluntariamente para mantener encendida la llama de la humanidad. Sin su sacrificio constante, el Astronomican se apagaria y el Imperium colapsaria en la anarquia y la oscuridad." }
          ]
        },
        {
          "type": "blockquote",
          "content": [{
            "type": "paragraph",
            "content": [
              { "type": "text", "marks": [{"type": "italic"}], "text": "\"El Emperador protege, pero exige proteccion a cambio. Mil almas cada dia es un precio pequeño por la supervivencia de billones.\"" },
              { "type": "text", "text": " — Extracto del Lectitio Divinitatus" }
            ]
          }]
        },
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [{ "type": "text", "text": "El Deterioro" }]
        },
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "Los Tech-Priests del Adeptus Mechanicus que custodian el Trono reportan un deterioro constante e inevitable del dispositivo. Muchos de sus sistemas son irreparables, y los conocimientos necesarios para su mantenimiento se han perdido con el paso de los milenios. La pregunta que atormenta al Imperium no es si el Trono fallara, sino cuando." }
          ]
        }
      ]
    }',
    'published',
    NOW(),
    1247
  );

  -- =========================================================================
  -- LOS ADEPTUS ASTARTES
  -- =========================================================================
  INSERT INTO faction_wiki_pages (
    faction_id,
    category_id,
    title,
    slug,
    excerpt,
    content,
    status,
    published_at,
    views_count
  ) VALUES (
    'imperium',
    cat_cultura,
    'Los Adeptus Astartes',
    'los-adeptus-astartes',
    'Los Space Marines son los guerreros superhumanos del Emperador, creados mediante ingenieria genetica para ser los defensores definitivos de la humanidad.',
    '{
      "type": "doc",
      "content": [
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [{ "type": "text", "text": "Angeles de la Muerte" }]
        },
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "Los Adeptus Astartes, conocidos comunmente como Space Marines o Angeles de la Muerte, son guerreros superhumanos geneticamente modificados que sirven como la fuerza de elite del Imperium del Hombre. Cada Space Marine es un soldado perfecto, capaz de hazañas imposibles para cualquier humano normal." }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [{ "type": "text", "text": "Creacion de un Space Marine" }]
        },
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "El proceso de creacion de un Space Marine es largo, doloroso y peligroso. Solo uno de cada cien aspirantes sobrevive para convertirse en un hermano de batalla completo. El proceso incluye:" }
          ]
        },
        {
          "type": "orderedList",
          "content": [
            {
              "type": "listItem",
              "content": [{
                "type": "paragraph",
                "content": [{ "type": "text", "marks": [{"type": "bold"}], "text": "Implantacion de Organos:" }, { "type": "text", "text": " 19 organos adicionales derivados de la semilla genetica del Primarca del Capitulo." }]
              }]
            },
            {
              "type": "listItem",
              "content": [{
                "type": "paragraph",
                "content": [{ "type": "text", "marks": [{"type": "bold"}], "text": "Hipno-adoctrinamiento:" }, { "type": "text", "text": " Años de condicionamiento mental y lavado de cerebro para asegurar lealtad absoluta." }]
              }]
            },
            {
              "type": "listItem",
              "content": [{
                "type": "paragraph",
                "content": [{ "type": "text", "marks": [{"type": "bold"}], "text": "Entrenamiento Riguroso:" }, { "type": "text", "text": " Decadas de combate simulado y real antes de ser considerado un hermano de batalla." }]
              }]
            },
            {
              "type": "listItem",
              "content": [{
                "type": "paragraph",
                "content": [{ "type": "text", "marks": [{"type": "bold"}], "text": "Servoarmadura:" }, { "type": "text", "text": " Finalmente, el Marine recibe su sagrada armadura energetica, una extension de su propio cuerpo." }]
              }]
            }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [{ "type": "text", "text": "Organizacion de los Capitulos" }]
        },
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "Tras la Segunda Fundacion que siguio a la Herejia de Horus, las Legiones de Space Marines fueron divididas en Capitulos de aproximadamente mil guerreros cada uno. Esta division, dictada por el Codex Astartes de Roboute Guilliman, asegura que ningun comandante pueda volver a controlar un ejercito lo suficientemente grande como para amenazar al Imperium." }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "Actualmente existen aproximadamente mil Capitulos activos, cada uno con sus propias tradiciones, colores heraldicos y tacticas de combate. Los nueve Capitulos de la Primera Fundacion, descendientes directos de las Legiones leales originales, son considerados los mas prestigiosos." }
          ]
        },
        {
          "type": "blockquote",
          "content": [{
            "type": "paragraph",
            "content": [
              { "type": "text", "marks": [{"type": "italic"}], "text": "\"No conocen el miedo. No conocen la piedad. Solo conocen la guerra.\"" },
              { "type": "text", "text": " — Inscripcion en el Templo de la Correccion, Macragge" }
            ]
          }]
        }
      ]
    }',
    'published',
    NOW(),
    2834
  );

  -- =========================================================================
  -- PERSONAJES DESTACADOS DEL IMPERIUM
  -- =========================================================================
  INSERT INTO faction_wiki_pages (
    faction_id,
    category_id,
    title,
    slug,
    excerpt,
    content,
    status,
    published_at,
    views_count
  ) VALUES (
    'imperium',
    cat_personajes,
    'Personajes Destacados del Imperium',
    'personajes-destacados',
    'Los heroes mas grandes que han luchado por la humanidad, desde Primarcas inmortales hasta los mas venerados Señores Capitulares.',
    '{
      "type": "doc",
      "content": [
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [{ "type": "text", "text": "Heroes del Imperium" }]
        },
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "A lo largo de diez mil años de guerra constante, innumerables heroes han dado su vida por la humanidad. Estos son algunos de los guerreros mas legendarios que aun luchan en la larga guerra contra las fuerzas de la oscuridad." }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [{ "type": "text", "text": "Roboute Guilliman" }]
        },
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "marks": [{"type": "bold"}], "text": "Primarca de los Ultramarines | Señor Comandante del Imperium" }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "Roboute Guilliman es el Primarca de los Ultramarines y el unico hijo leal del Emperador que permanece activo en la galaxia. Tras diez mil años en estasis debido a una herida envenenada infligida por su hermano traidor Fulgrim, Guilliman fue resucitado durante la Caida de Cadia gracias a los esfuerzos combinados del Archmagos Belisarius Cawl y el dios eldar Ynnead." }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "Ahora sirve como Señor Comandante del Imperium, el primer individuo en ostentar este titulo desde la Herejia de Horus. Bajo su liderazgo, el Imperium ha lanzado la Cruzada Indomitus, la mayor ofensiva militar desde la Gran Cruzada, llevando esperanza a un imperio al borde del colapso." }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [{ "type": "text", "text": "Marneus Augustus Calgar" }]
        },
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "marks": [{"type": "bold"}], "text": "Señor Capitular de los Ultramarines | Señor de Macragge" }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "Marneus Calgar es el actual Señor Capitular de los Ultramarines y Señor del Reino de Ultramar. Es considerado uno de los mejores comandantes tacticos de todo el Imperium, habiendo liderado a su Capitulo a innumerables victorias durante mas de cuatrocientos años de servicio." }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "Calgar fue el primer Space Marine en someterse voluntariamente al procedimiento Rubicon Primaris, cruzando el umbral entre los Marines clasicos y la nueva generacion de guerreros Primaris creados por Belisarius Cawl. Su exito abrio el camino para que otros veteranos siguieran sus pasos." }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [{ "type": "text", "text": "Comandante Dante" }]
        },
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "marks": [{"type": "bold"}], "text": "Señor Capitular de los Blood Angels | El Marine Vivo mas Antiguo" }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "El Comandante Dante ha servido como Señor Capitular de los Blood Angels durante mas de mil cien años, convirtiendolo en el Space Marine en servicio activo mas antiguo de toda la galaxia. Su longevidad extraordinaria se atribuye tanto a su excepcional fuerza de voluntad como a la bendicion de su Primarca, Sanguinius." }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "A pesar de su edad avanzada, Dante continua liderando a sus hermanos en batalla, empuñando la Hacha de Mortalis y vistiendo la Mascara Mortuoria de Sanguinius. Tras la apertura de la Gran Grieta, fue nombrado por Roboute Guilliman como Señor Regente del Imperium Nihilus, gobernando la mitad oscura del Imperium." }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [{ "type": "text", "text": "Trajann Valoris" }]
        },
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "marks": [{"type": "bold"}], "text": "Capitan-General de los Adeptus Custodes | Guardian del Trono" }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "Trajann Valoris ostenta el titulo de Capitan-General de los Adeptus Custodes, lo que le convierte en el comandante de la guardia personal del Emperador y uno de los individuos mas poderosos del Imperium. Cada Custodian es un guerrero sin igual, y Valoris es el mejor de entre los mejores." }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "Bajo el mandato de Valoris, los Custodes han abandonado por primera vez en milenios las murallas del Palacio Imperial para llevar la guerra a los enemigos del Emperador a traves de la galaxia. Esta decision, tomada tras la apertura de la Gran Grieta, marca un cambio fundamental en la doctrina de los Diez Mil." }
          ]
        },
        {
          "type": "blockquote",
          "content": [{
            "type": "paragraph",
            "content": [
              { "type": "text", "marks": [{"type": "italic"}], "text": "\"El deber es mas pesado que una montaña; la muerte, mas ligera que una pluma. Nosotros cargamos con ambos.\"" },
              { "type": "text", "text": " — Trajann Valoris" }
            ]
          }]
        }
      ]
    }',
    'published',
    NOW(),
    3562
  );

END $$;
