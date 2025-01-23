<template>
  <div class="report-wrapper mx-2">
    <div
      v-if="props.data?.report"
      v-html="props.data?.report"
      class="ltr p-2"
      id="report"
    ></div>
    <div
      v-if="props.data?.quarantined && props.data?.status & 4"
      class="password-wrapper"
    >
      <div class="d-flex overflow-auto">
        <img class="svg mx-2" :src="key" style="height: 20px" />

        <span v-if="rtl" class="red-text">
          הכנס סיסמה אחת או יותר <br />
          לפתיחת קובץ מוצפן
        </span>
        <span v-else class="red-text"
          >Type one or more passwords to <br />
          open encrypted files</span
        >
      </div>
      <div v-for="(item, i) of passwords" :key="i" class="d-flex my-1">
        <input type="text" class="form-control mx-1" v-model="passwords[i]" />
      </div>
      <div class="d-flex justify-content-end mt-3">
        <img
          :src="plus"
          class="svg svg-wrapper pointer mx-1"
          @click="addPassrodInput"
          alt="add password"
          id="add-password"
        />
        <img
          @click="sendClicked"
          :src="send"
          alt="send icon"
          class="svg svg-wrapper mx-1"
          id="Send"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onUpdated, ref, computed } from "vue";
import tippy from "tippy.js";
import key from "src/assets/icons/key.svg";
import plus from "src/assets/icons/plus.svg";
import send from "src/assets/icons/send.svg";
import { useAppStateStore } from "src/stores/appState";
import { Loading } from "quasar";

const appState = useAppStateStore();
const props = defineProps(["data", "linkId", "rtl", "setNewReport", "token"]);
const passwords = ref([""]);

const addPassrodInput = () => {
  passwords.value.push("");
};
const sendClicked = async () => {
  try {
    Loading.show();
    // appState.setIsLoading(true);
    const response = await fetch(computedHref.value, {
      method: "GET",
      redirect: "follow",
      headers: {
        Authorization: "bearer " + props.token,
      },
    });
    const hash = response.url.split("released/")[1];
    window.location.href = "/engine-management/released/" + hash;
  } catch (e) {
    console.log(e);
  } finally {
    // appState.setIsLoading(false);
    Loading.hide();
  }
};
const computedHref = computed(() => {
  return `/engine/release/${props.linkId}/send?${passwords.value
    .filter((el) => !!el)
    .map((el) => "password=" + encodeURIComponent(el))
    .join("&")}${passwords.value[0] ? "&" : ""}${
    props.token ? "access_token=" + props.token : ""
  }`;
});

const isChanged = ref(false);
onUpdated(() => {
  if (isChanged.value) return;
  isChanged.value = true;
  const addIcon = document.getElementById("add-password");
  if (addIcon)
    tippy(addIcon, {
      content: props.rtl ? "הוסף סיסמה" : "Add password",
      placement: "bottom",
      arrow: true,
      theme: "light",
    });

  const sendIcon = document.getElementById("Send");
  if (sendIcon)
    tippy(sendIcon, {
      content: props.rtl ? "שלח" : "Send",
      placement: "bottom",
      arrow: true,
      theme: "light",
    });
});
</script>

<style lang="scss" scoped>
.password-wrapper {
  padding: 8px;
  max-width: 320px;
  background-color: rgba(25, 118, 210, 0.1);
  border: 1px solid rgba(25, 118, 210, 0.6);
  border-radius: 8px;
}

.report-wrapper {
  overflow: auto;
  max-height: calc(100vh - 150px);
  flex-grow: 1;
}

.rotate-180 {
  transform: rotate(180deg);
}
</style>

<style lang="scss">
#report {
  ul,
  header,
  li {
    position: unset !important;
  }

  h2 {
    font-size: 18px !important;
  }

  p {
    font-size: 14px !important;
  }

  // img {
  //   height: 50px !important;
  // }
}
</style>
