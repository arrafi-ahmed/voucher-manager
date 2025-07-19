<script setup>
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import PageTitle from "@/components/PageTitle.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import { useDisplay } from "vuetify/framework";
import { defaultCurrency, formatDateTime } from "@/others/util.js";

definePage({
  name: "admin-dashboard",
  meta: {
    layout: "default",
    title: "Dashboard",
  },
});
const store = useStore();
const router = useRouter();
const { smAndUp } = useDisplay();

router.push(store.getters["user/calcHome"]);

const stat = reactive({});
const purchases = ref([]);

const itemsPerPage = ref(10);
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
    title: "User",
    align: "start",
    key: "userName",
  },
  {
    title: "Redeemed?",
    align: "start",
    key: "isRedeemed",
  },
  {
    title: "Amount",
    align: "start",
    key: "purchasedPrice",
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
    .get("/voucher/getPurchasesWUsersForOwnVouchers", {
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

const fetchData = async () => {
  const {
    data: { payload },
  } = await $axios.get("/stat/admin");
  Object.assign(stat, payload);
};

onMounted(async () => {
  await fetchData();
});
</script>

<template>
  <v-container>
    <v-row>
      <v-col>
        <page-title
          border-b
          title="Welcome to Dashboard"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <dashboard-card
          :value="stat.activeVouchers"
          :icon-size="40"
          icon="mdi-cube-outline"
          title="Active Vouchers"
        />
      </v-col>
      <v-col>
        <dashboard-card
          :value="stat.totalSold"
          :icon-size="40"
          icon="mdi-tag"
          title="Total Sold"
        />
      </v-col>
      <v-col>
        <dashboard-card
          :value="stat.totalRedeemed"
          :icon-size="40"
          icon="mdi-select-all"
          title="Total Redeemed"
        />
      </v-col>
      <v-col>
        <dashboard-card
          :value="stat.totalRevenue"
          :icon-size="40"
          icon="mdi-select-all"
          title="Total Revenue"
        />
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col>
        <h3>Recent Purchases</h3>
        <v-data-table-server
          v-model:items-per-page="itemsPerPage"
          class="rounded mt-2 mt-md-4"
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

<style scoped></style>
