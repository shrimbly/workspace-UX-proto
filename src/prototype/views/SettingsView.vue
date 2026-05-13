<!--
  Implements:
    entity:  ../IA_Plan/wiki/entities/workspace.md
             — Settings inventory: model + custom-node allowlists,
               data/training policy, billing, member credit limits
    concept: ../IA_Plan/wiki/concepts/three-level-permissions.md
             — Admin-only with delegable allowlist editing (edit-allowlists)
    log:     ../prototype/design-decisions.md (2026-05-13)
             — Workspace settings scope, build order (Identity + Allowlists)

  Initial scope: rows 1–3 of the recommended build order — General
  (identity) + Model allowlist + Custom-node allowlist. Billing,
  data/training, credit limits, ownership, danger zone follow.
-->
<template>
  <div class="flex flex-col gap-6">
    <header>
      <h1 class="text-2xl font-semibold">
        {{ t('prototype.views.settings.title') }}
      </h1>
      <p class="mt-1 text-sm text-muted-foreground">
        {{ t('prototype.views.settings.subtitle') }}
      </p>
    </header>

    <div
      v-if="isGuest"
      class="rounded-xl border border-dashed border-border-subtle p-12 text-center text-sm text-muted-foreground"
    >
      {{ t('prototype.views.settings.guestEmpty') }}
    </div>

    <template v-else>
      <section
        class="flex flex-col gap-4 rounded-xl border border-border-subtle bg-base-background p-5"
      >
        <header class="flex flex-col gap-0.5">
          <h2 class="text-base font-semibold text-base-foreground">
            {{ t('prototype.views.settings.general.heading') }}
          </h2>
          <p class="text-xs text-muted-foreground">
            {{ t('prototype.views.settings.general.description') }}
          </p>
        </header>

        <div class="flex flex-col gap-1">
          <label
            class="text-xs font-medium text-muted-foreground"
            :for="nameInputId"
          >
            {{ t('prototype.views.settings.general.nameLabel') }}
          </label>
          <input
            :id="nameInputId"
            :value="workspace?.name ?? ''"
            :disabled="!canEditIdentity"
            type="text"
            class="h-9 rounded-lg border border-border-subtle bg-base-background px-3 text-sm outline-none focus:border-base-foreground disabled:cursor-not-allowed disabled:opacity-60"
            @change="onNameChange(($event.target as HTMLInputElement).value)"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label
            class="text-xs font-medium text-muted-foreground"
            :for="descInputId"
          >
            {{ t('prototype.views.settings.general.descriptionLabel') }}
          </label>
          <textarea
            :id="descInputId"
            :value="workspace?.description ?? ''"
            :disabled="!canEditIdentity"
            :placeholder="
              t('prototype.views.settings.general.descriptionPlaceholder')
            "
            rows="2"
            class="resize-y rounded-lg border border-border-subtle bg-base-background px-3 py-2 text-sm outline-none focus:border-base-foreground disabled:cursor-not-allowed disabled:opacity-60"
            @change="
              onDescriptionChange(($event.target as HTMLTextAreaElement).value)
            "
          />
        </div>

        <dl class="grid grid-cols-2 gap-4 text-sm">
          <div class="flex flex-col gap-0.5">
            <dt class="text-xs font-medium text-muted-foreground">
              {{ t('prototype.views.settings.general.typeLabel') }}
            </dt>
            <dd>
              <span
                class="inline-flex h-6 items-center rounded-full bg-secondary-background px-2 text-xs"
              >
                {{ tierLabel }}
              </span>
            </dd>
          </div>
          <div class="flex flex-col gap-0.5">
            <dt class="text-xs font-medium text-muted-foreground">
              {{ t('prototype.views.settings.general.ownerLabel') }}
            </dt>
            <dd class="text-sm">{{ ownerLabel }}</dd>
          </div>
        </dl>

        <p v-if="!canEditIdentity" class="text-xs text-muted-foreground italic">
          {{ t('prototype.views.settings.general.readOnly') }}
        </p>
      </section>

      <AllowlistEditor
        :title="t('prototype.views.settings.modelAllowlist.heading')"
        :description="t('prototype.views.settings.modelAllowlist.description')"
        :entries="fixture.allowlists.models"
        :can-edit="canEditAllowlists"
        :add-placeholder="
          t('prototype.views.settings.modelAllowlist.placeholder')
        "
        :added-by-label="addedByLabel"
        @add="(name) => personaStore.addAllowlistEntry('model', name)"
        @remove="(id) => personaStore.removeAllowlistEntry('model', id)"
      />

      <AllowlistEditor
        :title="t('prototype.views.settings.customNodeAllowlist.heading')"
        :description="
          t('prototype.views.settings.customNodeAllowlist.description')
        "
        :entries="fixture.allowlists.customNodes"
        :can-edit="canEditAllowlists"
        :add-placeholder="
          t('prototype.views.settings.customNodeAllowlist.placeholder')
        "
        :added-by-label="addedByLabel"
        @add="(name) => personaStore.addAllowlistEntry('custom-node', name)"
        @remove="(id) => personaStore.removeAllowlistEntry('custom-node', id)"
      />

      <p
        v-if="!canEditAllowlists && viewerRole !== 'guest'"
        class="text-xs text-muted-foreground italic"
      >
        {{ t('prototype.views.settings.allowlist.delegationHint') }}
      </p>

      <section
        v-if="isAdmin || canConfigureWorkspace"
        class="flex flex-col gap-3 rounded-xl border border-border-subtle bg-base-background p-5"
      >
        <header class="flex flex-col gap-0.5">
          <h2 class="text-base font-semibold text-base-foreground">
            {{ t('prototype.views.settings.dataTraining.heading') }}
          </h2>
          <p class="text-xs text-muted-foreground">
            {{ t('prototype.views.settings.dataTraining.description') }}
          </p>
        </header>
        <label class="flex items-start gap-3">
          <input
            :checked="!!workspace?.dataTrainingOptOut"
            type="checkbox"
            class="mt-0.5 size-4 cursor-pointer appearance-auto accent-base-foreground"
            @change="
              personaStore.setDataTrainingOptOut(
                ($event.target as HTMLInputElement).checked
              )
            "
          />
          <span class="flex flex-col gap-0.5 text-sm">
            <span class="font-medium">{{
              t('prototype.views.settings.dataTraining.toggleLabel')
            }}</span>
            <span class="text-xs text-muted-foreground">
              {{ t('prototype.views.settings.dataTraining.toggleHint') }}
            </span>
          </span>
        </label>
      </section>

      <section
        v-if="canApproveHub"
        class="flex flex-col gap-3 rounded-xl border border-border-subtle bg-base-background p-5"
      >
        <header class="flex flex-col gap-0.5">
          <h2 class="text-base font-semibold text-base-foreground">
            {{ t('prototype.views.settings.hubQueue.heading') }}
          </h2>
          <p class="text-xs text-muted-foreground">
            {{ t('prototype.views.settings.hubQueue.description') }}
          </p>
        </header>
        <div
          v-if="!fixture.hubSubmissions.length"
          class="rounded-lg border border-dashed border-border-subtle px-4 py-6 text-center text-xs text-muted-foreground"
        >
          {{ t('prototype.views.settings.hubQueue.empty') }}
        </div>
        <ul v-else class="m-0 flex list-none flex-col gap-1 p-0">
          <li
            v-for="sub in fixture.hubSubmissions"
            :key="sub.id"
            class="flex items-center justify-between gap-3 rounded-lg border border-border-subtle px-3 py-2"
          >
            <div class="flex min-w-0 flex-col gap-0.5">
              <span class="truncate text-sm font-medium">{{
                sub.assetName
              }}</span>
              <span class="text-xs text-muted-foreground">
                {{
                  t('prototype.views.settings.hubQueue.submittedBy', {
                    user: addedByLabel(sub.submittedByUserId),
                    date: sub.submittedAt
                  })
                }}
              </span>
            </div>
            <div class="inline-flex shrink-0 gap-1">
              <button
                type="button"
                class="inline-flex h-8 cursor-pointer appearance-none items-center justify-center rounded-lg border border-border-subtle bg-transparent px-3 text-xs transition-colors hover:bg-secondary-background"
                @click="personaStore.rejectHubSubmission(sub.id)"
              >
                {{ t('prototype.views.settings.hubQueue.reject') }}
              </button>
              <button
                type="button"
                class="inline-flex h-8 cursor-pointer items-center justify-center rounded-lg bg-base-foreground px-3 text-xs font-medium text-base-background transition-opacity hover:opacity-90"
                @click="personaStore.approveHubSubmission(sub.id)"
              >
                {{ t('prototype.views.settings.hubQueue.approve') }}
              </button>
            </div>
          </li>
        </ul>
      </section>

      <template v-if="isAdmin && fixture.billing">
        <BillingSection :billing="fixture.billing" />

        <MemberCreditLimitsSection
          v-if="workspace?.tier === 'team'"
          :members="fixture.members"
          :limits="fixture.memberCreditLimits"
          @set="
            (memberId, limit, period) =>
              personaStore.setMemberCreditLimit(memberId, limit, period)
          "
          @remove="(memberId) => personaStore.removeMemberCreditLimit(memberId)"
        />
      </template>

      <section
        v-if="canTransferOwnership"
        class="flex flex-col gap-3 rounded-xl border border-border-subtle bg-base-background p-5"
      >
        <header class="flex flex-col gap-0.5">
          <h2 class="text-base font-semibold text-base-foreground">
            {{ t('prototype.views.settings.ownership.heading') }}
          </h2>
          <p class="text-xs text-muted-foreground">
            {{ t('prototype.views.settings.ownership.description') }}
          </p>
        </header>
        <div class="flex items-center gap-2">
          <select
            v-model="transferTargetId"
            class="h-9 flex-1 rounded-lg border border-border-subtle bg-base-background px-3 text-sm outline-none focus:border-base-foreground"
          >
            <option value="" disabled>
              {{ t('prototype.views.settings.ownership.selectPlaceholder') }}
            </option>
            <option
              v-for="admin in otherAdmins"
              :key="admin.id"
              :value="admin.id"
            >
              {{ admin.name }} ({{ admin.email }})
            </option>
          </select>
          <button
            type="button"
            :disabled="!transferTargetId"
            class="inline-flex h-9 cursor-pointer items-center rounded-lg bg-base-foreground px-3 text-sm font-medium text-base-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            @click="onTransferOwnership"
          >
            {{ t('prototype.views.settings.ownership.transfer') }}
          </button>
        </div>
        <p
          v-if="!otherAdmins.length"
          class="text-xs text-muted-foreground italic"
        >
          {{ t('prototype.views.settings.ownership.noTargets') }}
        </p>
        <p class="text-xs text-muted-foreground italic">
          {{ t('prototype.views.settings.ownership.billingNote') }}
        </p>
      </section>

      <section
        v-if="canDeleteWorkspace"
        class="text-danger-foreground flex flex-col gap-3 rounded-xl border border-border-subtle bg-base-background p-5"
      >
        <header class="flex flex-col gap-0.5">
          <h2 class="text-base font-semibold">
            {{ t('prototype.views.settings.danger.heading') }}
          </h2>
          <p class="text-xs text-muted-foreground">
            {{ t('prototype.views.settings.danger.description') }}
          </p>
        </header>
        <div>
          <button
            type="button"
            class="text-danger-foreground inline-flex h-9 cursor-pointer items-center rounded-lg border border-border-subtle bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary-background"
            @click="onDelete"
          >
            {{ t('prototype.views.settings.danger.deleteButton') }}
          </button>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'

