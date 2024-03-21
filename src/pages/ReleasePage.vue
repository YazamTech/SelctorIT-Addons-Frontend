<template>
  <q-page class="flex column flex-center">
    <q-card flat style="width: auto">
      <q-toolbar class="bg-blue-grey toolbar" dark>
        <div>
          <q-btn
            dense
            class="q-mx-sm"
            round
            :title="rtl ? 'הורד' : 'download'"
            id="download"
            :href='`${selectedHost}/managementext/release/${tenantName}/download?password=${(password ? encodeURIComponent(password) : "")}`'
          >
            <q-icon
              color="white"
              :style="
                data.password
                  ? 'position: relative; animation: download 0.5s linear 0s infinite alternate;'
                  : ''
              "
              name="download"
            />
          </q-btn>
          <q-btn
            dense
            v-if="quarantined && recipient"
            class="q-mx-sm"
            icon-color="white"
            :title="rtl ? 'שלח' : 'send'"
            :href="
              window.location.pathname +
              '/send?password=' +
              encodeURIComponent(data.password)
            "
            ><q-icon name="send" color="white"
          /></q-btn>
          <q-btn
            dense
            class="q-mx-sm"
            round
            :title="rtl ? 'ממשק' : 'theme'"
            @click.stop="$q.dark.toggle()"
            ><q-icon name="invert_colors" color="white"
          /></q-btn>
        </div>
        <div class="row" style="align-items: center">
          <span class="text-h4 q-mr-md">SelectorIT Report</span>
          <img :src="logoSrc" height="40" />
        </div>
      </q-toolbar>
      <div class="q-py-sm row container">
        <q-list class="meta">
          <q-item
            v-if="data.quarantined && data.status & 4"
            dense
            class="bg-red-4"

          >
            <q-item-section side>
              <q-icon name="mdi-key-variant" color="warning" />
            </q-item-section>
            <q-item-section class="text-white">Password:</q-item-section>
            <q-item-section>
              <q-input
                v-model="password"
                label="Password"
                label-color="white"
                dense
              />
            </q-item-section>
          </q-item>
          <q-separator v-if="data.quarantined && data.status & 4" />
          <q-item v-if="data.name" dense>
            <q-item-section side>
              <q-icon name="mdi-file" />
            </q-item-section>
            <q-item-section
              ><q-item-label>File name: {{ data.name }}</q-item-label
              ><q-item-label caption>{{
                data.path
              }}</q-item-label></q-item-section
            >
          </q-item>
          <q-item v-if="data.subject" dense>
            <q-item-section side>
              <q-icon name="mdi-email" />
            </q-item-section>
            <q-item-section v-if="data.subject"
              >Subject: {{ data.subject }}</q-item-section
            >
          </q-item>
          <q-item v-if="data.recipient" dense>
            <q-item-section side>
              <q-icon name="mdi-account-arrow-left" />
            </q-item-section>
            <q-item-section v-if="data.recipient"
              >To: {{ data.recipient }}</q-item-section
            >
          </q-item>
          <q-item v-if="data.client" dense>
            <q-item-section side>
              <q-icon name="mdi-account-arrow-right" />
            </q-item-section>
            <q-item-section v-if="data.client"
              >From: {{ data.client }}</q-item-section
            >
          </q-item>
          <q-item dense>
            <q-item-section side>
              <q-icon name="mdi-weight" />
            </q-item-section>
            <q-item-section>Size: {{ parseSize(data.size) }}</q-item-section>
          </q-item>
          <q-item dense>
            <q-item-section side>
              <q-icon name="mdi-calendar-clock" />
            </q-item-section>
            <q-item-section
              >Processed on:
              {{
                new Date(data.date * 1000).toLocaleString("sv")
              }}</q-item-section
            >
          </q-item>
          <q-item dense>
            <q-item-section side>
              <q-icon name="mdi-security" />
            </q-item-section>
            <q-item-section
              >Status:
              {{
                status & 2
                  ? rtl
                    ? "נחסם"
                    : "rejected"
                  : status & 32
                  ? rtl
                    ? "חלקי"
                    : "partial"
                  : status & 1
                  ? rtl
                    ? "שונה"
                    : "modified"
                  : rtl
                  ? "מקורי"
                  : "intact"
              }}{{
                status & 4 ? ", " + (rtl ? "מוגן" : "protected") : ""
              }}</q-item-section
            >
          </q-item>
          <q-item dense>
            <q-item-section side>
              <q-icon name="mdi-barcode-scan" />
            </q-item-section>
            <q-item-section>ID: {{ data.id }}</q-item-section>
          </q-item>
        </q-list>
        <q-separator vertical />
        <div class="q-px-sm report" v-html="htmlDetails"></div>
      </div>
      <div class="bg-blue-grey row justify-center q-pa-md">© 2024 YazamTech Ltd. All rights reserved.</div>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useQuasar } from "quasar";
import { api, engineApi, selectedHost } from "src/boot/axios";

export default defineComponent({
  name: "IndexPage",
  data() {
    const $q = useQuasar();
    const currentLocation = ref(window.location);
    const router = useRouter();
    const route = useRoute();
    const tenantName = ref("");
    const quarantined = ref(false);
    const recipient = ref(false);
    const rtl = ref(false);
    const dark = ref(false);
    const password = ref("");
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
    const htmlDetails = ref("");
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

    onMounted(async () => {
      try {
        tenantName.value = route.params.id;
        console.log(tenantName.value);
        if (tenantName.value) {
          const res = await api.get(`/release/${tenantName.value}`);
          if (res.status != 200) {
            throw Error(res.headers["Reason-Phrase"]);
          }
          console.log(res);
          data.value = res.data;
          const releaseRes = await api.get(
            `release/${tenantName.value}/details`
          );
          console.log(releaseRes);
          htmlDetails.value = releaseRes.data;

          var detailsDiv = document.getElementById("details");
          detailsDiv.innerHTML = htmlDetails.value;

          const optionsRes = await engineApi.get("options/data");
          console.log(optionsRes);
          logoSrc.value = optionsRes.data.report.logo;

          // htmlDetails.value = htmlDetails.value
          //   .replace('<img src="data:image/png;base64', '<img style="display: none;" src="data:image/png;base64')
          //   .replace('<h2 style="display: inline;', '<h2 style="display: none;')
        }
      } catch (error) {
        console.log(error);
      }
    });
    return {
      router,
      tenantName,
      quarantined,
      recipient,
      rtl,
      password,
      dark,
      currentLocation,
      data,
      htmlDetails,
      logoSrc,
      parseSize,
      selectedHost,
    };
  },
});
</script>

<style scoped>
.toolbar {
  justify-content: space-between;
}

.container {
  display: flex;
  width: fit-content;
  max-width: 99vw;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.meta {
  overflow: auto;
  flex: 0 0 auto;
}

.report {
  overflow: auto;
  flex: 1;
}
</style>
