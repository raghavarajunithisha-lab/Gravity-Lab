// Physics only: this module does not read or modify the web page.
// Gravity (g) is in m/s², using the rounded NASA reference values in README.md.
export const planets = [
  {
    name: "Mercury",
    g: 3.7,
    color: "#aaa6a0",
  },
  {
    name: "Venus",
    g: 8.9,
    color: "#e5bd7f",
  },
  {
    name: "Earth",
    g: 9.8,
    color: "#74c6ee",
  },
  {
    name: "Mars",
    g: 3.7,
    color: "#e69473",
  },
  {
    name: "Jupiter",
    g: 23.1,
    color: "#d8b494",
  },
  {
    name: "Saturn",
    g: 9,
    color: "#e4d19c",
  },
  {
    name: "Uranus",
    g: 8.7,
    color: "#8ad8d7",
  },
  {
    name: "Neptune",
    g: 11,
    color: "#809bed",
  },
  {
    name: "Moon",
    g: 1.6,
    color: "#d8dae2",
  },
];

// Convert real-world metres into on-screen pixels.
export const SCALE = 100; // pixels per metre
export const MAX_FORCE = 2; // newtons

// Convert mouse speed in pixels/second into a directional force in newtons.
// The same limit applies to every mass and every world.
export function mouseForce(horizontalSpeed, verticalSpeed) {
  // Relative mouse speed maps to a force, limited equally on every planet.
  const horizontalForce = horizontalSpeed * 0.004;
  const verticalForce = verticalSpeed * 0.004;
  const forceLimitScale = Math.min(
    1,
    MAX_FORCE / (Math.hypot(horizontalForce, verticalForce) || 1),
  );
  return {
    x: horizontalForce * forceLimitScale,
    y: verticalForce * forceLimitScale,
  };
}

/**
 * Advance the supplied cursor state in place by one time step.
 *
 * State: x/y are pixels; vx/vy are pixels per second.
 * Options: mass is kg; g is m/s²; fx/fy are newtons; width/height are pixels.
 * Bounce is the fraction of speed retained after hitting a boundary.
 * Positive vertical values point downward.
 *
 * Short public property names are preserved for compatibility with the app.
 * Destructuring below gives those properties descriptive local names.
 * Returns acceleration, resting support, and whether a collision occurred.
 */
export function step(
  cursorState,
  {
    mass: massInKilograms,
    g: gravityAcceleration,
    fx: horizontalForce = 0,
    fy: verticalForce = 0,
    width: playgroundWidth,
    height: floorHeight,
    bounce: bounceRestitution = 0.55,
  },
  elapsedSeconds,
) {
  // Newton’s second law: acceleration = force / mass.
  const horizontalAcceleration = horizontalForce / massInKilograms;
  const verticalAcceleration =
    gravityAcceleration + verticalForce / massInKilograms;

  // Constant-acceleration motion: distance = velocity × time + ½ × a × time².
  cursorState.x +=
    cursorState.vx * elapsedSeconds +
    0.5 * horizontalAcceleration * SCALE * elapsedSeconds * elapsedSeconds;
  cursorState.y +=
    cursorState.vy * elapsedSeconds +
    0.5 * verticalAcceleration * SCALE * elapsedSeconds * elapsedSeconds;
  cursorState.vx += horizontalAcceleration * SCALE * elapsedSeconds;
  cursorState.vy += verticalAcceleration * SCALE * elapsedSeconds;

  // Clamp to each boundary and reverse the incoming velocity with energy loss.
  let surfaceSupport = 0;
  let hasCollided = false;
  const cursorRadius = 14;
  if (cursorState.x < cursorRadius) {
    cursorState.x = cursorRadius;
    cursorState.vx = Math.abs(cursorState.vx) * bounceRestitution;
    hasCollided = true;
  }
  if (cursorState.x > playgroundWidth - cursorRadius) {
    cursorState.x = playgroundWidth - cursorRadius;
    cursorState.vx = -Math.abs(cursorState.vx) * bounceRestitution;
    hasCollided = true;
  }
  if (cursorState.y < cursorRadius) {
    cursorState.y = cursorRadius;
    cursorState.vy = Math.abs(cursorState.vy) * bounceRestitution;
    hasCollided = true;
  }
  if (cursorState.y >= floorHeight - cursorRadius) {
    cursorState.y = floorHeight - cursorRadius;
    cursorState.vy = -Math.abs(cursorState.vy) * bounceRestitution;
    hasCollided = true;
    // Stop tiny repeated bounces and let the floor support the cursor.
    if (Math.abs(cursorState.vy) < 18 && verticalAcceleration >= 0) {
      cursorState.vy = 0;
      surfaceSupport = Math.max(
        0,
        massInKilograms * gravityAcceleration + verticalForce,
      );
    }
    cursorState.vx *= Math.exp(-5 * elapsedSeconds); // floor friction only
  }
  return {
    ax: horizontalAcceleration,
    ay: verticalAcceleration - surfaceSupport / massInKilograms,
    normal: surfaceSupport,
    hit: hasCollided,
  };
}
