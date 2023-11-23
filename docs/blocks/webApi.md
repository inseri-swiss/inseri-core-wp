# Web API

With the Web API block, you can include data from an external source into your post.

## Quick configuration

For GET requests without additional parameters, it is enough to enter the URL and the response data type.

## Input

Below in the extended configuration one can define inputs for URL, query parameters, headers and body.

## Extended configuration

### Static values

The options for the Web API settings follow the usual specifications for HTTP:

- Method: `GET`, `HEAD`, `POST`, `PUT`, `DELETE`, `OPTIONS`, `PATCH`

- URL: An URL without query params

- Query params

- Headers

- Body

- Content Type: The exptexted response type.

Additionally, you can add a persistent identifier to quote the data source:

- PID (DOI, ARK, URN or PURL)

### Dynamic values

The static values can be overwitten by dynamic values from other blocks:

- Method and URL's expected input ("Override method and URL"):

```ts
let input = 'http://www.inseri.swiss'

//or
let input = { method: 'POST', url: 'http://www.inseri.swiss' }
```

- Query Params's expected input ("Extend query params"):

```ts
let input = {
	page: 10,
	author: 'foobar',
}
```

- Headers's expected input ("Extend headers"):

```ts
let input = {
	authorizaton: 'secret',
	accept: 'application/json',
}
```

- Body's expected input ("Override body"):

```ts
// only string is excepted
let input = '<xml></xml>'
```

WebAPI's output will be web api call's data. Please double check that after customizations, the correct contentType is still chosen.

## Parameters

### Action text

You can change the text in the button to something different than "Call Web API".

### Show block

The block can be hidden from readers but its content is still available as input for other blocks. You can hide it only if you set it to execute automatically.

### Call automatically

The web API will be called initailly and on changes of inputs.

## Examples

[Web API Block](https://inseri.swiss/2023/01/web-api-block/) on inseri.swiss.

[Posts on inseri.swiss](https://inseri.swiss/tag/web-api/) that make use of the web API block.
