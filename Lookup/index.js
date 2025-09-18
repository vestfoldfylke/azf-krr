const { logger } = require('@vtfk/logger')
const getMaskinportenToken = require('../lib/maskinporten-token')
const { getResponseObject } = require('../lib/get-response-object')
const { getData } = require('../lib/get-data')
const HTTPError = require('../lib/http-error')
const config = require('../config')

module.exports = async function (context, req) {
  try {
    const { body } = req
    if (!Array.isArray(body)) throw new HTTPError(400, 'Payload must be an array!')

    const token = await getMaskinportenToken()
    if (!token) throw new HTTPError(500, 'Unable to get token')

    const persons = await getData(config.krr.url, { personidentifikatorer: body }, token.access_token)
    logger('info', ['lookup', 'returning persons', persons.personer ? persons.personer.length : 0], context)

    if (req.query.includeInactive === 'true') {
      logger('info', ['lookup', 'queryParam includeInactive is true returning all persons'], context)
      return getResponseObject(persons)
    }

    const result = {
      personer: persons.personer ? persons.personer.filter(p => typeof p.status === 'string' && p.status.toUpperCase() === 'AKTIV') : []
    }
    return getResponseObject(result)
  } catch (error) {
    logger('error', ['lookup', 'err', error.response?.data || error.message], context)

    if (error instanceof HTTPError) return error.toJSON()
    return new HTTPError(500, 'An unknown error occured', error.response?.data || error.stack || error.toString()).toJSON()
  }
}
