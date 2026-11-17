const $ = (s) => document.querySelector(s);
      const E = (t, a = {}, ...k) => {
        const e = document.createElement(t);
        for (const [x, v] of Object.entries(a))
          x.startsWith("on") ? (e[x] = v) : e.setAttribute(x, v);
        k.flat().forEach((c) => e.append(c));
        return e;
      };
      const fmt = (v) => Math.round(v).toLocaleString("es-CO");
      const esc = (s) =>
        String(s).replace(
          /[&<>"]/g,
          (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
        );
      const arr = (x, n, f) => {
        x.length = n;
        for (let i = 0; i < n; i++) if (x[i] == null) x[i] = f(i);
        return x;
      };

      /* ---------- datos ---------- */
      const mk = (n) => ({ n, N: 0, B: 0, NT: 0, HT: 0, r: [], a: [], c: [] });
      const BL = () => ({
        tl: 60,
        gap: 0.01,
        T: 0,
        M: 0,
        P: 0,
        meses: 0,
        Fp: 0,
        dias: [],
        prods: [],
        d: [],
        K1: [],
        K2: [],
        psi: [],
        stages: [],
      });
      const src = (n, N, B, r, a, c) => ({
        n,
        N,
        B,
        NT: 1,
        HT: 8,
        r: [r],
        a: [a],
        c: [c],
      });
      const EJ = () => ({
        T: 4,
        M: 4,
        P: 1,
        meses: 3,
        Fp: 0.8,
        dias: [67, 68, 76, 67],
        prods: ["Producto"],
        d: [[50500, 65500, 82000, 92000]],
        K1: [1000],
        K2: [1000],
        psi: [4],
        stages: [
          {
            n: "Corte",
            h: [2],
            src: [
              src("Tipo 1", 5, 12.2, 20, 25000, [25, 28, 30, 28]),
              src("Tipo 2", 5, 10.3, 25, 24000, [28, 30, 30, 32]),
              src("Tipo 3", 10, 11.2, 28, 20000, [30, 32, 34, 32]),
            ],
          },
          {
            n: "Armado",
            h: [3],
            src: [
              src("Tipo 1", 12, 14.2, 35, 24000, [45, 46, 44, 48]),
              src("Tipo 2", 11, 16.1, 40, 22000, [48, 50, 49, 50]),
            ],
          },
          {
            n: "Acabado",
            h: [4],
            src: [
              src("Tipo 1", 4, 12.2, 25, 12000, [12, 15, 18, 19]),
              src("Tipo 2", 5, 12.5, 28, 10000, [14, 16, 18, 20]),
              src("Tipo 3", 11, 13.5, 30, 12000, [13, 16, 20, 22]),
            ],
          },
          {
            n: "Empaque",
            h: [5],
            src: [
              src("Tipo 1", 3, 12.5, 24, 23000, [24, 29, 24, 28]),
              src("Tipo 2", 4, 11.2, 25, 25000, [24, 29, 24, 27]),
              src("Tipo 3", 5, 10.3, 28, 23000, [26, 30, 27, 25]),
              src("Tipo 4", 6, 11.4, 30, 22000, [28, 33, 27, 25]),
            ],
          },
        ],
      });

      let S = BL();
      function fit() {
        S.tl ??= 60;
        S.gap ??= 0.01;
        arr(S.dias, S.T, () => 0);
        arr(S.prods, S.P, (i) => "Producto " + (i + 1));
        arr(S.d, S.P, () => []).forEach((r) => arr(r, S.T, () => 0));
        arr(S.K1, S.P, () => 0);
        arr(S.K2, S.P, () => 0);
        arr(S.psi, S.P, () => 0);
        arr(S.stages, S.M, (i) => ({
          n: "Etapa " + (i + 1),
          h: [],
          src: [mk("Fuente 1")],
        }));
        S.stages.forEach((st) => {
          arr(st.h, S.P, () => 0);
          st.src.forEach((s) => {
            arr(s.r, S.P, () => 0);
            arr(s.a, S.P, () => 0);
            arr(s.c, S.P, () => []).forEach((r) => arr(r, S.T, () => 0));
          });
        });
      }
      const Hh = (i, j, t) => {
        const s = S.stages[i].src[j];
        return Math.max(
          0,
          (S.dias[t] * s.NT * s.HT * s.N - s.B * s.N * S.meses) * S.Fp,
        );
      };
      const Cd = (p, i, j, t) =>
        Hh(i, j, t) * Math.max(0, S.stages[i].src[j].r[p]);

      /* ---------- formulario ---------- */
      let dirty = true;
      const redraw = () => {
        dirty = true;
      };
      const num = (o, k, cb) => {
        const e = E("input", { type: "number", step: "any", value: o[k] });
        e.oninput = () => {
          o[k] = parseFloat(e.value) || 0;
          (cb || redraw)();
        };
        return e;
      };
      const txt = (o, k) => {
        const e = E("input", { type: "text", value: o[k] });
        e.oninput = () => {
          o[k] = e.value;
          redraw();
        };
        return e;
      };
      const Fl = (l, i) => E("label", { class: "field" }, l, i);

      function TB(head, rows) {
        return E(
          "div",
          { class: "sc" },
          E(
            "table",
            {},
            E(
              "thead",
              {},
              E(
                "tr",
                {},
                head.map((h) => E("th", {}, h)),
              ),
            ),
            E(
              "tbody",
              {},
              rows.map((r) =>
                E(
                  "tr",
                  {},
                  r.map((x) => {
                    const td = E("td");
                    if (x && x.h != null) {
                      td.innerHTML = x.h;
                      td.dataset.v = x.v;
                    } else if (typeof x === "string") td.innerHTML = x;
                    else td.append(x);
                    return td;
                  }),
                ),
              ),
            ),
          ),
        );
      }
      const Ts = () => [...Array(S.T)].map((_, t) => "T" + (t + 1));
      function sz(k) {
        const e = E("input", { type: "number", min: 0, step: 1, value: S[k] });
        e.onchange = () => {
          S[k] = Math.max(0, Math.round(parseFloat(e.value) || 0));
          fit();
          renderCfg();
          redraw();
        };
        return e;
      }
      const clr = (f) =>
        E(
          "button",
          {
            class: "clr",
            onclick: () => {
              f();
              renderCfg();
              redraw();
            },
          },
          "Limpiar valores",
        );
      const z0 = (a) => a.fill(0);

      function renderCfg() {
        const c = $("#cfg");
        c.replaceChildren();

        // PASO 1: GENERAL
        c.append(
          E(
            "div",
            { class: "card" },
            E(
              "div",
              { class: "card-header" },
              E(
                "div",
                { class: "card-title-wrap" },
                E("span", { class: "step-pill" }, "Paso 1"),
                E("h3", {}, "Parámetros Generales y Horizonte"),
              ),
              clr(() => {
                S.meses = 0;
                S.Fp = 0;
                z0(S.dias);
              }),
            ),
            E(
              "div",
              { class: "grid-fields" },
              Fl("Períodos (T)", sz("T")),
              Fl("Etapas en serie (M)", sz("M")),
              Fl("Productos (P)", sz("P")),
              Fl("Meses por período", num(S, "meses")),
              Fl("Factor eficiencia (Fp)", num(S, "Fp")),
              Fl("Tiempo máx. solver (s)", num(S, "tl")),
              Fl("Tolerancia gap (%)", num(S, "gap")),
            ),
            E(
              "div",
              { class: "note-box" },
              E("b", {}, "Fórmula de capacidad: "),
              "Horas disponibles = (Días hábiles × Turnos × Horas/turno × Máquinas − Pérdida mant. × Máquinas × Meses) × Fp.",
            ),
            S.T > 0
              ? TB(["Concepto"].concat(Ts()), [
                  [
                    "Días hábiles por período",
                    ...S.dias.map((_, t) => num(S.dias, t)),
                  ],
                ])
              : "",
          ),
        );

        // PASO 2: PRODUCTOS
        const hd = [
          "Producto",
          "Costo escasez (ψ)",
          "Inv. inicial (K1)",
          "Inv. final (K2)",
          ...Ts().map((t) => "Demanda " + t),
          ...S.stages.map(
            (s, i) =>
              "Mant. " + (i == S.M - 1 ? "final (+)" : "etapa " + (i + 1)),
          ),
        ];
        c.append(
          E(
            "div",
            { class: "card" },
            E(
              "div",
              { class: "card-header" },
              E(
                "div",
                { class: "card-title-wrap" },
                E("span", { class: "step-pill" }, "Paso 2"),
                E("h3", {}, "Productos, Demanda y Costos de Inventario"),
              ),
              clr(() => {
                z0(S.psi);
                z0(S.K1);
                z0(S.K2);
                S.d.forEach(z0);
                S.stages.forEach((s) => z0(s.h));
              }),
            ),
            E(
              "div",
              { class: "note-box" },
              E("b", {}, "Orden de prioridad: "),
              "Los productos se planean secuencialmente de arriba hacia abajo; el primero dispone de toda la capacidad y los siguientes usan las horas sobrantes.",
            ),
            S.P > 0
              ? TB(
                  hd,
                  S.prods.map((_, p) => [
                    txt(S.prods, p),
                    num(S.psi, p),
                    num(S.K1, p),
                    num(S.K2, p),
                    ...S.d[p].map((_, t) => num(S.d[p], t)),
                    ...S.stages.map((s) => num(s.h, p)),
                  ]),
                )
              : E(
                  "p",
                  { class: "note" },
                  "Define al menos 1 producto en el Paso 1.",
                ),
          ),
        );

        // PASO 3: ETAPAS
        S.stages.forEach((st, i) => {
          const rows = [];
          st.src.forEach((s, j) =>
            S.prods.forEach((pn, p) =>
              rows.push([
                esc(s.n) + " · " + esc(pn),
                num(s.r, p),
                num(s.a, p),
                ...s.c[p].map((_, t) => num(s.c[p], t)),
              ]),
            ),
          );
          c.append(
            E(
              "div",
              { class: "card" },
              E(
                "div",
                { class: "card-header" },
                E(
                  "div",
                  { class: "card-title-wrap" },
                  E(
                    "span",
                    { class: "step-pill stage" },
                    `Paso 3 · Etapa ${i + 1} de ${S.M}`,
                  ),
                  txt(st, "n"),
                ),
                E(
                  "div",
                  { class: "toolbar-group" },
                  E(
                    "button",
                    {
                      class: "sm",
                      onclick: () => {
                        st.src.push(mk("Fuente " + (st.src.length + 1)));
                        fit();
                        renderCfg();
                        redraw();
                      },
                    },
                    "+ Añadir fuente",
                  ),
                  E(
                    "button",
                    {
                      class: "sm",
                      onclick: () => {
                        if (st.src.length > 1) {
                          st.src.pop();
                          renderCfg();
                          redraw();
                        }
                      },
                    },
                    "− Quitar fuente",
                  ),
                  clr(() =>
                    st.src.forEach((s) => {
                      s.N = s.B = s.NT = s.HT = 0;
                      z0(s.r);
                      z0(s.a);
                      s.c.forEach(z0);
                    }),
                  ),
                ),
              ),
              E(
                "h4",
                { class: "sub-title" },
                "1. Configuración de capacidad por fuente (máquinas)",
              ),
              TB(
                [
                  "Fuente / Máquina",
                  "Cant. máquinas (N)",
                  "Pérdida mant. (h/mes/máq)",
                  "Turnos / día",
                  "Horas / turno",
                ],
                st.src.map((s) => [
                  txt(s, "n"),
                  num(s, "N"),
                  num(s, "B"),
                  num(s, "NT"),
                  num(s, "HT"),
                ]),
              ),
              E(
                "h4",
                { class: "sub-title" },
                "2. Tasas de producción y costos por producto",
              ),
              TB(
                [
                  "Fuente · Producto",
                  "Tasa (unid/hora)",
                  "Costo preparación ($)",
                  ...Ts().map((t) => "Costo unit. " + t),
                ],
                rows,
              ),
            ),
          );
        });
      }

      /* ---------- diagrama ---------- */
      function net(p, PR, z) {
        const { T, M } = S,
          cw = 330,
          rh = 180,
          x0 = 270,
          y0 = 170,
          W = x0 + T * cw - 60,
          H = y0 + (M - 1) * rh + 170;
        const px = (t) => x0 + t * cw,
          py = (i) => y0 + i * rh,
          on = (v) => Math.abs(v) > 0.5;
        const mk_ = (k) => `url(#${k}${p})`;
        let o = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="system-ui,sans-serif" font-size="13"><defs>${[
          ["a", "#0f172a"],
          ["g", "#cbd5e1"],
          ["r", "#dc2626"],
        ]
          .map(
            ([k, c]) =>
              `<marker id="${k}${p}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="${c}"/></marker>`,
          )
          .join("")}</defs><rect width="${W}" height="${H}" fill="#fff"/>`;
        const lab = (x, y, s, c = "#0f172a") => {
          const a = `x="${x}" y="${y}" text-anchor="middle" font-weight="600"`;
          return `<text ${a} fill="#fff" stroke="#fff" stroke-width="4">${s}</text><text ${a} fill="${c}">${s}</text>`;
        };
        const arc = (d, a, k) =>
          `<path d="${d}" fill="none" stroke="${k == "r" ? "#dc2626" : a ? "#0f172a" : "#cbd5e1"}" stroke-width="${a ? 1.8 : 1}" ${k == "r" ? 'stroke-dasharray="6 4"' : ""} marker-end="${mk_(k == "r" ? "r" : a ? "a" : "g")}"/>`;
        const yel = (x, y, s) =>
          `<rect x="${x - 42}" y="${y - 14}" width="84" height="22" rx="4" fill="#fef3c7" stroke="#f59e0b" stroke-width="0.8"/><text x="${x}" y="${y + 2}" text-anchor="middle" font-weight="700" fill="#78350f">${s}</text>`;
        const fi = M - 1;
        S.stages.forEach((st, i) => {
          const J = st.src.length,
            y1 = i ? py(i - 1) + 22 : py(0) - 130,
            y2 = py(i) - 22;
          o += `<text x="16" y="${py(i) - 4}" font-weight="700" fill="#0f172a">Etapa ${i + 1}: ${esc(st.n)}</text><text x="16" y="${py(i) + 14}" fill="#64748b">j = 1…${J} fuentes</text>`;
          for (let t = 0; t < T; t++) {
            if (!i)
              o += `<rect x="${px(t) - 32}" y="${y1 - 24}" width="64" height="24" rx="5" fill="#f1f5f9" stroke="#64748b"/><text x="${px(t)}" y="${y1 - 8}" text-anchor="middle" font-weight="600" fill="#334155">Entrada</text>`;
            st.src.forEach((s, k) => {
              const off = (k - (J - 1) / 2) * 64,
                ym = (y1 + y2) / 2,
                x = px(t) + off,
                v = PR.X[i][k][t],
                a = on(v),
                sh = k % 2 ? 28 : -6;
              if (!a && !z) return;
              o += arc(
                `M${px(t)} ${y1}Q${px(t) + 2 * off} ${ym} ${px(t)} ${y2}`,
                a,
                "a",
              );
              o +=
                lab(x, ym + sh, `${k + 1}: ${fmt(v)}`) +
                lab(x, ym + 14 + sh, `cap ${fmt(PR.cd[i][k][t])}`, "#64748b");
            });
            o += `<circle cx="${px(t)}" cy="${py(i)}" r="22" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/><text x="${px(t)}" y="${py(i) + 5}" text-anchor="middle" font-weight="700" fill="#1e3a8a">T${t + 1}</text>`;
            if (t < T - 1) {
              const xa = px(t) + 22,
                xb = px(t + 1) - 22,
                xm = (px(t) + px(t + 1)) / 2;
              if (i < fi) {
                const v = PR.V[i][t];
                if (on(v) || z)
                  o +=
                    arc(
                      `M${xa} ${py(i) - 6}Q${xm} ${py(i) - 58} ${xb} ${py(i) - 6}`,
                      on(v),
                      "a",
                    ) + lab(xm, py(i) - 34, "I " + fmt(v));
              } else {
                const v = PR.Q[t],
                  w = PR.W[t];
                if (on(v) || z)
                  o +=
                    arc(
                      `M${xa} ${py(i) - 6}Q${xm} ${py(i) - 58} ${xb} ${py(i) - 6}`,
                      on(v),
                      "a",
                    ) + lab(xm, py(i) - 34, "I+ " + fmt(v));
                if (on(w) || z)
                  o +=
                    arc(
                      `M${xa - 4} ${py(i) + 16}Q${xm} ${py(i) + 68} ${xb + 4} ${py(i) + 16}`,
                      true,
                      "r",
                    ) + lab(xm, py(i) + 52, "I− " + fmt(w), "#dc2626");
              }
            }
          }
        });
        for (let t = 0; t < T; t++) {
          const y = py(fi);
          o +=
            `<line x1="${px(t)}" y1="${y + 22}" x2="${px(t)}" y2="${y + 84}" stroke="#0f172a" stroke-width="1.8" marker-end="${mk_("a")}"/>` +
            yel(px(t), y + 110, "d " + fmt(S.d[p][t]));
        }
        o +=
          `<line x1="${px(0) - 90}" y1="${py(fi)}" x2="${px(0) - 24}" y2="${py(fi)}" stroke="#0f172a" stroke-width="1.8" marker-end="${mk_("a")}"/>` +
          yel(px(0) - 62, py(fi) + 34, "K1 " + fmt(S.K1[p]));
        o +=
          `<line x1="${px(T - 1) + 24}" y1="${py(fi)}" x2="${px(T - 1) + 110}" y2="${py(fi)}" stroke="#0f172a" stroke-width="1.8" marker-end="${mk_("a")}"/>` +
          yel(px(T - 1) + 70, py(fi) + 34, "K2 " + fmt(PR.Q[T - 1]));
        return o + "</svg>";
      }

      function netAll(pr, z) {
        const { T, M } = S,
          P = pr.length,
          cw = 360,
          rh = 190 + 14 * P,
          x0 = 300,
          y0 = 190 + 14 * P,
          W = x0 + T * cw - 40,
          H = y0 + (M - 1) * rh + 190 + 26 * P;
        const px = (t) => x0 + t * cw,
          py = (i) => y0 + i * rh,
          on = (v) => Math.abs(v) > 0.5,
          CO = [
            "#2563eb",
            "#d97706",
            "#059669",
            "#7c3aed",
            "#0284c7",
            "#475569",
          ],
          col = (q) => CO[q % 6],
          fn = (q) => esc(S.prods[pr[q].p].slice(0, 12)),
          nm = (q) => {
            const n = S.prods[pr[q].p].trim(),
              w = n.split(/\s+/);
            return esc(
              w.length > 1 ? w[w.length - 1].slice(0, 6) : n.slice(0, 8),
            );
          };
        let o = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="system-ui,sans-serif" font-size="13"><defs>${[...pr.map((_, q) => ["Aa" + q, col(q)]), ["Ag", "#cbd5e1"], ["Ak", "#0f172a"], ["Ar", "#dc2626"]].map(([k, c]) => `<marker id="${k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="${c}"/></marker>`).join("")}</defs><rect width="${W}" height="${H}" fill="#fff"/>`;
        const lab = (x, y, s, c = "#0f172a") => {
          const a = `x="${x}" y="${y}" text-anchor="middle" font-weight="600"`;
          return `<text ${a} fill="#fff" stroke="#fff" stroke-width="4">${s}</text><text ${a} fill="${c}">${s}</text>`;
        };
        const arc = (d, c, m, dash) =>
          `<path d="${d}" fill="none" stroke="${c}" stroke-width="1.8" ${dash ? 'stroke-dasharray="6 4"' : ""} marker-end="url(#${m})"/>`;
        const yel = (x, y, s) =>
          `<rect x="${x - 85}" y="${y - 14}" width="170" height="22" rx="4" fill="#fef3c7" stroke="#f59e0b" stroke-width="0.8"/><text x="${x}" y="${y + 2}" text-anchor="middle" font-weight="700" font-size="12" fill="#78350f">${s}</text>`;
        pr.forEach((_, q) => {
          o += `<rect x="16" y="${16 + q * 20}" width="12" height="12" rx="2" fill="${col(q)}"/><text x="36" y="${27 + q * 20}" font-weight="600">${fn(q)}  (etiqueta: ${nm(q)})</text>`;
        });
        const fi = M - 1;
        S.stages.forEach((st, i) => {
          const J = st.src.length,
            y1 = i ? py(i - 1) + 22 : py(0) - 120 - 14 * P,
            y2 = py(i) - 22;
          o += `<text x="16" y="${py(i) - 4}" font-weight="700">Etapa ${i + 1}: ${esc(st.n)}</text><text x="16" y="${py(i) + 14}" fill="#64748b">j = 1…${J} fuentes</text>`;
          for (let t = 0; t < T; t++) {
            if (!i)
              o += `<rect x="${px(t) - 32}" y="${y1 - 24}" width="64" height="24" rx="5" fill="#f1f5f9" stroke="#64748b"/><text x="${px(t)}" y="${y1 - 8}" text-anchor="middle" font-weight="600">Entrada</text>`;
            st.src.forEach((s, k) => {
              const off = (k - (J - 1) / 2) * 70,
                ym = (y1 + y2) / 2,
                x = px(t) + off,
                act = pr.map((a, q) => q).filter((q) => on(pr[q].X[i][k][t]));
              if (!act.length && !z) return;
              if (!act.length)
                o += arc(
                  `M${px(t)} ${y1}Q${px(t) + 2 * off} ${ym} ${px(t)} ${y2}`,
                  "#cbd5e1",
                  "Ag",
                );
              act.forEach((q) => {
                const ox = (q - (P - 1) / 2) * 7;
                o += arc(
                  `M${px(t) + ox} ${y1}Q${px(t) + 2 * off + ox} ${ym} ${px(t) + ox} ${y2}`,
                  col(q),
                  "Aa" + q,
                );
              });
              const sh = (k % 2) * (14 * P + 8) - 6;
              (z ? pr.map((a, q) => q) : act).forEach((q, n) => {
                o += lab(
                  x,
                  ym + sh + n * 14,
                  `${nm(q)}: ${fmt(pr[q].X[i][k][t])}`,
                  col(q),
                );
              });
            });
            o += `<circle cx="${px(t)}" cy="${py(i)}" r="22" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/><text x="${px(t)}" y="${py(i) + 5}" text-anchor="middle" font-weight="700" fill="#1e3a8a">T${t + 1}</text>`;
            if (t < T - 1) {
              const xa = px(t) + 22,
                xb = px(t + 1) - 22,
                xm = (px(t) + px(t + 1)) / 2;
              pr.forEach((PR, q) => {
                if (i < fi) {
                  const v = PR.V[i][t];
                  if (on(v) || z)
                    o +=
                      arc(
                        `M${xa} ${py(i) - 6}Q${xm} ${py(i) - 58 - q * 18} ${xb} ${py(i) - 6}`,
                        col(q),
                        "Aa" + q,
                      ) +
                      lab(
                        xm,
                        py(i) - 34 - q * 18,
                        `${nm(q)}: I ${fmt(v)}`,
                        col(q),
                      );
                } else {
                  const v = PR.Q[t],
                    w = PR.W[t];
                  if (on(v) || z)
                    o +=
                      arc(
                        `M${xa} ${py(i) - 6}Q${xm} ${py(i) - 58 - q * 18} ${xb} ${py(i) - 6}`,
                        col(q),
                        "Aa" + q,
                      ) +
                      lab(
                        xm,
                        py(i) - 34 - q * 18,
                        `${nm(q)}: I+ ${fmt(v)}`,
                        col(q),
                      );
                  if (on(w) || z)
                    o +=
                      arc(
                        `M${xa - 4} ${py(i) + 16}Q${xm} ${py(i) + 68 + q * 18} ${xb + 4} ${py(i) + 16}`,
                        "#dc2626",
                        "Ar",
                        1,
                      ) +
                      lab(
                        xm,
                        py(i) + 52 + q * 18,
                        `${nm(q)}: I− ${fmt(w)}`,
                        "#dc2626",
                      );
                }
              });
            }
          }
        });
        const y = py(fi);
        for (let t = 0; t < T; t++) {
          o += `<line x1="${px(t)}" y1="${y + 22}" x2="${px(t)}" y2="${y + 84}" stroke="#0f172a" stroke-width="1.8" marker-end="url(#Ak)"/>`;
          pr.forEach((PR, q) => {
            o += yel(
              px(t),
              y + 110 + q * 26,
              `d ${fn(q)}: ${fmt(S.d[PR.p][t])}`,
            );
          });
        }
        o += `<line x1="${px(0) - 90}" y1="${y}" x2="${px(0) - 24}" y2="${y}" stroke="#0f172a" stroke-width="1.8" marker-end="url(#Ak)"/>`;
        o += `<line x1="${px(T - 1) + 24}" y1="${y}" x2="${px(T - 1) + 110}" y2="${y}" stroke="#0f172a" stroke-width="1.8" marker-end="url(#Ak)"/>`;
        pr.forEach((PR, q) => {
          o +=
            yel(
              px(0) - 100,
              y + 34 + q * 26,
              `K1 ${fn(q)}: ${fmt(S.K1[PR.p])}`,
            ) +
            yel(
              px(T - 1) + 80,
              y + 34 + q * 26,
              `K2 ${fn(q)}: ${fmt(PR.Q[T - 1])}`,
            );
        });
        return o + "</svg>";
      }

      function capTable(p) {
        const rows = [];
        S.stages.forEach((st, i) =>
          st.src.forEach((s, j) =>
            rows.push([
              esc(st.n) + " · " + esc(s.n),
              ...S.dias.map((_, t) => ({
                h: fmt(Cd(p, i, j, t)),
                v: Cd(p, i, j, t),
              })),
            ]),
          ),
        );
        return TB(["Etapa · Fuente", ...Ts()], rows);
      }

      /* ---------- modelo ---------- */
      const nX = (p, i, j, t) => `X_${p}_${i}_${j}_${t}`,
        nY = (p, i, j, t) => `Y_${p}_${i}_${j}_${t}`,
        nV = (p, i, t) => `V_${p}_${i}_${t}`,
        nQ = (p, t) => `Q_${p}_${t}`,
        nM = (p, t) => `W_${p}_${t}`;
      function buildLP(p, av) {
        const { T, M } = S,
          obj = [],
          cons = [],
          gen = [],
          bin = [];
        let n = 0;
        const row = (terms, op, rhs) => {
          const l = terms
            .filter((a) => a[0] !== 0)
            .map(([c, v]) => `${c < 0 ? "-" : "+"} ${Math.abs(c)} ${v}`);
          if (!l.length) return;
          cons.push(
            ` r${n++}: ` +
              l.map((x, k) => x + (k % 6 == 5 ? "\n   " : " ")).join("") +
              `${op} ${rhs}`,
          );
        };
        S.stages.forEach((st, i) => {
          st.src.forEach((s, j) => {
            for (let t = 0; t < T; t++) {
              gen.push(nX(p, i, j, t));
              bin.push(nY(p, i, j, t));
              obj.push([s.c[p][t], nX(p, i, j, t)], [s.a[p], nY(p, i, j, t)]);
              row(
                [
                  [1, nX(p, i, j, t)],
                  [-av[i][j][t] * Math.max(0, s.r[p]), nY(p, i, j, t)],
                ],
                "<=",
                0,
              );
            }
          });
          for (let t = 0; t < T; t++) {
            if (i < M - 1) {
              gen.push(nV(p, i, t));
              obj.push([st.h[p], nV(p, i, t)]);
              const tm = [];
              st.src.forEach((s, j) => tm.push([1, nX(p, i, j, t)]));
              S.stages[i + 1].src.forEach((s, j) =>
                tm.push([-1, nX(p, i + 1, j, t)]),
              );
              if (t > 0) tm.push([1, nV(p, i, t - 1)]);
              tm.push([-1, nV(p, i, t)]);
              row(tm, "=", 0);
            } else {
              gen.push(nQ(p, t), nM(p, t));
              obj.push([st.h[p], nQ(p, t)], [S.psi[p], nM(p, t)]);
              const tm = [];
              st.src.forEach((s, j) => tm.push([1, nX(p, i, j, t)]));
              if (t > 0) tm.push([1, nQ(p, t - 1)], [-1, nM(p, t - 1)]);
              tm.push([-1, nQ(p, t)], [1, nM(p, t)]);
              row(tm, "=", S.d[p][t] - (t == 0 ? S.K1[p] : 0));
            }
          }
          if (i < M - 1) row([[1, nV(p, i, T - 1)]], "=", 0);
        });
        row([[1, nQ(p, T - 1)]], "=", S.K2[p]);
        row([[1, nM(p, T - 1)]], "=", 0);
        const ch = (a) =>
          a.map((x, k) => x + (k % 10 == 9 ? "\n " : " ")).join("");
        const os = obj
          .filter((a) => a[0] !== 0)
          .map(([c, v]) => `${c < 0 ? "-" : "+"} ${Math.abs(c)} ${v}`);
        return `Minimize\n obj: ${os.length ? os.map((x, k) => x + (k % 6 == 5 ? "\n   " : " ")).join("") : "0 " + gen[0]}\nSubject To\n${cons.join("\n")}\nGeneral\n ${ch(gen)}\nBinary\n ${ch(bin)}\nEnd\n`;
      }

      let HI;
      async function loadHi() {
        if (HI) return HI;
        for (const b of [
          "https://cdn.jsdelivr.net/npm/highs@1.15.4/build/",
          "https://lovasoft.github.io/highs-js/",
        ]) {
          try {
            await new Promise((ok, ko) => {
              const s = document.createElement("script");
              s.src = b + "highs.js";
              s.onload = ok;
              s.onerror = ko;
              document.head.append(s);
            });
            const f = window.Module || window.highs;
            HI = await f({ locateFile: (x) => b + x });
            return HI;
          } catch (e) {
            console.warn(e);
          }
        }
        throw new Error(
          "No se pudo cargar el solver HiGHS. Revisa tu conexión a internet.",
        );
      }

      async function solve() {
        if (S.T < 1 || S.M < 1 || S.P < 1) {
          showRes(
            null,
            "Define al menos 1 período, 1 etapa y 1 producto en el Paso 1.",
          );
          return;
        }
        const b = $("#bSol"),
          st = $("#st");
        b.disabled = true;
        st.textContent = "Cargando solver…";
        try {
          const hi = await loadHi(),
            { T, M } = S;
          let av = S.stages.map((s, i) =>
            s.src.map((x, j) => S.dias.map((_, t) => Hh(i, j, t))),
          );
          const pr = [];
          let fail = null,
            warn = "";
          for (let p = 0; p < S.P; p++) {
            st.textContent = `Optimizando ${S.prods[p]} (${p + 1}/${S.P})…`;
            await new Promise((r) => setTimeout(r, 30));
            const snap = av.map((a) => a.map((x) => x.slice()));
            const r = hi.solve(buildLP(p, snap), {
              mip_rel_gap: Math.max(0, S.gap) / 100,
              time_limit: Math.max(1, S.tl),
            });
            const lim =
              r.Status === "Time limit reached" &&
              Number.isFinite(r.ObjectiveValue) &&
              Object.keys(r.Columns || {}).length > 0;
            if (r.Status !== "Optimal" && !lim) {
              fail = {
                p,
                msg:
                  r.Status === "Infeasible"
                    ? p
                      ? `No se pudo planear «${S.prods[p]}»: la capacidad sobrante después de los productos anteriores no alcanza para cubrir su demanda.`
                      : `El problema no tiene solución factible: la capacidad instalada no alcanza para cubrir la demanda (o el inventario final K2) de «${S.prods[p]}».`
                    : r.Status === "Time limit reached"
                      ? `El solver alcanzó el límite de tiempo sin encontrar solución para «${S.prods[p]}».`
                      : `No se obtuvo solución para «${S.prods[p]}» (${r.Status}).`,
              };
              break;
            }
            if (lim) warn += ` «${S.prods[p]}»`;
            const g = (n) =>
                Math.round((r.Columns[n]?.Primal || 0) * 1e6) / 1e6,
              A = (f) =>
                S.stages.map((s, i) =>
                  s.src.map((x, j) => S.dias.map((_, t) => f(i, j, t))),
                );
            const X = A((i, j, t) => g(nX(p, i, j, t))),
              Y = A((i, j, t) => g(nY(p, i, j, t))),
              rt = (i, j) => S.stages[i].src[j].r[p];
            const hu = A((i, j, t) =>
                rt(i, j) > 0 ? X[i][j][t] / rt(i, j) : 0,
              ),
              cd = A((i, j, t) => snap[i][j][t] * Math.max(0, rt(i, j)));
            pr.push({
              p,
              obj: r.ObjectiveValue,
              lim,
              av: snap,
              X,
              Y,
              hu,
              cd,
              V: S.stages.map((s, i) =>
                i < M - 1 ? S.dias.map((_, t) => g(nV(p, i, t))) : [],
              ),
              Q: S.dias.map((_, t) => g(nQ(p, t))),
              W: S.dias.map((_, t) => g(nM(p, t))),
            });
            av = av.map((a, i) =>
              a.map((x, j) => x.map((h, t) => Math.max(0, h - hu[i][j][t]))),
            );
          }
          showRes({
            pr,
            fail,
            warn: warn
              ? "Se alcanzó el tiempo máximo en" +
                warn +
                ": se muestra la mejor solución factible encontrada."
              : "",
          });
        } catch (e) {
          showRes(null, String(e.message || e));
        } finally {
          b.disabled = false;
          st.textContent = "";
        }
      }

      /* ---------- resultados ---------- */
      let LASTR;
      const CN = [
        ["prod", "Producción"],
        ["set", "Preparación"],
        ["hold", "Inventario"],
        ["short", "Escasez"],
      ];
      const sum = (a) => a.reduce((x, y) => x + y, 0);
      function costsOf(PR) {
        const p = PR.p,
          { T, M } = S,
          z = () => Array(T).fill(0),
          c = { prod: z(), set: z(), hold: z(), short: z() };
        S.stages.forEach((st, i) => {
          st.src.forEach((s, j) => {
            for (let t = 0; t < T; t++) {
              c.prod[t] += s.c[p][t] * PR.X[i][j][t];
              c.set[t] += s.a[p] * PR.Y[i][j][t];
            }
          });
          for (let t = 0; t < T; t++)
            c.hold[t] += st.h[p] * (i < M - 1 ? PR.V[i][t] : PR.Q[t]);
        });
        for (let t = 0; t < T; t++) c.short[t] = S.psi[p] * PR.W[t];
        return c;
      }

      function showRes(R, err) {
        LASTR = R;
        const c = $("#rc");
        c.replaceChildren();
        tab("res");
        if (err) {
          c.append(E("div", { class: "msg" }, err));
          return;
        }
        const { T, M } = S;
        if (R.warn) c.append(E("div", { class: "msg" }, R.warn));

        c.append(
          E(
            "div",
            { class: "toolbar" },
            E(
              "div",
              { class: "toolbar-group" },
              E(
                "span",
                { style: "font-weight:600;color:var(--ink)" },
                "Exportar reporte:",
              ),
            ),
            E(
              "div",
              { class: "toolbar-group" },
              E("button", { onclick: csv }, "📊 Descargar tablas (.csv)"),
              E(
                "button",
                { onclick: () => window.print() },
                "🖨️ Imprimir / Guardar PDF",
              ),
            ),
          ),
        );

        if (R.pr.length) {
          const tot = sum(R.pr.map((x) => x.obj)),
            rows = R.pr.map((x) => {
              const k = costsOf(x),
                cs = CN.map(([n]) => sum(k[n]));
              return [
                esc(S.prods[x.p]),
                ...cs.map((v) => ({ h: "$ " + fmt(v), v })),
                { h: "<b>$ " + fmt(sum(cs)) + "</b>", v: sum(cs) },
              ];
            });
          c.append(
            E(
              "div",
              { class: "card" },
              E(
                "div",
                { class: "card-header" },
                E(
                  "div",
                  { class: "card-title-wrap" },
                  E("span", { class: "step-pill" }, "Global"),
                  E("h3", {}, "Resumen Ejecutivo de Costos"),
                ),
              ),
              E(
                "div",
                { class: "kpi-grid" },
                E(
                  "div",
                  { class: "kpi-box tot" },
                  E("span", {}, "Costo Total Optimizado"),
                  E("b", {}, "$ " + fmt(tot)),
                ),
              ),
              E(
                "p",
                { class: "note" },
                "Planeación secuencial: cada producto utiliza la capacidad remanente dejada por los productos de mayor prioridad.",
              ),
              TB(["Producto", ...CN.map((x) => x[1]), "Costo Total"], rows),
            ),
          );

          if (R.pr.length > 1) {
            const w = E("div", { class: "svgw" });
            w.innerHTML = netAll(R.pr, false);
            c.append(
              E(
                "div",
                { class: "card" },
                E(
                  "div",
                  { class: "card-header" },
                  E(
                    "div",
                    { class: "card-title-wrap" },
                    E("span", { class: "step-pill stage" }, "Red Consolidada"),
                    E("h3", {}, "Diagrama de Flujo · Todos los Productos"),
                  ),
                  E(
                    "div",
                    { class: "toolbar-group" },
                    E(
                      "button",
                      {
                        class: "sm",
                        onclick: () =>
                          dl(
                            "solucion_todos.svg",
                            w.innerHTML,
                            "image/svg+xml",
                          ),
                      },
                      "SVG",
                    ),
                    E(
                      "button",
                      {
                        class: "sm",
                        onclick: () =>
                          dlImg(w.innerHTML, "solucion_todos.png", "image/png"),
                      },
                      "PNG",
                    ),
                    E(
                      "button",
                      {
                        class: "sm",
                        onclick: () =>
                          dlImg(
                            w.innerHTML,
                            "solucion_todos.jpg",
                            "image/jpeg",
                          ),
                      },
                      "JPG",
                    ),
                    E(
                      "button",
                      {
                        class: "sm",
                        onclick: () => {
                          w.innerHTML = netAll(R.pr, true);
                        },
                      },
                      "Mostrar arcos en 0",
                    ),
                  ),
                ),
                E(
                  "p",
                  { class: "note" },
                  "Cada color representa un producto distinto fluyendo a través de las etapas y fuentes.",
                ),
                w,
              ),
            );
          }
        }

        R.pr.forEach((PR) => {
          const p = PR.p,
            pn = S.prods[p],
            pr = [];
          S.stages.forEach((st, i) =>
            st.src.forEach((s, j) => {
              let tot = 0;
              const cells = S.dias.map((_, t) => {
                const x = PR.X[i][j][t];
                tot += x;
                const H = Hh(i, j, t),
                  u = H > 0 ? (PR.hu[i][j][t] / H) * 100 : 0;
                return {
                  h:
                    fmt(x) +
                    (PR.Y[i][j][t] > 0.5 ? " ●" : "") +
                    `<small>${u.toFixed(0)}%</small>`,
                  v: x,
                };
              });
              pr.push([
                esc(st.n) + " · " + esc(s.n),
                ...cells,
                { h: "<b>" + fmt(tot) + "</b>", v: tot },
              ]);
            }),
          );
          const cp = S.stages.flatMap((st, i) =>
            st.src.map((s, j) => [
              esc(st.n) + " · " + esc(s.n),
              ...S.dias.map((_, t) => ({
                h: fmt(PR.cd[i][j][t]),
                v: PR.cd[i][j][t],
              })),
            ]),
          );
          const inv = [];
          S.stages.slice(0, M - 1).forEach((st, i) =>
            inv.push([
              "Inventario " + esc(st.n),
              ...S.dias.map((_, t) => ({
                h: fmt(PR.V[i][t]),
                v: PR.V[i][t],
              })),
            ]),
          );
          inv.push([
            "Inventario final (+)",
            ...PR.Q.map((v) => ({ h: fmt(v), v })),
          ]);
          inv.push([
            "Escasez / pendiente (−)",
            ...PR.W.map((v) => ({ h: fmt(v), v })),
          ]);
          inv.push([
            "Demanda objetivo",
            ...S.d[p].map((d) => ({ h: fmt(d), v: d })),
          ]);
          const w = E("div", { class: "svgw" });
          w.innerHTML = net(p, PR, false);
          const kpiData = costsOf(PR);

          c.append(
            E(
              "div",
              { class: "card" },
              E(
                "div",
                { class: "card-header" },
                E(
                  "div",
                  { class: "card-title-wrap" },
                  E("span", { class: "step-pill stage" }, `Producto ${p + 1}`),
                  E("h3", {}, pn),
                ),
              ),
              E(
                "div",
                { class: "kpi-grid" },
                ...CN.map(([n, l]) =>
                  E(
                    "div",
                    { class: "kpi-box" },
                    E("span", {}, l),
                    E("b", {}, "$ " + fmt(sum(kpiData[n]))),
                  ),
                ),
                E(
                  "div",
                  { class: "kpi-box tot" },
                  E("span", {}, "Costo del Producto"),
                  E("b", {}, "$ " + fmt(PR.obj)),
                ),
              ),
              E(
                "h4",
                { class: "sub-title" },
                p
                  ? "Capacidad disponible (sobrante de productos anteriores, en unidades)"
                  : "Capacidad máxima disponible (unidades)",
              ),
              TB(["Etapa · Fuente", ...Ts()], cp),
              E(
                "h4",
                { class: "sub-title" },
                "Plan de producción por fuente (unidades · % uso de horas · ● fuente activada)",
              ),
              TB(["Etapa · Fuente", ...Ts(), "Total"], pr),
              E(
                "h4",
                { class: "sub-title" },
                "Balance de inventarios, escasez y demanda",
              ),
              TB(["Concepto", ...Ts()], inv),
              E(
                "div",
                {
                  class: "card-header",
                  style: "margin-top:20px;border-bottom:none;padding-bottom:0",
                },
                E(
                  "h4",
                  { class: "sub-title", style: "margin:0" },
                  "Diagrama de red de flujo",
                ),
                E(
                  "div",
                  { class: "toolbar-group" },
                  E(
                    "button",
                    {
                      class: "sm",
                      onclick: () =>
                        dl(
                          "solucion_" + pn + ".svg",
                          w.innerHTML,
                          "image/svg+xml",
                        ),
                    },
                    "SVG",
                  ),
                  E(
                    "button",
                    {
                      class: "sm",
                      onclick: () =>
                        dlImg(
                          w.innerHTML,
                          "solucion_" + pn + ".png",
                          "image/png",
                        ),
                    },
                    "PNG",
                  ),
                  E(
                    "button",
                    {
                      class: "sm",
                      onclick: () =>
                        dlImg(
                          w.innerHTML,
                          "solucion_" + pn + ".jpg",
                          "image/jpeg",
                        ),
                    },
                    "JPG",
                  ),
                  E(
                    "button",
                    {
                      class: "sm",
                      onclick: () => {
                        w.innerHTML = net(p, PR, true);
                      },
                    },
                    "Mostrar arcos en 0",
                  ),
                ),
              ),
              w,
            ),
          );
        });

        if (R.fail) c.append(E("div", { class: "msg" }, R.fail.msg));
        if (R.pr.length) c.append(graphsCard(R));
      }

      function dl(n, t, m) {
        const a = E("a", {
          href: URL.createObjectURL(new Blob([t], { type: m })),
          download: n,
        });
        document.body.append(a);
        a.click();
        a.remove();
      }
      function dlImg(svg, name, mime) {
        const m = svg.match(/viewBox="0 0 (\d+) (\d+)"/),
          s = 2,
          img = new Image();
        img.onload = () => {
          const c = E("canvas"),
            g = c.getContext("2d");
          c.width = m[1] * s;
          c.height = m[2] * s;
          g.fillStyle = "#fff";
          g.fillRect(0, 0, c.width, c.height);
          g.drawImage(img, 0, 0, c.width, c.height);
          c.toBlob(
            (b) => {
              const a = E("a", {
                href: URL.createObjectURL(b),
                download: name,
              });
              document.body.append(a);
              a.click();
              a.remove();
            },
            mime,
            0.95,
          );
        };
        img.onerror = () =>
          alert("No se pudo generar la imagen. Usa Descargar SVG.");
        img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
      }
      function csv() {
        let o = "";
        document.querySelectorAll("#rc .card").forEach((cd) => {
          o += cd.querySelector("h3").textContent + "\n";
          cd.querySelectorAll("table").forEach((tb) => {
            const h = tb.closest(".sc").previousElementSibling;
            if (h && (h.tagName == "H3" || h.tagName == "H4"))
              o += h.textContent + "\n";
            tb.querySelectorAll("tr").forEach((r) => {
              o +=
                [...r.children]
                  .map(
                    (x) =>
                      '"' +
                      (x.dataset.v ?? x.textContent.trim())
                        .toString()
                        .replace(/"/g, '""') +
                      '"',
                  )
                  .join(";") + "\n";
            });
            o += "\n";
          });
        });
        dl("resultados.csv", "\ufeff" + o, "text/csv");
      }

      /* ---------- gráficas ---------- */
      const PAL = [
        "#2563eb",
        "#f59e0b",
        "#059669",
        "#dc2626",
        "#7c3aed",
        "#475569",
        "#0284c7",
        "#d97706",
      ];
      const nice = (v) => {
        if (v <= 0) return 1;
        const p = Math.pow(10, Math.floor(Math.log10(v))),
          f = v / p;
        return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p;
      };
      function chart(type, title, cats, ser, o = {}) {
        const n = cats.length,
          k = ser.length,
          LG = 200,
          L = 76,
          Tp = 44,
          ph = 300,
          B = 96,
          f = o.f || fmt,
          gw = type == "bar" ? Math.max(44, k * 20 + 24) : 80,
          pw = Math.max(420, n * gw),
          W = L + pw + LG,
          H = Tp + ph + B;
        let mx = o.max || 0;
        cats.forEach((_, c) => {
          mx = Math.max(
            mx,
            type == "stack"
              ? sum(ser.map((s) => s.v[c]))
              : Math.max(0, ...ser.map((s) => s.v[c])),
          );
        });
        const step = nice(mx / 5),
          top = Math.max(step, Math.ceil(mx / step - 1e-9) * step),
          y = (v) => Tp + ph - (v / top) * ph,
          col = (i) => PAL[i % PAL.length];
        let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="system-ui,sans-serif" font-size="12"><rect width="${W}" height="${H}" fill="#fff"/><text x="${L}" y="24" font-size="15" font-weight="700" fill="#0f172a">${esc(title)}</text>`;
        for (let v = 0; v <= top + 1e-9; v += step)
          s += `<line x1="${L}" x2="${L + pw}" y1="${y(v)}" y2="${y(v)}" stroke="#e2e8f0"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end" fill="#64748b">${f(v)}</text>`;
        if (o.y)
          s += `<text transform="translate(16 ${Tp + ph / 2}) rotate(-90)" text-anchor="middle" fill="#64748b">${esc(o.y)}</text>`;
        cats.forEach((c, ci) => {
          const cx = L + (ci * pw) / n + pw / n / 2;
          s += `<text transform="translate(${cx} ${Tp + ph + 16}) rotate(-30)" text-anchor="end" fill="#0f172a">${esc(c.length > 26 ? c.slice(0, 25) + "…" : c)}</text>`;
          if (type == "bar") {
            const bw = Math.min(30, ((pw / n) * 0.8) / k);
            ser.forEach((se, si) => {
              const v = se.v[ci];
              s += `<rect x="${cx - (bw * k) / 2 + si * bw}" y="${y(v)}" width="${bw - 2}" height="${Tp + ph - y(v)}" rx="2" fill="${col(si)}"><title>${esc(se.n)}: ${f(v)}</title></rect>`;
            });
          } else if (type == "stack") {
            let a = 0;
            const bw = Math.min(64, (pw / n) * 0.6);
            ser.forEach((se, si) => {
              const v = se.v[ci];
              s += `<rect x="${cx - bw / 2}" y="${y(a + v)}" width="${bw}" height="${Math.max(0, y(a) - y(a + v))}" fill="${col(si)}"><title>${esc(se.n)}: ${f(v)}</title></rect>`;
              a += v;
            });
          }
        });
        if (type == "line")
          ser.forEach((se, si) => {
            const P = se.v.map((v, ci) => [
              L + (ci * pw) / n + pw / n / 2,
              y(v),
            ]);
            s +=
              `<polyline points="${P.map((q) => q.join(",")).join(" ")}" fill="none" stroke="${col(si)}" stroke-width="2.5"/>` +
              P.map(
                (q, ci) =>
                  `<circle cx="${q[0]}" cy="${q[1]}" r="4" fill="${col(si)}"><title>${esc(se.n)}: ${f(se.v[ci])}</title></circle>`,
              ).join("");
          });
        s += `<line x1="${L}" x2="${L + pw}" y1="${Tp + ph}" y2="${Tp + ph}" stroke="#0f172a"/>`;
        ser.forEach((se, si) => {
          s += `<rect x="${L + pw + 20}" y="${Tp + si * 20}" width="12" height="12" rx="2" fill="${col(si)}"/><text x="${L + pw + 38}" y="${Tp + si * 20 + 10}" fill="#0f172a">${esc(se.n.length > 24 ? se.n.slice(0, 23) + "…" : se.n)}</text>`;
        });
        return s + "</svg>";
      }

      function graphOpts(R) {
        const pr = R.pr,
          { T, M } = S,
          nm = (x) => S.prods[x.p],
          srcs = [];
        S.stages.forEach((st, i) =>
          st.src.forEach((s, j) => srcs.push([i, j, st.n + " · " + s.n])),
        );
        const U = (i, j, t) => {
            const H = Hh(i, j, t);
            return H > 0 ? (sum(pr.map((x) => x.hu[i][j][t])) / H) * 100 : 0;
          },
          pc = (v) => Math.round(v * 10) / 10 + "%";
        const cost = pr.map(costsOf),
          byT = (k) =>
            Array.from({ length: T }, (_, t) => sum(cost.map((c) => c[k][t])));
        return [
          [
            "util",
            "Uso de cada fuente por período",
            () =>
              chart(
                "bar",
                "Uso de cada fuente por período (% de horas)",
                srcs.map((q) => q[2]),
                Ts().map((tn, t) => ({
                  n: tn,
                  v: srcs.map(([i, j]) => U(i, j, t)),
                })),
                { max: 100, f: pc, y: "% de horas disponibles" },
              ),
          ],
          [
            "etapa",
            "Uso por etapa y producto",
            () =>
              chart(
                "stack",
                "Uso de las horas de cada etapa por producto (%)",
                S.stages.map((s) => s.n),
                pr.map((x) => ({
                  n: nm(x),
                  v: S.stages.map((st, i) => {
                    let H = 0,
                      u = 0;
                    st.src.forEach((s, j) =>
                      S.dias.forEach((_, t) => {
                        H += Hh(i, j, t);
                        u += x.hu[i][j][t];
                      }),
                    );
                    return H > 0 ? (u / H) * 100 : 0;
                  }),
                })),
                { max: 100, f: pc, y: "% de horas disponibles" },
              ),
          ],
          [
            "mix",
            "Reparto de producción entre fuentes",
            () => {
              const mj = Math.max(...S.stages.map((s) => s.src.length));
              return chart(
                "stack",
                "Reparto de la producción de cada etapa entre sus fuentes (%)",
                S.stages.map((s) => s.n),
                Array.from({ length: mj }, (_, j) => ({
                  n: "Fuente " + (j + 1),
                  v: S.stages.map((st, i) => {
                    const tot = sum(
                      pr.map((x) => sum(x.X[i].map((a) => sum(a)))),
                    );
                    return tot > 0 && st.src[j]
                      ? (sum(pr.map((x) => sum(x.X[i][j]))) / tot) * 100
                      : 0;
                  }),
                })),
                { max: 100, f: pc, y: "% de las unidades" },
              );
            },
          ],
          [
            "prod",
            "Producción vs demanda",
            () =>
              chart(
                "bar",
                "Producción de la etapa final vs demanda (todos los productos)",
                Ts(),
                [
                  {
                    n: "Producción final",
                    v: S.dias.map((_, t) =>
                      sum(pr.map((x) => sum(x.X[M - 1].map((a) => a[t])))),
                    ),
                  },
                  {
                    n: "Demanda",
                    v: S.dias.map((_, t) => sum(pr.map((x) => S.d[x.p][t]))),
                  },
                  {
                    n: "Inventario final",
                    v: S.dias.map((_, t) => sum(pr.map((x) => x.Q[t]))),
                  },
                ],
                { y: "unidades" },
              ),
          ],
          [
            "inv",
            "Inventarios y escasez",
            () =>
              chart(
                "line",
                "Inventarios y escasez por período (todos los productos)",
                Ts(),
                [
                  {
                    n: "Inventario intermedio",
                    v: S.dias.map((_, t) =>
                      sum(
                        pr.map((x) =>
                          sum(x.V.slice(0, M - 1).map((a) => a[t])),
                        ),
                      ),
                    ),
                  },
                  {
                    n: "Inventario final",
                    v: S.dias.map((_, t) => sum(pr.map((x) => x.Q[t]))),
                  },
                  {
                    n: "Escasez",
                    v: S.dias.map((_, t) => sum(pr.map((x) => x.W[t]))),
                  },
                ],
                { y: "unidades" },
              ),
          ],
          [
            "costos",
            "Costos por producto",
            () =>
              chart(
                "stack",
                "Composición del costo por producto ($)",
                pr.map(nm),
                CN.map(([k, l]) => ({ n: l, v: cost.map((c) => sum(c[k])) })),
                { y: "$" },
              ),
          ],
          [
            "costT",
            "Costos por período",
            () =>
              chart(
                "stack",
                "Costo por período ($)",
                Ts(),
                CN.map(([k, l]) => ({ n: l, v: byT(k) })),
                { y: "$" },
              ),
          ],
          [
            "stats",
            "Estadísticas de uso de recursos",
            () => {
              const rows = srcs.map(([i, j, l]) => {
                const u = Array.from({ length: T }, (_, t) => U(i, j, t)),
                  m = sum(u) / T,
                  sd = Math.sqrt(sum(u.map((v) => (v - m) ** 2)) / T),
                  idle = sum(
                    S.dias.map((_, t) =>
                      Math.max(
                        0,
                        Hh(i, j, t) - sum(pr.map((x) => x.hu[i][j][t])),
                      ),
                    ),
                  );
                return [
                  esc(l),
                  ...[m, sd, Math.min(...u), Math.max(...u)].map((v) => ({
                    h: v.toFixed(1) + "%",
                    v: +v.toFixed(2),
                  })),
                  {
                    h: String(u.filter((v) => v >= 95).length),
                    v: u.filter((v) => v >= 95).length,
                  },
                  { h: fmt(idle), v: idle },
                ];
              });
              return TB(
                [
                  "Etapa · Fuente",
                  "Uso medio",
                  "Desv. estándar",
                  "Mínimo",
                  "Máximo",
                  "Períodos ≥ 95%",
                  "Horas ociosas",
                ],
                rows,
              );
            },
          ],
        ];
      }

      function chNode(label, body) {
        const w = E("div", { class: "svgw" }),
          svg = typeof body === "string",
          row = E(
            "div",
            {
              class: "card-header",
              style: "border:none;padding:0;margin-bottom:8px",
            },
            E("h3", { style: "font-size:15px" }, label),
          );
        if (svg) {
          w.innerHTML = body;
          row.append(
            E(
              "div",
              { class: "toolbar-group" },
              E(
                "button",
                {
                  class: "sm",
                  onclick: () =>
                    dl(label + ".svg", w.innerHTML, "image/svg+xml"),
                },
                "SVG",
              ),
              E(
                "button",
                {
                  class: "sm",
                  onclick: () =>
                    dlImg(w.innerHTML, label + ".png", "image/png"),
                },
                "PNG",
              ),
              E(
                "button",
                {
                  class: "sm",
                  onclick: () =>
                    dlImg(w.innerHTML, label + ".jpg", "image/jpeg"),
                },
                "JPG",
              ),
            ),
          );
        } else w.append(body);
        return E("div", { class: "gc" }, row, w);
      }

      function graphsCard(R) {
        const out = E("div"),
          panel = E("div", { class: "row", style: "margin-top:12px" }),
          open = {};
        graphOpts(R).forEach(([k, l, f]) => {
          const b = E(
            "button",
            {
              class: "chip",
              onclick: () => {
                if (open[k]) {
                  open[k].remove();
                  delete open[k];
                  b.classList.remove("on");
                } else {
                  open[k] = chNode(l, f());
                  out.append(open[k]);
                  b.classList.add("on");
                }
              },
            },
            l,
          );
          panel.append(b);
        });
        return E(
          "div",
          { class: "card" },
          E(
            "div",
            { class: "card-header" },
            E(
              "div",
              { class: "card-title-wrap" },
              E("span", { class: "step-pill" }, "Analítica"),
              E("h3", {}, "Gráficas y Estadísticas de Utilización"),
            ),
          ),
          E(
            "p",
            { class: "note" },
            "Selecciona una o varias etiquetas para desplegar las gráficas comparativas:",
          ),
          panel,
          out,
        );
      }

      /* ---------- pestañas y botones ---------- */
      function tab(t) {
        document
          .querySelectorAll("nav button")
          .forEach((b) => b.classList.toggle("on", b.dataset.t == t));
        document
          .querySelectorAll("section")
          .forEach((s) => s.classList.toggle("on", s.id == t));
      }
      document
        .querySelectorAll("nav button")
        .forEach((b) => (b.onclick = () => tab(b.dataset.t)));
      $("#bSol").onclick = solve;
      $("#bCap").onclick = () => {
        const c = $("#cap");
        c.replaceChildren();
        S.prods.forEach((pn, p) =>
          c.append(E("h4", { class: "sub-title" }, pn), capTable(p)),
        );
      };
      $("#bEj").onclick = () => {
        S = EJ();
        fit();
        renderCfg();
        redraw();
      };
      $("#bEx").onclick = () =>
        dl("datos.json", JSON.stringify(S, null, 1), "application/json");
      $("#bIm").onclick = () => $("#fIm").click();
      $("#fIm").onchange = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        f.text().then((t) => {
          try {
            S = JSON.parse(t);
            fit();
            renderCfg();
            redraw();
          } catch (x) {
            alert("Archivo no válido");
          }
        });
      };
      fit();
      renderCfg();