import AllowlistEditor from '../components/AllowlistEditor.vue'
import BillingSection from '../components/BillingSection.vue'
import MemberCreditLimitsSection from '../components/MemberCreditLimitsSection.vue'
import { usePrototypePersonaStore } from '../stores/personaStore'
import type { WorkspaceRole } from '../types'

const { t } = useI18n()
const personaStore = usePrototypePersonaStore()
const { fixture, currentWorkspace } = storeToRefs(personaStore)

const nameInputId = useId()
const descInputId = useId()

const viewerRole = computed<WorkspaceRole>(
  () => currentWorkspace.value?.currentUserRole ?? 'guest'
)
const isGuest = computed(() => viewerRole.value === 'guest')
const isAdmin = computed(() => viewerRole.value === 'admin')

const workspace = computed(() => currentWorkspace.value)

const canEditIdentity = computed(() => viewerRole.value === 'admin')
const canEditAllowlists = computed(
  () =>
    viewerRole.value === 'admin' ||
    (viewerRole.value === 'member' &&
      fixture.value.roleGrants['edit-allowlists'])
)
const canConfigureWorkspace = computed(
  () =>
    viewerRole.value === 'admin' ||
    (viewerRole.value === 'member' &&
      fixture.value.roleGrants['configure-workspace'])
)
const canApproveHub = computed(
  () =>
    viewerRole.value === 'admin' ||
    (viewerRole.value === 'member' &&
      fixture.value.roleGrants['approve-hub-submissions'])
)

