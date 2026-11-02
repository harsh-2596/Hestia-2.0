# Validation — Hestia 2.0 v0.5

Current development build: **71 automated tests pass, 0 failures**. Current acceptance status and limits are recorded below; older release sections are retained as history.

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


## Release 0.4 — planning / Vastu / spherical tour

**Development release; the complete requested acceptance sequence is not yet passed.** Tested locally on Windows, Node 24.22.1, Chromium. Source contains no supplied private drawing or derived private model. Evidence files accompany the local deliverable outside this repository.

### Automated checks

60 tests pass. New cases cover calibrated raster line detection and uncertainty; rejection of empty AI conversion; Cloudflare structured JSON contracts and rejection of locked-wall proposals; baseline isolation, old-project compatibility, original restoration through history/disk; distinct constrained candidates, invalid openings, room/furniture overlap, blocked door approaches and coarse access connectivity; fixed plumbing locks; north rotation and reference frames; unknown inputs; commercial applicability; persistent conflict status after a chosen remedy; stale assessments; spherical source/result aspect validation; durable panorama revision/design metadata; Cloudflare img2img contract; local ComfyUI upload/queue/history/download contract and loopback restriction; and quota errors without fallback.

**All provider test responses are mocked.** Header-only PNG fixtures in panorama adapter tests exercise transport and metadata; they are not generated images, decoded visual-quality evidence, or shipped tour assets.

JavaScript syntax checks passed across dist, backend, server and vendor setup. Git whitespace check passed. PDF.js dependency/vendor preparation completed, with its worker, fonts, character maps and WASM copied locally.

### Browser evidence

- Imported a private manually traced copy of the supplied office plan into the actual editor; inspected the 3D building with 28 wall segments, 9 door openings and 12 fixed/drawn objects, including stairs, lift and five schematic cars. The 18 room surfaces include subdivisions of irregular waiting areas. It is labelled a **manual review draft**, not an automatically recognised or owner-approved model.
- Ran the local detector on the original raster using a cropped building area and the 71 ft 11 in width chain: **43 uncertain line candidates, 0 reliably enclosed rectangular rooms**. This failure is explicitly reported; it does not approve an empty slab or substitute a furnished sample.
- Selected a page from a synthetic PDF and rasterized it locally. Calibration at 10 m across 1000 pixels produced **5 candidate walls and 2 enclosed spaces**, shown as uncertain.
- A separately labelled **synthetic QA fixture**, not the supplied plan, showed three different validated furnishing placements and unchanged walls. Applied one in the editor, Undo removed its furnishing, Redo restored it. A new tab reopened the saved project.
- The synthetic fixture’s entrance changed from **S / Conflict** at north 0 degrees to **N / Aligned** at north 180 degrees using the real input form. Unknown central-obstruction input stayed Unknown. The fixed entrance report showed the constraint, lighting/access adjustment, optional belief-based symbolic motif, source and unresolved limitation.
- The supplied office context excluded residential rules as **Not applicable**. A spherical model capture rendered in the continuous look-around viewer with no browser shader errors. The UI labelled it **no AI generation** and kept actual generation disabled until model/brief approval.

### Acceptance matrix

| Requested evidence | Current result |
| --- | --- |
| Original / detected overlay / approved 3D | Private overlay and manual editable draft produced; owner approval and automatic semantic accuracy pending |
| Different alternatives with locked elements | Passed deterministic tests and synthetic browser fixture; not yet passed on an approved supplied-plan model |
| North rotation / Unknown / commercial exclusion | Automated tests pass; rotation and commercial exclusion also checked in browser |
| Fixed conflict, practical adjustment, sourced belief-based remedy, unresolved status | Passed synthetic browser fixture and status-handling tests |
| User edits, history, save/reopen, original recovery | Automated persistence/isolation/history tests pass; apply/undo/redo/reopen checked in browser |
| Real provider-generated panorama tied to selected revision | **Pending** — no Cloudflare token/account or local checkpoint configured |
| Whole-floor AI tour quality | **Pending** — intentionally gated behind real one-room approval |

### Remaining limits

The offline detector recognises straight raster line evidence and rectangular enclosures. It does not semantically identify arbitrary openings, curved/diagonal walls, stairs, lifts, cars or dimension text. Cloudflare vision is connected as a reviewable structured-draft adapter, but live recognition has not been tested. Manual rectangular subdivisions do not constitute a polygon/topology reconstruction engine. Schematic fixed features are not engineering geometry, and the private tracing leaves levels and exact opening widths for review.

