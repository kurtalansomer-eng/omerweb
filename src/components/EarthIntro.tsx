import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export type FpsLimit = 30 | 60 | 120;

interface EarthIntroProps {
  fpsLimit: FpsLimit;
  onChangeFps: (fps: FpsLimit) => void;
  onFadeStart: () => void;
  onComplete: () => void;
}

// ============================================================================
// Procedural Textures (Zero External 404s)
// ============================================================================
function createEarthTextures(maxAnisotropy: number) {
  const width = 1024;
  const height = 512;

  // 1. Earth Albedo Canvas
  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = width;
  albedoCanvas.height = height;
  const ctx = albedoCanvas.getContext('2d')!;

  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, '#0c2d48');
  oceanGrad.addColorStop(0.2, '#0b3b66');
  oceanGrad.addColorStop(0.5, '#0d4f8b');
  oceanGrad.addColorStop(0.8, '#0b3b66');
  oceanGrad.addColorStop(1, '#0c2d48');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
  for (let i = 0; i < 90; i++) {
    const cx = (i * 173) % width;
    const cy = 60 + ((i * 97) % (height - 120));
    const rx = 28 + (i % 5) * 18;
    const ry = 10 + (i % 4) * 8;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, (i % 6) * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  const drawLandmass = (points: Array<[number, number]>, baseColor: string, highlight: string) => {
    ctx.save();
    ctx.beginPath();
    points.forEach(([px, py], idx) => {
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.lineJoin = 'round';
    ctx.lineWidth = 10;
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.24)';
    ctx.stroke();

    const grad = ctx.createLinearGradient(0, 60, 0, height - 60);
    grad.addColorStop(0, highlight);
    grad.addColorStop(0.5, baseColor);
    grad.addColorStop(1, '#3b6e4c');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  };

  drawLandmass(
    [
      [115, 92], [175, 82], [240, 88], [285, 118], [272, 152],
      [252, 180], [225, 205], [238, 224], [218, 238], [195, 216],
      [172, 184], [146, 158], [108, 128],
    ],
    '#2f7a53',
    '#4a936a'
  );
  drawLandmass([[305, 58], [358, 52], [372, 78], [342, 108], [312, 92]], '#cbd5e1', '#e2e8f0');
  drawLandmass(
    [
      [250, 246], [288, 246], [332, 278], [348, 316], [322, 365],
      [292, 412], [272, 434], [262, 392], [254, 336], [244, 286],
    ],
    '#2e7d4f',
    '#4ca168'
  );
  drawLandmass(
    [
      [462, 102], [512, 86], [568, 92], [578, 126], [546, 152],
      [506, 158], [468, 150], [456, 128],
    ],
    '#3c8257',
    '#66a374'
  );
  drawLandmass(
    [
      [464, 174], [526, 172], [576, 198], [606, 238], [588, 294],
      [564, 356], [534, 386], [508, 352], [496, 298], [454, 250], [448, 206],
    ],
    '#6c8c4c',
    '#a39c58'
  );
  drawLandmass(
    [
      [576, 86], [685, 76], [798, 86], [878, 108], [866, 152],
      [818, 188], [792, 224], [744, 250], [704, 244], [662, 224],
      [626, 208], [582, 178], [568, 134],
    ],
    '#387c54',
    '#6c9c6b'
  );
  drawLandmass([[756, 258], [798, 266], [818, 286], [786, 294], [748, 280]], '#2d7a4d', '#469666');
  drawLandmass(
    [[794, 326], [858, 316], [898, 344], [892, 384], [848, 396], [804, 378], [788, 352]],
    '#8f7d47',
    '#b39154'
  );

  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(0, 0, width, 34);
  ctx.fillRect(0, height - 38, width, 38);

  const albedoMap = new THREE.CanvasTexture(albedoCanvas);
  albedoMap.colorSpace = THREE.SRGBColorSpace;
  albedoMap.anisotropy = maxAnisotropy;

  // 2. Cloud Layer Canvas
  const cloudCanvas = document.createElement('canvas');
  cloudCanvas.width = 512;
  cloudCanvas.height = 256;
  const cCtx = cloudCanvas.getContext('2d')!;
  cCtx.clearRect(0, 0, 512, 256);

  for (let i = 0; i < 110; i++) {
    const cx = (i * 131) % 512;
    const cy = 20 + ((i * 71) % 216);
    const rx = 18 + (i % 5) * 12;
    const ry = 6 + (i % 3) * 5;
    const grad = cCtx.createRadialGradient(cx, cy, 2, cx, cy, rx);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.42)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    cCtx.fillStyle = grad;
    cCtx.beginPath();
    cCtx.ellipse(cx, cy, rx, ry, (i % 4) * 0.25, 0, Math.PI * 2);
    cCtx.fill();
  }

  const cloudMap = new THREE.CanvasTexture(cloudCanvas);
  cloudMap.colorSpace = THREE.SRGBColorSpace;
  cloudMap.anisotropy = maxAnisotropy;

  // 3. Orbiting Text Band Canvas ("ÖĞRENCİ PENCERESİ")
  const textCanvas = document.createElement('canvas');
  textCanvas.width = 2048;
  textCanvas.height = 192;
  const tCtx = textCanvas.getContext('2d')!;
  tCtx.clearRect(0, 0, 2048, 192);

  // Subtle ribbon top/bottom hairlines
  tCtx.strokeStyle = 'rgba(125, 211, 252, 0.42)';
  tCtx.lineWidth = 3;
  tCtx.beginPath();
  tCtx.moveTo(0, 26);
  tCtx.lineTo(2048, 26);
  tCtx.moveTo(0, 166);
  tCtx.lineTo(2048, 166);
  tCtx.stroke();

  tCtx.font = '700 66px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif';
  tCtx.textAlign = 'left';
  tCtx.textBaseline = 'middle';
  tCtx.fillStyle = '#e0f2fe';
  tCtx.shadowColor = 'rgba(56, 189, 248, 0.65)';
  tCtx.shadowBlur = 14;

  const phrase = 'ÖĞRENCİ PENCERESİ   ·   WIPECODING   ·   ';
  const phraseWidth = tCtx.measureText(phrase).width;
  let cursorX = 0;
  while (cursorX < 2048 + phraseWidth) {
    tCtx.fillText(phrase, cursorX, 98);
    cursorX += phraseWidth;
  }

  const textMap = new THREE.CanvasTexture(textCanvas);
  textMap.colorSpace = THREE.SRGBColorSpace;
  textMap.wrapS = THREE.RepeatWrapping;
  textMap.wrapT = THREE.ClampToEdgeWrapping;
  textMap.anisotropy = maxAnisotropy;

  // 4. Soccer Ball Classic Pentagon Pattern Canvas
  const ballCanvas = document.createElement('canvas');
  ballCanvas.width = 512;
  ballCanvas.height = 256;
  const bCtx = ballCanvas.getContext('2d')!;
  bCtx.fillStyle = '#f8fafc';
  bCtx.fillRect(0, 0, 512, 256);

  // Panel seam lines
  bCtx.strokeStyle = '#94a3b8';
  bCtx.lineWidth = 3;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 6; col++) {
      const cx = col * 85 + (row % 2 === 0 ? 42 : 0);
      const cy = row * 64 + 32;
      bCtx.beginPath();
      for (let k = 0; k < 5; k++) {
        const angle = (k * Math.PI * 2) / 5 - Math.PI / 2;
        const px = cx + Math.cos(angle) * 20;
        const py = cy + Math.sin(angle) * 20;
        if (k === 0) bCtx.moveTo(px, py);
        else bCtx.lineTo(px, py);
      }
      bCtx.closePath();
      bCtx.fillStyle = '#0f172a';
      bCtx.fill();
      bCtx.stroke();
    }
  }

  const ballMap = new THREE.CanvasTexture(ballCanvas);
  ballMap.colorSpace = THREE.SRGBColorSpace;
  ballMap.anisotropy = maxAnisotropy;

  return { albedoMap, cloudMap, textMap, ballMap };
}

