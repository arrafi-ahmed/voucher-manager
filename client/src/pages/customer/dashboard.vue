<script setup>
import {useStore} from "vuex";
import {useRouter} from "vue-router";
import PageTitle from "@/components/PageTitle.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import {defaultCurrency, formatDateTime} from "@/others/util.js";

definePage({
  name: "customer-dashboard",
  meta: {
    layout: "default",
    title: "Dashboard",
  },
});
const store = useStore();
const router = useRouter();

const fetchData = async () => {
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
        <!--          :value="`${defaultCurrency.symbol}${stats?.totalPurchase || 0}`"-->
        <dashboard-card
          :icon-size="30"
          icon="mdi-cash"
          title="TOTAL PURCHASE"
        />
      </v-col>
      <v-col>
        <!--          :value="stats?.activeWarranties"-->
        <dashboard-card
          :icon-size="30"
          icon="mdi-shield"
          title="ACTIVE WARRANTIES"
        />
      </v-col>
      <v-col>
        <!--          :value="stats?.totalQr"-->
        <dashboard-card
          :icon-size="30"
          icon="mdi-qrcode"
          title="QR CODES CREATED"
        />
      </v-col>
      <v-col>
        <!--          :value="stats?.totalScans"-->
        <dashboard-card
          :icon-size="30"
          icon="mdi-select-all"
          title="TOTAL SCANS"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-sheet class="pa-4">
          <h3>Recent Purchases</h3>
          <!--          <v-data-table-server-->
          <!--            v-model:items-per-page="itemsPerPage"-->
          <!--            :headers="headers"-->
          <!--            :items="recentPurchases"-->
          <!--            :items-length="totalCount"-->
          <!--            :loading="loading"-->
          <!--            disable-sort-->
          <!--            @click:row="onRowClick"-->
          <!--            @update:options="loadItems"-->
          <!--          >-->
          <!--                        <template #item.purchaseDate="{ item }">-->
          <!--                          {{ formatDateTime(item.purchaseDate) }}-->
          <!--                        </template>-->
          <!--                        <template #item.purchasedPrice="{ item }">-->
          <!--                          {{ defaultCurrency.symbol }}{{ item.purchasedPrice }}-->
          <!--                        </template>-->
          <!--                        <template #item.warrantyStatus="{ item }">-->
          <!--                          <div-->
          <!--                            v-if="item.warrantyStatus === 0"-->
          <!--                            class="text-error"-->
          <!--                          >-->
          <!--                            Expired-->
          <!--                          </div>-->
          <!--                          <div-->
          <!--                            v-else-if="item.warrantyStatus === 1"-->
          <!--                            class="text-success"-->
          <!--                          >-->
          <!--                            Active-->
          <!--                          </div>-->
          <!--                          <div v-else>-->
          <!--                            Not Available-->
          <!--                          </div>-->
          <!--                        </template>-->
          <!--          </v-data-table-server>-->
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped></style>
