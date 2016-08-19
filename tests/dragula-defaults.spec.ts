import test = require('tape');
import Test = test.Test;
import {mockDragula} from './mock/mock-dragula';
import {MockDragster} from './mock/mock-dragster';

test('drake has sensible default options', (t: Test) => {
    let dragster: MockDragster = mockDragula();
    t.equal(typeof dragster.options.moves, 'function', 'options.moves defaults to a method');
    t.equal(typeof dragster.options.accepts, 'function', 'options.accepts defaults to a method');
    t.equal(typeof dragster.options.invalid, 'function', 'options.invalid defaults to a method');
    t.equal(typeof dragster.options.isContainer, 'function', 'options.isContainer defaults to a method');
    t.equal(dragster.options.copy, false, 'options.copy defaults to false');
    t.equal(dragster.options.revertOnSpill, false, 'options.revertOnSpill defaults to false');
    t.equal(dragster.options.removeOnSpill, false, 'options.removeOnSpill defaults to false');
    t.equal(dragster.options.direction, 'vertical', "options.direction defaults to 'vertical'");
    t.equal(dragster.options.mirrorContainer, document.body, 'options.mirrorContainer defaults to an document.body');
    t.end();
});
