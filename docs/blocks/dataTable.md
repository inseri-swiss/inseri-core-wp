# Data Table

The data table block displays tabular data of another block and gives guests the option to explore it.

It allows as output the selected row and the selected cell.

## Output

The filtered and sorted table, selected row (via a click on a cell), and selected cell (via a double-click on a cell if enabled) as a JSON.

## Input

The expected input is a JSON array with row-oriented data, where each row is an object with named attributes (known also as JSON records).

```json
[
	{ "a": "A", "b": 28 },
	{ "a": "B", "b": 55 },
	{ "a": "C", "b": 43 },
	{ "a": "D", "b": 91 },
	{ "a": "E", "b": 81 },
	{ "a": "F", "b": 53 },
	{ "a": "G", "b": 19 },
	{ "a": "H", "b": 87 },
	{ "a": "I", "b": 52 }
]
```

## Extended configuration

### Choose column config

It allows to rename the columns, define the columns for hierarchical objects, and much more. Please see [https://www.mantine-react-table.com/docs/guides/data-columns](https://www.mantine-react-table.com/docs/guides/data-columns){:target="\_blank"}.

## Parameters

The main and Toolbar settings are self explanatory.

The row virtualization should be enabled for very long tables. It should provide a better performance

### Extra settings

- "Emit row on click" allows to output the selected row. You have to first select a row to have access to it
- "Emit cell on double-click" allows to output the selected cell. You have to first double-click a cell to have access to it.
- "Cell editing on double-click". By default disabled, allows to guests to edit a cell. This option is not compatible with the "Emit cell on double-click" option.

## Examples

[Data Table Block](https://zi.uzh.ch/whp/science-it/inseri/2024/02/data-table-block/) on the project website.

[Posts on the project website](https://zi.uzh.ch/whp/science-it/inseri/tag/data-table/) that make use of the data table block.
