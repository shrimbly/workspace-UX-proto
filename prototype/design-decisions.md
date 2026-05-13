# Prototype design decisions

Append-only log of design decisions made while building the prototype, cross-referenced to the IA wiki.

Each entry follows the format:

```
## [YYYY-MM-DD] <topic>

Decision: <what we chose>
Reason: <why>
Wiki link: <which wiki entry this implements, supports, or extends>
Open question dependency: <if it depends on a Proposed answer, link the open question>
Promote? <yes / no / maybe — should this become a formal wiki decision?>
```

When an entry's "Promote? yes" cell is ticked AND the team has confirmed the position, raise a new decision page in `../IA_Plan/wiki/decisions/` referencing this log entry.

---

## [2026-05-12] Project tiers — retire user-creatable Private; rename Scoped → Restricted

Decision:

- User-creatable project visibility tiers are `workspace-wide` and `restricted`. `private` is reserved for the auto-created Drafts shape only.
- "Scoped" is renamed "Restricted" in product language.
- Visibility rule splits: inaccessible workspace-wide projects render grayed (let users see structure they're missing); restricted projects the user wasn't invited to are hidden entirely (confidentiality).

Reason: Willie's framing of the use case — "two people working on a client project, the rest of the team isn't allowed to see this stuff" — is `scoped` in the wiki, not the single-user Private tier. The single-user Private tier has no use case Drafts doesn't already cover. "Scoped" is a technical name; "Restricted" carries the confidentiality intent.

Wiki link: `../IA_Plan/wiki/prototype-log.md#flow-01-dashboard` (Working decisions made this pass, 2026-05-12 entry). Partially closes `project-visibility-lifecycle` open question.

Open question dependency: Surfaces a new question — should workspace Admins see _that_ restricted projects exist (without contents) for billing/audit? Currently no.

Promote? yes — if Willie confirms, propagate the rename through `concepts/three-level-permissions.md`, `entities/project.md`, and the related open questions; add a formal `wiki/decisions/project-tiers-restricted-rename.md`.

## [2026-05-12] Library group + Templates collapse into Comfy Hub + Workspace Library not user-facing

Decision:

- The sidebar surfaces asset types directly under a new `LIBRARY` group: Media assets, Models, Nodes, Prompts. Each is its own browser inside the workspace.
- "Workspace Library" is not exposed as a user-facing concept. It remains a back-end organizational notion if the wiki keeps it, but no UI surface maps to it directly.
- "Templates" merges into "Comfy Hub" — one Discover surface, one sidebar item, one entity.
- Restriction is inherited from each asset's containing project. Each library view has restriction-tier pills + a project dropdown.

Reason: Willie's framing — the user thinks in terms of "where are my media / models / nodes / prompts?", not "where is my Workspace Library?". Templates and Hub were two surfaces of the same discovery concept.

Wiki link: `../IA_Plan/wiki/prototype-log.md#flow-01-dashboard` (2026-05-12 second entry).

Open question dependency: Three wiki tensions to resolve before promotion:

1. `entities/workspace-library.md` — does the entity survive as an implementation note or get folded into Project/Asset?
2. `decisions/custom-nodes-as-configuration.md` — Nodes Library view as configuration browser vs revised "Nodes are assets too" stance.
3. `decisions/prompts-mvp-internal-future-asset.md` — Prompts Library in MVP either pushes the saveable-Prompt timeline forward, or the surface is empty/placeholder in MVP.

Promote? yes — if Willie confirms: promote the Library-group restructure + Templates-folded-into-Hub into formal wiki decisions, and resolve the three downstream tensions.

## [2026-05-13] Workspace Members surface — three tabs, per-role delegation, multiple Admins

Decision:

- The Members surface is a single page with three tabs: **Members** (list + role change + remove), **Pending** (invites with resend/revoke), **Permissions** (per-role delegation matrix).
- Delegation is **per-role baseline only** in this pass. The Permissions matrix has rows = delegable capabilities, columns = Admin / Member / Guest. Admin is always-on (locked), Guest is always-off (locked), Member is the single interactive column. No per-member overrides.
- The five delegable capabilities enumerated: `publish-direct-link`, `submit-to-hub`, `approve-hub-submissions`, `edit-allowlists`, `configure-workspace`. Billing and ownership transfer are **not** delegable.
- Multiple Admins are allowed. Member→Admin promotion exists, and so does Admin→Member demotion (both gated to Admin viewers). The Members table sorts Admins first.
- Members can invite/remove + change role for Members and Guests, but cannot act across the Admin boundary. The role-change menu hides Admin transitions when the viewer is a Member.
- The Permissions matrix is rendered read-only when the viewer is a Member (matches the wiki's "Admin-controlled" framing).

Reason: User chose per-role baseline and "multiple Admins" up front. The matrix matches the Proposed answer to `publish-direct-link-admin-gate` ("admin-controlled sharing-permissions UI with per-role grants") and is the first concrete surface for `delegation-surface-in-ui`, which the wiki flags as a prerequisite for resolving multiple open questions. Single-Admin literalism would force special-case transfer UX and contradict the FAQ language; the wiki's own working answer leans this way.

Wiki link: `../IA_Plan/wiki/concepts/three-level-permissions.md` (delegation layer), `../IA_Plan/wiki/concepts/personas-and-flows.md` (#2 Admin, #3 Member, "Send invite" flow). Surfaces the proposed first-class permission-controls UI from `../IA_Plan/wiki/open-questions.md#delegation-surface-in-ui`.

Open question dependency:

- `delegation-surface-in-ui` — the matrix **is** the surface; Proposed answer requested an enumeration of delegable capabilities, which this pass nails down to five items above.
- `publish-direct-link-admin-gate` — two of the five capabilities map directly to the Proposed per-role grants.
- `single-admin-or-many` — prototype takes the "multiple Admins" branch (matches FAQ language, contradicts the workspace-permissions doc line); needs PM resolution before promotion.
- **New question raised**: Persona #7 "Member with delegated capabilities" implies per-member overrides on top of role baseline ("two Members, different action surfaces"). This pass does **not** support that — only role baseline. Need to decide whether per-member overrides are a v2 addition or whether persona #7's framing is overreach.

Promote? maybe — promote once PM confirms (a) multiple-Admin stance, (b) the five-capability list is complete and correct, (c) per-role-only is acceptable for MVP (or list per-member overrides as a follow-on). If confirmed, raise `wiki/decisions/workspace-permissions-delegation.md` and update `concepts/three-level-permissions.md` §delegation-layer with the enumerated capabilities.

## [2026-05-13] Asset-level role model + tailored per-persona fixtures

Decision:

- Workflow type extended with three optional fields: `kind: 'workflow' | 'app'`, `ownerUserId`, and `access: AssetAccess[]` where `AssetRole = 'owner' | 'runner' | 'app-runner'`. Owner is implicit from `ownerUserId`; `access` lists non-owner grants. Editor / Viewer roles intentionally omitted (post-MVP per wiki).
- Each persona now has a tailored fixture matching the [Prototype test-coverage matrix](../IA_Plan/wiki/concepts/prototype-test-coverage.md):
  - **Workspace Member** (Alex) — independent fixture; only Personal + Comfy Org in switcher; Client X marked `currentUserHasAccess: false`; Alex has her own per-workspace My Workflows project.
  - **Project Collaborator** (Mira Voss) — narrow workspace (Comfy Org only), workspace role `guest`, only Client X visible, auto-created My Workflows in the host workspace per `fork-destination-in-host-workspace` proposal.
  - **Asset-only Guest** (Tomás Reyes) — two workspaces (Comfy Org + a new minimal Studio Atlas), workspace role `guest` in both, no project visibility, asset-only access to one workflow (Runner) + one app (App Runner), auto-created Drafts in each host.
- Q3 Launch Site reassigned to Jane Park (existing Member) so "Admin auto-Owner on workspace-wide tier, not ownership" is genuinely testable.
- Named project-scoped workflows + the first prototype app live in admin fixture with explicit Owner/Runner/App-Runner role assignments matching the matrix.

Reason: Without tailored fixtures the Project Collaborator and Asset-only Guest personas in the switcher silently reused the Admin fixture, which made the persona switcher misleading. The matrix already specifies the target shape — the fixtures now match it row-for-row, so persona switching is the primary test surface.

Wiki link: `../IA_Plan/wiki/concepts/prototype-test-coverage.md` — the matrix this implementation pass instantiates.

Open question dependency:

- `fork-destination-in-host-workspace` — the auto-created Drafts in host workspaces for Mira and Tomás encode the proposed answer (forks land in actor's My Workflows in host workspace).
- `my-workflows-scope` — Alex's per-workspace Drafts encodes the proposed answer (one per user per workspace).
- `zero-state-for-asset-only-guest` — Tomás's cross-workspace data shape is now in place; the UI surface (Shared-with-me tray) is the remaining work.

Promote? no — this entry tracks fixture state, not an IA decision. The underlying open-question answers being encoded already have entries elsewhere.

## [2026-05-13] Project Sharing panel — Drive-style General access + People with access

Decision:

- The project members surface in `ProjectDetailView` is replaced with a Drive-style **Sharing** panel composed of three sections:
  - **Add people** row (combobox suggesting workspace members not yet on the project; selecting one adds them as project Collaborator)
  - **People with access** list (explicit project members + the project Owner + workspace Admins for workspace-wide projects). Role pills are dropdowns where the viewer has authority.
  - **General access** row (tier label + description + tier dropdown — Restricted ↔ Workspace-wide).
- Drafts (`private` tier) does not surface the Sharing panel at all — Drafts is sticky-personal.
- "Anyone with the link" intentionally **not** surfaced at the project level. Publishing applies to assets, not projects (per `../IA_Plan/wiki/concepts/sharing-vs-publishing.md`). A footer note points users at asset-level sharing/publishing.
- Authority model:
  - **Change tier**: project Owner or workspace Admin (admins are auto-Owner on workspace-wide tier; we extend the privilege to admins on any tier they can see).
  - **Invite / change role / remove**: project Owner, project Collaborator, or workspace Admin.
  - **Promote to Owner**: project Owner only (collaborators cannot create new owners).
  - Implicit-via-workspace rows (workspace Admins on workspace-wide tier) are read-only — to change their role you'd promote/demote them at the workspace level.
- New `personaStore` actions: `setProjectTier`, `addProjectMember`, `changeProjectMemberRole`, `removeProjectMember`. All mutate the fixture in-place.

Reason: Willie's Drive screenshot showed the clearer pattern: a coarse "general access" policy plus an explicit "people with access" list. Our previous design — a flat members table with read-only role pills — was both less informative (no tier-change affordance) and less actionable (no role editing). The Drive translation maps cleanly onto our IA except for "Anyone with the link," which we keep separated to honor the wiki's deliberate sharing-vs-publishing split.

Wiki link: `../IA_Plan/wiki/entities/project.md`, `../IA_Plan/wiki/concepts/three-level-permissions.md` (project level).

Open question dependency:

- New question to log in the wiki: **`project-tier-change-authority`** — Who is allowed to change a project's visibility tier? Wiki is silent. Working answer: project Owner OR workspace Admin (with admin auto-Owner on workspace-wide). Affects Project Settings UX once that gets built.
- Tangential: the "Anyone with the link" decision at the project level is itself a non-decision but worth flagging — if PM later wants project-level shareable links, the Sharing panel would need to grow a third section.

Promote? maybe — promote the authority model + tier-change-from-here pattern to a formal wiki decision once PM confirms (a) project Owner + workspace Admin is the right set, (b) projects don't get a "shareable link" affordance. If confirmed, add `wiki/decisions/project-sharing-surface.md` documenting the surface shape + the authority model, and answer the `project-tier-change-authority` question.

## [2026-05-13] Workspace settings — Identity + Allowlists (rows 1–3)

Decision: First slice of the Workspace settings page is three sections: General (identity), Model allowlist, Custom-node allowlist. Subsequent slices (data/training, billing, member credit limits, Hub publishing approvals, ownership transfer, danger zone) follow the same role + delegation gating pattern.

- **General**: Workspace name + description (editable), Type pill (Personal/Team), Owner display. Admin-only edit; everyone else read-only.
- **Model allowlist** + **Custom-node allowlist**: add/remove entries with name + added-by metadata. Editable by Admin OR by Member when the `edit-allowlists` delegation is granted. Empty state renders for empty lists.
- Guests see a single empty-state stub on the page; the wiki excludes them from workspace browsing.
- Removed the placeholder "Delegations" section — that surface is already the Members → Permissions tab. A footer hint links there from non-edit personas.
- Allowlists are modeled at the fixture top level (`PersonaFixture.allowlists`), mirroring how `roleGrants` is shaped — current-workspace-scoped. Adequate for the prototype; a multi-workspace model would key them per-workspace later.
- New `personaStore` actions: `setWorkspaceName`, `setWorkspaceDescription`, `addAllowlistEntry(kind, name)`, `removeAllowlistEntry(kind, id)`.
- New reusable `AllowlistEditor.vue` component (kind-agnostic — name, description, entries, canEdit, addPlaceholder, addedByLabel).

Reason: Workspace settings was an empty placeholder. The wiki names a clear inventory (model allowlist, custom-node allowlist, data/training, billing, member credit limits) in `wiki/entities/workspace.md` §"What it contains", and `wiki/concepts/three-level-permissions.md` §"Workspace level" specifies which of those are delegable. Identity + Allowlists is the smallest first slice that exercises both the admin-only and delegable gates, and seeds the page structure that the remaining sections will plug into.

Wiki link: `../IA_Plan/wiki/entities/workspace.md` §"What it contains"; `../IA_Plan/wiki/concepts/three-level-permissions.md` §"Workspace level" + §"Delegation layer".

Open question dependency: None for this slice. Upcoming slices will depend on `per-member-credit-limits` (mechanism TBD, Proposed answer says surface required regardless).

Promote? no — this slice is a UX shape, not a wiki-level decision. The remaining sections may produce promotable decisions (e.g. how the credit-limit surface should look).

## [2026-05-13] Workspace settings — Billing + Member credit limits (rows 5–6)

Decision: Added Billing & subscription + Member credit limits sections to the Workspace Settings page. Both are Admin-only and not delegable, per `wiki/concepts/three-level-permissions.md` §"Workspace level".

- **Billing**: three cards — plan (with renew/cancel date + status badge), payment method (brand + last4 + expiry), credit balance (with progress bar + reset date) — followed by an invoice list. "Manage plan" / "Update payment" are affordance stubs; the real modals/Stripe portal are out of scope for the prototype.
- **Billing visibility**: shown whenever `fixture.billing` is populated AND viewer is Admin. Personal workspaces with a `free` plan still show the section (they are billing entities per wiki, just with a simpler shape). Local-only personas have `billing: null` and the section hides.
- **Member credit limits**: table of non-admin members with an editable limit (number input) + period (monthly/weekly/one-time) + a usage progress bar. Setting limit to 0 clears the row; "Clear" button explicit alongside.
- **Credit-limit gating**: only shown on **team** workspaces. Hidden on personal workspaces since the wiki frames it as a multi-member governance tool.
- **Mechanism-TBD copy**: an italic note states enforcement is unresolved (hard block / soft warn / pre-charge). This honors open-q `per-member-credit-limits`, whose Proposed answer is "surface required regardless of mechanism."
- **Ownership note**: a one-line italic footer reminds the admin that billing does **not** auto-transfer with workspace ownership, per the wiki Lifecycle section.
- New types: `Subscription`, `PaymentMethod`, `CreditBalance`, `Invoice`, `WorkspaceBilling`, `MemberCreditLimit`, `CreditLimitPeriod`.
- New store actions: `setMemberCreditLimit`, `removeMemberCreditLimit`.
- New components: `BillingSection.vue`, `MemberCreditLimitsSection.vue`.

Reason: Continues the Workspace Settings build order. Billing is the most-named-but-least-specified surface in the wiki, so we stayed display-only — enough to demonstrate IA shape without speculating on plan UX. Per-member credit limits is the only open question whose Proposed answer explicitly commits to a UI requirement, so we built the surface and labelled the mechanism gap.

Wiki link: `../IA_Plan/wiki/entities/workspace.md` §"What it contains" + §"Lifecycle"; `../IA_Plan/wiki/concepts/three-level-permissions.md` §"Workspace level"; `../IA_Plan/wiki/open-questions.md#per-member-credit-limits`.

Open question dependency: `per-member-credit-limits` (mechanism TBD) is the only live dependency. Adjacent open question to flag back to the wiki: **billing-entity-shape-on-personal-workspaces** — does a Personal workspace see the full billing surface, or a stripped-down one (e.g., only credit balance, no invoice list, no member limits)? Working answer in this prototype: full surface, but the member-limits section auto-hides on personal tier.

Promote? no — this is UX shape, not a wiki-level decision. Promotable bits surface once we hear back on the billing-on-personal question.

## [2026-05-13] Workspace settings — Data/training, Hub queue, Ownership, Danger zone (rows 4, 7, 8, 9)

Decision: Completed Workspace Settings page with the remaining four sections.

- **Data & training policy** (row 4): single opt-out checkbox stored on `Workspace.dataTrainingOptOut`. Editable by Admin OR by Member with `configure-workspace` delegation.
- **Hub publishing approval queue** (row 7): list of pending submissions with Approve/Reject buttons. Editable by Admin OR by Member with `approve-hub-submissions` delegation. Both actions remove the item from the queue (the prototype does not yet distinguish "approved → published" from "rejected → removed").
- **Workspace ownership** (row 8): dropdown of other Admins + Transfer button. Hidden on personal workspaces. Confirm prompt before transfer. Footer reiterates the wiki rule that billing does **not** transfer with ownership.
- **Danger zone** (row 9): Delete button with confirm prompt. Hidden on personal workspaces. On delete, switches the current workspace to the first remaining one in the fixture.
- **No new components** — all four sections inlined in `SettingsView.vue` since each is small and section-specific.
- New types: `HubSubmission`, `Workspace.dataTrainingOptOut`.
- New store actions: `setDataTrainingOptOut`, `approveHubSubmission`, `rejectHubSubmission`, `transferOwnership`, `deleteCurrentWorkspace`.
- Fixture seed change: moved the prior Pablo credit-limit row to `user-alex` (Pablo is an Admin and admins are filtered out of the credit-limits table); added 3 Hub submissions.

Reason: Closes out the Workspace Settings page per the build order. Data/training and Hub queue both exercise the delegable-grants pattern in a different shape (checkbox + queue), giving the persona toggle visible behavioral surface area. Ownership transfer + danger zone exercise the Personal-vs-Team gating from `wiki/entities/workspace.md` §"Lifecycle" — personal workspaces cannot be deleted or transferred.

Wiki link: `../IA_Plan/wiki/entities/workspace.md` §"What it contains" + §"Lifecycle"; `../IA_Plan/wiki/concepts/three-level-permissions.md` §"Workspace level" (data/training, Hub approval, transfer, delete).

Open question dependency: None new. Adjacent gaps surfaced by building this:

- **Hub queue resolution states** — wiki is silent on whether rejections need a reason, whether items are revisable, whether approvals show in a history. Prototype treats both as terminal removal; flag if PM wants richer state.
- **Self-transfer guard** — wiki says "between Admins" but is silent on whether the sole Admin must promote a Member before transferring. Prototype enforces this implicitly by requiring at least one other Admin in the dropdown.

Promote? maybe — once PM confirms the Hub-queue resolution model and self-transfer rule, both could feed a small formal decision page.

## [2026-05-14] Local-only — surface Create-a-workspace CTA in the workspace switcher slot

Decision:

- For Persona 1b (Solo creator — local-only), the slot at the top of the sidebar that normally holds the workspace switcher chip is now occupied by a dashed-outline **Create a workspace** CTA (`WorkspaceCreateChip.vue`). Previously, this slot was empty for local-only personas.
- Visual treatment: dashed border around the whole chip; plus-icon avatar (dashed square placeholder) where the colored workspace avatar normally sits; "Create a workspace" as the primary line; one-line subtitle hinting at the cloud value ("Sync, collaborate, share").
- The CTA is presentational in the prototype (no handler); in product it would route to sign-up / new-workspace creation.

Reason: The wiki's current position (`concepts/personas.md` §1b) lists the workspace switcher under **NOT seen**, and `concepts/personas.md` further says "**Workspace concept invisible in the UI** — there's nothing to switch between and no one else to share with." That keeps the team/sharing/permissions concepts hidden — good — but it also leaves the local user without any discoverable entry point to the cloud upgrade path. Putting a single, intentionally-low-density CTA in that slot threads the needle: it doesn't introduce members, sharing, or projects, but it does make the "you could have a workspace" affordance visible and ambient instead of relying on a separate Settings or banner surface.

Wiki link: `../IA_Plan/wiki/concepts/personas.md` §1b — Solo creator — local-only; `../IA_Plan/wiki/concepts/local-vs-cloud-integration.md`; `../IA_Plan/wiki/open-questions.md#workspace-label-in-local-only`.

Open question dependency:

- Lightly touches `workspace-label-in-local-only` — the open question asks what label the local user sees where "<Username>'s Workspace" would normally render. By replacing that slot with a CTA we sidestep the labeling question for the populated state but introduce a new shape (an _unpopulated_ workspace slot) that the question didn't anticipate. Worth recording so the next pass on that open question accounts for both modes.
- New question to log in the wiki: **`local-only-upgrade-affordance`** — Should the local-only sidebar surface an explicit upgrade/sign-in entry point in the workspace switcher slot, or should the upgrade path live elsewhere (Settings, top-bar user menu, contextual nudges)? Working answer in this prototype: yes, in the switcher slot, as a passive dashed-outline CTA. Affects how prominent the sign-up path becomes in the local-first experience.

Recommended wiki updates (for IA_Plan, not made from this repo):

1. `wiki/concepts/personas.md` §1b "What they see" — move the workspace switcher off the **NOT seen** list and add a bullet under "What they see" describing the Create-a-workspace CTA in its slot. Cross-ref the new open question.
2. `wiki/open-questions.md` — add `local-only-upgrade-affordance` with the working answer above.
3. Optionally revisit `workspace-label-in-local-only` to clarify it now only covers the **populated** workspace slot for the local persona (which still isn't displayed).

Promote? maybe — promote once PM confirms (a) the CTA belongs in this slot vs. a different surface, (b) the subtitle copy ("Sync, collaborate, share") strikes the right tone for the cold local user, and (c) clicking the CTA should kick off sign-up + workspace creation as a single flow rather than two steps.
