<template>
  <div class="landing">
    <div class="bg-grid"></div>
    <div class="bg-blobs">
      <div class="blob b1"></div>
      <div class="blob b2"></div>
      <div class="blob b3"></div>
    </div>

    <header class="nav">
      <div class="brand">
        <div class="logo">✦</div>
        <div class="name">Osheeep Notes</div>
      </div>
      <div class="nav-actions">
        <el-button v-if="!isAuthed" type="primary" round @click="goLogin">登录</el-button>
        <el-button v-if="!isAuthed" round @click="goRegister">注册</el-button>
        <el-button v-else round @click="goNotes">进入笔记</el-button>
        <el-button round @click="goTool">工具</el-button>
      </div>
    </header>

    <main class="hero">
      <div class="glass">
        <h1 class="title">
          记录灵感，整理思绪
          <span class="gradient">更优雅</span>
        </h1>
        <p class="subtitle">
          轻盈的富文本笔记应用，支持多端同步、智能标签与快捷操作。让创作与管理，都变得简单而愉悦。
        </p>
        <div class="cta">
          <el-button type="primary" size="large" class="cta-btn" @click="goNotes">立即开始</el-button>
          <el-button size="large" class="ghost-btn" @click="scrollFeatures">了解功能</el-button>
        </div>
        <div class="stats">
          <template v-for="(s, i) in stats" :key="s.label">
            <div><span class="num">{{ s.value }}</span> {{ s.label }}</div>
            <div v-if="i < stats.length - 1" class="dot"></div>
          </template>
        </div>
      </div>
    </main>

    <section ref="featuresRef" aria-label="features">
      <div class="features">
        <div v-for="f in features" :key="f.title" class="feature-card">
          <div class="f-icon">{{ f.icon }}</div>
          <div class="f-title">{{ f.title }}</div>
          <div class="f-desc">{{ f.desc }}</div>
        </div>
      </div>
    </section>

    <section aria-label="cta-strip">
      <div class="cta-strip">
        <div class="cta-strip__inner">
          <div>
            <div class="cta-strip__title">准备好开始了吗？</div>
            <div class="cta-strip__sub">用更优雅的方式记录每一刻灵感。</div>
          </div>
          <div class="cta-strip__actions">
            <el-button type="primary" size="large" @click="goNotes">立即使用</el-button>
            <el-button size="large" class="ghost-btn" @click="goRegister">创建账号</el-button>
          </div>
        </div>
      </div>
    </section>

    <footer class="footer">© 2025 Osheeep Notes · Crafted with ♥</footer>
  </div>

</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { FEATURES, type FeatureItem, STATS } from './home.data'

