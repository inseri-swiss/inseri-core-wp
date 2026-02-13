# Cytoscape

It displays graphs using inputs from another blocks using [Cytoscape.js](https://js.cytoscape.org/).

## Output

Selected node or edge as JSON.

## Input

The input corresponds to the `elements` objects from [Cytoscape.js - Elements JSON](https://js.cytoscape.org/#notation/elements-json). Next we provide the `nodes` and `edges` groups that are automatically inferred:

```json
[
	{ "data": { "id": "a", "label": "A" } },
	{ "data": { "id": "b", "label": "B" } },
	{ "data": { "id": "c", "label": "C" } },
	{ "data": { "id": "d", "label": "D" } },
	{ "data": { "id": "e", "label": "E" } },
	{ "data": { "id": "f" } },
	{ "data": { "id": "ab", "source": "a", "target": "b" } },
	{ "data": { "id": "cd", "source": "c", "target": "d" } },
	{ "data": { "id": "ef", "source": "e", "target": "f" } },
	{ "data": { "id": "ac", "source": "a", "target": "c" } },
	{ "data": { "id": "be", "source": "b", "target": "e" } }]
```

## Parameters

### Layout

The layout used to display the graph. The default layout is dagre.

### Events

## Extended configuration

### Provide custom style

Replace `style` from [Cytoscape.js - Elements JSON](https://js.cytoscape.org/#notation/elements-json). Example:

```json
[
	{
		"selector": "node",
		"style": {
			"label": "data(id)"
		}
	}
]
```

### Provide additional layout config

Replace `layout` from [Cytoscape.js - Elements JSON](https://js.cytoscape.org/#notation/elements-json). Example:

```json
{ "name": "cose" }
```

## Examples

[Cytoscape Block](https://zi.uzh.ch/whp/science-it/inseri/2023/11/cytoscape-block/) on the project website.

[Posts on the project website](https://zi.uzh.ch/whp/science-it/inseri/tag/cytoscape/) that make use of the Plotly chart block.
