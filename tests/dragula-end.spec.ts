import test = require('tape');
import {mockDragula} from './mock/mock-dragula';
import {MockDragonElement} from './mock/mock-dragon-element';

test('end does not throw when not dragging', t => {
    t.test('a single time', st => {
        let drake = mockDragula();
        st.doesNotThrow(() => drake.end(), 'dragula ignores a single call to drake.end');
        st.end();
    });

    t.test('multiple times', st => {
        let drake = mockDragula();
        st.doesNotThrow(
            () => {
                drake.end();
                drake.end();
                drake.end();
                drake.end();
            },
            'dragula ignores multiple calls to drake.end'
        );
        st.end();
    });
    t.end();
});

test('when already dragging, .end() ends (cancels) previous drag', t => {
    let containerElement = document.createElement('container');
    let item1 = document.createElement('item1');
    let item2 = document.createElement('item2');
    let drake = mockDragula([containerElement]);
    containerElement.appendChild(item1);
    containerElement.appendChild(item2);
    document.body.appendChild(containerElement);

    drake.start(item1);
    drake.on('dragend', item => t.equal(item, item1, 'dragend invoked with correct item'));
    drake.on('cancel', (item, source) => {
        t.equal(item, item1, 'cancel invoked with correct item');
        t.equal(source, containerElement, 'cancel invoked with correct source');
    });
    drake.end();

    t.plan(4);
    t.equal(drake.dragging, false, 'final state is: drake is not dragging');
    t.end();
});

test('when already dragged, ends (drops) previous drag', t => {
    let container1 = document.createElement('container1');
    let container2 = document.createElement('container2');
    let item1 = document.createElement('item1');
    let item2 = document.createElement('item2');
    let drake = mockDragula([container1, container2]);
    container1.appendChild(item1);
    container1.appendChild(item2);
    document.body.appendChild(container1);
    document.body.appendChild(container2);

    drake.start(item1);
    (<MockDragonElement>drake.draggedElement).mockMove(container2);
    drake.on('dragend', item => t.equal(item, item1, 'dragend invoked with correct item'));
    drake.on('drop', (item, target, source) => {
        t.equal(item, item1, 'drop invoked with correct item');
        t.equal(source, container1, 'drop invoked with correct source');
        t.equal(target, container2, 'drop invoked with correct target');
    });
    drake.end();

    t.plan(5);
    t.equal(drake.dragging, false, 'final state is: drake is not dragging');
    t.end();
});
