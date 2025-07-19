import {createStore} from "vuex";
import * as user from "./modules/user";
import * as voucher from "./modules/voucher.js";

const store = createStore({
  modules: {
    user,
    voucher,
  },
  state: () => ({
    progress: null,
    snackbars: [],
    routeInfo: {},
  }),
  mutations: {
    setProgress(state, payload) {
      state.progress = payload;
    },
    setRouteInfo(state, payload) {
      state.routeInfo = payload;
    },
    addSnackbar(state, payload) {
      state.snackbars.push(payload);
    },
    setSnackbars(state, value) {
      state.snackbars = value; // v-snackbar-queue will update this
    },
  },
  actions: {},
  getters: {},
});

export default store;
