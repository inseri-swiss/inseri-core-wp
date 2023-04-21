# Web API

User has to choose one base web API which was previously defined in admin area.

Each part of web API can be further customized by choosing a block input:

- Method and Url's expected input:

```ts
let input = 'http://www.inseri.swiss'

//or
let input = { method: 'POST', url: 'http://www.inseri.swiss' }
```

- Query Params's expected input:

```ts
let input = {
	page: 10,
	author: 'foobar',
}
```

- Headers's expected input:

```ts
let input = {
	authorizaton: 'secret',
	accept: 'application/json',
}
```

- Body's expected input:

```ts
// only string is excepted
let input = '<xml></xml>'
```

WebAPI's output will be web api call's data. Please double check that after customizations, the correct contentType is still chosen.
