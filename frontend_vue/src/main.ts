import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'

// Configure Axios Interceptor globally
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    console.log('main.ts token: ', token)
    
    // If a token exists in local storage, inject it into the HTTP Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
      // config.headers['Authorization'] = 'Basic ' + btoa('user:password')
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

const app = createApp(App)

// Register Element Plus icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus)
app.use(router)
app.mount('#app')
