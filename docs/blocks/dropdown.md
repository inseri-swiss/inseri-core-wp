# Dropdown

The dropdown block can be used to make the content on your page dynamic by allowing to switch between different parameters.

## Input

The expected input is an array in JSON.

examples:

```ts
let input: Array<string>
input = ['option 1', 'option 2', 'option 3']

//or
let input: Array<{ label: string; value: any }>
input = [
	{ label: 'option 1', value: { foo: 3, bar: 11 } },
	{ label: 'option 2', value: 42 },
	{ label: 'option 3', value: 'Foo bar' },
]
```

Using json the first case is a

```json
["option 1", "option 2", "option 3"]
```

and the dropdown corresponds to its elements which are also the block outputs

- option 1
- option 2
- option 3

For the second case the we have

```json
[
	{ "label": "option 1", "value": { "bar": 11, "foo": 3 } },
	{ "label": "option 2", "value": 42 },
	{ "label": "option 3", "value": "Foo bar" }
]
```

In the dropdown the `"label"` are displayed:

- option 1
- option 2
- option 3

while the `"value"` are the block output

- `{"bar":11,"foo":3}` for option 1
- `42` for option 2
- `"Foo bar"` for option 3

## Parameters

### Label

You can change the text above the dropdown to something else than the default "Choose an item".

### Searchable

Allow keyboard input to match labels.

### Clearable

Allow the selection to be reset to undefined.
