import { ref } from 'vue'

// ====================================
// 主题切换工具 - Theme Switcher Utility
// ====================================

// 主题类型定义
export type ThemeType = 'stardew-valley' | 'modern' | 'dark' | 'classic';

// 主题元数据
export interface ThemeMetadata {
  name: string;
  displayName: string;
  description: string;
  preview?: string;
}

// 可用主题列表
export const AVAILABLE_THEMES: Record<ThemeType, ThemeMetadata> = {
  'stardew-valley': {
    name: 'stardew-valley',
    displayName: '星露谷物语',
    description: '温暖的田园风格，以大地色调和自然元素为主',
    preview: '#8B4513'
  },
  'modern': {
    name: 'modern',
    displayName: '现代简约',
    description: '简洁的现代设计，注重功能性和易用性',
    preview: '#2196F3'
  },
  'dark': {
    name: 'dark',
    displayName: '暗黑模式',
    description: '深色主题，减少眼部疲劳，适合夜间使用',
    preview: '#121212'
  },
  'classic': {
    name: 'classic',
    displayName: '经典蓝白',
    description: '传统的蓝白配色方案，商务感十足',
    preview: '#1E88E5'
  }
};

// 响应式主题状态
const currentThemeRef = ref<ThemeType>('stardew-valley');

// 当前主题状态管理
class ThemeManager {
  private readonly STORAGE_KEY = 'app-theme';

  constructor() {
    this.loadThemeFromStorage();
  }

  /**
   * 获取当前主题
   */
  getCurrentTheme(): ThemeType {
    return currentThemeRef.value;
  }

  /**
   * 设置主题
   */
  setTheme(theme: ThemeType): void {
    if (!AVAILABLE_THEMES[theme]) {
      console.warn(`未知主题: ${theme}`);
      return;
    }

    currentThemeRef.value = theme;
    this.saveThemeToStorage();
    this.applyTheme(theme);
  }

  /**
   * 获取主题元数据
   */
  getThemeMetadata(theme: ThemeType): ThemeMetadata | null {
    return AVAILABLE_THEMES[theme] || null;
  }

  /**
   * 获取所有可用主题
   */
  getAllThemes(): ThemeMetadata[] {
    return Object.values(AVAILABLE_THEMES);
  }

  /**
   * 切换到下一个主题
   */
  nextTheme(): void {
    const themes = Object.keys(AVAILABLE_THEMES) as ThemeType[];
    const currentIndex = themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    this.setTheme(themes[nextIndex]);
  }

  /**
   * 应用主题到DOM
   */
  private applyTheme(theme: ThemeType): void {
    // 移除所有主题类
    Object.keys(AVAILABLE_THEMES).forEach(themeName => {
      document.documentElement.classList.remove(`theme-${themeName}`);
    });

    // 添加当前主题类
    document.documentElement.classList.add(`theme-${theme}`);

    // 应用主题的CSS变量
    this.applyThemeVariables(theme);

    // 触发主题变更事件
    const event = new CustomEvent('themeChanged', {
      detail: { theme, metadata: this.getThemeMetadata(theme) }
    });
    document.dispatchEvent(event);

    console.log(`主题已切换到: ${AVAILABLE_THEMES[theme].displayName}`);
  }

