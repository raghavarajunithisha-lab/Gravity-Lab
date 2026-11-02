// Run these checks with npm test. No browser or third-party library is needed.

import { test } from "node:test";
import assert from "node:assert/strict";
import { step, mouseForce, planets } from "./physics.js";

// Use a large playground so the free-fall checks do not hit a boundary.
const simulateOneSecond = (
  massInKilograms,
  gravityAcceleration,
  verticalForce = 0,
) => {
  const cursorState = {
    x: 500,
    y: 100,
    vx: 0,
    vy: 0,
  };
  for (let stepIndex = 0; stepIndex < 240; stepIndex++) {
    step(
      cursorState,
      {
        mass: massInKilograms,
        g: gravityAcceleration,
        fy: verticalForce,
        width: 10000,
        height: 10000,
      },
      1 / 240,
    );
  }
  return cursorState;
};
test("free fall agrees with analytical distance and is independent of mass", () => {
  for (const planet of planets) {
    const lightCursor = simulateOneSecond(0.05, planet.g);
    const heavyCursor = simulateOneSecond(0.25, planet.g);
    assert.ok(Math.abs(lightCursor.y - (100 + 50 * planet.g)) < 1e-8);
    assert.equal(lightCursor.y, heavyCursor.y);
  }
});
test("planet gravity changes speed and force can balance weight", () => {
  assert.ok(simulateOneSecond(0.05, 23.1).vy > simulateOneSecond(0.05, 1.6).vy);
  assert.ok(Math.abs(simulateOneSecond(0.05, 9.8, -0.49).vy) < 1e-9);
  assert.ok(simulateOneSecond(0.05, 9.8, -1).vy < 0);
  assert.ok(simulateOneSecond(0.25, 9.8, -1).vy > 0);
});
test("mouse force is directional and capped at 2 N", () => {
  assert.equal(mouseForce(0, -500).y, -2);
  assert.ok(Math.hypot(...Object.values(mouseForce(9999, 9999))) <= 2 + 1e-12);
});
test("floor bounces then settles and supplies support", () => {
  const cursorState = {
    x: 50,
    y: 86,
    vx: 0,
    vy: 100,
  };
  const simulationOptions = {
    mass: 0.05,
    g: 9.8,
    width: 100,
    height: 100,
    bounce: 0.55,
  };
  step(cursorState, simulationOptions, 1 / 240);
  assert.ok(cursorState.vy < 0);
  let physicsResult;
  for (let stepIndex = 0; stepIndex < 2400; stepIndex++) {
    physicsResult = step(cursorState, simulationOptions, 1 / 240);
  }
  assert.equal(cursorState.y, 86);
  assert.equal(cursorState.vy, 0);
  assert.ok(Math.abs(physicsResult.normal - 0.49) < 1e-12);
});
test("walls and ceiling contain fast cursor", () => {
  const cursorState = {
    x: -10,
    y: -10,
    vx: -200,
    vy: -200,
  };
  step(
    cursorState,
    {
      mass: 0.05,
      g: 9.8,
      width: 100,
      height: 100,
    },
    1 / 240,
  );
  assert.equal(cursorState.x, 14);
  assert.equal(cursorState.y, 14);
  assert.ok(cursorState.vx > 0 && cursorState.vy > 0);
});
