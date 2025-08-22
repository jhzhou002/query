import { createApp } from 'vue'

// 创建一个简单的测试组件
const App = {
  template: `
    <div id="app" style="padding: 20px;">
      <h1>问卷查询系统管理后台</h1>
      <p>Vue.js 应用正常加载！</p>
      <div style="margin-top: 20px;">
        <button @click="showMessage" style="padding: 10px 20px; background: #409eff; color: white; border: none; border-radius: 4px;">
          点击测试
        </button>
      </div>
      <p v-if="message" style="margin-top: 20px; color: green;">{{ message }}</p>
    </div>
  `,
  data() {
    return {
      message: ''
    }
  },
  methods: {
    showMessage() {
      this.message = 'Vue.js 应用运行正常！'
    }
  }
}

const app = createApp(App)
app.mount('#app')