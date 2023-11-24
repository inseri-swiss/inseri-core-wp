# Cytoscape

Please check out the [Cytoscape.js - Elements JSON](https://js.cytoscape.org/#notation/elements-json).

## Input

The standard format by Cytoscape.js

```json
{
	"data": [
		{
			"uid": "f4de1f",
			"hole": 0.1,
			"name": "Col2",
			"pull": 0,
			"type": "pie",
			"domain": {
				"x": [0, 1],
				"y": [0, 1]
			},
			"marker": {
				"colors": [
					"#7fc97f",
					"#beaed4",
					"#fdc086",
					"#ffff99",
					"#386cb0"
				]
			},
			"textinfo": "label+value",
			"hoverinfo": "all",
			"labels": [
				"quarter piece",
				"third piece",
				"sixth",
				"tenth",
				"3/20"
			],
			"values": [
				"25",
				"33.33",
				"16.67",
				"10",
				"15"
			],
			"showlegend": false
		}
	],
	"layout": {
		"title": "Division of the cake",
		"width": 800,
		"height": 500,
		"autosize": false
	},
	"frames": []
}
```

## Parameters

### Layout

The layout used to display the graph. The default layout is dagre.

### Events

## Extended configuration

### Override data separately

```json
[
  {
    "x": [
      "giraffes",
      "orangutans",
      "monkeys"
    ],
    "y": [
      20,
      14,
      23
    ],
    "type": "bar"
  }
],
```

### Override layout separately

Replace `layout` in the input, following the same pattern:

```json
{
	"title": "Division of the cake",
	"width": 800,
	"height": 500,
	"autosize": false
}
```

### Provide config

Additional [configuration options](https://plotly.com/javascript/configuration-options/) by Plotly.

## Examples

[Plotly Chart Block](https://inseri.swiss/2023/03/plotly-chart-block/) on inseri.swiss.

[Posts on inseri.swiss](https://inseri.swiss/tag/plotly-chart/) that make use of the Plotly chart block.
