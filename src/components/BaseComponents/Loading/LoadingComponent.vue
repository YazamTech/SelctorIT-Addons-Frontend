<template>
  <div class="spinner-wrapper center">
    <div class="spinner-border text-primary" role="status"></div>
  </div>
</template>

<style scoped lang="scss">
.spinner-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 10;
}
</style>
