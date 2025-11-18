# Frontend - GPT Model Manager UI

React + Vite application for managing GPT models.

## 🚀 Setup

```bash
npm install
npm run dev
```

App runs on `http://localhost:3000`

## 🎨 Features

- **Dashboard View**: See all available models at a glance
- **Feature Flags**: Real-time display of configuration status
- **Model Cards**: Interactive cards for each GPT model
- **Toggle Controls**: Enable/disable models with one click
- **Responsive Design**: Works on desktop and mobile
- **Live Updates**: Changes reflect immediately

## 🏗️ Project Structure

```
src/
├── App.jsx              # Main application component
├── App.css              # Application styles
├── main.jsx             # React entry point
├── index.css            # Global styles
└── components/
    └── ModelCard.jsx    # Reusable model card component
```

## 🎯 Components

### App.jsx
Main application component that:
- Fetches configuration from API
- Manages state for models and feature flags
- Handles model enable/disable actions
- Displays success/error messages

### ModelCard.jsx
Reusable component for displaying model information:
- Model name and description
- Enable/disable status
- Default model badge
- Toggle button

## 🔌 API Integration

The frontend connects to the backend at `http://localhost:5000/api` using Axios.

Vite proxy configuration handles CORS in development.

## 🎨 Styling

- Modern dark theme
- Gradient backgrounds
- Smooth animations
- Responsive grid layout
- Color-coded status indicators

## 🧪 Testing

1. Start backend server first
2. Run `npm run dev`
3. Open `http://localhost:3000`
4. Interact with model toggles
5. Verify changes persist on refresh

## 📦 Build

```bash
npm run build    # Creates dist/ folder
npm run preview  # Preview production build
```

## 🔧 Development

The dev server includes:
- Hot Module Replacement (HMR)
- Fast refresh for React components
- Automatic port selection if 3000 is busy
- Proxy to backend API
