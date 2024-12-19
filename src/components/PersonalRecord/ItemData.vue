<template>
  <div v-if="item.value" class="d-flex align-items-center my-2">
    <img :src="item.icon" alt="icon" class="svg mx-2" />
    <div class="w-100">
      <div class="d-flex">
        <span class="item-label"
          >{{ item.text }} <small v-if="item.isDate">(UTC)</small></span
        >
        <span
          class="elipsis"
          :class="[item.path && 'file-name', item.ltr && 'ltr', item.class]"
          :id="item.text"
        >
          {{ item.value }}
        </span>
      </div>
      <div class="d-flex">
        <small
          v-if="item.path"
          id="path"
          :class="rtl ? 'mr-130' : 'ml-130'"
          class="elipsis file-name ltr"
          >{{ item.path }}
        </small>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps(["item", "rtl"]);

import { onMounted } from "vue";
import tippy from "tippy.js";

onMounted(() => {
  if (!props.item.addTooltip) return;

  const obj = {
    placement: "bottom",
    arrow: true,
    theme: "light",
    maxWidth: "none",
  };
  const el = document.getElementById(props.item.text);
  if (el && props.item.value.length > 40)
    tippy(el, {
      content: props.item.value,
      ...obj,
    });

  if (props.item.path && props.item.path.length > 40) {
    const path = document.getElementById("path");
    tippy(path, {
      content: props.item.path,
      ...obj,
    });
  }
});
</script>

<style lang="scss" scoped>
.item-label {
  width: 165px;
  font-weight: 700;
}
.item-value {
  width: calc(100% - 180px);
}
img {
  height: 24px;
}

.ml-130 {
  margin-left: 130px;
}
.mr-130 {
  margin-right: 130px;
}
small {
  opacity: 0.7;
}

.file-name {
  max-width: calc(100% - 160px);
  min-width: 310px;
}
</style>
