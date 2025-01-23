<template>
  <main >
    <LoadingComponent v-show="appState.isLoading" />
    <!-- <Sidebar /> -->

    <RouterView />
  </main>
</template>

<script setup>
import { useAppStateStore } from "./stores/appState";
import LoadingComponent from "./components/BaseComponents/Loading/LoadingComponent.vue";

const appState = useAppStateStore();


</script>
