// Browser controls, force arrows, live readings, and the animation loop.
// The numerical physics lives in physics.js. Positive y points downward.

import { planets, SCALE, mouseForce, step } from "./physics.js";
const getElement = (id) => document.getElementById(id);
const playground = getElement("arena");

// Simulation settings. Mass is stored in kilograms, although the slider shows grams.
let selectedPlanet = planets[2];
let massInKilograms = 0.05;
let bounceRestitution = 0.55;
let isPaused = false;
let isPointerInside = false;
let previousFrameTime = 0;
let remainingPhysicsTime = 0;

// Mouse movement is measured in pixels; applied force is measured in newtons.
let mouseMovement = {
  x: 0,
  y: 0,
};
let appliedForce = {
  x: 0,
  y: 0,
};
let pressedKeys = new Set();
let latestPhysicsResult = {
  normal: 0,
  ay: 9.8,
};

// Position (x, y) is in pixels. Velocity (vx, vy) is in pixels per second.
let cursorState = {
  x: 100,
  y: 70,
  vx: 0,
  vy: 0,
};

// The bottom 30 pixels are the decorative floor strip, outside the physics area.
const getPlaygroundWidth = () => playground.clientWidth;
const getFloorHeight = () => playground.clientHeight - 30;

// Start a fresh drop without changing the selected world, mass, or pause setting.
function resetDrop() {
  cursorState = {
    x: getPlaygroundWidth() / 2,
    y: 65,
    vx: 0,
    vy: 0,
  };
  mouseMovement = {
    x: 0,
    y: 0,
  };
  appliedForce = {
    x: 0,
    y: 0,
  };
  pressedKeys.clear();
  latestPhysicsResult = {
    normal: 0,
    ay: selectedPlanet.g,
  };
  updateDisplay();
}

// Create one selection button for each planet and the Moon.
for (const planetOption of planets) {
  const button = document.createElement("button");
  button.className = "planet";
  button.style.setProperty("--color", planetOption.color);
  button.innerHTML = `<i aria-hidden="true"></i>${planetOption.name}`;
  button.setAttribute("aria-pressed", String(planetOption === selectedPlanet));
  button.onclick = () => {
    selectedPlanet = planetOption;
    document.documentElement.style.setProperty("--planet", planetOption.color);
    getElement("g").textContent = planetOption.g.toFixed(1);
    getElement("world-label").textContent = planetOption.name.toUpperCase();
    for (const planetButton of getElement("planets").children) {
      planetButton.setAttribute(
        "aria-pressed",
        String(planetButton === button),
      );
    }
    updateDisplay();
  };
  getElement("planets").append(button);
}

// Convert the sliders into the units used by the physics calculation.
getElement("mass").oninput = (event) => {
  massInKilograms = Number(event.target.value) / 1000;
  getElement("mass-label").textContent = `${event.target.value} g`;
  updateDisplay();
};
getElement("bounce").oninput = (event) => {
  bounceRestitution = Number(event.target.value) / 100;
  getElement("bounce-label").textContent = `${event.target.value}%`;
};

function togglePause() {
  isPaused = !isPaused;
  if (isPaused) {
    getElement("pause").textContent = "Resume";
  } else {
    getElement("pause").textContent = "Pause";
  }
  mouseMovement = {
    x: 0,
    y: 0,
  };
  appliedForce = {
    x: 0,
    y: 0,
  };
  pressedKeys.clear();
  updateDisplay();
}
getElement("pause").onclick = togglePause;
getElement("reset").onclick = resetDrop;

// Collect pointer movement between animation frames. Leaving the area clears input.
playground.addEventListener("pointerenter", () => {
  isPointerInside = true;
});
playground.addEventListener("pointerleave", () => {
  isPointerInside = false;
  mouseMovement = {
    x: 0,
    y: 0,
  };
});
let previousPointerPosition = null;
playground.addEventListener("pointerdown", (event) => {
  playground.focus();
  previousPointerPosition = {
    x: event.clientX,
    y: event.clientY,
  };
});
playground.addEventListener("pointermove", (event) => {
  if (isPaused) {
    return;
  }
  if (previousPointerPosition) {
    mouseMovement.x += event.clientX - previousPointerPosition.x;
    mouseMovement.y += event.clientY - previousPointerPosition.y;
  }
  previousPointerPosition = {
    x: event.clientX,
    y: event.clientY,
  };
});
playground.addEventListener("pointerenter", (event) => {
  previousPointerPosition = {
    x: event.clientX,
    y: event.clientY,
  };
});
playground.addEventListener("pointerleave", () => {
  previousPointerPosition = null;
});