// ============================================================================
// Multi-Part 3D Articulated Soccer Player on Top of Earth
// ============================================================================
function buildSoccerPlayer() {
  const playerRoot = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xf1c29b, roughness: 0.65, metalness: 0.02 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8, metalness: 0.05 });
  const jerseyMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.48, metalness: 0.08 });
  const shortsMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.52, metalness: 0.04 });
  const sockMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.55, metalness: 0.04 });
  const bootMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.25 });

  // Upper body pivot (allows natural lean during kick)
  const torsoPivot = new THREE.Group();
  torsoPivot.position.set(0, 0.22, 0);
  playerRoot.add(torsoPivot);

  // Shorts / Pelvis
  const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.08, 0.085), shortsMat);
  pelvis.position.set(0, 0.02, 0);
  torsoPivot.add(pelvis);

  // Torso Jersey
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.145, 0.16, 0.09), jerseyMat);
  torso.position.set(0, 0.14, 0);
  torsoPivot.add(torso);

  // Head + Hair Cap
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.055, 20, 16), skinMat);
  head.position.set(0, 0.275, 0);
  torsoPivot.add(head);

  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.057, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.58),
    hairMat
  );
  hair.position.set(0, 0.282, -0.005);
  torsoPivot.add(hair);

  // Left & Right Arms
  const armGeo = new THREE.CapsuleGeometry(0.022, 0.11, 6, 12);
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.095, 0.2, 0);
  const leftArm = new THREE.Mesh(armGeo, jerseyMat);
  leftArm.position.set(0, -0.06, 0);
  leftArmPivot.add(leftArm);
  leftArmPivot.rotation.z = 0.28;
  torsoPivot.add(leftArmPivot);

  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.095, 0.2, 0);
  const rightArm = new THREE.Mesh(armGeo, jerseyMat);
  rightArm.position.set(0, -0.06, 0);
  rightArmPivot.add(rightArm);
  rightArmPivot.rotation.z = -0.28;
  torsoPivot.add(rightArmPivot);

  // Standing Left Leg + Boot (grounded at y = 0)
  const legGeo = new THREE.CapsuleGeometry(0.026, 0.13, 6, 12);
  const bootGeo = new THREE.BoxGeometry(0.052, 0.036, 0.092);

  const leftLegPivot = new THREE.Group();
  leftLegPivot.position.set(-0.04, 0.21, 0);
  const leftLeg = new THREE.Mesh(legGeo, sockMat);
  leftLeg.position.set(0, -0.1, 0);
  leftLegPivot.add(leftLeg);
  const leftBoot = new THREE.Mesh(bootGeo, bootMat);
  leftBoot.position.set(0, -0.192, 0.018);
  leftLegPivot.add(leftBoot);
  playerRoot.add(leftLegPivot);

  // Articulated Right Kicking Leg + Boot
  const rightLegPivot = new THREE.Group();
  rightLegPivot.position.set(0.042, 0.21, 0);
  const rightLeg = new THREE.Mesh(legGeo, sockMat);
  rightLeg.position.set(0, -0.1, 0);
  rightLegPivot.add(rightLeg);
  const rightBoot = new THREE.Mesh(bootGeo, bootMat);
  rightBoot.position.set(0, -0.192, 0.018);
  rightLegPivot.add(rightBoot);
  playerRoot.add(rightLegPivot);

  return {
    playerRoot,
    torsoPivot,
    leftArmPivot,
    rightArmPivot,
    rightLegPivot,
    materials: [skinMat, hairMat, jerseyMat, shortsMat, sockMat, bootMat],
    geometries: [
      pelvis.geometry,
      torso.geometry,
      head.geometry,
      hair.geometry,
      armGeo,
      legGeo,
      bootGeo,
    ],
  };
}

