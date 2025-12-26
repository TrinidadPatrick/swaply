export class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
    // This tells TypeScript "I am an Error, but with a status code"
    Object.setPrototypeOf(this, AppError.prototype);
  }
}