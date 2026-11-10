/* =====================================================================
   SCROLL-THROUGH CINEMAS — PROJECT CONTENT
   ---------------------------------------------------------------------
   This is the only file you need to edit to update your projects.

   Each project has:
     id            – used in the web address (#poster-<id>, #feature-<id>)
     number        – the feature number shown on the poster plaque
     title         – poster title
     subtitle      – poster tagline
     poster        – poster artwork (full size + wall thumbnail; w/h = pixel size of the full image)
     synopsis      – text on the wall-mounted synopsis panel
     status        – 'now-showing' (has a PLAY FEATURE PRESENTATION button)
                     or 'coming-soon' (BACK button only)
     meta          – small facts shown on the opening title card
     sections      – the feature presentation, top to bottom

   Section types you can use in `sections`:
     { type: 'chapter', label: 'Scene One', title: 'The Concept' }
     { type: 'text', heading: '...', body: ['paragraph', 'paragraph'], list: ['item', 'item'] }
     { type: 'list', heading: '...', items: [['Label', 'Description'], ...] }
     { type: 'image', src, w, h, alt, caption, layout: 'full' | 'wide' | 'left' | 'right', paper: true|false }
     { type: 'pair', images: [ {src,w,h,alt}, {src,w,h,alt} ], caption }
     { type: 'gallery', images: [ ... ], caption, paper: true }   (3–4 images, e.g. sketches)
     { type: 'split', side: 'left' | 'right', image: {src,w,h,alt,paper}, heading, body: [...], list: [...] }
     { type: 'placeholder', label: 'Floor plans' }     (an empty, styled slot to fill later)

   To add images: put them in assets/projects/<id>/ and reference them below.
   `w` and `h` are the image's pixel size (keeps the layout from jumping while loading).
   ===================================================================== */

