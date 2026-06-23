# azf-krr

Azure function API for oppslag mot kontakt- og reservasjonsregisteret

Henter token fra maskinporten ved hjelp av [server-til-server oauth2](https://docs.digdir.no/oidc_auth_server-to-server-oauth2.html).

## API

### GET ```/lookup```

**Query params**
lookup?includeInactive=true

Defaults to false, and response only include persons with status === "AKTIV"

**Request body**
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

## Maskinporten setup
- Logg på samarbeidsportalen / sjolvbetjening hos digdir (du må ha tilgang til å logge på, og bruke KRR-scopet) [les mer på docs.digdir.no](https://docs.digdir.no/docs/Kontaktregisteret/oppslagstjenesten_rest.html)
- Lag en ny klient (klient-id skal brukes i env)
- Legg til scope: krr:global/kontaktinformasjon.read på klienten
- Opprett en ny nøkkel. Id-til nøkkel skal brukes i MASKINPORTEN_KID i env. Anbefales at du får en automatisk generert nøkkel, men du kan også laste opp en hvis du absolutt må.
- Base64-encode nøkkelen, enkleste er å lagre den midlertitig i ./cert/maskinporten_private.pem og kjøre:

```bash
npm run encode-private-key
```
- Kopier verdien du får og legg i MASKINPORTEN_PRIVATE_KEY_BASE64 i miljøvariabel
- Slett midlertidig lagret nøkkel. Om ting går skeis får du heller lage deg en ny.

## Azure Function

### Application settings (``local.settings.json``)

```json5
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "KRR_URL": "https://<env>.kontaktregisteret.no/rest/v2/personer",
    "MASKINPORTEN_DISCOVERY_URL": "https://<env>.maskinporten.no/.well-known/oauth-authorization-server",
    "MASKINPORTEN_SCOPE": "krr:global/kontaktinformasjon.read",
    "MASKINPORTEN_CLIENT_ID": "<din klient id>",
    "MASKINPORTEN_KID": "<din key identifier>",
    "MASKINPORTEN_PRIVATE_KEY_BASE64": "<private key, base64 encoded>",
    "NODE_ENV": "<env>"
  }
}
```
