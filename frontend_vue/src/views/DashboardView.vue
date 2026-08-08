<template>
  <div class="home-container">
    <el-row :gutter="20" justify="center">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon :size="28"><Monitor /></el-icon>
              <span>Welcome to your Dashboard</span>
            </div>
          </template>

          <p class="description">
            This is a full-stack demo project built with Spring Boot 3.x (Java 21) backend
            and Vue 3 + TypeScript + Element Plus frontend.
          </p>
          <el-divider />
          <el-descriptions title="Tech Stack" :column="2" border>
            <el-descriptions-item label="Backend">Spring Boot 3.2.5</el-descriptions-item>
            <el-descriptions-item label="Java Version">21</el-descriptions-item>
            <el-descriptions-item label="Frontend">Vue 3.4</el-descriptions-item>
            <el-descriptions-item label="UI Library">Element Plus 2.7</el-descriptions-item>
            <el-descriptions-item label="Language">TypeScript 5.4</el-descriptions-item>
            <el-descriptions-item label="Build Tool">Vite 5.2</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card shadow="hover" style="margin-top: 20px">
          <template #header>
            <div class="card-header">
              <el-icon :size="28"><Connection /></el-icon>
              <span>Backend Health Status</span>
            </div>
          </template>
          <div v-if="loading" style="text-align: center">
            <el-icon class="is-loading" :size="32"><Loading /></el-icon>
            <p>Checking backend status...</p>
          </div>
          <el-result
            v-else-if="healthData"
            :icon="healthData.status === 'UP' ? 'success' : 'error'"
            :title="healthData.status === 'UP' ? 'Backend is running' : 'Backend is down'"
            :sub-title="`Service: ${healthData.service} | Timestamp: ${healthData.timestamp}`"
          />
          <el-result
            v-else
            icon="warning"
            title="Cannot connect to backend"
            sub-title="Make sure the Spring Boot server is running on port 8080"
          />
          <div style="text-align: center; margin-top: 10px">
            <el-button type="primary" @click="checkHealth" :loading="loading">
              <el-icon><Refresh /></el-icon>
              Refresh Status
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { healthCheck } from '@/api/user'

interface HealthData {
  status: string
  timestamp: string
  service: string
}

const healthData = ref<HealthData | null>(null)
const loading = ref(false)

async function checkHealth() {
  loading.value = true
  try {
    const res = await healthCheck()
    healthData.value = res.data
  } catch {
    healthData.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  checkHealth()
})
</script>

<style scoped>
.home-container {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: bold;
}

.description {
  font-size: 16px;
  line-height: 1.8;
  color: #606266;
}
</style>
