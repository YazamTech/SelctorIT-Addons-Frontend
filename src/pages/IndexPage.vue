<template>
  <h1>Index Page</h1>
  <q-btn title="Personal Record" label="Personal Record" @click="router.push('/personalrecord')" />
</template>

<script>
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "PersonalRecordPage",
  data() {
    const currentLocation = ref(window.location)
    const router = useRouter()
    const quarantined = ref(false);
    const recipient = ref(false);
    const rtl = ref(false);
    const dark = ref(false);
    const password = ref("");
    return {
      router,
      quarantined,
      recipient,
      rtl,
      password,
      dark,
      currentLocation
    };
  },
});
</script>
