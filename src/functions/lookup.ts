import type { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { app } from '@azure/functions'
import { logger } from '@vestfoldfylke/loglady'
import HTTPError from '../lib/http-error.js'
import { type KrrResponse, krr } from '../lib/krr.js'

const MAX_IDENTIFIERS_PER_REQUEST = 1000 // https://docs.digdir.no/docs/Kontaktregisteret/oppslagstjenesten_rest.html#endepunkt

async function lookup(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body = await request.json()

    if (!Array.isArray(body)) {
      throw new HTTPError(400, 'Request body must be an array of person identifiers')
    }

    if (body.length > MAX_IDENTIFIERS_PER_REQUEST) {
      throw new HTTPError(400, `Request body array must not contain more than ${MAX_IDENTIFIERS_PER_REQUEST} items`)
    }

    // Check that all items in the body array are numerical strings of length 11 (Norwegian national identifiers)
    if (!body.every((item) => typeof item === 'string' && item.length === 11 && /^\d{11}$/.test(item))) {
      throw new HTTPError(400, 'All items in the request body array must be strings of 11 digits')
    }

    const persons: KrrResponse = await krr(body)
    logger.info('lookup - returning persons - {PersonCount}', persons.personer.length)

    if (request.query.get('includeInactive') === 'true') {
      logger.info('lookup - queryParam includeInactive is true, returning all persons')
      return { status: 200, jsonBody: persons }
    }

    const activePersons: KrrResponse = {
      personer: persons.personer.filter((p) => typeof p.status === 'string' && p.status.toUpperCase() === 'AKTIV')
    }

    return { status: 200, jsonBody: activePersons }
  } catch (error) {
    logger.errorException(error, 'lookup failed')

    if (error instanceof HTTPError) {
      return error.toJSON()
    }

    const err = error as Error
    return new HTTPError(500, 'An unknown error occured', err.toString()).toJSON()
  }
}

app.http('lookup', {
  methods: ['GET', 'POST'],
  authLevel: 'function',
  route: 'lookup',
  handler: lookup
})
