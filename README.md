# Gravity Lab — understand your cursor's weight

Gravity Lab is a website that lets you move a simulated cursor under the gravity of eight planets and the Moon. Change its mass, try to lift it, and watch the forces change.

**The app uses grams, not kilograms. Its highest mass setting is 250 g = 0.25 kg.** The calculations below explain that setting first. A separate example explains what 250 kg would mean.

## 1. Start the app

You need Node.js 18 or newer installed on Windows.

Open PowerShell and enter:

```powershell
cd D:\project\cursor-gravity
npm start
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

- No `npm install` is needed. The app uses built-in browser and Node.js features.
- Keep the terminal open while using the website.
- Press **Ctrl+C** in the terminal to stop the server.
- If port 5173 is already in use, choose another port:

```powershell
$env:PORT=5174
npm start
```

Then open [http://localhost:5174](http://localhost:5174).

## 2. Try the controls

1. Choose a planet or the Moon.
2. Choose a cursor mass. The default is **50 g**; the range is **10–250 g**.
3. Move your mouse inside the playground. Moving upward applies upward force. Moving downward applies downward force.
4. Stop moving to let gravity take over. There is a brief smoothing delay before input force fades away.
5. Use **Reset drop** to start another drop, or **Pause** to freeze the simulation.

For a sustained lift, click inside the playground and **hold the Up arrow key**. This requests the maximum upward force. Left, Right, and Down apply force in their respective directions. Space pauses or resumes; R resets the drop.

The bounce slider controls how much speed remains after a collision: **0%** removes the speed normal to the surface; **55%**, the default, keeps 55% of it. It is a speed percentage, not an energy percentage. The maximum setting is 90%.

## 3. Mass, gravity, and weight mean different things

| Term | Meaning | Unit | Example |
| --- | --- | --- | --- |
| Mass | How much matter the cursor represents | Kilograms (kg) or grams (g) | 250 g = 0.25 kg |
| Gravity | How quickly an unsupported object accelerates downward | Metres per second squared (m/s²) | Earth uses 9.8 m/s² |
| Weight | The downward force caused by gravity | Newtons (N) | A 250 g mass weighs 2.45 N on Earth |
| Lift | The upward force supplied by your input | Newtons (N) | The app allows at most 2 N |

Your cursor's **mass stays the same** when you change worlds. Its **weight changes** because gravity changes.

The rule is:

```text
Weight = mass × gravity

Use kilograms in this formula:
mass in kilograms = mass in grams ÷ 1000
```

## 4. Why you cannot lift 250 g on Earth

The app limits your total input force to **2 N**. This is a design choice in the controls, not a limit on human strength.

Calculate the cursor's weight:

```text
Mass = 250 ÷ 1000 = 0.25 kg
Earth gravity = 9.8 m/s²

Weight = 0.25 × 9.8
       = 2.45 N downward

Maximum lift = 2.00 N upward
Shortfall = 2.45 − 2.00 = 0.45 N
```

**Gravity pulls harder than your maximum lift. The cursor cannot lift off from rest.** Moving your mouse faster cannot bypass the 2 N cap.

If that cursor were already in the air, its acceleration at maximum upward input would be:

```text
Downward acceleration = (weight − lift) ÷ mass
                      = (2.45 − 2.00) ÷ 0.25
                      = 1.8 m/s² downward
```

On the floor, it does not accelerate through the floor. The surface supplies the remaining **0.45 N** of upward support. Net vertical force is then zero, and it stays at rest.

## 5. Can you lift 250 g on each world?

These calculations use the gravity values actually stored in `physics.js`. They describe lifting **from rest**, with input directed entirely upward.

```text
Weight of a 250 g cursor = 0.25 × gravity

