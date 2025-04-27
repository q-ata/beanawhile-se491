import { createContext } from "react";

export type AuthResponse = {
  ok: boolean;
  error: string;
};

export const AuthContext = createContext({
  isAuthenticated: false,
  signup: async (
    name: string,
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    return { ok: false, error: "" };
  },
  signin: async (email: string, password: string): Promise<AuthResponse> => {
    return { ok: false, error: "" };
  },
  signout: () => {},
});

export default AuthContext;