  /**
   * 动态应用主题CSS变量
   */
  private applyThemeVariables(theme: ThemeType): void {
    const root = document.documentElement;
    const themeVars = this.getThemeVariables(theme);

    // 设置CSS变量
    Object.entries(themeVars).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
    });
  }

  /**
   * 获取主题变量
   */
  private getThemeVariables(theme: ThemeType): Record<string, string> {
    switch (theme) {
      case 'stardew-valley':
        return {
          // 颜色变量
          'primary-darkest': '#5D4037',
          'primary-dark': '#8B4513',
          'primary': '#A0522D',
          'primary-light': '#CD853F',
          'primary-lightest': '#DEB887',

          'secondary-darkest': '#D2B48C',
          'secondary-dark': '#E6D3A3',
          'secondary': '#F4E4BC',
          'secondary-light': '#F5F5DC',
          'secondary-lightest': '#FAFAFA',

          'accent-green-dark': '#006400',
          'accent-green': '#228B22',
          'accent-green-light': '#32CD32',
          'accent-green-bright': '#90EE90',

          'accent-orange-dark': '#CC5500',
          'accent-orange': '#FF6B35',
          'accent-orange-light': '#FF8C42',
          'accent-orange-bright': '#FFA500',

          'success': '#228B22',
          'warning': '#FFD700',
          'error': '#DC143C',
          'info': '#4169E1',

          'text-primary': '#5D4037',
          'text-secondary': '#6D4C41',
          'text-light': '#8D6E63',
          'text-inverse': '#FFFFFF',
          'text-disabled': '#BCAAA4',

          'border-primary': '#8B4513',
          'border-secondary': '#E6D3A3',
          'border-light': '#F4E4BC',
          'border-accent': '#228B22',

          // 背景变量 - 使用简化的颜色值
          'bg-primary': 'linear-gradient(135deg, #A0522D 0%, #CD853F 50%, #A0522D 100%)',
          'bg-secondary': 'linear-gradient(145deg, #F4E4BC 0%, #E6D3A3 100%)',
          'bg-card': 'linear-gradient(145deg, #F4E4BC 0%, #E6D3A3 100%)',
          'bg-overlay': 'rgba(139, 69, 19, 0.8)',
        };

      case 'modern':
        return {
          // 颜色变量
          'primary-darkest': '#0D47A1',
          'primary-dark': '#1565C0',
          'primary': '#1976D2',
          'primary-light': '#42A5F5',
          'primary-lightest': '#90CAF9',

          'secondary-darkest': '#424242',
          'secondary-dark': '#616161',
          'secondary': '#9E9E9E',
          'secondary-light': '#E0E0E0',
          'secondary-lightest': '#F5F5F5',

          'accent-green-dark': '#2E7D32',
          'accent-green': '#4CAF50',
          'accent-green-light': '#81C784',
          'accent-green-bright': '#A5D6A7',

          'accent-orange-dark': '#EF6C00',
          'accent-orange': '#FF9800',
          'accent-orange-light': '#FFB74D',
          'accent-orange-bright': '#FFCC02',

          'success': '#4CAF50',
          'warning': '#FFC107',
          'error': '#F44336',
          'info': '#2196F3',

          'text-primary': '#0D47A1',
          'text-secondary': '#424242',
          'text-light': '#757575',
          'text-inverse': '#FFFFFF',
          'text-disabled': '#BDBDBD',

          'border-primary': '#9E9E9E',
          'border-secondary': '#E0E0E0',
          'border-light': '#E0E0E0',
          'border-accent': '#4CAF50',

          // 背景变量
          'bg-primary': 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)',
          'bg-secondary': 'linear-gradient(145deg, #FAFAFA 0%, #F0F0F0 100%)',
          'bg-card': 'linear-gradient(145deg, #FFFFFF 0%, #F8F9FA 100%)',
          'bg-overlay': 'rgba(0, 0, 0, 0.5)',
        };

      case 'dark':
        return {
          // 颜色变量
          'primary-darkest': '#0D1117',
          'primary-dark': '#161B22',
          'primary': '#21262D',
          'primary-light': '#30363D',
          'primary-lightest': '#484F58',

          'secondary-darkest': '#0D1117',
          'secondary-dark': '#161B22',
          'secondary': '#21262D',
          'secondary-light': '#30363D',
          'secondary-lightest': '#484F58',

          'accent-green-dark': '#238636',
          'accent-green': '#2EA043',
          'accent-green-light': '#46D164',
          'accent-green-bright': '#7DD87D',

          'accent-orange-dark': '#BC4C00',
          'accent-orange': '#F85149',
          'accent-orange-light': '#FF7B72',
          'accent-orange-bright': '#FFACA6',

          'success': '#2EA043',
          'warning': '#D29922',
          'error': '#F85149',
          'info': '#58A6FF',

          'text-primary': '#F0F6FC',
          'text-secondary': '#8B949E',
          'text-light': '#6E7681',
          'text-inverse': '#0D1117',
          'text-disabled': '#484F58',

          'border-primary': '#30363D',
          'border-secondary': '#21262D',
          'border-light': '#484F58',
          'border-accent': '#2EA043',

          // 背景变量
          'bg-primary': 'linear-gradient(135deg, #0D1117 0%, #161B22 100%)',
          'bg-secondary': 'linear-gradient(145deg, #161B22 0%, #21262D 100%)',
          'bg-card': 'linear-gradient(145deg, #161B22 0%, #21262D 100%)',
          'bg-overlay': 'rgba(13, 17, 23, 0.8)',
        };

      case 'classic':
        return {
          // 颜色变量
          'primary-darkest': '#003366',
          'primary-dark': '#004080',
          'primary': '#0066CC',
          'primary-light': '#3399FF',
          'primary-lightest': '#66B2FF',

          'secondary-darkest': '#F0F4F8',
          'secondary-dark': '#F4F6F8',
          'secondary': '#F8FAFC',
          'secondary-light': '#FAFBFC',
          'secondary-lightest': '#FFFFFF',

          'accent-green-dark': '#006600',
          'accent-green': '#009900',
          'accent-green-light': '#33CC33',
          'accent-green-bright': '#66FF66',

          'accent-orange-dark': '#CC6600',
          'accent-orange': '#FF8800',
          'accent-orange-light': '#FFAA33',
          'accent-orange-bright': '#FFCC66',

          'success': '#009900',
          'warning': '#FF9900',
          'error': '#CC0000',
          'info': '#0099CC',

          'text-primary': '#003366',
          'text-secondary': '#333366',
          'text-light': '#666699',
          'text-inverse': '#FFFFFF',
          'text-disabled': '#9999CC',

          'border-primary': '#0066CC',
          'border-secondary': '#3399FF',
          'border-light': '#CCE6FF',
          'border-accent': '#009900',

          // 背景变量
          'bg-primary': 'linear-gradient(135deg, #FFFFFF 0%, #FAFBFC 50%, #FFFFFF 100%)',
          'bg-secondary': 'linear-gradient(145deg, #F8FAFC 0%, #F4F6F8 100%)',
          'bg-card': 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
          'bg-overlay': 'rgba(0, 51, 102, 0.8)',
        };

      default:
        return {};
    }
  }

  /**
   * 从存储中加载主题
   */
  private loadThemeFromStorage(): void {
    try {
      const savedTheme = localStorage.getItem(this.STORAGE_KEY) as ThemeType;
      if (savedTheme && AVAILABLE_THEMES[savedTheme]) {
        currentThemeRef.value = savedTheme;
        this.applyTheme(savedTheme);
      } else {
        // 默认应用星露谷主题
        this.applyTheme(currentThemeRef.value);
      }
    } catch (error) {
      console.warn('无法从存储中加载主题设置:', error);
      this.applyTheme(currentThemeRef.value);
    }
  }

  /**
   * 保存主题到存储
   */
  private saveThemeToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, currentThemeRef.value);
    } catch (error) {
      console.warn('无法保存主题设置到存储:', error);
    }
  }
}

