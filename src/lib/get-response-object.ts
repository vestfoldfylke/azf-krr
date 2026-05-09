import type { HttpResponseInit } from '@azure/functions'

export const getResponseObject = (data: unknown, status = 200): HttpResponseInit => {
  return {
    status,
    jsonBody: data
  }
}
