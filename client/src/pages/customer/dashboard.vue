<script setup>
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import PageTitle from "@/components/PageTitle.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import NoItems from "@/components/NoItems.vue";
import { defaultCurrency } from "@/others/util.js";
import VoucherThumbnail from "@/components/VoucherThumbnail.vue";

definePage({
  name: "customer-dashboard",
  meta: {
    layout: "default",
    title: "Dashboard",
  },
});

const router = useRouter();
const vouchers = ref([]);
const itemsPerPage = ref(10);

const fetchData = async () => {
  const {
    data: { payload },
  } = await $axios.get("/api/voucher/getActiveVouchers");
  vouchers.value = payload;
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
          title="Vouchers"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-sheet
          class="pa-4"
          rounded
        >
          <v-data-iterator
            v-if="vouchers.length"
            :items="vouchers"
            :items-per-page="itemsPerPage"
          >
            <template #default="{ items }">
              <v-card
                v-for="{ raw: voucher } in items"
                :key="voucher.id"
                class="my-1 cursor-default"
                rounded
                elevation="2"
                link
              >
                <v-row
                  no-gutters
                  justify="center"
                  align="center"
                >
                  <!-- Dynamic Thumbnail -->
                  <v-col
                    cols="12"
                    sm="4"
                  >
                    <div class="d-flex align-center justify-center">
                      <voucher-thumbnail
                        :voucher="voucher"
                        :currency="defaultCurrency.symbol"
                      />
                    </div>
                    <div class="text-center mt-2">
                      <div>
                        Only {{ voucher.availableStock }} vouchers left!
                      </div>
                    </div>
                  </v-col>

                  <!-- Details -->
                  <v-col
                    cols="12"
                    sm="8"
                    class="py-2"
                  >
                    <v-card-title>
                      {{ voucher.name }}
                    </v-card-title>
                    <v-card-subtitle>
                      {{ voucher.status ? 'Active' : 'Inactive' }}
                    </v-card-subtitle>

                    <v-card-text>
                      <div>
                        Code:
                        <code style="font-size: 1.2rem">
                          {{ voucher.code }}</code>
                      </div>
                      <div v-if="voucher.expiresAt">
                        Expiring @
                        <span style="font-size: 1.2rem">
                          {{ new Date(voucher.expiresAt).toLocaleDateString() }}
                        </span>
                      </div>
                      <div>
                        Price:
                        <span style="font-size: 1.2rem">
                          {{ defaultCurrency.symbol }}
                          {{ parseFloat(voucher.price).toFixed(2) }}
                        </span>
                      </div>
                    </v-card-text>
                    <v-card-actions>
                      <v-btn
                        color="primary"
                        variant="elevated"
                        @click="
                          router.push({
                            name: 'checkout',
                            params: { voucherId: voucher.id },
                          })
                        "
                      >
                        Buy Now
                      </v-btn>
                    </v-card-actions>
                  </v-col>
                </v-row>
              </v-card>
            </template>
            <template #footer="{ page, pageCount, setPage }">
              <v-pagination
                :model-value="page"
                :length="pageCount"
                @update:model-value="setPage"
              />
            </template>
          </v-data-iterator>
          <no-items v-else />
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped></style>
