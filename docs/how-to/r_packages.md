# R Packages

R Code block is using [WebR](https://webr.r-wasm.org/){:target="\_blank"} which supports loading R packages that have been compiled for WebAssembly.

## How to install R Package

When a package is missing it is downloaded from the default webR binary package repository. But be aware that you can use only the R packages already compiled for WebAssembly:

```R
library(plotly)
```

For a fully working example see [R and Plotly](https://inseri.swiss/2024/08/r-and-plotly/){:target="\_blank"}.</br>
For more details please see [WebR - Installing R Packages](https://docs.r-wasm.org/webr/latest/packages.html){:target="\_blank"}.
