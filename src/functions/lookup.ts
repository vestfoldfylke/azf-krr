import type { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { app } from '@azure/functions'
import { logger } from '@vestfoldfylke/loglady'
import config from '../config'
import { getData } from '../lib/get-data'
import { getResponseObject } from '../lib/get-response-object'
import HTTPError from '../lib/http-error'
import getMaskinportenToken from '../lib/maskinporten-token'

interface KrrPerson {
  status?: string
  [key: string]: unknown
}

interface KrrResponse {
  personer?: KrrPerson[]
  [key: string]: unknown
}

async function lookup(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body = await request.json()
    if (!Array.isArray(body)) {
      logger.error('lookup - err - Payload must be an array!')
      return new HTTPError(400, 'Payload must be an array!').toJSON()
    }

    const token = await getMaskinportenToken()
    if (!token) {
      logger.error('lookup - err - Unable to get token')
      return new HTTPError(500, 'Unable to get token').toJSON()
    }

    const persons = (await getData(config.krr.url, { personidentifikatorer: body }, token.access_token)) as KrrResponse
    logger.info('lookup - returning persons - {PersonCount}', persons.personer ? persons.personer.length : 0)

    if (request.query.get('includeInactive') === 'true') {
      logger.info('lookup - queryParam includeInactive is true, returning all persons')
      return getResponseObject(persons)
    }

    const result: KrrResponse = {
      personer: persons.personer ? persons.personer.filter((p) => typeof p.status === 'string' && p.status.toUpperCase() === 'AKTIV') : []
    }
    return getResponseObject(result)
  } catch (error) {
    logger.errorException(error, 'lookup failed')

    if (error instanceof HTTPError) {
      return error.toJSON()
    }

    const err = error as Error
    return new HTTPError(500, 'An unknown error occured', err.stack || err.toString()).toJSON()
  }
}

app.http('lookup', {
  methods: ['GET', 'POST'],
  authLevel: 'function',
  route: 'lookup',
  handler: lookup
})
