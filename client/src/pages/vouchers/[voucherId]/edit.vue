<script setup>
import PageTitle from "@/components/PageTitle.vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import $axios from "@/plugins/axios.js";

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
const editVoucher = reactive({
  id: null,
  name: '',
  status: true
});

const form = ref(null);
const isFormValid = ref(true);

const handleSubmitVoucherEdit = async () => {
  await form.value.validate();
  if (!isFormValid.value) return;

  try {
    await $axios.put("/api/voucher/updateStatusAndName", editVoucher);
    store.commit("addSnackbar", { text: "Voucher updated successfully!", color: "success" });
    router.push({ name: "vouchers" });
  } catch (error) {
    store.commit("addSnackbar", { text: "Failed to update voucher", color: "error" });
  }
};

const fetchData = async () => {
  await store.dispatch("voucher/setVoucher", {
    voucherId: route.params.voucherId,
  });
};

onMounted(async () => {
  await fetchData();
  Object.assign(editVoucher, {
    id: voucher.value.id,
    name: voucher.value.name,
    status: voucher.value.status
  });
});
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
        <v-card>
          <v-card-title>Edit Voucher</v-card-title>
          <v-card-text>
            <p class="text-body-2 text-medium-emphasis mb-4">
              Only name and status can be edited. Other fields are read-only for existing vouchers.
            </p>
            
            <v-form
              ref="form"
              v-model="isFormValid"
              fast-fail
              @submit.prevent="handleSubmitVoucherEdit"
            >
              <v-text-field
                v-model="editVoucher.name"
                :rules="[(v) => !!v || 'Name is required!']"
                class="mt-2"
                clearable
                density="comfortable"
                hide-details="auto"
                label="Name"
                rounded="lg"
                variant="outlined"
              />
              
              <v-switch
                v-model="editVoucher.status"
                class="mt-2 mt-md-4"
                color="primary"
                density="comfortable"
                hide-details="auto"
                label="Active"
                rounded="lg"
              />

              <!-- Read-only fields for display -->
              <v-divider class="my-4" />
              <h3 class="text-h6 mb-3">Voucher Details (Read-only)</h3>
              
              <v-text-field
                :model-value="voucher.code"
                class="mt-2"
                density="comfortable"
                hide-details="auto"
                label="Code"
                readonly
                rounded="lg"
                variant="outlined"
              />
              
              <v-text-field
                :model-value="voucher.variant === 1 ? 'Percentage' : 'Amount'"
                class="mt-2 mt-md-4"
                density="comfortable"
                hide-details="auto"
                label="Type"
                readonly
                rounded="lg"
                variant="outlined"
              />
              
              <v-text-field
                :model-value="voucher.amount"
                class="mt-2 mt-md-4"
                density="comfortable"
                hide-details="auto"
                label="Amount"
                readonly
                rounded="lg"
                variant="outlined"
              />
              
              <v-text-field
                :model-value="voucher.currency"
                class="mt-2 mt-md-4"
                density="comfortable"
                hide-details="auto"
                label="Currency"
                readonly
                rounded="lg"
                variant="outlined"
              />
              
              <v-text-field
                :model-value="voucher.price"
                class="mt-2 mt-md-4"
                density="comfortable"
                hide-details="auto"
                label="Price"
                readonly
                rounded="lg"
                variant="outlined"
              />
              
              <v-text-field
                :model-value="voucher.availableStock"
                class="mt-2 mt-md-4"
                density="comfortable"
                hide-details="auto"
                label="Available Stock"
                readonly
                rounded="lg"
                variant="outlined"
              />
              
              <v-card-actions class="mt-4">
                <v-spacer />
                <v-btn
                  color="secondary"
                  rounded="lg"
                  size="large"
                  variant="flat"
                  @click="router.push({ name: 'vouchers' })"
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
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped></style>
