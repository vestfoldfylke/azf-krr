const { logger } = require('@vestfoldfylke/loglady')

const getData = async (url, payload, token, method = 'post') => {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-type': 'application/json'
  }

  const response = await fetch(url, {
    method: method.toUpperCase(),
    headers,
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errorText = await response.text()
    logger.error('Failed to fetch data with Url: {Url}. Status: {Status}, StatusText: {StatusText}. Error: {Error}', url, response.status, response.statusText, errorText)
    throw new Error(`Failed to fetch data. Status: ${response.status}, StatusText: ${response.statusText}`)
  }
  
  return await response.json()
}

module.exports = { getData }
