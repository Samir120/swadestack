import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store/store';
import './i18n/i18n';
import App from './App';
import './index.css';

// Apply theme class synchronously before render to prevent flash-of-wrong-theme
const storedTheme = localStorage.getItem('theme');
const theme = storedTheme === 'light' || storedTheme === 'dark'
  ? storedTheme
  : (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
document.documentElement.classList.toggle('dark', theme === 'dark');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
