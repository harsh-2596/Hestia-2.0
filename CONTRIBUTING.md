# Contributing to Hestia 2.0

1. Fork and clone this repository.
2. Run `npm ci` to install the pinned dependencies and prepare browser modules.
3. Run `npm start` and open http://127.0.0.1:4173.
4. Make changes on a feature branch.
5. Run `npm test` and verify the affected workflow in a browser.
6. Open a pull request describing the behavior change and validation.

## Conventions

- Store geometry in meters. Unit preferences affect display only.
- Keep project files backward compatible or introduce an explicit migration.
- Validate imports and preserve undo/redo and autosave.
- Include meaningful tests for geometry and data changes.
- Preserve license notices. Do not add unlicensed models, textures, or images.
- Keep credentials, deployment identities, personal blueprints, and browser data out of source control.
- Do not patch vendored files casually. Upgrade the Three.js package lock, browser modules, and license together; rerun tests and browser checks.

## Manual checks

- Add, move, resize, rotate, duplicate, recolor, and delete furniture in 2D/3D.
- Draw rooms/walls, place openings, verify dimensions, and test undo/redo.
- Import a blueprint image, calibrate it, and export/reopen a project JSON.
- Switch units without altering physical dimensions.
- Export PNG, GLB, JSON, and CSV.
- Draw/extrude profiles, transform with the gizmo, test linked components and solid operations, and reopen the JSON.
- Save/open a PC project and library component, restore a revision, and check two-tab stale-save conflicts.
- Verify OBJ/STL, planar DXF and A3 sheet output within their documented limits.
- Keep `.hestia-data` and test/user projects out of commits. Use one server process per data directory.
- Check narrow/wide layouts, keyboard focus, reduced motion, and 2D fallback.

Bug reports should include expected/actual behavior and reproduction steps. Prefer sample geometry or anonymized plans over private blueprints.

## Interior experience checks

- Walk through each sample room; test door passage, wall blocking, map jumps, mouse look, keyboard controls and exit back to model editing.
- Upload/crop a reference, apply to a wall and floor, undo, export/reopen, and reload after disk autosave.
- With no keys configured, confirm clear setup guidance and no external requests. Keep keys out of source and browser storage.
- Test provider adapters with transport fixtures. Label any fixture output explicitly; never present it as AI generation.
- With a separately authorized provider account, test model/reference/mask inputs, a single render, comparisons/downloads, and explicit batch start/stop. Report live-quality verification separately from fixture checks.
