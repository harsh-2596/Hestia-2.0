# Contributing to Hestia 2.0

1. Fork and clone this repository.
2. Run `npm ci` to install the pinned dependency.
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
- Check narrow/wide layouts, keyboard focus, reduced motion, and 2D fallback.

Bug reports should include expected/actual behavior and reproduction steps. Prefer sample geometry or anonymized plans over private blueprints.
