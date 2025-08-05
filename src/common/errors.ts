export class RoutineBotError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly response: unknown
  ) {
    super(message);
    this.name = "RoutineBotError";
  }
}

export class RoutineBotValidationError extends RoutineBotError {
  constructor(message: string, status: number, response: unknown) {
    super(message, status, response);
    this.name = "RoutinBotValidationError";
  }
}

export class RoutineBotResourceNotFoundError extends RoutineBotError {
  constructor(resource: string) {
    super(`Resource not found: ${resource}`, 404, {
      message: `${resource} not found`,
    });
    this.name = "RoutineBotResourceNotFoundError";
  }
}

export class RoutineBotAuthenticationError extends RoutineBotError {
  constructor(message = "Authentication failed") {
    super(message, 401, { message });
    this.name = "RoutineBotAuthenticationError";
  }
}

export class RoutineBotPermissionError extends RoutineBotError {
  constructor(message = "Insufficient permissions") {
    super(message, 403, { message });
    this.name = "RoutineBotPermissionError";
  }
}

export function isRoutineBotError(error: unknown): error is RoutineBotError {
  return error instanceof RoutineBotError;
}

export function createRoutineBotError(
  status: number,
  response: any
): RoutineBotError {
  switch (status) {
    case 401:
      return new RoutineBotAuthenticationError(response?.message);
    case 403:
      return new RoutineBotPermissionError(response?.message);
    case 404:
      return new RoutineBotResourceNotFoundError(
        response?.message || "Resource"
      );
    case 422:
      return new RoutineBotValidationError(
        response?.message || "Validation failed",
        status,
        response
      );
    default:
      return new RoutineBotError(
        response?.message || "RoutineBot API error",
        status,
        response
      );
  }
}
