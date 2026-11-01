# Feature coverage and remaining work

Hestia 2.0 v0.2 delivers a first integrated modeling release. **Full SketchUp Pro parity is not delivered.** The following maps the requested professional workflow to actual implementation rather than treating UI buttons as feature completion.

| Capability | Delivered behavior | Remaining scope |
| --- | --- | --- |
| Drawing | Planar lines, rectangles, circles and simple polygons; numeric dimensions; wall endpoints/midpoints, grid and axis snapping | Arcs, freehand, rich inference engine, edge/face topology editing and arbitrary drawing planes |
| Solid creation | Box, cylinder, sphere; positive/negative profile extrusion; simple polygon offset; curved pipe path | Interactive per-face Push/Pull, arbitrary Follow Me/sweep, lofts, holes in profiles, face intersections |
| Transforms | XYZ gizmos, exact translation/rotation/scale, mirror, duplicate, multi-selection | Arrays, full protractor/tape-measure inference, arbitrary pivot tools; nonuniform group transforms can lose shear |
| Organization | Flat groups, tags, hide/lock, linked component geometry and make-unique | Nested scene graph, dynamic/live-component formulas, externally referenced assemblies |
| Materials | Existing floor finishes/furniture colors; CAD instance color; textured/mono/wireframe/x-ray display | CAD texture authoring, UV editing, style builder, sketch edges, photorealistic rendering |
| Solid operations | Experimental mesh union, subtract, intersect | Robust solid kernel, trim/split/outer-shell workflows, watertightness repair, production CAD precision guarantees |
| Cameras and scenes | Standard views, parallel/perspective cameras, saved cameras/view settings, visual clipping plane | Capped sections, section drawings, scene animation and video export; scenes do not snapshot per-tag visibility |
| Documentation | Single scaled A3 SVG plan and existing PNG/schedule exports | LayOut-like multi-page editor, linked model viewports, associative dimensions, title-block templates, PDF publishing |
| Formats | Static self-contained GLB/OBJ/STL import; GLB/OBJ/STL export; limited planar DXF export; full project JSON | Native SKP, DWG, DXF import, IFC/BIM, DAE/FBX and other professional translators; no claim of file-format compatibility |
| Local backend | Disk projects/components, validated writes, revision conflicts, latest 20 recovery revisions, restoration, browser recovery | Database indexing/search, migrations across future schema versions, multi-user access, encrypted backups/cloud sync |
| Extensions/ecosystem | Original procedural assets and a local reusable model library | Ruby/C API compatibility, Extension Warehouse, 3D Warehouse, Trimble Connect, third-party extension execution |
| Site/context | Manual blueprint tracing and independent floors | Geolocation, terrain, aerial imagery, point clouds, energy/analysis integrations |
| AI/mobile/collaboration | Browser app with responsive home interface | AI generation/credits, native iPad/AR, live collaboration, shared permissions and team accounts |

## Evidence and basis

The reference scope was checked against official product documentation:

- [SketchUp Pro plan](https://www.sketchup.com/en/plans-and-pricing/sketchup-pro) and [SketchUp Pro help](https://help.sketchup.com/fr/admin/sketchup-pro): the offering spans desktop modeling, LayOut, web/iPad and connected ecosystem services. These cannot be represented as a single completed modeling panel.
- [SketchUp toolbars](https://help.sketchup.com/pt-br/sketchup/toolbars): drawing, modification and solid tools inform the modeling categories above.
- [Data exchange with other modeling tools](https://help.sketchup.com/en/sketchup/using-sketchup-data-other-modeling-programs-or-tools) and [CAD file import/export](https://help.sketchup.com/en/sketchup/importing-and-exporting-cad-files): professional translators are separate work; limited Hestia DXF output does not imply native CAD interchange parity.
- [three-bvh-csg source and limitations](https://github.com/gkjohnson/three-bvh-csg): Hestia uses its experimental triangle-mesh booleans, which require suitable closed, manifold geometry and can have precision/geometry edge cases.

Implementation evidence is in `dist/cad-data.js`, `dist/cad-geometry.js`, `dist/cad-studio.js`, `dist/workspace-client.js`, and `backend/workspace.mjs`; the executable checks are in `tests/`. See [VALIDATION.md](VALIDATION.md). All original home-design tools continue to use the same document and history.

## Suggested next implementation order

1. Edge/face topology, arbitrary work planes and direct face extrusion; then sweep/Follow Me and robust profile holes.
2. Nested groups/components, transform/inference improvements and dynamic parameters.
3. Multi-page document editor, dimensions, model-linked viewports and PDF output.
4. Dedicated import/export adapters with fixture-based interoperability tests; evaluate vendor SDKs/licenses for native proprietary formats.
5. Separate authenticated services for shared libraries, collaboration, geolocation and AI integrations, with explicit account/service configuration.

This order is a development roadmap, not a statement that those capabilities already work. It includes no delivery-time estimate.
