(function () {
  const calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.cafeEstado = { progresso: 0, velocidade: 0, calmo, graos: calmo ? 1 : 0 };
  const barra = document.querySelector(".barra");

  const botaoMenu = document.querySelector(".barra__menu-botao");
  const menu = document.getElementById("menu");
  let lenis = null;
  let fechando = null;
  function abreMenu(abrir) {
    const anima = window.gsap && !calmo;
    botaoMenu.setAttribute("aria-expanded", abrir);
    botaoMenu.setAttribute("aria-label", abrir ? "Fechar menu" : "Abrir menu");
    botaoMenu.querySelector(".rotulo-menu").textContent = abrir ? "Fechar" : "Menu";
    document.body.classList.toggle("menu-aberto", abrir);
    if (lenis) { if (abrir) lenis.stop(); else lenis.start(); }
    if (abrir) {
      if (fechando) { fechando.kill(); fechando = null; }
      menu.hidden = false;
      if (!anima) return;
      gsap.fromTo(menu, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "power3.inOut" });
      gsap.fromTo(".menu__links li", { y: 50, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.06, duration: 0.6, ease: "power3.out", delay: 0.25 });
      gsap.fromTo(".menu__fotos .forma", { yPercent: 30, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, stagger: 0.08, duration: 0.8, ease: "power3.out", delay: 0.3 });
      gsap.fromTo([".menu__fechar", ".menu__rodape"], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, delay: 0.45 });
    } else {
      if (!anima || menu.hidden) { menu.hidden = true; return; }

      fechando = gsap.timeline({ onComplete: () => { menu.hidden = true; fechando = null; } })
        .to(".menu__links li", { y: -30, autoAlpha: 0, stagger: 0.04, duration: 0.3, ease: "power2.in" }, 0)
        .to(".menu__fotos .forma", { yPercent: -20, autoAlpha: 0, stagger: 0.05, duration: 0.35, ease: "power2.in" }, 0)
        .to([".menu__fechar", ".menu__rodape"], { autoAlpha: 0, duration: 0.2 }, 0)
        .to(menu, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.6, ease: "power3.inOut" }, 0.2);
    }
  }
  botaoMenu.addEventListener("click", () => abreMenu(menu.hidden));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) { abreMenu(false); botaoMenu.focus(); } });
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => abreMenu(false)));
  menu.querySelector(".menu__fechar").addEventListener("click", () => { abreMenu(false); botaoMenu.focus(); });
  menu.addEventListener("click", (e) => { if (e.target === menu) abreMenu(false); });

  document.querySelectorAll(".seletor__op").forEach((b) => {
    b.addEventListener("click", () => {
      document.querySelectorAll(".seletor__op").forEach((o) => { o.classList.toggle("ativo", o === b); o.setAttribute("aria-pressed", o === b); });
      const moido = b.dataset.formato === "moido";
      document.querySelectorAll(".cartao .formato").forEach((f) => (f.textContent = moido ? "moído para coado" : "em grãos"));
      document.querySelectorAll(".cartao a.botao").forEach((a) => {
        a.href = a.href.replace(/%20(em%20gr%C3%A3os|mo%C3%ADdo)$/, moido ? "%20mo%C3%ADdo" : "%20em%20gr%C3%A3os");
      });
    });
  });

  if (calmo || !window.gsap) { barra.classList.add("barra--nome"); return; }
  gsap.registerPlugin(ScrollTrigger);

  (function () {
    const logo = document.querySelector(".logo-anim");
    if (!logo) return;
    const SOL = "452.5 476.5";
    const tl = gsap.timeline({ delay: 0.15 });
    tl.from(".logo-simbolo", { autoAlpha: 0, scale: 0.9, svgOrigin: SOL, duration: 1.6, ease: "expo.out" }, 0)
      .fromTo(".m-moldura", { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.8, ease: "power2.inOut" }, 0)
      .from(".m-sol", { attr: { r: 0 }, duration: 1.6, ease: "expo.out" }, 0.35)
      .from(".m-terra", { attr: { y: 930 }, duration: 1.6, ease: "power3.out" }, 0.55)
      .from(".logo-raios", { rotation: -70, autoAlpha: 0, svgOrigin: SOL, duration: 2.4, ease: "expo.out" }, 0.6)
      .from(".logo-texto path", { y: 26, autoAlpha: 0, duration: 1.1, ease: "power3.out", stagger: 0.02 }, 0.9)
      .from([".topo h1", ".topo__linha", ".topo .botoes"], { y: 24, autoAlpha: 0, duration: 1.1, ease: "power3.out", stagger: 0.14 }, 1.25);

    tl.add(() => gsap.to(".logo-raios", { rotation: "+=360", svgOrigin: SOL, duration: 80, ease: "none", repeat: -1 }), 2.4);
  })();

  lenis = new Lenis({ lerp: 0.09 });
  lenis.on("scroll", (e) => { ScrollTrigger.update(); window.cafeEstado.velocidade = e.velocity; });
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (ev) => {
    const alvo = document.querySelector(a.getAttribute("href"));
    if (alvo) { ev.preventDefault(); lenis.scrollTo(alvo, { duration: 1.4 }); }
  }));

  document.querySelectorAll(".letras").forEach((el) => {
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    el.querySelectorAll(".linha").forEach((linha) => {
      const txt = linha.textContent; linha.textContent = ""; linha.setAttribute("aria-hidden", "true");
      for (const ch of txt) { const s = document.createElement("span"); s.className = "letra"; s.textContent = ch === " " ? " " : ch; linha.appendChild(s); }
    });
  });

  const vh = () => window.innerHeight, vw = () => window.innerWidth;
  const celular = () => vw() < 760;

  const loops = [];
  document.querySelectorAll(".coluna").forEach((c, i) => {
    const trilho = c.querySelector(".trilho");
    trilho.innerHTML += trilho.innerHTML;
    const sobe = c.dataset.sentido === "sobe";
    const eixo = celular() ? "xPercent" : "yPercent";
    loops.push(gsap.fromTo(trilho, { [eixo]: sobe ? 0 : -50 }, { [eixo]: sobe ? -50 : 0, duration: 46 + i * 7, ease: "none", repeat: -1 }));
  });
  gsap.ticker.add(() => {
    const extra = Math.min(Math.abs(window.cafeEstado.velocidade || 0) * 0.12, 8);
    loops.forEach((l) => l.timeScale(gsap.utils.interpolate(l.timeScale(), 1 + extra, 0.08)));
  });

  new Set([...document.querySelectorAll(".colunas .foto img")].map((i) => i.src.replace("-800.webp", "-1800.webp"))).forEach((s) => { const im = new Image(); im.src = s; });

  gsap.utils.toArray(".colunas .foto img").forEach((img, i) => {
    gsap.to(img, { scale: 1.24, duration: 7 + (i % 4), ease: "sine.inOut", yoyo: true, repeat: -1, delay: i * 0.4 });
  });

  const topo = gsap.timeline({ scrollTrigger: { trigger: ".topo", start: "top top", end: "bottom bottom", scrub: 0.6, invalidateOnRefresh: true } });
  document.querySelectorAll(".coluna").forEach((c) => topo.to(c, { [celular() ? "xPercent" : "yPercent"]: parseFloat(c.dataset.vel) * (celular() ? 25 : 40), ease: "none", duration: 0.38 }, 0));
  topo.to(".topo__texto", { autoAlpha: 0, y: -60, duration: 0.18, ease: "power1.in" }, 0.3);

  topo.to(".colunas", { autoAlpha: 0, duration: 0.08 }, 0.66)
      .fromTo(".abertura__texto", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.12 }, 0.8);
  const abertura = document.querySelector(".abertura"), aBase = abertura.querySelector(".abertura__base"), aImg = abertura.querySelector(".abertura__cafe");
  let origem = null, escondida = null;
  const cobre = (x, y, w, h, ar) => {
    let iw = w, ih = w / ar; if (ih < h) { ih = h; iw = h * ar; }
    return { x: x + (w - iw) / 2, y: y + (h - ih) / 2, w: iw, h: ih };
  };
  const mistura = (a, b, t) => a + (b - a) * t;
  ScrollTrigger.create({
    trigger: ".topo", start: "top top", end: "bottom bottom",
    onUpdate: (st) => {
      const p = st.progress;
      if (p < 0.38) {
        if (origem) { origem = null; loops.forEach((l) => l.resume()); if (escondida) escondida.style.visibility = ""; }
        gsap.set(abertura, { autoAlpha: 0 }); return;
      }

      if (!origem) {
        loops.forEach((l) => l.pause());
        const cx = vw() * (celular() ? 0.5 : 0.7), cy = vh() * (celular() ? 0.74 : 0.5), folga = 16;
        let melhor = null, nota = Infinity;
        document.querySelectorAll(".colunas .foto").forEach((f) => {
          const r = f.getBoundingClientRect();
          if (r.top < folga || r.bottom > vh() - folga || r.left < 0 || r.right > vw()) return;
          const cafe = /lavoura-cafe-por-do-sol/.test(f.querySelector("img").src);
          const d = Math.hypot(r.left + r.width / 2 - cx, r.top + r.height / 2 - cy) + (cafe ? 0 : vw() * 0.35);
          if (d < nota) { nota = d; melhor = f; }
        });
        if (!melhor) {
          let vis = 0;
          document.querySelectorAll(".colunas .foto").forEach((f) => {
            const r = f.getBoundingClientRect(); const v = Math.max(0, Math.min(r.bottom, vh()) - Math.max(r.top, 0));
            if (v > vis) { vis = v; melhor = f; }
          });
        }
        if (!melhor) melhor = document.querySelector('.colunas .foto img[src*="lavoura-cafe-por-do-sol"]').parentNode;
        let r = melhor.getBoundingClientRect();
        if (!r.width) r = { left: vw() * 0.6, top: vh() * 0.3, right: vw() * 0.75, bottom: vh() * 0.7, width: vw() * 0.15 };
        const y0 = Math.max(r.top, folga), y1 = Math.min(r.bottom, vh() - folga);
        origem = { x: r.left, y: y0, w: r.width, h: y1 - y0, s: gsap.getProperty(melhor.querySelector("img"), "scale") || 1 };
        const src = melhor.querySelector("img").src;
        aBase.src = src.replace("-800.webp", "-1800.webp");
        origem.troca = !/lavoura-cafe-por-do-sol/.test(src);
        escondida = melhor; escondida.style.visibility = "hidden";
      }
      const t = gsap.parseEase("power2.inOut")(gsap.utils.clamp(0, 1, (p - 0.42) / 0.34));
      const W = vw(), H = vh(), o = origem;
      const x = mistura(o.x, 0, t), y = mistura(o.y, 0, t), w = mistura(o.w, W, t), h = mistura(o.h, H, t);
      const raio = (Math.min(w, h) / 2) * Math.pow(1 - t, 0.6);
      const caixa = (img) => {
        const ar = (img.naturalWidth || 2) / (img.naturalHeight || 3);
        let b0 = cobre(o.x, o.y, o.w, o.h, ar); const b1 = cobre(0, 0, W, H, ar);
        b0 = { x: b0.x - b0.w * (o.s - 1) / 2, y: b0.y - b0.h * (o.s - 1) / 2, w: b0.w * o.s, h: b0.h * o.s };
        return { position: "absolute", left: mistura(b0.x, b1.x, t), top: mistura(b0.y, b1.y, t), width: mistura(b0.w, b1.w, t), height: mistura(b0.h, b1.h, t) };
      };
      gsap.set(abertura, { autoAlpha: 1, '--escuro': (0.2 * t).toFixed(3), clipPath: `inset(${y}px ${W - x - w}px ${H - y - h}px ${x}px round ${raio}px)` });
      gsap.set(aBase, caixa(aBase));
      gsap.set(aImg, { ...caixa(aImg), opacity: o.troca ? gsap.utils.clamp(0, 1, (t - 0.25) / 0.45) : 1 });
    },
  });

  ScrollTrigger.create({ trigger: ".topo", start: () => `top+=${vh() * 0.9} top`, end: "max",
    onToggle: (st) => barra.classList.toggle("barra--nome", st.isActive) });
  ScrollTrigger.create({ trigger: ".comprar", start: "top 60px", end: "bottom top", toggleClass: { targets: ".barra", className: "barra--clara" } });

  const pacote = document.querySelector(".cafe__pacote");
  const N = 49, MEIO = 25, quadros = [];
  let temGiro = true;
  for (let i = 1; i <= N; i++) {
    const im = new Image(); im.src = `img/giro/giro-${String(i).padStart(2, "0")}.webp`;
    im.onerror = () => (temGiro = false); quadros.push(im);
  }
  const giro = { q: MEIO };
  const imA = pacote.querySelector(".pacote__a"), imB = pacote.querySelector(".pacote__b");
  let atualA = 0, atualB = 0;
  function mostra(q) {
    if (!temGiro) return;
    const f = gsap.utils.clamp(1, N, q), i = Math.floor(f), frac = f - i, j2 = Math.min(i + 1, N);
    if (i !== atualA && quadros[i - 1].complete) { imA.src = quadros[i - 1].src; atualA = i; }
    if (j2 !== atualB && quadros[j2 - 1].complete) { imB.src = quadros[j2 - 1].src; atualB = j2; }

    imB.style.opacity = gsap.utils.clamp(0, 1, (frac - 0.42) / 0.16).toFixed(3);
  }
  let balanco = 0;
  gsap.ticker.add((t, dt) => {
    const p = window.cafeEstado.progresso;
    balanco = gsap.utils.interpolate(balanco, p > 0.72 ? 1 : 0, 0.04);
    mostra(giro.q + balanco * Math.sin(t * 0.45) * 9);
  });

  const letras = gsap.utils.toArray("#cafe-h .letra");
  const fichas = gsap.utils.toArray(".ficha__item");
  const cafe = gsap.timeline({
    scrollTrigger: {
      trigger: ".cafe", start: "top top", end: "bottom bottom", scrub: 0.6, invalidateOnRefresh: true,
      onUpdate: (st) => (window.cafeEstado.progresso = st.progress),
    },
  });
  cafe.fromTo(".cafe__capsula", { scale: 0.2, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.1, ease: "power2.out" }, 0)
      .fromTo(pacote, { yPercent: 90, autoAlpha: 0, rotation: 6 }, { yPercent: 0, autoAlpha: 1, rotation: 0, duration: 0.12, ease: "power3.out" }, 0.02)
      .fromTo(giro, { q: 1 }, { q: MEIO, duration: 0.14, ease: "power2.out" }, 0.02)
      .fromTo(window.cafeEstado, { graos: 0 }, { graos: 1, duration: 0.09, ease: "power1.out", immediateRender: false }, 0.06)
      .fromTo(letras, { yPercent: 110, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, stagger: 0.006, duration: 0.05 }, 0.04)
      .fromTo(".cafe__intro .etiqueta", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04 }, 0.04)
      .fromTo(".cafe__intro-lado", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.06 }, 0.1)
      .to([".cafe__intro", ".cafe__intro-lado"], { autoAlpha: 0, y: -40, duration: 0.05 }, 0.24)
      .to(pacote, { scale: celular() ? 0.86 : 0.92, duration: 0.08 }, 0.26)
      .to(".cafe__capsula", { scaleY: 1.1, duration: 0.08 }, 0.26)

      .to(".cafe__fixo", { backgroundColor: "#4E3220", duration: 0.06, ease: "none" }, 0.25)
      .to(window.cafeEstado, { graos: 0, duration: 0.07, ease: "power1.in" }, 0.235)

      .to(giro, { q: N, duration: 0.14, ease: "sine.inOut" }, 0.3)
      .to(giro, { q: 1, duration: 0.2, ease: "sine.inOut" }, 0.44)
      .to(giro, { q: MEIO, duration: 0.06, ease: "sine.inOut" }, 0.64);
  fichas.forEach((f, i) => {
    const lado = f.classList.contains("esq") ? -50 : 50;
    cafe.fromTo(f, { autoAlpha: 0, x: lado }, { autoAlpha: 1, x: 0, duration: 0.05, ease: "power2.out" }, 0.3 + i * 0.055);
  });

  cafe.to(fichas, { autoAlpha: 0, duration: 0.05 }, 0.66)
      .to(".cafe__fixo", { backgroundColor: "#0C5B00", duration: 0.06, ease: "none" }, 0.66)
      .to(window.cafeEstado, { graos: 1, duration: 0.08, ease: "power1.out" }, 0.665)
      .to(".cafe__capsula", { autoAlpha: 0, scale: 0.6, duration: 0.06 }, 0.67)
      .fromTo(".sol", { autoAlpha: 0, yPercent: 50 }, { autoAlpha: 1, yPercent: 0, duration: 0.1, ease: "power2.out" }, 0.68)
      .fromTo(".sol__disco", { scale: 0.6 }, { scale: 1, duration: 0.1, ease: "power2.out" }, 0.68)
      .to(pacote, { scale: celular() ? 0.74 : 0.8, yPercent: -12, duration: 0.1 }, 0.67)
      .fromTo(".notas", { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 0.08 }, 0.76)
      .fromTo(".notas__lista li", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, stagger: 0.03, duration: 0.05 }, 0.8)

      .to(window.cafeEstado, { graos: 0, duration: 0.07, ease: "power1.in" }, 0.92)
      .to({}, { duration: 0.01 }, 0.99);

  gsap.from(".cartao", { y: 40, autoAlpha: 0, stagger: 0.1, duration: 0.7, ease: "power3.out", clearProps: "transform",
    scrollTrigger: { trigger: ".cartoes", start: "top 95%", once: true } });

  document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener("load", () => ScrollTrigger.refresh());

  [".desafio", ".numeros", ".contato"].forEach((s) =>
    ScrollTrigger.create({ trigger: s, start: "top 60px", end: "bottom 60px", toggleClass: { targets: ".barra", className: "barra--clara" } }));

  gsap.from(".desafio__linha", { yPercent: 60, autoAlpha: 0, stagger: 0.12, duration: 1, ease: "power3.out",
    scrollTrigger: { trigger: ".desafio", start: "top 70%" } });
  gsap.fromTo(".desafio__capsula", { width: 0 }, { width: "2.4em", ease: "none",
    scrollTrigger: { trigger: ".desafio__titulo", start: "top 75%", end: "bottom 35%", scrub: 0.8 } });
  gsap.fromTo(".desafio__capsula img", { scale: 1.4 }, { scale: 1, ease: "none",
    scrollTrigger: { trigger: ".desafio__titulo", start: "top 75%", end: "bottom 20%", scrub: 0.8 } });
  gsap.from(".desafio__texto", { y: 40, autoAlpha: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: ".desafio__texto", start: "top 85%" } });

  const frase = document.querySelector(".manifesto__frase");
  if (frase) {
    frase.setAttribute("aria-label", frase.textContent.trim());
    frase.innerHTML = frase.textContent.trim().split(/\s+/).map((p) => `<span class="palavra" aria-hidden="true">${p}</span>`).join(" ");
    gsap.to(".manifesto__frase .palavra", { opacity: 1, stagger: 0.1, ease: "none",
      scrollTrigger: { trigger: ".manifesto", start: "top 65%", end: "center 45%", scrub: 0.6 } });

    gsap.utils.toArray(".manifesto__formas .forma").forEach((f, i) => {
      const v = parseFloat(f.dataset.vel);
      gsap.fromTo(f, { yPercent: 70 * v, scale: 0.4, rotation: i % 2 ? 8 : -8 }, { yPercent: -70 * v, scale: 1, rotation: 0, ease: "none",
        scrollTrigger: { trigger: ".manifesto", start: "top bottom", end: "bottom top", scrub: 0.8 } });
      const img = f.querySelector("img");
      if (img) gsap.fromTo(img, { scale: 1.3 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ".manifesto", start: "top bottom", end: "bottom top", scrub: true } });
    });
    gsap.from(".manifesto__assina", { y: 24, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: ".manifesto__assina", start: "top 85%" } });
  }

  gsap.from(".frente", { y: 120, autoAlpha: 0, stagger: 0.15, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: ".frentes__grade", start: "top 80%" } });
  gsap.utils.toArray(".frente__capsula img").forEach((img) =>
    gsap.fromTo(img, { yPercent: -12 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: img.parentNode, start: "top bottom", end: "bottom top", scrub: true } }));

  const videos = gsap.utils.toArray(".manejo__video");
  const itens = gsap.utils.toArray(".manejo__itens li");
  let atual = -1, noManejo = false;
  const mostraVideo = (i) => {
    if (i === atual) return; atual = i;
    videos.forEach((v, k) => { if (k === i && noManejo) { v.preload = "auto"; v.play().catch(() => {}); } else if (k !== i) v.pause(); });
    itens.forEach((li, k) => li.classList.toggle("ativo", k === i));
  };
  const manejo = gsap.timeline({ scrollTrigger: { trigger: ".manejo", start: "top top", end: "bottom bottom", scrub: 0.6, invalidateOnRefresh: true,
    onUpdate: (st) => { const i = Math.max(0, Math.min(itens.length - 1, Math.floor((st.progress - 0.26) / 0.17))); mostraVideo(st.progress < 0.26 ? 0 : i); } } });

  let carregados = false;
  ScrollTrigger.create({ trigger: ".manejo", start: () => `top bottom+=${vh() * 2}`, once: true,
    onEnter: () => { if (carregados) return; carregados = true; videos.forEach((v) => { v.preload = "auto"; v.load(); }); } });
  ScrollTrigger.create({ trigger: ".manejo", start: "top bottom", end: "bottom top",
    onToggle: (s) => { noManejo = s.isActive; const a = atual; atual = -1; if (noManejo) mostraVideo(Math.max(0, a)); else videos.forEach((v) => v.pause()); } });
  manejo.fromTo(".manejo__midia", { clipPath: () => celular() ? "inset(20% 26% 20% 26% round 999px)" : "inset(8% 38% 8% 38% round 999px)" },
                { clipPath: "inset(0% 0% 0% 0% round 48px)", duration: 0.22, ease: "power2.inOut" }, 0)
        .fromTo(".manejo__titulo", { y: 30 }, { y: 0, duration: 0.22 }, 0);
  itens.forEach((li, i) => {
    const t = 0.26 + i * 0.17;
    manejo.fromTo(li, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.05, ease: "power2.out" }, t);
    if (i > 0) manejo.fromTo(videos[i], { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 0.06, ease: "none" }, t - 0.01);
  });
  manejo.to({}, { duration: 0.02 }, 0.98);

  gsap.timeline({ scrollTrigger: { trigger: ".ponte", start: "top top", end: "bottom bottom", scrub: 0.6, invalidateOnRefresh: true } })
    .fromTo(".ponte__foto", { clipPath: "circle(9% at 50% 50%)" }, { clipPath: "circle(75% at 50% 50%)", duration: 0.5, ease: "power2.inOut" }, 0)
    .fromTo(".ponte__foto img", { scale: 1.35 }, { scale: 1, duration: 0.6, ease: "none" }, 0)
    .fromTo(".ponte__texto", { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 0.2 }, 0.32)
    .to(".ponte__texto", { autoAlpha: 0, y: -40, duration: 0.15 }, 0.78)
    .to(".ponte__foto", { autoAlpha: 0, scale: 0.96, duration: 0.16, ease: "power1.in" }, 0.84);

  const fmt = new Intl.NumberFormat("pt-BR");
  document.querySelectorAll("[data-conta]").forEach((el) => {
    const alvo = +el.dataset.conta, suf = el.dataset.sufixo || "", o = { v: 0 };
    const sufixo = suf ? `<small>${suf.trim()}</small>` : "";
    el.innerHTML = "0" + sufixo;
    gsap.to(o, { v: alvo, duration: 1.8, ease: "power2.out", onUpdate: () => (el.innerHTML = fmt.format(Math.round(o.v)) + sufixo),
      scrollTrigger: { trigger: ".numeros__lista", start: "top 80%" } });
  });
  gsap.from(".numeros__lista li", { y: 40, autoAlpha: 0, stagger: 0.1, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: ".numeros__lista", start: "top 80%" } });

  const faz = gsap.timeline({ scrollTrigger: { trigger: ".fazendas", start: "top top", end: "bottom bottom", scrub: 0.6, invalidateOnRefresh: true } });
  faz.fromTo(".fazendas__foto", { clipPath: "inset(0% 0% 0% 0% round 0px)" },
             { clipPath: () => celular() ? "inset(10% 25% 64% 25% round 999px)" : "inset(10% 58% 10% 6% round 999px)", duration: 0.55, ease: "power2.inOut" }, 0.05)
     .fromTo(".fazendas__foto img", { scale: 1.15 }, { scale: 1, duration: 0.7, ease: "none" }, 0)

     .fromTo(".fazendas__foto img", { xPercent: 0, yPercent: 0 }, { xPercent: () => celular() ? 0 : -26, yPercent: () => celular() ? -12 : 0, duration: 0.55, ease: "power2.inOut" }, 0.05)
     .fromTo(".fazendas__texto", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.2 }, 0.45)
     .to({}, { duration: 0.2 }, 0.8);

  const faixa = document.querySelector(".faixa__trilho");
  if (faixa) {
    faixa.innerHTML += faixa.innerHTML;
    const corre = gsap.to(faixa, { xPercent: -50, duration: 36, ease: "none", repeat: -1 });
    gsap.ticker.add(() => {
      const v = window.cafeEstado.velocidade || 0, extra = Math.min(Math.abs(v) * 0.15, 10);
      corre.timeScale(gsap.utils.interpolate(corre.timeScale(), 1 + extra, 0.08));
    });
  }

  gsap.to(".tempo__linha span", { scaleX: 1, ease: "none", scrollTrigger: { trigger: ".tempo__marcos", start: "top 80%", end: "bottom 50%", scrub: 0.6 } });
  gsap.from(".tempo__marcos li", { y: 40, autoAlpha: 0, stagger: 0.15, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: ".tempo__marcos", start: "top 80%" } });

  gsap.from(".rodape__marca span", { yPercent: 100, autoAlpha: 0, stagger: 0.12, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: ".rodape__marca", start: "top 95%" } });
  gsap.from(".rodape__capsula", { scaleX: 0, duration: 1, ease: "power3.out", delay: 0.2, scrollTrigger: { trigger: ".rodape__marca", start: "top 95%" } });
  gsap.from(".rodape__colunas > div", { y: 30, autoAlpha: 0, stagger: 0.08, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: ".rodape__colunas", start: "top 90%" } });

  gsap.from(".contato h2, .contato__texto > p", { y: 50, autoAlpha: 0, stagger: 0.1, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: ".contato", start: "top 70%" } });
  gsap.from(".contato__capsulas .forma", { yPercent: 60, autoAlpha: 0, stagger: 0.1, duration: 0.9, ease: "back.out(1.4)", scrollTrigger: { trigger: ".contato__capsulas", start: "top 90%" } });
  gsap.from(".formulario", { y: 60, autoAlpha: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ".formulario", start: "top 85%" } });
})();
