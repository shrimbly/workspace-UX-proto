<!--
  Implements:
    concept: ../IA_Plan/wiki/concepts/three-level-permissions.md
             — workspace-level model + custom-node allowlists
             (delegable to Members via edit-allowlists grant).

  Reusable editor for a single allowlist (model, custom-node, partner-node).
  Has an enable/disable toggle: when disabled, the gate is off — anything
  is allowed, regardless of entries. Admins can still curate the entries
  list while disabled.
  Read-only when canEdit is false — list still shows but no add/remove
  or toggle controls.
-->
<template>
  <section
    :class="
      cn(
        'flex flex-col gap-3 rounded-xl border border-border-subtle bg-modal-card-background p-5',
        !enabled && 'opacity-90'
      )
    "
  >
    <header class="flex items-start justify-between gap-3">
      <div class="flex flex-col gap-0.5">
        <div class="flex items-center gap-2">
          <h2 class="text-base font-semibold text-base-foreground">
            {{ title }}
          </h2>
          <span
            :class="
              cn(
                'inline-flex h-5 items-center rounded-full px-2 text-[10px] tracking-wide uppercase',
                enabled
                  ? 'bg-secondary-background text-base-foreground'
                  : 'bg-secondary-background text-muted-foreground'
              )
            "
          >
            {{
              enabled
                ? t('prototype.views.settings.allowlist.statusEnforced')
                : t('prototype.views.settings.allowlist.statusOff')
            }}
          </span>
        </div>
        <p class="text-xs text-muted-foreground">{{ description }}</p>
      </div>
      <label
        :class="
          cn('inline-flex items-center gap-2 text-xs', !canEdit && 'opacity-60')
        "
      >
        <input
          :checked="enabled"
          :disabled="!canEdit"
          type="checkbox"
          class="size-4 cursor-pointer appearance-auto accent-base-foreground disabled:cursor-not-allowed"
          @change="
            emit('toggle-enabled', ($event.target as HTMLInputElement).checked)
          "
        />
        <span>{{ t('prototype.views.settings.allowlist.enforceLabel') }}</span>
      </label>
    </header>

    <p
      v-if="!enabled"
      class="rounded-lg border border-dashed border-border-subtle bg-base-background/40 px-3 py-2 text-xs text-muted-foreground italic"
    >
      {{ t('prototype.views.settings.allowlist.offHint') }}
    </p>

    <div
      v-if="!entries.length"
      class="rounded-lg border border-dashed border-border-subtle px-4 py-6 text-center text-xs text-muted-foreground"
    >
      {{ t('prototype.views.settings.allowlist.empty') }}
    </div>
    <ul v-else class="m-0 flex list-none flex-col gap-1 p-0">
      <li
        v-for="entry in entries"
        :key="entry.id"
        class="flex items-center justify-between gap-3 rounded-lg border border-border-subtle px-3 py-2"
      >
        <div class="flex min-w-0 flex-col gap-0.5">
          <span class="truncate text-sm font-medium">{{ entry.name }}</span>
          <span class="text-xs text-muted-foreground">
            {{
              t('prototype.views.settings.allowlist.addedBy', {
                user: addedByLabel(entry.addedByUserId),
                date: entry.addedAt
              })
            }}
          </span>
          <span v-if="entry.note" class="text-xs text-muted-foreground italic">
            {{ entry.note }}
          </span>
        </div>
        <button
          v-if="canEdit"
          type="button"
          class="text-danger-foreground inline-flex h-8 shrink-0 cursor-pointer appearance-none items-center justify-center rounded-lg border-0 bg-transparent px-2 text-xs transition-colors hover:bg-secondary-background"
          @click="emit('remove', entry.id)"
        >
          {{ t('prototype.views.settings.allowlist.remove') }}
        </button>
      </li>
    </ul>

    <form v-if="canEdit" class="flex gap-2" @submit.prevent="onSubmit">
      <input
        v-model="draft"
        type="text"
        :placeholder="addPlaceholder"
        class="h-9 flex-1 rounded-lg border border-border-subtle bg-base-background px-3 text-sm outline-none focus:border-base-foreground"
      />
      <button
        type="submit"
        :disabled="!draft.trim()"
        class="inline-flex h-9 cursor-pointer items-center rounded-lg bg-base-foreground px-3 text-sm font-medium text-base-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {{ t('prototype.views.settings.allowlist.add') }}
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { cn } from '@comfyorg/tailwind-utils'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import type { AllowlistEntry } from '../types'

const {
  title,
  description,
  entries,
  enabled,
  canEdit = false,
  addPlaceholder,
  addedByLabel
} = defineProps<{
  title: string
  description: string
  entries: AllowlistEntry[]
  enabled: boolean
  canEdit?: boolean
  addPlaceholder: string
  addedByLabel: (userId: string) => string
}>()

const emit = defineEmits<{
  add: [name: string]
  remove: [entryId: string]
  'toggle-enabled': [enabled: boolean]
}>()

const { t } = useI18n()

const draft = ref('')

function onSubmit() {
  const value = draft.value.trim()
  if (!value) return
  emit('add', value)
  draft.value = ''
}
</script>
