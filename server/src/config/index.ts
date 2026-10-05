import path from 'path';

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'worknova_jwt_secret_dev_3892742918471203',
  refreshSecret: process.env.REFRESH_SECRET || 'worknova_refresh_secret_dev_982347192847129',
  jwtAccessExpiresIn: '15m',
  jwtRefreshExpiresIn: '7d',
  cookieName: 'worknova_refresh_token',
  dataDir: path.resolve(process.cwd(), '.data'),
  uploadsDir: path.resolve(process.cwd(), 'uploads'),
  isProduction: process.env.NODE_ENV === 'production',
  aiProvider: process.env.AI_PROVIDER || 'gemini',
  aiModel: process.env.AI_MODEL || 'gemini-3.8-flash',
  geminiApiKey: process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '',
  aiTimeout: parseInt(process.env.AI_TIMEOUT || '15000', 10),
  aiMaxTokens: parseInt(process.env.AI_MAX_TOKENS || '2048', 10),
};
