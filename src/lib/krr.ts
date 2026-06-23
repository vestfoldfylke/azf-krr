import { logger } from '@vestfoldfylke/loglady'
import config from '../config.js'
import { getMaskinportenToken } from './maskinporten-token.js'

export type KrrPerson = {
  status: "AKTIV" | "IKKE_REGISTRERT" | "SLETTET"
  [key: string]: unknown
}

export type KrrResponse = {
  personer: KrrPerson[]
}

export const krr = async (identifiers: string[]): Promise<KrrResponse> => {
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

  const result = await response.json()

  if (!result || !Array.isArray(result.personer)) {
    throw new Error('Invalid response from KRR')
  }

  const persons: KrrResponse = {
    personer: result.personer
  }

  return persons
}
