# Getting started

## Installation

inseri core for WordPress is available as a WordPress plugin. You can find it as an asset `inseri-core.zip` and we recommend you our latest release available [here](https://github.com/inseri-swiss/inseri-core-wp/releases/latest). Please download it locally and install it following [Upload via WordPress Admin](https://wordpress.org/documentation/article/manage-plugins/#upload-via-wordpress-admin).

To install inseri locally with Docker, follow the guide under [https://github.com/inseri-swiss/inseri-core-wp](https://github.com/inseri-swiss/inseri-core-wp).
The last step is to go to [http://localhost:8888/wp-login.php](http://localhost:8888/wp-login.php) and use username `admin` and the password `password`.

Alternatively you can check out the functionalities in the [playground](https://playground.inseri.swiss/).
Be aware that changes there are temporary and will be gone after a page refresh.

## WordPress Posts

The typical use case with WordPress and inseri is to write a [post](https://wordpress.com/support/post-vs-page/) consisting of several [blocks](https://wordpress.org/support/article/blocks/).
For saving, previewing, and upating posts, follow the description about the [WordPress Block Editor](https://wordpress.org/support/article/wordpress-editor/).

The further documentation will always assume that you already have a post to work on.

## Adding inseri blocks to a post

On a WordPress instance with the inseri blocks installed, the list of available blocks will include a collection with the name "inseri".
You can add an inseri block like any other block through the plus sign on top left or inside a post.
After accepting a block, it is visible in the content of the post, showing the most important options directly in its body,
like block of which the output will be imported.
Through settings panel on the right, more settings are available, generally for naming the output channel, visibility, or just styling.
