import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

interface AppError {
  status: number;
  message: string;
}

export const handleError = (error: unknown): AppError => {
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        const cause = (error.meta as any)?.driverAdapterError?.cause?.originalMessage;
        if(cause){
            const match = cause.match(/key '(.+?)'/);
            if (match && match[1]) {
                const constraintName = match[1];
                // extract last part as column name
                const parts = constraintName.split('_');
                var field = parts.slice(1, -1).join('_') || parts[0];
            }
        }
        return {
          status: 409,
          message: `${field} already exists`,
        };
      }

      case 'P2025':
        return {
          status: 404,
          message: 'Record not found',
        };

      default:
        return {
          status: 400,
          message: 'Database error',
        };
    }
  }

  return {
    status: 500,
    message: 'Internal server error',
  };
};