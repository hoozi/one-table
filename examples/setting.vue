<template>
  <div>
    <a-select :value='state.layout' @change="v => state.layout = v">
      <a-select-option value="side">side</a-select-option>
      <a-select-option value="mix">mix</a-select-option>
      <a-select-option value="top">top</a-select-option>
    </a-select>
    {{state.layout}}
  </div>
</template>

<script lang='ts'>
import {  ref } from 'vue'
import { Select, Switch } from 'ant-design-vue';
import state from './layoutState';
const { Option } = Select;
export default {
  components: {
    ASelect: Select,
    ASelectOption: Option,
    ASwitch: Switch
  },
  setup () {
    return {
      state
    }
  }
}
</script>