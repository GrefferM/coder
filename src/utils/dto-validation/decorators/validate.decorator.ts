import { DtoArgumentValidator } from "../services";

/** Validates every object argument a decorated method is called with, before the method body runs. */
export function Validate() {
  return function (_target: object, _propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const originalMethod = descriptor.value;
    const dtoArgumentValidator = new DtoArgumentValidator();

    descriptor.value = async function (this: unknown, ...args: unknown[]) {
      await dtoArgumentValidator.validateAll(args);

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
