const { logger } = require('@vestfoldfylke/loglady')
const { getData } = require('../lib/get-data')
const { getResponseObject } = require('../lib/get-response-object')
const HTTPError = require('../lib/http-error')
const getMaskinportenToken = require('../lib/maskinporten-token')
const config = require('../config')

module.exports = async function (context, req) {
  try {
    const { body } = req
    if (!Array.isArray(body)) {
      logger.error('lookup - err - Payload must be an array!')
      return new HTTPError(400, 'Payload must be an array!').toJSON()
    }

    const token = await getMaskinportenToken()
    if (!token) {
      logger.error('lookup - err - Unable to get token')
      return new HTTPError(500, 'Unable to get token').toJSON()
    }

    const persons = await getData(config.krr.url, { personidentifikatorer: body }, token.access_token)
    logger.info('lookup - returning persons - {PersonCount}', persons.personer ? persons.personer.length : 0)

    if (req.query.includeInactive === 'true') {
      logger.info('lookup - queryParam includeInactive is true, returning all persons')
      return getResponseObject(persons)
    }

    const result = {
      personer: persons.personer ? persons.personer.filter(p => typeof p.status === 'string' && p.status.toUpperCase() === 'AKTIV') : []
    }
    return getResponseObject(result)
  } catch (error) {
    logger.errorException(error, 'lookup failed')

    if (error instanceof HTTPError) {
      return error.toJSON()
    }

    return new HTTPError(500, 'An unknown error occured', error.stack || error.toString()).toJSON()
  }
}
