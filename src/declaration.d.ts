declare global {
   namespace Express {
      interface User {
         id: number;
         isEmailVerified: boolean;
      }
   }
}

export {};
