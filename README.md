# Rayhan Ravandika — Portfolio

Static single-page portfolio for a Business System Analyst, in a deep-blue theme with a draggable lanyard ID card. No build step: plain HTML, CSS and JavaScript.

## Structure

| File | Purpose |
| --- | --- |
| `index.html` | Page layout and sections |
| `assets/data.js` | **All content** (name, services, projects, skills, experience, links). Edit this file to update the site. |
| `assets/main.js` | Renders content, the workflow swimlanes, the draggable ID card, and the nav |
| `assets/styles.css` | Styling, light and dark themes |

To show your photo on the ID card, add the image to `assets/` and set `photo` in `assets/data.js`.

Entries marked `TODO` in `assets/data.js` are placeholders: email, LinkedIn, CV link, projects, and work history.

## Run locally

Open `index.html` in a browser, or serve it:

```bash
python3 -m http.server 8000
```

## Deploy

Figma design: https://www.figma.com/design/gU6TdvJecOgKTtGIuvIjF3

Netlify: connect the repository. `netlify.toml` publishes the repo root. It also works as-is on GitHub Pages or Vercel.
