// Implements:
//   entities: ../IA_Plan/wiki/entities/{user,workspace,project,workflow,asset}.md
//
// Fixture-level types only. Mirrors wiki entity shape so the prototype is a
// literal implementation of the IA. If a field is needed that isn't in the
// wiki, either the field is wrong or the wiki needs updating — log it in
// prototype/design-decisions.md.

export type PersonaId =
  | 'solo'
  | 'solo-local'
  | 'workspace-admin'
  | 'workspace-member'
  | 'project-collaborator'
  | 'asset-only-guest'

export type WorkspaceTier = 'personal' | 'team'
export type WorkspacePlan = 'free' | 'professional' | 'enterprise'
export type WorkspaceRole = 'admin' | 'member' | 'guest'

// Project visibility tiers, post-rename. Working stance (see prototype-log
// 2026-05-12 entry): user-creatable tiers are `workspace-wide` and
// `restricted`; `private` is reserved for the auto-created Drafts flavor.
export type ProjectTier = 'workspace-wide' | 'restricted' | 'private'

export type AssetKind = 'workflow' | 'app' | 'model' | 'media' | 'blueprint'

// Asset-level roles per ../IA_Plan/wiki/concepts/three-level-permissions.md.
// Post-MVP roles (Editor, Viewer) intentionally omitted.
export type AssetRole = 'owner' | 'runner' | 'app-runner'

export interface AssetAccess {
  userId: string
  role: AssetRole
}

// Project-level roles per ../IA_Plan/wiki/concepts/three-level-permissions.md.
export type ProjectRole = 'owner' | 'collaborator' | 'project-guest'

export interface ProjectMember {
  userId: string
  role: ProjectRole
}

// Library sidebar sub-sections. `media` and `models` map cleanly to wiki
// asset types. `nodes` and `prompts` are surfaced as Library items even
// though the wiki today treats them as configuration / workflow-internal —
// flagged as working decision in prototype-log.
export type LibrarySection = 'media' | 'models' | 'nodes' | 'prompts'

export interface User {
  id: string
  name: string
  email: string
}

export interface Workspace {
  id: string
  name: string
  tier: WorkspaceTier
  ownerUserId: string
  plan: WorkspacePlan
  avatarColor: string
  memberCount: number
  currentUserRole: WorkspaceRole
  description?: string
  // Workspace-level data/training policy per
  // ../IA_Plan/wiki/entities/workspace.md §"What it contains" and
  // ../IA_Plan/wiki/concepts/three-level-permissions.md §"Workspace level".
  dataTrainingOptOut?: boolean
}

// Hub publishing approval queue item. Per
// ../IA_Plan/wiki/concepts/three-level-permissions.md §"Workspace level"
// — "Approve Comfy Hub publishing (delegable to Members)".
export interface HubSubmission {
  id: string
  assetName: string
  submittedByUserId: string
  submittedAt: string
}

// Workspace-level allowlists per
// ../IA_Plan/wiki/concepts/three-level-permissions.md §Workspace level.
// "Set workspace-level model + custom-node allowlists (delegable to Members)".
export type AllowlistKind = 'model' | 'custom-node'

export interface AllowlistEntry {
  id: string
  name: string
  addedAt: string
  addedByUserId: string
  note?: string
}

export interface WorkspaceAllowlists {
  models: AllowlistEntry[]
  customNodes: AllowlistEntry[]
}

export interface Project {
  id: string
  workspaceId: string
  name: string
  tier: ProjectTier
  ownerUserId: string
  isDrafts: boolean
  currentUserHasAccess: boolean
  // Project-level role assignments. Owner is also represented here for
  // completeness when surfacing a project members panel; workspace-wide
  // projects may leave this sparse since Members are implicit via
  // workspace role.
  members?: ProjectMember[]
}

export interface Workflow {
  id: string
  projectId: string
  name: string
  thumbnailUrl?: string
  updatedAt: string
  // 'workflow' (default) supports both workflow + app run modes per asset
  // role. 'app' is run-mode-only — Owner can still edit the graph, but
  // App Runners are confined to app mode and cannot fork.
  kind?: 'workflow' | 'app'
  // Owner of the asset. Optional for back-compat with simple drafts
  // entries that inherit the containing project's owner.
  ownerUserId?: string
  // Non-owner role grants. Owner role is implicit from ownerUserId.
  access?: AssetAccess[]
}

