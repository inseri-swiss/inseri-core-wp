# Dropdown

The dropdown block can be used to make the content on your page dynamic by allowing to switch between different items.

## Output

The selected item (or the corresponding "value" key) as JSON.

## Input

The expected input is a JSON array that can have as elements strings:

```json
["item 1", "item 2", "item 3"]
```

or objects (name-value pairs, know also as key-value pairs) with the mandatory names (called also keys): `"label"` and `"value"`:

```json
[
	{ "label": "item 1", "value": { "bar": 11, "foo": 3 } },
	{ "label": "item 2", "value": 42 },
	{ "label": "item 3", "value": "Foo bar" }
]
```

For the first case the dropdown corresponds to its elements and the block output is the selected string element

- `"item 1"`
- `"item 2"`
- `"item 3"`

For the second case the download corresponds to all `"label"`:

- `"item 1"`
- `"item 2"`
- `"item 3"`

but the block output is the `"value"` of the selected `"label"`:

- `{"bar":11,"foo":3}` for `"item 1"`
- `42` for `"item 2"`
- `"Foo bar"` for `"item 3"`

## Parameters

### Label

You can change the text above the dropdown to something else than the default "Choose an item".

### Searchable

Allow keyboard input to match labels.

### Clearable

Allow the selection to be reset to undefined.

## Examples

[Dropdown Block](https://zi.uzh.ch/whp/science-it/inseri/2022/12/dropdown-block/) on the project website.

[Posts on the project website](https://zi.uzh.ch/whp/science-it/inseri/tag/dropdown/) that make use of the dropdown block.
