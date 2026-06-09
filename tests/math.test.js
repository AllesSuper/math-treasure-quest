// Lightweight, dependency-free unit tests for the math engine.
// Run with: node tests/math.test.js  (or: npm test)
//
// These tests guarantee that generated tasks always stay within the ranges
// requested by the curriculum, and that the validation helper agrees.
"use strict";

var app = require("../app.js");

var failures = 0;
var checks = 0;

function assert(condition, message) {
  checks++;
  if (!condition) {
    failures++;
    console.error("  \u2717 " + message);
  }
}

function section(name) {
  console.log("\n" + name);
}

var ITERATIONS = 4000;
var levels = [1, 2, 3, 4, 5];

section("Addition stays within range (0..100, sum <= 100, 2 or 3 numbers)");
levels.forEach(function (level) {
  for (var i = 0; i < ITERATIONS; i++) {
    var task = app.generateAddition(level);
    var okCount = task.operands.length === 2 || task.operands.length === 3;
    var okOperands = task.operands.every(function (n) {
      return Number.isInteger(n) && n >= 0 && n <= 100;
    });
    var sum = task.operands.reduce(function (s, n) {
      return s + n;
    }, 0);
    assert(okCount, "addition has 2 or 3 operands");
    assert(okOperands, "addition operands within 0..100");
    assert(sum === task.answer, "addition answer equals sum");
    assert(sum >= 0 && sum <= 100, "addition sum within 0..100");
    assert(app.validateTask(task), "addition passes validateTask");
  }
});

section("Subtraction stays within range (0..100, never negative)");
levels.forEach(function (level) {
  for (var i = 0; i < ITERATIONS; i++) {
    var task = app.generateSubtraction(level);
    var a = task.operands[0];
    var b = task.operands[1];
    assert(a >= 0 && a <= 100, "subtraction minuend within 0..100");
    assert(b >= 0 && b <= 100, "subtraction subtrahend within 0..100");
    assert(task.answer >= 0, "subtraction result is never negative");
    assert(a - b === task.answer, "subtraction answer is correct");
    assert(app.validateTask(task), "subtraction passes validateTask");
  }
});

section("Multiplication stays within range (1..10 x 1..11)");
levels.forEach(function (level) {
  for (var i = 0; i < ITERATIONS; i++) {
    var task = app.generateMultiplication(level);
    var f1 = task.operands[0];
    var f2 = task.operands[1];
    assert(f1 >= 1 && f1 <= 10, "first factor within 1..10");
    assert(f2 >= 1 && f2 <= 11, "second factor within 1..11");
    assert(f1 * f2 === task.answer, "multiplication answer is correct");
    assert(app.validateTask(task), "multiplication passes validateTask");
  }
});

section("Mixed mode always produces a valid task");
for (var i = 0; i < ITERATIONS; i++) {
  var task = app.generateTask("mix", 3);
  assert(app.validateTask(task), "mixed task passes validateTask");
}

section("validateTask rejects out-of-range tasks");
assert(
  !app.validateTask({ type: "sub", operands: [3, 5], answer: -2 }),
  "rejects negative subtraction",
);
assert(
  !app.validateTask({ type: "add", operands: [80, 40], answer: 120 }),
  "rejects addition sum over 100",
);
assert(
  !app.validateTask({ type: "mul", operands: [12, 3], answer: 36 }),
  "rejects factor over 10",
);

section("i18n integrity");
assert(app.LANGUAGES[0].code === "de", "German is the first language");
Object.keys(app.I18N.de).forEach(function (key) {
  assert(typeof app.I18N.en[key] === "string", "English has key: " + key);
});

section("generateChoices: count, uniqueness, includes answer, non-negative");
levels.forEach(function (level) {
  var count = app.choiceCountForLevel(level);
  for (var i = 0; i < ITERATIONS; i++) {
    var task = app.generateTask("mix", level);
    var choices = app.generateChoices(task, count);
    assert(choices.length === count, "choices length equals requested count");
    assert(
      choices.indexOf(task.answer) !== -1,
      "choices always include the correct answer",
    );
    var unique = {};
    var allUnique = true;
    var allValid = true;
    choices.forEach(function (c) {
      if (unique[c]) allUnique = false;
      unique[c] = true;
      if (!Number.isInteger(c) || c < 0) allValid = false;
    });
    assert(allUnique, "choices are all unique");
    assert(allValid, "choices are non-negative integers");
  }
});

section("choiceCountForLevel stays within 4..8");
[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(function (level) {
  var count = app.choiceCountForLevel(level);
  assert(
    count >= 4 && count <= 8,
    "choice count within 4..8 for level " + level,
  );
  assert(Number.isInteger(count), "choice count is an integer");
});

section("computeTimeBudget: clamped 6..40, faster kids get less time");
levels.forEach(function (level) {
  var slow = app.computeTimeBudget(20000, level);
  var fast = app.computeTimeBudget(2000, level);
  var seed = app.computeTimeBudget(0, level);
  assert(slow >= 6 && slow <= 40, "slow budget within 6..40");
  assert(fast >= 6 && fast <= 40, "fast budget within 6..40");
  assert(seed >= 6 && seed <= 40, "seed budget within 6..40");
  assert(fast <= slow, "faster average yields less or equal time");
  assert(Number.isInteger(slow), "budget is an integer");
});

section("updateAvgMs: EMA seeds, clamps samples, moves toward new value");
assert(app.updateAvgMs(0, 5000) === 5000, "first sample seeds the average");
var moved = app.updateAvgMs(4000, 9000);
assert(moved > 4000 && moved < 9000, "average moves toward the new sample");
assert(
  app.updateAvgMs(1000, 999999) <= 60000,
  "huge samples are clamped to 60000",
);
assert(app.updateAvgMs(1000, 1) >= 600, "tiny samples are clamped to 600");
assert(Number.isInteger(moved), "average is an integer");

console.log("\n" + (checks - failures) + "/" + checks + " checks passed.");
if (failures > 0) {
  console.error(failures + " check(s) failed.");
  process.exit(1);
}
console.log("All tests passed. \u2705");
