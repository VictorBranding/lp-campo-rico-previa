import * as THREE from "three";
const gsap_clamp = (v) => Math.min(1, Math.max(0, v));
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const fixo = document.querySelector(".cafe__fixo");
const canvasFrente = document.querySelector(".graos");
if (fixo && canvasFrente) {
  const canvasAtras = canvasFrente.cloneNode();
  canvasAtras.style.zIndex = "1";
  fixo.querySelector(".cafe__capsula").after(canvasAtras);

  const celular = window.innerWidth < 760;
  const estado = window.cafeEstado || { progresso: 0, velocidade: 0, calmo: false };

  function geometriaGrao() {
    const g = new THREE.SphereGeometry(1, 64, 40);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      if (z > 0) {
        z *= 0.42;
        const sulco = Math.exp(-(x * x) / 0.006) * Math.sqrt(Math.max(0, 1 - y * y * 0.95));
        z -= 0.2 * sulco;
        x *= 1 + 0.06 * Math.sin(y * 3.1);
      }
      p.setXYZ(i, x * 0.64, y, z * 0.62);
    }
    g.computeVertexNormals();
    return g;
  }
  const geo = geometriaGrao();
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0x3a1c0b, roughness: 0.5, metalness: 0.0, clearcoat: 0.45, clearcoatRoughness: 0.22,
  });

  function camada(canvas, n, zMin, zMax, evitaCentro) {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.28;
    const sol = new THREE.DirectionalLight(0xffc98f, 3.2); sol.position.set(-5, 7, 9); scene.add(sol);
    const recorte = new THREE.DirectionalLight(0xff9a4d, 2.0); recorte.position.set(6, -2, -4); scene.add(recorte);
    scene.add(new THREE.HemisphereLight(0xfff1dc, 0x0c3a06, 0.35));
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100); camera.position.set(0, 0, 24);

    const mesh = new THREE.InstancedMesh(geo, mat, n);
    scene.add(mesh);
    const dados = [];
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(), pos = new THREE.Vector3();
    let meiaL = 8, meiaA = 6;

    let semente = evitaCentro ? 7 : 3;
    const aleat = () => { semente = (semente * 9301 + 49297) % 233280; return semente / 233280; };
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2 + aleat() * 0.5;
      dados.push({
        ang, raio: (evitaCentro ? 1.05 : 0.8) + aleat() * 0.35,
        z: zMin + aleat() * (zMax - zMin),
        r: new THREE.Vector3(aleat() * 6, aleat() * 6, aleat() * 6),
        giro: new THREE.Vector3((aleat() - .5) * 5, (aleat() - .5) * 5, (aleat() - .5) * 3),
        sobe: 0.5 + aleat() * 1.1,
        fase: aleat() * 6.28,
        t: (evitaCentro ? 0.62 : 0.42) + aleat() * 0.16,
      });
    }

    function tamanho() {
      const w = fixo.clientWidth, h = fixo.clientHeight;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
      meiaA = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      meiaL = meiaA * camera.aspect;
    }
    tamanho(); window.addEventListener("resize", tamanho);

    return function quadro(dt, tempo) {
      const p = estado.progresso || 0;

      const local = p < 0.5 ? gsap_clamp(p / 0.25) : gsap_clamp((p - 0.67) / 0.33);

      const retrato = camera.aspect < 1;
      const rx = retrato ? meiaL * 0.62 : meiaL * 0.3, ry = retrato ? meiaA * 0.22 : meiaA * 0.66;
      const oy = retrato ? -meiaA * 0.13 : 0;
      for (let i = 0; i < n; i++) {
        const d = dados[i];
        const boia = estado.calmo ? 0 : Math.sin(tempo * 0.9 + d.fase) * 0.12;
        const x = Math.cos(d.ang) * rx * d.raio;
        const y = Math.sin(d.ang) * ry * d.raio + (0.5 - local) * meiaA * 0.06 * d.sobe + boia;

        const k = estado.graos ?? 1, ke = k * k * (3 - 2 * k);
        pos.set(x * ke, y * ke + oy - (1 - ke) * meiaA * 0.05, d.z * ke);
        q.setFromEuler(e.set(d.r.x + p * d.giro.x, d.r.y + p * d.giro.y, d.r.z + p * d.giro.z + boia));
        s.setScalar(d.t * (0.15 + 0.85 * ke));
        m.compose(pos, q, s); mesh.setMatrixAt(i, m);
      }
      mesh.instanceMatrix.needsUpdate = true;
      renderer.render(scene, camera);
    };
  }

  const atras = camada(canvasAtras, celular ? 8 : 12, -5, -1, false);
  const frente = camada(canvasFrente, celular ? 4 : 6, 3, 7, true);

  let visivel = false, ultimo = performance.now();
  new IntersectionObserver(([en]) => { visivel = en.isIntersecting; }, { threshold: 0 }).observe(fixo);
  function loop(t) {
    const dt = Math.min((t - ultimo) / 1000, 0.05); ultimo = t;
    const k = estado.graos ?? 1;
    const o = Math.min(1, Math.max(0, (estado.progresso - 0.02) / 0.06)) * Math.min(1, k * 6);
    canvasAtras.style.opacity = o; canvasFrente.style.opacity = o;
    if (visivel && o > 0.001) {
      atras(dt, t / 1000); frente(dt, t / 1000);
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
