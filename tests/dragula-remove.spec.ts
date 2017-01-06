import test = require('tape');
import {mockDragula} from './mock/mock-dragula';
import {raiseEvent} from './helpers/raise-event';

test('remove does not throw when not dragging', t => {
    t.test('a single time', st => {
        let drake = mockDragula();
        st.doesNotThrow(() => drake.remove(), 'dragula ignores a single call to drake.remove');
        st.end();
    });
    t.test('multiple times', st => {
        let drake = mockDragula();
        st.doesNotThrow(
            () => {
                drake.remove();
                drake.remove();
                drake.remove();
                drake.remove();
            },
            'dragula ignores multiple calls to drake.remove'
        );
        st.end();
    });
    t.end();
});

test('when dragging and remove gets called, element is removed', t => {
    let div = document.createElement('div');
    let item = document.createElement('div');
    let drake = mockDragula([div]);
    div.appendChild(item);
    document.body.appendChild(div);
    drake.start(item);
    drake.remove();
    t.equal(div.children.length, 0, 'item got removed from container');
    t.equal(drake.dragging, false, 'drake has stopped dragging');
    t.end();
});

test('when dragging and remove gets called, remove event is emitted', t => {
    let div = document.createElement('div');
    let item = document.createElement('div');
    let drake = mockDragula([div]);
    div.appendChild(item);
    document.body.appendChild(div);

    drake.start(item);
    drake.on('remove', (target, container) => {
        t.equal(target, item, 'remove was invoked with item');
        t.equal(container, div, 'remove was invoked with container');
    });
    drake.on('dragend', () => t.pass('dragend got called'));
    drake.remove();

    t.plan(3);
    t.end();
});

test('when dragging a copy and remove gets called, cancel event is emitted', t => {
    let div = document.createElement('div');
    let item = document.createElement('div');
    let drake = mockDragula([div], {copy: true});
    div.appendChild(item);
    document.body.appendChild(div);

    drake.on('cancel', (target, container) => {
        t.true(target.hasAttribute('data-dragster-transit'), 'cancel was invoked with item');
        t.notEqual(target, item, 'item is a copy and not the original');
        t.equal(container, null, 'cancel was invoked with container');
    });
    drake.on('dragend', () => t.pass('dragend got called'));
    raiseEvent(item, 'mousedown', {which: 1});
    raiseEvent(item, 'mousemove', {which: 1});
    drake.remove();

    t.plan(4);
    t.end();
});
