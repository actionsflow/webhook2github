import { IRequest } from '../interface'

export const handler = async (request: IRequest): Promise<Response> => {
  const bodyString = request.body as string
  const body = JSON.parse(bodyString)
  if (body.Type === 'SubscriptionConfirmation') {
    await fetch(body.SubscribeURL)
    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        headers: new Headers({ 'Content-Type': 'application/json' }),
      },
    )
  } else {
    throw new Error(`Can not found Type params, rawBody: ${request.body}`)
  }
}
