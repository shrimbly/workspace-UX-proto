<!--
  Implements:
    persona:  ../IA_Plan/wiki/concepts/personas.md — Project Collaborator, Asset-only Guest
    matrix:   ../IA_Plan/wiki/concepts/prototype-test-coverage.md
    open-q:   ../IA_Plan/wiki/open-questions.md#zero-state-for-asset-only-guest
              — Cross-workspace tray with workspace-filter chip row

  Cross-workspace destination for "things shared with me." Lists projects
  (where the user has project-level access) and assets (where the user
  appears in asset access[]), grouped under separate headings. Workspace
  filter chips above the lists default to "All workspaces."
-->
<template>
  <div class="flex flex-col gap-6">
    <header class="flex flex-col gap-1">
      <h1 class="text-2xl font-semibold">
        {{ t('prototype.views.sharedWithMe.title') }}
      </h1>
      <p class="text-sm text-muted-foreground">
        {{ t('prototype.views.sharedWithMe.subtitle') }}
      </p>
    </header>

    <div
      v-if="workspaceChips.length > 1"
      class="flex flex-wrap items-center gap-2"
    >
      <button
        v-for="chip in workspaceChips"
        :key="chip.id"
        type="button"
        :class="
          cn(
            'inline-flex h-8 cursor-pointer items-center gap-2 rounded-full border px-3 text-xs transition-colors',
            chip.id === workspaceFilter
              ? 'border-base-foreground bg-base-foreground text-base-background'
              : 'border-border-subtle text-muted-foreground hover:text-base-foreground'
          )
        "
        @click="workspaceFilter = chip.id"
      >
        <span
          v-if="chip.avatarColor"
          class="size-3 rounded-full"
          :style="{ backgroundColor: chip.avatarColor }"
        />
        {{ chip.label }}
      </button>
    </div>

    <section v-if="filteredProjects.length" class="flex flex-col gap-3">
      <h2
        class="text-sm font-semibold tracking-wide text-muted-foreground uppercase"
      >
        {{ t('prototype.views.sharedWithMe.projectsHeading') }}
      </h2>
      <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <li
          v-for="project in filteredProjects"
          :key="project.id"
          class="flex flex-col gap-3 rounded-xl border border-border-subtle bg-base-background p-4 transition-colors hover:bg-secondary-background"
        >
          <div class="flex items-start justify-between gap-2">
            <span class="icon-[lucide--folder] size-5 text-muted-foreground" />
            <span
              class="rounded-full bg-secondary-background px-2 py-0.5 text-xs text-muted-foreground"
            >
              {{ t(`prototype.projectTier.${project.tier}`) }}
            </span>
          </div>
          <div class="flex flex-col gap-1">
            <h3 class="text-base font-semibold">{{ project.name }}</h3>
            <p class="text-xs text-muted-foreground">
              {{
                t('prototype.views.sharedWithMe.inWorkspace', {
                  workspace: workspaceName(project.workspaceId)
                })
              }}
              <template v-if="projectRoleLabel(project.id)">
                · {{ projectRoleLabel(project.id) }}
              </template>
            </p>
          </div>
          <button
            type="button"
            class="inline-flex h-8 cursor-pointer items-center justify-center rounded-lg bg-secondary-background px-3 text-xs font-medium transition-colors hover:bg-secondary-background-hover"
            @click="onOpenProject(project.id)"
          >
            {{ t('prototype.views.sharedWithMe.openProject') }}
          </button>
        </li>
      </ul>
    </section>

    <section v-if="filteredAssets.length" class="flex flex-col gap-3">
      <h2
        class="text-sm font-semibold tracking-wide text-muted-foreground uppercase"
      >
        {{ t('prototype.views.sharedWithMe.assetsHeading') }}
      </h2>
      <ul class="flex flex-col gap-2">
        <li
          v-for="asset in filteredAssets"
          :key="asset.id"
          class="flex items-center gap-4 rounded-xl border border-border-subtle bg-base-background p-4 transition-colors hover:bg-secondary-background"
        >
          <span
            :class="
              cn(
                'grid size-9 shrink-0 place-items-center rounded-lg bg-secondary-background text-muted-foreground',
                assetKindIcon(asset)
              )
            "
          />
          <div class="flex min-w-0 flex-1 flex-col gap-0.5">
            <span class="truncate font-medium">{{ asset.name }}</span>
            <span class="truncate text-xs text-muted-foreground">
              {{
                t(
                  `prototype.views.sharedAsset.kind.${asset.kind ?? 'workflow'}`
                )
              }}
              ·
              {{
                t('prototype.views.sharedWithMe.inWorkspace', {
                  workspace: workspaceName(workspaceOfAsset(asset))
                })
              }}
            </span>
          </div>
          <span
            class="rounded-full bg-secondary-background px-2 py-0.5 text-xs text-muted-foreground"
          >
            {{ t(`prototype.views.assetRole.${roleOnAsset(asset)}`) }}
          </span>
          <button
            type="button"
            class="inline-flex h-8 cursor-pointer items-center justify-center rounded-lg bg-secondary-background px-3 text-xs font-medium transition-colors hover:bg-secondary-background-hover"
            @click="onOpenAsset(asset.id)"
          >
            {{ t('prototype.views.sharedWithMe.openAsset') }}
          </button>
        </li>
      </ul>
    </section>

    <div
      v-if="!filteredProjects.length && !filteredAssets.length"
      class="rounded-xl border border-dashed border-border-subtle p-12 text-center text-sm text-muted-foreground"
    >
      {{ t('prototype.views.sharedWithMe.empty') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { cn } from '@comfyorg/tailwind-utils'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { usePrototypePersonaStore } from '../stores/personaStore'
import { usePrototypeUiStore } from '../stores/uiStore'
import type { AssetRole, Project, Workflow } from '../types'

const { t } = useI18n()
const personaStore = usePrototypePersonaStore()
const uiStore = usePrototypeUiStore()
const { fixture, sharedProjects, sharedAssets } = storeToRefs(personaStore)

type WorkspaceFilterId = 'all' | string

const workspaceFilter = ref<WorkspaceFilterId>('all')

const workspaceChips = computed(() => {
  const ids = new Set<string>()
  for (const p of sharedProjects.value) ids.add(p.workspaceId)
  for (const a of sharedAssets.value) {
    const wsId = workspaceOfAsset(a)
    if (wsId) ids.add(wsId)
  }
  const chips: Array<{
    id: WorkspaceFilterId
    label: string
    avatarColor?: string
  }> = [{ id: 'all', label: t('prototype.views.sharedWithMe.filterAll') }]
  for (const ws of fixture.value.workspaces) {
    if (ids.has(ws.id)) {
      chips.push({ id: ws.id, label: ws.name, avatarColor: ws.avatarColor })
    }
  }
  return chips
})

function workspaceName(workspaceId: string | undefined) {
  if (!workspaceId) return '—'
  return fixture.value.workspaces.find((w) => w.id === workspaceId)?.name ?? '—'
}

function projectRoleLabel(projectId: string) {
  const project = fixture.value.projects.find((p) => p.id === projectId)
  const role = project?.members?.find(
    (m) => m.userId === fixture.value.currentUser.id
  )?.role
  if (!role) return ''
  return t(`prototype.views.projectRole.${role}`)
}

function workspaceOfAsset(asset: Workflow): string | undefined {
  return fixture.value.projects.find((p) => p.id === asset.projectId)
    ?.workspaceId
}

function roleOnAsset(asset: Workflow): AssetRole {
  if (asset.ownerUserId === fixture.value.currentUser.id) return 'owner'
  return (
    asset.access?.find((a) => a.userId === fixture.value.currentUser.id)
      ?.role ?? 'runner'
  )
}

function assetKindIcon(asset: Workflow) {
  return asset.kind === 'app'
    ? 'icon-[lucide--app-window]'
    : 'icon-[lucide--workflow]'
}

const filteredProjects = computed<Project[]>(() => {
  if (workspaceFilter.value === 'all') return sharedProjects.value
  return sharedProjects.value.filter(
    (p) => p.workspaceId === workspaceFilter.value
  )
})

const filteredAssets = computed<Workflow[]>(() => {
  if (workspaceFilter.value === 'all') return sharedAssets.value
  return sharedAssets.value.filter(
    (a) => workspaceOfAsset(a) === workspaceFilter.value
  )
})

function onOpenProject(projectId: string) {
  uiStore.go({ kind: 'project', projectId })
}

function onOpenAsset(assetId: string) {
  uiStore.go({ kind: 'shared-asset', assetId })
}
</script>
