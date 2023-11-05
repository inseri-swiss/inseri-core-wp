=== Scientific and Interactive Blocks - inseri core ===
Contributors: inseriswiss
Tags: Gutenberg blocks, WordPress blocks, gutenberg, blocks, inseri
Requires at least: 5.6
Tested up to: 6.3.1
Requires PHP: 5.6
Stable tag: 0.3.1
License: GPL-3.0-or-later
License URI: https://www.gnu.org/licenses/gpl-3.0.html

Scientific and Interactive Gutenberg Blocks to facilitate Open Science

== Description ==

The vision of inseri is to enable scholars to design web pages without any prior knowledge. So that they can publish their research findings in an open, citable and interactive way in combination with own their data or any public data repository. Through interactivity, everyone is encouraged to play around with the parameters or use their own data to explore the research findings.

As a result, inseri core introduces scientific and interactive Gutenberg blocks to facilitate open access. The inseri core blocks are not isolated elements but they can receive input from and give output to other blocks. A typical example would start with a Text Editor block containing the configuration for a Dropdown block. By selecting one option in the Dropdown block would provide a Web API block with the parameters to retrieve data from an external source. Using a Python Code block, the web API response could then be transformed into a suitable data format for a Plotly Chart block.

## Blocks:
- **[Download Block](https://docs.inseri.swiss/blocks/download/)**: It gives guests the possibility to download data from another block.
- **[Dropdown Block](https://docs.inseri.swiss/blocks/dropdown/)**: It provides guests options to choose from and the selected option can be reused in other blocks.
- **[HTML Code Block](https://docs.inseri.swiss/blocks/html/)**: It renders HTML code using the other block's data.
- **[IIIF Viewer Block](https://docs.inseri.swiss/blocks/iiifViewer/)**: It showcases images with pan/zoom functionality, along with videos and audios consumed by an IIIF API.
- **[Image Box Block](https://docs.inseri.swiss/blocks/image/)**: It displays an image utilizing the data of another block.
- **[Local File Import Block](https://docs.inseri.swiss/blocks/localFileImport/)**: It allows guests to provide their own data for blocks.
- **[Media Collection Block](https://docs.inseri.swiss/blocks/mediaCollection/)**: A collection of media files is made available as data for other blocks.
- **[Plotly Chart Block](https://docs.inseri.swiss/blocks/plotly/)**: It visualizes the data of another block using Plotly.
- **[Python Code Block](https://docs.inseri.swiss/blocks/python/)**: Guests can run Python code with data from other blocks with the use of Pyodide and the result of the execution is made available to other blocks.
- **[Text Editor Block](https://docs.inseri.swiss/blocks/textEditor/)**: It allows to share text content like JSON or XML with other blocks.
- **[Text Viewer Block](https://docs.inseri.swiss/blocks/textViewer/)**: It displays text content like JSON or XML from other block.
- **[Web API Block](https://docs.inseri.swiss/blocks/webApi/)**: It enables to call a web API and to share this data with other blocks.
- **[Zenodo Repository Block](https://docs.inseri.swiss/blocks/zenodo/)**: Using a DOI, a dataset can be loaded from Zenodo.org and shared with other blocks.

More information about the project can be found at [inseri.swiss](https://inseri.swiss).

Detailed documentation is available at [docs.inseri.swiss](https://docs.inseri.swiss/).

The development takes place on [GitHub](https://github.com/inseri-swiss/inseri-core-wp).

Bug reports are welcome on [GitHub issues](https://github.com/inseri-swiss/inseri-swiss/issues).


== Screenshots ==

1. Create beautiful charts with Plotly
2. Call any Web API
3. Execute Python code
4. Load data from Zenodo.org
5. Enable guests to provide their own data
6. Render HTML code

== Changelog ==
### [0.3.1](https://github.com/inseri-swiss/inseri-core-wp/releases/tag/v0.3.1)
- New: IIIF Viewer block

### [0.3.0](https://github.com/inseri-swiss/inseri-core-wp/releases/tag/v0.3.0)
- BREAKING CHANGE: change underlying block connection protocol
- New: enable to copy/duplicate the blocks together while preserving the connection
- Update: pyodide 0.24.1
- Update: diverse dependencies

### [0.2.1](https://github.com/inseri-swiss/inseri-core-wp/releases/tag/v0.2.1)
- minor changes

### [0.2.0](https://github.com/inseri-swiss/inseri-core-wp/releases/tag/v0.2.0)
- BREAKING CHANGE: renaming block from 'Media Library' to 'Media Collection'

### 0.1.0 MVP
added 12 new blocks:
- Download
- Dropdown
- HTML Code
- Image Box
- Local File Import
- Media Library
- Plotly Chart
- Python Code
- Text Editor
- Text Viewer
- Web API Block
- Zenodo Repository
