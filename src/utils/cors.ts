'use strict'
import { getEditableHeaders } from './headers'
interface Options {
  credentials?: true
  exposeHeaders?: string | ReadonlyArray<string>
  allowHeaders?: string | ReadonlyArray<string>
  maxAge?: string
  allowMethods?: string | ReadonlyArray<string>
  origin?: boolean | string | ((headers: Headers) => string)
  isOptions?: boolean
}
/**
 * CORS middleware
 *
 * @param {Object} [options]
 *  - {String|Function(ctx)} origin `Access-Control-Allow-Origin`, default is request Origin header
 *  - {String|Array} allowMethods `Access-Control-Allow-Methods`, default is 'GET,HEAD,PUT,POST,DELETE,PATCH'
 *  - {String|Array} exposeHeaders `Access-Control-Expose-Headers`
 *  - {String|Array} allowHeaders `Access-Control-Allow-Headers`
 *  - {String|Number} maxAge `Access-Control-Max-Age` in seconds
 *  - {Boolean} credentials `Access-Control-Allow-Credentials`
 *  - {Boolean} keepHeadersOnError Add set headers to `err.header` if an error is thrown
 * @return {Function} cors middleware
 * @api public
 */
export default function (options: Options) {
  const defaults = {
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  }

  options = {
    ...defaults,
    ...options,
  }

  if (Array.isArray(options.exposeHeaders)) {
    options.exposeHeaders = options.exposeHeaders.join(',')
  }

  if (Array.isArray(options.allowMethods)) {
    options.allowMethods = options.allowMethods.join(',')
  }

  if (Array.isArray(options.allowHeaders)) {
    options.allowHeaders = options.allowHeaders.join(',')
  }

  if (options.maxAge) {
    options.maxAge = String(options.maxAge)
  }

  return async function cors(
    requestHeaders: Headers,
    responseHeaders: Headers,
  ): Promise<{ valid: boolean; headers: Headers }> {
    const originHeaders = responseHeaders
    const headers = getEditableHeaders(originHeaders)
    // If the Origin header is not present terminate this set of steps.
    // The request is outside the scope of this specification.
    const requestOrigin = requestHeaders.get('Origin')

    // Always set Vary header
    // https://github.com/rs/cors/issues/10
    headers.append('Vary', 'Origin')

    if (!requestOrigin) {
      return { valid: false, headers: headers }
    }

    let origin
    if (typeof options.origin === 'function') {
      origin = options.origin(headers)
      if ((origin as any) instanceof Promise) origin = await origin
      if (!origin) throw new Error('origin method error')
    } else {
      origin = options.origin || requestOrigin
    }

    let credentials = !!options.credentials

    const headersSet: Record<string, string> = {}

    function set(key: string, value: string) {
      headers.set(key, value)
      headersSet[key] = value
    }

    if (!options.isOptions) {
      // Simple Cross-Origin Request, Actual Request, and Redirects
      set('Access-Control-Allow-Origin', origin as string)

      if (credentials === true) {
        set('Access-Control-Allow-Credentials', 'true')
      }

      if (options.exposeHeaders) {
        set('Access-Control-Expose-Headers', options.exposeHeaders as string)
      }

      return { valid: true, headers: headers }
    } else {
      // Preflight Request

      // If there is no Access-Control-Request-Method header or if parsing failed,
      // do not set any additional headers and terminate this set of steps.
      // The request is outside the scope of this specification.
      if (!requestHeaders.get('Access-Control-Request-Method')) {
        // this not preflight request, ignore it
        return { valid: false, headers: headers }
      }

      headers.set('Access-Control-Allow-Origin', origin as string)

      if (credentials === true) {
        headers.set('Access-Control-Allow-Credentials', 'true')
      }

      if (options.maxAge) {
        headers.set('Access-Control-Max-Age', options.maxAge)
      }

      if (options.allowMethods) {
        headers.set(
          'Access-Control-Allow-Methods',
          options.allowMethods as string,
        )
      }

      let allowHeaders = options.allowHeaders
      if (!allowHeaders) {
        allowHeaders = requestHeaders.get(
          'access-control-request-headers',
        ) as string
      }
      if (allowHeaders) {
        headers.set('Access-Control-Allow-Headers', allowHeaders as string)
      }
      return { valid: true, headers: headers }
    }
  }
}
