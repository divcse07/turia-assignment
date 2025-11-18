# Backend API - GPT Model Manager

Node.js + Express REST API for managing GPT model configurations.

## 🚀 Setup

```bash
npm install
npm start
```

Server runs on `http://localhost:5000`

## 📋 API Documentation

### GET /api/config
Get complete configuration including models and feature flags.

**Response:**
```json
{
  "models": { ... },
  "defaultModel": "gpt-5-mini",
  "featureFlags": {
    "gpt5MiniEnabled": true,
    "enabledForAllClients": true
  }
}
```

### GET /api/models
Get all available models.

### POST /api/models/:modelId/enable
Enable a specific model.

**Example:**
```bash
curl -X POST http://localhost:5000/api/models/gpt-5-mini/enable
```

### POST /api/models/:modelId/disable
Disable a specific model.

### PUT /api/config
Update entire configuration (use with caution).

### GET /health
Health check endpoint.

## 📁 Files

- `server.js` - Main Express server
- `config.json` - Model configuration and feature flags
- `.env` - Environment variables
- `package.json` - Dependencies

## 🔧 Configuration

Edit `config.json` to modify models and feature flags.

## ⚡ Development

```bash
npm run dev  # Uses nodemon for auto-reload
```
