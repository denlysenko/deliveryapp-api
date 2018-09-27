export interface ApiResponse<T> {
  rows: T[];
  count: number;
}
