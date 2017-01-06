import test = require('tape');
import {raiseEvent} from './helpers/raise-event';
import {ITestCaseDragEvent} from './interfaces/drag-event-test-case';
import {mockDragula} from './mock/mock-dragula';
import {MockDragonElement} from './mock/mock-dragon-element';

test('drag event gets emitted when clicking an item', t => {
    let testCases: ITestCaseDragEvent[] = [
        {description: 'works for left clicks', eventOptions: {which: 1}},
        {description: 'works for wheel clicks', eventOptions: {which: 1}},
        {
            description: 'works when clicking buttons by default',
            eventOptions: {which: 1},
            testCaseOptions: {tagName: 'button'}
        },
        {
            description: 'works when clicking anchors by default',
            eventOptions: {which: 1},
            testCaseOptions: {tagName: 'a'}
        },
        {description: 'fails for right clicks', eventOptions: {which: 2}, testCaseOptions: {passes: false}},
        {
            description: 'fails for meta-clicks',
            eventOptions: {which: 1, metaKey: true},
            testCaseOptions: {passes: false}
        },
        {
            description: 'fails for ctrl-clicks',
            eventOptions: {which: 1, ctrlKey: true},
            testCaseOptions: {passes: false}
        },
        {
            description: 'fails when clicking containers',
            eventOptions: {which: 1},
            testCaseOptions: {passes: false, containerClick: true}
        },
        {
            description: 'fails whenever invalid returns true',
            eventOptions: {which: 1},
            testCaseOptions: {passes: false, dragsterOptions: {invalid: () => true}}
        },
        {
            description: 'fails whenever moves returns false',
            eventOptions: {which: 1},
            testCaseOptions: {passes: false, dragsterOptions: {moves: () => false}}
        }
    ];

    for (let testCase of testCases) {
        t.test(testCase.description, st => {
            let o = testCase.testCaseOptions || {};
            let containerElement = document.createElement('container');
            let item = document.createElement(o.tagName || 'item');
            let shouldBeDragged = o.passes !== false;
            let drake = mockDragula([containerElement], o.dragsterOptions);
            containerElement.appendChild(item);
            document.body.appendChild(containerElement);

            // Setup events
            drake.on('drag', (target, container) => {
                if (shouldBeDragged) {
                    st.pass(`${testCase.description}: drag event was emitted synchronously`);
                }
                else {
                    st.fail(`${testCase.description}: drag event was emitted synchronously`);
                }
                st.equal(target, item, `${testCase.description}: first argument is selected item`);
                st.equal(container, containerElement, `${testCase.description}: second argument is container`);
            });

            // Start events
            raiseEvent(o.containerClick ? containerElement : item, 'mousedown', testCase.eventOptions);
            raiseEvent(o.containerClick ? containerElement : item, 'mousemove');
            st.plan(shouldBeDragged ? 4 : 1);
            st.equal(drake.dragging, shouldBeDragged, `${testCase.description}: final state is drake is ${shouldBeDragged ? '' : 'not '}dragging`);
            st.end();
        });
    }

    t.end();
});

test('when already dragging, mousedown/mousemove ends (cancels) previous drag', t => {
    let containerElement = document.createElement('container');
    let item1 = document.createElement('item1');
    let item2 = document.createElement('item2');
    let drake = mockDragula([containerElement]);
    containerElement.appendChild(item1);
    containerElement.appendChild(item2);
    document.body.appendChild(containerElement);

    drake.on('dragend', item => {
        t.equal(item, item1, 'dragend invoked with correct item')
    });
    drake.on('cancel', (item, source) => {
        t.equal(item, item1, 'cancel invoked with correct item');
        t.equal(source, containerElement, 'cancel invoked with correct source');
    });
    drake.start(item1);
    raiseEvent(item1, 'mousemove', {which: 1});
    raiseEvent(item2, 'mousedown', {which: 1});
    raiseEvent(item2, 'mousemove', {which: 1});

    t.plan(4);
    t.equal(drake.dragging, true, 'final state is drake is dragging');
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

    drake.on('dragend', item => t.equal(item, item1, 'dragend invoked with correct item'));
    drake.on('drop', (item, target, source) => {
        t.equal(item, item1, 'drop invoked with correct item');
        t.equal(source, container1, 'drop invoked with correct source');
        t.equal(target, container2, 'drop invoked with correct target');
    });
    drake.start(item1);
    (<MockDragonElement>drake.draggedElement).mockMove(container2);
    raiseEvent(item2, 'mousedown', {which: 1});
    raiseEvent(item2, 'mousemove', {which: 1});

    t.plan(5);
    t.equal(drake.dragging, true, 'final state is drake is dragging');
    t.end();
});

