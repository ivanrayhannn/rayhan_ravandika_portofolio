# Rayhan Ravandika portfolio

Single-page portfolio for an IT PM and Business System Analyst. Plain HTML, CSS and JavaScript, no build step. Design direction and the reason behind each choice are in [DESIGN.md](DESIGN.md).

Live: https://ivanrayhannn.github.io/rayhan_ravandika_portofolio/

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure, loading text and the no-JavaScript message |
| `assets/data.js` | All content: profile, services, workflows, case studies, skills, work history, clients, links |
| `assets/main.js` | Renders the content, the workflow swimlanes, the ID card, the tabs, the copy button and the nav |
| `assets/styles.css` | Styles for desktop, tablet and phone |
| `hris.html`, `cimb.html`, `fwd.html` | Case studies with clickable screens |
| `marketing.html` | Spin-the-wheel marketing tool prototype |
| `assets/case.css`, `assets/demo.js` | Styles and click behaviour shared by the case-study pages |
| `assets/marketing.js` | Spinner logic: weighted draw, stock, spins per day, voucher codes |
| `assets/clients/` | Client logos (see the README there) |
| `assets/CV_Muhammad_Rayhan_Ravandika.pdf` | The CV behind the "Download CV" buttons |

## Common edits

- Content: edit `assets/data.js`. Empty lists show an explanation instead of a blank section.
- Photo on the ID card: add the image to `assets/` and set `photo` in `assets/data.js`.
- Workflow steps: edit `workflows` in `assets/data.js`; the diagrams redraw from it.

## Run locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. Copy-to-clipboard needs `localhost` or HTTPS; elsewhere it falls back to selecting the address.

## Deploy

Every push to `claude/optimistic-faraday-6kxzio` or `main` deploys to GitHub Pages through `.github/workflows/pages.yml`.

The Figma file (https://www.figma.com/design/gU6TdvJecOgKTtGIuvIjF3) still shows an earlier design.
