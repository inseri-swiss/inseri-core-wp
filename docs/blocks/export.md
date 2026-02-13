# Export

The Export block is intended for making the post or page content open access by allowing the visitors to download the corresponding [blueprint.json](https://wordpress.github.io/wordpress-playground/blueprints-api/using-blueprints/){:target="\_blank"} and WXR file.

By clicking on the `Export` button, a zip archive will be downloaded locally. Unzip it and read the `readme.md` file.

!!! warning

    The Media Library content is not supported. Therefore it is not compatible with the [Media Collection Block](mediaCollection.md).

!!! warning

    This block is not compatible with WordPress [Synced Patterns](https://wordpress.org/news/2023/07/synced-patterns-the-evolution-of-reusable-blocks/):

    - the Export block doesn't work properly if it's part of a synced pattern
    - a synced pattern cannot be exported to allow its reuse because the corresponding XML only contains a reference to the original content and not the content itself

## Output

No output.

## Input

No input.

## Examples

[Export Block](https://zi.uzh.ch/whp/science-it/inseri/2024/06/export-block/) on the project website.

[Posts on the project website](https://zi.uzh.ch/whp/science-it/inseri/tag/export/) that make use of the Export block.
