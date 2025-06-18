<script setup>
import { defaultCurrency, formatDateTime } from "@/others/util.js";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import PageTitle from "@/components/PageTitle.vue";
import Voucher from "@/models/Voucher.js";
import { useDisplay } from "vuetify";
import ConfirmationDialog from "@/components/ConfirmationDialog.vue";
import DatePicker from "@/components/DatePicker.vue";
import { voucherTypes } from "@/constants/vouchers.js";

definePage({
  name: "vouchers",
  meta: {
    layout: "default",
    title: "Vouchers",
    requiresAuth: true,
  },
});
const { smAndUp } = useDisplay();
const store = useStore();
const router = useRouter();

const vouchers = computed(() => store.state.voucher.vouchers);

const itemsPerPage = ref(10);
const totalCount = ref(0);
const loading = ref(false);
const search = ref("");

const headersCommon = ref([
  {
    title: "Name",
    align: "start",
    key: "name",
  },
  {
    title: "Stock",
    align: "start",
    key: "availableStock",
  },
]);
const headersSmAndUp = ref([
  {
    title: "Price",
    align: "start",
    key: "price",
  },
  {
    title: "Amount",
    align: "start",
    key: "amount",
  },
  {
    title: "Expires At",
    align: "start",
    key: "expiresAt",
  },
]);

const headers = computed(() => {
  const actionHeader = {
    title: "",
    align: "end",
    key: "actions",
    sortable: false,
  };
  if (smAndUp.value) {
    return headersCommon.value
      .concat(headersSmAndUp.value)
      .concat(actionHeader);
  } else {
    return headersCommon.value.concat(actionHeader);
  }
});

const loadItems = ({ page, itemsPerPage }) => {
  loading.value = true;

  return store
    .dispatch("voucher/setVouchersByUserId", {
      page,
      itemsPerPage,
      fetchTotalCount: !vouchers.value?.items,
    })
    .then(({ total }) => {
      totalCount.value = total;
    })
    .finally(() => {
      loading.value = false;
    });
};

const dialog = ref(false);
const addForm = ref(null);
const isFormValid = ref(true);

const newVoucher = reactive({ ...new Voucher() });

const handleSubmitVoucherAdd = async () => {
  await addForm.value.validate();
  if (!isFormValid.value) return;

  await store.dispatch("voucher/save", { newVoucher }).then(() => {
    Object.assign(newVoucher, { ...new Voucher() });
    dialog.value = !dialog.value;
  });
};

const removeVoucher = async ({ voucherId }) => {
  await store.dispatch("voucher/removeVoucher", { voucherId });
};
</script>

