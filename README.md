# Rayhan Ravandika — Portfolio

Static single-page portfolio for a Business System Analyst, styled as a working specification document ("Spec Sheet"). No build step: plain HTML, CSS and JavaScript.

## Structure

| File | Purpose |
| --- | --- |
| `index.html` | Page layout and sections |
| `assets/data.js` | **All content** (name, services, projects, skills, experience, links). Edit this file to update the site. |
| `assets/main.js` | Renders content into the page and handles the theme toggle |
| `assets/styles.css` | Styling, light and dark themes |

Entries marked `TODO` in `assets/data.js` are placeholders: email, LinkedIn, CV link, projects, and work history.

## Run locally

Open `index.html` in a browser, or serve it:

```bash
python3 -m http.server 8000
```

## Deploy

Figma design: https://www.figma.com/design/gU6TdvJecOgKTtGIuvIjF3

Netlify: connect the repository. `netlify.toml` publishes the repo root. It also works as-is on GitHub Pages or Vercel.
