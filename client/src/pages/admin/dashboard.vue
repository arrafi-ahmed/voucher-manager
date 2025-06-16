<script setup>
import {useStore} from "vuex";
import {useRouter} from "vue-router";
import PageTitle from "@/components/PageTitle.vue";
import DashboardCard from "@/components/DashboardCard.vue";

definePage({
  name: "admin-dashboard",
  meta: {
    layout: "default",
    title: "Dashboard",
  },
});
const store = useStore();
const router = useRouter();

router.push(store.getters["user/calcHome"]);

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
        <!--          :value=""-->
        <dashboard-card
          :icon-size="40"
          icon="mdi-cube-outline"
          title="TOTAL SCANS"
        />
      </v-col>
      <v-col>
        <!--          :value=""-->
        <dashboard-card
          :icon-size="40"
          icon="mdi-tag"
          title="MODEL SCANS"
        />
      </v-col>
      <v-col>
        <!--          :value=""-->
        <dashboard-card
          :icon-size="40"
          icon="mdi-select-all"
          title="UNIT SCANS"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col :cols="12">
        <v-sheet
          class="pa-3"
          rounded="lg"
        >
          <div class="d-flex justify-space-between align-center mb-2 mb-md-4">
            <div>
              <h3 class="font-weight-medium">
                Scans Over Time
              </h3>
            </div>
          </div>
          <!--          <line-chart-->
          <!--            v-if="monthlyScanChart?.datasets?.[0]?.data?.length"-->
          <!--            :chart-data="monthlyScanChart"-->
          <!--            :chart-options="lineChartOptions"-->
          <!--            :height="80"-->
          <!--          />-->
          <!--          <no-items v-else />-->
        </v-sheet>
      </v-col>
    </v-row>

    <v-row>
      <v-col :cols="12">
        <v-sheet
          class="pa-3"
          rounded="lg"
        >
          <div class="d-flex justify-space-between align-center mb-2 mb-md-4">
            <div>
              <h3 class="font-weight-medium">
                Daily Count
              </h3>
            </div>
          </div>
          <!--          <bar-chart-->
          <!--            v-if="dailyScanChart?.datasets?.[0]?.data?.length"-->
          <!--            :chart-data="dailyScanChart"-->
          <!--            :chart-options="barChartOptions"-->
          <!--            :height="80"-->
          <!--          />-->
          <!--          <no-items v-else />-->
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped></style>
