<template>
  <q-page class="flex column page" outline>
    <div
      ref="root"
      class="d-card flex column no-wrap"
      flat
      :class="{ 'page-bg-dark': $q.dark.isActive }"
      style="
        width: auto;
        max-height: calc(100vh - 96px);
        max-width: calc(100vw - 96px);
      "
    >
      <q-toolbar class="toolbar bottom-shadow" dark>
        <div class="row" style="align-items: center">
          <img :src="logoSrc" height="40" />
        </div>
        <div>
          <span class="text-h5 q-mr-md text-weight-medium"
            >SelectorIT Report</span
          >
        </div>
        <div>
          <q-btn
            dense
            class="q-mx-sm small-btn"
            :title="rtl ? 'שמור דוח' : 'Save report'"
            id="save"
            @click="downloadReport"
          >
            <q-icon color="primary" name="save" />
          </q-btn>
          <q-btn
            dense
            class="q-mx-sm small-btn"
            round
            :title="rtl ? 'ממשק' : 'Theme'"
            @click.stop="$q.dark.toggle()"
            ><q-icon name="invert_colors" color="primary"
          /></q-btn>
        </div>
      </q-toolbar>
      <div id="htmlReport" class="q-py-sm row container">
        <q-list class="meta">
          <q-item v-if="data.name" dense>
            <q-item-section side>
              <q-icon name="mdi-file" />
            </q-item-section>
            <q-item-section
              ><q-item-label
                ><div class="elipsis">
                  <span class="text-weight-bold">File name:</span>
                  {{ data.name }}
                </div>
                <q-tooltip>
                  {{ data.name }}
                </q-tooltip> </q-item-label
              ><q-item-label class="elipsis" caption
                >{{ data.path
                }}<q-tooltip>
                  {{ data.path }}
                </q-tooltip></q-item-label
              ></q-item-section
            >
          </q-item>
          <q-item v-if="data.subject" dense>
            <q-item-section side>
              <q-icon name="mdi-email" />
            </q-item-section>
            <q-item-section v-if="data.subject"
              ><div>
                <span class="text-weight-bold">Subject:</span>
                {{ data.subject }}
              </div></q-item-section
            >
          </q-item>
          <q-item v-if="data.recipient" dense>
            <q-item-section side>
              <q-icon name="mdi-account-arrow-left" />
            </q-item-section>
            <q-item-section v-if="data.recipient"
              ><div>
                <span class="text-weight-bold">To:</span> {{ data.recipient }}
              </div></q-item-section
            >
          </q-item>
          <q-item v-if="data.client" dense>
            <q-item-section side>
              <q-icon name="mdi-account-arrow-right" />
            </q-item-section>
            <q-item-section v-if="data.client"
              ><div>
                <span class="text-weight-bold">From:</span> {{ data.client }}
              </div></q-item-section
            >
          </q-item>
          <q-item dense>
            <q-item-section side>
              <q-icon name="mdi-weight" />
            </q-item-section>
            <q-item-section
              ><div>
                <span class="text-weight-bold">Size:</span>
                {{ parseSize(data.size) }}
              </div></q-item-section
            >
          </q-item>
          <q-item dense>
            <q-item-section side>
              <q-icon name="mdi-calendar-clock" />
            </q-item-section>
            <q-item-section
              ><div>
                <span class="text-weight-bold">Processed on:</span>
                {{ parseDate(data.date) }}
              </div></q-item-section
            >
          </q-item>
          <q-item dense>
            <q-item-section side>
              <q-icon name="mdi-security" />
            </q-item-section>
            <q-item-section
              ><div>
                <span class="text-weight-bold">Status:</span>
                {{
                  data.status & 2
                    ? rtl
                      ? "נחסם"
                      : "rejected"
                    : data.status & 32
                    ? rtl
                      ? "חלקי"
                      : "partial"
                    : data.status & 1
                    ? rtl
                      ? "שונה"
                      : "modified"
                    : rtl
                    ? "מקורי"
                    : "intact"
                }}{{
                  data.status & 4 ? ", " + (rtl ? "מוגן" : "protected") : ""
                }}
              </div></q-item-section
            >
          </q-item>
          <q-item dense>
            <q-item-section side>
              <q-icon name="mdi-barcode-scan" />
            </q-item-section>
            <q-item-section
              ><div>
                <span class="text-weight-bold">ID:</span> {{ data.id }}
              </div></q-item-section
            >
          </q-item>
        </q-list>
        <q-separator vertical class="q-mx-sm" />
        <div class="q-pr-sm report">
          <div v-html="data.report"></div>
          <div class="password-container">
            <div v-if="data.quarantined && data.status & 4" class="password">
              <div class="q-mt-sm">
                <q-icon name="mdi-key-variant" color="primary" /> Passwords:
              </div>
              <div class="flex">
                <div
                  v-for="(item, i) in passwords"
                  :key="item"
                  class="flex items-end"
                >
                  <q-input v-model="passwords[i]" dense />
                  <q-btn
                    v-if="i != 0"
                    icon="mdi-delete"
                    color="red"
                    round
                    class="btn-small q-ml-sm"
                    outline
                    @click="deletePasswordInput(i)"
                  />
                </div>
              </div>
              <div class="flex column justify-end itmes-center">
                <q-btn
                  class="btn-small q-ml-sm"
                  icon="mdi-plus"
                  color="primary"
                  @click="addPassrodInput"
                  round
                  ><q-tooltip>More password</q-tooltip></q-btn
                >
              </div>
              <div class="flex column justify-end">
                <q-btn
                  :disable="!passwords.some((el) => !el)"
                  dense
                  class="q-mx-sm small-btn"
                  :title="rtl ? 'שלח לסינון מחדש' : 'Resend to filter'"
                  id="download"
                  :href="`${selectedHost}/eme/personalrecord/${linkId}/${
                    data.recipient ? 'send' : 'download'
                  }download?password=${encodeURIComponent(passwords)}`"
                >
                  <q-icon
                    color="primary"
                    :style="
                      password
                        ? 'position: relative; animation: download 0.5s linear 0s infinite alternate;'
                        : ''
                    "
                    name="send"
                  />
                </q-btn>
              </div>
            </div>
            <!-- <div class="password">
              <q-item dense>
                <q-item-section side>
                  <q-icon name="mdi-key-variant" color="primary" />
                </q-item-section>
                <q-item-section>Password:</q-item-section>
                <q-item-section>
                  <q-input v-model="password" label="Password" dense />
                </q-item-section>
                <q-btn
                :disable="!passwords.some(el => !el)"
                dense
                class="q-mx-sm small-btn"
                  :title="rtl ? 'שלח לסינון מחדש' : 'Resend to filter'"
                  id="download"
                  :href="`${selectedHost}/eme/personalrecord/${linkId}/${
                    data.recipient ? 'send' : 'download'
                  }download?password=${
                    password ? encodeURIComponent(password) : ''
                  }`"
                >
                  <q-icon
                    color="primary"
                    :style="
                      password
                        ? 'position: relative; animation: download 0.5s linear 0s infinite alternate;'
                        : ''
                    "
                    name="send"
                  />
                </q-btn>
              </q-item>
            </div> -->
          </div>
        </div>
      </div>
      <div
        class="row justify-center q-pt-md text-subtitle2 text-grey-7 text-weight-thin"
      >
        © 2024 YazamTech Ltd. All rights reserved.
      </div>
    </div>
  </q-page>
</template>
<script>
import { defineComponent, ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useQuasar } from "quasar";
import { api, engineApi, selectedHost } from "src/boot/axios";

export default defineComponent({
  name: "IndexPage",
  setup() {
    const root = ref(null);

    const downloadHTML = () => {
      const blob = new Blob([content], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "data.html";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    const $q = useQuasar();
    const currentLocation = ref(window.location);
    const router = useRouter();
    const route = useRoute();
    const linkId = ref("");
    const quarantined = ref(false);
    const recipient = ref(false);
    const rtl = ref(false);
    const dark = ref(true);
    const passwords = ref([""]);
    const data = ref({
      name: "",
      path: "",
      subject: "",
      recipient: "",
      client: "",
      size: 0,
      date: "",
      status: "",
      quarantined: "",
      id: "",
      product: "",
    });
    const logoSrc = ref("");

    const parseSize = (numOfBytes) => {
      if (numOfBytes == null) {
        return "0 B";
      }

      if (numOfBytes < 1024) {
        return `${numOfBytes} B`;
      } else if (numOfBytes < 1024 ** 2) {
        return `${(numOfBytes / 1024).toFixed(1)} Kb`;
      } else if (numOfBytes < 1024 ** 3) {
        return `${(numOfBytes / 1024 ** 2).toFixed(1)} Mb`;
      } else {
        return `${(numOfBytes / 1024 ** 3).toFixed(1)} Gb`;
      }
    };

    const parseDate = (dateInMs) => {
      const today = new Date(dateInMs * 1000);
      const yyyy = today.getFullYear();
      const MM = today.getMonth();
      const dd = today.getDate();
      const HH = today.getHours();
      const mm = today.getMinutes();
      const ss = today.getSeconds();
      const dateStr =
        dd + "/" + MM + "/" + yyyy + " " + HH + ":" + mm + ":" + ss;
      console.log(dateStr);
      return dateStr;
    };

    const addPassrodInput = () => {
      passwords.value.push("");
    };

    const deletePasswordInput = (i) => {
      passwords.value.splice(i, 1);
    };

    const downloadReport = async () => {
      try {
        const date1 = new Date();
        const date = parseDate(date.date);
        //this will give the report a nice frame with the information about the sent data
        const res = await api.get(`/personalrecord/${linkId.value}/details`);
        const report = res.data;
        console.log(report);
        let reportWrapper =
          `<img src=\"${logoSrc.value}\" style="margin-right: 20px; vertical-align: middle; max-width: 300px; max-height: 70px;"><h2 style="display: inline; vertical-align: middle;">SelectorIT Report</h2>` +
          report;
        // let reportWrapper = `<div style=\"width: fit-content\"><div style=\"display: flex; flex-direction: row; jsutify-content: space-between; align-items: center; width: 100%\"><div><img src=\"${logoSrc.value}\" style=\"height: 40px\"/></div><div><span style=\"font-size: 1.5rem; font-weight: 500; line-height: 2rem; margin-right: 16px\" >SelectorIT Report</span></div></div>` + report + '</div>'
        console.log(reportWrapper);

        //create blob, create a tag and download throw it the files
        const blob = new Blob([reportWrapper]);
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);

        link.setAttribute(
          "download",
          `Filtering Report ${date
            .replaceAll("/", ".")
            .replaceAll(":", "-")}.html`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.log("error", error);
      }
    };

    onMounted(async () => {
      try {
        console.log(root);
        var userLanguage = navigator.language || navigator.userLanguage;
        // Display the detected language
        console.log("User's language is: " + userLanguage);
        linkId.value = route.params.id;
        console.log(linkId.value);
        if (linkId.value) {
          const dataRes = await engineApi.get("/options/data");
          console.log(dataRes);
          const contentFilter = dataRes.data.report.content;
          console.log(contentFilter);
          const res = await api.get(`/personalrecord/${linkId.value}`);
          if (res.status != 200) {
            throw Error(res.headers["Reason-Phrase"]);
          }
          console.log(res);
          data.value = res.data;
          console.log(res.data.report);
          // const personalRecordRes = await api.get(
          //   `personalrecord/${linkId.value}/details?content=${contentFilter}`
          // );
          // console.log(personalRecordRes);

          const optionsRes = await engineApi.get("options/data");
          console.log(optionsRes);
          logoSrc.value = optionsRes.data.report.logo;
          if (!logoSrc.value) {
            logoSrc.value = `${selectedHost}/engine/static/logo`;
          }
        }
      } catch (error) {
        console.log(error);
      }
    });
    return {
      router,
      linkId,
      quarantined,
      recipient,
      rtl,
      passwords,
      dark,
      currentLocation,
      data,
      // htmlDetails,
      logoSrc,
      parseSize,
      parseDate,
      selectedHost,
      downloadReport,
      downloadHTML,
      root,
      addPassrodInput,
      deletePasswordInput,
    };
  },
});
</script>

