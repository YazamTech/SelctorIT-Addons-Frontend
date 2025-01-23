<template>
  <div
    class="card shadow personal-record-wrapper"
    id="personal-record"
    :class="[rtl && 'rtl']"
  >
    <div
      class="d-flex align-items-center justify-content-between px-3 py-1 border-bottom"
    >
      <img :src="logoSrc" height="40px" class="z-1" />
      <span class="h5 bold">{{
        rtl ? "סיכום סינון" : "Filtering Summary"
      }}</span>

      <a
        :href="`/engine-management/data/downloadreport/${linkId}/${
          rtl ? 'he' : 'en'
        }${token ? '?token=' + token : ''}`"
        class="z-1"
      >
        <img :src="downloadSrc" class="svg svg-wrapper" />
      </a>
    </div>

    <div class="content-wrapper d-flex overflow-auto">
      <div class="list-wrapper">
        <ItemData
          v-for="item of dataItems"
          :item="item"
          :key="item.text"
          :rtl="rtl"
        />

        <div class="card lengend-wrapper p-2 m-2">
          <span class="mb-2 bold">{{ rtl ? "מקרא" : "Legend" }}</span>

          <div class="d-flex">
            <div class="d-flex flex-column">
              <div
                v-for="item in legendItems"
                :key="item.text"
                class="legend-item"
              >
                <label class="label h-20 mx-1" :class="item.class"></label>
                <span>{{ rtl ? item.textHebrew : item.textEnglish }}</span>
              </div>
            </div>

            <div class="d-flex flex-column">
              <div
                v-for="item in legendItems2"
                :key="item.text"
                class="legend-item"
              >
                <label class="label h-20 mx-1" :class="item.class"></label>
                <span>{{ rtl ? item.textHebrew : item.textEnglish }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="spread-line my-2 mx-2"></div>

      <ReportAndPassword
        :data="data"
        :linkId="linkId"
        :rtl="rtl"
        :setNewReport="(v) => (data.report = v)"
        :token="token"
      />
    </div>
    <small class="text-center py-2 ltr"
      >© {{ year }} YazamTech Ltd. All rights reserved.</small
    >
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRoute } from "vue-router";
import { api, selectedHost } from "src/boot/axios";
import ItemData from "src/components/PersonalRecord/ItemData.vue";
import ReportAndPassword from "src/components/PersonalRecord/ReportAndPassword.vue";

import { getValueArray, legendItems, legendItems2 } from "./PersonalRecord";
import { errorAlert, swal } from "src/utils/swal";
import bgBackgorund from "src/assets/login.jpeg";
import { useAppStateStore } from "src/stores/appState";
import { PublicClientApplication } from "@azure/msal-browser";
import yazamLogo from "src/assets/yazam-logo.png";
import downloadSrc from "src/assets/icons/download.svg";

const appStateStore = useAppStateStore();
const { setIsLoading } = appStateStore;
const route = useRoute();
const linkId = ref("");
const rtl = ref(false);
const freezedData = ref(null);

const dataItems = ref([]);
const data = ref(null);
const logoSrc = ref("");
const token = ref("");

const year = computed(() => {
  return new Date().getFullYear();
});

const authMicrosoft = async () => {
  const pca = new PublicClientApplication({
    auth: {
      clientId: "62f9b77a-b381-4ef4-a5d9-42d6031a1b55",
      redirectUri: window.location.origin + "/email/blank.htm",
    },
  });
  await pca.initialize();
  token.value = (
    await pca.acquireTokenPopup({
      scopes: ["https://graph.microsoft.com/User.Read"],
      prompt: "select_account",
    })
  ).accessToken;

  const response = await fetch(
    selectedHost + `/engine/release/${linkId.value}/summary`,
    {
      headers: { Authorization: "Bearer " + token.value },
    }
  );
  // if (response.headers.get('www-authenticate')?.includes('Bearer')) {
  if (response.status === 200) {
    data.value = await response.json();
    return "";
  } else {
    const reasonPhrase = response.headers.get("reason-phrase");
    // if (reasonPhrase) errorAlert(reasonPhrase)
    return reasonPhrase;
  }
};

onMounted(async () => {
  try {
    setIsLoading(true);
    document.body.style.backgroundImage = `url(${bgBackgorund})`;
    const userLanguage = navigator.language || navigator.userLanguage;
    if (userLanguage === "he-IL") rtl.value = true;

    linkId.value = route.params.id;
    if (linkId.value) {
      const reportRes = await fetch(
        selectedHost + `/engine/release/${linkId.value}/summary`
      );
      const status = reportRes.status;
      const authHeader = reportRes.headers.get("www-authenticate");

      if (status === 401 && authHeader) {
        const reasonPhrase = await authMicrosoft();
        if (reasonPhrase) throw Error(reasonPhrase);
      } else if (reportRes.status === 200) data.value = await reportRes.json();
      else {
        const reasonPhrase = reportRes.headers.get("reason-phrase");
        errorAlert(reasonPhrase);
        throw Error(reasonPhrase);
      }

      const response = await fetch(
        selectedHost + `/engine/release/${linkId.value}/details`,
        {
          headers: {
            Authorization: "Bearer " + token.value,
            Accept: "text/xml",
          },
        }
      );
      const xml = await response.text();
      const res = await api.post(`/selectoritreport/${data.value.isolation}`, {
        xml: xml,
      });

      if (res.status !== 200) throw Error;
      data.value.report = res.data.report;
      logoSrc.value = res.data.logo || yazamLogo;
      freezedData.value = JSON.parse(JSON.stringify(data.value));
      dataItems.value = getValueArray(data.value, rtl.value);
      const el = document.getElementById("personal-record");
      el.style.display = "block";
      document.body.style.backgroundImage = "";
    } else {
      errorAlert("No data found");
    }
  } catch (error) {
    let errorText;
    if (error?.response?.headers["reason-phrase"]) {
      errorText = error.response.headers["reason-phrase"];
    } else if (error?.response?.headers?.get("reason-phrase")) {
      errorText = error.response.headers.get("reason-phrase");
    } else if (error?.message?.includes("user_cancelled")) {
      errorText = { errorCode: "user_cancelled" };
    } else if (error?.message) {
      errorText = error.message;
    } else {
      errorText =
        "Access to the filtering summary is not allowed from this location.";
    }

    errorAlert(errorText);
  } finally {
    setIsLoading(false);
  }
});

onUnmounted(() => {
  document.body.style.backgroundImage = "";
});
</script>

<style src="./PersonalRecord.css" scoped></style>