Lift > weight: it can start accelerating upward.
Lift = weight: forces balance; this alone does not start upward motion.
Lift < weight: it cannot lift off from rest.
```

| World | Gravity (m/s²) | Weight of 250 g (N) | Maximum lift (N) | Can lift from rest? |
| --- | ---: | ---: | ---: | --- |
| Mercury | 3.7 | 0.925 | 2.000 | Yes |
| Venus | 8.9 | 2.225 | 2.000 | No — short by 0.225 N |
| Earth | 9.8 | 2.450 | 2.000 | No — short by 0.450 N |
| Mars | 3.7 | 0.925 | 2.000 | Yes |
| Jupiter | 23.1 | 5.775 | 2.000 | No — short by 3.775 N |
| Saturn | 9.0 | 2.250 | 2.000 | No — short by 0.250 N |
| Uranus | 8.7 | 2.175 | 2.000 | No — short by 0.175 N |
| Neptune | 11.0 | 2.750 | 2.000 | No — short by 0.750 N |
| Moon | 1.6 | 0.400 | 2.000 | Yes |

At 250 g, **six of the eight planets are impossible to lift on with the current force limit**. Mercury, Mars, and the Moon allow it.

For comparison, maximum upward input on the Moon gives:

```text
Upward acceleration = (lift − weight) ÷ mass
                    = (2.00 − 0.40) ÷ 0.25
                    = 6.4 m/s² upward
```

### How much mass can 2 N balance?

Rearrange the weight formula:

```text
Balance mass in kg = maximum lift ÷ gravity
Balance mass in g  = (2 ÷ gravity) × 1000

Earth example: (2 ÷ 9.8) × 1000 ≈ 204.1 g
```

| World | Mass that 2 N can balance, approximately |
| --- | ---: |
| Mercury | 540.5 g |
| Venus | 224.7 g |
| Earth | 204.1 g |
| Mars | 540.5 g |
| Jupiter | 86.6 g |
| Saturn | 222.2 g |
| Uranus | 229.9 g |
| Neptune | 181.8 g |
| Moon | 1250.0 g |

These are rounded theoretical balance points, not extra slider settings. **To accelerate upward from rest, the mass must be below the exact balance point.** At the balance point, maximum lift only cancels gravity.

## 6. Why 110 g may rise only a little

On Earth:

```text
Mass = 110 ÷ 1000 = 0.11 kg
Weight = 0.11 × 9.8 = 1.078 N
```

You must apply more than **1.078 N upward** to start lifting from rest. If you apply only **1.10 N**, the extra force is very small:

```text
Extra upward force = 1.10 − 1.078 = 0.022 N
Upward acceleration = 0.022 ÷ 0.11 = 0.20 m/s²
```

Starting at rest, holding that exact force for half a second would produce:

```text
Height gained = ½ × acceleration × time²
              = 0.5 × 0.20 × 0.5²
              = 0.025 m
              = 2.5 pixels at the app's scale of 100 pixels per metre
```

That is a small rise. This example assumes constant applied force, after smoothing, with no collision.

But 110 g is **not limited to a small height**. At the full 2 N upward force:

```text
Upward acceleration = (2.00 − 1.078) ÷ 0.11
                    ≈ 8.38 m/s²
```

Hold the Up arrow to see a sustained lift. With mouse input, a short upward stroke supplies force only briefly. Stopping removes it, and moving downward to reposition your mouse applies downward force. A rising cursor can keep moving up briefly due to momentum before gravity reverses it.

## 7. How mouse movement becomes force

Before smoothing and the force cap, the app uses:

```text
Requested force = mouse speed × 0.004

