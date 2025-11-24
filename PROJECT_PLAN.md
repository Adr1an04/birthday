# Project: Under the Stars - A Digital Memory

## 1. Vision & Concept
**Goal:** Create a deeply personal, cinematic, and interactive 3D web experience to recreate the memory of your first kiss.
**Vibe:** Romantic, nostalgic, serene, and magical.
**Setting:** An open grass field at night, a child's playground, under the moon and stars.

## 2. Tech Stack
- **Framework:** [Next.js](https://nextjs.org/) (React)
- **3D Engine:** [Three.js](https://threejs.org/) via [React Three Fiber (R3F)](https://docs.pmnd.rs/react-three-fiber)
- **3D Helpers:** [@react-three/drei](https://github.com/pmndrs/drei) (for cameras, controls, environment, shaders)
- **Post-Processing:** [@react-three/postprocessing](https://github.com/pmndrs/react-postprocessing) (Bloom, Vignette)
- **UI Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Styling:** Tailwind CSS
- **State Management:** Zustand (for managing scene transitions and audio)

## 3. Experience Flow (The User Journey)

### Scene 1: The Spark (Intro)
*   **Visuals:** A dark screen. A single, unlit candle sits in the center void.
*   **Interaction:** A subtle prompt appears: *"Light the way"* or simply a cursor change. The user clicks/taps the candle.
*   **Action:**
    *   A match strike sound plays.
    *   The candle ignites with a warm, flickering glow.
    *   **Audio:** Her favorite song begins to play, starting very quietly (muffled/low-pass filter) and slowly easing in.
    *   **Transition:** The camera slowly zooms into the flame until the screen is consumed by warm light, which then cools into the moonlight of the next scene.

### Scene 2: The Playground (Main Scene)
*   **Visuals:**
    *   **Sky:** A deep blue/black night sky filled with twinkling stars. A prominent, glowing moon casts light on the scene.
    *   **Ground:** Lush grass moving gently in the wind (using shaders or instanced meshes).
    *   **Centerpiece:** The playground equipment (e.g., a swing set) where you sat. It looks slightly worn but nostalgic.
    *   **Atmosphere:** Fireflies floating around, soft fog in the distance.
*   **Audio:** The song is now clear and immersive. Ambient night sounds (crickets, wind) layer underneath.
*   **Interaction:**
    *   **Navigation:** The user can gently rotate the camera (OrbitControls with restricted angles) to look around.
    *   **Story Points:** Glowing "stars" or orbs are floating near key objects (the swing, a patch of grass).
    *   **Clicking a Story Point:** The camera focuses on it, and text fades in on screen.
        *   *Example Text:* "This is where we sat..."
        *   *Example Text:* "The moon was watching us..."
        *   *Example Text:* "I knew in this moment..."

### Scene 3: The Message (Outro)
*   **Trigger:** After exploring the points, or after a set time.
*   **Visuals:** The camera pans up to the stars. The stars align or fade to form a final message or just a beautiful view of the cosmos.
*   **UI:** A final dedication note appears.

## 4. Technical Implementation Plan

### Step 1: Project Setup
- Initialize Next.js app.
- Install R3F ecosystem: `npm install three @types/three @react-three/fiber @react-three/drei framer-motion zustand`

### Step 2: The Candle Component
- **Geometry:** Simple CylinderGeometry for wax, a plane for the wick.
- **Flame:** A custom shader material or a simple sprite animation that flickers.
- **Light:** A `PointLight` inside the flame with fluctuating intensity to simulate flickering.

### Step 3: The Environment (Grass & Sky)
- **Sky:** Use `<Stars />` and `<Sky />` from Drei, or a custom HDRI night texture.
- **Grass:** This is crucial for the "field" vibe. Use a custom shader on `InstancedMesh` to create thousands of grass blades that wave in the wind without killing performance.
- **Moon:** A `Sphere` with a moon texture and an `EmissiveMaterial` to make it glow.

### Step 4: The Playground Model
- **Assets:** Find a free low-poly model of a swing set (Sketchfab/Poly Pizza) or build a simple one using Three.js primitives (Cylinders for poles, Box for seats).
- **Materials:** Wood and metal textures.

### Step 5: Post-Processing (The "Cinematic" Look)
- **Bloom:** Essential for the candle flame, the moon, and the stars to make them glow.
- **Vignette:** Darkens the corners to focus the eye.
- **Noise:** Adds a slight film grain for texture.

### Step 6: Audio Integration
- Use HTML5 Audio or a library like `howler.js`.
- Implement a "fade-in" effect that triggers on the candle click.

## 5. Asset Checklist
- [ ] **Audio:** The MP3 of her favorite song.
- [ ] **Textures:** Grass blade, Moon surface, Metal/Wood (for swings).
- [ ] **Font:** A nice serif or handwritten font for the romantic text.
