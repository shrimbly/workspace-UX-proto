# Prototype flow index

Catalog of every flow being prototyped here. Each entry links the live route, the source file(s), and the wiki entries the flow implements.

When adding a new flow:
1. Add a row to the table below.
2. Add a plan in `prototype/flows/<NN-name>.md`.
3. Add the cross-reference header comment at the top of the source file(s) (see `WORKSPACE-UX-PROTO.md` §2.4).

## Flows

| # | Flow | Route | Source | Wiki entries implemented | Status |
|---|---|---|---|---|---|
| 01 | Dashboard / home (persona-driven) | `/prototype/dashboard` | `src/prototype/pages/Dashboard.vue` | `concepts/personas-and-flows.md`, `decisions/drafts-as-default-private-project.md`, `entities/workspace.md`, `entities/project.md` | not started |

*(Add rows as flows are built. The dashboard is the anchor — every other flow gets cheap state from it via the persona toggle.)*

## Roadmap (from IA wiki review)

Priority candidates beyond the dashboard, per `../IA_Plan/wiki/concepts/personas-and-flows.md`:

- **02 — First-run as Solo Creator** — signup → first workflow saved in Drafts → first run
- **03 — Solo → Team transition** — invite collaborator → promote Drafts asset → visibility tier pick → invitee accepts
- **04 — Accept invite as Project Collaborator** — narrow workspace view + gray-out
- **05 — Fork a workflow as a Guest** — lands in actor's Drafts in host workspace
- **06 — Run a Hub workflow** — current-workspace prominence, credit attribution
- **07 — Switching workspaces** — Figma-style left-panel switcher
- **08 — Delegating publishing capability** — admin permission-controls UI

Pick the next flow based on what the dashboard surfaces as the highest-friction next-click.
