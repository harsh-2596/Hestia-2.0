# Validation — Hestia 2.0 v0.3

Verified on Windows with Node.js 24.22.1 and a Chromium browser. This records the core CAD/local workspace release; it is not a certification of full SketchUp Pro compatibility.

## Automated checks

`node setup-vendor.mjs` completed successfully. `npm test` passed **27 tests, 0 failures**:

- Original project geometry, openings, validation/serialization, bounded undo/redo and procedural furniture dimensions.
- Concave profile extrusion and negative depth, invalid/self-intersecting profiles, inset/outset collapse rejection.
- Shared component definitions and make-unique isolation; flat grouping and locked-selection guards; snapping.
- Box union/difference/intersection verified against expected volumes (12, 4 and 4 cubic meters), reflected winding and volume.
- Backward-compatible projects, invalid CAD transforms/IDs and camera orientations, DXF meter header/line entities.
- Disk records survive store recreation, component persistence, stale/concurrent write rejection, history retention and restoration as a new revision.
- HTTP save/load, required revision headers, malformed JSON and cross-origin rejection.
- Unchanged autosaves avoid extra disk revisions and unload prompts.

JavaScript syntax checks passed for the changed editor, CAD module, workspace client and backend. `git diff --check` passed after normalizing package file line endings.

## Browser workflow evidence

- Added a box, made it a component, duplicated it and edited shared height to 1.6 m; saved the component to the PC library.
- Selected both linked instances, applied Subtract, then Undo restored both objects.
- Changed parallel projection, Top view and section clipping; saved a named scene.
- Drew a rectangle in the plan and extruded it to 2.4 m; used the 3D translation gizmo and observed X change from 14.1 to 14.9 m in the inspector.
- Reloaded the app successfully: three CAD objects remained, with no unchanged-save unload prompt.
- Reopened the PC component library and inserted the saved component.
- Imported a small OBJ tetrahedron through the actual file picker; the model appeared as static geometry with transform/color controls.
- Downloaded DXF linework and an A3 1:100 SVG through the Files panel.
- PC workspace listed revisioned disk projects. Recovery/restart/conflict behavior was exercised by automated backend tests.
- No browser warning/error logs were reported during the exercised modeling flows.

Screenshots of the local modeling workspace and PC storage interface accompany the delivered source archive outside the repository. They show the QA sample, not personal blueprints.

## Limits of this validation

This is targeted functional coverage. It does not establish professional modeling accuracy, exhaustive boolean robustness, every import/export variant, all GPU/browser combinations, multi-process file-store safety, production web security, or parity with SketchUp/LayOut/Trimble services. Native CAD formats, topology editing, cloud accounts and other missing work are explicitly listed in [FEATURES.md](FEATURES.md). The server must remain local and one process must own each data directory.

## Release 0.3 — interior experience verification

All **37 automated tests pass**. The additional checks cover walk movement through doors versus blocked walls and floor boundaries, reference-finish validation/round trips, image/request validation, OpenAI-compatible multipart and native Gemini request/response contracts, sanitized provider errors, durable image jobs, interrupted-job handling, concurrency guards, key-free status responses and image downloads. Windows status polling initially exposed an EPERM rename race; active jobs now serve status from memory and atomic metadata replacement retries transient file locks.

Browser checks exercised eye-level navigation, room jumps, model-view capture, wall-mask capture, missing-key guidance, reference-image upload and finish application in the actual 3D scene. A separate local service labelled **TEST FIXTURE (no AI)** echoed screenshots only to exercise the gallery, comparison and four-directions-per-room tour UI. It makes no external requests and is not part of the delivered source. No fixture is presented as an AI render.

No real provider key was configured, so live paid image quality, account access, quota and cross-view consistency remain unverified. The release provides configured API adapters and honest connection/error states rather than claiming a generated AI house exists. Linked AI viewpoint images are not a seamless 360 panorama or newly reconstructed 3D geometry.