Local recommendations mainly change furnishings. Cloudflare proposals preserve existing room surface boundaries and walls in this implementation; broad partition redesign, polygon room changes and service feasibility are not solved. The coarse 0.2 m connectivity grid is not an accessibility, structural or fire-code check. A Vastu-oriented candidate may retain conflicts under locked constraints; no improvement or universal compliance score is promised.

Panorama generation uses general img2img models and a geometry-conditioned spherical source. A successful 2:1 image is not proof of correct seams or dimensions. Paid adapters remain available for flat renders; the two new adapters are Cloudflare and local ComfyUI. Their free allocation/hardware requirements and setup are documented in AI-SETUP.md. No provider quota/billing access or real inference was exercised. Material inspection reads saved specifications, supports user corrections and labels stored AI estimates unverified; automatic visual material inference is not implemented.


## Release 0.5 — curated Auto Free

71 automated tests pass. New unit/integration cases cover curated allowlisting, required input/output modalities, unknown/nonzero price rejection, panorama size checks, real completed-job quality gates, task isolation, persisted approvals and revocation, catalogue failure/price-change blocking, pinned model choice, ImageRouter source-conditioned ephemeral output, quota failures without retries, OpenRouter zero-price caps, actual provider/model metadata, key-free HTTP responses and authenticated quality-write routes. All generated-image responses in automated tests are mocks; they do not establish actual model quality.

Browser verification used the live public ImageRouter catalogue, which showed both shortlisted candidates at zero advertised price with image editing/custom size. The actual AI models panel showed both as needing real-output review, with no falsely approved model. The AI tour selector and Plan lab provider selector were checked. No ImageRouter/OpenRouter inference request was made without credentials, and no image-quality approval was preloaded. The source archive excludes keys, model-quality records and private plan data.


## Fixed-feature review correction

77 automated tests pass. Malformed fixed features are retained with raw evidence and field-level issues in an unapproved review queue; valid rooms and walls remain editable. Approval requires correction or a reasoned exclusion. Duplicate IDs, missing dimensions, unsupported types, false resolution states and invalid core geometry are tested. Missing floor bookkeeping is explicit; building dimensions are never invented. Raw AI plan proposals are saved privately before validation when returned. A live supplied-plan retry encountered a separate floor-record failure; a subsequent attempt timed out before returning a proposal. No successful live reconstruction is claimed.


## Release 0.6 — local geometry and resumable conversion

96 automated tests pass locally. Added coverage includes concave polygon triangulation and holes, 5 cm snapping without chained drift, the 21.9202 m calibration, local raster concavity, offline jobs, durable stage/geometry recovery, explicit restart resume, successful-region caching, invalid JSON retention, invalid opening queues, correction revision conflicts, approval gates and same-origin HTTP controls. Existing model/CAD/history/export/provider tests remain passing. Automated provider responses are mocked.

Private supplied-drawing check: calibrated 71′11″ to 21.9202 m across 686 pixels, cropped at (180,50), size 688×642. Local processing found **43 wall candidates and 9 valid unclassified raster-space polygons**. Two ambiguous boundaries were preserved in the correction queue. A stricter polygon check removed one previously accepted self-touching contour. Source image → detected overlay → actual Three.js 3D scene were inspected in the browser. The saved draft was reopened from PC workspace and displayed the persistent partial-draft badge. A room-name edit, Undo and Redo were checked in the browser. Alternatives remained disabled pending approval.

Live Cloudflare check used only the cropped drawing, not its consultant title block: room-label extraction completed with 89 output tokens, finish reason stop. It proposed two labels; the other spaces remain unclassified. Labels are not human-approved semantic truth. Earlier network/empty-output failures retained all local geometry. Disabling thinking for this compact Cloudflare task yielded a supported JSON response within the 1,500-token limit. No automatic retry or paid-provider fallback occurred.

This is **partial reconstruction, not successful full conversion**. Stores and upper wall lines have useful draft evidence; waiting areas, entrance openings, both stairs, lift details, toilet, guard room boundaries, five parking positions and ramps are not all accurately reconstructed. Raster enclosures can be door-swing or symbol artifacts. Fixed objects and openings require explicit stage proposals and correction; automatic complete recognition and owner approval are outstanding. Heights, levels and north remain unconfirmed. There is no new live panorama acceptance claim in this release. Private drawing/project/job/raw-response files and screenshots are excluded from public source.
