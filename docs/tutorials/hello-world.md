# Hello world

This tutorial will give a simple example how you can display different images depending on user selection.
For this we have to join a couple of inseri blocks.

You can check out the result of this tutorial on [inseri.swiss](https://inseri.swiss/2023/02/hello-world/).

## Step 1: Create a new post

On your inseri instance or in the playground (remember, your changes will not be saved there), add a new post and give it a title.
In this example, we call the post "Image selection". You can type this at "Add title...".

## Step 2: Text editor for the options

Add an inseri text editor by clicking the `+` below the title.
Select "Browse all" and look for "Text Editor" in the category _inseri_.

Choose the format "JSON" because that is what will be read by the dropdown that we are going to add later.

Now, give your text editor a meaningful name.
For this, open the configuration panel on the right and enter "textEditor-imageOptions" under _block name_.

## Step 3: Add options to the text editor

Copy this snippet into the text editor:

```json
[
	{ "label": "UZH Acronym", "value": "https://www.cd.uzh.ch/cd/dam/jcr:31f38b33-1619-4ba1-a21c-4dae47e9d0e5/UZH-Logo-Akronym.2020-01-15-11-51-14.gif" },
	{ "label": "UZH Logos", "value": "https://www.cd.uzh.ch/dam/jcr:79ffe4ce-bbe9-498e-94a8-d7d5b66400b2/UZH_logo_pos_d_e.gif" }
]
```

It contains two options with a label each.

## Step 4: Add a dropdown

Add a "Dropdown" from the category _inseri_ like you added the text editor before.

In the dropdown block you can now select the block source with the name "textEditor-imageOptions: content".

Like you did with the text editor, give the dropdown block a more meaningful name "dropdown-selectedImage".

## Step 5: Add an image viewer

Add the block "Image" from the category _inseri_ to your post.

Set the block source to the option "dropdown-selectedImage: content".

## Step 6: Save and publish

You can save and publish your post like any WordPress post.

Once published (or in preview), you will see the text editor with the content as described above and a dropdown.
The images will load after selecting from the dropdown.

## Overview

The following graph shows how the blocks are connected:

```dot
digraph G {
    textEditor_imageOptions -> dropdown_selectedImage [label="textEditor-imageOptions: \n content (json)"];
    dropdown_selectedImage -> imageViewer_unnamed [label="drowdown-selectedImage: \n content (text)"];

    textEditor_imageOptions [shape=rect; label="Text Editor: \n textEditor-imageOptions"];
    dropdown_selectedImage [shape=rect; label="Dropdown: \n dropdown-selectedImage"];
    imageViewer_unnamed [shape=rect; label="Image Viewer: \n imageViewer-default"];
  }

```
