<script setup>
import {useStore} from "vuex";
import {computed} from "vue";

const store = useStore();
const progress = computed(() => store.state.progress);
</script>

<template>
  <div class="position-relative" style="z-index: 9999">
    <v-progress-linear
      :active="progress"
      :height="5"
      absolute
      class="position-fixed"
      color="secondary"
      indeterminate
      reverse
      rounded
    />
  </div>
</template>

<style scoped></style>
