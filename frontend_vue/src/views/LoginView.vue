<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router' // Import the router hook
import axios from 'axios'

const router = useRouter() // Initialize the router instance
const username = ref('')
const password = ref('')
const errorMessage = ref('')
const successMessage = ref('')

async function handleLogin() {
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    const response = await axios.post('/api/auth/login', {
      username: username.value,
      password: password.value
    })
    console.log(response)
    successMessage.value = response.data // "Login successful!"

    // Save token if your backend sends one (e.g., JWT)
    localStorage.setItem('token', response.data.token)
    console.log('token: ', response.data.token) // token: undefined

    // 1. Simulate saving an authentication state/token
    // In a real app, you would save response.data.token here
    // localStorage.setItem('token', 'authenticated_user_session')
    
    // 2. Redirect to the protected dashboard page
    router.push('/dashboard')
    
  } catch (error) {
    if (error.response) {
      errorMessage.value = error.response.data || 'Invalid username or password.'
    } else {
      errorMessage.value = 'Cannot connect to backend server.'
    }
  }
}
</script>

<template>
  <div class="login-container">
    <h2>Login</h2>
    
    <form @submit.prevent="handleLogin">
      <div>
        <label>Username:</label>
        <input v-model="username" type="text" required />
      </div>
      
      <div>
        <label>Password:</label>
        <input v-model="password" type="password" required />
      </div>
      
      <button type="submit">Log In</button>
    </form>

    <!-- Feedback messages -->
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
  </div>
</template>

<style scoped>
.login-container { max-width: 300px; margin: 50px auto; }
div { margin-bottom: 15px; }
input { width: 100%; padding: 8px; }
button { width: 100%; padding: 8px; background: #42b883; color: white; border: none; cursor: pointer; }
.error { color: red; margin-top: 10px; }
.success { color: green; margin-top: 10px; }
</style>
