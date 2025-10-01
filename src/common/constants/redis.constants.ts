import { TokenType } from './api.constants';

export const REDIS_KEYS = {
   TOKEN: (type: TokenType, token: string) => `token:${type}:${token}`
};
