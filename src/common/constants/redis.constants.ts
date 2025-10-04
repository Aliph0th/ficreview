import { TokenType } from './api.constants';

export const REDIS_KEYS = {
   TOKEN: (type: TokenType, token: string, userID: number) => `token:${type}:${token}@${userID}`,
   COOLDOWN_EMAIL_VERIFY_RESEND: (userID: number) => `cooldown:email_verify_resend@${userID}`
};
