<!--
  Implements:
    concept: ../IA_Plan/wiki/concepts/personas-and-flows.md

  Top bar — persona switcher (dev affordance) on the left, current workspace
  name + user chip on the right.
-->
<template>
  <header
    class="flex items-center justify-end border-b border-border-subtle bg-base-background px-4 py-2 text-base-foreground"
  >
    <span class="text-sm text-muted-foreground">{{
      currentWorkspaceName
    }}</span>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { usePrototypePersonaStore } from '../stores/personaStore'

const personaStore = usePrototypePersonaStore()

const currentWorkspaceName = computed(
  () => personaStore.currentWorkspace?.name ?? ''
)
</script>
