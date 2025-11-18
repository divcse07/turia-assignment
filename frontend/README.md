

## 🔌 API Integration

The frontend connects to the backend at `http://localhost:5000/api` using Axios.

Vite proxy configuration handles CORS in development.

## 🔧 Development

The dev server includes:
- Hot Module Replacement (HMR)
- Fast refresh for React components
- Automatic port selection if 3000 is busy
- Proxy to backend API

```bash
npm run build    # Creates dist/ folder
```