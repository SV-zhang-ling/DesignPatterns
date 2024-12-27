<template>
  <div class="basics-container">
    <div class="title">输入框(Input)</div>
    <div>Default</div>
    <el-input
      :placeholder="$t('common.inputTip')"
      v-model="inputVal"
    ></el-input>
    <br /><br />
    <div>Readonly</div>
    <el-input
      :placeholder="$t('common.inputTip')"
      value="Type something"
      readonly
    ></el-input>
    <br /><br />
    <div>Disabled</div>
    <el-input
      :placeholder="$t('common.inputTip')"
      value="Type something"
      disabled
    />
    <div>Form demo</div>
    <el-form :model="ruleForm" :rules="rules" label-position="top">
      <el-form-item label="Input Label" prop="name">
        <el-input
          :placeholder="$t('common.inputTip')"
          v-model="ruleForm.name"
        />
      </el-form-item>
    </el-form>
    <br /><br />
    <div>Dropdown select</div>
    <el-select
      v-model="selVal"
      filterable
      style="width: 300px; margin-left: 50px"
      :placeholder="$t('common.selectTip')"
    >
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
    <el-select
      v-model="selValDisabled"
      style="width: 300px; margin-left: 50px"
      disabled
    >
      <el-option label="Option1" value="1"></el-option>
      <el-option label="Option2" value="2"></el-option>
    </el-select>
    <div class="title">日期选择(DatePicker)</div>
    <el-date-picker
      style="width: 300px; margin-left: 50px"
      v-model="dateVal"
      type="date"
      placeholder="yyyy-MM-dd"
    />
    <el-date-picker
      style="width: 300px; margin-left: 50px"
      v-model="dateVal"
      disabled
      type="date"
      placeholder="yyyy-MM-dd"
    />
    <div class="title">单选框(Radio)</div>
    <el-radio-group model-value="2">
      <el-radio label="1">Text</el-radio>
      <el-radio label="2">Text</el-radio>
    </el-radio-group>
    <el-radio-group model-value="2">
      <el-radio label="1" disabled>Text</el-radio>
      <el-radio label="2" disabled>Text</el-radio>
    </el-radio-group>
    <div class="title">复选框(Checkbox)</div>
    <el-checkbox>Text</el-checkbox>
    <el-checkbox disabled>Text</el-checkbox>
    <el-checkbox checked>Text</el-checkbox>
    <el-checkbox checked disabled>Text</el-checkbox>
  </div>
</template>

<script setup lang="ts">
import type { FormRules } from "element-plus";

const options = [
  {
    value: "Option1",
    label: "Option1"
  },
  {
    value: "Option2",
    label: "Option2"
  },
  {
    value: "Option3",
    label: "Option3"
  },
  {
    value: "Option4",
    label: "Option4"
  },
  {
    value: "Option5",
    label: "Option5"
  }
];

const inputVal = ref("");
const selVal = ref("");
const selValDisabled = ref("1");
const dateVal = ref("");
interface RuleForm {
  name: string;
}

const ruleForm = reactive<RuleForm>({
  name: ""
});
const rules = reactive<FormRules<RuleForm>>({
  name: [
    {
      required: true,
      message: "Please input name",
      trigger: "blur"
    }
  ]
});
</script>

<style lang="scss" scoped>
.basics-container {
  .title {
    margin: 20px 0 10px;
  }
}
</style>
