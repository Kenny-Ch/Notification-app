<script setup>
import { ref } from 'vue'

var input = ref('')
var message = ref('暂无')
var connect = ref('连接已关闭')
var connect_type = ref('warning')
function get_status() {
  if (window.api.get_status()) {
    connect.value = '连接已开启'
    connect_type.value = 'success'
  }
}
function submitData() {
  console.log(input.value)
  window.api.update(input.value)
}
function saveData() {
  console.log(input.value)
  window.api.save(input.value)
}
get_status()
</script>

<template>
  <el-container>
    <el-header><h1>Notification-App</h1></el-header>
    <el-main>
      <el-row :gutter="20">
        <el-col :span="8">连接状态：</el-col>
        <el-col :span="16">
          <el-text class="mx-1" :type="connect_type">{{ connect }}</el-text>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">当前位置：</el-col>
        <el-col :span="16">
          <el-text class="mx-1" type="warning">{{ message }}</el-text>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">上报位置：</el-col>
        <el-col :span="10">
          <el-input id="address" v-model="input" placeholder="上报位置" />
        </el-col>
        <el-col :span="6">
          <el-button id="sendButton" type="primary" @click="saveData">保存</el-button>
        </el-col>
      </el-row>
      <el-button id="sendButton" type="primary" @click="submitData">提交</el-button>
    </el-main>
  </el-container>
</template>

<style lang="less">
.el-row {
  margin-bottom: 20px;
}
.el-row:last-child {
  margin-bottom: 0;
}
.el-col {
  border-radius: 4px;
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
}
</style>
