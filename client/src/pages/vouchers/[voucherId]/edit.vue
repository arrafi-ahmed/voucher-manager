<script setup>
import PageTitle from "@/components/PageTitle.vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import Voucher from "@/models/Voucher.js";
import { defaultCurrency } from "@/others/util.js";
import DatePicker from "@/components/DatePicker.vue";
import { voucherTypes } from "@/constants/vouchers.js";

definePage({
  name: "voucher-edit",
  meta: {
    layout: "default",
    title: "Edit Voucher",
    requiresAuth: true,
  },
});
const store = useStore();
const route = useRoute();
const router = useRouter();

const voucher = computed(() => store.state.voucher.voucher);
const newVoucher = reactive({ ...new Voucher() });

const form = ref(null);
const isFormValid = ref(true);

const handleSubmitVoucherEdit = async () => {
  await form.value.validate();
  if (!isFormValid.value) return;

  store.dispatch("voucher/save", {newVoucher}).then((res) => {
    router.push({ name: "vouchers" });
  });
};

const fetchData = async () => {
  await store.dispatch("voucher/setVoucher", {
    voucherId: route.params.voucherId,
  });
};
onMounted(async () => {
  await fetchData();
  Object.assign(newVoucher, {
    ...voucher.value,
  });
})
;
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
          title="Edit Voucher"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-form
          ref="form"
          v-model="isFormValid"
          fast-fail
          @submit.prevent="handleSubmitVoucherEdit"
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
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped></style>
