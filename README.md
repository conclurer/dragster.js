# Dragster.js

A lightweight, simple and fast drag and drop library. Dragster is completly written in typescript, utilizes the performance of RxJS and interfaces Dragula.

For demos, please check out [https://conclurer.github.io/dragster.js/](https://conclurer.github.io/dragster.js/).

## Why Dragster?
Dragula is a great drag and drop framework - but it seems to be no longer maintained. Dragster is based on dragula's behavior and adds a fews new features with more to come.

Furthermore, Dragster is based on new web technologies like Observables, removing some legacy support of dragula. 

Being written in Typescript, Dragster can easily be extended by [us](https://www.conclurer.com) as well as other contributers (by the way - feel free to fork and contribute!).

## Features

- A lightweight drag and drop library that behaves like dragula
- Super easy to set up
- Figures out sort order on its own
- A shadow where the item would be dropped offers visual feedback
- Supports touch (of course)
- Seamlessly handles clicks without any configuration
- No additional CSS needed

## Basic Usage

Dragster has a straight forward and simple API. 

```typescript
import {Dragster} from 'dragster.js';

new Dragster({}, document.getElementById('left'), document.getElementById('right'));
```

By default, Dragster will allow the user to drag an element in any of the containers and drop it in any other container in the list. If the element is dropped anywhere that's not one of the containers, the event will be gracefully cancelled according to the [`revertOnSpill` and `removeOnSpill` options](#options).

Note that dragging is only triggered on left clicks, and only if no meta keys are pressed.

The example above allows the user to drag elements from left into right, and from right into left.

## Options

You can add additional options to Dragster. Theses are their default values:

```typescript
import {IDragsterOptions, dragsterDefaultFlyingElementProvider, dragsterDefaultShadowElementProvider} from 'dragster.js';

let options: IDragsterOptions = {
	// Allowed containers for drag and drop operations
	containers: [],
	
	// Determines if an element can be dragged
	// triggeringElement is the element that will be dragged
	// dragHandle is the element that is right below the mouse pointer
	moves: (triggeringElement: HTMLElement, sourceContainer: HTMLElement, dragHandle: HTMLElement, nextSibling: HTMLElement | null) => {
		return true;
	},
	
	// If true is returned, triggeringElement can be moved into targetContainer next to nextSibling
	// triggeringElement comes from sourceContainer
	accepts: (triggeringElement: HTMLElement, targetContainer: HTMLElement, sourceContainer: HTMLElement, nextSibling: HTMLElement | null) => {
		return true;
	},
	
	// If true is returned, triggeringElement cannot be dragged.
	// triggeringElement is dragged with handle
	invalid: (triggeringElement: HTMLElement, handle: HTMLElement) => {
		return false;
	},
	
	// If true is returned, container is treated as additional container besides containers (see above).
	isContainer: (container: HTMLElement) => false,
	
	// If true, elements will be cloned instead of moved
	copy: false,
	
	// If true, the copy source can still be sorted
	copySortSource: false,
	
	// If true, dragged elements revert to their original position when being dropped outside of a valid container.
	revertOnSpill: false,
	
	// If true, dragged elements will be deleted when being dropped outside of a valid container.
	removeOnSpill: false,
	
	// Drop zone detection direction
	direction: 'vertical',
	
	// The container the currently dragged element will be attached to
	mirrorContainer: document.body,
	
	// If true, text in <input> elements can still be selected
	ignoreInputTextSelection: true,
	
	// Provider function for the mirror element that will be displayed while the user is dragging originalElement
	flyingElementProvider: dragsterDefaultFlyingElementProvider,
	
	// Provider function for the preview element that is added to the target container while the dragged item is dragged over.
	shadowElementProvider: dragsterDefaultShadowElementProvider
};
```

You can initialize Dragster with a set of containers and dynamically add containers later on.

## Dragster API

`Dragster` object instances have a few built-in methods that allow you to control Dragster's behavior.

### `containers: HTMLElement[]`
These are the HTMLElements Dragster is treating as containers. You can set and get these at any time.

### `dragging: boolean`
This is true if an element is currently being dragged.

### `start(item: HTMLElement): void`
Starts dragging the given item. Item is dragged until the user triggers a `mouseup` event.

### `end(): void`
Gracefully end the drag event as if using the last position marked by the preview shadow as the drop target. The proper cancel or drop event will be fired, depending on whether the item was dropped back where it was originally lifted from.

### `cancel(revert: boolean = false): void`
If an element managed by Dragster is currently being dragged, this method will gracefully cancel the drag action. You can also pass in revert at the method invocation level, effectively producing the same result as if `revertOnSpill ` was `true`.

Note that a "cancellation" will result in a cancel event only in the following scenarios:

- `revertOnSpill` is true
- Drop target (as previewed by the feedback shadow) is the source container and the item is dropped in the same position where it was originally dragged from

### `remove(): void`
If an element managed by Dragster is currently being dragged, this method will gracefully remove it from the DOM.

### `on(event: string, callback: Function): Dragster`
Subscribe to one of Dragster's events: 

Event Name | Listener Arguments               | Event Description
-----------|----------------------------------|-------------------------------------------------------------------------------------
`drag`     | `el, source`                     | `el` was lifted from `source`
`dragend`  | `el`                             | Dragging event for `el` ended with either `cancel`, `remove`, or `drop`
`drop`     | `el, target, source, sibling`    | `el` was dropped into `target` before a `sibling` element, and originally came from `source`
`cancel`   | `el, container, source`          | `el` was being dragged but it got nowhere and went back into `container`, its last stable parent; `el` originally came from `source`
`remove`   | `el, container, source`          | `el` was being dragged but it got nowhere and it was removed from the DOM. Its last stable parent was `container`, and originally came from `source`
`shadow`   | `el, container, source`          | `el`, _the visual aid shadow_, was moved into `container`. May trigger many times as the position of `el` changes, even within the same `container`; `el` originally came from `source`
`over`     | `el, container, source`          | `el` is over `container`, and originally came from `source`
`out`      | `el, container, source`          | `el` was dragged out of `container` or dropped, and originally came from `source`
`cloned`   | `clone, original, type`          | DOM element `original` was cloned as `clone`, of `type` _(`'mirror'` or `'copy'`)_. Fired for mirror images and when `copy: true`

### `events$: Observable<IDragsterEvent>`
Returns a RxJS observable that streams all of Dragster's events.

### `destroy(): void`
Removes all drag and drop events used by Dragster to manage drag and drop between the containers. If `destroy()` is called while an element is being dragged, the drag will be effectively cancelled.

## Replacing Dragula with Dragster

To replace dragula with Dragster, just remove dragula's JS and CSS files and add `docs/dragster.min.js`. If you are using npm, add Dragster using: 

`npm install --save dragster.js`

Dragster will work out-of-the-box, since it interfaces dragula. Therefore, your existing `dragula()` calls will work as-is.

```typescript
import {dragula} from 'dragster.js';

// drake will be instanceof Dragster
let drake = dragula([document.getElementById('left'), document.getElementById('right')]);
```