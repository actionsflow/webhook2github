export const getEditableHeaders = (originHeaders: Headers): Headers => {
  const headers = new Headers()

  for (let pair of originHeaders.entries()) {
    headers.set(pair[0], pair[1])
  }
  return headers
}

export const getHeadersObj = (
  originHeaders: Headers,
): Record<string, string> => {
  const headersObj: Record<string, string> = {}
  for (var pair of originHeaders.entries()) {
    const key = pair[0]
    const value = pair[1]
    headersObj[key] = value
  }
  return headersObj
}
export const printHeaders = (headers: Headers): void => {
  const headersObj: Record<string, string> = {}
  for (let pair of headers.entries()) {
    headersObj[pair[0]] = pair[1]
  }
}
