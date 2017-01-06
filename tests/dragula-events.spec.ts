import test = require('tape');
import {mockDragula} from './mock/mock-dragula';
import {raiseEvent} from './helpers/raise-event';
import {MockDragonElement} from './mock/mock-dragon-element';

test('.start() emits "cloned" for copies', t => {
    let containerElement = document.createElement('container');
    let item = document.createElement('item');
    let drake = mockDragula([containerElement], {copy: true});
    containerElement.appendChild(item);
    document.body.appendChild(containerElement);

    drake.on('cloned', (copy, original, type) => {
        if (type === 'copy') {
            t.notEqual(copy, item, 'copy is not a reference to item');
            t.equal(copy.nodeType, item.nodeType, 'copy of original is provided');
            t.equal(original, item, 'original item is provided');
        }
    });
    drake.start(item);

    t.plan(3);
    t.end();
});

test('.start() emits "drag" for items', t => {
    let containerElement = document.createElement('container');
    let item = document.createElement('item');
    let drake = mockDragula([containerElement]);
    containerElement.appendChild(item);
    document.body.appendChild(containerElement);

    drake.on('drag', (original, container) => {
        t.equal(original, item, 'item is a reference to moving target');
        t.equal(container, containerElement, 'container matches expected div');
    });
    drake.start(item);

    t.plan(2);
    t.end();
});

test('.end() emits "cancel" when not moved', t => {
    let containerElement = document.createElement('container');
    let item = document.createElement('item');
    let drake = mockDragula([containerElement]);
    containerElement.appendChild(item);
    document.body.appendChild(containerElement);

    drake.on('dragend', original => t.equal(original, item, 'item is a reference to moving target'));
    drake.on('cancel', (original, container) => {
        t.equal(original, item, 'item is a reference to moving target');
        t.equal(container, containerElement, 'container matches expected div');
    });
    raiseEvent(item, 'mousedown', {which: 1});
    raiseEvent(item, 'mousemove', {which: 1});
    drake.end();
    t.plan(3);
    t.end();
});

test('.end() emits "drop" when moved', t => {
    let container1 = document.createElement('container1');
    let container2 = document.createElement('container2');
    let item = document.createElement('item');
    let drake = mockDragula([container1, container2]);
    container1.appendChild(item);
    document.body.appendChild(container1);
    document.body.appendChild(container2);

    drake.on('dragend', original => t.equal(original, item, 'item is a reference to moving target'));
    drake.on('drop', (original, target, container) => {
        t.equal(original, item, 'item is a reference to moving target');
        t.equal(target, container2, 'target matches expected div');
        t.equal(container, container1, 'container matches expected div');
    });
    raiseEvent(item, 'mousedown', {which: 1});
    raiseEvent(item, 'mousemove', {which: 1});
    (<MockDragonElement>drake.draggedElement).mockMove(container2);
    drake.end();

    t.plan(4);
    t.end();
});

test('.remove() emits "remove" for items', t => {
    let containerElement = document.createElement('container');
    let item = document.createElement('item');
    let drake = mockDragula([containerElement]);
    containerElement.appendChild(item);
    document.body.appendChild(containerElement);

    drake.on('dragend', original => t.equal(original, item, 'item is a reference to moving target'));
    drake.on('remove', (original, container) => {
        t.equal(original, item, 'item is a reference to moving target');
        t.equal(container, containerElement, 'container matches expected div');
    });
    raiseEvent(item, 'mousedown', {which: 1});
    raiseEvent(item, 'mousemove', {which: 1});
    drake.remove();

    t.plan(3);
    t.end();
});

test('.remove() emits "cancel" for copies', t => {
    let containerElement = document.createElement('container');
    let item = document.createElement('item');
    let drake = mockDragula([containerElement], {copy: true});
    containerElement.appendChild(item);
    document.body.appendChild(containerElement);

    drake.on('dragend', () => t.pass('dragend got invoked'));
    drake.on('cancel', (copy, container) => {
        t.notEqual(copy, item, 'copy is not a reference to item');
        t.equal(copy.nodeType, item.nodeType, 'item is a copy of item');
        t.equal(container, null, 'container matches expectation');
    });
    raiseEvent(item, 'mousedown', {which: 1});
    raiseEvent(item, 'mousemove', {which: 1});
    drake.remove();

    t.plan(4);
    t.end();
});

