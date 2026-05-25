import { logger } from '@vestfoldfylke/loglady'
import config from '../config'
import { getMaskinportenToken } from './maskinporten-token'

export const krr = async (identifiers: string[]): Promise<unknown> => {
  if (!config.krr.url) {
    throw new Error('KRR URL is not configured')
  }

  const token = await getMaskinportenToken()

  const response: Response = await fetch(config.krr.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-type': 'application/json'
    },
    body: JSON.stringify({ personidentifikatorer: identifiers })
  })

  if (!response.ok) {
    const errorText = await response.text()
    logger.error(
      'Failed to fetch KRR data with Url: {Url}. Status: {Status}, StatusText: {StatusText}. Error: {Error}',
      config.krr.url,
      response.status,
      response.statusText,
      errorText
    )
    throw new Error(`Failed to fetch KRR data. Status: ${response.status}, StatusText: ${response.statusText}`)
  }

  return await response.json()
}
