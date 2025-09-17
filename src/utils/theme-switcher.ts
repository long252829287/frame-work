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

// 当前主题状态管理
class ThemeManager {
  private currentTheme: ThemeType = 'stardew-valley';
  private readonly STORAGE_KEY = 'app-theme';

  constructor() {
    this.loadThemeFromStorage();
  }

  /**
   * 获取当前主题
   */
  getCurrentTheme(): ThemeType {
    return this.currentTheme;
  }

  /**
   * 设置主题
   */
  setTheme(theme: ThemeType): void {
    if (!AVAILABLE_THEMES[theme]) {
      console.warn(`未知主题: ${theme}`);
      return;
    }

    this.currentTheme = theme;
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

    // 触发主题变更事件
    const event = new CustomEvent('themeChanged', {
      detail: { theme, metadata: this.getThemeMetadata(theme) }
    });
    document.dispatchEvent(event);

    console.log(`主题已切换到: ${AVAILABLE_THEMES[theme].displayName}`);
  }

  /**
   * 从存储中加载主题
   */
  private loadThemeFromStorage(): void {
    try {
      const savedTheme = localStorage.getItem(this.STORAGE_KEY) as ThemeType;
      if (savedTheme && AVAILABLE_THEMES[savedTheme]) {
        this.currentTheme = savedTheme;
        this.applyTheme(savedTheme);
      } else {
        // 默认应用星露谷主题
        this.applyTheme(this.currentTheme);
      }
    } catch (error) {
      console.warn('无法从存储中加载主题设置:', error);
      this.applyTheme(this.currentTheme);
    }
  }

  /**
   * 保存主题到存储
   */
  private saveThemeToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, this.currentTheme);
    } catch (error) {
      console.warn('无法保存主题设置到存储:', error);
    }
  }
}

// 导出主题管理器实例
export const themeManager = new ThemeManager();

// Vue 3 组合式 API 钩子
export function useTheme() {
  const getCurrentTheme = () => themeManager.getCurrentTheme();
  const setTheme = (theme: ThemeType) => themeManager.setTheme(theme);
  const getAllThemes = () => themeManager.getAllThemes();
  const nextTheme = () => themeManager.nextTheme();

  return {
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