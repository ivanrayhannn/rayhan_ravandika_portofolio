# Design direction

## Design Read

Reading this as: a personal portfolio for recruiters and hiring managers in Indonesian enterprise IT, in the blue reference style the owner chose (blue hero, lanyard ID card), dial ENERGY 2 / RHYTHM 2 / MOTION 2.

- ENERGY 2: confident first screen (blue hero, ID card), calm content below.
- RHYTHM 2: one section system, but each section is composed for its content (rows, chain, swimlane, timeline, logo tiles).
- MOTION 2: one playful interaction (swinging ID card) plus state transitions. No scroll-reveal, no loops.

## Decisions and why

| Decision | Reason |
| --- | --- |
| Navy `#0a2a78` and blue `#0d47c9` | Taken from the owner's reference; blue reads as corporate IT, which is the audience. |
| Mist `#e7edf6` page instead of white | The owner found pure white too bright next to the blue. |
| Cyan `#7ee3f0` as the only accent | Marks the name and key labels on blue areas; never used on the light page. |
| Yellow gateway in the swimlane | BPMN convention for a decision, so it carries meaning, not decoration. |
| Plus Jakarta Sans, one family | Drawn for Jakarta's identity, friendly but professional; weights do the hierarchy, no mono font needed. |
| Line-art (bar chart, trend line, flow boxes) on blue areas only | Echoes analyst work; kept off the content sections so they stay quiet. |
| Short bar under every section title | Identity motif from the reference, repeated consistently. |
| Hero figures inline with dividers | They are real CV figures; tiles would make them look like dashboard filler. A source line sits under them. |
| Lanyard ID card | The reference's signature element; a real-world object that says "this is who I am" at a glance. |
| REQ-01 rows for services | This is how an analyst lists scope; it is the identity motif of the content. |
| Document chain with chevrons | BRD, FSD, TSD and test strategy are written in that order and trace to each other. |
| Vertical swimlane | Lanes as columns keep a 20-row flow readable by scrolling the page instead of sideways. |
| Case studies as rows led by client logos | The logo tells the reader more than an illustration; every fact comes from the CV. |
| Skills as a definition list | They are labels and values, not features, so no cards. |
| Work history on a blue band | Gives the long page one second anchor and separates history from capability. |
| White logo tiles | Logos keep their own colours, which the owner supplied. |
| Radius 6 / 10 / 16 / 22 | Tags, controls, panels, feature containers. Nothing is a pill. |
| Glass blur on the nav only | It floats over blue and mist; everywhere else uses solid surfaces. |
| Shadows on nav and ID card only | The only two elements that sit above the page. |
| Fixed light theme, no dark toggle | The owner chose this blue and mist identity; it is a single-look brand page. |
| Editor drags blocks within the page flow, not to free x/y positions | Free positioning breaks the layout on phones. Flow moves, widths and Columns keep every page responsive. |
| Editor colors limited to the site palette, with a live contrast check | Keeps edits on brand and warns before text drops under WCAG AA. |
| Editor publishes through a GitHub token kept in the browser | The site is static on GitHub Pages; committing `edits.js` is the only way to change it, and the repository is the access control. |
| Built-in content is hidden, never deleted | Hiding is reversible from Layers and keeps the page structure the changes are keyed to. |

## States and copy

| Where | Loading | Empty | Error |
| --- | --- | --- | --- |
| Whole page | Section text reads "Loading …" until main.js runs | n/a | Yellow banner: "This page couldn't load its content. Refresh the page. If it keeps happening, email …" |
| Lists (services, cases, skills, history, clients) | "Loading case studies…" etc. | Says why and where to look instead, e.g. "No case studies are published yet. The work history below covers the same projects." | "Couldn't show the case studies. Refresh the page, or download the CV for the same details." |
| Client logo | Space reserved by width and height | n/a | Falls back to the company name as text |
| CV | n/a | Button reads "CV coming soon" and is disabled | n/a |
| Copy email | n/a | n/a | "Couldn't copy automatically. The address is selected: press Ctrl+C (or Cmd+C) to copy it." |
| No JavaScript | n/a | n/a | "This portfolio needs JavaScript to show its content. You can still download the CV (PDF)." |
| Editor canvas | "Loading the page…" | "Nothing selected. Click anything on the page to change it." | "The page is taking too long to load…" with Try again; opened as a file: "Open admin.html from the website address or a local web server" |
| Editor draft | "Saving draft…" | "No unpublished changes" | "Couldn't save the draft on this browser. Publish or download your changes before you close the tab." |
| Editor publish | Steps: checking, uploading images, saving, updating | Publish is disabled: "Nothing new to publish" | Token refused, no access, branch not found, network, or a newer version published elsewhere ("Replace it with my version") |
| Editor content checks | n/a | Empty text or image blocks are listed before publishing | Changes whose content has changed are switched off, with "Apply them anyway" and "Remove them" |

## Placeholders still open

- ID card photo: initials until a photo is added (`photo` in `assets/data.js`).
- Case study write-ups for Adhi Persada Beton, Amway and Bank Papua: listed as in progress.
