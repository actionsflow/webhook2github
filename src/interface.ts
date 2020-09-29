export type IParams = Record<string, string | string[]>
export interface IRequest {
  path: string
  method: string
  search: string
  searchParams: URLSearchParams
  params: IParams
  body: string | null
  headers: Headers
  rawRequest: Request
  URL: URL
}
