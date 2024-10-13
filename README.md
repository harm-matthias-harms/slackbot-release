# Slackbot Release

Dead simple GitHub action to send release notes to slack.

## Example

```yaml
name: Slackbot on release

on:
  release:
    types:
      - created

jobs:
  notify_slack:
    name: Post release notes to slack
    runs-on: ubuntu-latest
    steps:
      - uses: harm-matthias-harms/slackbot-release@v0
        with:
          slack-webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## Inputs

| Input               | Description                           | Default |
| ------------------- | ------------------------------------- | ------- |
| `slack-webhook-url` | The webhook URL for the Slack channel | None    |

## Attributions

Based on the awesome work of <https://github.com/amendx/slackbot-release>, just with focused functionality and more automation.
