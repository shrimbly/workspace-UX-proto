<!--
  Implements:
    entity:  ../IA_Plan/wiki/entities/workspace.md
             — Billing config; "billing does not auto-transfer with
               ownership transfer" (Lifecycle).
    concept: ../IA_Plan/wiki/concepts/three-level-permissions.md
             §"Workspace level" — Manage billing & subscription, view
             credit balance. Admin-only, not delegable.

  Read-with-stub-actions for the prototype: plan + payment + credit
  balance + invoice list are display-only. "Manage" buttons are
  affordance stubs; the real flows are out of scope here.
-->
<template>
  <section
    class="flex flex-col gap-4 rounded-xl border border-border-subtle bg-base-background p-5"
  >
    <header class="flex flex-col gap-0.5">
      <h2 class="text-base font-semibold text-base-foreground">
        {{ t('prototype.views.settings.billing.heading') }}
      </h2>
      <p class="text-xs text-muted-foreground">
        {{ t('prototype.views.settings.billing.description') }}
      </p>
    </header>

    <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
      <article
        class="flex flex-col gap-2 rounded-lg border border-border-subtle p-4"
      >
        <span class="text-xs font-medium text-muted-foreground">
          {{ t('prototype.views.settings.billing.planLabel') }}
        </span>
        <div class="flex items-center gap-2">
          <span class="text-lg font-semibold capitalize">
            {{ billing.subscription.plan }}
          </span>
          <span
            :class="
              cn(
                'inline-flex h-5 items-center rounded-full px-2 text-[10px] tracking-wide uppercase',
                statusBadgeClass
              )
            "
          >
            {{
              t(
                `prototype.views.settings.billing.status.${billing.subscription.status}`
              )
            }}
          </span>
        </div>
        <span class="text-xs text-muted-foreground">
          {{
            billing.subscription.cancelsAt
              ? t('prototype.views.settings.billing.cancelsOn', {
                  date: billing.subscription.cancelsAt
                })
              : t('prototype.views.settings.billing.renewsOn', {
                  date: billing.subscription.renewsAt
                })
          }}
        </span>
        <button
          type="button"
          class="mt-1 inline-flex h-8 cursor-pointer appearance-none items-center justify-center rounded-lg border border-border-subtle bg-transparent px-3 text-xs transition-colors hover:bg-secondary-background"
          @click="onManageStub('plan')"
        >
          {{ t('prototype.views.settings.billing.managePlan') }}
        </button>
      </article>

      <article
        class="flex flex-col gap-2 rounded-lg border border-border-subtle p-4"
      >
        <span class="text-xs font-medium text-muted-foreground">
          {{ t('prototype.views.settings.billing.paymentLabel') }}
        </span>
        <div class="flex items-baseline gap-1">
          <template
            v-if="
              billing.paymentMethod.kind === 'card' &&
              billing.paymentMethod.last4
            "
          >
            <span class="text-lg font-semibold">
              {{
                billing.paymentMethod.brand ??
                t('prototype.views.settings.billing.card')
              }}
            </span>
            <span class="text-sm text-muted-foreground">
              ···· {{ billing.paymentMethod.last4 }}
            </span>
          </template>
          <span v-else class="text-sm text-muted-foreground">
            {{ t('prototype.views.settings.billing.noPayment') }}
          </span>
        </div>
        <span
          v-if="
            billing.paymentMethod.expiresMonth &&
            billing.paymentMethod.expiresYear
          "
          class="text-xs text-muted-foreground"
        >
          {{
            t('prototype.views.settings.billing.expires', {
              month: String(billing.paymentMethod.expiresMonth).padStart(
                2,
                '0'
              ),
              year: billing.paymentMethod.expiresYear
            })
          }}
        </span>
        <button
          type="button"
          class="mt-1 inline-flex h-8 cursor-pointer appearance-none items-center justify-center rounded-lg border border-border-subtle bg-transparent px-3 text-xs transition-colors hover:bg-secondary-background"
          @click="onManageStub('payment')"
        >
          {{ t('prototype.views.settings.billing.updatePayment') }}
        </button>
      </article>

      <article
        class="flex flex-col gap-2 rounded-lg border border-border-subtle p-4"
      >
        <span class="text-xs font-medium text-muted-foreground">
          {{ t('prototype.views.settings.billing.creditLabel') }}
        </span>
        <div class="flex items-baseline gap-1">
          <span class="text-lg font-semibold">
            {{ billing.creditBalance.remaining.toLocaleString() }}
          </span>
          <span class="text-xs text-muted-foreground">
            / {{ billing.creditBalance.monthlyAllowance.toLocaleString() }}
          </span>
        </div>
        <div
          class="h-1.5 w-full overflow-hidden rounded-full bg-secondary-background"
        >
          <div
            class="h-full bg-base-foreground"
            :style="{ width: `${creditPct}%` }"
          />
        </div>
        <span class="text-xs text-muted-foreground">
          {{
            t('prototype.views.settings.billing.resetsOn', {
              date: billing.creditBalance.resetsAt
            })
          }}
        </span>
      </article>
    </div>

    <div class="flex flex-col gap-2">
      <h3 class="text-sm font-medium text-base-foreground">
        {{ t('prototype.views.settings.billing.invoicesHeading') }}
      </h3>
      <div
        v-if="!billing.invoices.length"
        class="rounded-lg border border-dashed border-border-subtle px-4 py-6 text-center text-xs text-muted-foreground"
      >
        {{ t('prototype.views.settings.billing.noInvoices') }}
      </div>
      <ul v-else class="m-0 flex list-none flex-col p-0">
        <li
          v-for="invoice in billing.invoices"
          :key="invoice.id"
          class="flex items-center justify-between border-b border-border-subtle py-2 last:border-b-0"
        >
          <span class="text-sm">{{ invoice.issuedAt }}</span>
          <span
            :class="
              cn(
                'inline-flex h-5 items-center rounded-full px-2 text-[10px] tracking-wide uppercase',
                invoiceStatusClass(invoice.status)
              )
            "
          >
            {{
              t(
                `prototype.views.settings.billing.invoiceStatus.${invoice.status}`
              )
            }}
          </span>
          <span class="text-sm font-medium">
            ${{ invoice.amountUsd.toLocaleString() }}
          </span>
        </li>
      </ul>
    </div>

    <p class="text-xs text-muted-foreground italic">
      {{ t('prototype.views.settings.billing.ownershipNote') }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { cn } from '@comfyorg/tailwind-utils'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { InvoiceStatus, WorkspaceBilling } from '../types'

const { billing } = defineProps<{ billing: WorkspaceBilling }>()

const { t } = useI18n()

const creditPct = computed(() => {
  const { remaining, monthlyAllowance } = billing.creditBalance
  if (monthlyAllowance <= 0) return 0
  return Math.max(0, Math.min(100, (remaining / monthlyAllowance) * 100))
})

const statusBadgeClass = computed(() => {
  if (billing.subscription.status === 'past-due') {
    return 'bg-accent-warning/15 text-accent-warning'
  }
  if (billing.subscription.status === 'cancelled') {
    return 'bg-secondary-background text-muted-foreground'
  }
  return 'bg-secondary-background text-base-foreground'
})

function invoiceStatusClass(status: InvoiceStatus): string {
  if (status === 'paid') return 'bg-secondary-background text-muted-foreground'
  if (status === 'open') return 'bg-accent-warning/15 text-accent-warning'
  return 'text-danger-foreground bg-secondary-background'
}

function onManageStub(_kind: 'plan' | 'payment') {
  // Prototype stub — real flow would open a modal / Stripe portal.
}
</script>
