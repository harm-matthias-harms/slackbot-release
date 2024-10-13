import * as core from '@actions/core'
import * as github from '@actions/github'
import { notify } from './slack'

export async function run () {
  try {
    if (github.context.eventName !== 'release') {
      core.info('Action should only be run on release publish event!')
      return
    }

    const repo = github.context.repo
    const release = github.context.payload.release
    const slackWebhookUrl = core.getInput('slack-webhook-url')

    await notify(slackWebhookUrl, release, repo)
    core.info('Slack notification sent.')
  } catch (e) {
    core.setFailed(e.message)
  }
}

run()
