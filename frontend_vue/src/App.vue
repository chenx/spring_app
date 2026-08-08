<template>
  <el-config-provider :locale="en">
    <div id="layout">
      <el-container>
        <el-header class="app-header">
          <div class="header-left">
            <el-icon :size="24"><Monitor /></el-icon>
            <span class="app-title">Spring Boot</span>
          </div>
          <div class="header-right">
            <el-menu
              :default-active="route.path"
              mode="horizontal"
              :ellipsis="false"
              router
            >
              <el-menu-item index="/">
                <el-icon><HomeFilled /></el-icon>
                Home
              </el-menu-item>
              <el-menu-item index="/login" v-if="! isLoggedIn">
                <el-icon><HomeFilled /></el-icon>
                Login
              </el-menu-item>
              <el-menu-item index="/dashboard" v-if="isLoggedIn">
                <el-icon><User /></el-icon>
                Dashboard
              </el-menu-item>
              <el-menu-item index="/users" v-if="isLoggedIn">
                <el-icon><User /></el-icon>
                Users
              </el-menu-item>
              <el-menu-item index="/logout" @click="logout" v-if=" isLoggedIn">
                <el-icon><User /></el-icon>
                Log Out
              </el-menu-item>
            </el-menu>
          </div>
        </el-header>

        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import en from 'element-plus/es/locale/lang/en'

const route = useRoute()
const router = useRouter()
const isLoggedIn = ref(false)

// Function to check local storage auth status
function checkAuthStatus() {
  isLoggedIn.value = !!localStorage.getItem('token')
}

// Check status when app initializes
onMounted(() => {
  checkAuthStatus()
})

// Watch for route shifts to automatically recalculate the login state
watch(() => route.path, () => {
  checkAuthStatus()
})

// Global logout method
function logout() {
  localStorage.removeItem('token')
  isLoggedIn.value = false
  router.push('/login')
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', Arial, sans-serif;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #545c64;
  color: #fff;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.app-title {
  font-size: 20px;
  font-weight: bold;
}

.header-right .el-menu {
  background-color: transparent;
  border-bottom: none;
}

.header-right .el-menu-item {
  color: #fff;
  border-bottom: none;
}

.header-right .el-menu-item:hover,
.header-right .el-menu-item.is-active {
  background-color: transparent;
  color: #ffd04b;
  border-bottom: none;
}
</style>
