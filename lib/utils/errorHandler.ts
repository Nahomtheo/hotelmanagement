export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors?: Record<string, string>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (error: unknown) => {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      message: error.message,
      errors: error.errors,
    };
  }

  if (error instanceof Error) {
    console.error('Unhandled error:', error);
    return {
      statusCode: 500,
      message: 'Internal server error',
    };
  }

  return {
    statusCode: 500,
    message: 'Unknown error occurred',
  };
};

export const successResponse = (data: any, message = 'Success', statusCode = 200) => {
  return {
    statusCode,
    success: true,
    message,
    data,
  };
};

export const errorResponse = (message: string, statusCode = 400, errors?: Record<string, string>) => {
  return {
    statusCode,
    success: false,
    message,
    errors,
  };
};
