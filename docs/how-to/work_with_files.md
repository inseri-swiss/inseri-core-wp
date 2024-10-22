# Working with files

## How to communicate binary files between blocks

With the Media Collection block or the Local File Import block, you can easily load binary files into a post to display them with e.g. an Image Box block.
If the file is generated in a Python Code or R Code block, the file will be automatically made available to other blocks that can use them as input.

Make sure that the content types are compatible, because otherwise you will not be able to use it as input.

[Python and Matplotlib](https://inseri.swiss/2023/06/python-and-matplotlib/){:target="\_blank"} shows an example on how to share a binary file between two blocks.

## How to transform a CSV to a JSON

[Python Code block](../blocks/python.md){:target="\_blank"} allows you to read the CSV - see [`pandas.read_csv`](https://pandas.pydata.org/docs/reference/api/pandas.read_csv.html#pandas-read-csv){:target="\_blank"}. Next, the DataFrame can be used for the transformations, and next the [`pandas.DataFrame.to_dict`](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.to_dict.html#pandas.DataFrame.to_dict){:target="\_blank"} to generate a Python dictionary, which is automatically converted into a JSON. Pay attention at the different `orient` parameter, e.g. `records` can be used in a [Data Table block](../blocks/dataTable.md){:target="\_blank"}.
