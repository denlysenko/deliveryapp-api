export interface BaseQuery {
  filter?: any;
  offset?: number;
  limit?: number;
  // eslint-disable-next-line @typescript-eslint/ban-types
  order?: object;
}
