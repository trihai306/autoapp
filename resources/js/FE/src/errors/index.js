export class UnauthorizedError extends Error {
  constructor(message = "Session expired or invalid.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}