// Keyboard controls are active while the playground has focus.
playground.addEventListener("keydown", (event) => {
  if (
    ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)
  ) {
    event.preventDefault();
  }
  if (event.key === " " && !event.repeat) {
    togglePause();
  }
  if (event.key.toLowerCase() === "r") {
    resetDrop();
  }
  if (event.key.startsWith("Arrow")) {
    pressedKeys.add(event.key);
  }
});
playground.addEventListener("keyup", (event) => pressedKeys.delete(event.key));
playground.addEventListener("blur", () => pressedKeys.clear());
window.addEventListener("blur", () => {
  pressedKeys.clear();
  mouseMovement = {
    x: 0,
    y: 0,
  };
  appliedForce = {
    x: 0,
    y: 0,
  };
  previousPointerPosition = null;
});

// Discard stale timing and input when the browser tab changes visibility.
document.addEventListener("visibilitychange", () => {
  previousFrameTime = 0;
  remainingPhysicsTime = 0;
  mouseMovement = {
    x: 0,
    y: 0,
  };
  appliedForce = {
    x: 0,
    y: 0,
  };
  pressedKeys.clear();
});

// Keep the cursor within the playground after a browser resize.
new ResizeObserver(() => {
  cursorState.x = Math.min(
    Math.max(14, cursorState.x),
    getPlaygroundWidth() - 14,
  );
  cursorState.y = Math.min(Math.max(14, cursorState.y), getFloorHeight() - 14);
}).observe(playground);

// Draw a force vector, shifting it inward if it would extend beyond an edge.
function drawForceArrow(id, x, y, horizontalLength, verticalLength) {
  const arrowElement = getElement(id);
  const padding = 12;
  const rightBoundary = getPlaygroundWidth() - padding;
  const bottomBoundary = getFloorHeight() - padding;

  // Keep the arrowhead clear of the floor and walls. Shift the whole arrow
  // inward at an edge so its direction and length remain readable.
  const arrowScale = Math.min(
    1,
    Math.max(0, rightBoundary - padding) / (Math.abs(horizontalLength) || 1),
    Math.max(0, bottomBoundary - padding) / (Math.abs(verticalLength) || 1),
  );
  horizontalLength *= arrowScale;
  verticalLength *= arrowScale;
  x = Math.max(
    padding - Math.min(0, horizontalLength),
    Math.min(rightBoundary - Math.max(0, horizontalLength), x),
  );
  y = Math.max(
    padding - Math.min(0, verticalLength),
    Math.min(bottomBoundary - Math.max(0, verticalLength), y),
  );
  arrowElement.setAttribute("x1", x);
  arrowElement.setAttribute("y1", y);
  arrowElement.setAttribute("x2", x + horizontalLength);
  arrowElement.setAttribute("y2", y + verticalLength);
  if (Math.hypot(horizontalLength, verticalLength) > 1) {
    arrowElement.style.opacity = "0.85";
  } else {
    arrowElement.style.opacity = "0";
  }
}

