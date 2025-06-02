// -----------------------ERROR TYPES----------------------------
export const AUTHENTICATION_ERROR = 'AuthenticationError';
export const AUTHORIZATION_ERROR = 'AuthorizationError';
export const VALIDATION_ERROR = 'ValidationError';
export const NOT_FOUND_ERROR = 'NotFoundError';
export const INTERNAL_SERVER_ERROR = 'InternalServerError';
export const CONFLICT_ERROR = 'ConflictError';
export const UNPROCESSABLE_ENTITY_ERROR = 'UnprocessableEntityError';
export const FORBIDDEN_ERROR = 'ForbiddenError';
export const BAD_REQUEST_ERROR = 'BadRequestError';

// -----------------------STATUS CODE----------------------------
export const HTTP_OK = 200;
export const HTTP_CREATED = 201;
export const HTTP_NO_CONTENT = 204;
export const HTTP_BAD_REQUEST = 400;
export const HTTP_UNAUTHENTICATED = 401;
export const HTTP_FORBIDDEN = 403;
export const HTTP_NOT_FOUND = 404;
export const HTTP_CONFLICT = 409;
export const HTTP_UNPROCESSABLE_ENTITY = 422;
export const HTTP_INTERNAL_SERVER_ERROR = 500;
export const HTTP_SERVICE_UNAVAILABLE = 503;
