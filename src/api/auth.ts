export function getGoogleAuthUrl(): string {
  return import.meta.env.VITE_GOOGLE_AUTH_URL ?? 'http://localhost:8000/auth/google'
}