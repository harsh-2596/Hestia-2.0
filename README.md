# Hestia 2.0 — Home Design + Modeling Studio

A desktop-first browser app for floor plans, furnished interiors, and custom 3D models, with a local Node.js workspace that saves projects and component libraries on your PC.

**Release 0.5: curated Auto Free image routing, OpenRouter free vision, reviewed plan reconstruction, constrained alternatives, sourced Vastu guidance and a spherical AI-tour workflow.** This is an independent project. It does **not** implement every SketchUp Pro or Homestyler feature. See [the feature matrix](FEATURES.md) for implemented tools, limitations, and remaining work.


## Curated Auto Free (0.5)

Open **AI models** to test FLUX 2 Klein 4B or Qwen Image 2 through ImageRouter. Free pricing alone never admits a model to Auto Free: inspect a real output and approve geometry, materials, lighting and realism; panorama approval also needs seam/projection checks. Approvals are separate by task and can be removed. No automatic approval or independent image-quality certification is claimed. Pricing/capabilities are checked on every request, and one model stays pinned across a floor tour. No paid or unverified-price fallback is selected. Add IMAGEROUTER_API_KEY privately to .env; see [complete configuration](AI-SETUP.md).

Plan lab also offers curated free OpenRouter vision for analysis, alternative proposals and interior briefs using OPENROUTER_API_KEY. This is separate from image generation. Live image quality has not been verified because no ImageRouter credential/test output is configured yet.

## Plan lab and AI tour (0.4)

**[Cloudflare and ComfyUI configuration — complete setup steps](AI-SETUP.md)**. Auto Free is the initial tour selection; Cloudflare and ComfyUI remain available. The README and setup guide use placeholders, never private credentials.

1. **Detect:** load PNG/JPEG/WebP or select a PDF page. Crop the building, select two known dimension endpoints (or enter pixel coordinates) and enter their measured separation. Run local line detection. Optional Cloudflare vision reconstructs semantic geometry from that calibrated crop. The crop is sent only when you click the Cloudflare action.
2. **Review:** open the draft in the existing 2D/3D editor; correct walls, rooms, openings, missing drawn objects and measurements. Classify walls; unclassified walls remain locked. Fixed stairs, ramps, parking/vehicles, lift shafts, columns and services have schematic editable geometry. Empty slabs cannot be approved.
3. **Approve:** confirm measurements and elements to save an unchanged baseline. Undo/redo, disk history, browser recovery and project exports remain available. Restore original creates an editable change without deleting alternatives.
4. **Inputs:** confirm room purpose, entrance, occupancy, budget amount/currency/scope and allowed changes. Confirm north and record its source when known. An unconfirmed north produces Unknown directional findings; stairs’ UP labels never establish north.
5. **Alternatives:** generate up to three local furnishing proposals or request structured Cloudflare proposals. Validate locked geometry, room overlaps, furniture/wall collisions, openings, door approaches and coarse access connectivity. The footprint, fixed objects and structural/unclassified walls stay locked. Room topology and arbitrary partition redesign are not automatically solved. Candidate counts can be below three, with reasons. Apply one as a new editable revision, reject it, or submit a revised/combined floor JSON for validation.
6. **Vastu:** review attributed, versioned General Vastu Guidance, with Aligned / Conflict / Unknown / Not applicable. Residential rules are excluded from commercial premises. Current findings appear on the 2D plan; stale reports are flagged. Each conflict retains its status when a practical response or optional sourced traditional remedy is recorded. Traditional suggestions are belief-based and carry no guaranteed corrective effect.
7. **Design and tour:** edit your own style/material/lighting/ceiling/retained-furniture brief or request three Cloudflare directions. Preview a spherical model capture without AI. Generate one real 2:1 room panorama with Cloudflare or local ComfyUI, review it, then approve to unlock the remaining rooms. Existing paid adapters remain available for flat room/wall edits. No silent provider fallback occurs.

Version-1 documents remain loadable. New planning records use project version 2; the original model, variants, assessment context, reports, chosen responses, briefs and panorama approvals are separate records within the project. Image jobs are stored separately on disk.

**Acceptance status:** deterministic logic and API contracts are tested. The supplied office plan remains a private, manually corrected review draft: local line detection found 43 candidates and no reliable enclosed rooms. Fully automatic semantic reconstruction, an owner-approved model, live provider panorama quality and whole-floor consistency are not yet verified. This is a development release, not full acceptance of every item in the requested plan.

## Run locally

