<!--
  Implements:
    open-q:  ../IA_Plan/wiki/open-questions.md#per-member-credit-limits
             — Proposed: UI surface required regardless of mechanism.
    concept: ../IA_Plan/wiki/concepts/three-level-permissions.md
             §"Workspace level" — Admin-only, not delegable.

  Per-member ceiling + period + reset cadence editor. Mechanism is TBD
  (hard block / soft warn / pre-charge) — copy reflects that.
-->
<template>
  <section
    class="flex flex-col gap-4 rounded-xl border border-border-subtle bg-base-background p-5"
  >
    <header class="flex flex-col gap-0.5">
      <h2 class="text-base font-semibold text-base-foreground">
        {{ t('prototype.views.settings.creditLimits.heading') }}
      </h2>
      <p class="text-xs text-muted-foreground">
        {{ t('prototype.views.settings.creditLimits.description') }}
      </p>
    </header>

    <p class="text-xs text-muted-foreground italic">
      {{ t('prototype.views.settings.creditLimits.mechanismNote') }}
    </p>

    <div class="overflow-hidden rounded-lg border border-border-subtle">
      <table class="w-full border-collapse text-sm">
        <thead class="bg-secondary-background text-left">
          <tr>
            <th class="px-3 py-2 font-medium">
              {{ t('prototype.views.settings.creditLimits.col.member') }}
            </th>
            <th class="px-3 py-2 font-medium">
              {{ t('prototype.views.settings.creditLimits.col.limit') }}
            </th>
            <th class="px-3 py-2 font-medium">
              {{ t('prototype.views.settings.creditLimits.col.period') }}
            </th>
            <th class="px-3 py-2 font-medium">
              {{ t('prototype.views.settings.creditLimits.col.usage') }}
            </th>
            <th class="w-24 px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.memberId"
            class="border-t border-border-subtle"
          >
            <td class="px-3 py-2">
              <div class="flex flex-col gap-0.5">
                <span class="font-medium">{{ row.name }}</span>
                <span class="text-xs text-muted-foreground">{{
                  row.email
                }}</span>
              </div>
            </td>
            <td class="px-3 py-2">
              <input
                :value="row.limit"
                type="number"
                min="0"
                step="50"
                class="h-8 w-24 rounded-md border border-border-subtle bg-base-background px-2 text-sm outline-none focus:border-base-foreground"
                @change="onLimitChange(row.memberId, row.period, $event)"
              />
            </td>
            <td class="px-3 py-2">
              <select
                :value="row.period"
                class="h-8 rounded-md border border-border-subtle bg-base-background px-2 text-sm outline-none focus:border-base-foreground"
                @change="onPeriodChange(row.memberId, row.limit, $event)"
              >
                <option value="monthly">
                  {{
                    t('prototype.views.settings.creditLimits.period.monthly')
                  }}
                </option>
                <option value="weekly">
                  {{ t('prototype.views.settings.creditLimits.period.weekly') }}
                </option>
                <option value="one-time">
                  {{
                    t('prototype.views.settings.creditLimits.period.oneTime')
                  }}
                </option>
              </select>
            </td>
            <td class="px-3 py-2">
              <div class="flex flex-col gap-1">
                <div class="flex items-baseline gap-1">
                  <span class="text-sm">
                    {{ row.used.toLocaleString() }}
                  </span>
                  <span class="text-xs text-muted-foreground">
                    /
                    {{
                      row.limit > 0
                        ? row.limit.toLocaleString()
                        : t('prototype.views.settings.creditLimits.unlimited')
                    }}
                  </span>
                </div>
                <div
                  v-if="row.limit > 0"
                  class="h-1 w-32 overflow-hidden rounded-full bg-secondary-background"
                >
                  <div
                    class="h-full"
                    :class="
                      row.used >= row.limit
                        ? 'bg-accent-warning'
                        : 'bg-base-foreground'
                    "
                    :style="{ width: `${row.usagePct}%` }"
                  />
                </div>
              </div>
            </td>
            <td class="p-2 text-right">
              <button
                v-if="row.hasLimit"
                type="button"
                class="text-danger-foreground inline-flex h-8 cursor-pointer appearance-none items-center justify-center rounded-lg border-0 bg-transparent px-2 text-xs transition-colors hover:bg-secondary-background"
                @click="emit('remove', row.memberId)"
              >
                {{ t('prototype.views.settings.creditLimits.clear') }}
              </button>
            </td>
          </tr>
          <tr v-if="!rows.length">
            <td
              colspan="5"
              class="px-3 py-6 text-center text-xs text-muted-foreground"
            >
              {{ t('prototype.views.settings.creditLimits.noMembers') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type {
  CreditLimitPeriod,
  MemberCreditLimit,
  WorkspaceMember
} from '../types'

const { members, limits } = defineProps<{
  members: WorkspaceMember[]
  limits: MemberCreditLimit[]
}>()

const emit = defineEmits<{
  set: [memberId: string, limit: number, period: CreditLimitPeriod]
  remove: [memberId: string]
}>()

const { t } = useI18n()

const rows = computed(() =>
  members
    .filter((m) => m.role !== 'admin')
    .map((m) => {
      const existing = limits.find((l) => l.memberId === m.id)
      const limit = existing?.limit ?? 0
      const used = existing?.used ?? 0
      const usagePct =
        limit > 0 ? Math.max(0, Math.min(100, (used / limit) * 100)) : 0
      return {
        memberId: m.id,
        name: m.name,
        email: m.email,
        limit,
        period: existing?.period ?? ('monthly' as CreditLimitPeriod),
        used,
        usagePct,
        hasLimit: !!existing
      }
    })
)

function onLimitChange(
  memberId: string,
  period: CreditLimitPeriod,
  event: Event
) {
  const value = Number((event.target as HTMLInputElement).value)
  if (Number.isNaN(value) || value <= 0) {
    emit('remove', memberId)
    return
  }
  emit('set', memberId, value, period)
}

function onPeriodChange(memberId: string, limit: number, event: Event) {
  const period = (event.target as HTMLSelectElement).value as CreditLimitPeriod
  if (limit <= 0) return
  emit('set', memberId, limit, period)
}
</script>
