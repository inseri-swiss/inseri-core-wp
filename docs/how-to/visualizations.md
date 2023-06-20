# Visualizations

## How to use Plotly

**JSON input**

**Plotly with Python**

```python
import micropip
await micropip.install('plotly');

# make sure you load pandas (needed by plotly.express)
import pandas as pd

import plotly.express as px
import plotly.io as pio

fig = px.bar(x=["a", "b", "c"], y=[1, 3, 2])

fig_as_json = pio.to_json(fig)

# make sure you load the string (json standard library is needed)
import json
# res is output of this block
res = json.loads(fig_as_json)
```

## How to use Matblotlib

You can use a Python Code block to run Matplotlib.

It is important to keep in mind that the runtime is not CPython but rather Pyodide that behaves slightly different. For this use case please pay attention at the following points (see the code below):

- use the Agg backend which works fine with inseri-core (please see line 5)
- save the figure into a binary buffer (using BytesIO standard library) and get its value (please see lines 10-14)

Now the variable res can be defined as a PNG output of our Python Code, and used further as an input in the Image Box block.

```python
import matplotlib.pyplot as plt
import matplotlib

# matplotlib backend needed with inseri-core
matplotlib.use('Agg')

plt.bar(x=["a", "b", "c"], height=[1, 3, 2])

# save the figure as a bytes buffer (io standard library is needed)
from io import BytesIO
buf = BytesIO()
plt.savefig(buf, format='png', bbox_inches='tight')
# res is output of this block
res = buf.getvalue()
```

## Plotly or Matplotlib?

inseri supports both Plotly and Matplotlib. Which one you want to use is first of all a matter of taste.

There are some differences: Matplotlib works with files which means it can be combined with a download block to reuse the result.
Plotly offers more interactive options than a static image would.
