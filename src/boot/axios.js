import { boot } from "quasar/wrappers";
import axios from "axios";
import { useAppStateStore } from "../stores/appState";
import { errorAlert, swal } from "../utils/swal";
import router from "../router";

export const hostList = {
  local: "https://localhost",
  test: "bestcdr.com:8443",
  relative: "",
};
export const selectedHost = hostList.relative
  // window.location.hostname === "localhost" ? hostList.local : "";

const afterRes = (response) => {
  const appState = useAppStateStore();
  appState.setIsLoading(false);
  if (response.status >= 400) {
    const message = decodeURIComponent(response.headers["reason-phrase"]);
    if (message) alert(message); //add swal
    else alert("error"); //add swal
  }
  return response;
};

const afterResError = (el) => {
  const message = decodeURIComponent(el.response.headers["reason-phrase"]);
  //exeption
  if (message === "Wrong credentials.")
    swal({ text: "Wrong username or password." });
  else if (message === "Token has expired.") swal({ text: message });
  else if (el.response.headers["reason-phrase"]) errorAlert(message);
  else if (el.message) errorAlert(el.message);
  else errorAlert(el);

  const appState = useAppStateStore();
  appState.setIsLoading(false);
  //exeption
  if (message === "Token has expired.") router.push("/login");
  if (message !== "Wrong or no authentication provided.") throw el;
};

const beforeReq = (config) => {
  const appState = useAppStateStore();
  appState.setIsLoading(true);
  return config;
};

const beforeReqError = (error) => {
  errorAlert(error);
  const appState = useAppStateStore();
  appState.setIsLoading(false);
  return Promise.reject(error);
};

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
export const emailApi = axios.create({
  baseURL: `${selectedHost}/email`,
  timeout: 600000,
});

export const engineApi = axios.create({
  baseURL: `${selectedHost}/engine`,
  timeout: 600000,
});

export const api = axios.create({
  baseURL: `${selectedHost}/engine-management/data`,
  timeout: 600000,
});

api.interceptors.response.use(afterRes, afterResError);
emailApi.interceptors.response.use(afterRes, afterResError);
engineApi.interceptors.response.use(afterRes, afterResError);

api.interceptors.request.use(beforeReq, beforeReqError);
emailApi.interceptors.request.use(beforeReq, beforeReqError);
engineApi.interceptors.request.use(beforeReq, beforeReqError);

export function addCredentialsToAxios(bearer) {
  api.defaults.headers.common["Authorization"] = `Bearer ${bearer}`;
  emailApi.defaults.headers.common["Authorization"] = `Bearer ${bearer}`;
  engineApi.defaults.headers.common["Authorization"] = `Bearer ${bearer}`;
}

export function removeCredentialsFromAxios() {
  delete api.defaults.headers.common["Authorization"];
  delete emailApi.defaults.headers.common["Authorization"];
  delete engineApi.defaults.headers.common["Authorization"];
}
export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  app.config.globalProperties.$engineApi = engineApi;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});
