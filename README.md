# webhook2github

This API enables forward webhook requests to [github repository_dispatch event webhook](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#repository_dispatch).

API Endpoint: [`https://webhook.actionsflow.workers.dev/`](https://webhook.actionsflow.workers.dev/)

## Usage <a name = "usage"></a>

```bash
https://webhook.actionsflow.workers.dev/<owner>/<repo>/<your-path>?__token=<your-github-personal-token>
```

The default response of the webhook will use [the github `create-a-repository-dispatch-event` API response](https://docs.github.com/en/rest/reference/repos#create-a-repository-dispatch-event). You can use search params `__response_code`, `__response_content_type`, `__response_body` to specify a custom response.

You can also use headers `X-Github-Authorization` instead of search params `__token` for more security.

The webhook also supports the cross-origin resource sharing request.

For example:

```bash
curl --request POST 'https://webhook.actionsflow.workers.dev/actionsflow/webhook2github/webhook/webhook?__token=<your-github-personal-token>' \
--header 'Content-Type: application/json' \
--data-raw '{
    "key": "value"
}'
```

Specify response code example:

```bash
curl --request POST 'https://webhook.actionsflow.workers.dev/actionsflow/webhook2github/webhook/webhook?__token=<your-github-personal-token>&__response_code=200' \
--header 'Content-Type: application/json' \
--data-raw '{
    "key": "value"
}'
```

An axios example:

```javascript
var axios = require('axios')
var data = JSON.stringify({ key: 'value' })

var config = {
  method: 'post',
  url:
    'https://webhook.actionsflow.workers.dev/actionsflow/webhook2github/webhook/webhook?__token=<your-github-personal-token>',

  data: data,
}

axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data))
  })
  .catch(function (error) {
    console.log(error)
  })
```

## How It Works

This API will forward the following original webhook request:

```bash
https://webhook.actionsflow.workers.dev/<owner>/<repo>/<your-path>?__token=<your-github-personal-token>
```

To `https://api.github.com/repos/<owner>/<repo>/dispatches`, with body:

```json
{
  "event_type": "webhook",
  "client_payload": {
    "path": "<your-path>",
    "method": "<request.method>",
    "headers": "<request.headers>",
    "body": "<request body>"
  }
}
```

So Github actions will be triggered with `repository_dispatch` event.
