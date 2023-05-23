# Plotly Chart

Please check out the [Plotly JSON chart schema](https://plotly.com/chart-studio-help/json-chart-schema/).

## Input

The standard format by Plotly

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

## Additional

### Height

Size of the block in the post.

### Events

Other blocks can listen to `hover`, `click` events from this block.

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
