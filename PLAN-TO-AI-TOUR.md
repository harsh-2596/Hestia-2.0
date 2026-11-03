# Hestia 2.0 — From Uploaded Floor Plan to AI Interior Tour

**Branch:** `feature/spatial-intelligence-mvp`. The UI theme is unchanged. This is a guided, review-first workflow, not a one-click guaranteed architectural reconstruction.

## Before starting
1. Back up the current design using **Project → Download backup**. Importing another project replaces the current one.
2. In the Hestia checkout, run `git switch feature/spatial-intelligence-mvp`, `git pull --ff-only origin feature/spatial-intelligence-mvp`, `npm.cmd ci`, `npm.cmd start`. Open `http://127.0.0.1:4173`. Back up or stash local edits before switching branches.
3. For optional plan recognition, configure `OPENROUTER_API_KEY` or Cloudflare credentials privately in `.env`, then restart. OpenRouter vision only proposes detections; it does **not** generate AI tour panoramas.
4. For **AI tour panorama generation**, independently configure a panorama-capable provider: Cloudflare Workers AI, supported local ComfyUI image-to-image, or ImageRouter Auto Free after qualifying a panorama model through **AI models**. See `AI-SETUP.md`. Using a provider may involve quotas, API billing, or local GPU resources.

## Upload and review geometry
1. In **Project**, create a blank home so the sample walls do not overlap your drawing.
2. Open **Plan lab → 1 · Detect → Choose plan / PDF** and select the PDF page or image.
3. For a full architectural sheet, use **Suggest plan-only crop** as a starting point. Inspect the cyan boundary: retain *all* walls, guard room, stairs, parking, ramps, and entrance; exclude the title block and document border. Correct crop fields manually if needed.
4. Calibrate using two endpoints of a known dimension. For the supplied Mathura ground-floor drawing, the top **71′11″** span corresponds to **21.9202 metres**. Click the two dimension endpoints on the currently loaded image. Do not copy pixel values from another image resolution.
5. Use **Draw non-wall regions** to exclude obvious car silhouettes, annotations and other non-structural artwork *from local wall evidence*. The original source drawing is preserved; AI symbol analysis uses the source image.
6. Click **Detect draft walls**. Orange lines are **candidates**, not verified construction walls. Review the results before proceeding.
7. Click **Save / resume conversion stages**; choose **Cloudflare** or **OpenRouter** in the Plan and design AI provider selector if configured. Optional stages include **Run / resume labels**, **Run / resume openings**, **Run / resume fixed objects**, and **Recognize TVs, sofas, beds, pantry, stairs and windows**. Each stage may take time and needs explicit user action. Click **Refresh stage progress / load saved geometry** to inspect results.
8. Use **Open draft in editor**. **Build** and the 2D plan editor are the authority for actual wall and doorway geometry. Correct false walls from cars, straighten/snap real walls, connect legitimate room boundaries, and add missing rooms. Use **Add a doorway** and **Add a window** on the correct wall. In the Mathura example, both guard room doors belong on the *left and right side walls* near its rear corners; neither is cut into the horizontal rear wall.
9. Open **Plan lab → 2 · Review**. In the architectural symbol review cards, confirm positions/dimensions before placing TV, three-seat sofa, bed with bedside tables, pantry slab or car. For stairs, confirm the rise before placing the simple 3D steps. Window proposals require adding the opening in a real wall first; mark them reviewed with a reason. Wrong guesses should be explicitly excluded.
10. Ensure walls, enclosed room polygons, openings and fixed building features are correct. Resolve or exclude remaining uncertain observations with reasons. Confirm measurements and elements, then choose **Approve editable original**. Without actual room polygons and valid reviewed walls, approval cannot succeed.

## Create a design brief
11. Open **Plan lab → Interior brief** (the tab can be selected directly after the original is approved). Choose a style such as *Quiet contemporary*; enter a verified ceiling height, materials, lighting, retained furnishings, and any custom instructions. **Approve design brief**. This locks the brief to the current layout fingerprint. Changing the floor later makes earlier panoramas stale.
12. Before panorama generation, confirm **Item library** placement of the sofa, bed set, TV, pantry slab and parking cars. Ideally complete these placements **before** approving the design brief in step 11; if you edit the scene afterward, approve a fresh brief for the updated layout before generating an AI tour.

## Explore and generate AI tour
13. Choose **Explore → Walkthrough → Enter walkthrough** to inspect the actual editable 3D scene at eye level. Use **WASD/arrow keys** to move, **drag** to look around, **Q/E** to turn. Exit walkthrough after checking walls and doors. This is the true free-moving 3D model.
14. Open **AI tour** in the navigation rail. Choose a **configured** provider. Cloudflare needs `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`. ComfyUI needs `HESTIA_COMFYUI_URL` and `HESTIA_COMFYUI_CHECKPOINT`, and ComfyUI must be running. Auto Free needs `IMAGEROUTER_API_KEY` and a previously qualified panorama model in **AI models**. OpenRouter alone cannot run this step.
15. Choose a room (ideally a room with reviewed walls and furnishings), then click **Preview spherical model capture (no AI)**. Drag to inspect the full 360° geometry. This preview is available without spending provider quota.
16. When the original and current brief are approved, click **Generate one room panorama**. Hestia submits the spherical capture to the selected image provider. Monitor the job status. Do not assume a completed image means geometry is accurate.
17. Click **Look around 360°** on the completed job. Inspect all four directions, door and window positions, room scale, visual continuity, the left/right seam and furniture placement. If acceptable, click **Approve this room as pilot**. Otherwise, revise the layout, brief, or provider and generate a new pilot.
18. After pilot approval, **Extend approved design across floor** becomes available. Confirm the separate requests and quota implications. Hestia generates remaining room panoramas; it stops on error and does not silently switch providers.
19. View completed rooms in **AI tour** using the room navigation chips, drag-to-look, zoom, and doorway hotspots where corresponding room panoramas exist.

## Important distinctions and troubleshooting
- **AI tour** = AI-rendered room-by-room spherical panoramas. It is **not a fully navigable AI-generated 3D mesh**. **Explore → Walkthrough** = freely moving through your real 3D Hestia project.
- **Generate disabled:** complete **Approve editable original** and **Approve design brief** for the current unchanged layout.
- **No rooms available:** create/repair real room polygons in Build or Plan lab Review. A pile of unverified wall segments does not create a usable room station.
- **Not configured:** set the appropriate `.env` keys, restart Node, and verify provider status. Never enter keys in the browser, public repo or chat.
- **Stale:** your layout or brief has changed; capture/generate new results after reviewing changes.
- **Wrong sofa, bed, TV, pantry or staircase:** correct or exclude the proposed detection in Plan lab Review; AI model results are **unverified proposals**, not guaranteed classifications.
- **Incorrect windows or doors:** edit their **host walls** in Build; placing an opening symbol near a wall is not sufficient.
- **Cloudflare 401/403/429:** review account/token/model permissions and quotas. No automatic paid fallback.
- **Panorama distortion:** this can occur with general image models even if the spherical output has the expected 2:1 resolution; check the seam before pilot approval.
- **Backups:** export the project **and** back up `.hestia-data/` to preserve separate AI jobs, model-quality approvals and panorama images.

For provider-specific instructions and supported model constraints, read `AI-SETUP.md`.