export interface LibraryAsset {
  id: string
  name: string
  section: LibrarySection
  projectId: string
  updatedAt: string
  tags?: string[]
  folder?: string
}

export interface Template {
  id: string
  name: string
  thumbnailUrl?: string
  description?: string
}

export interface UsageState {
  creditsRemainingPct: number
  showUpgrade: boolean
}

// Billing per ../IA_Plan/wiki/entities/workspace.md §"What it contains"
// and §"Lifecycle" (billing does not auto-transfer with ownership).

export type SubscriptionStatus = 'active' | 'past-due' | 'cancelled'

export interface Subscription {
  plan: WorkspacePlan
  status: SubscriptionStatus
  renewsAt: string
  cancelsAt?: string
  seatsIncluded: number
}

export type PaymentMethodKind = 'card' | 'invoice'

export interface PaymentMethod {
  kind: PaymentMethodKind
  brand?: string
  last4?: string
  expiresMonth?: number
  expiresYear?: number
  billingEmail?: string
}

export interface CreditBalance {
  remaining: number
  monthlyAllowance: number
  resetsAt: string
}

export type InvoiceStatus = 'paid' | 'open' | 'past-due'

export interface Invoice {
  id: string
  issuedAt: string
  amountUsd: number
  status: InvoiceStatus
}

export interface WorkspaceBilling {
  subscription: Subscription
  paymentMethod: PaymentMethod
  creditBalance: CreditBalance
  invoices: Invoice[]
}

// Per-member credit limit. Per open-q `per-member-credit-limits` the
// enforcement mechanism is TBD, but the wiki commits to the surface:
// per-member ceiling + period + reset cadence.
export type CreditLimitPeriod = 'monthly' | 'weekly' | 'one-time'

export interface MemberCreditLimit {
  memberId: string
  limit: number
  period: CreditLimitPeriod
  used: number
  resetsAt: string
}

export interface WorkspaceMember {
  id: string
  name: string
  email: string
  role: WorkspaceRole
  avatarColor?: string
  joinedAt: string
}

export interface PendingInvite {
  id: string
  email: string
  role: WorkspaceRole
  invitedByUserId: string
  invitedAt: string
}

// Admin-delegable capabilities surfaced in the Permissions matrix. Per
// concepts/three-level-permissions.md and open-questions
// publish-direct-link-admin-gate / delegation-surface-in-ui.
export type DelegableCapability =
  | 'publish-direct-link'
  | 'submit-to-hub'
  | 'approve-hub-submissions'
  | 'edit-allowlists'
  | 'configure-workspace'

// Per-role grant baseline. Admin always implicitly has all; Guest never has
// any workspace-wide grant. Member is the only interactive column.
export type RoleGrants = Record<DelegableCapability, boolean>

// Cloud vs local distinction per wiki:
//   decision: ../IA_Plan/wiki/decisions/projects-are-cloud-only.md
//   concept:  ../IA_Plan/wiki/concepts/local-dashboard-views.md
// 'local' personas have no projects, no workspace switcher, and a
// filesystem-backed library (Outputs replaces Prompts).
export type PersonaMode = 'cloud' | 'local'

export interface PersonaFixture {
  mode: PersonaMode
  currentUser: User
  workspaces: Workspace[]
  currentWorkspaceId: string
  projects: Project[]
  workflows: Workflow[]
  libraryAssets: LibraryAsset[]
  templates: Template[]
  usage: UsageState | null
  members: WorkspaceMember[]
  pendingInvites: PendingInvite[]
  roleGrants: RoleGrants
  allowlists: WorkspaceAllowlists
  billing: WorkspaceBilling | null
  memberCreditLimits: MemberCreditLimit[]
  hubSubmissions: HubSubmission[]
}

export interface PersonaDef {
  id: PersonaId
  label: string
  description: string
  fixture: PersonaFixture
}
