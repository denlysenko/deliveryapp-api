export enum UserErrors {
  USER_NOT_FOUND_ERR = 'USER_NOT_FOUND_ERR',
  PASSWORD_REQUIRED_ERR = 'PASSWORD_REQUIRED_ERR',
  UNIQUE_EMAIL_ERR = 'UNIQUE_EMAIL_ERR',
  INVALID_EMAIL_ERR = 'INVALID_EMAIL_ERR',
  EMAIL_REQUIRED_ERR = 'EMAIL_REQUIRED_ERR',
  ROLE_REQUIRED_ERR = 'ROLE_REQUIRED_ERR',
}

export enum AuthErrors {
  INCORRECT_EMAIL_OR_PASSWORD_ERR = 'INCORRECT_EMAIL_OR_PASSWORD_ERR',
  INCORRECT_PASSWORD_ERR = 'INCORRECT_PASSWORD_ERR',
  UNAUTHORIZED_ERR = 'UNAUTHORIZED_ERR',
}

export enum OrderErrors {
  CITY_FROM_REQUIRED_ERR = 'CITY_FROM_REQUIRED_ERR',
  CITY_TO_REQUIRED_ERR = 'CITY_TO_REQUIRED_ERR',
  ADDRESS_FROM_REQUIRED_ERR = 'ADDRESS_FROM_REQUIRED_ERR',
  ADDRESS_TO_REQUIRED_ERR = 'ADDRESS_TO_REQUIRED_ERR',
  CARGO_NAME_REQUIRED_ERR = 'CARGO_NAME_REQUIRED_ERR',
  CARGO_WEIGHT_REQUIRED_ERR = 'CARGO_WEIGHT_REQUIRED_ERR',
  PHONE_REQUIRED_ERR = 'PHONE_REQUIRED_ERR',
  CLIENT_REQUIRED_ERR = 'CLIENT_REQUIRED_ERR',
  INVALID_EMAIL_ERR = 'INVALID_EMAIL_ERR',
  EMAIL_REQUIRED_ERR = 'EMAIL_REQUIRED_ERR',
}

export enum PaymentErrors {
  METHOD_REQUIRED_ERR = 'METHOD_REQUIRED_ERR',
  ORDER_REQUIRED_ERR = 'ORDER_REQUIRED_ERR',
  CLIENT_REQUIRED_ERR = 'CLIENT_REQUIRED_ERR',
  TOTAL_REQUIRED_ERR = 'TOTAL_REQUIRED_ERR',
  TOTAL_NOT_NUMBER_ERR = 'TOTAL_NOT_NUMBER_ERR',
  DUE_DATE_REQUIRED_ERR = 'DUE_DATE_REQUIRED_ERR',
}