Install [Node.js](https://nodejs.org/) 20.16 or newer, then:

```sh
git clone https://github.com/harsh-2596/Hestia-2.0.git
cd Hestia-2.0
npm ci
npm start
```

Open **[http://127.0.0.1:4173](http://127.0.0.1:4173)**. Keep the terminal open; Ctrl+C stops the server. ZIP users can extract the source and run these commands in the folder containing `package.json`. On Windows, use `npm.cmd ci` and `npm.cmd start` if PowerShell blocks npm scripts.

The model editor, walkthrough and reference finishes require no account or API key. Cloudflare generation needs your account/token; optional local ComfyUI uses an installed checkpoint and no hosted API key. Both are documented in [AI-SETUP.md](AI-SETUP.md). No external database or build step is required. Installation downloads pinned dependencies and prepares `dist/vendor/` automatically. Use a browser with WebGL and hardware acceleration for 3D. The interface is designed primarily for a desktop mouse and keyboard. Optional Google Fonts fall back to system fonts.

## Explore, restyle and render

Choose **Explore** in the left rail. **Walkthrough** enters the current floor at eye level: drag to look, use WASD/arrows to move, Q/E to turn, and the floor map or room list to jump. Walls and door openings constrain movement. Furniture collisions, stairs and automatic routing are not simulated.

**Reference** accepts a downloaded Pinterest image or your own PNG/JPEG/WebP (up to 10 MB). Crop a clean material patch if needed, choose a wall or room floor, and apply the image as a tiled/stretched finish. This changes the actual 3D model, supports Undo, and saves/exports with the project. Reference-only drafts remain in the current tab until used; applied finishes are embedded in project JSON. A full room photo applied as a texture is still a photo on a surface, not reconstructed furniture or geometry.

**AI renders** captures a 1536 × 1024 model view, then sends it with your prompt and optional reference to a selected provider. Wall mode captures a surface mask while protecting window/glass/frame and foreground geometry in the mask. OpenAI-style services receive an alpha mask; Gemini receives it as a visual guide. Models may still change details outside the intended region. Generated images do not edit the underlying 3D mesh.

**Generate floor tour** captures four directions per room and submits requests sequentially after showing the total image count. Stop after current image prevents remaining requests; it cannot undo the current provider charge. Leaving Explore also stops further tour requests after the current one. Completed images are grouped by tour and room: change rooms, look left/right, or drag horizontally to select another direction. This older Explore feature is a linked flat-viewpoint tour. The separate **AI tour** tool provides spherical panorama capture/viewing and pilot-gated generation; neither is a continuous AI-generated 3D world. Independent images may differ in style, objects and dimensions. Return to the real model to walk and look freely.

### Connect multiple AI providers privately

Copy `.env.example` to `.env` beside `server.mjs`, enter keys in a local text editor, and restart Hestia. Do not commit or share `.env`. Existing environment variables take precedence.

| Provider | Settings | Protocol |
| --- | --- | --- |
| OpenAI | `OPENAI_API_KEY`, optional `HESTIA_OPENAI_MODEL` | Multipart Images Edits with source/reference/mask; base64 output |
| Google Gemini | `GEMINI_API_KEY`, optional `HESTIA_GEMINI_MODEL` | Native generateContent with inline images and image response |
| OpenAI-compatible | `HESTIA_COMPATIBLE_API_KEY`, `HESTIA_COMPATIBLE_EDIT_URL`, `HESTIA_COMPATIBLE_MODEL`, optional `HESTIA_COMPATIBLE_NAME` | Must implement multipart image edits and return `data[0].b64_json` |

Defaults are `gpt-image-2.5-sunburst` and `gemini-nano-banana-2.1`, based on the checked official docs. Model access and availability depend on your provider account; both are configurable. A compatible endpoint must be HTTPS, or an HTTP loopback service. The server sends its configured compatible key only to that configured service, so enter its exact trusted edit endpoint. It does not support arbitrary provider protocols just by changing a URL.

Keys stay on the server and are excluded from status responses/projects. **Generate** transmits the captured view, reference, prompt and any mask to your selected provider; their usage charges/policies apply. Hestia does not use your ChatGPT/Gemini consumer sign-in and does not automatically retry or switch providers. Generation runs one request at a time, with a five-minute provider timeout.

Render metadata and source/reference/result images are saved under `.hestia-data/renders/<id>/`. Gallery comparisons show the original capture beside the generated image and flag model changes. Back up the entire data directory: project JSON exports include applied finishes but do **not** bundle the separate render collection. Server restarts mark unfinished jobs interrupted, without paid retries. Batch scheduling runs in the browser; keep the tab open to finish a tour. Previously completed images remain saved.

AI adapters and render/gallery/tour transport have automated and local-fixture coverage. **No live paid provider render was verified in this delivery because no real API key was configured.** Fixtures used to test the viewer are explicitly labelled and are not AI examples or shipped assets.

Reference API documentation: [OpenAI image editing](https://developers.openai.com/api/reference/resources/images/methods/edit), [OpenAI image generation](https://developers.openai.com/api/docs/guides/image-generation), [Gemini image generation/editing](https://ai.google.dev/gemini-api/docs/generate-content/image-generation).

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

For home design, choose Build to draw rooms/walls, Furnish to arrange items, and Import to trace a PNG/JPG/WebP blueprint manually. For the new calibrated image/PDF detection and optional Cloudflare reconstruction workflow, use **Plan lab**. AI drafts require local validation and manual review; no accurate conversion is claimed from merely uploading an image.

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

See [CONTRIBUTING.md](CONTRIBUTING.md). Original code and procedural furniture use the [MIT License](LICENSE). Dependencies: Three.js 0.170.0, three-bvh-csg 0.0.17, and three-mesh-bvh 0.8.3 (MIT), plus PDF.js 5.4.394 (Apache-2.0); installation copies their license notices to `dist/vendor/`. Google Fonts retain their respective licenses. No SketchUp/Homestyler source, branding, proprietary models, or paid service entitlements are included.