<style scoped>
.page {
  width: fit-content;
  min-height: 0 !important;
}

.page-bg {
  background-color: #fff;
}

.page-bg-dark {
  background-color: #1e1e1e;
}

.toolbar {
  justify-content: space-between;
}

.container {
  display: flex;
  width: fit-content;
  max-width: 99vw;
  flex-wrap: nowrap;
  overflow-x: auto;
  height: calc(100% - 100px);
  width: 100%;
}

.meta {
  overflow: auto;
  flex: 0 0 auto;
  max-width: 500px;
  margin-block-start: 22px;
}

.report {
  overflow: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.d-card {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  border-radius: 0.375rem !important;
  border: 1px solid rgba(0, 0, 0, 0.175);
  padding: 4px;
}

.small-btn {
  height: 35px !important;
  min-width: 35px !important;
  padding: 0 !important;
  border-radius: 50% !important;
  box-shadow: unset !important;
  border: 1px solid rgb(25, 118, 210);
}

.q-btn:before {
  box-shadow: unset !important;
}

.bottom-shadow {
  -webkit-box-shadow: 0 4px 6px -6px #222;
  -moz-box-shadow: 0 4px 6px -6px #222;
  box-shadow: 0 4px 6px -6px #222;
}

.q-item--dense {
  min-height: 32px;
  padding: 2px 4px;
}

.password {
  padding: 8px;
  display: flex;
  justify-content: space-between;
  /* align-items: center; */
  /* height: 50%; */
  max-width: 440px;
  background-color: rgba(25, 118, 210, 0.1);
  border: 3px solid rgba(25, 118, 210, 0.6);
  border-radius: 8px;
}

.password-container {
  height: 50%;
}

.btn-small {
  width: 25px;
  height: 25px;
  min-width: 25px;
  min-height: 25px;
}
/* .password {
  display: flex;
  justify-content: space-between;
} */

.elipsis {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
</style>
