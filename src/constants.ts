export const defaultResponse = `This API enables forward webhook requests to github repository_dispatch event webhook. <https://docs.github.com/en/actions/reference/events-that-trigger-workflows#repository_dispatch>.

Usage:

https://webhook.actionsflow.workers.dev/                                                                   Shows help
https://webhook.actionsflow.workers.dev/<owner>/<repo>/<your-path>?__token=<your-github-personal-token>    Forward webhook request

The API will forward the original request to \`https://api.github.com/repos/<owner>/<repo>/dispatches\`, with body:

{
  "event_type": "webhook",
  "client_payload": {
    "path": "<your-path>",
    "method": "<request.method>",
    "headers": "<request.headers>",
    "body": "<request body>"
  }
}

The API default reponse will use the github api response. You can use search params \`__response_code\`, \`__response_content_type\`, \`__response_body\` to specify.
You can also use headers \`X-Github-Authorization\` instead of search params \`__token\`

The API also supports the cors request.

Source code: https://github.com/actionsflow/webhook2github
`
export const defaultResponseCode = 200
export const defaultResponseContentType = 'application/json'
export const defaultResponseBody = `{ "success": true }`
export const systemSearchParams = [
  '__response_code',
  '__response_content_type',
  '__response_body',
  '__token',
]
export const EVENT_TYPE = 'webhook'
export const systemHeaders = ['X-Github-Authorization']
