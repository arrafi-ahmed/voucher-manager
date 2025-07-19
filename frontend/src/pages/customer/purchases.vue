<script setup>
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import PageTitle from "@/components/PageTitle.vue";
import { defaultCurrency, formatDateTime } from "@/others/util.js";

const store = useStore();
const router = useRouter();

definePage({
  name: "customer-recent-purchases",
  meta: {
    requiresAuth: true,
    layout: "default",
  },
});
const purchases = ref([]);

const itemsPerPage = ref(20);
const totalCount = ref(0);
const loading = ref(false);
const search = ref("");

const headers = ref([
  {
    title: "Voucher",
    align: "start",
    key: "voucherName",
  },
  {
    title: "Amount",
    align: "start",
    key: "purchasedPrice",
  },
  {
    title: "Redeemed?",
    align: "start",
    key: "isRedeemed",
  },
  {
    title: "Purchased At",
    align: "start",
    key: "createdAt",
  },
]);

const loadItems = ({ page, itemsPerPage }) => {
  loading.value = true;

  return $axios
    .get("/voucher/getPurchasesWVouchers", {
      page,
      itemsPerPage,
      fetchTotalCount: !purchases.value?.items,
    })
    .then(
      ({
        data: {
          payload: { total, items },
        },
      }) => {
        totalCount.value = total;
        purchases.value = items;
      },
    )
    .finally(() => {
      loading.value = false;
    });
};
</script>

<template>
  <v-container>
    <v-row>
      <v-col>
        <page-title
          border-b
          title="Recent Purchases"
        />
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col>
        <v-data-table-server
          v-model:items-per-page="itemsPerPage"
          class="rounded"
          :headers="headers"
          :items="purchases"
          :items-length="totalCount"
          :loading="loading"
          :search="search"
          disable-sort
          @update:options="loadItems"
        >
          <template #item.purchasedPrice="{ item }">
            {{ defaultCurrency.symbol }}
            {{ parseFloat(item.purchasedPrice).toFixed(2) }}
          </template>
          <template #item.isRedeemed="{ item }">
            <v-chip
              v-if="item.isRedeemed === true"
              color="success"
              variant="flat"
            >
              Yes
            </v-chip>
            <v-chip
              v-else
              color="error"
              variant="flat"
            >
              No
            </v-chip>
          </template>
          <template #item.createdAt="{ item }">
            {{ formatDateTime(item.createdAt) }}
          </template>
        </v-data-table-server>
      </v-col>
    </v-row>
  </v-container>
</template>
