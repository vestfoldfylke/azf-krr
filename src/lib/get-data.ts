import { logger } from '@vestfoldfylke/loglady'

export const getData = async (url: string, payload: unknown, token: string, method = 'post'): Promise<unknown> => {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-type': 'application/json'
  }

  const response = await fetch(url, {
    method: method.toUpperCase(),
    headers,
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errorText = await response.text()
    logger.error(
      'Failed to fetch data with Url: {Url}. Status: {Status}, StatusText: {StatusText}. Error: {Error}',
      url,
      response.status,
      response.statusText,
      errorText
    )
    throw new Error(`Failed to fetch data. Status: ${response.status}, StatusText: ${response.statusText}`)
  }

  return await response.json()
}
