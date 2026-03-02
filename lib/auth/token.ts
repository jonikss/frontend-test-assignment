// Mock auth token for development.
// In production, the token would come from an httpOnly Secure cookie
// set by the auth server, never stored in JS-accessible storage.
export const MOCK_AUTH_TOKEN = "mock-jwt-token-for-development";
