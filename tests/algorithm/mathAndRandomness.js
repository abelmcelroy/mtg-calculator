const tap = require("tap");

const { rand, fisherYates } = require("../../src/statisticalSimulator.js");
const { nCk, factorial, sum } = require("../../src/probabilityCalculatorUtils.js");

tap.test("factorial", tap => {
  tap.equal(factorial(0).toNumber(), 1);
  tap.equal(factorial(-1).toNumber(), 1);
  tap.equal(factorial(2).toNumber(), 2);
  tap.equal(factorial(13).toNumber(), 6227020800);
  tap.end();
});

tap.test("combinations", tap => {
  tap.equal(nCk(5, 5).toNumber(), 1);
  tap.equal(nCk(5, 2).toNumber(), 10);
  tap.equal(nCk(10, 11).toNumber(), 0);
  tap.equal(nCk(10, 4).toNumber(), 210);
  tap.equal(nCk(42, 15).toNumber(), 98672427616);
  tap.end();
});

tap.test("rand replaces Math.random", tap => {
  const SAMPLE_SIZE = 100000;
  const sample = Array.from({ length: SAMPLE_SIZE }, () => rand());
  tap.ok(sample.every(n => n < 1 && n > 0));
  tap.end();
});

tap.test("shuffling arrays", tap => {
  const array = Array.from({ length: 10 }, (_, i) => i+1);
  fisherYates(array)
  tap.equal(array.length, 10);
  tap.equal(new Set(array).size, 10);
  tap.equal(array.reduce((sum)), 55);
  tap.end()
})