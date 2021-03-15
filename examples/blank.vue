<template>
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component"/>
    </keep-alive>
  </router-view>
</template>

<script>
import { defineComponent, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

export default defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    const routeKeys = reactive({});
    router.getRoutes().forEach(route => {
      routeKeys[route.path] = Math.random().toString(32);
    });
    onMounted(() => {
      
    })
    return {
      routeKeys
    }
  }
})

</script>