const router = useRouter()
const auth = useAuthStore()
const isAuthed = computed(() => auth.checkAuth())
const featuresRef = ref<HTMLElement | null>(null)
const features = ref<FeatureItem[]>(FEATURES)
const stats = ref(STATS)
function goLogin() {
  router.push({ name: 'login' })
}
function goRegister() {
  router.push({ name: 'register' })
}
function goNotes() {
  if (isAuthed.value) {
    router.push({ name: 'notes' })
  } else {
    router.push({ name: 'login', query: { redirect: '/notes' } })
  }
}
function goTool() {
  router.push({ name: 'tool' })
}
function scrollFeatures() {
  featuresRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style scoped lang="scss">
.landing {
  position: relative;
  min-height: 100vh;
  color: #fff;
  overflow: hidden;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
  background: radial-gradient(1200px 800px at 10% 10%, #1f275a 0%, transparent 60%),
    radial-gradient(1000px 700px at 90% 20%, #5a1f4b 0%, transparent 60%),
    radial-gradient(1400px 900px at 50% 100%, #083344 0%, #0a0d1a 80%);
}

.bg-grid::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(transparent 95%, rgba(255, 255, 255, 0.06) 95%),
    linear-gradient(90deg, transparent 95%, rgba(255, 255, 255, 0.06) 95%);
  background-size: 32px 32px, 32px 32px;
  opacity: 0.25;
  mask-image: radial-gradient(1000px 600px at 50% -10%, black 0%, transparent 70%);
}

.bg-blobs .blob {
  position: absolute;
  filter: blur(40px);
  opacity: 0.7;
  mix-blend-mode: screen;
  animation: float 12s ease-in-out infinite;
}

.bg-blobs .b1 {
  width: 420px;
  height: 420px;
  background: #7c3aed;
  top: -60px;
  left: -60px;
}

.bg-blobs .b2 {
  width: 380px;
  height: 380px;
  background: #06b6d4;
  top: 40%;
  right: -100px;
  animation-duration: 15s;
}

.bg-blobs .b3 {
  width: 300px;
  height: 300px;
  background: #ef4444;
  bottom: -80px;
  left: 20%;
  animation-duration: 18s;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0) translateX(0);
  }

  50% {
    transform: translateY(-20px) translateX(10px);
  }
}

.nav {
  position: relative;
  z-index: 2;
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
  display: grid;
  place-items: center;
  backdrop-filter: blur(6px);
}

.name {
  font-weight: 800;
  letter-spacing: 0.3px;
}

.nav-actions :deep(.el-button) {
  margin-left: 8px;
}

.hero {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  padding: 56px 20px 24px;
}

.glass {
  max-width: 960px;
  width: 100%;
  padding: 24px;
  border-radius: 20px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-brd);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.35), inset 0 0 40px rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(14px) saturate(120%);
}

.title {
  font-size: 28px;
  line-height: 1.2;
  font-weight: 800;
  margin: 0 0 16px;
}

@media (min-width: 640px) {
  .title {
    font-size: 44px;
  }
}

.title .gradient {
  background: linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.subtitle {
  color: rgba(255, 255, 255, 0.80);
  margin: 0 0 24px;
  font-size: 14px;
}

@media (min-width: 640px) {
  .subtitle {
    font-size: 16px;
  }
}

.cta {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-direction: column;
}

@media (min-width: 640px) {
  .cta {
    flex-direction: row;
  }
}

.cta-btn {
  box-shadow: 0 10px 24px rgba(124, 58, 237, 0.35);
}

.ghost-btn {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.06);
}

.stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  color: rgba(255, 255, 255, 0.75);
  font-size: 12px;
}

@media (min-width: 640px) {
  .stats {
    font-size: 14px;
  }
}

.stats .num {
  color: #fff;
  font-weight: 700;
  margin-right: 4px;
}

.stats .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.35);
}

.features {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  max-width: 1100px;
  padding: 24px 20px 40px;
  margin: 0 auto;
}

@media (max-width: 1023.9px) {
  .features {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 639.9px) {
  .features {
    grid-template-columns: 1fr;
  }
}

.feature-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-brd);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(10px) saturate(120%);
  box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.04);
}

.f-icon {
  font-size: 28px;
  margin-bottom: 10px;
}

.f-title {
  font-weight: 700;
  margin-bottom: 6px;
}

.f-desc {
  color: rgba(255, 255, 255, 0.80);
}

.cta-strip {
  border-radius: 20px;
  padding: 24px;
  background: linear-gradient(90deg, rgba(147, 51, 234, 0.30), rgba(37, 99, 235, 0.30));
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  max-width: 1100px;
  margin: 0 auto 40px;
}

.cta-strip__inner {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
}

@media (min-width: 640px) {
  .cta-strip__inner {
    flex-direction: row;
  }
}

.cta-strip__title {
  font-size: 20px;
  font-weight: 800;
}

@media (min-width: 640px) {
  .cta-strip__title {
    font-size: 24px;
  }
}

.cta-strip__sub {
  color: rgba(255, 255, 255, 0.80);
  font-size: 14px;
}

.cta-strip__actions {
  display: flex;
  gap: 12px;
}

.footer {
  text-align: center;
  color: rgba(255, 255, 255, 0.65);
  padding: 16px 0 24px;
}
</style>