test('.cancel() emits "cancel" when not moved', t => {
    let containerElement = document.createElement('container');
    let item = document.createElement('item');
    let drake = mockDragula([containerElement]);
    containerElement.appendChild(item);
    document.body.appendChild(containerElement);

    drake.on('dragend', original => t.equal(original, item, 'item is a reference to moving target'));
    drake.on('cancel', (original, container) => {
        t.equal(original, item, 'item is a reference to moving target');
        t.equal(container, containerElement, 'container matches expected div');
    });
    raiseEvent(item, 'mousedown', {which: 1});
    raiseEvent(item, 'mousemove', {which: 1});
    drake.cancel();

    t.plan(3);
    t.end();
});

test('.cancel() emits "drop" when not reverted', t => {
    let container1 = document.createElement('container1');
    let container2 = document.createElement('container2');
    let item = document.createElement('item');
    let drake = mockDragula([container1]);
    container1.appendChild(item);
    document.body.appendChild(container1);
    document.body.appendChild(container2);

    drake.on('dragend', original => t.equal(original, item, 'item is a reference to moving target'));
    drake.on('drop', (original, parent, container) => {
        t.equal(original, item, 'item is a reference to moving target');
        t.equal(parent, container2, 'parent matches expected div');
        t.equal(container, container1, 'container matches expected div');
    });
    raiseEvent(item, 'mousedown', {which: 1});
    raiseEvent(item, 'mousemove', {which: 1});
    (<MockDragonElement>drake.draggedElement).mockMove(container2);
    drake.cancel();

    t.plan(4);
    t.end();
});

test('.cancel() emits "cancel" when reverts', t => {
    let container1 = document.createElement('container1');
    let container2 = document.createElement('container2');
    let item = document.createElement('item');
    let drake = mockDragula([container1], {revertOnSpill: true});
    container1.appendChild(item);
    document.body.appendChild(container1);
    document.body.appendChild(container2);

    drake.on('dragend', original => t.equal(original, item, 'item is a reference to moving target'));
    drake.on('cancel', (original, container) => {
        t.equal(original, item, 'item is a reference to moving target');
        t.equal(container, container1, 'container matches expected div');
    });
    raiseEvent(item, 'mousedown', {which: 1});
    raiseEvent(item, 'mousemove', {which: 1});
    (<MockDragonElement>drake.draggedElement).mockMove(container2);
    drake.cancel();

    t.plan(3);
    t.end();
});

test('mousedown emits "cloned" for mirrors', t => {
    let containerElement = document.createElement('container');
    let item = document.createElement('item');
    let drake = mockDragula([containerElement]);
    containerElement.appendChild(item);
    document.body.appendChild(containerElement);

    drake.on('cloned', (copy, original, type) => {
        if (type === 'mirror') {
            t.notEqual(copy, item, 'mirror is not a reference to item');
            t.equal(copy.nodeType, item.nodeType, 'mirror of original is provided');
            t.equal(original, item, 'original item is provided');
        }
    });
    raiseEvent(item, 'mousedown', {which: 1});
    raiseEvent(item, 'mousemove', {which: 1});

    t.plan(3);
    t.end();
});

test('mousedown emits "cloned" for copies', t => {
    let containerElement = document.createElement('container');
    let item = document.createElement('item');
    let drake = mockDragula([containerElement], {copy: true});
    containerElement.appendChild(item);
    document.body.appendChild(containerElement);

    drake.on('cloned', (copy, original, type) => {
        if (type === 'copy') {
            t.notEqual(copy, item, 'copy is not a reference to item');
            t.equal(copy.nodeType, item.nodeType, 'copy of original is provided');
            t.equal(original, item, 'original item is provided');
        }
    });
    raiseEvent(item, 'mousedown', {which: 1});
    raiseEvent(item, 'mousemove', {which: 1});

    t.plan(3);
    t.end();
});

test('mousedown emits "drag" for items', t => {
    let containerElement = document.createElement('container');
    let item = document.createElement('item');
    let drake = mockDragula([containerElement]);
    containerElement.appendChild(item);
    document.body.appendChild(containerElement);

    drake.on('drag', (original, container) => {
        t.equal(original, item, 'item is a reference to moving target');
        t.equal(container, containerElement, 'container matches expected div');
    });
    raiseEvent(item, 'mousedown', {which: 1});
    raiseEvent(item, 'mousemove', {which: 1});

    t.plan(2);
    t.end();
});
