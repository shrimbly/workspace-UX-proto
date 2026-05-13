<!--
  Implements:
    persona: ../IA_Plan/wiki/concepts/personas.md — Asset-only Guest (#5)
    concept: ../IA_Plan/wiki/concepts/three-level-permissions.md — asset level
    matrix:  ../IA_Plan/wiki/concepts/prototype-test-coverage.md
             — Runner vs App Runner differentiation

  Placeholder asset detail view reached from Shared with me. Shows source,
  role, and the action buttons gated by the user's asset role:
    Runner     — Run in app mode + Run in workflow mode + Fork
    App Runner — Run in app mode only (workflow mode + Fork disabled)
-->
<template>
  <div class="flex flex-col gap-6">
    <button
      type="button"
      class="flex w-fit cursor-pointer items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-base-foreground"
      @click="uiStore.go({ kind: 'shared-with-me' })"
    >
      <span class="icon-[lucide--arrow-left] size-4" />
      {{ t('prototype.views.sharedAsset.back') }}
    </button>

    <div
      v-if="!asset"
      class="rounded-xl border border-dashed border-border-subtle p-12 text-center text-sm text-muted-foreground"
    >
      {{ t('prototype.views.sharedAsset.notFound') }}
    </div>

    <template v-else>
      <header class="flex items-start gap-4">
        <span
          :class="
            cn(
              'grid size-12 shrink-0 place-items-center rounded-xl bg-secondary-background text-muted-foreground',
              asset.kind === 'app'
                ? 'icon-[lucide--app-window]'
                : 'icon-[lucide--workflow]'
            )
          "
        />
        <div class="flex flex-col gap-1">
          <h1 class="text-2xl font-semibold">{{ asset.name }}</h1>
          <p class="text-sm text-muted-foreground">
            {{
              t(`prototype.views.sharedAsset.kind.${asset.kind ?? 'workflow'}`)
            }}
          </p>
        </div>
      </header>

      <dl
        class="grid grid-cols-1 gap-3 rounded-xl border border-border-subtle bg-base-background p-4 sm:grid-cols-3"
      >
        <div class="flex flex-col gap-0.5">
          <dt class="text-xs tracking-wide text-muted-foreground uppercase">
            {{ t('prototype.views.sharedAsset.sourceWorkspaceLabel') }}
          </dt>
          <dd class="text-sm">{{ workspaceName }}</dd>
        </div>
        <div class="flex flex-col gap-0.5">
          <dt class="text-xs tracking-wide text-muted-foreground uppercase">
            {{ t('prototype.views.sharedAsset.sourceProjectLabel') }}
          </dt>
          <dd class="text-sm">
            <template v-if="projectName">{{ projectName }}</template>
            <span v-else class="text-muted-foreground italic">
              {{ t('prototype.views.sharedAsset.sourceProjectHidden') }}
            </span>
          </dd>
        </div>
        <div class="flex flex-col gap-0.5">
          <dt class="text-xs tracking-wide text-muted-foreground uppercase">
            {{ t('prototype.views.sharedAsset.yourRoleLabel') }}
          </dt>
          <dd class="text-sm">
            <span
              class="inline-flex h-6 items-center rounded-full bg-secondary-background px-2 text-xs"
            >
              {{ t(`prototype.views.assetRole.${role}`) }}
            </span>
          </dd>
        </div>
      </dl>

      <section class="flex flex-col gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            class="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-base-foreground px-4 text-sm font-medium text-base-background transition-opacity hover:opacity-90"
          >
            <span class="icon-[lucide--play] size-4" />
            {{ t('prototype.views.sharedAsset.runAppMode') }}
          </button>
          <button
            type="button"
            :disabled="!canRunWorkflowMode"
            :class="
              cn(
                'inline-flex h-10 items-center gap-2 rounded-lg border border-border-subtle px-4 text-sm font-medium transition-colors',
                canRunWorkflowMode
                  ? 'cursor-pointer hover:bg-secondary-background'
                  : 'cursor-not-allowed text-muted-foreground'
              )
            "
          >
            <span class="icon-[lucide--git-branch] size-4" />
            {{ t('prototype.views.sharedAsset.runWorkflowMode') }}
          </button>
          <button
            type="button"
            :disabled="!canFork"
            :class="
              cn(
                'inline-flex h-10 items-center gap-2 rounded-lg border border-border-subtle px-4 text-sm font-medium transition-colors',
                canFork
                  ? 'cursor-pointer hover:bg-secondary-background'
                  : 'cursor-not-allowed text-muted-foreground'
              )
            "
          >
            <span class="icon-[lucide--copy] size-4" />
            {{ t('prototype.views.sharedAsset.fork') }}
          </button>
        </div>
        <p
          v-if="role === 'app-runner'"
          class="text-xs text-muted-foreground italic"
        >
          {{ t('prototype.views.sharedAsset.forkBlocked') }}
        </p>
        <p class="text-xs text-muted-foreground">
          {{
            t('prototype.views.sharedAsset.hostPaysHint', {
              workspace: workspaceName
            })
          }}
        </p>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { cn } from '@comfyorg/tailwind-utils'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { usePrototypePersonaStore } from '../stores/personaStore'
import { usePrototypeUiStore } from '../stores/uiStore'
import type { AssetRole } from '../types'

const { assetId } = defineProps<{
  assetId: string
}>()

const { t } = useI18n()
const personaStore = usePrototypePersonaStore()
const uiStore = usePrototypeUiStore()
const { fixture } = storeToRefs(personaStore)

const asset = computed(() =>
  fixture.value.workflows.find((w) => w.id === assetId)
)

const project = computed(() =>
  asset.value
    ? fixture.value.projects.find((p) => p.id === asset.value!.projectId)
    : undefined
)

const workspaceName = computed(() => {
  const wsId = project.value?.workspaceId
  if (!wsId) return '—'
  return fixture.value.workspaces.find((w) => w.id === wsId)?.name ?? '—'
})

const projectName = computed(() =>
  project.value?.currentUserHasAccess ? project.value.name : ''
)

const role = computed<AssetRole>(() => {
  const a = asset.value
  if (!a) return 'runner'
  if (a.ownerUserId === fixture.value.currentUser.id) return 'owner'
  return (
    a.access?.find((entry) => entry.userId === fixture.value.currentUser.id)
      ?.role ?? 'runner'
  )
})

const canRunWorkflowMode = computed(
  () => role.value === 'owner' || role.value === 'runner'
)
const canFork = computed(
  () => role.value === 'owner' || role.value === 'runner'
)
</script>
