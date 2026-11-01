# Hestia 2.0 — Home Design Studio

A desktop-first home design app that runs in your browser. Draw floor plans, arrange furniture in 3D, try materials, and export your design.

**Status: functional core release.** Hestia 2.0 is an independent project, not an official Homestyler product or a complete replacement for professional architectural software.



## Quick start

### Requirements

- [Node.js](https://nodejs.org/) **20 or newer** (a current LTS version is recommended).
- A modern Chrome, Edge, Firefox, or Safari browser. The 3D view needs hardware acceleration/WebGL; a 2D fallback is available.
- Git is optional: use **Code → Download ZIP** instead if you prefer.

### Clone and run

```sh
git clone https://github.com/harsh-2596/Hestia-2.0.git
cd Hestia-2.0
npm ci
npm start
```

Open **[http://127.0.0.1:4173](http://127.0.0.1:4173)**. Keep the terminal open while using the app; press **Ctrl+C** to stop it.

**ZIP users:** extract the ZIP, open a terminal inside the extracted folder containing `package.json`, then run `npm ci` followed by `npm start`.

**Windows PowerShell:** if `npm` is blocked by your script execution policy, use `npm.cmd start`. Use `npm.cmd ci` for installation too. No execution-policy change is needed.

No API key, account, database, or build is required. Run `npm ci` once: it downloads the pinned Three.js package and automatically prepares the browser modules in `dist/vendor` using `setup-vendor.mjs`. Internet is needed for installation; generated renderer files are not committed to this repository. Google Fonts is optional; system fonts are the fallback.

## Features

| Area | Available features |
| --- | --- |
| Floor plans | Rectangular room surfaces, straight walls at any angle, 10 cm snapping, dimensions, door/window openings |
| 3D editing | Orbit, pan, zoom, camera reset, cutaway/full walls, live updates |
| Furniture | 19 original procedural model types, search, categories, generated 3D thumbnails |
| Object editing | Move, resize, rotate, duplicate, delete, change colors |
| Finishes | Floor materials, wood/tile previews, color presets |
| Lighting | Daylight and evening scene presets |
| Blueprints | PNG/JPG/WebP import, positioning, opacity, two-point scale calibration |
| Projects | Furnished 108 m² sample, blank projects, named independent floors, metric/imperial display |
| Saving | Local autosave, undo/redo, editable JSON backup/import |
| Exports | 2D PNG, current-view PNG, GLB model, CSV furniture schedule |
| Usability | Keyboard shortcuts, reduced-motion support, responsive layout, 2D fallback |

## Your first design

### Explore the sample

The app opens **The Sunday House**, a furnished sample. Drag empty space in 3D to orbit, right-drag to pan, and scroll to zoom. Select a furniture piece to edit its dimensions and appearance in the right panel.

### Start from scratch

1. Open **Project → Start a blank home**. Export a backup first if you want to keep your current work.
2. Choose **Build → Draw a room**, or press **B**.
3. Click two opposite corners in the 2D canvas. Hestia 2.0 creates a rectangular floor surface and perimeter walls.
4. Choose a door/window tool and click a wall to add an opening.
5. Switch to **3D design** to explore the result.

### Furnish and style

Choose an item from **Furnish**. New pieces appear near the floor's center. Drag them into place in either view, then edit their dimensions, rotation, or color. Select a room and choose a material to change its floor finish.

### Trace a blueprint

1. Open **Import** and upload a PNG, JPG, or WebP image (up to 10 MB).
2. Choose **Calibrate a known distance**.
3. Click two points and enter their actual distance **in meters**, even when the display uses feet.
4. Adjust the image's position and opacity as needed.
5. Trace rooms/walls in 2D and check the dimensions.

This is **manual tracing**, not automatic recognition. For PDF/DWG plans, first export the relevant page as an image in your PDF/CAD software.

## Saving and backups

- Autosave keeps **one current project in this browser on this device**.
- Incognito browsing, clearing site data, changing browser/origin, or storage limits can make that project unavailable.
- Use **Export → Editable project** to download a `.forma.json` backup.
- Use **Project → Open a Hestia 2.0 project** to load a backup. Import replaces the current project after confirmation.
- If local storage is unavailable, the app reports it. Export a backup to preserve your changes.
- Projects are not uploaded to a cloud service by this release. A hosting provider may collect ordinary access logs, and the optional Google Fonts stylesheet makes an external request.

## Export formats

| Hestia 2.0t | Contents |
| --- | --- |
| `.forma.json` | Editable project, all floors, embedded blueprint reference |
| Floor-plan PNG | Current floor, 2000 × 1500 pixels |
| Current-view PNG | Browser preview at current canvas resolution |
| GLB | Current floor's geometry/materials, using the current cutaway/full-wall setting |
| CSV | All floors' furniture, dimensions, and illustrative USD reference prices |

GLB files can be opened in compatible 3D software such as Blender. PNG captures are browser previews, not offline photorealistic renders. Prices are examples, not retailer quotations, and exclude labor, tax, delivery, and building materials.

## Shortcuts

| Control | Action |
| --- | --- |
| V | Select/move |
| B | Draw a room |
| W | Draw connected straight walls |
| D / N | Place door / window |
| R | Rotate selected furniture 90° |
| Delete / Backspace | Remove selection |
| Esc | Cancel drawing and deselect |
| Ctrl/Cmd + Z | Undo |
| Ctrl/Cmd + Shift + Z | Redo |
| Ctrl/Cmd + D | Duplicate furniture or room surface |
| Ctrl/Cmd + S | Save locally |
| Drag empty 3D space | Orbit |
| Right-drag in 3D | Pan |
| Scroll | Zoom |

Shortcuts are inactive while editing fields or using dialogs. The in-app **Guide** and **Help** provide a tour and control reference.

## Known limitations

- Rooms are rectangular **floor surfaces**. Walls are independently editable; resizing/moving a room does not reposition existing walls. Edit wall endpoints separately. Shared-wall topology is not automatically reconciled.
- Floors are edited individually, not assembled into one multi-storey model.
- Automatic blueprint recognition, PDF/DWG import, custom model/texture uploads, and a retail furniture catalog are not implemented.
- Lamps are decorative; scene lighting presets change the daylight rather than simulating individual lamp emissions.
- Cloud saving/accounts, simultaneous editing, shared links, AI generation, and offline GPU rendering are not connected.
- Roof/stair configurators, advanced cabinetry, electrical/plumbing drawings, elevations, DXF/DWG exchange, video/VR, billing, and community features remain future work.
- This is a visualization tool, not structural engineering or certified permit/construction documentation.

## Development and tests

Install the pinned dependency before running tests:

```sh
npm ci
npm test
```

Ten automated tests cover project validation/serialization, bounds, openings, undo/redo, and generated furniture dimensions. Browser QA covered furniture editing, 2D/3D switching, floor/room creation, exports, and responsive layouts.

```text
dist/
  index.html       App shell
  style.css        Responsive interface
  app.js           Editor, 2D SVG, persistence, imports/exports
  model.js         Project format, catalog, geometry, validation, history
  scene.js         Three.js scene, furniture, thumbnails, GLB export
  vendor/          Generated by npm ci (not committed)
setup-vendor.mjs   Prepares browser modules after npm ci
tests/             Node.js tests
server.mjs         Loopback-only static server
```

Both views derive from a versioned JSON project document. Stored geometry uses meters; unit switching changes display only. The Node server serves static files and does not store projects.

## Hosting

After running `npm ci` to generate the vendor files, any static host supporting ES modules can serve **the contents of `dist/`**. Preserve relative paths and serve `.js` as JavaScript. Use HTTP/HTTPS rather than opening `index.html` via `file://`. Hosting does not add cloud project synchronization. This repository contains no private Sites deployment configuration.

## Troubleshooting

| Problem | Solution |
| --- | --- |
| `node` or `npm` not recognized | Install Node.js and reopen the terminal. |
| PowerShell blocks npm scripts | Use `npm.cmd start`, `npm.cmd ci`, or `npm.cmd test`. |
| `package.json` not found | Open a terminal in the extracted/cloned project folder. |
| Port 4173 already in use | Stop the other app instance or set a different `PORT`. |
| 3D fails | Update browser/GPU drivers, enable hardware acceleration, or use 2D. |
| Blueprint scale looks wrong | Calibrate a known distance; images do not have reliable physical scale. |
| Project missing on another device | Export/import a `.forma.json` backup; storage is local. |
| Room changed but walls did not | Edit the independent wall endpoints separately. |

Choose another port if necessary:

```powershell
# Windows PowerShell
$env:PORT = "4174"
npm.cmd start
```

```sh
# macOS / Linux
PORT=4174 npm start
```

Then open `http://127.0.0.1:4174`.

## Contributing

Bug reports and pull requests are welcome. Include reproduction steps and browser/OS information. Avoid attaching personal blueprints to public issues. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License and attribution

Original Hestia 2.0 code and procedural furniture are available under the [MIT License](LICENSE). Three.js 0.170.0 is MIT licensed; its notice is copied into `dist/vendor/THREE-LICENSE.txt` during installation. Google Fonts retain their respective font licenses.

No Homestyler branding, models, or client source code is included.
