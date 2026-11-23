import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const est = window.cafeEstado || (window.cafeEstado = {});
const caixa = document.querySelector('.cafe__pacote');
const N = 49, ANG = THREE.MathUtils.degToRad(22);
const VEL_SOZINHO = 0.094;
const FIM_INTRO = 0.25;

function falhou(e) {
  if (e) console.warn('pacote 3D indisponível, usando as imagens', e);
  est.modo3D = 'falhou';
  if (typeof est.semTresD === 'function') est.semTresD();
}

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (e) { falhou(e); }

if (renderer && caixa) iniciar();

function iniciar() {
  const canvas = renderer.domElement;
  canvas.className = 'pacote__3d';
  canvas.setAttribute('aria-hidden', 'true');
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 0.95;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.45;

  const luz = (cor, int, x, y, z) => { const l = new THREE.DirectionalLight(cor, int); l.position.set(x, y, z); scene.add(l); };
  luz(0xfff7eb, 2.6, -2.6, 2.6, 3.0);
  luz(0xebf2ff, 0.8, 3.2, 1.6, 2.4);
  luz(0xffe6c7, 1.8, 1.2, 3.0, -2.8);
  scene.add(new THREE.HemisphereLight(0xf6e7c7, 0x14231a, 0.25));

  const camera = new THREE.PerspectiveCamera(THREE.MathUtils.radToDeg(2 * Math.atan(18 / 85)), 900 / 1200, 0.1, 50);
  camera.position.set(0, 1.15, 5.6);
  camera.rotation.x = THREE.MathUtils.degToRad(-4.5);
  camera.setViewOffset(900, 1200, 146, 166, 608, 857);

  const MEIO_Y = 0.75;
  const pacote = new THREE.Group();
  pacote.position.y = MEIO_Y;
  scene.add(pacote);

  let visivel = true, sujo = true, ultimo = NaN;
  new IntersectionObserver((ents) => { visivel = ents.some((e) => e.isIntersecting); sujo = true; })
    .observe(document.querySelector('.cafe') || caixa);

  function tamanho() {
    const w = caixa.clientWidth, h = caixa.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    sujo = true;
  }
  new ResizeObserver(tamanho).observe(caixa);

  let arrasto = 0, velArrasto = 0, inclina = 0, segurando = false, mouse = false;
  let xAnt = 0, yAnt = 0, x0 = 0, y0 = 0, t0 = 0, virar = 0, sozinho = 0, pausaAte = 0;
  canvas.addEventListener('pointerdown', (e) => {
    segurando = true; mouse = e.pointerType === 'mouse';
    if (mouse) e.preventDefault();
    xAnt = x0 = e.clientX; yAnt = y0 = e.clientY; t0 = performance.now(); velArrasto = 0;
    canvas.setPointerCapture(e.pointerId); canvas.classList.add('pegando');
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!segurando) return;
    const larg = Math.max(caixa.clientWidth, 1);
    const dx = (e.clientX - xAnt) / larg, dy = (e.clientY - yAnt) / larg;
    xAnt = e.clientX; yAnt = e.clientY;
    arrasto += dx * Math.PI * 1.4;
    velArrasto = dx * Math.PI * 1.4 * 60;
    if (mouse) inclina = THREE.MathUtils.clamp(inclina + dy * 1.2, -0.35, 0.35);
    sujo = true;
  });
  const solta = (e) => {
    if (!segurando) return;
    segurando = false; canvas.classList.remove('pegando'); pausaAte = performance.now() + 3000;

    if (e && Math.hypot(e.clientX - x0, e.clientY - y0) < 6 && performance.now() - t0 < 350) { virar += Math.PI; velArrasto = 0; }
  };
  canvas.addEventListener('pointerup', solta);
  canvas.addEventListener('pointercancel', solta);

  const draco = new DRACOLoader().setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/libs/draco/gltf/');
  new GLTFLoader().setDRACOLoader(draco).load('3d/pacote.glb', (gltf) => {
    gltf.scene.traverse((o) => {
      if (!o.isMesh) return;
      for (const m of [].concat(o.material)) {
        if (m.map) m.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
      }
    });
    gltf.scene.position.y = -MEIO_Y;
    pacote.add(gltf.scene);
    caixa.appendChild(canvas);
    tamanho();
    est.modo3D = 'ok';
    caixa.classList.add('pacote--3d');
    renderer.setAnimationLoop(quadro);
  }, undefined, falhou);

  const relogio = new THREE.Clock();
  function quadro() {
    const dt = Math.min(relogio.getDelta(), 0.05);
    if (!segurando && Math.abs(velArrasto) > 1e-3) {
      arrasto += velArrasto * dt;
      velArrasto *= Math.exp(-dt * 4);
    }
    if (Math.abs(virar) > 1e-4) {
      const passo = virar * (1 - Math.exp(-dt * 6));
      arrasto += passo; virar -= passo;
    }

    const naIntro = (est.progresso ?? 0) < FIM_INTRO;
    if (naIntro && !est.calmo && !segurando && performance.now() > pausaAte) sozinho += dt * VEL_SOZINHO;
    else if (!naIntro && sozinho !== 0) {
      const alvo = Math.round(sozinho / (2 * Math.PI)) * 2 * Math.PI;
      sozinho += (alvo - sozinho) * (1 - Math.exp(-dt * 3));
      if (Math.abs(alvo - sozinho) < 1e-3) sozinho = alvo;
    }
    const q = THREE.MathUtils.clamp(est.giroQ ?? 25, 1, N);
    const ang = -ANG + ((q - 1) / (N - 1)) * 2 * ANG + arrasto + sozinho;
    if (ang !== ultimo || pacote.rotation.x !== inclina) { sujo = true; ultimo = ang; }
    if (!visivel || !sujo) return;
    pacote.rotation.set(inclina, ang, 0);
    renderer.render(scene, camera);
    sujo = false;
  }
}
