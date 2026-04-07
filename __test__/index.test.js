import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import * as core from '@actions/core'
import * as github from '@actions/github'
import { run } from '../src/index'
import { notify } from '../src/slack'

vi.mock('@actions/core', () => {
  return {
    getInput: vi.fn(),
    setFailed: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    debug: vi.fn()
  }
})

vi.mock('@actions/github', () => {
  return {
    context: {
      eventName: 'release',
      repo: { owner: 'test-owner', name: 'test-repo' },
      payload: { release: { name: 'Test Release', html_url: 'https://example.com/release', body: 'Test body' } }
    }
  }
})

vi.mock('../src/slack', () => {
  return {
    notify: vi.fn()
  }
})

describe('run', () => {
  let slackWebhookUrl

  beforeEach(() => {
    slackWebhookUrl = 'https://example.com/slack-webhook'
    vi.mocked(core.getInput).mockReturnValue(slackWebhookUrl)
    vi.mocked(notify).mockResolvedValue({ ok: true })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when event is a release', () => {
    it('should call notify', async () => {
      vi.mocked(notify).mockResolvedValue({ ok: true })

      await run()

      expect(vi.mocked(notify)).toHaveBeenCalledTimes(1)
    })
  })

  describe('when event is not a release', () => {
    beforeEach(() => {
      vi.mocked(github.context).eventName = 'push'
    })

    afterEach(() => {
      vi.mocked(github.context).eventName = 'release'
    })

    it('when event is not a release', async () => {
      const infoSpy = vi.mocked(core.info)

      await run()

      expect(infoSpy).toHaveBeenCalledWith('Action should only be run on release publish event!')
    })

    it('should not call notify', async () => {
      vi.mocked(notify).mockClear()

      await run()

      expect(vi.mocked(notify)).not.toHaveBeenCalled()
    })
  })

  describe('when notify throws an error', () => {
    it('should set failed', async () => {
      const error = new Error('Notify error')
      const setFailedSpy = vi.mocked(core.setFailed)
      const notifySpy = vi.mocked(notify)
      notifySpy.mockRejectedValue(error)

      await run()

      expect(notifySpy).toHaveBeenCalledTimes(1)
      expect(setFailedSpy).toHaveBeenCalledTimes(1)
      expect(setFailedSpy).toHaveBeenCalledWith(error.message)
    })
  })
})
