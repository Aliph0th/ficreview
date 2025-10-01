/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
   ValidationArguments,
   ValidationOptions,
   ValidatorConstraint,
   ValidatorConstraintInterface,
   registerDecorator
} from 'class-validator';

export function NumberLength(length: number, validationOptions?: ValidationOptions) {
   return (object: any, propertyName: string) => {
      registerDecorator({
         target: object.constructor,
         propertyName,
         options: validationOptions,
         constraints: [length],
         validator: NumberLengthConstraint
      });
   };
}

@ValidatorConstraint({ name: 'NumberLength' })
export class NumberLengthConstraint implements ValidatorConstraintInterface {
   validate(value: any, args: ValidationArguments) {
      const [length] = args.constraints;
      return typeof value === 'number' && value.toString().length === length;
   }

   defaultMessage(args?: ValidationArguments) {
      return `${args?.property} must be a ${args?.constraints[0]}-digit number`;
   }
}
