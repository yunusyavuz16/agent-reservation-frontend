# Resource Reservation System - Frontend

This is the frontend part of the Resource Reservation System, built with React, TypeScript, and Material-UI.

## Environment Setup

The application uses environment variables for configuration. Follow these steps to set up your environment:

1. Create a `.env` file in the root of the project:

```
REACT_APP_API_URL=http://localhost:5120/api
REACT_APP_ENVIRONMENT=development
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | API endpoint URL | http://localhost:5120/api |
| `REACT_APP_ENVIRONMENT` | Current environment (development, production) | development |

## Running the Application

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

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