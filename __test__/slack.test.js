import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { notify } from '../src/slack'

describe('notify', () => {
  let slackWebhookUrl, release, repo

  beforeEach(() => {
    slackWebhookUrl = 'https://example.com/slack-webhook'
    release = { name: 'Test Release', html_url: 'https://example.com/release', body: 'Hello World!' }
    repo = { owner: 'test-owner', name: 'test-repo' }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should send a POST request to the Slack webhook URL', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch')
    fetchSpy.mockResolvedValue({ ok: true })

    await notify(slackWebhookUrl, release, repo)

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(fetchSpy).toHaveBeenCalledWith(slackWebhookUrl, expect.objectContaining({
      method: 'POST',
      body: expect.any(String)
    }))
  })

  it('should throw an error if the fetch request fails', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch')
    fetchSpy.mockRejectedValue(new Error('Fetch error'))

    await expect(notify(slackWebhookUrl, release, repo)).rejects.toThrowError('Fetch error')
  })
})
