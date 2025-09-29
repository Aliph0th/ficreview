import * as winston from 'winston';

export const loggerPrintF = (
   info: winston.Logform.TransformableInfo & {
      message: any;
      timestamp: string;
      context: string;
      ms?: string;
      stack?: string[];
   }
) => {
   const level = info.level.replace(
      /(info|warn|debug|error|fatal|trace)/gi,
      match => `[${match.toUpperCase()}]`
   );
   const timestamp = new Date(info.timestamp)
      .toLocaleString('sv', {
         year: 'numeric',
         month: 'numeric',
         day: 'numeric',
         hour: 'numeric',
         minute: 'numeric',
         second: 'numeric',
         fractionalSecondDigits: 3
      })
      .replace(' ', 'T')
      .replace(',', '.');
   return `\x1b[90m[${timestamp}]\x1b[0m ${level}${info.context && !info.stack ? ` (${info.context})` : ''} - ${info.message}${info.ms ? ` \x1b[90m${info.ms}\x1b[0m` : ''}${info.stack ? `\n\x1B[31m${info.stack?.join('\n')}\x1B[0m` : ''}`;
};
