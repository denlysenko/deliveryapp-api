export interface BaseResponse<T> {
  rows: T[];
  count: number;
}
