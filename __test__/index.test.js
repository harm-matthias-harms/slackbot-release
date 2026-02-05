import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import * as core from '@actions/core'
import * as github from '@actions/github'
import { run } from '../src/index'
import * as slack from '../src/slack'

describe('run', () => {
  let slackWebhookUrl, release, repo, notifySpy

  beforeEach(() => {
    slackWebhookUrl = 'https://example.com/slack-webhook'
    release = { name: 'Test Release', html_url: 'https://example.com/release' }
    repo = { owner: 'test-owner', name: 'test-repo' }

    vi.mock('@actions/core', { spy: true })
    vi.mocked(core.getInput).mockReturnValue(slackWebhookUrl)
    vi.spyOn(github.context, 'eventName', 'get').mockReturnValue('release')
    vi.spyOn(github.context, 'repo', 'get').mockReturnValue(repo)
    vi.spyOn(github.context, 'payload', 'get').mockReturnValue({ release })
    vi.spyOn(core, 'info').mockImplementation(() => { })
    notifySpy = vi.spyOn(slack, 'notify')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when event is a release', () => {
    it('should call notify', async () => {
      notifySpy.mockResolvedValue({ ok: true })

      await run()

      expect(notifySpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('when event is not a release', () => {
    beforeEach(() => {
      vi.spyOn(github.context, 'eventName', 'get').mockReturnValue('push')
    })

    it('when event is not a release', async () => {
      const infoSpy = vi.spyOn(core, 'info')

      await run()

      expect(infoSpy).toHaveBeenCalledWith('Action should only be run on release publish event!')
    })

    it('should not call notify', async () => {
      notifySpy.mockResolvedValue({ ok: true })

      await run()

      expect(notifySpy).not.toHaveBeenCalled()
    })
  })

  describe('when notify throws an error', () => {
    it('should set failed', async () => {
      const error = new Error('Notify error')
      const setFailedSpy = vi.spyOn(core, 'setFailed')
      notifySpy.mockRejectedValue(error)

      await run()

      expect(setFailedSpy).toHaveBeenCalledTimes(1)
      expect(setFailedSpy).toHaveBeenCalledWith(error.message)
    })
  })
})
