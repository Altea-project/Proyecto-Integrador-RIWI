
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_MIN_LENGTH = 8;

export const ROLES = {
  ADMIN: "admin",
  CODER: "coder",
  INSTRUCTOR: "instructor",
  RECRUITER: "recruiter",
};
