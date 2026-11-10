/* =====================================================================
   SCROLL-THROUGH CINEMAS — SITE CONTENT
   Dialogue, snack fun facts, and your director (contact) details.
   ===================================================================== */

window.STC_SITE = {
  name: 'Scroll-Through Cinemas',
  tagline: 'A portfolio experience by Mia Lobello',

  attendant: {
    greeting: 'Welcome To Scroll-Through Cinemas! Your feature presentations await!',
    ticketHint: 'Press the brass speaker on the counter and I’ll print your ticket.',
    ticketIssued: 'Here you are — one admission! The theatre doors are open. Enjoy the show!',
    needTicket: 'Not so fast! You’ll need a ticket first — press the speaker on the counter.',
    concessionIntro:
      'Hi There! They say you are what you eat! Select a snack to unlock some fun facts, and to see what makes my creative gears turn. Or skip the line and head on out straight to the theatre!',
  },

  /* The four snacks at the concession stand. Dialogue is delivered exactly as written. */
  snacks: [
    {
      id: 'popcorn',
      name: 'Popcorn Bucket',
      text:
        'Layered with texture and architectural depth, I live in Toronto and have a passion for storytelling through my detailed and empathetic designs! Fun fact: My favourite snack is movie theatre popcorn and I will absolutely Uber Eats it any chance I get.',
    },
    {
      id: 'soda',
      name: 'Fountain Soda',
      text:
        "A refreshing blend of bold concepts and fluid space planning. Free refills of creative inspiration! Fun Fact: I'm usually fueled by double doubles and a good cream cheese bagel with tomato.",
    },
    {
      id: 'candy',
      name: "M&M's",
      text:
        "A highly curated collection of rich, matte, and glossy finishes. Hard on the outside, smooth on the inside. Fun Fact: I actually sort my M&M's by colour before eating them, and I eat them in order from greatest in quantity of the colour to least. Yes, my organizational brain never shuts off clearly.",
    },
    {
      id: 'combo',
      name: 'Combo Meal',
      text:
        "A combination of thoughtful details, creative ideas, and unexpected twists. Different elements but they all work together really well. Fun Fact: I'm an overthinker, so even the smallest decisions can turn into a full-blown brainstorm session!",
    },
  ],

  /* ---------------- GET TO KNOW THE DIRECTOR ----------------
     Leave a field as '' to hide it. Nothing is shown that isn't filled in here.
     - email:     your email address, e.g. 'name@example.com'
     - linkedin:  full LinkedIn profile URL
     - instagram: full Instagram URL
     - resume:    path to your résumé PDF, e.g. 'assets/Mia-Lobello-Resume.pdf' */
  director: {
    name: 'Mia Lobello',
    role: 'Interior Designer',
    city: 'Toronto',
    intro:
      'Mia Lobello is an emerging interior designer based in Toronto, with a passion for storytelling through detailed and empathetic design.',
    philosophy: [
      'Storytelling is one of the most important parts of who I am, both personally and as an interior designer. I believe every space tells a story, and every person experiences the world differently.',
      'I care about how people move through environments, how they feel, what they discover, and how design can create meaningful experiences.',
    ],
    identity: ['Elevated', 'Whimsical', 'Thoughtful', 'Conceptual', 'Human-centred'],
    email: 'lobellomia@gmail.com',
    linkedin: 'https://www.linkedin.com/in/mia-lobello-789b35331/',
    instagram: 'https://www.instagram.com/mlobello.designs/',
    instagramHandle: '@mlobello.designs',
    resume: 'assets/Mia-Lobello-Resume.pdf',
  },
};
