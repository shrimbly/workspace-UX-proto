// Implements:
//   persona:  ../IA_Plan/wiki/concepts/personas.md — Tier 1, #5 Asset-only Guest
//   concept:  ../IA_Plan/wiki/concepts/three-level-permissions.md
//   matrix:   ../IA_Plan/wiki/concepts/prototype-test-coverage.md
//             — Tomás has Runner on "Coke can hero" in Comfy Org and
//               App Runner on "Brand color tuner" in Studio Atlas.
//   open-q:   ../IA_Plan/wiki/open-questions.md#zero-state-for-asset-only-guest
//             — Multi-workspace tray exercises the unresolved zero state.

import { adminFixture } from './admin'
import type {
  PersonaFixture,
  Project,
  Workflow,
  Workspace,
  WorkspaceMember
} from '../types'

const tomasId = 'user-tomas'

const tomasMember = adminFixture.members.find((m) => m.id === tomasId)

const tomasUser = tomasMember
  ? { id: tomasMember.id, name: tomasMember.name, email: tomasMember.email }
  : { id: tomasId, name: 'Tomás Reyes', email: 'tomas@cocacola-creative.com' }

// Comfy Org from Tomás's vantage: Guest at workspace level.
const comfyOrgForTomas: Workspace = {
  ...(adminFixture.workspaces.find((w) => w.id === 'ws-comfy-org') ??
    adminFixture.workspaces[0]),
  currentUserRole: 'guest'
}

// Second workspace — exists in the model only to demonstrate the
// multi-workspace asset tray. Minimal inhabitants: Tomás (Guest) and an
// unnamed Admin (not surfaced).
const studioAtlas: Workspace = {
  id: 'ws-studio-atlas',
  name: 'Studio Atlas',
  tier: 'team',
  ownerUserId: 'user-atlas-admin',
  plan: 'professional',
  avatarColor: '#0ea5e9',
  memberCount: 2,
  currentUserRole: 'guest'
}

const studioAtlasMembers: WorkspaceMember[] = [
  {
    id: 'user-atlas-admin',
    name: 'Studio Atlas Admin',
    email: 'admin@studio-atlas.com',
    role: 'admin',
    avatarColor: '#0ea5e9',
    joinedAt: '2025-08-01'
  },
  {
    id: tomasId,
    name: tomasUser.name,
    email: tomasUser.email,
    role: 'guest',
    avatarColor: '#94a3b8',
    joinedAt: '2026-04-30'
  }
]

// Auto-created Drafts per host workspace, per
// fork-destination-in-host-workspace working answer.
const tomasDraftsComfy: Project = {
  id: 'proj-drafts-tomas-comfy',
  workspaceId: comfyOrgForTomas.id,
  name: 'My Workflows',
  tier: 'private',
  ownerUserId: tomasId,
  isDrafts: true,
  currentUserHasAccess: true
}

const tomasDraftsAtlas: Project = {
  id: 'proj-drafts-tomas-atlas',
  workspaceId: studioAtlas.id,
  name: 'My Workflows',
  tier: 'private',
  ownerUserId: tomasId,
  isDrafts: true,
  currentUserHasAccess: true
}

// Studio Atlas's only project context — Tomás doesn't see the project
// itself, just the asset.
const atlasHiddenProject: Project = {
  id: 'proj-atlas-brand',
  workspaceId: studioAtlas.id,
  name: 'Brand systems',
  tier: 'restricted',
  ownerUserId: 'user-atlas-admin',
  isDrafts: false,
  currentUserHasAccess: false
}

// Coke can hero (Runner) + Brand color tuner app (App Runner).
const accessibleWorkflows: Workflow[] = [
  ...(adminFixture.workflows.find((w) => w.id === 'wf-cocacola-hero')
    ? [adminFixture.workflows.find((w) => w.id === 'wf-cocacola-hero')!]
    : []),
  {
    id: 'app-atlas-brandtuner',
    projectId: atlasHiddenProject.id,
    name: 'Brand color tuner',
    kind: 'app',
    ownerUserId: 'user-atlas-admin',
    access: [{ userId: tomasId, role: 'app-runner' }],
    updatedAt: '2026-05-08'
  }
]

export const assetOnlyGuestFixture: PersonaFixture = {
  ...adminFixture,
  currentUser: tomasUser,
  workspaces: [comfyOrgForTomas, studioAtlas],
  currentWorkspaceId: comfyOrgForTomas.id,
  // No project visibility — only the auto-created Drafts in each host.
  projects: [tomasDraftsComfy, tomasDraftsAtlas, atlasHiddenProject],
  workflows: [...accessibleWorkflows],
  // Studio Atlas members are surfaced for completeness; the Members tab
  // is hidden for this persona regardless.
  members: [...adminFixture.members, ...studioAtlasMembers],
  usage: null
}
