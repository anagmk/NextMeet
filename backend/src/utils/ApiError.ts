class ApiError extends Error {
  statusCode: number;
  errors: any[];
  success: boolean;
  isOperational: boolean;

  constructor(statusCode: number, message = "Something went wrong", errors: any[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;       // array of field-level validation errors, if any
    this.success = false;
    this.isOperational = true;  // distinguishes expected errors from bugs/crashes

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;