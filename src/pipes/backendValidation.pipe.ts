import { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import { UnprocessableEntityException } from '@nestjs/common/exceptions';
import { plainToInstance } from 'class-transformer';
import { ValidationError, validate } from 'class-validator';

export class BackendValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    const object = plainToInstance(metadata.metatype, value);

    if (typeof object !== 'object') {
      return value;
    }

    const errors = await validate(object);

    if (errors.length === 0) {
      return value;
    }

    throw new UnprocessableEntityException({
      errors: this.formatError(errors),
    });
  }

  formatError(errors: ValidationError[]) {
    const reducedErrors = errors.reduce((acc, err) => {
      acc[err.property] = Object.values(err.constraints);
      return acc;
    }, {});
    return reducedErrors;
  }
}
