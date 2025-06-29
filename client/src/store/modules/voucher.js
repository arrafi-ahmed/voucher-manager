import $axios from "@/plugins/axios";

export const namespaced = true;

export const state = {
  voucher: {},
  vouchers: [],
};

export const mutations = {
  setVouchers(state, payload) {
    state.vouchers = payload.items;
  },
  setVoucher(state, payload) {
    state.voucher = payload;
  },
  addVoucher(state, payload) {
    state.vouchers.unshift(payload);
  },
  editVoucher(state, payload) {
    const foundIndex = state.vouchers.findIndex(
      (item) => item.id == payload.id,
    );
    if (foundIndex !== -1) {
      state.vouchers[foundIndex] = payload;
    }
  },
  removeVoucher(state, payload) {
    const foundIndex = state.vouchers.findIndex(
      (item) => item.id == payload.id,
    );
    if (foundIndex !== -1) {
      state.vouchers.splice(foundIndex, 1);
    }
  },
};

export const actions = {
  async save({ commit }, request) {
    const response = await $axios.post("/api/voucher/save", request);
    commit("addVoucher", response.data?.payload);
    return response.data?.payload;
  },

  async setVoucher({ commit }, request) {
    const response = await $axios.get("/api/voucher/getVoucher", {
      params: {
        voucherId: request.voucherId,
      },
    });
    commit("setVoucher", response.data?.payload);
    return response.data?.payload;
  },

  async removeVoucher({ commit }, request) {
    const response = await $axios.get("/api/voucher/removeVoucher", {
      params: {
        voucherId: request.voucherId,
      },
    });
    commit("removeVoucher", response.data?.payload);
    return response.data?.payload;
  },

  async setVouchersByUserId({ commit }, request) {
    const response = await $axios.get("/api/voucher/getVouchersByUserId", {
      params: {
        offset: request.offset,
        limit: request.limit,
        fetchTotalCount: request.fetchTotalCount,
      },
    });
    commit("setVouchers", response.data?.payload);
    return response.data?.payload;
  },
};

export const getters = {};