Pure upward movement examples:
100 pixels/second → 0.4 N upward
250 pixels/second → 1.0 N upward
500 pixels/second → 2.0 N upward
Faster movement  → still limited to 2.0 N
```

The 2 N limit applies to the **combined horizontal and vertical force**. A diagonal push shares the available force between both directions, so its upward part is less than 2 N.

The applied force responds smoothly over about 45 milliseconds rather than changing instantly. Holding Up requests 2 N upward, and the applied force approaches it through this smoothing.

## 8. What if you really mean 250 kilograms?

**250 kg is 1000 times the app's maximum mass of 250 g.** It is outside the slider's range.

On Earth, a hypothetical 250 kg object would weigh:

```text
Weight = 250 × 9.8 = 2450 N
Available lift in this app = 2 N
Shortfall = 2450 − 2 = 2448 N
```

You would need **more than 2450 N** of upward force to accelerate it upward from rest on Earth. Even on the Moon, it would weigh `250 × 1.6 = 400 N`, far beyond the app's 2 N limit.

So a hypothetical 250 kg cursor could not lift from rest on **any** of the nine worlds with these controls. This is an explanation only; the app has not been changed to allow 250 kg.

## 9. Read the live feedback

| Reading or visual | What it tells you |
| --- | --- |
| Weight | The downward gravitational force: mass × gravity. |
| Your lift | The upward part of your currently applied input force. Downward input shows zero lift. |
| Lift bar | Lift compared with weight. A full bar means lift has reached or exceeded weight; it does not guarantee upward motion. |
| Net vertical force | Downward weight plus vertical input, minus resting surface support. Positive means downward; negative means upward. Collision impulses are not included. |
| Vertical velocity | Positive means falling; negative means rising; zero means no vertical motion. |
| Surface support | The upward force the floor supplies when the cursor rests on it. |
| Orange arrow | Downward gravitational force. It still exists while the cursor rests on the floor. |
| Green arrow | Applied input force, including horizontal or downward input. |

Near an edge, force arrows shift inward to remain visible. They are indicators; their shifted position does not change the force or cursor movement.

## 10. What this simulation does and does not represent

- It moves a custom cursor **inside the playground**, not your Windows pointer.
- Your mouse cannot physically resist your hand. The feeling of effort comes from the speed and duration of your input.
- Free-fall acceleration does not depend on mass. A heavier cursor has more weight, but also more inertia; these cancel for gravity alone.
- The 2 N input cap, mouse sensitivity, and screen scale are interaction choices, not properties of real planets.
- Gravity is constant and points downward. There is no air resistance, orbital motion, or change of gravity with altitude.
- Walls and a flat floor provide collisions. Floor friction slows horizontal motion, and very small bounces settle to rest.
- Giant planets have a fictional solid floor. Their listed gravity is a reference value, not the gravity at a walkable ground surface.
- The planet background is decorative and not to scale.
- Physics advances in 1/240-second steps. A delayed frame contributes at most 50 milliseconds; returning to a hidden tab does not replay all elapsed time.

The rounded gravity values match the [NASA NSSDCA metric planetary fact sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/) used for this project. Other references may use different conventions or precision, particularly for giant planets. The tables above deliberately use this app's existing numbers.

## 11. Find your way around the code

| File | Purpose |
| --- | --- |
| `index.html` | Page structure: playground, controls, and feedback labels. |
| `style.css` | Colors, spacing, decorative planet, and layouts for different screen sizes. |
| `physics.js` | Planet values, force limits, movement calculations, and collisions. |
| `app.js` | Mouse and keyboard input, animation timing, arrows, and displayed measurements. |
| `server.mjs` | Local web server, started with `npm start`. |
| `physics.test.js` | Automated checks for the physics. |
| `package.json` | Project information and the start/test commands. |

Start with `physics.js` to understand the calculations. Then read `app.js` to see how input and the display connect to them.

In the cursor state, `x` and `y` are positions in pixels. `vx` and `vy` are velocities in pixels per second. Positive `y` points downward. Mass is stored in kilograms and force in newtons.

Each animation frame follows this sequence:

```text
Read input → calculate force → advance physics → update the display → repeat
```

## 12. Run the physics checks

From the project folder:

```powershell
npm test
```

The checks cover free fall on all nine worlds, mass-independent falling, balancing gravity, lifting different masses, the 2 N force cap, bounce, settling, and boundary collisions.
