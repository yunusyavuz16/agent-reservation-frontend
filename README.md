# Resource Reservation System - Frontend

This is the frontend part of the Resource Reservation System, built with React, TypeScript, Material-UI, and Vite.

## Environment Setup

The application uses environment variables for configuration. Follow these steps to set up your environment:

1. Create a `.env` file in the root of the project based on `.env.example`:

```
VITE_API_URL=http://localhost:5120/api
VITE_ENVIRONMENT=development
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | API endpoint URL | http://localhost:5120/api |
| `VITE_ENVIRONMENT` | Current environment (development, production) | development |

## Running the Application

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Building for Production

```bash
npm run build
```

This will generate optimized production files in the `dist` directory.

## Preview Production Build

```bash
npm run preview
```

## API Client

The application uses a centralized API client (`src/utils/api.ts`) for all API requests. This client:

- Automatically adds authentication tokens to requests
- Handles authentication errors (e.g., redirecting to login on 401)
- Uses the environment variables for configuration

## Application Structure

- `/src/components`: React components
- `/src/stores`: State management using Zustand
- `/src/types`: TypeScript interfaces and types
- `/src/utils`: Utility functions and helpers

## Authentication

The application uses JSON Web Tokens (JWT) for authentication. The token is stored in the browser's local storage and is automatically included in API requests.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
