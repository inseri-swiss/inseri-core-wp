# Plotly.js

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
        "x": [
          0,
          1
        ],
        "y": [
          0,
          1
        ]
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

### Events

hover, click

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

### Provide config
