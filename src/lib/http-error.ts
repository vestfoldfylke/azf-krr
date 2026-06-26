import { STATUS_CODES } from 'node:http'
import type { HttpResponseInit } from '@azure/functions'

const toName = (code: number): string => {
  const suffix = ((code / 100) | 0) === 4 || ((code / 100) | 0) === 5 ? 'Error' : ''
  const statusName = (STATUS_CODES[code] ?? '').replace(/error$/i, '').replace(/ /g, '')
  return `${statusName}${suffix}`
}

class HTTPError extends Error {
  statusCode: number
  innerError: string | undefined

  constructor(code: number, message?: string, innerError?: string) {
    super(message || STATUS_CODES[code])
    this.name = toName(code)
    this.statusCode = code
    this.innerError = innerError
  }

  toJSON(): HttpResponseInit {
    return {
      status: this.statusCode,
      jsonBody: {
        error: {
          statusCode: this.statusCode,
          message: this.message,
          innerError: this.innerError || undefined
        }
      }
    }
  }
}

export default HTTPError
