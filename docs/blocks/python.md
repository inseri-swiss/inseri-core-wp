# Python Code

It allows to run Python code in the browser.

This block allows multiple inputs and outputs. This makes it interesting to tie the behaviors of different blocks together.

To set the inputs and outputs for the script, select "open extended view" which opens a popup.

## Output

As defined in the extended view. JSON serializable objects or binary objects.
The generated files are made available to other blocks that can use them as input.

## Input

A Python file or the user can directly write the code.
Moreover in the extended view below it is possible to define input variables.

## Extended view

Imagine we have the following Python script:

```python
sum = a + b
product = a * b
```

You can see that `a` and `b` are not defined in this script.
On the top right you can set the inputs. Enter the variable name `a` and accept it with the `+` button. You can now choose any channel from your post. Repeat this with `b`. Input variables can be deleted with `x` next to the import.

Outputs can be defined on the bottom left. Enter `sum` into the text field and accept it with `+`. Now, choose a content type. For simple values as lists or numbers, `JSON` is the best option.
Like inputs, output variables can be deleted with `x`.

If you would like to have as output an object that is not JSON serializable, you should save it in a file because the file is an output of the block.

## Parameters

### Label

Add a description above the code block.

### Show block

The block can be hidden from readers but its content is still available as input for other blocks. You can hide it only if you set it to execute automatically.

### Execute automatically

The script will run automatically on load and any input change. If set to false, the script will have to be run explicitly.

### Publicly editable

Python Code block can be set to publicly editable. This may be interesting if you want to show calculations depending on certain parameters.
After a page reload the changes in the code will be lost.

## How To

- [Python Packages](../how-to/python_packages.md)
- [Visualizations](../how-to/visualizations.md)

## Examples

[Python Code Block using Pyodide](https://inseri.swiss/2023/02/python-code-block-using-pyodide/) on inseri.swiss.

[Posts on inseri.swiss](https://inseri.swiss/tag/python-code/) that make use of the Python Code block.
