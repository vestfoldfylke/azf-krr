const { readFileSync } = require('fs')

module.exports = {
  krr: {
    url: process.env.KRR_URL || 'https://krr.digdir.no/rest/v1/personer'
  },
  env: process.env.NODE_ENV ?? 'dev',
  certificate: {
    pfxPath: process.env.CERTIFICATE_PFX_PATH ?? 'ukjent sti',
    passphrase: process.env.CERTIFICATE_PASSPHRASE ?? null,
    pfxBase64: process.env.CERTIFICATE_PFX_BASE64 ?? 'ukjent pfxBase64'
  },
  maskinporten: {
    scope: process.env.MASKINPORTEN_SCOPE ?? 'et skup',
    audience: process.env.MASKINPORTEN_AUDIENCE ?? 'et publikum',
    issuer: process.env.MASKINPORTEN_ISSUER ?? 'utsteder',
    tokenUrl: process.env.MASKINPORTEN_TOKEN_URL ?? 'token.com'
  }
}
