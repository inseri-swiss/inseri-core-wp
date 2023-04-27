# Paging through images

This tutorial will give a simple example how you can display different images depending on user selection.
For this we have to join a couple of inseri blocks.

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
	{ "label": "lighthouse", "value": "https://docs.inseri.swiss/assets/inseri_logo.svg" },
	{ "label": "logo", "value": "https://docs.inseri.swiss/assets/inseri_logo_full.svg" }
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
