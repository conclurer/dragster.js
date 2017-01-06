import test = require('tape');
import {dragula} from '../lib/dragula';
import {Dragster} from '../lib/dragster';

test('public api matches expectation', t => {
    t.equal(typeof dragula, 'function', 'dragula is a function');
    t.equal(typeof Dragster, 'function', 'Dragster is a function (class)');
    t.end();
});
