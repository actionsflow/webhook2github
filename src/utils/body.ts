import { log } from '../log'
/**
 * readRequestBody reads in the incoming request body
 * Use await getBody(..) in an async function to get the string
 * @param {Request} request the incoming request to read from
 */
export async function getBody(
  request: Request | Response,
): Promise<string | null> {
  const { headers } = request
  const contentType = headers.get('content-type') || ''
  try {
    if (contentType.includes('application/json')) {
      return JSON.stringify(await request.json())
    } else if (contentType.includes('application/text')) {
      return await request.text()
    } else if (contentType.includes('text/html')) {
      return await request.text()
    } else if (contentType.includes('form')) {
      return await request.text()

      // const formData = await request.formData()
      // const body: Record<string, unknown> = {}
      // for (const entry of formData.entries()) {
      //   body[entry[0]] = entry[1]
      // }
      // return JSON.stringify(body)
    } else {
      return await request.text()
      // const myBlob = await request.blob()
      // const objectURL = URL.createObjectURL(myBlob)
      // return objectURL
    }
  } catch (error) {
    // log.warn('parse body error', error)
    return null
  }
}
