import { markdownToBlocks } from '@tryfabric/mack'

export async function notify (slackWebhookUrl, release, repo) {
  const intro = {
    type: 'header',
    text: {
      type: 'plain_text',
      text: `🎉 [${repo.owner}/${repo.name}]: ${release.name}`
    }
  }
  const link = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `<${release.html_url}>`
    }
  }
  const divider = { type: 'divider' }
  const bodyBlocks = await markdownToBlocks(release.body)

  return await fetch(slackWebhookUrl, {
    method: 'POST',
    body: JSON.stringify({
      blocks: [intro, link, divider, ...bodyBlocks]
    })
  })
}