(function () {
  const img = (project, file, w, h, alt, extra) =>
    Object.assign({ src: `assets/projects/${project}/${file}`, w, h, alt }, extra || {});

  /* ---------------------------------------------------------------- */
  const modunest = (f, w, h, alt, x) => img('modunest', f, w, h, alt, x);
  const liber = (f, w, h, alt, x) => img('liber-pater', f, w, h, alt, x);
  const cottage = (f, w, h, alt, x) => img('cottage-georgian-bay', f, w, h, alt, x);

  window.STC_PROJECTS = [
    /* ============================ 01 — MODUNEST ============================ */
    {
      id: 'modunest',
      number: '01',
      kind: 'project',
      title: 'ModuNest',
      subtitle: 'The Living Mind',
      poster: { src: 'assets/posters/modunest.jpg', thumb: 'assets/posters/thumb/modunest.jpg', w: 1216, h: 1500, alt: 'ModuNest — The Living Mind poster: a glowing brain sculpture above a pool of water' },
      status: 'now-showing',
      synopsis:
        "In a world where architecture breathes, a sustainable workplace becomes a living ecosystem. Inspired by the architecture of a human brain, this design maps cognitive function into physical space. Built entirely from 3D-printed kelp and powered by marine energy, it is an environment where focus, collaboration, and well-being fuse seamlessly. Innovation isn't just happening inside the building — the building itself is innovating.",
      meta: [
        ['Typology', 'Sustainable workplace'],
        ['Area', '10,000 sq ft'],
        ['Ceilings', '14 ft'],
      ],
      hero: modunest('hero.jpg', 1536, 1024, 'ModuNest reception: a sculptural rainbow ribbon ceiling above a white reception desk, flanked by living moss walls with coloured spheres'),
      sections: [
        { type: 'chapter', label: 'Scene One', title: 'A Workplace That Thinks' },
        {
          type: 'split', side: 'right',
          image: modunest('brain-diagram.jpg', 1800, 1468, 'Hand-drawn brain diagram dividing ModuNest into seven numbered puzzle-piece zones', { paper: true }),
          heading: 'The concept',
          body: [
            "ModuNest is designed as a spatial metaphor for the human brain. Each zone supports a distinct cognitive function while working together as one integrated ecosystem. The workplace becomes a living system that nurtures innovation, collaboration, focus, learning, and well-being, reflecting ModuNest's mission of sustainable design and advanced 3D printing technology.",
            'Together these interconnected zones position ModuNest as a workplace that thinks, adapts, and evolves like the human brain. A dynamic environment where creativity, technology, strategy, and well-being function in harmony.',
          ],
          caption: 'Seven key areas of ModuNest that will drive innovative design within the community, inspired by the functional principles of the brain.',
        },
        { type: 'image', layout: 'wide', ...modunest('moodboard.jpg', 1800, 911, 'ModuNest moodboard: kelp forest, pale oak, rose quartz, concrete, terrazzo, moss and a rippled rainbow surface', { paper: true }), caption: 'ModuNest moodboard' },

        { type: 'chapter', label: 'Scene Two', title: 'The Site' },
        {
          type: 'split', side: 'left',
          image: modunest('site-plan.jpg', 1470, 1064, 'Building site plan with the ModuNest office area highlighted in yellow', { paper: true }),
          heading: 'Site plan',
          body: [
            "The site of where the ModuNest office space will be encompassed in is in the section that is highlighted. Towards the left we have restrooms and space to utilize for the office space as well as curtain wall windows to maximize the most light throughout. 14 ft ceilings will create a more open environment to support the creativity of this company. This space will serve the purpose of ModuNest's very own nest to grow and explore all their innovations that will allow the company to progress for the future of what they believe in.",
          ],
          list: ['Area of space: 10,000 sq ft'],
        },

        { type: 'chapter', label: 'Scene Three', title: 'The Creative Cortex' },
        { type: 'image', layout: 'full', ...modunest('innovation-zone.jpg', 1076, 717, 'Innovation and Ideation Zone: a curving kelp tank and sunken lounge beneath the rainbow ribbon ceiling') },
        {
          type: 'text',
          heading: 'Innovation & Ideation Zone',
          body: [
            "At the core of ModuNest is the Innovation & Ideation Zone, a flexible creative hub modeled after the brain's creative cortex — the center of abstract thinking and problem-solving. This dynamic environment supports agile workflows through open workstations, writable surfaces, and rapid-prototyping areas that encourage experimentation and iterative design. The open layout promotes fluid movement and spontaneous collaboration, fostering cross-disciplinary exchange and empowering teams to push the boundaries of innovation.",
            "A strategically integrated kelp farm anchors this space both symbolically and functionally. As the company operates on kelp-based renewable energy, its placement within the creative core makes sustainability visibly embedded in daily operations. Kelp also holds emerging potential as a biodegradable material for 3D printing, aligning directly with ModuNest's research-driven mission. Beyond its technical relevance, the gentle movement of the kelp introduces a calming biophilic element, balancing the high-energy atmosphere of innovation with moments of clarity and focus.",
          ],
        },
        {
          type: 'split', side: 'left',
          image: modunest('sensory-hub.jpg', 922, 615, 'Sensory and Recharge Hub: kitchen bar and communal dining tables beside a living wall'),
          heading: 'Sensory & Recharge Hub',
          body: [
            'The Sensory & Recharge Hub, centered around a modern kitchen and communal dining spaces, activates multiple senses through materiality, scent, and social interaction. Natural textures, warm finishes, and shared gathering areas create an inviting atmosphere that encourages informal connection and collaboration. More than simply a place to eat, the hub functions as a restorative environment where employees can reset, recharge, and engage in meaningful conversation. By blending nourishment, comfort, and social exchange, the space supports cognitive renewal while strengthening community within the workplace.',
          ],
        },
        { type: 'image', layout: 'wide', ...modunest('collab-lounge.jpg', 1076, 717, 'Lounge and meeting area with a moss wall, slatted timber screens and sculptural knotted chairs') },

        { type: 'chapter', label: 'Scene Four', title: 'Community, Focus & Learning' },
        { type: 'pair', images: [
          modunest('community-zone.jpg', 1229, 820, 'Community and Collaboration Zone: a meeting table under a glass chandelier, with VR stations behind'),
          modunest('lounge-views.jpg', 1229, 820, 'Informal lounge with curved white sofas and floor-to-ceiling city views'),
        ] },
        {
          type: 'text',
          heading: 'Community & Collaboration Zone',
          body: [
            "Supporting the innovation core is the Community & Collaboration Zone, inspired by the brain's social and motor functions that drive communication, coordination, and collective problem-solving. This space is designed to encourage cross-departmental interaction and strengthen company culture through shared dialogue and collaboration. Flexible meeting areas, adaptable layouts, and informal lounge settings allow the environment to shift seamlessly between structured strategy sessions and spontaneous conversations, creating opportunities for both planned and organic exchange.",
            'Integrated virtual reality environments expand traditional meeting capabilities, enabling teams to collaborate across physical and digital platforms in immersive, real-time settings. By merging emerging technology with flexible spatial design, the zone promotes innovative thinking and dynamic teamwork.',
          ],
        },
        {
          type: 'text',
          heading: 'Deep Work Zone',
          body: [
            'Adjacent to this area is the Deep Work Zone, carefully separated by acoustic partitions to maintain a quiet, distraction-free atmosphere. Sound-controlled pods and enclosed rooms provide engineers and designers with dedicated environments for complex tasks that require sustained concentration and technical precision. Together, these spaces establish a balanced workplace ecosystem that supports both collaborative leadership and focused individual productivity through thoughtful acoustic and spatial design.',
          ],
        },
        {
          type: 'split', side: 'right',
          image: modunest('learning-hub.jpg', 1076, 717, 'Learning and Co-Creation Hub: a sunken circular seminar platform ringed by ottomans'),
          heading: 'Learning & Co-Creation Hub',
          body: [
            'Continuous growth is further supported through the Learning & Co-Creation Hub, which features seminar rooms, training areas, and collaborative study spaces. Clear wayfinding and intuitive spatial organization integrate learning seamlessly into the daily workflow, empowering employees to continuously expand their knowledge and evolve alongside the company.',
          ],
        },

        { type: 'chapter', label: 'Scene Five', title: 'Wellness & Restoration' },
        { type: 'image', layout: 'full', ...modunest('wellness-fitness.jpg', 1383, 922, 'Fitness room with stationary bikes facing floor-to-ceiling windows and circular moss wall panels') },
        {
          type: 'text',
          heading: 'Wellness & Restoration Zone',
          body: [
            'Finally, the Wellness & Restoration Zone ensures balance within the workplace ecosystem. Designed as a sanctuary for mental clarity and emotional well-being, the space integrates meditation rooms, fitness amenities, natural materials, and immersive biophilic elements. These restorative environments provide employees with opportunities to reset, recharge, and reconnect throughout the workday.',
            'Soft lighting, calming textures, and nature-inspired design foster a tranquil atmosphere that supports mindfulness and stress reduction, encouraging a healthier and more sustainable rhythm of work. By prioritizing wellness as an integral component of the workplace, the space reinforces the belief that meaningful innovation begins with people who feel supported, restored, and empowered.',
          ],
        },
        { type: 'pair', images: [
          modunest('wellness-meditation.jpg', 1229, 820, 'Meditation and yoga studio with a rose quartz feature wall and city views'),
          modunest('wellness-studio.jpg', 1383, 922, 'Wide view of the yoga studio with mats, floor cushions and skyline windows'),
        ] },
      ],
    },

    /* ========================= 02 — LIBER PATER ========================== */
    {
      id: 'liber-pater',
      number: '02',
      kind: 'project',
      title: 'Liber Pater',
      subtitle: 'The Synthesis of Parisian Nights',
      poster: { src: 'assets/posters/liber-pater.jpg', thumb: 'assets/posters/thumb/liber-pater.jpg', w: 1270, h: 1500, alt: 'Liber Pater — The Synthesis of Parisian Nights poster: red wine pouring into a glass before the Eiffel Tower' },
      status: 'now-showing',
      synopsis:
        "A sensory journey translating the rich vocabulary of fine wine into fluid, physical space. Set in Toronto's historic Distillery District, this luxury boutique captures the electric elegance of Parisian nightlife. Curved architectural lines mimic the motion of a perfect pour, while opalescent surfaces evoke a tactile allure. It's almost like the architecture is flirting with the qualities of the wine itself.",
      meta: [
        ['Project', 'Wine Boutique in Distillery'],
        ['Client', 'Liber Pater Winery'],
        ['Location', 'Distillery District, Toronto'],
        ['Date', 'November 2021'],
        ['Tools', 'Revit 2022 & Enscape'],
      ],
      hero: liber('cover.jpg', 1536, 864, 'Liber Pater boutique interior: black wine wall displays curving toward a central tasting island under a glowing gold ceiling'),
      sections: [
        { type: 'chapter', label: 'Scene One', title: 'The Concept' },
        {
          type: 'text',
          heading: 'Wine Boutique in Distillery',
          body: [
            "Designed for Liber Pater, a luxury French wine brand in Toronto's Distillery District, this boutique creates an immersive retail experience inspired by the vibrancy of Parisian nightlife. Fluid forms, rich materiality, and atmospheric lighting express movement, elegance, and brand identity.",
            'The concept explores synesthesia, translating the sensory qualities of wine into a visual and tactile journey. Curved forms, gold finishes, and opalescent surfaces echo the motion of pouring wine, while veined granite and warm metallic accents evoke depth, luxury, and allure.',
          ],
        },
        { type: 'image', layout: 'wide', ...liber('concept-sketches.jpg', 1800, 1369, 'Hand-drawn concept sketches titled Style & Taste and Fluidity, mapping wine aromas, palate and the flow of a pour', { paper: true }), caption: 'Concept development — Style & Taste, and Fluidity' },
        { type: 'image', layout: 'left', ...liber('storefront-sketch.jpg', 756, 558, 'Coloured sketch of the red-brick Distillery District storefront with green doors and topiaries'), caption: 'Storefront study' },

        { type: 'chapter', label: 'Scene Two', title: 'The Pour' },
        { type: 'image', layout: 'full', ...liber('central-tasting.jpg', 1800, 1170, 'Guests gather around the curved central tasting island beneath a sculptural ring chandelier') },
        {
          type: 'text',
          heading: 'A fluid journey',
          body: [
            'The boutique guides visitors through a fluid, relaxed journey inspired by the form of a wine bottle and the natural flow of wine. Curved circulation encourages a slow, intuitive pace, allowing guests to move seamlessly between zones.',
            'Layered lighting and contrasting textures — smooth granite, shimmering metals, and warm ambient tones — reflect the complexity of wine flavors, creating a multisensory experience that feels both intimate and refined while maintaining a sense of luxury.',
          ],
        },
        { type: 'pair', images: [
          liber('tasting-island.jpg', 1536, 864, 'Veined granite tasting island set with glasses and decanters'),
          liber('perimeter-display.jpg', 1536, 864, 'Perimeter wine wall and curved island, with a guest browsing bottles'),
        ] },
        { type: 'image', layout: 'right', ...liber('bottle-display.jpg', 1536, 864, 'Featured bottles lit on cylindrical timber plinths in a glazed alcove') },

        { type: 'chapter', label: 'Scene Three', title: 'Spatial Experience' },
        {
          type: 'list',
          heading: 'Spatial experience',
          items: [
            ['Entrance', 'Climate-controlled wall displays organize wines by flavor profile and optimal storage temperature.'],
            ['Central Tasting', 'Curved tasting islands echo wine bottle silhouettes and encourage gathering and conversation.'],
            ['Retail & Display', 'Perimeter circulation allows intuitive browsing, with accent lighting highlighting featured bottles.'],
            ['Point of Sale', 'Custom front register integrates seamlessly for a refined, efficient checkout experience.'],
          ],
        },
        { type: 'image', layout: 'full', ...liber('plan.jpg', 1570, 387, 'Rendered plan view of the boutique showing the bottle-shaped circulation and central islands'), caption: 'Plan' },
        { type: 'image', layout: 'full', ...liber('elevation-day.jpg', 1080, 262, 'Rendered section elevation at dusk'), caption: 'Sections' },
        { type: 'image', layout: 'full', ...liber('elevation-night.jpg', 1079, 218, 'Rendered section elevation at night with guests inside') },
      ],
    },

    /* ================== 03 — THE COTTAGE ON GEORGIAN BAY ================== */
    {
      id: 'cottage-georgian-bay',
      number: '03',
      kind: 'project',
      title: 'The Cottage on Georgian Bay',
      subtitle: 'Where the Stone Meets the Shore',
      poster: { src: 'assets/posters/cottage-georgian-bay.jpg', thumb: 'assets/posters/thumb/cottage-georgian-bay.jpg', w: 1232, h: 1500, alt: 'The Cottage on Georgian Bay — Where the Stone Meets the Shore poster: a cottage on rocks above the water at sunset' },
      status: 'now-showing',
      synopsis:
        'A quiet celebration of the rugged Canadian landscape, designed to blur the boundary between indoors and out. Tailored as a social yet serene retreat, this bespoke cottage uses bold, asymmetrical forms and earthy materials to mirror the wild Georgian Bay shoreline. Flooded with natural light, it is functional, warm, and thoughtful daily living.',
      meta: [
        ['Typology', 'Bespoke residential cottage'],
        ['Location', 'Georgian Bay, Ontario'],
        ['Clients', 'A middle-aged couple'],
      ],
      hero: cottage('hero.jpg', 1170, 808, 'Cottage exterior: a cream board-and-batten house with an asymmetrical dark metal roof and timber stairs, set among pines by the bay'),
      sections: [
        { type: 'chapter', label: 'Scene One', title: 'The Retreat' },
        {
          type: 'text',
          heading: 'A serene yet social retreat',
          body: [
            'Designed as a serene yet social retreat for a middle-aged couple, this bespoke Georgian Bay cottage blends bold, earthy design with seamless indoor-outdoor living. Inspired by the rugged landscape, asymmetrical forms, natural materials, and abundant light create a warm, functional space that supports relaxation, connection, and thoughtful daily living.',
          ],
        },
        {
          type: 'list',
          heading: 'Key concepts',
          items: [
            ['Asymmetry', 'Angular rooflines echo the surrounding terrain.'],
            ['Natural Immersion', 'Sun-oriented views and fluid indoor-outdoor flow.'],
            ['Social Core', 'Open-concept kitchen and outdoor gathering spaces.'],
          ],
        },
        {
          type: 'gallery', paper: true,
          caption: 'Concept development — entrance, kitchen, living area and master bedroom',
          images: [
            cottage('sketch-entrance.jpg', 592, 970, 'Concept sketch: Cottage on the Bay title page with entrance, roof and colour notes'),
            cottage('sketch-kitchen.jpg', 616, 966, 'Concept sketch: kitchen and powder room ideas with herringbone tile and pendant lights'),
            cottage('sketch-living.jpg', 749, 1178, 'Concept sketch: living area with antler chandelier, wood-burning fireplace and snowshoes'),
            cottage('sketch-master-bed.jpg', 654, 1004, 'Concept sketch: master bedroom and ensuite with freestanding tub and river-rock flooring'),
          ],
        },

        { type: 'chapter', label: 'Scene Two', title: 'The Land' },
        {
          type: 'split', side: 'right',
          image: cottage('site-plan-sun.jpg', 936, 926, 'Hand-rendered site plan showing the sun path around the rocky shoreline lot', { paper: true }),
          heading: 'Reading the terrain',
          body: [
            'Nestled among dense pine forests and natural rock formations, the cottage is elevated on engineered support pillars to preserve the surrounding terrain. The design responds directly to topography and sun path, with each space oriented to maximize natural light, warmth, and daily comfort throughout the home.',
          ],
        },
        { type: 'pair', images: [
          cottage('sun-studies.jpg', 1170, 1168, 'Sun path studies across the seasons, drawn over the treeline', { paper: true }),
          cottage('aerial.jpg', 936, 926, 'Aerial render of the cottage on its rocky point surrounded by water'),
        ] },

        { type: 'chapter', label: 'Scene Three', title: 'Where the Stone Meets the Shore' },
        { type: 'image', layout: 'full', ...cottage('exterior-deck.jpg', 1800, 1156, 'The cottage raised on pillars with a wraparound deck and stair descending to the rocks') },
        {
          type: 'split', side: 'left',
          image: cottage('exterior-glazing.jpg', 790, 817, 'Corner of the cottage with full-height glazing and a stone chimney'),
          heading: 'A personal sanctuary',
          body: [
            'More than a vacation home, the cottage is a personal sanctuary and social retreat shaped by natural textures, thoughtful detailing, and architectural clarity. Expansive glazing frames forest, water, and sky, filling the interior with warm natural light and reinforcing a sense of escape and calm.',
          ],
          listHeading: 'Exterior highlights',
          list: [
            'Cladding: Light cream board-and-batten softens the silhouette with subtle rustic warmth',
            'Roof: Asymmetrical dark metal roof with skylights for daylight and stargazing',
            'Outdoor Living: Indoor–outdoor fireplace strengthens connection to nature',
            "Personal Touches: Canoe paddles and vintage snowshoes reflect the clients' active lifestyle",
          ],
        },

        { type: 'chapter', label: 'Scene Four', title: 'Inside' },
        { type: 'image', layout: 'full', ...cottage('interior-living.jpg', 1010, 512, 'Double-height living room with exposed beams, a stone fireplace and skylights') },
        {
          type: 'text',
          heading: 'Warm, textural and open',
          body: ['The interior is warm, textural, and open, designed to support comfort, rest, and togetherness.'],
          columns: [
            { heading: 'Layout', list: [
              'Open-concept kitchen and living space with vaulted ceilings and exposed beams',
              'Cozy breakfast nook and lofted bedroom overlooking shared spaces',
              'Screen-free living encourages mindfulness, with outdoor projection for movie nights',
            ] },
            { heading: 'Materials & tones', list: [
              'Natural wood planks and fishbone tile flooring',
              'Moody, organic palette of blues, greens, browns, and warm accents',
              'Layered textiles for softness and warmth',
              'Spa-inspired bathroom with river rock floors, penny tile, and forest views',
            ] },
          ],
        },
        { type: 'image', layout: 'wide', ...cottage('interior-kitchen.jpg', 1010, 513, 'Kitchen and dining under black pendant lights, with a timber stair to the loft') },
      ],
    },

    /* ========================= 04 — TIDAL RELIEF ========================== */
    {
      id: 'tidal-relief',
      number: '04',
      kind: 'project',
      title: 'Tidal Relief',
      subtitle: 'Regenerating the Healthcare Experience through Multi-Sensory Immersion',
      poster: { src: 'assets/posters/tidal-relief.jpg', thumb: 'assets/posters/thumb/tidal-relief.jpg', w: 1125, h: 1500, alt: 'Tidal Relief poster: a great wave curling over a calm face in profile' },
      status: 'coming-soon',
      synopsis: 'COMING SOON.',
      meta: [],
      hero: null,
      /* When this project is ready: set status to 'now-showing', add a hero image,
         and fill in sections. The placeholders below show the intended running order. */
      sections: [
        { type: 'chapter', label: 'Scene One', title: 'The Concept' },
        { type: 'placeholder', label: 'Concept & research' },
        { type: 'placeholder', label: 'Floor plans' },
        { type: 'placeholder', label: 'Renderings' },
      ],
    },

    /* =========================== 05 — MYCELIUM ============================ */
    {
      id: 'mycelium',
      number: '05',
      kind: 'project',
      title: 'Mycelium',
      subtitle: 'One Building. Five Stages of Growth.',
      poster: { src: 'assets/posters/mycelium.jpg', thumb: 'assets/posters/thumb/mycelium.jpg', w: 1125, h: 1500, alt: 'Mycelium poster: glowing mushrooms rising from the forest floor' },
      status: 'coming-soon',
      synopsis: 'COMING SOON.',
      meta: [],
      hero: null,
      sections: [
        { type: 'chapter', label: 'Scene One', title: 'The Concept' },
        { type: 'placeholder', label: 'Concept & research' },
        { type: 'placeholder', label: 'Floor plans' },
        { type: 'placeholder', label: 'Renderings' },
      ],
    },

    /* ============== STAFF PICKS — the director's favourite films ============== */
    {
      id: 'chef',
      kind: 'favourite',
      title: 'Chef',
      poster: { src: 'assets/posters/chef.jpg', thumb: 'assets/posters/thumb/chef.jpg', w: 759, h: 1500, alt: 'Vintage-style poster for Chef: a yellow food truck beneath palm trees at sunset' },
      synopsis: 'A pinch of creativity, a dash of curiosity, and a whole lot of passion.',
    },
    {
      id: 'princess-bride',
      kind: 'favourite',
      title: 'The Princess Bride',
      poster: { src: 'assets/posters/princess-bride.jpg', thumb: 'assets/posters/thumb/princess-bride.jpg', w: 746, h: 1500, alt: 'Vintage-style poster for The Princess Bride: a rapier and mask before a distant castle' },
      synopsis: 'A little romance, a lot of adventure, and a happily ever after kind of heart.',
    },
    {
      id: 'wedding-singer',
      kind: 'favourite',
      title: 'The Wedding Singer',
      poster: { src: 'assets/posters/wedding-singer.jpg', thumb: 'assets/posters/thumb/wedding-singer.jpg', w: 743, h: 1500, alt: 'Vintage-style poster for The Wedding Singer: a vintage microphone with two wedding rings under a spotlight' },
      synopsis: 'A sentimental soul with a soundtrack for everything.',
    },
  ];
})();
