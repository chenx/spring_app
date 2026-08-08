<template>
  <div class="home-container">
    <el-row :gutter="20" justify="center">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon :size="28"><Monitor /></el-icon>
              <span>Welcome to Spring Boot App</span>
            </div>
          </template>
          <p class="description">
            Full-stack demo project built with Spring Boot 3.x (Java 21) backend
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
      </el-col>
    </el-row>
  </div>
</template>

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
