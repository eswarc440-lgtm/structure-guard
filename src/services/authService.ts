import type { AuthUser } from "@/types";
import { mockRequest } from "./api";

const STORAGE_KEY = "simras.session";

const demoUser: AuthUser = {
  name: "R. Prasad",
  email: "r.prasad@infra.gov.in",
  phone: "+91 98490 00000",
  organization: "State Infrastructure Authority",
  role: "Infrastructure Officer",
};

export const authService = {
  current(): AuthUser | null {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },
  async login(email: string): Promise<AuthUser> {
    const user: AuthUser = { ...demoUser, email: email || demoUser.email };
    await mockRequest(null, 500);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  },
  async register(payload: { name: string; email: string; phone: string }): Promise<AuthUser> {
    const user: AuthUser = { ...demoUser, ...payload };
    await mockRequest(null, 600);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  },
  async verifyOtp(code: string): Promise<boolean> {
    await mockRequest(null, 400);
    return code.length === 6;
  },
  logout() {
    window.localStorage.removeItem(STORAGE_KEY);
  },
};
