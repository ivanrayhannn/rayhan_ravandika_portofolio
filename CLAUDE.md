# Working rules for this repository

This repository holds two portfolio sites:

| Tag in the request | Site | Folder | Live path |
|---|---|---|---|
| `-Ivan` | Ivan's portfolio (Muhammad Rayhan Ravandika) | repository root (`index.html`, `assets/`, ...) | `/rayhan_ravandika_portofolio/` |
| `-Keisya` | Keisya's portfolio | `keisya/` | `/rayhan_ravandika_portofolio/keisya/` |

- Edit only the site named by the tag. Never change the other site's files in the same request.
- If a request has no tag and the target is not obvious, ask which site before editing.
- `keisya/` is a full copy, so the same file names exist in both places (for example `assets/data.js` and `keisya/assets/data.js`). Check the path before every edit.
- `keisya/admin.html` publishes into `keisya/assets/` through `<meta name="cms-dir" content="keisya/">`. Keep that tag until the site moves to its own repository (see README).
