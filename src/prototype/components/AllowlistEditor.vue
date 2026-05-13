<!--
  Implements:
    concept: ../IA_Plan/wiki/concepts/three-level-permissions.md
             — workspace-level model + custom-node allowlists
             (delegable to Members via edit-allowlists grant)

  Reusable editor for a single allowlist (model or custom-node).
  Read-only when canEdit is false — list still shows but no add/remove
  controls.
-->
<template>
  <section
    class="flex flex-col gap-3 rounded-xl border border-border-subtle bg-modal-card-background p-5"
  >
    <header class="flex flex-col gap-0.5">
      <h2 class="text-base font-semibold text-base-foreground">
        {{ title }}
      </h2>
      <p class="text-xs text-muted-foreground">{{ description }}</p>
    </header>

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
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import type { AllowlistEntry } from '../types'

const {
  title,
  description,
  entries,
  canEdit = false,
  addPlaceholder,
  addedByLabel
} = defineProps<{
  title: string
  description: string
  entries: AllowlistEntry[]
  canEdit?: boolean
  addPlaceholder: string
  addedByLabel: (userId: string) => string
}>()

const emit = defineEmits<{
  add: [name: string]
  remove: [entryId: string]
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
