import $axios from "@/plugins/axios";

export const namespaced = true;

export const state = {
  product: {},
  products: [],
};

export const mutations = {
  setProducts(state, payload) {
    state.products = payload;
  },
  setProduct(state, payload) {
    state.product = payload;
  },
  addProduct(state, payload) {
    state.products.unshift(payload);
  },
  editProduct(state, payload) {
    const foundIndex = state.products.findIndex(
      (item) => item.id == payload.id,
    );
    if (foundIndex !== -1) {
      state.products[foundIndex] = payload;
    }
  },
  removeProduct(state, payload) {
    const foundIndex = state.products.findIndex(
      (item) => item.id == payload.id,
    );
    if (foundIndex !== -1) {
      state.products.splice(foundIndex, 1);
    }
  },
};

export const actions = {
  async save({commit}, request) {
    const response = await $axios.post("/api/product/save", request);
    return response.data?.payload;
  },

  async setProduct({commit}, request) {
    const response = await $axios.get("/api/product/getProduct", {
      params: {
        productId: request.productId,
      },
    });
    commit("setProduct", response.data?.payload);
    return response.data?.payload;
  },

  async removeProduct({commit}, request) {
    const response = await $axios.get("/api/product/removeProduct", {
      params: {
        productId: request.productId,
      },
    });
    commit("removeProduct", response.data?.payload);
    return response.data?.payload;
  },

  async setProductsByUserId({commit}, request) {
    const response = await $axios.get("/api/product/getProductsByUserId", {
      params: {
        offset: request.offset,
        limit: request.limit,
        fetchTotalCount: request.fetchTotalCount,
      },
    });
    commit("setProducts", response.data?.payload?.list);
    return response.data?.payload;
  },

  async bulkImport({commit}, request) {
    const response = await $axios.post("/api/product/bulkImport", request);
    return response.data?.payload;
  },

  async bulkExport({commit}, request) {
    const response = await $axios.get("/api/product/bulkExport", {
      responseType: "blob",
    });

    const blob = new Blob([response.data], {
      type: "application/zip",
    });

    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "products-export.zip";
    link.click();
    window.URL.revokeObjectURL(link.href);
  },
};

export const getters = {};
