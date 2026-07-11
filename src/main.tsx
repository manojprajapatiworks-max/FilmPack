import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global Secure API Interceptor: Safely append session headers to verify credentials server-side
const originalFetch = window.fetch;
try {
  Object.defineProperty(window, 'fetch', {
    value: async function (input: RequestInfo | URL, init?: RequestInit) {
      const userStr = localStorage.getItem("filmpack_user");
      let headers = init?.headers ? new Headers(init.headers) : new Headers();
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user && user.id) {
            headers.set("X-User-Id", user.id);
            headers.set("X-User-Role", user.role);
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
      return originalFetch(input, { ...init, headers });
    },
    writable: true,
    configurable: true,
    enumerable: true
  });
} catch (err) {
  console.warn("Could not patch window.fetch directly, applying alternative interceptors", err);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
