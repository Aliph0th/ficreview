import { TokenType } from './api.constants';

export const REDIS_KEYS = {
   TOKEN: (type: TokenType, token: string, userID: number) => `token:${type}:${token}@${userID}`,
   COOLDOWN_EMAIL_VERIFY_RESEND: (userID: number) => `cooldown:email_verify_resend@${userID}`,
   VER: {
      user: (id: number) => `ver:user:${id}`,
      comment: (id: number) => `ver:comment:${id}`,
      commentsByTarget: (type: string, id: number) => `ver:comments:${type}:${id}`,
      chapter: (id: number) => `ver:chapter:${id}`,
      chaptersByFanfic: (fanficID: number) => `ver:chapters:fanfic:${fanficID}`,
      fanfic: (id: number) => `ver:fanfic:${id}`,
      fanfics: () => `ver:fanfics`
   },

   CACHE: {
      user: (id: number, ver: number) => `user:${id}:v${ver}`,
      comment: (id: number, ver: number) => `comment:${id}:v${ver}`,
      commentsList: (type: string, id: number, page: number, limit: number, ver: number) =>
         `comments:list:${type}:${id}:p${page}:l${limit}:v${ver}`,
      chapter: (id: number, ver: number) => `chapter:${id}:v${ver}`,
      chaptersOverview: (fanficID: number, page: number, limit: number, ver: number) =>
         `chapters:overview:fanfic:${fanficID}:p${page}:l${limit}:v${ver}`,
      fanfic: (id: number, ver: number) => `fanfic:${id}:v${ver}`,
      fanficsList: (page: number, limit: number, sort: string, ver: number) =>
         `fanfics:list:p${page}:l${limit}:s${sort}:v${ver}`
   }
};

export const CACHE_TTL = {
   user: 60 * 10,
   comment: 60 * 2,
   commentsList: 60,
   chapter: 60 * 10,
   chaptersOverview: 60 * 3,
   fanfic: 60 * 10,
   fanficsList: 60
};
