import { readFileSync } from 'node:fs'
import { logger } from '@vestfoldfylke/loglady'
import { TtlCache } from './ttl-cache'
import config from '../config'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const maskinportenAuth = require('@vtfk/maskinporten-auth') as (options: MaskinportenOptions) => Promise<MaskinportenTokenResponse>

interface MaskinportenOptions {
  url: string
  pfxcert: string
  privateKeyPassphrase: string | null
  audience: string
  issuer: string
  scope: string
}

export interface MaskinportenTokenResponse {
  access_token: string
  expires_in: number
}

const cache = new TtlCache()

const getMaskinportenToken = async (forceNew = false): Promise<MaskinportenTokenResponse> => {
  const cacheKey = 'maskinportenTokenKrr'

  if (!forceNew) {
    const cached = cache.get<MaskinportenTokenResponse>(cacheKey)
    if (cached) {
      logger.info('getAccessToken - Found valid token in cache, will use that instead of fetching new')
      return cached
    }
  }

  const { certificate, maskinporten, env } = config
  const pfxcert = env === 'dev' ? readFileSync(certificate.pfxPath).toString('base64') : certificate.pfxBase64

  const options: MaskinportenOptions = {
    url: maskinporten.tokenUrl,
    pfxcert,
    privateKeyPassphrase: certificate.passphrase,
    audience: maskinporten.audience,
    issuer: maskinporten.issuer,
    scope: maskinporten.scope
  }

  const token = await maskinportenAuth(options)
  logger.info('getAccessToken - Got token from Maskinporten, expires in {ExpiresIn} seconds.', token.expires_in)
  cache.set(cacheKey, token, token.expires_in)
  logger.info('getAccessToken - Token stored in cache')
  return token
}

export default getMaskinportenToken