// 导出主题管理器实例
export const themeManager = new ThemeManager();

// Vue 3 组合式 API 钩子
export function useTheme() {
  const getCurrentTheme = () => currentThemeRef.value;
  const setTheme = (theme: ThemeType) => themeManager.setTheme(theme);
  const getAllThemes = () => themeManager.getAllThemes();
  const nextTheme = () => themeManager.nextTheme();

  return {
    currentTheme: currentThemeRef, // 返回响应式引用
    getCurrentTheme,
    setTheme,
    getAllThemes,
    nextTheme
  };
}

// 工具函数：检测系统偏好
export function detectSystemThemePreference(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

// 工具函数：监听系统主题变化
export function watchSystemThemeChange(callback: (theme: 'light' | 'dark') => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {};
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches ? 'dark' : 'light');
  };

  mediaQuery.addEventListener('change', handler);

  // 返回清理函数
  return () => {
    mediaQuery.removeEventListener('change', handler);
  };
}

// CSS 类名生成器
export function getThemeClass(theme: ThemeType): string {
  return `theme-${theme}`;
}

// 主题颜色获取器（用于动态获取主题色彩）
export function getThemeColor(colorName: string, theme?: ThemeType): string | null {
  const targetTheme = theme || themeManager.getCurrentTheme();
  const element = document.documentElement;

  if (element) {
    const styles = getComputedStyle(element);
    return styles.getPropertyValue(`--theme-${colorName}`).trim() || null;
  }

  return null;
}

// 默认初始化
if (typeof window !== 'undefined') {
  // 确保主题管理器在页面加载时初始化
  document.addEventListener('DOMContentLoaded', () => {
    themeManager.getCurrentTheme(); // 这会触发主题应用
  });
}