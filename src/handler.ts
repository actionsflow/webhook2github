import forward from './forward'
import { match } from 'path-to-regexp'
import { defaultResponse } from './constants'
import { IRequest, IParams } from './interface'
import { getBody, cors, getHeadersObj } from './utils'
import { log } from './log'
import { log as report } from './sentry'
export async function handleRequest(
  request: Request,
  event: FetchEvent,
): Promise<Response> {
  // log.debug(`new [${request.method}] request: ${request.url}`)
  // log.debug(`request headers: ${getHeadersObj(request.headers)}`)
  try {
    let method = request.method
    if (method === 'OPTIONS') {
      // handle OPTIONS cors
      const firstCorsFn = cors({ isOptions: true })
      const firstCorsResult = await firstCorsFn(request.headers, new Headers())
      if (firstCorsResult.valid) {
        return new Response(null, {
          status: 204,
          headers: firstCorsResult.headers,
        })
      }
    }

    let response: Response
    // url
    const url = request.url
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    // only forwarn /:owner/:repo/:path*
    const forwardMatchedRoute = '/:owner/:repo/:path*'
    // match specific path
    const matchFn = match(forwardMatchedRoute, { decode: decodeURIComponent })
    const matchResult = matchFn(pathname)
    if (matchResult) {
      //
      let body: string | null = null
      if (request.body) {
        try {
          body = await getBody(request)
        } catch (error) {
          // log.warn('read body error', error)
        }
      }
      if (body) {
        // log.debug('request body: ', body)
      }
      // format request
      const newRequest: IRequest = {
        method: request.method,
        path: matchResult.path,
        rawRequest: request,
        params: matchResult.params as IParams,
        searchParams: urlObj.searchParams,
        body: body,
        headers: request.headers,
        URL: urlObj,
        search: urlObj.search,
      }
      response = await forward(newRequest)
    } else {
      response = new Response(defaultResponse, {
        headers: new Headers({
          'Content-Type': 'text/plain',
        }),
      })
    }

    // handle reponse cors
    const corsFn = cors({})
    const secondCorsResult = await corsFn(request.headers, response.headers)
    const newResponse = new Response(response.body, {
      status: response.status,
      headers: secondCorsResult.headers,
    })
    return newResponse
  } catch (e) {
    // event.waitUntil(report(e, request))
    return new Response(
      JSON.stringify({
        message: e.message || 'An error occurred!',
      }),
      {
        status: e.statusCode || 500,
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
      },
    )
  }
}