// Refresh the cursor, numeric feedback, status text, and both force arrows.
function updateDisplay() {
  getElement("cursor").style.transform =
    `translate(${cursorState.x - 10}px,${cursorState.y - 10}px)`;
  const weightInNewtons = massInKilograms * selectedPlanet.g;
  // A stationary cursor on the floor receives support against downward force.
  const surfaceSupportInNewtons =
    cursorState.y >= getFloorHeight() - 14.1 && cursorState.vy === 0
      ? Math.max(0, weightInNewtons + appliedForce.y)
      : 0;
  getElement("weight").textContent = weightInNewtons.toFixed(3) + " N";
  getElement("lift").textContent =
    Math.max(0, -appliedForce.y).toFixed(3) + " N";
  getElement("net").textContent =
    (weightInNewtons + appliedForce.y - surfaceSupportInNewtons).toFixed(3) +
    " N";
  getElement("support").textContent = surfaceSupportInNewtons.toFixed(3) + " N";
  getElement("velocity").textContent =
    (cursorState.vy / SCALE).toFixed(2) + " m/s";
  getElement("lift-meter").style.width =
    Math.min(100, (Math.max(0, -appliedForce.y) / weightInNewtons) * 100) + "%";
  if (weightInNewtons > 2) {
    getElement("effort").textContent =
      "Weight exceeds the 2 N input limit. Reduce mass to lift.";
  } else if (-appliedForce.y > weightInNewtons) {
    getElement("effort").textContent =
      "Lift exceeds weight. Accelerating upward.";
  } else if (surfaceSupportInNewtons > 0) {
    getElement("effort").textContent =
      "Resting on the surface. Move upward to lift.";
  } else {
    getElement("effort").textContent = "Move upward to overcome the weight.";
  }
  if (isPaused) {
    getElement("status").textContent = "Paused";
  } else if (surfaceSupportInNewtons > 0) {
    getElement("status").textContent = "On the surface";
  } else if (Math.abs(cursorState.vy) < 1) {
    getElement("status").textContent = "Ready to drop";
  } else if (cursorState.vy > 0) {
    getElement("status").textContent = "Falling ↓";
  } else {
    getElement("status").textContent = "Rising ↑";
  }
  drawForceArrow(
    "gravity-vector",
    cursorState.x + 18,
    cursorState.y,
    0,
    weightInNewtons * 65,
  );
  drawForceArrow(
    "input-vector",
    cursorState.x - 10,
    cursorState.y,
    appliedForce.x * 65,
    appliedForce.y * 65,
  );
}

// Browser frames may arrive at different rates. Physics advances in fixed
// 1/240-second steps so motion does not depend on the display refresh rate.
function animateFrame(currentFrameTime) {
  // Cap a delayed frame at 50 milliseconds rather than jumping far ahead.
  const elapsedSeconds = previousFrameTime
    ? Math.min((currentFrameTime - previousFrameTime) / 1000, 0.05)
    : 0;
  previousFrameTime = currentFrameTime;
  if (!isPaused && elapsedSeconds > 0) {
    let targetForce = isPointerInside
      ? mouseForce(
          mouseMovement.x / elapsedSeconds,
          mouseMovement.y / elapsedSeconds,
        )
      : {
          x: 0,
          y: 0,
        };
    mouseMovement = {
      x: 0,
      y: 0,
    };
    // Arrow keys substitute a mouse speed of 500 pixels/second per axis.
    if (pressedKeys.size) {
      targetForce = mouseForce(
        (Number(pressedKeys.has("ArrowRight")) -
          Number(pressedKeys.has("ArrowLeft"))) *
          500,
        (Number(pressedKeys.has("ArrowDown")) -
          Number(pressedKeys.has("ArrowUp"))) *
          500,
      );
    }
    // A short decay makes mouse event sampling continuous while stopping promptly.
    const smoothingAmount = 1 - Math.exp(-elapsedSeconds / 0.045);
    appliedForce.x += (targetForce.x - appliedForce.x) * smoothingAmount;
    appliedForce.y += (targetForce.y - appliedForce.y) * smoothingAmount;
    remainingPhysicsTime += elapsedSeconds;
    while (remainingPhysicsTime >= 1 / 240) {
      latestPhysicsResult = step(
        cursorState,
        {
          mass: massInKilograms,
          g: selectedPlanet.g,
          fx: appliedForce.x,
          fy: appliedForce.y,
          width: getPlaygroundWidth(),
          height: getFloorHeight(),
          bounce: bounceRestitution,
        },
        1 / 240,
      );
      remainingPhysicsTime -= 1 / 240;
    }
  } else {
    mouseMovement = {
      x: 0,
      y: 0,
    };
  }
  updateDisplay();
  requestAnimationFrame(animateFrame);
}

// Initialize the display and begin the continuous animation.
resetDrop();
requestAnimationFrame(animateFrame);
