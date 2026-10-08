"use strict";
const assert = require("node:assert/strict");
const app = require("../app.js");
let checks = 0;
function check(value, message) {
  assert.ok(value, message);
  checks++;
}
function task(type, operands, answer) {
  return { type, operands, answer };
}

// Seeded random stress tests make a failure reproducible.
let seed = 8102026;
const originalRandom = Math.random;
Math.random = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
};
try {
  const seen = new Set();
  for (let level = 1; level <= 5; level += 0.125) {
    for (const mode of ["add", "sub", "mul", "div"]) {
      for (let i = 0; i < 2000; i++) {
        const q = app.generateTask(mode, level);
        check(app.validateTask(q), "valid generated " + mode);
        check(q.type === mode, "requested operation");
        const choices = app.generateChoices(q, i % 2 ? 8 : 4);
        check(choices.length === (i % 2 ? 8 : 4), "choice count");
        check(new Set(choices).size === choices.length, "unique choices");
        check(choices.includes(q.answer), "correct choice");
        check(
          choices.every((c) => app.validateAnswer(q, c)),
          "choices within answer range",
        );
        for (const avg of [0, 2000, 20000, 60000]) {
          const time = app.computeTimeBudget(avg, level, q);
          const bounds =
            mode === "mul" ? [6, 20] : mode === "div" ? [10, 30] : [12, 40];
          check(
            Number.isInteger(time) && time >= bounds[0] && time <= bounds[1],
            "timer bounds",
          );
        }
        if (mode === "mul" && level === 5) seen.add(q.operands.join("x"));
        if (level === 1 && (mode === "add" || mode === "sub"))
          check(q.operands[0] <= 20 && q.answer <= 20, "easy arithmetic");
      }
    }
  }
  check(seen.size === 81, "all 81 ordered factor combinations generated");
  for (const total of [10, 25]) {
    for (let i = 0; i < 1000; i++) {
      const plan = app.createRoundModes("mix", total);
      const counts = ["add", "sub", "mul", "div"].map(
        (mode) => plan.filter((m) => m === mode).length,
      );
      check(
        plan.length === total && Math.max(...counts) - Math.min(...counts) <= 1,
        "balanced round",
      );
    }
    for (const mode of ["add", "sub", "mul", "div"])
      check(
        app.createRoundModes(mode, total).every((m) => m === mode),
        "single mode",
      );
  }
} finally {
  Math.random = originalRandom;
}

const edges = [
  task("add", [50, 50], 100),
  task("add", [0, 0, 100], 100),
  task("sub", [100, 100], 0),
  task("sub", [100, 0], 100),
  task("mul", [2, 2], 4),
  task("mul", [10, 10], 100),
  task("div", [100, 10], 10),
  task("div", [2, 2], 1),
];
for (const q of edges) check(app.validateTask(q), "valid boundary");
for (const q of [
  null,
  {},
  task("add", [-1, 1], 0),
  task("add", [1.5, 2], 3.5),
  task("add", [101, 0], 101),
  task("add", [50, 51], 101),
  task("sub", [101, 2], 99),
  task("sub", [3, 5], -2),
  task("sub", [5, -1], 6),
  task("sub", [5, 1, 0], 4),
  task("mul", [1, 2], 2),
  task("mul", [2, 11], 22),
  task("mul", [0, 3], 0),
  task("div", [8, 0], Infinity),
  task("div", [9, 2], 4.5),
  task("div", [9, 2], 4),
  task("div", [101, 10], 10),
  task("div", [11, 1], 11),
  task("div", [22, 2], 11),
  task("div", [0, 2], 0),
  task("div", [12, 2.5], 4),
  task("div", [100, 10], 9),
  task("div", [100, 10, 1], 10),
  task("div", ["100", 10], 10),
])
  check(!app.validateTask(q), "reject invalid task");
for (const value of [-1, 101, NaN, Infinity, "10", 2.5])
  check(!app.validateAnswer(edges[0], value), "reject invalid input");
check(
  !app.validateAnswer(edges[6], 0) && !app.validateAnswer(edges[6], 11),
  "division input bounds",
);
check(
  app.buildSolution(task("div", [56, 7], 8)) === "56 ÷ 7 = 8, denn 7 × 8 = 56",
  "division inverse",
);
for (const q of edges)
  check(app.buildSolution(q).includes(" = " + q.answer), "worked solution");
for (const [easy, hard] of [
  [task("mul", [2, 2], 4), task("mul", [10, 10], 100)],
  [task("div", [2, 2], 1), task("div", [100, 10], 10)],
  [task("add", [2, 3], 5), task("add", [47, 36, 17], 100)],
  [task("sub", [5, 2], 3), task("sub", [100, 57], 43)],
]) {
  for (const avg of [0, 2000, 20000, 60000])
    check(
      app.computeTimeBudget(avg, 1, easy) < app.computeTimeBudget(avg, 1, hard),
      "harder actual task gets longer",
    );
  check(
    app.computeTimeBudget(0, 1, easy) === app.computeTimeBudget(0, 5, easy),
    "same task independent of level label",
  );
}
let learning = app.normalizeLearning();
check(
  Object.values(learning).every((r) => r.level === 1),
  "new child starts easy in every mode",
);
const untouched = JSON.stringify(learning.div);
for (let i = 0; i < 128; i++) {
  const before = learning.mul.level;
  learning.mul = app.updateLearning(learning.mul, true, 5000);
  check(learning.mul.level - before <= 0.125, "slow upward steps");
}
check(learning.mul.level === 5, "eventually reaches full curriculum");
check(
  JSON.stringify(learning.div) === untouched,
  "independent learning records",
);
check(
  JSON.stringify(
    app.normalizeLearning(JSON.parse(JSON.stringify(learning))),
  ) === JSON.stringify(learning),
  "learning reload roundtrip",
);
learning.mul = app.updateLearning(learning.mul, false, 0);
check(
  learning.mul.level === 4.875 && learning.mul.successes === 0,
  "mistake eases task gently",
);
for (let i = 0; i < 100; i++)
  learning.mul = app.updateLearning(learning.mul, false, 0);
check(learning.mul.level === 1, "lower bound");
check(
  app.normalizeLearning({ add: { level: NaN, avgMs: -100, successes: 500 } })
    .add.level === 1,
  "invalid learning recovery",
);
for (const lang of app.LANGUAGES)
  for (const key of ["m_div", "m_div_desc", "milestone", "division_because"])
    check(typeof app.I18N[lang.code][key] === "string", "new localized text");
console.log(
  checks +
    " learning, curriculum, timer and boundary checks passed (264,000 seeded tasks).",
);