test('when copying, emits cloned with the copy', t => {
    let containerElement = document.createElement('container');
    let item = document.createElement('item');
    let drake = mockDragula([containerElement], {copy: true});
    item.innerHTML = '<em>the force is <strong>with this one</strong></em>';
    containerElement.appendChild(item);
    document.body.appendChild(containerElement);

    drake.on('cloned', (copy, i, type) => {
        t.notEqual(copy, item, 'first argument is not exactly the target');
        t.equal(copy.tagName, item.tagName, 'first argument has same tag as target');
        t.equal(copy.innerHTML, item.innerHTML, 'first argument has same inner html as target');
        t.equal(i, item, 'second argument is clicked item');
    });
    raiseEvent(item, 'mousedown', {which: 1});
    raiseEvent(item, 'mousemove', {which: 1});

    t.plan(5);
    t.equal(drake.dragging, true, 'final state is drake is dragging');
    t.end();
});

test('when dragging, element gets attribute data-dragster-transit', t => {
    let div = document.createElement('div');
    let item = document.createElement('div');
    mockDragula([div]);
    div.appendChild(item);
    document.body.appendChild(div);

    raiseEvent(item, 'mousedown', {which: 1});
    raiseEvent(item, 'mousemove', {which: 1});

    t.true(item.hasAttribute('data-dragster-transit'), 'item has data-dragster-transit attribute');
    t.end();
});

test('when dragging, element gets a mirror image for show', t => {
    let div = document.createElement('div');
    let item = document.createElement('div');
    let drake = mockDragula([div]);
    item.innerHTML = '<em>the force is <strong>with this one</strong></em>';
    div.appendChild(item);
    document.body.appendChild(div);

    drake.on('cloned', (mirror, target) => {
        t.true(item.hasAttribute('data-dragster-transit'), 'item does not have dragster attribute');
        t.equal(mirror.innerHTML, item.innerHTML, 'mirror is passed to \'cloned\' event');
        t.equal(target, item, 'cloned lets you know that the mirror is a clone of `item`');
    });
    raiseEvent(item, 'mousedown', {which: 1});
    raiseEvent(item, 'mousemove', {which: 1});

    t.plan(3);
    t.end();
});

test('when dragging, mirror element gets appended to configured mirrorContainer', t => {
    let mirrorContainer = document.createElement('div');
    let div = document.createElement('div');
    let item = document.createElement('div');
    let drake = mockDragula([div], {
        'mirrorContainer': mirrorContainer
    });
    item.innerHTML = '<em>the force is <strong>with this one</strong></em>';
    div.appendChild(item);
    document.body.appendChild(div);

    drake.on('cloned', mirror => t.equal(mirror.parentNode, mirrorContainer, 'mirrors parent is the configured mirrorContainer'));
    raiseEvent(item, 'mousedown', {which: 1});
    raiseEvent(item, 'mousemove', {which: 1});

    t.plan(1);
    t.end();
});

test('when dragging stops, element gets gu-transit class removed', t => {
    let div = document.createElement('div');
    let item = document.createElement('div');
    let drake = mockDragula([div]);
    div.appendChild(item);
    document.body.appendChild(div);

    raiseEvent(item, 'mousedown', {which: 1});
    raiseEvent(item, 'mousemove', {which: 1});

    t.true(item.hasAttribute('data-dragster-transit'), 'item has dragster attribute');
    drake.end();
    t.false(item.hasAttribute('data-dragster-transit'), 'item has dragster attribute removed');
    t.end();
});

test('when drag begins, check for copy option', t => {
    let div = document.createElement('div');
    let item = document.createElement('div');
    item.className = 'copyable';
    div.className = 'contains';
    mockDragula([div], {
        copy: (el, source) => {
            t.equal(el.className, 'copyable', 'dragged element classname is copyable');
            t.equal(source.className, 'contains', 'source container classname is contains');
            return true;
        }
    });
    item.innerHTML = '<em>the force is <strong>with this one</strong></em>';
    div.appendChild(item);
    document.body.appendChild(div);

    raiseEvent(item, 'mousedown', {which: 1});
    raiseEvent(item, 'mousemove', {which: 1});
    raiseEvent(item, 'mousemove', {which: 1}); // ensure the copy method condition is only asserted once
    t.plan(2);
    t.end();
});
