import test = require('tape');
import Test = test.Test;
import {mockDragula} from './mock/mock-dragula';

test('cancel does not throw when not dragging', (t: Test) => {
    t.test('a single time', (st: Test) => {
        let drake = mockDragula();
        st.doesNotThrow(
            () => {
                drake.cancel();
            },
            'dragula ignores a single call to drake.cancel'
        );
        st.end();
    });
    t.test('multiple times', (st: Test) => {
        let drake = mockDragula();
        st.doesNotThrow(
            () => {
                drake.cancel();
                drake.cancel();
                drake.cancel();
                drake.cancel();
            },
            'dragula ignores multiple calls to drake.cancel'
        );
        st.end();
    });
    t.end();
});

test('when dragging and cancel gets called, nothing happens', (t: Test) => {
    let div = document.createElement('div');
    let item = document.createElement('div');
    let drake = mockDragula([div]);
    div.appendChild(item);
    document.body.appendChild(div);
    drake.start(item);
    drake.cancel();
    t.equal(div.children.length, 1, 'nothing happens');
    t.equal(drake.dragging, false, 'drake has stopped dragging');
    t.end();
});

test('when dragging and cancel gets called, cancel event is emitted', (t: Test) => {
    let div = document.createElement('div');
    let item = document.createElement('div');
    let drake = mockDragula([div]);
    div.appendChild(item);
    document.body.appendChild(div);

    // Setup streams
    drake.on('cancel', (target: HTMLElement, container: HTMLElement) => {
        t.equal(target, item, 'cancel was invoked with item');
        t.equal(container, div, 'cancel was invoked with container');
    });
    drake.on('dragend', () => {
        t.pass('dragend got called');
    });

    // Perform actions
    drake.start(item);
    drake.cancel();
    t.plan(3);
    t.end();
});

test('when dragging a copy and cancel gets called, default does not revert', (t: Test) => {
    let div = document.createElement('div');
    let div2 = document.createElement('div');
    let item = document.createElement('div');
    let drake = mockDragula([div, div2]);
    div.appendChild(item);
    document.body.appendChild(div);
    document.body.appendChild(div2);

    // Setup streams
    drake.on('drop', (target: HTMLElement, parent: HTMLElement, source: HTMLElement) => {
        t.equal(target, item, 'drop was invoked with item');
        t.equal(parent, div2, 'drop was invoked with final container');
        t.equal(source, div, 'drop was invoked with source container');
    });
    drake.on('dragend', () => t.pass('dragend got called'));

    // Perform actions
    drake.start(item);

    // Move to div2
    if (drake.draggedElement != null) drake.draggedElement.mockMove(div2);
    drake.cancel();
    t.plan(4);
    t.end();
});

test('when dragging a copy and cancel gets called, revert is executed', (t: Test) => {
    let div = document.createElement('div');
    let div2 = document.createElement('div');
    let item = document.createElement('div');
    let drake = mockDragula([div, div2]);
    div.appendChild(item);
    document.body.appendChild(div);
    document.body.appendChild(div2);

    // Setup streams
    drake.on('cancel', (target: HTMLElement, container: HTMLElement) => {
        t.equal(target, item, 'cancel was invoked with item');
        t.equal(container, div, 'cancel was invoked with container');
    });
    drake.on('dragend', () => t.pass('dragend got called'));

    // Perform actions
    drake.start(item);

    // Move to div2
    if (drake.draggedElement != null) drake.draggedElement.mockMove(div2);
    drake.cancel(true);
    t.plan(3);
    t.end();
});
