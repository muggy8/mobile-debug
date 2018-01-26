# About

<table>
	<tr>
		<td>
			<img src="https://i.imgur.com/fzjaNpC.png">
		</td>
		<td>
			<img src="https://i.imgur.com/eJCz0px.png">
		</td>
		<td>
			<img src="https://i.imgur.com/0VSeXNi.png">
		</td>
		<td>
			<img src="https://i.imgur.com/RMLMIgh.png">
		</td>
	</tr>
</table>

This project is a current Work-in-Progress for a fire-bug style debugger for debugging web application on mobile devices. The current goal of this project is to create a debugger that is rendered in DOM and included with a single javascript file and allows you to view and edit CSS rules, evaluate JS code and view XMLHttpRequests. As these things are the most basic aspects of creating and debugging a web app

## Why

There are various tools out there for debugging web sites on your mobile devices in Chrome and FireFox but the main reason you want to use a debugger like this is for when you are debugging and coding things on the fly and you do not have a computer at your disposal. (eg: you are on vacation and your client calls you about a serious bug, and you do not have a laptop handy to fix the bug, something like this is going to be very helpful)

But in all seriousness, I want to make a game on my spare time and since I don't have that much time on my hands, I've decided to use my time on public transit each day. as a result I wanted something to let me develop my web app / game without a computer.

The current only other alternative is to use FireBug Lite which is awfully hard to use on mobile devices as everything is super small and trying to tap anything is crazy clunky and barely useable. As a result I want to create an alternative that uses current web standards and better mobile usability to make development without a computer easier. This of course means not as much support for older browsers and devices but if you have to support those browsers on your mobile device then i guess nothing can really help you there.

## Usage

Include the debugger in the html output of a page you'd like to inspect and any actions that comes after it will be recorded.
```<script src="path/to/mobile-debug.min.js"></script>```
You can also just insert it via javascript like
```document.appendChild(document.createElement("script")).src="path/to/mobile-debug.min.js"```

The goal is to create a self contained script that you add wherever you want in your html file and after the script loads, all subsequent javascript outputs/activity will be also captured by the in dom debugger.

The console that this script generates lives in the DOM of the document that it is debugging meaning styles in the debugger may leak to global elements and vice versa. to mitigate this, all class names and ids of html elements and their selectors are scrambled on build to protect external elements from receiving any of these styles. in the rare case that there is a styling conflict, feel free to re-build the project and that should re-scramble the class names and ids again to hopefully not conflict.
```
cd /path/to/project/dependency/folder
git clone https://github.com/muggy8/mobile-debug.git
cd mobile-debug
npm install
node build
```

## Current State

The core feature of the projects are complete and can be used in various web based environment to edit CSS, explore Dom and evaluate code.
