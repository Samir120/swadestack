import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Language, Theme } from '../../models/types/common.types';

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('theme') as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

interface UIState {
  language: Language;
  theme: Theme;
  isMenuOpen: boolean;
  isCartOpen: boolean;
}

const initialState: UIState = {
  language: (localStorage.getItem('language') as Language) || 'en',
  theme: getInitialTheme(),
  isMenuOpen: false,
  isCartOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
      localStorage.setItem('language', action.payload);
    },
    toggleMenu: (state) => {
      state.isMenuOpen = !state.isMenuOpen;
    },
    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },
    closeCart: (state) => {
      state.isCartOpen = false;
    },
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    toggleTheme: (state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      state.theme = next;
      localStorage.setItem('theme', next);
    },
  },
});

export const { setLanguage, toggleMenu, toggleCart, closeCart, setTheme, toggleTheme } = uiSlice.actions;
export default uiSlice.reducer;
