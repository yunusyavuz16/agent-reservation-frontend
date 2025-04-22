import { createContext } from 'react';

const AuthContext = createContext({
  auth: {
    isAuthenticated: false,
    user: null,
    token: null
  },
  login: () => {},
  logout: () => {}
});

export default AuthContext;