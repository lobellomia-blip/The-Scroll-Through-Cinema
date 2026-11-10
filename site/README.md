# Scroll-Through Cinemas — how to update your site

Open `index.html` in a browser to view the site locally (no build step or installs needed).

## Folders
- `assets/env/` — the cinema environments (entrance, ticket booth, concession stand)
- `assets/posters/` — poster artwork (full size) and `thumb/` (smaller copies used on the poster wall)
- `assets/projects/<project>/` — each project's images
- `js/content/projects.js` — **all project content**: posters, synopses, and the feature presentation for each project
- `js/content/site.js` — attendant dialogue, snack fun facts, and your contact details
- `css/main.css` — all styling; `js/` — the experience itself

## Common edits
- **Add your email, LinkedIn or résumé:** fill in `email`, `linkedin`, `resume` in `js/content/site.js`. Empty fields stay hidden.
  For a résumé, put the PDF in `assets/` and set `resume: 'assets/your-file.pdf'`.
- **Add images to a project:** drop the files into `assets/projects/<project>/`, then add a section in `projects.js`
  (the section types are listed at the top of that file). Include each image's pixel width and height.
- **Launch Tidal Relief or Mycelium:** in `projects.js`, change `status: 'coming-soon'` to `'now-showing'`, add a `hero`
  image, and replace the placeholder sections. The PLAY FEATURE PRESENTATION button then appears automatically.

## Links to share
Each room has its own address: `#entrance`, `#booth`, `#concession`, `#posters`, `#poster-modunest`, `#feature-liber-pater`, `#director`, …