const otherAdmins = computed(() =>
  fixture.value.members.filter(
    (m) => m.role === 'admin' && m.id !== fixture.value.currentUser.id
  )
)
const canTransferOwnership = computed(
  () => isAdmin.value && workspace.value?.tier === 'team'
)
const canDeleteWorkspace = computed(
  () => isAdmin.value && workspace.value?.tier === 'team'
)

const transferTargetId = ref('')

const tierLabel = computed(() =>
  workspace.value?.tier === 'personal'
    ? t('prototype.views.settings.general.tierPersonal')
    : t('prototype.views.settings.general.tierTeam')
)

const ownerLabel = computed(() => {
  const ws = workspace.value
  if (!ws) return ''
  if (ws.ownerUserId === fixture.value.currentUser.id) {
    return t('prototype.views.members.actions.you')
  }
  return (
    fixture.value.members.find((m) => m.id === ws.ownerUserId)?.name ??
    ws.ownerUserId
  )
})

function addedByLabel(userId: string): string {
  if (userId === fixture.value.currentUser.id) {
    return t('prototype.views.members.actions.you')
  }
  return fixture.value.members.find((m) => m.id === userId)?.name ?? userId
}

function onNameChange(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return
  personaStore.setWorkspaceName(trimmed)
}

function onDescriptionChange(value: string) {
  personaStore.setWorkspaceDescription(value)
}

function onTransferOwnership() {
  const target = transferTargetId.value
  if (!target) return
  const targetMember = fixture.value.members.find((m) => m.id === target)
  if (
    !targetMember ||
    !window.confirm(
      t('prototype.views.settings.ownership.confirm', {
        name: targetMember.name
      })
    )
  ) {
    return
  }
  personaStore.transferOwnership(target)
  transferTargetId.value = ''
}

function onDelete() {
  const name = workspace.value?.name ?? ''
  if (!window.confirm(t('prototype.views.settings.danger.confirm', { name }))) {
    return
  }
  personaStore.deleteCurrentWorkspace()
}
</script>
