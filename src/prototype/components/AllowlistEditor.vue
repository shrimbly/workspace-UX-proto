<!--
  Implements:
    concept: ../IA_Plan/wiki/concepts/three-level-permissions.md
             — workspace-level model + custom-node allowlists
             (delegable to Members via edit-allowlists grant).

  Reusable editor for a single allowlist (model, custom-node, partner-node).
  Has an enable/disable toggle: when disabled, the gate is off — anything
  is allowed regardless of entries. Admins can still curate the entries
  list while disabled.
-->
<template>
  <SettingsPanel :title="title" :description="description">
    <template #actions>
      <span
        class="inline-flex h-5 items-center rounded-full bg-secondary-background px-2 text-[10px] font-medium tracking-wide uppercase"
        :class="enabled ? 'text-text-primary' : 'text-muted'"
      >
        {{
          enabled
            ? t('prototype.views.settings.allowlist.statusEnforced')
            : t('prototype.views.settings.allowlist.statusOff')
        }}
      </span>
      <label
        :class="
          cn(
            'inline-flex items-center gap-2 text-sm text-text-secondary',
            !canEdit && 'opacity-60'
          )
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
    </template>

    <SettingsSubCard v-if="!enabled">
      <p class="m-0 text-sm text-text-secondary">
        {{ t('prototype.views.settings.allowlist.offHint') }}
      </p>
    </SettingsSubCard>

    <SettingsSubCard v-if="entries.length">
      <ul class="m-0 flex list-none flex-col p-0">
        <li
          v-for="(entry, index) in entries"
          :key="entry.id"
          :class="
            cn(
              'flex items-center justify-between gap-3 py-2',
              index > 0 && 'border-t border-interface-stroke'
            )
          "
        >
          <div class="flex min-w-0 flex-col gap-0.5">
            <span class="truncate text-sm text-text-primary">
              {{ entry.name }}
            </span>
            <span class="text-xs text-muted">
              {{
                t('prototype.views.settings.allowlist.addedBy', {
                  user: addedByLabel(entry.addedByUserId),
                  date: entry.addedAt
                })
              }}
            </span>
            <span v-if="entry.note" class="text-xs text-muted italic">
              {{ entry.note }}
            </span>
          </div>
          <Button
            v-if="canEdit"
            variant="muted-textonly"
            size="sm"
            @click="emit('remove', entry.id)"
          >
            {{ t('prototype.views.settings.allowlist.remove') }}
          </Button>
        </li>
      </ul>
    </SettingsSubCard>

    <p v-else class="m-0 text-sm text-text-secondary">
      {{ t('prototype.views.settings.allowlist.empty') }}
    </p>

    <form v-if="canEdit" class="flex gap-2" @submit.prevent="onSubmit">
      <input
        v-model="draft"
        type="text"
        :placeholder="addPlaceholder"
        class="h-10 flex-1 rounded-lg border border-interface-stroke bg-base-background px-3 text-sm text-text-primary outline-none focus:border-text-primary"
      />
      <Button
        as="button"
        type="submit"
        variant="inverted"
        size="lg"
        :disabled="!draft.trim()"
      >
        {{ t('prototype.views.settings.allowlist.add') }}
      </Button>
    </form>
  </SettingsPanel>
</template>

<script setup lang="ts">
import { cn } from '@comfyorg/tailwind-utils'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import Button from '@/components/ui/button/Button.vue'

import SettingsPanel from './settings/SettingsPanel.vue'
import SettingsSubCard from './settings/SettingsSubCard.vue'
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
