function readEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. Add it to .env.local`
    );
  }
  return value.replace(/\/+$/, "");
}

export const config = {
  jiosaavnApiUrl: readEnv("JIOSAAVN_API_URL"),
} as const;
