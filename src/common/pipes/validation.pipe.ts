import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata;
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const messages = errors.map(error => {
        const constraints = Object.values(error.constraints || {});
        return {
          field: error.property,
          message: constraints.length > 0 ? constraints[0] : 'Validation error',
          value: error.value
        };
      });

      throw new BadRequestException({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: (Function)[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype as any);
  }
}
