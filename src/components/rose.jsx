import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { C } from '../theme';

function petalShape() {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(0.32, 0.08, 0.38, 0.62, 0, 1);
  s.bezierCurveTo(-0.38, 0.62, -0.32, 0.08, 0, 0);
  return s;
}

const petalGeoCache = new THREE.ExtrudeGeometry(petalShape(), {
  depth: 0.03,
  bevelEnabled: true,
  bevelThickness: 0.012,
  bevelSize: 0.012,
  bevelSegments: 2,
  curveSegments: 8,
});

function buildRose(scale = 1, rings = 4, wilt = 0) {
  const group = new THREE.Group();
  const inner = new THREE.Color(C.roseLight);
  const outer = new THREE.Color(C.rose);
  const wiltedColor = new THREE.Color('#8A6A40');

  for (let r = 0; r < rings; r++) {
    const count = 4 + r * 2;
    const radius = (0.05 + r * 0.11) * scale;
    const petalScale = (0.34 + r * 0.13) * scale;
    const curl = (1.35 - r * 0.28) + wilt * 1.1;
    const baseColor = inner.clone().lerp(outer, r / (rings - 1 || 1));
    const color = baseColor.clone().lerp(wiltedColor, wilt * 0.75);
    const mat = new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.35 + wilt * 0.3,
      metalness: 0.05,
      clearcoat: 0.4 * (1 - wilt),
      clearcoatRoughness: 0.3,
      side: THREE.DoubleSide,
      // fresh petals glow softly so they read as vibrant; the glow
      // fades out completely as the flower wilts
      emissive: color,
      emissiveIntensity: 0.18 * (1 - wilt),
    });
    for (let i = 0; i < count; i++) {
      const petal = new THREE.Mesh(petalGeoCache, mat);
      const angle = (i / count) * Math.PI * 2 + r * 0.6;
      petal.position.set(Math.cos(angle) * radius, r * 0.045 * scale, Math.sin(angle) * radius);
      petal.rotation.y = -angle;
      petal.rotation.x = curl;
      petal.rotation.z = (Math.random() - 0.5) * 0.15;
      petal.scale.setScalar(petalScale * (1 - wilt * 0.2));
      group.add(petal);
    }
  }

  const budColor = outer.clone().lerp(new THREE.Color('#7A1F3D'), 0.4).lerp(wiltedColor, wilt * 0.6);
  const bud = new THREE.Mesh(
    new THREE.SphereGeometry(0.09 * scale, 10, 10),
    new THREE.MeshPhysicalMaterial({
      color: budColor,
      roughness: 0.4 + wilt * 0.3,
      clearcoat: 0.3 * (1 - wilt),
      emissive: budColor,
      emissiveIntensity: 0.12 * (1 - wilt),
    })
  );
  bud.position.y = 0.02 * scale;
  group.add(bud);
  return group;
}

function buildLeaves(scale = 1, wilt = 0) {
  const group = new THREE.Group();
  const fresh = new THREE.Color(C.green);
  const dried = new THREE.Color('#A68A52');
  const mat = new THREE.MeshStandardMaterial({
    color: fresh.clone().lerp(dried, wilt),
    roughness: 0.55 + wilt * 0.25,
    side: THREE.DoubleSide,
  });
  for (let i = 0; i < 2; i++) {
    const leaf = new THREE.Mesh(petalGeoCache, mat);
    const angle = i * Math.PI + 0.4;
    leaf.position.set(Math.cos(angle) * 0.12 * scale, -0.55 * scale, Math.sin(angle) * 0.12 * scale);
    leaf.rotation.y = -angle;
    leaf.rotation.x = 1.0 + wilt * 0.6;
    leaf.rotation.z = i ? 0.3 : -0.3;
    leaf.scale.set(0.5 * scale, 0.75 * scale * (1 - wilt * 0.15), 0.5 * scale);
    group.add(leaf);
  }
  return group;
}

