<script setup>
const { voucher, currency } = defineProps({
  voucher: {
    type: Object,
    required: true,
  },
  currency: {
    type: String,
    default: "R",
  },
});

const getLabel = () => {
  if (voucher.variant === 0) {
    return `${currency}${voucher.amount}`;
  } else {
    return `${voucher.amount}%`;
  }
};
</script>
<template>
  <v-card
    class="d-flex flex-column bg-amber-lighten-5 align-center justify-center text-center pa-2"
    elevation="1"
    rounded="lg"
    min-width="140"
  >
    <div
      :class="voucher.variant === 0 ? 'bg-amber' : 'bg-red'"
      class="rounded"
    >
      <v-icon
        :icon="voucher.variant === 0 ? 'mdi-ticket-percent' : 'mdi-percent'"
        color="amber-lighten-5"
        size="48"
        class="ma-2"
      />
    </div>
    <div class="mt-2">
      <h4>
        {{ getLabel() }}
      </h4>
      <h5>Voucher</h5>
    </div>
  </v-card>
</template>
