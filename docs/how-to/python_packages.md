# Python Packages

Python Code block is using [Pyodide](https://pyodide.org/en/stable/){:target="\_blank"} which behaves slightly different compared to CPython. Pyodide comes with many built-in packages, e.g., `numpy`, `pandas`, `matplotlib`. So they are ready to be loaded and used.</br>
For more details please see [Pyodide - Loading packages](https://pyodide.org/en/stable/usage/loading-packages.html#loading-packages){:target="\_blank"}.

## How to install Python Package

In case you want to use a packages that is not pre-installed, be aware that you can install only pure Python wheels or binary wasm32/emscripted wheels. This can be done using `micropip`. For example if you want to install `plotly` you have to do:

```python
import micropip
await micropip.install('plotly');
```

For a fully working example see [Python and Plotly](https://inseri.swiss/2023/06/python-and-plotly/){:target="\_blank"}.</br>
For more details please see [Pyodide - Installing packages](https://pyodide.org/en/stable/usage/loading-packages.html#installing-packages){:target="\_blank"}.

## How to install requests package

`requests` package is available in inseri core ≥ 0.3.5. If you use an older older version, please update.

For a fully working example see [Python and Requests Package](https://inseri.swiss/2023/08/python-and-requests/){:target="\_blank"}.
