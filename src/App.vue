<template>
  <main >
    <LoadingComponent v-show="appState.isLoading" />
    <!-- <Sidebar /> -->

    <RouterView />

    <ReservedRights/>
  </main>
</template>

<script setup>
import { useAppStateStore } from "./stores/appState";
import LoadingComponent from "./components/BaseComponents/Loading/LoadingComponent.vue";
import ReservedRights from "./components/BaseComponents/ReservedRights/ReservedRights.vue";

const appState = useAppStateStore();


</script>
