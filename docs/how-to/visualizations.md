# Visualizations

## How to use Plotly with JSON

If you already have your Plotly chart in a JSON format, you can easily add it using inseri core plugin:

1. add a [Text Editor Block](../blocks/textEditor.md){:target="\_blank"} (JSON format) and paste your JSON. Use a sensible block name and if you want to hide it disable "Show block". If you are new to inseri consider [Hello World tutorial](../tutorials/hello_world.md){:target="\_blank"}.

2. add a [Plotly Chart Block](../blocks/plotly.md) and pick the previous block as input for the full JSON description and click Display. You are done.

## How to use Plotly with Python

Please see [Python and Plotly](https://inseri.swiss/2023/06/python-and-plotly/){:target="\_blank"}.

## How to use Matplotlib with Python

Please see [Python and Matplotlib](https://inseri.swiss/2023/06/python-and-matplotlib/){:target="\_blank"}.

## Plotly or Matplotlib

inseri supports both Plotly and Matplotlib. Which one you want to use is first of all a matter of taste.

There are some differences: Matplotlib works with files which means it can be combined with a download block to reuse the result.
Plotly offers more interactive options than a static image would, and
