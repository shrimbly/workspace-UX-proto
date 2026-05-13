<!--
  Implements:
    entity: ../IA_Plan/wiki/entities/workflow.md
    Bare thumbnail + caption. No outer fill, no border, no hover wash —
    the thumbnail is the card.
-->
<template>
  <button
    type="button"
    class="group flex cursor-pointer flex-col gap-2 text-left text-base-foreground select-none"
    @click="emit('open', workflow.id)"
  >
    <span
      class="relative block aspect-square w-full overflow-hidden rounded-md"
      :style="{ background: thumbnail }"
    />
    <span class="flex flex-col">
      <span class="truncate text-sm/tight">{{ workflow.name }}</span>
      <span class="text-xs text-muted-foreground">{{
        workflow.updatedAt
      }}</span>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { thumbnailGradient } from '../utils/thumbnail'
import type { Workflow } from '../types'

const { workflow } = defineProps<{
  workflow: Workflow
}>()

const emit = defineEmits<{
  open: [workflowId: string]
}>()

const thumbnail = computed(() => thumbnailGradient(workflow.id))
</script>
