const { readFileSync } = require('node:fs')
const { logger } = require('@vestfoldfylke/loglady')
const maskinportenToken = require('@vtfk/maskinporten-auth')
const NodeCache = require('node-cache')
const { certificate, maskinporten, env } = require('../config')

const cache = new NodeCache({ stdTTL: 3600 })

module.exports = async (forceNew = false) => {
  const cacheKey = 'maskinportenTokenKrr'

  if (!forceNew && cache.get(cacheKey)) {
    logger.info('getAccessToken - Found valid token in cache, will use that instead of fetching new')
    return (cache.get(cacheKey))
  }

  const pfxcert = env === 'dev'
    ? readFileSync(certificate.pfxPath).toString('base64') // TODO: toString() doesn't have an overload that supports base64.......
    : certificate.pfxBase64 // hent fra keyvault (lykke til!)

  const options = {
    url: maskinporten.tokenUrl,
    pfxcert,
    privateKeyPassphrase: certificate.passphrase,
    audience: maskinporten.audience,
    issuer: maskinporten.issuer,
    scope: maskinporten.scope
  }

  const token = await maskinportenToken(options)
  logger.info('getAccessToken - Got token from Maskinporten, expires in {ExpiresIn} seconds.', token.expires_in)
  cache.set(cacheKey, token, token.expires_in)
  logger.info('getAccessToken - Token stored in cache')
  return token
}
