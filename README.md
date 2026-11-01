# Hestia 2.0 — Home Design + Modeling Studio

A desktop-first browser app for floor plans, furnished interiors, and custom 3D models, with a local Node.js workspace that saves projects and component libraries on your PC.

**Release 0.2: integrated core CAD tools and local workspace.** This is an independent project. It does **not** implement every SketchUp Pro or Homestyler feature. See [the feature matrix](FEATURES.md) for implemented tools, limitations, and remaining work.

## Run locally

Install [Node.js](https://nodejs.org/) 20 or newer, then:

```sh
git clone https://github.com/harsh-2596/Hestia-2.0.git
cd Hestia-2.0
npm ci
npm start
```

Open **[http://127.0.0.1:4173](http://127.0.0.1:4173)**. Keep the terminal open; Ctrl+C stops the server. ZIP users can extract the source and run these commands in the folder containing `package.json`. On Windows, use `npm.cmd ci` and `npm.cmd start` if PowerShell blocks npm scripts.

No account, API key, external database, or build step is required. Installation downloads pinned dependencies and prepares `dist/vendor/` automatically. Use a browser with WebGL and hardware acceleration for 3D. The interface is designed primarily for a desktop mouse and keyboard. Optional Google Fonts fall back to system fonts.

## What you can do

| Workspace | Tools |
| --- | --- |
| Build | Rectangular rooms, angled straight walls, door/window openings, multiple independent floors, blueprint image import and manual scale calibration |
| Furnish | 19 original procedural furniture types, search, thumbnails, dimensions, positioning, rotation, color, floor finishes, day/evening lighting |
| Model → Create | Rectangle, circle, polygon, line/path, box, cylinder, sphere, curved pipe path; profile extrusion and offsets |
| Model → Organize | Multi-selection, flat groups, linked component definitions, make unique, tags, visibility, locking, reusable PC component library |
| Model inspector | Exact XYZ position, Euler rotation, scale/mirroring; move/rotate/scale gizmos; experimental union/subtract/intersect |
| Model → Views | Standard camera views, perspective/parallel projection, display styles, visual section clipping, saved scenes |
| PC workspace | Autosave to disk, multiple named projects, save copy, conflict detection, latest 20 revisions and restore |
| Exports | Editable JSON, floor-plan/view PNG, current-floor GLB/OBJ/STL, planar DXF linework, scaled A3 SVG sheet, furniture CSV |

Home and CAD geometry share the project document, floor selection, undo/redo history, 3D scene, and project exports. CAD inspector dimensions and blueprint calibration use **meters**, even when home-design labels display feet.

## First modeling workflow

1. Choose **Model → Create → Box**, or choose Rectangle/Polygon and draw in the 2D plan.
2. Select the model and edit dimensions in the right inspector. A planar profile becomes a solid with **Apply profile extrusion**. Offset changes its outline.
3. In 3D, use the colored gizmo to move, rotate, or scale. Exact transforms are also available as numeric fields. Negative scale mirrors a model.
4. Use **Organize** for multi-selection, groups, tags, hide/lock, and the component library. Make a component in the inspector, duplicate it, then change shared geometry to update linked instances. **Make unique** detaches an instance.
5. Select two closed solids for Union/Subtract/Intersect. Subtract removes the second selected solid from the first. These operations are experimental; keep editable backups.
6. Open **Views** for parallel plans, sections, styles, and saved scenes. **Files** contains model import/export and the scaled A3 sheet.

In Model mode: **L** line, **R** rectangle, **C** circle, **T** move, **E** rotate, **S** scale, **Enter** finish path, **Esc** cancel, **Ctrl+D** duplicate, **Ctrl+G** group, **Ctrl+Shift+G** ungroup. Use **Ctrl+Z / Ctrl+Shift+Z** for undo/redo. Keyboard tools apply when focus is outside text fields/dialogs.

For home design, choose Build to draw rooms/walls, Furnish to arrange items, and Import to trace a PNG/JPG/WebP blueprint manually. This release does not automatically turn an image into a measured building model.

## Saving on your PC

The running server stores JSON records in **`.hestia-data/` beside `server.mjs`**:

```text
.hestia-data/
  projects/                 Current project records
    history/<project-id>/   Recovery revisions
  components/               Reusable component records
    history/<component-id>/ Recovery revisions
```

Writes use a temporary file, file synchronization, and atomic replacement. A revision check rejects stale writes from another tab. Keep one server process per data directory. The latest 20 recovery revisions are retained; restoring creates a new revision. Browser storage retains a recovery copy of the current project. Wait for saving to finish before stopping the server. On conflict, open the disk version or save browser changes as a new copy.

**PC workspace → Open** loads a disk project, including from another browser on this PC. Clearing browser data does not erase disk records. Avoid deleting `.hestia-data`; back it up separately. The data folder is excluded from Git and source ZIPs. An app upgrade should preserve it. Keep **Export → Editable project** backups for portable copies; legacy `.forma.json` project files remain supported.

To choose another data directory before starting:

```powershell
$env:HESTIA_DATA_DIR = 'D:\HestiaWorkspace'
npm.cmd start
```

To change ports, set `$env:PORT = '4174'` in PowerShell, or `PORT=4174 npm start` on macOS/Linux. Visit the matching local address. Browser recovery is specific to the address; disk records still appear in PC workspace.

The server binds to `127.0.0.1`, checks Host/Origin and write headers, and is intended for one local OS user. It has no multi-user authentication or cloud synchronization. Do not expose it publicly or use it as a shared network backend without adding authentication and deployment hardening.

## File compatibility and limits

- **JSON:** full editable home/CAD document, definitions, tags and scenes. Earlier version-1 home projects remain compatible through the optional CAD field.
- **GLB/OBJ/STL import:** static triangle geometry only; self-contained files up to 12 MB and 100,000 triangle vertices total. Imported animation, hierarchy, material textures, lights, and parametric history are not preserved. Check units and scale, particularly for OBJ/STL. Draco/compressed GLB is unsupported.
- **GLB/OBJ/STL export:** current-floor scene, including visible CAD geometry. OBJ does not package textures/MTL; STL has no materials or unit metadata. Exported geometry remains complete when a visual section plane is enabled. Hidden CAD entities/tags are omitted.
- **DXF:** meter-based straight wall centerlines and supported planar CAD outlines/paths. It omits furniture, imported meshes, spheres, pipe surfaces, annotations, and full 3D solids. No DXF import or DWG/SKP compatibility.
- **A3 SVG:** current plan at a selected scale that fits the page. Print at 100%/actual size. It is a single sheet, without associative dimensions or LayOut document support.
- **PNG/CSV:** visual previews and furniture schedule. CAD objects are excluded from furniture pricing; the CSV is not a complete material takeoff.
- Limits include 2,000 CAD entities, 500 definitions/groups, 200 tags, 100 scenes, and a 16 MB backend request limit. Browser storage may fill earlier with large imports; keep exports.

## Development and checks

```sh
npm ci
npm test
npm start
```

Tests cover original home geometry/validation/history, CAD extrusion/offset/solid volumes/components, disk persistence, revision conflicts, recovery retention, and HTTP access controls. Browser checks cover profile drawing/extrusion, gizmo movement, linked editing, component library, cameras/sections/scenes, and disk workspace interaction. See [VALIDATION.md](VALIDATION.md) for the delivered verification and its limits.

```text
dist/app.js               Home editor and shared bridge
 dist/model.js            Project model, catalog, validation, undo/redo
 dist/scene.js            Three.js home scene and procedural furniture
 dist/cad-data.js         CAD document and profile validation
 dist/cad-geometry.js     Geometry, CSG, model imports, DXF
 dist/cad-studio.js       Integrated modeling UI and scene controls
 dist/workspace-client.js Disk-save queue and workspace/library UI
backend/workspace.mjs     Validated revisioned file store and API
server.mjs                Loopback HTTP server + API
setup-vendor.mjs          Browser dependency preparation after npm ci
tests/                    Node tests
```

A static host can serve `dist/` after `npm ci`; this provides browser-only saving. **The PC workspace requires `npm start` and is not available from static hosting.** This repository includes no private hosting configuration.

## Troubleshooting

| Problem | Action |
| --- | --- |
| `node` / `npm` missing | Install Node.js and reopen the terminal. |
| `package.json` missing | Open the terminal in the extracted/cloned source folder. |
| Port in use | Stop the other instance, or choose another PORT. |
| PC workspace button missing | Use the local Node server rather than `file://` or a static host. |
| Save conflict | Open the disk version or Save as a new copy; export a backup first. |
| Disk save failed | Check available disk space and directory permissions, then retry in PC workspace. Browser recovery alone is not a backup. |
| 3D unavailable | Enable hardware acceleration, update GPU drivers, or use 2D. |
| Solid operation fails | Use closed, clean, overlapping solids with modest triangle counts; undo or reopen your editable backup. |
| Rooms and walls differ | Room surfaces and wall endpoints are independently editable. |

## Contributing and licenses

See [CONTRIBUTING.md](CONTRIBUTING.md). Original code and procedural furniture use the [MIT License](LICENSE). Dependencies: Three.js 0.170.0, three-bvh-csg 0.0.17, and three-mesh-bvh 0.8.3, all MIT; installation copies their license notices to `dist/vendor/`. Google Fonts retain their respective licenses. No SketchUp/Homestyler source, branding, proprietary models, or paid service entitlements are included.
