# About

<table>
	<tr>
		<td>
			<img src="https://i.imgur.com/v1TxsUX.jpg">
		</td>
		<td>
			<img src="https://i.imgur.com/Q3iQpQJ.png">
		</td>
		<td>
			<img src="https://i.imgur.com/kPbcYEP.jpg">
		</td>
		<td>
			<img src="https://i.imgur.com/hHblcYZ.png">
		</td>
	</tr>
</table>

This project is a HTML debugger for mobile devices. The Goal of this project is to create a light weight inspector that can be included with a line of javascript and provides basic debugging for HTML, XMLHttpRequests and a viewable and interactive console.

The goal of this project is not to replace remote debugging but to provide the basic tools to developers who are often on the go without a computer at hand. For many of the more difficult tasks that you need to perform to optimize and debug your application, remote debugging is still the best option.

## Why

There are various tools out there for debugging web sites on your mobile devices in Chrome, FireFox, and the other major browsers. But the main reason you want to use a debugger like this is for when you are debugging and coding away from your computer. (eg: you are on vacation and your client calls you about a serious bug, and you do not have a laptop handy)

But in all seriousness, I want to make a game on my spare time and since I don't have that much time on my hands, I've decided to use my time on public transit each day. as a result I wanted something to let me develop my web app / game without a computer.

The current only other alternative is to use FireBug Lite which is awfully hard to use on mobile devices as everything is super small and trying to tap anything is crazy clunky and barely useable. As a result I created an alternative that uses current web standards and better mobile usability to make development without a computer easier. This of course means not as much support for older browsers and devices but if you have to support those browsers on your mobile device then I guess nothing can really help you there.

## Usage

Include the debugger in the html output of a page you'd like to inspect and any actions that comes after it will be recorded (XMLHttpRequests and Console.logs).

```html
<script src="path/to/mobile-debug.min.js"></script>
```

You can also just insert it via javascript like

```javascript
document.appendChild(document.createElement("script")).src="path/to/mobile-debug.min.js"
```

The goal is to create a self contained script that you add wherever you want in your html file and after the script loads, all subsequent JavaScript outputs/activity will be also captured by the in dom debugger.

The console that this script generates lives in the DOM of the document that it is debugging meaning styles in the debugger may leak to global elements and vice versa. to mitigate this, all class names and ids of html elements and their selectors are scrambled on build to protect external elements from receiving any of these styles. in the rare case that there is a styling conflict, feel free to re-build the project and that should re-scramble the class names and ids again to hopefully not conflict.

```bash
cd /path/to/project/dependency/folder
git clone https://github.com/muggy8/mobile-debug.git
cd mobile-debug
npm install
node build
```

## Interactions

The inspector takes up the form of a small bar at the bottom of your page, you can feel to click on any of the 3 main tabs to bring up that part of the Inspector. at any given time you can click on the current tab to minimize it to it's initial state.

<table>
	<tr>
		<td>
			<img src="https://i.imgur.com/v1TxsUX.jpg">
		</td>
		<td>
			<img src="https://i.imgur.com/Q3iQpQJ.png">
		</td>
		<td>
			<img src="https://i.imgur.com/kPbcYEP.jpg">
		</td>
		<td>
			<img src="https://i.imgur.com/hHblcYZ.png">
		</td>
	</tr>
</table>

In the console view. you can type anything into the input block and execute the script. Doing this will clear the input area. if you want to load in a previous input, you can click on the "Input: ..." chunk in the console output to load that chunk of code into the input area. If you output an object, you can double click that object to view the properties of that object. This action is recursive

<table>
	<tr>
		<td>
			<img src="https://i.imgur.com/kPbcYEP.jpg" >
		</td>
		<td>
			<img src="https://i.imgur.com/AdOmtGa.jpg" >
		</td>
		<td>
			<img src="https://i.imgur.com/AG190rI.png" >
		</td>
	</tr>
</table>

The Inspector view has 2 halves. The left half is the list of all the elements in the view and the right half is the selected element's styles. You can traverse your elements by double clicking any particular node and it will expand allowing you to explore further. By default nothing is expanded and the only element in view is the HTML element.

you can single click on any node and highlight it doing this will also highlight the node in the actual page showing you the Box Model. This may not work well if you are using Transform in your HTML. To get rid of the highlight box in your page, you can click on anywhere in the highlighted area to make it go away.

On the right side is the CSS rules that currently apply to the element you have selected. You can use this to change any CSS styling of any HTML element.

However do know that the HTML view does not update to match with the actual changes of the page. instead it is populated at the time of it's expand. if you wish to update the view to see what's in it right now, you should close to parent element and reopen it.

Below the 2 sections is a slider. This slider is for your convenience so you can resize the 2 halves of the inspector as you choose

<table>
	<tr>
		<td>
			<img src="https://i.imgur.com/Q3iQpQJ.png" >
		</td>
		<td>
			<img src="https://i.imgur.com/MaJASxG.png" >
		</td>
		<td>
			<img src="https://i.imgur.com/dxPCIm2.png" >
		</td>
		<td>
			<img src="https://i.imgur.com/XbwisPu.png" >
		</td>
	</tr>
</table>

The XHR tab is read only. it shows you a list of calls the current page has made and clicking on them will allow you to view it's response. The viewer doesn't attempt to prettify anything so what you see is what was received.

You can alternatively click on stats to view the headers sent and headers received as well as a good slew of other options that you may find useful if they are sent (eg request body)

<img src="https://i.imgur.com/hHblcYZ.png">

## Configurations
I don't really want to do this but it seem the most elegant solution to a z-index issue. You can put a JSON string into the body of the script tag which will be parsed with JSON.Parse and will allow different configurations for the Debugger.

#### style
```html
<script src="path/to/mobile-debug.min.js">
	{
		"style": {
			"zIndex": 1337,
			"backgroundColor": "#BBB"
		}
	}
</script>
```
The Style attribute pipes directly into the debugger's style attribute. This means it's equivilant of setting those styles by code like

```javascript
var debugger = document.querySelector("#mobile-debug")
debugger.style.zIndex = 1337
debugger.style.backgroundColor = "#BBB"
```

This is less doable in the minified version as the IDs and Classes of the debugger is scrambled on build to help prevent leakage of external styles into the debugger
