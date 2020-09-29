import { IRequest } from './interface'
import {
  getHeadersObj,
  getBody,
  getEditableHeaders,
  awsSnsHandler,
} from './utils'
import {
  defaultResponseCode,
  defaultResponseBody,
  defaultResponseContentType,
  systemSearchParams,
  EVENT_TYPE,
  systemHeaders,
} from './constants'
export default async function forward(request: IRequest): Promise<Response> {
  const params = request.params
  let forwardUrl = `https://api.github.com/repos/${params.owner}/${params.repo}/dispatches`
  let payloadPath = params.path
    ? '/' + (params.path as string[]).join('/')
    : '/'
  const searchParams = request.searchParams
  const githubToken = searchParams.get('__token')
  const gihtubHeaderAuthorizationParam = request.headers.get(
    'X-Github-Authorization',
  )
  const authorization = request.headers.get('Authorization')

  let githubAuthorization = ''
  if (githubToken) {
    githubAuthorization = `token ${githubToken}`
  } else if (gihtubHeaderAuthorizationParam) {
    if (gihtubHeaderAuthorizationParam.split(' ').length > 1) {
      githubAuthorization = gihtubHeaderAuthorizationParam
    } else {
      githubAuthorization = `token ${gihtubHeaderAuthorizationParam}`
    }
  } else if (authorization) {
    githubAuthorization = authorization
  }
  const forwardHeaders = new Headers({
    'Content-Type': 'application/json',
    Accept: '*/*',
    'User-Agent':
      request.headers.get('User-Agent') ||
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36',
  })

  if (githubAuthorization) {
    forwardHeaders.set('Authorization', githubAuthorization)
  } else {
    return new Response(
      JSON.stringify({
        success: false,
        message:
          'You must provide a github token in search parameters __token or header X-Github-Authorization',
        documentation_url:
          'https://actionsflow.github.io/docs/reference/4-webhook',
      }),
      {
        status: 401,
        headers: new Headers({
          'Content-Type': defaultResponseContentType,
        }),
      },
    )
  }
  // valid
  // intercept
  if (
    request.headers.get('x-amz-sns-message-type') === 'SubscriptionConfirmation'
  ) {
    return await awsSnsHandler(request)
  }

  const payloadSearchParams = new URLSearchParams(request.search)
  systemSearchParams.forEach((key) => {
    // delete system param
    payloadSearchParams.delete(key)
  })
  const payloadSearch = payloadSearchParams.toString()
  let finalPayloadPath =
    payloadPath + (payloadSearch ? `?${payloadSearch}` : '')
  let finalPayloadHeaders = getEditableHeaders(request.headers)
  // delete system headers key
  systemHeaders.forEach((headerKey) => {
    finalPayloadHeaders.delete(headerKey)
  })
  const builtBody: {
    event_type: string
    client_payload: Record<string, unknown>
  } = {
    event_type: EVENT_TYPE,
    client_payload: {
      path: finalPayloadPath,
      method: request.method,
      headers: getHeadersObj(finalPayloadHeaders),
    },
  }
  if (request.body) {
    builtBody.client_payload.body = request.body
  }
  const response = await fetch(forwardUrl, {
    method: 'POST',
    headers: forwardHeaders,
    body: JSON.stringify(builtBody),
  })

  let responseCode: string | number | null = searchParams.get('__response_code')
  if (!responseCode) {
    responseCode =
      response.status === 204 ? defaultResponseCode : response.status
  }
  if (!responseCode) {
    responseCode = defaultResponseCode
  }
  const responseContentType =
    searchParams.get('__response_content_type') ||
    response.headers.get('Content-Type') ||
    defaultResponseContentType
  const finalStatus = Number(responseCode)
  const originResponseBody = await getBody(response)
  const searchParamsResponseBody = searchParams.get('__response_body')
  let responseBody: string | null = defaultResponseBody
  if (searchParamsResponseBody) {
    responseBody = searchParamsResponseBody
  } else if (originResponseBody !== null) {
    responseBody = originResponseBody
  }

  if ([101, 204, 205, 304].includes(finalStatus)) {
    responseBody = null
  }

  const newResponseHeaders = getEditableHeaders(response.headers)
  newResponseHeaders.set('Content-Type', responseContentType)
  return new Response(responseBody, {
    status: finalStatus,
    headers: newResponseHeaders,
  })
}
