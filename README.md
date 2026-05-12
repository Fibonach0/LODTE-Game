# KONR — La Torre del Umbral

Juego de cartas de dark fantasy nórdico (deckbuilder/roguelike). Prototipo en HTML + CSS + JS vanilla.

## Cómo jugar

Abrí `index.html` en cualquier navegador moderno. No requiere build ni servidor.

> `konr_prototype.html` se conserva como referencia de la versión monolítica v0.1 antes del refactor.

## Estructura del proyecto

```
konr/
├── index.html              # punto de entrada del juego
├── konr_prototype.html     # snapshot v0.1 monolítico (referencia)
├── styles/                 # CSS
├── js/                     # módulos del juego
├── assets/                 # arte
│   ├── cards/              # ilustraciones de cartas
│   ├── enemies/            # ilustraciones de Ecos (jefes)
│   ├── ui/                 # marcos, iconos, botones
│   ├── backgrounds/        # fondos
│   └── fx/                 # efectos visuales
└── prompts/                # prompts de Stable Diffusion para generar arte
```

## Convenciones de assets

### `assets/cards/`
Naming: `[id-de-carta]_art.png`
Ejemplos: `strike_art.png`, `por_mikkja_art.png`, `memoria_art.png`
Tamaño recomendado: 512x768px (ratio 2:3)

### `assets/enemies/`
Naming: `[nombre-eco]_art.png`
Ejemplos: `valdra_art.png`, `nino_sin_nombre_art.png`, `mikkja_art.png`
Tamaño recomendado: 600x800px

### `assets/ui/`
Naming: `[elemento]_ui.png`
Ejemplos: `card_frame_attack.png`, `ithyr_crystal.png`, `shield_icon.png`

### `assets/backgrounds/`
Naming: `[ubicacion]_bg.png`
Ejemplos: `vatnaborg_ruins_bg.png`, `umbral_tower_bg.png`

### `assets/fx/`
Naming: `[efecto]_fx.png`
Ejemplos: `hit_fx.png`, `block_fx.png`, `curse_fx.png`

## Estilo visual global

- **Tono**: oscuro, épico, medieval nórdico
- **Paleta**: crimson, ash grey, deep gold, midnight blue
- **Iluminación**: chiaroscuro, luz de vela o luna fría
- Sin texto ni UI dentro de las ilustraciones
- **Estilo**: painterly, concept art quality
- **Modelo SD sugerido**: Realistic Vision v5 / DreamShaper XL

## Convención: prompts para todo asset gráfico

**Práctica obligatoria a partir de mayo 2026.** Cada vez que se agregue
algo que requiera arte (carta, enemigo, fondo, evento, ítem, reliquia,
efecto), se crea su archivo `prompts/[id].txt` con el prompt de Stable
Diffusion listo para usar. El prompt vive en el repo desde el momento
que se agrega la mecánica, aunque la imagen no se renderice aún.

Cada archivo de prompt sigue este formato:

```
TÍTULO/DESCRIPCIÓN — qué representa
ARCHIVO DESTINO: assets/.../xxx_art.png

[Contexto narrativo y mecánico breve]

=== PROMPT POSITIVO ===
[texto del prompt]

=== PROMPT NEGATIVO ===
[texto del negativo]

=== SETTINGS ===
Modelo, Steps, CFG, Sampler, Tamaño, Seed

=== NOTAS DE USO ===
Slot del JS donde se conecta + variantes opcionales.
```

Cuando el PNG está listo, se conecta agregando una línea al objeto
correspondiente en `js/cards.js` o `js/enemies.js`:

```js
image: 'assets/cards/xxx_art.png',
```

## Prompts disponibles

| Asset | Archivo prompt | Estado |
|---|---|---|
| **Personajes** | | |
| Konr (protagonista) | `prompts/konr_protagonist.txt` | renderizado en `assets/ui/konr_portrait_art.png` |
| **Enemigos** | | |
| Valdra (Eco — boss) | `prompts/valdra_eco.txt` | renderizado fase 1 + fase 2 |
| Oso del Bosque | `prompts/oso_bosque.txt` | renderizado |
| Bandidos del Camino | `prompts/bandidos.txt` | listo, sin renderizar |
| Niño Sin Nombre | `prompts/nino_sin_nombre.txt` | listo, sin renderizar |
| Enjambre de Abejas | `prompts/enjambre.txt` | listo, sin renderizar |
| **Cartas** | | |
| Por Mikkja | `prompts/por_mikkja.txt` | renderizado |
| **Fondos** | | |
| Myrkviðr (bosque oscuro) | `prompts/myrkvidr_bg.txt` | listo, sin renderizar |
