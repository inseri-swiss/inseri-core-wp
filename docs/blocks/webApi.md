# Web API

With the Web API block, you can include data from an external source into your post.

The output corresponds to the Web API response.

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

- Content Type: The expected response type. It can be unlocked, and by "Try request" the value is overwritten. In order to edit it first unlock it, update it as desired and lock it.

Additionally, you can add a persistent identifier to quote the data source:

- PID (DOI, ARK, URN or PURL)

### Dynamic values

Some static values can be overwritten or extended by dynamic values from other blocks:

- Method and URL's expected input ("Override method and URL"):

- Query Params's expected input ("Extend query params"):

- Headers's expected input ("Extend headers"):

- Body's expected input ("Override body"):

WebAPI's output will be web api call's data. Please double check that after customizations, the correct contentType is still chosen.

## Parameters

### Action text

You can change the text in the button to something different than "Call Web API".

### Show block

The block can be hidden from readers but its content is still available as input for other blocks. You can hide it only if you set it to execute automatically.

### Call automatically

The web API will be called initially and on changes of the inputs.

## Examples

[Web API Block](https://inseri.swiss/2023/01/web-api-block/) on inseri.swiss.

[Posts on inseri.swiss](https://inseri.swiss/tag/web-api/) that make use of the web API block.
