# Rayhan Ravandika portfolio

Single-page portfolio for an IT PM and Business System Analyst. Plain HTML, CSS and JavaScript, no build step. Design direction and the reason behind each choice are in [DESIGN.md](DESIGN.md).

Live: https://ivanrayhannn.github.io/rayhan_ravandika_portofolio/

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure, loading text and the no-JavaScript message |
| `assets/data.js` | All content: profile, services, workflows, case studies, skills, work history, clients, links |
| `assets/main.js` | Renders the home page content, the ID card, the copy button and the nav |
| `assets/workflow.js` | Waterfall and agile swimlanes with tabs and the expand toggle, on `index.html` and `tmmin.html` |
| `assets/styles.css` | Styles for desktop, tablet and phone |
| `tmmin.html`, `hris.html`, `cimb.html` | Case studies with clickable screens |
| `marketing.html` | Spin-the-wheel marketing tool prototype |
| `assets/case.css`, `assets/demo.js` | Styles and click behaviour shared by the case-study pages |
| `assets/marketing.js` | Spinner logic: weighted draw, stock, spins per day, voucher codes |
| `admin.html`, `assets/admin.js`, `assets/admin.css` | Site editor: edit any page visually and publish (see below) |
| `assets/cms.js` | Applies the editor's changes to each page; also used inside the editor |
| `assets/cms-canvas.css` | Selection boxes and handles, loaded only inside the editor |
| `assets/edits.js` | Published changes from the editor. Written by the editor, not by hand |
| `assets/uploads/` | Images uploaded in the editor (created on the first publish with an image) |
| `assets/clients/` | Client logos (see the README there) |
| `assets/CV_Muhammad_Rayhan_Ravandika.pdf` | The CV behind the "Download CV" buttons |

## Editing in the browser

Open `admin.html` on the live site (https://ivanrayhannn.github.io/rayhan_ravandika_portofolio/admin.html) on a laptop or desktop.

- Pick the page at the top left. Click to select, double-click text or a button to type, drag a block to move it, drag the square handles to resize. The panel on the right sets size, alignment, spacing, text style, colors, links, images and visibility.
- Add tab: heading, text, small label, button, image, shape and columns. Columns put blocks side by side and stack on phones.
- The ID card photo: click it, then Upload. Focus picks the part of the photo that stays visible.
- Built-in content can be hidden but not deleted; Layers lists hidden items with a Show button. Added blocks can be deleted. Everything can be undone (Ctrl+Z).
- Refresh (top bar) reloads the page from the website and keeps the draft. The editor also checks for site updates when you come back to its tab and every minute, and offers Refresh when the code changed, for example after Claude pushed a change.
- The draft saves in that browser as you go. Preview opens the page with the draft; visitors only see changes after you publish.
- Publish commits `assets/edits.js` and any new images to this repository, and the Pages workflow redeploys in about a minute. It needs a fine-grained GitHub token with access to this repository only and the permission "Contents: Read and write". The token stays in the browser (only for the tab, unless you tick "Remember"). Without a token, "Download edits.js instead" gives a file to upload into `assets/` by hand.

Each change remembers the start of the text it was made on. If that content later changes in `data.js` or the HTML, the change is switched off instead of landing on the wrong element, and the editor offers to apply or remove it.

Pull before pushing code changes: publishing from the editor adds commits to the same branch.

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

## Keisya copy (`keisya/`)

A full copy of the site for Keisya's portfolio, served at `/keisya/` until it moves to its own repository. Content is still Rayhan's and is replaced later.

- Every page has `<meta name="robots" content="noindex">` so search engines skip the copy while it holds placeholder content.
- `keisya/admin.html` has `<meta name="cms-dir" content="keisya/">`, so Publish writes to `keisya/assets/edits.js` and `keisya/assets/uploads/`, not to the main site.
- To move it to a new repository: copy the contents of `keisya/` to the new repository root, remove the `cms-dir` meta tag, change `DEFAULT_GH` in `assets/admin.js` to the new repository and branch, add a Pages workflow, then remove the `noindex` tags once the content is Keisya's.
