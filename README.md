# azf-krr

Azure function API for oppslag mot kontakt- og reservasjonsregisteret

Henter token fra maskinporten ved hjelp av [server-til-server oauth2](https://docs.digdir.no/oidc_auth_server-to-server-oauth2.html).

## API

### GET ```/lookup```

**Request**
A array with one or more personal ids.

```json
["12345678910"]
```

**Response**

```js
{
  personer: [
    {
      personidentifikator: "12345678910",
      reservasjon: "NEI",
      status: "AKTIV",
      kontaktinformasjon: {
        epostadresse: "jonas.pjonas@gmail.com",
        epostadresse_oppdatert: "2014-03-20T10:44:39+01",
        epostadresse_sist_verifisert: "2018-07-31T23:19:02+02",
        mobiltelefonnummer: "41514965",
        mobiltelefonnummer_oppdatert: "2014-03-20T10:44:39+01",
        mobiltelefonnummer_sist_verifisert: "2018-07-31T23:19:02+02"
      },
      "spraak": "nb",
      "spraak_oppdatert": "2018-11-20T00:00:00+01"
    }
  ]
}
```

## Azure Function

### Application settings (``local.settings.json``)

```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsStorage": "",
    "MASKINPORTEN_ISSUER": "clientId fra integrasjon i samarbeidsportalen",
    "MASKINPORTEN_AUDIENCE": "https://{miljo}.maskinporten.no/",
    "MASKINPORTEN_TOKEN_URL": "https://{miljo}.maskinporten.no/token",
    "MASKINPORTEN_SCOPE": "scopet du vil ha",
    "CERTIFICATE_PFX_PATH": "path to test virkomshetssertifikat", // For lokal utvikling
    "CERTIFICATE_PASSPHRASE": "password for test virkomshetssertifikat",  // For lokal utvikling
    "CERTIFICATE_PFX_BASE64": "henvisning til virksomhetssertifikatet i keyvault", // For produksjon og test - husk å gi azure function managed identity tilgang til secrets i keyvaulten
    "KRR_URL": "https://{miljo}.kontaktregisteret.no/rest/v1/personer",
    "NODE_ENV": "dev prod eller hva du vil"
  }
}
```
