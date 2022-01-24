export class ApiError extends Error {
  public errorType: ErrorTypeEnum
  public clientMessage?: string

  public constructor(errorType: ErrorTypeEnum, serverMessage?: string, clientMessage?: string) {
    super(serverMessage)
    this.errorType = errorType
    this.clientMessage = clientMessage || serverMessage
  }
}

export enum ErrorTypeEnum {
  invalidElementId,
  invalidContentType
}