export const EarthIntro: React.FC<EarthIntroProps> = ({
  fpsLimit,
  onChangeFps,
  onFadeStart,
  onComplete,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const onFadeStartRef = useRef(onFadeStart);
  const onCompleteRef = useRef(onComplete);
  const fpsLimitRef = useRef<FpsLimit>(fpsLimit);
  onFadeStartRef.current = onFadeStart;
  onCompleteRef.current = onComplete;
  fpsLimitRef.current = fpsLimit;

  const [overlayOpacity, setOverlayOpacity] = useState(1);
  const skippedRef = useRef(false);

  const handleSkip = () => {
    if (skippedRef.current) return;
    skippedRef.current = true;
    onFadeStartRef.current();
    setOverlayOpacity(0);
    window.setTimeout(() => {
      onCompleteRef.current();
    }, 550);
  };

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      onFadeStartRef.current();
      const t = window.setTimeout(() => {
        setOverlayOpacity(0);
        onCompleteRef.current();
      }, 250);
      return () => window.clearTimeout(t);
    }

    const container = mountRef.current;
    if (!container) {
      onFadeStartRef.current();
      onCompleteRef.current();
      return;
    }

    const isSoftwareGl = (() => {
      try {
        const probe = document.createElement('canvas');
        const gl = probe.getContext('webgl2') || probe.getContext('webgl');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      onFadeStartRef.current();
      onCompleteRef.current();
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 120);
    camera.position.set(0, 0.25, 4.6);
    camera.lookAt(0, 0.05, 0);

    // 3-Point Warm/Cool Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x0f172a, 0.95);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e4, 2.5);
    sunLight.position.set(4.5, 3.2, 4.0);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.15);
    rimLight.position.set(-4.0, -1.5, -3.2);
    scene.add(rimLight);

    // ========================================================================
    // Sparkling Starfield Background (ShaderMaterial Points)
    // ========================================================================
    const starCount = 460;
    const starPositions = new Float32Array(starCount * 3);
    const starPhases = new Float32Array(starCount);
    const starSizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      const r = 10 + Math.random() * 18;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = -Math.abs(r * Math.cos(phi)) - 2.0; // mostly behind earth
      starPhases[i] = Math.random() * Math.PI * 2;
      starSizes[i] = 10 + Math.random() * 20;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('aPhase', new THREE.BufferAttribute(starPhases, 1));
    starGeo.setAttribute('aSize', new THREE.BufferAttribute(starSizes, 1));

    const starMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 1 },
      },
      vertexShader: `
        attribute float aPhase;
        attribute float aSize;
        varying float vTwinkle;
        uniform float uTime;
        void main() {
          vTwinkle = 0.45 + 0.55 * sin(uTime * 3.4 + aPhase);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * (12.0 / -mvPosition.z) * (0.7 + 0.4 * vTwinkle);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vTwinkle;
        uniform float uOpacity;
        void main() {
          vec2 c = gl_PointCoord - vec2(0.5);
          float d = length(c);
          if (d > 0.5) discard;
          float glow = pow(1.0 - d * 2.0, 2.2);
          gl_FragColor = vec4(0.85, 0.94, 1.0, glow * vTwinkle * uOpacity);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const starsPoints = new THREE.Points(starGeo, starMat);
    scene.add(starsPoints);

    // ========================================================================
    // Composite Earth Group + Orbiting "Öğrenci Penceresi" Text + Soccer Player
    // ========================================================================
    const earthGroup = new THREE.Group();
    earthGroup.position.set(0, -0.18, 0);
    scene.add(earthGroup);

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const { albedoMap, cloudMap, textMap, ballMap } = createEarthTextures(maxAnisotropy);

    // 1. Earth Core Sphere
    const earthGeo = new THREE.SphereGeometry(1.0, 56, 40);
    const earthMat = new THREE.MeshStandardMaterial({
      map: albedoMap,
      roughness: 0.62,
      metalness: 0.08,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // 2. Cloud Sphere
    const cloudGeo = new THREE.SphereGeometry(1.022, 48, 32);
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudMap,
      transparent: true,
      opacity: 0.82,
      roughness: 0.92,
      metalness: 0.0,
      depthWrite: false,
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    earthGroup.add(cloudMesh);

    // 3. Atmospheric Rim Glow
    const atmoGeo = new THREE.SphereGeometry(1.095, 48, 32);
    const atmoMat = new THREE.ShaderMaterial({
      uniforms: {
        uOpacity: { value: 1.0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vViewDir = normalize(-mvPos.xyz);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        uniform float uOpacity;
        void main() {
          float fresnel = pow(0.66 - dot(vNormal, vViewDir), 3.0);
          float alpha = clamp(fresnel, 0.0, 1.0) * 0.72 * uOpacity;
          gl_FragColor = vec4(0.28, 0.68, 1.0, alpha);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    earthGroup.add(atmoMesh);

    // 4. Metallic Orbital Ring
    const ringGeo = new THREE.TorusGeometry(1.24, 0.007, 12, 96);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      metalness: 0.88,
      roughness: 0.18,
      transparent: true,
      opacity: 0.7,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.25;
    ringMesh.rotation.y = 0.22;
    earthGroup.add(ringMesh);

    // 5. Orbiting "ÖĞRENCİ PENCERESİ" Text Cylinder Ribbon around Earth
    const textBandGeo = new THREE.CylinderGeometry(1.38, 1.38, 0.22, 96, 1, true);
    const textBandMat = new THREE.MeshBasicMaterial({
      map: textMap,
      transparent: true,
      opacity: 0.96,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const textBandMesh = new THREE.Mesh(textBandGeo, textBandMat);
    textBandMesh.rotation.z = 0.16;
    textBandMesh.rotation.x = 0.14;
    earthGroup.add(textBandMesh);

    // 6. Articulated Soccer Player Standing on Top of Earth (y = 0.995)
    const player = buildSoccerPlayer();
    player.playerRoot.position.set(-0.04, 0.995, 0.05);
    earthGroup.add(player.playerRoot);

    // 7. Soccer Ball initially in front of the player on Earth's surface, then launched to camera!
    const ballGeo = new THREE.SphereGeometry(0.11, 28, 20);
    const ballMat = new THREE.MeshStandardMaterial({
      map: ballMap,
      roughness: 0.38,
      metalness: 0.06,
      transparent: true,
      opacity: 1,
    });
    const ballMesh = new THREE.Mesh(ballGeo, ballMat);
    ballMesh.position.set(0.02, 1.105, 0.24);
    earthGroup.add(ballMesh);

    // ========================================================================
    // Smooth Mouse Pointer Parallax Tracking (Zero GC Vectors)
    // ========================================================================
    let pointerNormX = 0;
    let pointerNormY = 0;
    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointerNormX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNormY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // ========================================================================
    // Timeline & FPS-Regulated Render Loop
    // ========================================================================
    // 0.0s -> 1.8s: Spin + Mouse interaction + Player winds up leg
    // 1.8s -> 2.1s: Player kicks ball
    // 2.02s -> 3.6s: Ball detaches into scene & flies toward camera growing larger
    // 3.3s -> 4.35s: Earth + Ball expand and fade out together -> site fades in
    const WINDUP_END = 1.8;
    const KICK_STRIKE_AT = 2.02;
    const EXPAND_START = 3.25;
    const EXPAND_DURATION = 1.05;

    let elapsed = 0;
    let lastTickTime = performance.now();
    let lastDrawTime = performance.now();
    let ballDetached = false;
    let fadeTriggered = false;
    let completed = false;
    let frameId = 0;

    const ballStartWorldPos = new THREE.Vector3();
    const ballTargetCamPos = new THREE.Vector3(0, 0.22, 4.05);

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    }

    const stepAndRender = (now: number) => {
      if (completed || skippedRef.current) return;

      // FPS Frame Interval Regulation (30 / 60 / 120 FPS)
      const targetInterval = 1000 / fpsLimitRef.current;
      if (!isSoftwareGl && now - lastDrawTime < targetInterval * 0.92) {
        frameId = requestAnimationFrame(stepAndRender);
        return;
      }

      const rawDt = (now - lastTickTime) / 1000;
      lastTickTime = now;
      lastDrawTime = now;
      const delta = Math.min(Math.max(rawDt, 0.001), 0.08);
      elapsed += delta;

      // 1. Update sparkling stars shader clock
      starMat.uniforms.uTime.value = elapsed;
      starsPoints.rotation.y += delta * 0.03;

      // 2. Spin Earth, clouds, and orbiting "Öğrenci Penceresi" text
      earthMesh.rotation.y += delta * 0.55;
      cloudMesh.rotation.y += delta * 0.72;
      ringMesh.rotation.z += delta * 0.25;
      textBandMesh.rotation.y -= delta * 0.62;

      // 3. Smoothly follow mouse cursor direction
      const targetRotY = pointerNormX * 0.65;
      const targetRotX = pointerNormY * 0.35;
      earthGroup.rotation.y = THREE.MathUtils.damp(earthGroup.rotation.y, targetRotY, 5.5, delta);
      earthGroup.rotation.x = THREE.MathUtils.damp(earthGroup.rotation.x, targetRotX, 5.5, delta);

      // 4. Articulated Footballer Kick Choreography
      if (elapsed < WINDUP_END) {
        const w = Math.min(1, elapsed / WINDUP_END);
        const smoothW = w * w * (3 - 2 * w);
        player.rightLegPivot.rotation.x = smoothW * 0.9; // Pull right leg back
        player.torsoPivot.rotation.x = -smoothW * 0.16;
        player.leftArmPivot.rotation.x = -smoothW * 0.35;
        player.rightArmPivot.rotation.x = smoothW * 0.45;
      } else if (elapsed < KICK_STRIKE_AT + 0.35) {
        const k = Math.min(1, (elapsed - WINDUP_END) / 0.32);
        const swing = k * k * (3 - 2 * k);
        player.rightLegPivot.rotation.x = 0.9 - swing * 1.95; // Whip leg forward (-1.05 rad)
        player.torsoPivot.rotation.x = -0.16 + swing * 0.34;
        player.leftArmPivot.rotation.x = -0.35 + swing * 0.8;
        player.rightArmPivot.rotation.x = 0.45 - swing * 0.85;
      }

      // 5. Detach & Launch Ball toward Camera right at impact
      if (elapsed >= KICK_STRIKE_AT) {
        if (!ballDetached) {
          ballDetached = true;
          ballMesh.getWorldPosition(ballStartWorldPos);
          earthGroup.remove(ballMesh);
          ballMesh.position.copy(ballStartWorldPos);
          scene.add(ballMesh);
        }

        const flightDuration = EXPAND_START + EXPAND_DURATION - KICK_STRIKE_AT;
        const flightT = Math.min(1, (elapsed - KICK_STRIKE_AT) / flightDuration);
        // Smooth acceleration + subtle parabolic arc toward the viewer
        const easeFlight = 1 - Math.pow(1 - flightT, 2.2);
        ballMesh.position.lerpVectors(ballStartWorldPos, ballTargetCamPos, easeFlight);
        ballMesh.position.y += Math.sin(flightT * Math.PI) * 0.42;

        // Spin & grow ball dramatically as it flies toward screen
        ballMesh.rotation.x -= delta * 11.0;
        ballMesh.rotation.y += delta * 6.5;
        const ballScale = 1 + easeFlight * 2.5;
        ballMesh.scale.setScalar(ballScale);
      }

      // 6. Scale Up & Fade Out Earth + Ball Together, Fade In Site
      if (elapsed >= EXPAND_START) {
        if (!fadeTriggered) {
          fadeTriggered = true;
          onFadeStartRef.current();
          setOverlayOpacity(0);
        }

        const t = Math.min(1, (elapsed - EXPAND_START) / EXPAND_DURATION);
        const eased = t * t * (3 - 2 * t);

        earthGroup.scale.setScalar(1 + eased * 1.85);

        const fade = Math.max(0, 1 - eased);
        earthMat.transparent = true;
        earthMat.opacity = fade;
        cloudMat.opacity = 0.82 * fade;
        ringMat.opacity = 0.7 * fade;
        textBandMat.opacity = 0.96 * fade;
        ballMat.opacity = fade;
        atmoMat.uniforms.uOpacity.value = fade;
        starMat.uniforms.uOpacity.value = fade;

        for (const m of player.materials) {
          m.transparent = true;
          m.opacity = fade;
        }

        if (t >= 1) {
          completed = true;
          onCompleteRef.current();
          return;
        }
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(() => stepAndRender(performance.now()));
      } else {
        frameId = requestAnimationFrame(stepAndRender);
      }
    };

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }
    frameId = requestAnimationFrame(stepAndRender);

    return () => {
      completed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);

      starGeo.dispose();
      starMat.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      cloudGeo.dispose();
      cloudMat.dispose();
      atmoGeo.dispose();
      atmoMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      textBandGeo.dispose();
      textBandMat.dispose();
      ballGeo.dispose();
      ballMat.dispose();

      for (const g of player.geometries) g.dispose();
      for (const m of player.materials) m.dispose();

      albedoMap.dispose();
      cloudMap.dispose();
      textMap.dispose();
      ballMap.dispose();
      envTexture.dispose();

      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      aria-label="3D Dünya Küresi ve Futbolcu Açılış Sahnesi"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#040914] transition-opacity duration-700 ease-out"
      style={{
        opacity: overlayOpacity,
        pointerEvents: overlayOpacity === 0 ? 'none' : 'auto',
      }}
    >
      <div ref={mountRef} className="w-full h-full" />

      {/* Clean Bottom Control Dock (FPS Regulation + Skip) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-wrap items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-slate-700/80 bg-slate-900/90 text-slate-200 max-w-[94vw]">
        <span className="text-xs text-slate-300 whitespace-nowrap">
          Fare ile dünyayı döndür
        </span>

        <span aria-hidden="true" className="text-slate-600 hidden sm:inline">·</span>

        <div className="flex items-center gap-1" role="group" aria-label="Animasyon FPS Ayarı">
          <span className="text-xs text-slate-400 mr-1 whitespace-nowrap">FPS:</span>
          {([30, 60, 120] as FpsLimit[]).map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => onChangeFps(val)}
              className={`px-2 py-1 rounded-md font-mono text-xs tabular-nums transition-colors cursor-pointer whitespace-nowrap ${
                fpsLimit === val
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {val}
            </button>
          ))}
        </div>

        <span aria-hidden="true" className="text-slate-600">·</span>

        <button
          type="button"
          onClick={handleSkip}
          className="px-3 py-1 rounded-md border border-slate-600 bg-slate-800 text-xs font-medium text-white hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap"
        >
          Geç
        </button>
      </div>
    </div>
  );
};
