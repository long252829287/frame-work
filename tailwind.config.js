/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2.5rem',
        '2xl': '3rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
    extend: {
      // 扩展其他主题配置
    },
  },
  plugins: [],
  // 确保不与现有的 CSS 变量冲突
  corePlugins: {
    preflight: false, // 禁用 Tailwind 的 reset，使用我们自己的全局样式
  },
}
