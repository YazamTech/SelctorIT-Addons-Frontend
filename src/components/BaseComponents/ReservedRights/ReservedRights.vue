<template>
  <div>
    <div class="all-rights-wrapper">
      <img class="mx-1" src="/src/assets/yazam-logo.png" alt="" />
      <span class="fs-10 mx-1">All rights reserved YazamTech {{ year }} ©</span>
    </div>
  </div>
</template>
<script setup>
import { ref } from "vue";
const year = ref(new Date().getFullYear());
</script>
<style scoped>
.all-rights-wrapper {
  display: flex;
  margin-left: calc(50% - 200px);
  width: 400px;
  justify-content: center;
  align-items: end;
  position: fixed;
  left: 2.5vw;
  bottom: 15px;
  img {
    height: 20px;
  }
}
</style>
