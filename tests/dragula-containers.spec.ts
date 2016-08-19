import test = require('tape');
import Test = test.Test;
import {mockDragula} from './mock/mock-dragula';
import {MockDragster} from './mock/mock-dragster';

test('drake defaults to no containers', (t: Test) => {
    let drake: MockDragster = mockDragula();
    t.ok(Array.isArray(drake.containers), 'drake.containers is an array');
    console.log(drake.containers);
    t.equal(drake.containers.length, 0, 'drake.containers is empty');
    t.end();
});

test('drake reads containers from array argument', (t: Test) => {
    let el: HTMLElement = document.createElement('div');
    let containers: HTMLElement[] = [el];
    let drake: MockDragster = mockDragula(containers);
    t.equal(drake.containers[0], containers[0], 'drake.containers matches input');
    t.equal(drake.containers.length, 1, 'drake.containers has one item');
    t.end();
});

test('drake reads containers from array in options', (t: Test) => {
    let el: HTMLElement = document.createElement('div');
    let containers: HTMLElement[] = [el];
    let drake: MockDragster = mockDragula({containers: containers});
    t.equal(drake.containers[0], containers[0], 'drake.containers matches input');
    t.equal(drake.containers.length, 1, 'drake.containers has one item');
    t.end();
});

test('containers in options take precedent', (t: Test) => {
    let el: HTMLElement = document.createElement('div');
    let containers: HTMLElement[] = [el];
    let drake: MockDragster = mockDragula([], {containers: containers});
    t.equal(drake.containers[0], containers[0], 'drake.containers matches input');
    t.equal(drake.containers.length, 1, 'drake.containers has one item');
    t.end();
});