export function MiniRose({ size = 38 }) {
  const mountRef = useRef(null);
  useEffect(() => {
    if (!mountRef.current) return;
    // Defensive cleanup: in dev, React 18 StrictMode runs this effect
    // twice on purpose (to help catch bugs), which can otherwise leave
    // two canvases stacked on top of each other. Clearing anything
    // already here first guarantees only one ever exists.
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 1.1, 3.0);
    camera.lookAt(0, 0.2, 0);
    scene.add(new THREE.AmbientLight(0xfff0dc, 1.4));
    const dl = new THREE.DirectionalLight(0xffd700, 2.6);
    dl.position.set(2, 3, 2);
    scene.add(dl);
    const pl = new THREE.PointLight(0xffc0cb, 1.8, 10);
    pl.position.set(-2, 1, -1);
    scene.add(pl);

    const rose = buildRose(2.6, 3);
    rose.rotation.x = 0.55;
    scene.add(rose);

    let raf, rot = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      rot += 0.014;
      rose.rotation.y = rot;
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      renderer.dispose();
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [size]);

  return <div ref={mountRef} style={{ width: size, height: size }} />;
}

export function Rose3D({ size = 220, percent = 0 }) {
  const mountRef = useRef(null);
  const stateRef = useRef({});

  const wilt = Math.max(0, Math.min(1, (percent - 50) / 50));

  useEffect(() => {
    if (!mountRef.current) return;
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const W = size, H = size;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.set(0, 1.3, 4.2);
    camera.lookAt(0, 0.1, 0);
    scene.add(new THREE.AmbientLight(0xfff0dc, 1.1));
    const dirLight = new THREE.DirectionalLight(0xffd700, 2.3);
    dirLight.position.set(3, 5, 3);
    scene.add(dirLight);
    const rimLight = new THREE.PointLight(0xffc0cb, 1.6, 20);
    rimLight.position.set(-3, 2, -2);
    scene.add(rimLight);

    const roseGroup = new THREE.Group();
    scene.add(roseGroup);
    roseGroup.add(buildRose(3.4, 4, wilt));
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x5c7a5a, roughness: 0.6 });
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 1.9, 8), stemMat);
    stem.position.y = -1.35;
    roseGroup.add(stem);
    roseGroup.add(buildLeaves(3.4, wilt));
    roseGroup.position.y = 0.35;
    // tilted further toward the camera so you see the petals' face and
    // profile, not a straight-down view of just the top
    const baseTiltX = 0.6 + wilt * 0.8;
    roseGroup.rotation.x = baseTiltX;

    const mouse = { x: 0, y: 0, down: false, lastX: 0, lastY: 0 };
    stateRef.current = { mouse, rotY: 0, rotX: 0, velY: 0, velX: 0, autoSpin: true };
    const s = stateRef.current;
    const el = mountRef.current;

    const onMove = (e) => {
      const cx = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const cy = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
      if (mouse.down) {
        const dx = cx - mouse.lastX;
        const dy = cy - mouse.lastY;
        s.velY += dx * 0.012;
        s.velX += dy * 0.008;
        s.autoSpin = false;
        mouse.lastX = cx;
        mouse.lastY = cy;
      }
    };
    const onDown = (e) => {
      mouse.down = true;
      mouse.lastX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      mouse.lastY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    };
    const onUp = () => {
      mouse.down = false;
      setTimeout(() => { s.autoSpin = true; }, 3000);
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mousedown', onDown);
    el.addEventListener('mouseup', onUp);
    el.addEventListener('touchmove', onMove, { passive: true });
    el.addEventListener('touchstart', onDown, { passive: true });
    el.addEventListener('touchend', onUp);

    let raf;
    const clock = new THREE.Clock();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      if (s.autoSpin) { s.velY += 0.006; s.velX *= 0.95; }
      s.velY *= 0.92;
      s.velX *= 0.92;
      s.rotY += s.velY;
      s.rotX += s.velX;
      s.rotX = Math.max(-0.7, Math.min(0.7, s.rotX));
      roseGroup.rotation.y = s.rotY;
      roseGroup.rotation.x = baseTiltX + s.rotX;
      roseGroup.position.y = 0.35 + Math.sin(t * 0.8) * 0.06 * (1 - wilt * 0.6);
      rimLight.intensity = 1.4 + Math.sin(t * 1.4) * 0.4;
      dirLight.intensity = 2.1 + Math.sin(t * 0.9 + 1) * 0.3;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mousedown', onDown);
      el.removeEventListener('mouseup', onUp);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchstart', onDown);
      el.removeEventListener('touchend', onUp);
      renderer.dispose();
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [size, wilt]);

  return (
    <div
      ref={mountRef}
      style={{ width: size, height: size, cursor: 'grab', borderRadius: '50%', overflow: 'hidden' }}
    />
  );
}