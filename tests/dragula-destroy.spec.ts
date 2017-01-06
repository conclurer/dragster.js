import test = require('tape');
import Test = test.Test;
import {mockDragula} from './mock/mock-dragula';

test('destroy does not throw when not dragging, destroyed, or whatever', (t: Test) => {
    t.test('a single time', (st: Test) => {
        let drake = mockDragula();
        st.doesNotThrow(
            () => drake.destroy(),
            'dragula bites into a single call to drake.destroy'
        );
        st.end();
    });
    t.test('multiple times', (st: Test) => {
        let drake = mockDragula();
        st.doesNotThrow(
            () => {
                drake.destroy();
                drake.destroy();
                drake.destroy();
                drake.destroy();
            },
            'dragula bites into multiple calls to drake.destroy'
        );
        st.end();
    });
    t.end();
});

test('when dragging and destroy gets called, nothing happens', (t: Test) => {
    let div = document.createElement('div');
    let item = document.createElement('div');
    let drake = mockDragula([div]);
    div.appendChild(item);
    document.body.appendChild(div);
    drake.start(item);
    drake.destroy();
    t.equal(div.children.length, 1, 'nothing happens');
    t.equal(drake.dragging, false, 'drake has stopped dragging');
    t.end();
});

test('when dragging and destroy gets called, dragend event is emitted gracefully', (t: Test) => {
    let div = document.createElement('div');
    let item = document.createElement('div');
    let drake = mockDragula([div]);
    div.appendChild(item);
    document.body.appendChild(div);
    drake.on('dragend', () => t.pass('dragend got called'));
    drake.start(item);
    drake.destroy();
    t.plan(1);
    t.end();
});

test('when dragging a copy and destroy gets called, default does not revert', (t: Test) => {
    let div = document.createElement('div');
    let div2 = document.createElement('div');
    let item = document.createElement('div');
    let drake = mockDragula([div, div2]);
    div.appendChild(item);
    document.body.appendChild(div);
    document.body.appendChild(div2);

    // Setup events
    drake.on('drop', (target: HTMLElement, parent: HTMLElement, source: HTMLElement) => {
        t.equal(target, item, 'drop was invoked with item');
        t.equal(parent, div2, 'drop was invoked with final container');
        t.equal(source, div, 'drop was invoked with source container');
    });
    drake.on('dragend', () => t.pass('dragend got called'));

    // Execute test
    drake.start(item);
    if (drake.draggedElement != null) drake.draggedElement.mockMove(div2);
    drake.destroy();
    t.plan(4);
    t.end();
});

test('when dragging a copy and destroy gets called, revert is executed', (t: Test) => {
    let div = document.createElement('div');
    let div2 = document.createElement('div');
    let item = document.createElement('div');
    let drake = mockDragula([div, div2], {revertOnSpill: true});
    div.appendChild(item);
    document.body.appendChild(div);
    document.body.appendChild(div2);

    // Setup events
    drake.on('cancel', (target: HTMLElement, container: HTMLElement) => {
        t.equal(target, item, 'cancel was invoked with item');
        t.equal(container, div, 'cancel was invoked with container');
    });
    drake.on('dragend', () => t.pass('dragend got called'));

    // Execute test
    drake.start(item);
    if (drake.draggedElement != null) drake.draggedElement.mockMove(div2);
    drake.destroy();
    t.plan(3);
    t.end();
});
