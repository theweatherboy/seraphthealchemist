# Implementation Plan: Blended Website Design

This plan describes the integration of three mockup options into a single immersive experience using Next.js, Tailwind CSS, Framer Motion, and React Three Fiber (R3F).

## 1. Requirements Analysis

### Visuals from Option 1: Angels, Dragons & Structured Layout
- **Angels & Dragons**: Integrate a prominent Angel 3D model/representation alongside the existing Dragon.
- **Structured Layout**: Replace the current centered hero layout with a more structured "page elements" approach (e.g., a grid or multi-section overlay) as per Image 2.

### Visuals from Option 2: Colored Threads Wheel/Tapestry
- **3D Component**: A 3D "Wheel" or "Tapestry" consisting of colored threads.
- **Implementation**: Evolve the current `CelestialWheel` into a `ColoredThreadsWheel` that uses `Line` components to create a woven, threaded appearance connecting celestial symbols.

### Visuals from Option 3: The Journey
- **3D Component**: A sequence of colored gradient spheres (orbs) connected by a path with labels (Ground, Protect, Heal, etc.).
- **Implementation**: Create a `Journey` component using `CatmullRomCurve3` for the path and `Text` from `@react-three/drei` for labels.

### Functional Requirement: Navigation Popup
- **UI Component**: An initial onboarding popup explaining site usage.
- **Features**: Close 'X' button, Framer Motion animations, backdrop blur.

---

## 2. Technical Design

### 3D Components (R3F)
- **`ColoredThreadsWheel`**:
    - Base it on the existing `CelestialWheel` ring structure.
    - Use `Line` or `Tube` from `@react-three/drei` to draw "threads" between symbols across different rings.
    - Use colors from the Alchemical Palette (`--color-seraphic-gold`, `--color-dragon-emerald`, etc.).
- **`Journey`**:
    - Define a set of waypoints: `[{ label: 'Ground', pos: [x,y,z], color: '...' }, ...]`.
    - Use `THREE.CatmullRomCurve3` to generate a smooth path through these points.
    - Render the path as a thin glowing line.
    - Render spheres at each waypoint with `MeshStandardMaterial` and high `emissive` properties to create a "glow" effect.
- **`Angel`**:
    - Implement a simplified Angel representation (or load a GLTF model) positioned to complement the Dragon.

### UI Components (React/Tailwind/Framer Motion)
- **`NavigationPopup`**:
    - Use `AnimatePresence` for a smooth fade-in/out.
    - Use a `fixed` overlay with `backdrop-blur-md` and a centered content card.
    - Tailwind classes for the 'X' button in the top right corner.
- **Structured Layout**:
    - Modify `page.tsx` to move away from simple centering.
    - Implement "elements" like a side-navigation, floating info panels, or a structured grid that complements the 3D scene.

---

## 3. Implementation Steps

### Step 1: 3D Component Development
1. **Create `src/components/canvas/Journey.tsx`**:
    - Implement the orb path and labels.
2. **Create `src/components/canvas/ColoredThreadsWheel.tsx`**:
    - Implement the threaded wheel structure.
3. **Create `src/components/canvas/Angel.tsx`**:
    - Implement the Angel representation.

### Step 2: UI Component Development
1. **Create `src/components/ui/NavigationPopup.tsx`**:
    - Implement the onboarding modal with a close button.
2. **Update `src/app/page.tsx`**:
    - Integrate `NavigationPopup`.
    - Restructure the UI overlay to match "Option 1 structured elements".

### Step 3: Integration & Polish
1. **Update `src/components/canvas/Scene.tsx`**:
    - Adjust lighting (e.g., adding a `PointLight` near the Journey or Angel) and camera settings to accommodate all 3D elements.
2. **Update `src/app/page.tsx`**:
    - Add `<Angel />`, `<ColoredThreadsWheel />`, and `<Journey />` inside the `<Scene>` component.
3. **Fine-tune Animations**:
    - Use `useFrame` in 3D components for subtle floating/rotating motions.
    - Ensure `framer-motion` transitions are consistent across the UI.

---

## 4. Critical Files for Implementation

- `src/app/page.tsx` (Integration & Layout)
- `src/components/canvas/Scene.tsx` (Environment & lighting)
- `src/components/canvas/ColoredThreadsWheel.tsx` (New 3D Component)
- `src/components/canvas/Journey.tsx` (New 3D Component)
- `src/components/ui/NavigationPopup.tsx` (New UI Component)
EOF`
