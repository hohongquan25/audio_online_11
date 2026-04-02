// Shared TypeScript types for Truyen Audio platform

export interface SessionUser {
  id: string;
  email: string;
  role: "USER" | "VIP" | "ADMIN";
  vipExpiredAt: Date | null;
}

export interface ActionResult {
  success: boolean;
  message: string;
  data?: unknown;
}

export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, string[]>;
}