<template>
  <v-container>
    <v-row
      align="center"
      justify="space-between"
    >
      <v-col>
        <page-title
          :border-b="true"
          :show-back="true"
          title="Vouchers"
        >
          <v-row align="center">
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  icon="mdi-dots-vertical"
                  v-bind="props"
                  variant="text"
                />
              </template>
              <v-list density="compact">
                <v-list-item
                  density="compact"
                  prepend-icon="mdi-plus"
                  title="Add Voucher"
                  @click="dialog = !dialog"
                />
              </v-list>
            </v-menu>
          </v-row>
        </page-title>
      </v-col>
      <!--      <v-col cols="auto">-->
      <!--        <div style="width: 250px">-->
      <!--          <v-date-input-->
      <!--            v-model="productDateRange"-->
      <!--            append-inner-icon="mdi-calendar"-->
      <!--            density="compact"-->
      <!--            hide-details="auto"-->
      <!--            label="Select Date"-->
      <!--            multiple="range"-->
      <!--            prepend-icon=""-->
      <!--            variant="outlined"-->
      <!--            @update:model-value="updateProductDateRange"-->
      <!--          />-->
      <!--        </div>-->
      <!--      </v-col>-->
    </v-row>

    <v-row>
      <v-col>
        <v-sheet class="px-0 px-md-3">
          <v-data-table-server
            v-model:items-per-page="itemsPerPage"
            :headers="headers"
            :items="vouchers"
            :items-length="totalCount"
            :loading="loading"
            :search="search"
            disable-sort
            @update:options="loadItems"
          >
            <template #item.price="{ item }">
              {{ defaultCurrency.symbol }}
              {{ parseFloat(item.price).toFixed(2) }}
            </template>

            <template #item.amount="{ item }">
              {{ item.variant === 0 ? defaultCurrency.symbol : "" }}
              {{ parseFloat(item.amount).toFixed(2) }}
              {{ item.variant === 1 ? "%" : "" }}
            </template>

            <template #item.createdAt="{ item }">
              {{ formatDateTime(item.createdAt) }}
            </template>

            <template #item.expiresAt="{ item }">
              {{ formatDateTime(item.expiresAt) }}
            </template>

            <template #item.actions="{ item }">
              <v-menu>
                <template #activator="{ props }">
                  <v-btn
                    icon="mdi-dots-vertical"
                    v-bind="props"
                    variant="text"
                  />
                </template>

                <v-list density="compact">
                  <v-list-item
                    link
                    prepend-icon="mdi-pencil"
                    title="Edit"
                    @click="
                      router.push({
                        name: 'voucher-edit',
                        params: { voucherId: item.id },
                      })
                    "
                  />
                  <v-divider class="my-1" />
                  <confirmation-dialog
                    @confirm="removeVoucher({ voucherId: item.id })"
                  >
                    <template #activator="{ onClick }">
                      <v-list-item
                        class="text-error"
                        link
                        prepend-icon="mdi-delete"
                        title="Delete"
                        @click.stop="onClick"
                      />
                    </template>
                  </confirmation-dialog>
                </v-list>
              </v-menu>
            </template>
          </v-data-table-server>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>

  <v-dialog
    v-model="dialog"
    :max-width="600"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex justify-space-between">
        <h2>Add Voucher</h2>
        <v-btn
          icon="mdi-close"
          size="small"
          variant="text"
          @click="dialog = !dialog"
        />
      </v-card-title>
      <v-card-text>
        <v-form
          ref="addForm"
          v-model="isFormValid"
          fast-fail
          @submit.prevent="handleSubmitVoucherAdd"
        >
          <v-text-field
            v-model="newVoucher.name"
            :rules="[(v) => !!v || 'Name is required!']"
            class="mt-2"
            clearable
            density="comfortable"
            hide-details="auto"
            label="Name"
            rounded="lg"
            variant="outlined"
          />
          <v-textarea
            v-model="newVoucher.description"
            :rules="[(v) => !!v || 'Description is required!']"
            class="mt-2 mt-md-4"
            clearable
            density="comfortable"
            hide-details="auto"
            label="Description"
            rounded="lg"
            variant="outlined"
          />
          <v-text-field
            v-model="newVoucher.code"
            :rules="[(v) => !!v || 'Code is required!']"
            class="mt-2 mt-md-4"
            clearable
            density="comfortable"
            hide-details="auto"
            label="Code"
            rounded="lg"
            type="text"
            variant="outlined"
          />
          <v-select
            v-model="newVoucher.variant"
            :rules="[(v) => v != null || 'Voucher type is required!']"
            :items="voucherTypes"
            item-title="title"
            item-value="value"
            class="mt-2 mt-md-4"
            clearable
            density="comfortable"
            hide-details="auto"
            label="Voucher type"
            rounded="lg"
            variant="outlined"
          />
          <v-text-field
            v-model="newVoucher.amount"
            :rules="[(v) => !!v || 'Amount is required!']"
            class="mt-2 mt-md-4"
            clearable
            density="comfortable"
            hide-details="auto"
            label="Amount"
            rounded="lg"
            type="number"
            variant="outlined"
            :prepend-inner-icon="defaultCurrency?.icon"
          />
          <date-picker
            v-model="newVoucher.expiresAt"
            :rules="[(v) => !!v || 'Expiry Date is required!']"
            clearable
            custom-class="mt-2 mt-md-4"
            density="comfortable"
            hide-details="auto"
            label="Expiry Date"
            rounded="lg"
            variant="outlined"
          />
          <v-text-field
            v-model="newVoucher.price"
            :rules="[(v) => !!v || 'Price is required!']"
            class="mt-2 mt-md-4"
            clearable
            density="comfortable"
            hide-details="auto"
            label="Price"
            rounded="lg"
            type="number"
            variant="outlined"
            :prepend-inner-icon="defaultCurrency?.icon"
          />
          <v-text-field
            v-model="newVoucher.availableStock"
            :rules="[(v) => !!v || 'Stock is required!']"
            class="mt-2 mt-md-4"
            clearable
            density="comfortable"
            hide-details="auto"
            label="Stock"
            rounded="lg"
            type="number"
            variant="outlined"
          />
          <v-card-actions class="mt-2 mt-md-4">
            <v-spacer />
            <v-btn
              color="secondary"
              rounded="lg"
              size="large"
              variant="flat"
              @click="dialog = !dialog"
            >
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              rounded="lg"
              size="large"
              type="submit"
              variant="flat"
            >
              Save
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped></style>
