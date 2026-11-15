/* Rose, Don't Melt, Good Luck and Birthday Cake: JIN2 (@jin_22ee), 2026.
 * Original JavaScript adaptations of the Python algorithms, personal use only.
 * See LICENSE-jin2-ascii. Loaded by jin2.js only for these four pieces.
 */
(() => {
    'use strict';
    const cache = new Map();
    window.KraJin2Scenes = {
        create(piece, helpers, baseURL) {
            if (!cache.has(piece))
                cache.set(
                    piece,
                    Promise.resolve()
                        .then(() => create(piece, helpers, baseURL))
                        .catch((e) => {
                            cache.delete(piece);
                            throw e;
                        }),
                );
            return cache.get(piece);
        },
    };

    function create(piece, { AT, FILL, clip, smooth, mod, random, TAU }, baseURL) {
        const sq = (x) => x * x;
        const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
        const cross = (a, b) => [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0],
        ];
        const norm = (a) => {
            const d = Math.hypot(...a) || 1;
            return a.map((x) => x / d);
        };
        const add = (a, b) => a.map((x, i) => x + b[i]);
        const sub = (a, b) => a.map((x, i) => x - b[i]);
        const mul = (a, k) => a.map((x) => x * k);
        const rot = (p, a) => [
            Math.cos(a) * p[0] + Math.sin(a) * p[2],
            p[1],
            -Math.sin(a) * p[0] + Math.cos(a) * p[2],
        ];
        const field = (seed, n, width) => {
            const rng = random(seed);
            return Array.from({ length: n }, () => Array.from({ length: width }, rng));
        };
        const outline = (gx, gy) =>
            AT[
                Math.abs(gx) + Math.abs(gy) === 0
                    ? '+'
                    : Math.abs(gx) > 2 * Math.abs(gy)
                      ? '|'
                      : Math.abs(gy) > 2 * Math.abs(gx)
                        ? gy > 0
                            ? '_'
                            : '-'
                        : gx * gy > 0
                          ? '/'
                          : '\\'
            ];
        const config = (colors, frame, loop = 20, fade = 0.4) => ({
            colors,
            frame,
            loop,
            fade,
            cw: 9,
            ch: 14,
            font: 15,
        });
        function camera(eye, target, F) {
            const forward = norm(sub(target, eye)),
                right = norm(cross(forward, [0, 1, 0])),
                up = cross(right, forward);
            return {
                view: mul(forward, -1),
                project(p, g, rounded = true) {
                    const dx = p[0] - eye[0],
                        dy = p[1] - eye[1],
                        dz = p[2] - eye[2],
                        z = dx * forward[0] + dy * forward[1] + dz * forward[2],
                        zz = Math.max(z, 0.2);
                    const x =
                            (0.5 + ((dx * right[0] + dy * right[1] + dz * right[2]) / zz) * F * 0.5) * g.cols,
                        y =
                            (0.5 - ((dx * up[0] + dy * up[1] + dz * up[2]) / zz) * F * 0.5 * g.aspect) *
                            g.rows;
                    return [rounded ? Math.trunc(x) : x, rounded ? Math.trunc(y) : y, z];
                },
            };
        }
        function buffers(g) {
            if (!g.part) {
                g.part = new Int16Array(g.char.length);
                g.depth = new Float64Array(g.char.length);
                g.particleDepth = new Float64Array(g.char.length);
                g.hash3 = new Uint16Array(g.char.length);
                for (let i = 0; i < g.char.length; i++)
                    g.hash3[i] = (Math.floor(i / g.cols) * 7919 + (i % g.cols) * 104729) % 9973;
            }
            g.part.fill(-1);
            g.depth.fill(99);
            g.particleDepth.fill(99);
            g.char.fill(0);
            g.lum.fill(0);
            g.tag.fill(0);
        }
        function point(g, cam, p, shade, tag, part) {
            if (shade <= 0) return;
            const [x, y, z] = cam.project(p, g);
            if (x < 0 || x >= g.cols || y < 0 || y >= g.rows || z <= 0.2) return;
            const i = y * g.cols + x;
            if (z <= g.depth[i]) {
                g.part[i] = part;
                g.depth[i] = z;
                g.lum[i] = shade;
                g.tag[i] = tag;
            }
        }
        function raster(g, t, kind) {
            let count = 0;
            for (let i = 0; i < g.char.length; i++) {
                if (g.part[i] < 0) continue;
                count++;
                const y = Math.floor(i / g.cols),
                    x = i % g.cols;
                let gx = 0,
                    gy = 0,
                    edge = false;
                for (let dy = -1; dy <= 1; dy++)
                    for (let dx = -1; dx <= 1; dx++) {
                        if (!dx && !dy) continue;
                        const j = (y + dy) * g.cols + x + dx;
                        const out =
                            x + dx < 0 ||
                            x + dx >= g.cols ||
                            y + dy < 0 ||
                            y + dy >= g.rows ||
                            g.part[j] < 0 ||
                            (g.part[j] !== g.part[i] &&
                                g.depth[j] > g.depth[i] + (kind === 'snowman' ? 0.02 : 0.035));
                        if (out) {
                            gx += dx;
                            gy += dy;
                            if (!dx || !dy) edge = true;
                        }
                    }
                const h = g.hash3[i],
                    lum = g.lum[i],
                    snow = kind === 'snowman';
                let letter =
                    FILL[clip(Math.trunc(lum * (snow ? 4 : 3.2)), 0, 3)][
                        mod(h + Math.trunc(t * (snow ? 5 : 4) + (h % 11)), 12)
                    ];
                if (snow && g.part[i] === 25) letter = FILL[3][h % 12];
                g.char[i] = edge ? outline(gx, gy) : letter;
                g.lum[i] = snow
                    ? edge
                        ? 0.8 + 0.2 * lum
                        : g.part[i] === 25
                          ? 0.62
                          : 0.3 + 0.42 * lum
                    : kind === 'rose'
                      ? edge
                          ? Math.max(0.85, lum)
                          : clip(0.45 + (0.55 * lum) / 0.9, 0.45, 1)
                      : edge
                        ? Math.max(0.5, lum)
                        : clip(lum);
                if (kind === 'rose' && g.tag[i] === 5) g.char[i] = AT['*'];
            }
            return count;
        }
        function particle(g, cam, p, shade, tag, kind) {
            if (shade <= (kind === 'snowman' ? 0.03 : 0.02)) return null;
            const [x, y, z] = cam.project(p, g);
            if (x < 0 || x >= g.cols || y < 0 || y >= g.rows || z <= 0.2) return null;
            const i = y * g.cols + x;
            if ((g.part[i] >= 0 && (kind === 'rose' || g.depth[i] < z)) || g.particleDepth[i] < z)
                return null;
            g.particleDepth[i] = z;
            g.tag[i] = tag;
            if (kind === 'snowman') {
                g.char[i] =
                    tag === 5
                        ? AT['~']
                        : tag === 3
                          ? AT[shade > 0.75 ? '*' : shade > 0.5 ? '+' : '.']
                          : FILL[2][mod(y * 31 + x * 17 + Math.trunc(tForParticles * 12), 12)];
                g.lum[i] = tag === 5 ? 0.6 : shade;
            } else {
                g.char[i] =
                    tag === 9
                        ? FILL[clip(Math.trunc(shade * 6), 0, 1)][(y * 31 + x) % 12]
                        : AT[shade > 0.7 ? '*' : shade > 0.35 ? '+' : '.'];
                g.lum[i] = clip(shade);
            }
            return [y, x, shade, tag, z];
        }
        let tForParticles = 0;
        function rays(g, cy, cx, reach, tag, strength = 1) {
            for (let d = 1; d <= reach; d++) {
                const fade = (1 - d / (reach + 1)) * strength;
                const dirs = [
                    [0, 2, '-'],
                    [0, -2, '-'],
                    [1, 0, '|'],
                    [-1, 0, '|'],
                ];
                if (d <= Math.floor(reach / 2))
                    dirs.push([1, 1, '\\'], [-1, -1, '\\'], [1, -1, '/'], [-1, 1, '/']);
                for (const [dy, dx, ch] of dirs) {
                    const y = cy + dy * d,
                        x = cx + dx * d,
                        v = fade * (dy && dx ? 0.7 : 1);
                    if (y >= 0 && y < g.rows && x >= 0 && x < g.cols) {
                        const i = y * g.cols + x;
                        if (g.lum[i] < v) {
                            g.char[i] = AT[ch];
                            g.lum[i] = v;
                            g.tag[i] = tag;
                        }
                    }
                }
            }
            if (cy >= 0 && cy < g.rows && cx >= 0 && cx < g.cols) {
                g.char[cy * g.cols + cx] = AT['*'];
                g.lum[cy * g.cols + cx] = 1;
            }
        }
        function normals(points, cols, rows, outward) {
            const result = new Float64Array(points.length);
            for (let row = 0; row < rows; row++)
                for (let col = 0; col < cols; col++) {
                    const i = (row * cols + col) * 3;
                    const l = (row * cols + Math.max(0, col - 1)) * 3,
                        r = (row * cols + Math.min(cols - 1, col + 1)) * 3;
                    const u = (Math.max(0, row - 1) * cols + col) * 3,
                        d = (Math.min(rows - 1, row + 1) * cols + col) * 3;
                    const ud = col > 0 && col < cols - 1 ? 2 : 1,
                        vd = row > 0 && row < rows - 1 ? 2 : 1;
                    const ux = (points[r] - points[l]) / ud,
                        uy = (points[r + 1] - points[l + 1]) / ud,
                        uz = (points[r + 2] - points[l + 2]) / ud;
                    const vx = (points[d] - points[u]) / vd,
                        vy = (points[d + 1] - points[u + 1]) / vd,
                        vz = (points[d + 2] - points[u + 2]) / vd;
                    const nx = uy * vz - uz * vy,
                        ny = uz * vx - ux * vz,
                        nz = ux * vy - uy * vx;
                    const len = Math.hypot(nx, ny, nz) + 1e-9,
                        out = outward(row, col),
                        sign = Math.sign(nx * out[0] + ny * out[1] + nz * out[2] + 1e-9);
                    result[i] = (nx / len) * sign;
                    result[i + 1] = (ny / len) * sign;
                    result[i + 2] = (nz / len) * sign;
                }
            return result;
        }

        if (piece === 'snowman') return snowman();
        if (piece === 'rose') return rose();
        if (piece === 'birthday') return birthday();
        if (piece === 'goodluck') return goodluck();
        throw new Error('Unknown JIN2 scene.');

        function snowman() {
            const thuds = [9.6, 11.4, 11.7, 13.5, 15, 15.2, 16.8, 18.1, 18.4, 19.6, 20.6, 20.8];
            const marks = [
                [
                    [5, 9],
                    [5, 7],
                    [5, 5],
                ],
                [
                    [4, 7],
                    [4, 5],
                    [4, 3],
                ],
                [
                    [2, 5],
                    [5, 4],
                    [1, 3],
                    [2, 2],
                    [3, 1],
                    [4, 1],
                    [5, 2],
                    [6, 2],
                ],
            ];
            const body = [],
                squares = [],
                groups = new Map();
            for (let b = 0; b < 3; b++) {
                const n = [12, 10, 8][b],
                    cy = [0.3, 0.85, 1.3][b],
                    h = (n * 0.05) / 2,
                    per = n * 3;
                for (const [cx, yy] of marks[b]) {
                    const x = -h + cx * 0.05,
                        y = cy - h + yy * 0.05;
                    squares.push([
                        [x, y, h],
                        [x + 0.05, y, h],
                        [x + 0.05, y + 0.05, h],
                        [x, y + 0.05, h],
                    ]);
                }
                for (let axis = 0; axis < 3; axis++)
                    for (const sign of [-1, 1])
                        for (let v = 0; v < per; v++)
                            for (let u = 0; u < per; u++) {
                                const p = [0, 0, 0],
                                    normal = [0, 0, 0];
                                p[axis] = sign * h;
                                p[(axis + 1) % 3] = ((u + 0.5) / per) * 2 * h - h;
                                p[(axis + 2) % 3] = ((v + 0.5) / per) * 2 * h - h;
                                normal[axis] = sign;
                                const vox = p.map((x) => clip(Math.trunc((x + h) / 0.05), 0, n - 1));
                                p[1] += cy;
                                const id = b * 1000 + vox[0] * 100 + vox[1] * 10 + vox[2];
                                if (!groups.has(id))
                                    groups.set(id, { sum: [0, 0, 0], count: 0, when: Infinity });
                                const group = groups.get(id);
                                for (let k = 0; k < 3; k++) group.sum[k] += p[k];
                                group.count++;
                                body.push({ p, normal, part: b * 10 + axis * 2 + (sign > 0), group });
                            }
            }
            const ordered = [...groups].sort((a, b) => a[0] - b[0]).map((x) => x[1]);
            for (const g of ordered) {
                g.center = mul(g.sum, 1 / g.count);
                g.free = !(g.center[2] > 0.17 && Math.abs(g.center[0]) < 0.2);
            }
            const rng = random(3);
            for (let i = 0; i < thuds.length; i++) {
                let best = -Infinity,
                    seed;
                for (const g of ordered) {
                    const v = mod(g.center[1], 0.48) + (i % 2 ? -1 : 1) * g.center[0] * 0.8 + rng() * 0.35;
                    if (g.free && v > best) {
                        best = v;
                        seed = g;
                    }
                }
                const reach = 0.09 + rng() * 0.04;
                for (const g of ordered)
                    if (g.free && Math.hypot(...sub(g.center, seed.center)) < reach) {
                        g.when = thuds[i];
                        g.free = false;
                    }
            }
            const rv = random(9);
            ordered.forEach((g) => (g.rv = [rv(), rv(), rv()]));
            const gather = random(1),
                light = norm([-0.45, 0.7, 0.55]);
            body.forEach((b, i) => {
                b.rand = [gather(), gather(), gather()];
                b.flyer = i % 10 === 0;
                b.shade = 0.25 + 0.75 * clip(dot(b.normal, light));
            });
            const flakes = field(5, 420, 4),
                twitches = [3.9, 4.3, 6.2, 10.4, 14.1, 17.5, 21];
            const yaw = 0.42,
                pitch = 0.14,
                dist = 3.46741,
                target = [0, 0.84, 0];
            const cam = camera(
                add(
                    target,
                    mul(
                        [Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)],
                        dist,
                    ),
                ),
                target,
                3.25,
            );
            let holes;
            function faceMask(g) {
                const quads = squares.map((q) => q.map((p) => cam.project(p, g, false))),
                    widths = quads.map((q) => Math.abs(q[1][0] - q[0][0])).sort((a, b) => a - b);
                const w = Math.max(2, Math.round(widths[Math.floor(widths.length / 2)] * 1.3)),
                    h = Math.max(1, Math.round((w * g.aspect * g.rows) / g.cols));
                const mask = new Uint8Array(g.char.length);
                for (const q of quads) {
                    const cx = q.reduce((s, p) => s + p[0], 0) / 4,
                        cy = q.reduce((s, p) => s + p[1], 0) / 4,
                        x0 = Math.round(cx - w / 2),
                        y0 = Math.round(cy - h / 2);
                    for (let y = Math.max(0, y0); y < Math.min(g.rows, y0 + h); y++)
                        for (let x = Math.max(0, x0); x < Math.min(g.cols, x0 + w); x++)
                            mask[y * g.cols + x] = 1;
                }
                return mask;
            }
            return config(
                [
                    [226, 236, 255],
                    [96, 112, 150],
                    [176, 126, 86],
                    [206, 222, 255],
                    [118, 132, 168],
                    [150, 178, 236],
                    [236, 242, 255],
                ],
                (g, t) => {
                    buffers(g);
                    tForParticles = t;
                    const melt = thuds.filter((x) => x < t).length / thuds.length,
                        particles = [];
                    for (const b of body) {
                        const rest = [...b.p],
                            spread = 1 + 0.1 * melt * clip(1 - rest[1] / 0.4);
                        rest[0] *= spread;
                        rest[2] *= spread;
                        const rr = b.rand,
                            k = smooth((t - 0.2 - rest[1] * 1.1 - rr[0] * 0.6) / 0.9);
                        let p = add(
                            rest,
                            mul([Math.cos(rr[1] * TAU), rr[2], Math.sin(rr[1] * TAU)], 0.7 * sq(1 - k)),
                        );
                        const gone = t >= b.group.when;
                        let tag = 0;
                        if (gone) {
                            const dt = Math.max(t - b.group.when, 0),
                                rv = b.group.rv,
                                land = Math.sqrt((2 * Math.max(rest[1], 0.01)) / 9.8),
                                fall = Math.min(dt, land),
                                tb = Math.max(dt - land, 0);
                            p = [
                                rest[0] + Math.sign(rest[0] + 1e-6) * 0.08 * fall,
                                rest[1] - 0.5 * 9.8 * sq(fall),
                                rest[2] + 0.04 * fall,
                            ];
                            const h1 = 0.06 + 0.07 * rv[0],
                                d1 = 2 * Math.sqrt((2 * h1) / 9.8),
                                d2 = d1 * 0.55;
                            const hop =
                                tb < d1
                                    ? 4 * h1 * (tb / d1) * (1 - tb / d1)
                                    : tb < d1 + d2
                                      ? 4 * h1 * 0.3 * ((tb - d1) / d2) * (1 - (tb - d1) / d2)
                                      : 0;
                            const skid = (0.1 + 0.22 * rv[2]) * (1 - Math.exp(-tb * 3.5));
                            if (tb > 0) {
                                p[0] += Math.cos(rv[1] * TAU) * skid;
                                p[2] += Math.sin(rv[1] * TAU) * skid;
                                p[1] = 0.02 + hop;
                            }
                            const meltedIn = smooth((tb - d1 - d2) / 1.2);
                            if (tb > d1 + d2) p[1] = 0.02 * (1 - meltedIn) + 0.004;
                            tag = tb > d1 + d2 && meltedIn > 0.5 ? 5 : 6;
                        }
                        const shade = k < 0.95 ? (b.flyer ? b.shade * (0.3 + 0.7 * k) : 0) : b.shade;
                        if (gone || k < 0.95) particles.push([p, shade, tag]);
                        else if (shade > 0) point(g, cam, p, shade, tag, b.part);
                    }
                    const twitch = twitches.reduce((s, c) => s + Math.exp(-sq((t - c) / 0.12)), 0),
                        sag = 1 - 0.06 * melt,
                        droop = 0.1 * melt;
                    for (const [a, b] of [
                        [
                            [-0.25, 0.84 * sag, 0],
                            [-0.56, (0.64 - droop) * sag, 0.04],
                        ],
                        [
                            [0.25, 0.98 * sag, 0],
                            [0.52, (0.58 + 0.08 * twitch - droop) * sag, 0.04],
                        ],
                    ])
                        for (let j = 0; j < 220; j++)
                            for (const dy of [0, 0.012]) {
                                const p = add(a, mul(sub(b, a), j / 219));
                                p[1] += dy;
                                point(g, cam, p, 0.85 * smooth(t - 1.8), 2, 70);
                            }
                    const count = raster(g, t, 'snowman');
                    if (!holes) holes = faceMask(g);
                    const visibleHoles = new Uint8Array(holes.length);
                    for (let i = 0; i < holes.length; i++)
                        if (g.part[i] >= 0 && holes[i]) {
                            visibleHoles[i] = 1;
                            g.char[i] = 0;
                            g.lum[i] = 0;
                        }
                    for (let i = 0; i < holes.length; i++)
                        if (g.part[i] >= 0 && !visibleHoles[i]) {
                            const x = i % g.cols,
                                y = Math.floor(i / g.cols);
                            if (
                                (x > 0 && visibleHoles[i - 1]) ||
                                (x + 1 < g.cols && visibleHoles[i + 1]) ||
                                (y > 0 && visibleHoles[i - g.cols]) ||
                                (y + 1 < g.rows && visibleHoles[i + g.cols])
                            )
                                g.lum[i] = 1;
                        }
                    for (const f of flakes)
                        particles.push([
                            [
                                f[0] * 5 - 2.5 + 0.12 * Math.sin(t * 0.8 + f[3] * TAU),
                                mod(f[1] * 3.2 - t * (0.14 + 0.18 * f[2]), 3.2),
                                f[2] * 4.5 - 3,
                            ],
                            (0.3 + 0.7 * f[2]) * smooth(t / 2),
                            3,
                        ]);
                    for (const [p, s, tag] of particles) particle(g, cam, p, s, tag, 'snowman');
                    const temperature = -6 + 9 * smooth((t - 8) / 14);
                    return {
                        count,
                        hud: `temp ${temperature < 0 ? '-' : '+'}${Math.abs(temperature).toFixed(1).padStart(4, '0')}°C   melted ${(melt * 100).toFixed(0).padStart(3)}%`,
                    };
                },
                22,
            );
        }

        function rose() {
            const headY = 0.22,
                floor = -1.22,
                NT = 1300,
                NX = 40,
                petalCount = NT * NX;
            const stemCurve = (s) => [
                0.045 * Math.sin(s * 3.1 + 0.4) - 0.02,
                -1.15 + s * (headY + 1.15),
                0.02 * Math.sin(s * 2),
            ];
            const stem = [],
                leaves = [];
            for (let a = 0; a < 14; a++)
                for (let j = 0; j < 260; j++) {
                    const s = j / 259,
                        phi = (a * TAU) / 14,
                        n = [Math.cos(phi), 0, Math.sin(phi)];
                    stem.push({
                        p: add(stemCurve(s), mul(n, 0.026 + 0.006 * (1 - s))),
                        n,
                        order: s,
                        tag: 0,
                        part: 0,
                    });
                }
            for (const [at, side, length, lift, twist, part] of [
                [0.32, -1, 0.42, 0.35, 1, 1],
                [0.55, 1, 0.36, 0.45, -1, 2],
            ]) {
                const base = stemCurve(at),
                    d = norm([side * Math.cos(lift), Math.sin(lift), 0.25 * twist]),
                    wide = norm(cross(d, [0, 0, 1])),
                    up = cross(wide, d),
                    p = new Float64Array(25 * 70 * 3);
                for (let row = 0; row < 25; row++)
                    for (let col = 0; col < 70; col++) {
                        const s = col / 69,
                            w = -1 + row / 12,
                            hw = (0.15 * Math.pow(Math.sin(Math.PI * s), 0.75) * length) / 0.42;
                        const point = add(
                            add(add(base, mul(d, 0.07 + s * length)), mul(wide, w * hw)),
                            mul(up, 0.05 * Math.abs(w) - 0.1 * sq(s)),
                        );
                        p.set(point, (row * 70 + col) * 3);
                    }
                const n = normals(p, 70, 25, () => up);
                for (let i = 0; i < 25 * 70; i++)
                    leaves.push({
                        p: Array.from(p.subarray(i * 3, i * 3 + 3)),
                        n: Array.from(n.subarray(i * 3, i * 3 + 3)),
                        order: at + 0.05 + ((i % 70) / 69) * 0.25,
                        tag: 1,
                        part,
                    });
            }
            const th = Float64Array.from(
                { length: NT },
                (_, i) => 2.2 * Math.PI + (i / (NT - 1)) * 17.8 * Math.PI,
            );
            const sj = Float64Array.from(th, (_, i) => 1 - i / (NT - 1)),
                pj = Int16Array.from(th, (x) => Math.floor((3.6 * x) / TAU) - 3);
            function petals(op) {
                const p = new Float64Array(petalCount * 3),
                    blend = smooth(op / 0.6),
                    A = 1.6 + 4 * op;
                for (let j = 0; j < NT; j++) {
                    const theta = th[j],
                        phi = (Math.PI / 2) * Math.exp(-theta / (A * Math.PI));
                    const shape = 1 - 0.5 * sq(1.25 * sq(1 - mod(3.6 * theta, TAU) / Math.PI) - 0.25);
                    for (let row = 0; row < NX; row++) {
                        const v = row / (NX - 1),
                            yy = 1.95653 * sq(v) * sq(1.27689 * v - 1) * Math.sin(phi);
                        const r = shape * (v * Math.sin(phi) + yy * Math.cos(phi));
                        const budR =
                            ((0.17 * Math.pow(v, 0.7) * Math.pow(1 - v, 0.75)) / 0.367) *
                                (1 - 0.3 * (1 - sj[j])) +
                            0.003;
                        const i = (row * NT + j) * 3;
                        p[i] =
                            budR * Math.sin(theta) * (1 - blend) +
                            r * Math.sin(theta) * 0.8 * (1.05 - 0.05 * op) * blend;
                        p[i + 1] =
                            (headY + 0.03 + 0.52 * v * (1 - 0.06 * (1 - sj[j]))) * (1 - blend) +
                            (shape * (v * Math.cos(phi) - yy * Math.sin(phi)) * 0.8 * (0.84 + 0.16 * op) +
                                headY) *
                                blend;
                        p[i + 2] =
                            budR * Math.cos(theta) * (1 - blend) +
                            r * Math.cos(theta) * 0.8 * (1.05 - 0.05 * op) * blend;
                    }
                }
                return p;
            }
            const fullyOpen = petals(1),
                dropCandidates = [];
            for (let row = 0; row < NX; row++)
                for (let j = 0; j < NT; j++)
                    if (sj[j] > 0.7 && row / (NX - 1) > 0.82) dropCandidates.push(row * NT + j);
            dropCandidates.sort((a, b) => fullyOpen[a * 3 + 1] - fullyOpen[b * 3 + 1]);
            const dropAt = [0, 67, 134, 201].map((i) => dropCandidates[i]);
            const sparkField = field(13, 1600, 5),
                glitter = field(21, 700, 5),
                dew = field(31, 40, 2),
                splash = field(51, 8, 2);
            const outer = [];
            for (let i = 0; i < petalCount; i++) if (sj[i % NT] > 0.55) outer.push(i);
            const cam = camera([0, 1.75, 4], [0, -0.05, 0], 2.9),
                key = norm([-0.35, 0.85, 0.65]),
                halfKey = norm(add(key, cam.view));
            const sway = (t) => 0.22 * Math.sin(Math.max(t - 7, 0) * 0.35) * smooth((t - 7) / 4);
            const colors = [
                [70, 214, 96],
                [52, 196, 84],
                [80, 206, 100],
                [255, 34, 64],
                [255, 120, 146],
                [255, 255, 255],
                [255, 176, 204],
                [188, 220, 255],
                [255, 214, 150],
                [140, 60, 76],
            ];
            let cachedOpen = NaN,
                cachedPetals,
                cachedNormals;
            return config(
                colors,
                (g, t) => {
                    buffers(g);
                    const u = clip((t - 5.5) / 9),
                        op = u * (2 - u) * 0.55 + sq(u) * (3 - 2 * u) * 0.45,
                        yaw = sway(t),
                        vel = (sway(t + 0.05) - sway(t - 0.05)) / 0.1;
                    if (op !== cachedOpen) {
                        cachedPetals = petals(op);
                        cachedNormals = normals(cachedPetals, NT, NX, (_, j) => [
                            Math.sin(th[j]),
                            0.2,
                            Math.cos(th[j]),
                        ]);
                        cachedOpen = op;
                    }
                    const petalP = cachedPetals,
                        petalN = cachedNormals;
                    const parts = [...stem, ...leaves],
                        particles = [],
                        tipPoints = [],
                        flower = new Float64Array(petalP.length);
                    const rim = norm([Math.cos(t * 0.8), 0.4, Math.sin(t * 0.8)]),
                        halfRim = norm(add(rim, cam.view));
                    for (let k = 0; k < 5; k++)
                        for (let row = 0; row < 9; row++)
                            for (let col = 0; col < 34; col++) {
                                const s = col / 33,
                                    w = -1 + row / 4,
                                    beta = 1.05 + 0.35 * op + (0.55 + 0.75 * op) * s,
                                    L = 0.36 - 0.06 * op;
                                const r = 0.045 + L * s * Math.sin(beta),
                                    a =
                                        (k * TAU) / 5 +
                                        0.3 +
                                        (w * 0.1 * Math.pow(1 - s, 1.3)) / Math.max(r / 0.2, 0.25);
                                parts.push({
                                    p: [
                                        Math.cos(a) * r,
                                        headY + 0.02 + L * s * Math.cos(beta),
                                        Math.sin(a) * r,
                                    ],
                                    n: norm([
                                        Math.cos(a) * Math.cos(beta),
                                        -Math.sin(beta),
                                        Math.sin(a) * Math.cos(beta),
                                    ]),
                                    order: 1 + 0.1 * s,
                                    tag: 2,
                                    part: 3,
                                });
                            }
                    const dewMap = new Map();
                    if (op > 0.85)
                        for (const d of dew)
                            dewMap.set(
                                outer[Math.floor(d[0] * outer.length)],
                                Math.pow(clip(Math.sin(t * 3 + d[1] * 30)), 8),
                            );
                    const head = ((t - 0.3) / (5.4 - 0.3)) * 1.66,
                        cyaw = Math.cos(yaw),
                        syaw = Math.sin(yaw);
                    const petalPoint = [0, 0, 0],
                        petalNormal = [0, 0, 0];
                    const emit = (p, n, order, tag, part, depth, petalIndex = -1) => {
                        const reveal = smooth((head - order) / (order >= 1 ? 0.09 : 0.05)),
                            tip = Math.abs(head - order) < 0.03 && order < 1;
                        p = [cyaw * p[0] + syaw * p[2], p[1], -syaw * p[0] + cyaw * p[2]];
                        const nx = cyaw * n[0] + syaw * n[2],
                            ny = n[1],
                            nz = -syaw * n[0] + cyaw * n[2];
                        if (petalIndex >= 0) flower.set(p, petalIndex * 3);
                        if (tip) tipPoints.push(p);
                        const spec =
                            Math.pow(clip(nx * halfKey[0] + ny * halfKey[1] + nz * halfKey[2]), 24) +
                            0.7 * Math.pow(clip(nx * halfRim[0] + ny * halfRim[1] + nz * halfRim[2]), 18);
                        let shade =
                            (0.62 +
                                0.6 * clip(nx * key[0] + ny * key[1] + nz * key[2]) +
                                (tag >= 3 ? 0.35 : 0.25) * spec) *
                            depth;
                        const tw = dewMap.get(petalIndex);
                        if (tw !== undefined) {
                            if (tw > 0.4) tag = 5;
                            shade = Math.max(shade, 0.6 + 0.6 * tw);
                        }
                        if (reveal < 0.96) {
                            shade = tip ? 1.2 : 0;
                            tag = tip ? 5 : 8;
                            if (shade > 0.02) particles.push([p, shade, tag]);
                        } else point(g, cam, p, shade, tag, part);
                        particles.push([
                            [p[0], 2 * floor - p[1], p[2]],
                            reveal >= 0.96 ? 0.18 * clip(shade, 0, 1.2) : 0,
                            9,
                        ]);
                    };
                    for (const b of parts) emit(b.p, b.n, b.order, b.tag, b.part, 1);
                    for (let row = 0; row < NX; row++)
                        for (let j = 0; j < NT; j++) {
                            const i = row * NT + j,
                                v = row / (NX - 1),
                                loose = clip((sj[j] - 0.45) / 0.55) * sq(v) * op;
                            const p = petalPoint;
                            for (let k = 0; k < 3; k++) {
                                p[k] = petalP[i * 3 + k];
                                petalNormal[k] = petalN[i * 3 + k];
                            }
                            p[0] += -0.1 * vel * loose;
                            p[1] +=
                                (0.01 * Math.sin(t * 2.4 + pj[j] * 1.7) * smooth((t - 8) / 2) -
                                    0.006 * Math.abs(vel)) *
                                loose;
                            emit(
                                p,
                                petalNormal,
                                1.1 + v * 0.42 + sj[j] * 0.1,
                                v > 0.93 ? 4 : 3,
                                10 + pj[j],
                                0.74 + 0.26 * sj[j],
                                i,
                            );
                        }
                    const count = raster(g, t, 'rose'),
                        sparkle = [];
                    for (let i = 0; i < g.char.length; i++)
                        if (g.part[i] >= 0 && g.tag[i] === 5)
                            sparkle.push([i, g.lum[i] + (g.hash3[i] % 7) * 0.01]);
                    sparkle.sort((a, b) => b[1] - a[1]);
                    if (tipPoints.length && t <= 5.6)
                        for (const f of sparkField) {
                            const age = mod(t * 1.7 + f[1], 1),
                                a = f[2] * TAU,
                                v = [
                                    Math.cos(a) * (0.3 + 0.5 * f[3]),
                                    0.3 + 0.7 * f[4],
                                    Math.sin(a) * (0.3 + 0.5 * f[3]),
                                ];
                            const p = add(tipPoints[Math.floor(f[0] * tipPoints.length)], mul(v, age * 0.55));
                            p[1] -= 0.5 * 1.4 * sq(age * 0.55);
                            particles.push([
                                p,
                                Math.pow(1 - age, 1.4) * (0.6 + 0.4 * Math.sin(age * 25 + a)),
                                f[3] > 0.6 ? 5 : 8,
                            ]);
                        }
                    for (const f of glitter) {
                        const a = f[0] * TAU + t * (0.05 + 0.08 * f[1]),
                            r = 0.55 + 1.6 * Math.pow(f[2], 0.7),
                            y = -1.1 + 2.3 * f[3] + 0.05 * Math.sin(t * 0.6 + f[4] * TAU);
                        const tw = Math.pow(clip(Math.sin(t * (1.2 + 2.5 * f[1]) + f[4] * 40)), 6),
                            glow = (0.1 + 0.85 * tw) * smooth((t - 1 - f[3] * 3) / 1.5);
                        particles.push([
                            [Math.cos(a) * r, y, Math.sin(a) * r * 0.6 - 0.35],
                            glow,
                            f[4] < 0.12 ? 7 : f[4] < 0.3 ? 6 : 5,
                        ]);
                    }
                    for (let j = 0; j < 4; j++) {
                        const tau = t - [13.4, 14.9, 16.2, 17.4][j];
                        if (tau < 0) continue;
                        const start = Array.from(flower.subarray(dropAt[j] * 3, dropAt[j] * 3 + 3));
                        start[1] -= 0.012;
                        start[2] += 0.01;
                        if (tau < 1.4) {
                            const size = 0.006 + (0.012 * tau) / 1.4;
                            for (const d of [
                                [0, 0, 0],
                                [size, 0, 0],
                                [-size, 0, 0],
                                [0, -size, 0],
                                [0, -2 * size, 0],
                            ])
                                particles.push([add(start, d), 0.8 + (0.5 * tau) / 1.4, 7]);
                            continue;
                        }
                        const dt = tau - 1.4,
                            y = start[1] - 0.5 * 1.7 * sq(dt);
                        if (y > floor + 0.02) {
                            for (const [i, back] of [0, 0.02, 0.04, 0.07, 0.1].entries())
                                particles.push([
                                    [start[0], y + back * Math.min(1.7 * dt, 1.2), start[2]],
                                    1.3 - 0.22 * i,
                                    7,
                                ]);
                        } else {
                            const w = dt - Math.sqrt((2 * (start[1] - floor)) / 1.7);
                            if (w <= 0.7)
                                for (const f of splash) {
                                    const a = f[0] * TAU,
                                        sp = 0.25 + 0.35 * f[1],
                                        py = floor + 0.02 + 0.9 * sp * w - 0.5 * 1.7 * sq(w);
                                    if (py >= floor)
                                        particles.push([
                                            [
                                                start[0] + Math.cos(a) * sp * w,
                                                py,
                                                start[2] + Math.sin(a) * sp * w * 0.5,
                                            ],
                                            0.9 * (1 - w / 0.7),
                                            7,
                                        ]);
                                }
                        }
                    }
                    const visible = [];
                    for (const [p, s, tag] of particles) {
                        const v = particle(g, cam, p, s, tag, 'rose');
                        if (v) visible.push(v);
                    }
                    for (let n = 0; n < Math.min(4, sparkle.length); n++) {
                        const i = sparkle[n][0];
                        rays(
                            g,
                            Math.floor(i / g.cols),
                            i % g.cols,
                            Math.trunc(4 + 6 * (0.5 + 0.5 * Math.sin(t * 7 + n * 1.7))),
                            5,
                        );
                    }
                    visible.sort((a, b) => b[4] - a[4]);
                    for (const [y, x, s, tag] of visible) if (tag === 7 && s > 1) rays(g, y, x, 5, 5);
                    for (const [y, x, s] of visible
                        .filter((v) => v[2] > 0.9 && [5, 6, 7].includes(v[3]))
                        .slice(0, 5))
                        rays(g, y, x, Math.trunc(2 + 3 * Math.min(s, 1.1)), 5, 0.6);
                    return {
                        count,
                        hud: `bloom ${(op * 100).toFixed(1).padStart(5)}%   sway ${mod(
                            (yaw * 180) / Math.PI,
                            360,
                        )
                            .toFixed(2)
                            .padStart(6, '0')}°`,
                    };
                },
                20,
                0.5,
            );
        }

        function birthday() {
            const R = 1.6,
                FT = 0.08,
                TOP = 0.98,
                A0 = (-28 * Math.PI) / 180,
                A1 = (30 * Math.PI) / 180,
                candle = [0.62 * R, 0, 0],
                center = [1, 0, 0];
            const rng = random(7),
                uniform = (a, b) => a + (b - a) * rng();
            const gaussian = () => Math.sqrt(-2 * Math.log(Math.max(rng(), 1e-12))) * Math.cos(TAU * rng());
            const ring = (a) => [Math.cos(a), 0, -Math.sin(a)],
                body = [];
            function frosting(x, z) {
                const r = Math.hypot(x, z),
                    a = Math.atan2(-z, x),
                    d = Math.hypot(x - candle[0], z);
                return (
                    TOP +
                    0.04 +
                    0.15 * Math.exp(-sq((r - 1.3) / 0.26)) * (0.55 + 0.45 * Math.sin(a * 22 - r * 14)) +
                    0.2 *
                        Math.exp(-sq(d / 0.34)) *
                        (0.6 + 0.4 * Math.sin(Math.atan2(z, x - candle[0]) * 3 + d * 30))
                );
            }
            const push = (p, n, tag, part) => body.push({ p, n, tag, part });
            for (const [a, side] of [
                [A0, 1],
                [A1, -1],
            ])
                for (let i = 0; i < 9000; i++) {
                    const r = uniform(0, R + FT),
                        y = uniform(0, TOP),
                        p = mul(ring(a), r);
                    p[1] = y;
                    const crust =
                            y < 0.05 ||
                            (y > 0.37 && y < 0.42) ||
                            (y > 0.56 && y < 0.6) ||
                            (y > 0.9 && y < 0.95),
                        cream = y > 0.42 && y < 0.56,
                        frost = y >= 0.95 || r > R;
                    push(
                        p,
                        mul([Math.sin(a), 0, Math.cos(a)], side),
                        frost ? 3 : cream ? 2 : crust ? 1 : 0,
                        frost ? 3 : cream ? 2 : 1,
                    );
                }
            for (let i = 0; i < 9000; i++) {
                const a = uniform(A0, A1),
                    y = uniform(0, TOP + 0.04),
                    p = mul(ring(a), R + FT + 0.025 * Math.sin(a * 40 + y * 9));
                p[1] = y;
                push(p, ring(a), 3, 3);
            }
            for (let i = 0; i < 12000; i++) {
                const r = (R + FT) * Math.sqrt(rng()),
                    a = uniform(A0, A1),
                    p = mul(ring(a), r),
                    x = p[0],
                    z = p[2],
                    y = frosting(x, z),
                    e = 0.01;
                push(
                    [x, y, z],
                    norm([-(frosting(x + e, z) - y) / e, 1, -(frosting(x, z + e) - y) / e]),
                    3,
                    3,
                );
            }
            const base = frosting(candle[0], 0) - 0.05,
                wickTop = base + 0.69;
            for (let i = 0; i < 2500; i++) {
                const a = uniform(0, TAU),
                    y = uniform(0, 0.62),
                    rad = [Math.cos(a), 0, Math.sin(a)];
                push(
                    add(add(candle, mul(rad, 0.075)), [0, base + y, 0]),
                    rad,
                    Math.sin(a + y * 16) > 0.45 ? 5 : 4,
                    4,
                );
            }
            for (let i = 0; i < 30; i++)
                push(add(candle, [0, base + 0.62 + (i / 29) * 0.07, 0]), [0, 0, 1], 11, 4);
            for (let i = 0; i < 9000; i++) {
                const a = uniform(0, TAU),
                    u = Math.sqrt(rng()),
                    r = u * (1.3 + 0.06 * Math.sin(a * 12));
                push(
                    [1 + r * Math.cos(a), -0.02 + 0.06 * Math.pow(u, 4), r * Math.sin(a)],
                    [0, 1, 0],
                    u > 0.93 ? 7 : 6,
                    0,
                );
            }
            for (let i = 0; i < 3000; i++) {
                const a = uniform(0, TAU),
                    y = uniform(-0.1, 0.04),
                    r = 1.3 + 0.06 * Math.sin(a * 12);
                push([1 + r * Math.cos(a), y, r * Math.sin(a)], [Math.cos(a), 0, Math.sin(a)], 7, 0);
            }
            for (let i = 0; i < 110; i++) {
                let c;
                if (i < 90) {
                    const r = uniform(0.25, R),
                        a = uniform(A0 + 0.05, A1 - 0.05);
                    c = mul(ring(a), r);
                    if (Math.hypot(c[0] - candle[0], c[2]) < 0.12) continue;
                    c[1] = frosting(c[0], c[2]) + 0.02;
                } else {
                    const a = uniform(1.2, 4.6),
                        r = uniform(0.95, 1.2);
                    c = [1 + r * Math.cos(a), 0, r * Math.sin(a)];
                }
                const d = norm([gaussian(), gaussian() * 0.3, gaussian()]),
                    tag = 16 + Math.floor(rng() * 6);
                for (let j = 0; j < 10; j++) push(add(c, mul(d, -0.06 + (j / 9) * 0.12)), [0, 1, 0], tag, 5);
            }
            const grain = random(5);
            for (const b of body) {
                b.order = (b.p[1] + 0.12) / 2.3 + uniform(0, 0.1);
                b.fly = rng() < 1 / 30 ? [gaussian() * 2.2, gaussian() * 2.2, gaussian() * 2.2] : [0, 0, 0];
                b.grain = b.tag === 0 || b.tag === 1 ? 0.6 + 0.4 * grain() : 1;
            }
            const flameField = field(3, 900, 2),
                confetti = field(11, 110, 7),
                texts = new Map();
            const cam = camera([1, 2.6, 7], [1, 1.45, 0], 2.9),
                key = norm([-0.5, 0.8, 0.6]),
                halfKey = norm(add(key, cam.view)),
                halfRim = norm(add([0.8, 0.3, -0.5], cam.view));
            function word(text, g, scale, cy) {
                const key = `${text}:${g.cols}:${g.rows}:${scale.toFixed(2)}`;
                if (!texts.has(key)) {
                    const canvas = document.createElement('canvas');
                    canvas.width = g.cols * 9;
                    canvas.height = g.rows * 14;
                    const ctx = canvas.getContext('2d', { willReadFrequently: true });
                    ctx.font = `900 ${Math.trunc(136 * scale)}px "Arial Black", "DejaVu Sans", sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#fff';
                    ctx.fillText(text, g.cols * 4.5, cy * 14);
                    const rgba = ctx.getImageData(0, 0, canvas.width, canvas.height).data,
                        cov = new Float32Array(g.char.length);
                    for (let i = 0; i < cov.length; i++) {
                        const x = (i % g.cols) * 9,
                            y = Math.floor(i / g.cols) * 14;
                        let sum = 0;
                        for (let yy = 0; yy < 14; yy++)
                            for (let xx = 0; xx < 9; xx++)
                                sum += rgba[((y + yy) * canvas.width + x + xx) * 4 + 3];
                        cov[i] = sum / (9 * 14 * 255);
                    }
                    texts.set(key, cov);
                }
                return texts.get(key);
            }
            const colors = [
                [236, 160, 52],
                [150, 84, 36],
                [255, 250, 238],
                [255, 246, 232],
                [240, 50, 70],
                [255, 140, 150],
                [232, 222, 206],
                [228, 176, 84],
                [255, 250, 228],
                [255, 158, 52],
                [255, 184, 96],
                [90, 70, 60],
                [255, 184, 72],
                [255, 226, 168],
                [255, 212, 138],
                [255, 176, 204],
                [255, 96, 160],
                [70, 160, 255],
                [60, 200, 110],
                [255, 214, 50],
                [255, 128, 40],
                [245, 245, 255],
            ];
            return config(
                colors,
                (g, t) => {
                    buffers(g);
                    const turn = 0.95 + 0.08 * Math.sin(t * 0.5),
                        head = ((t - 0.2) / (3.4 - 0.2)) * 1.25,
                        on = smooth((t - 4.4) / 0.8),
                        f =
                            0.82 +
                            0.1 * Math.sin(t * 13) +
                            0.06 * Math.sin(t * 29 + 1) +
                            0.04 * Math.sin(t * 47 + 2);
                    const tip = add(rot(sub(add(candle, [0, wickTop, 0]), center), turn), center),
                        light = add(tip, [0.03 * Math.sin(t * 2.3), 0.18, 0.05]);
                    const cturn = Math.cos(turn),
                        sturn = Math.sin(turn);
                    for (const b of body) {
                        const rev = smooth((head - b.order) / 0.12);
                        if (rev <= 0.01) continue;
                        const px = b.p[0] - 1,
                            pz = b.p[2];
                        const p = [
                            cturn * px + sturn * pz + 1 + b.fly[0] * (1 - rev),
                            b.p[1] + b.fly[1] * (1 - rev),
                            -sturn * px + cturn * pz + b.fly[2] * (1 - rev),
                        ];
                        const nx = cturn * b.n[0] + sturn * b.n[2],
                            ny = b.n[1],
                            nz = -sturn * b.n[0] + cturn * b.n[2];
                        const dx = light[0] - p[0],
                            dy = light[1] - p[1],
                            dz = light[2] - p[2],
                            distance = Math.hypot(dx, dy, dz);
                        const spec =
                            Math.pow(clip(nx * halfKey[0] + ny * halfKey[1] + nz * halfKey[2]), 24) +
                            0.7 * Math.pow(clip(nx * halfRim[0] + ny * halfRim[1] + nz * halfRim[2]), 18);
                        const glow =
                            on *
                            f *
                            (0.3 + 0.7 * clip((nx * dx + ny * dy + nz * dz) / distance)) *
                            Math.exp(-sq(distance / 1.6)) *
                            1.3;
                        const shade =
                            (0.3 +
                                0.45 * clip(nx * key[0] + ny * key[1] + nz * key[2]) +
                                0.12 * spec +
                                0.45 * glow) *
                            rev *
                            b.grain *
                            (b.part === 0 ? 0.6 : 1);
                        const tag =
                            glow > 0.3 ? (b.tag === 0 || b.tag === 1 ? 12 : b.tag === 3 ? 13 : b.tag) : b.tag;
                        point(g, cam, p, shade, tag, b.part);
                    }
                    const grow = smooth((t - 4.3) / 0.7);
                    if (grow > 0)
                        for (const q of flameField) {
                            const u = q[0] * 2 - 1,
                                v = q[1],
                                width = 0.15 * Math.sin(Math.PI * Math.pow(v, 0.75)) * (1 - 0.35 * v),
                                lean = 0.05 * Math.sin(t * 2.3) + 0.02 * Math.sin(t * 7),
                                core = Math.abs(u) < 0.5 && v < 0.62;
                            point(
                                g,
                                cam,
                                add(tip, [
                                    u * width * grow + lean * sq(v),
                                    (v - 0.12) * 0.6 * f * grow,
                                    0.05,
                                ]),
                                (core ? 1 : 0.82) * (0.6 + 0.4 * grow),
                                core ? 8 : 9,
                                6,
                            );
                        }
                    const count = raster(g, t, 'birthday');
                    const outlines = new Set([...' /|\\-_+'].map((ch) => AT[ch]));
                    for (let i = 0; i < g.char.length; i++)
                        if (g.part[i] >= 0) {
                            const h = g.hash3[i],
                                tag = g.tag[i],
                                inner = !outlines.has(g.char[i]);
                            if (inner) {
                                if (tag === 0 || tag === 12)
                                    g.char[i] = AT['o0ae.:o0'[mod(h + Math.trunc(t * 2) * (h % 3 === 0), 8)]];
                                else if (tag === 1 || tag === 7) g.char[i] = AT['='];
                                else if (tag === 2) g.char[i] = AT['~'];
                                else if (tag === 3 || tag === 13) g.char[i] = AT[h % 5 === 0 ? '^' : '~'];
                                else if (tag === 6) g.char[i] = AT[h % 4 === 0 ? ':' : '.'];
                                if (tag === 2) g.lum[i] = Math.max(g.lum[i], 0.85);
                            }
                            if (tag === 6) g.lum[i] *= 0.8;
                        }
                    const [cx, cy] = cam.project(light, g);
                    if (on > 0)
                        for (let i = 0; i < g.char.length; i++) {
                            const y = Math.floor(i / g.cols),
                                x = i % g.cols,
                                h = g.hash3[i],
                                fall = 1 - Math.hypot(y - cy, ((x - cx) * 9) / 14) / ((6 + 1.5 * f) * on);
                            if (g.char[i] === 0 && fall > 0 && mod(h + Math.trunc(t * 9), 3) !== 0) {
                                g.char[i] = AT[fall < 0.4 ? '.' : fall < 0.7 ? ':' : '+'];
                                g.lum[i] = 0.6 * fall * on * f;
                                g.tag[i] = 10;
                            }
                        }
                    if (t > 4.3 && t < 5.4) {
                        const k = (t - 4.3) / 1.1;
                        for (let i = 0; i < 14; i++) {
                            const a = i * 2.4 + k * 3,
                                y = Math.trunc(cy + 2 - k * 7 * (0.6 + 0.4 * (i % 3)) + Math.sin(a) * 2),
                                x = Math.trunc(cx + Math.cos(a) * (2 + k * 9));
                            if (
                                y >= 0 &&
                                y < g.rows &&
                                x >= 0 &&
                                x < g.cols &&
                                g.char[y * g.cols + x] === 0
                            ) {
                                g.char[y * g.cols + x] = AT[i % 2 ? '*' : '+'];
                                g.lum[y * g.cols + x] = 1 - k;
                                g.tag[y * g.cols + x] = 8;
                            }
                        }
                    }
                    let pieces = 0;
                    confetti.forEach((q, i) => {
                        const [xx, sp, de, am, ww, ph, col] = q,
                            x0 = xx * g.cols,
                            speed = 4 + 5 * sp,
                            delay = de * 5,
                            amp = 1 + am * 3,
                            w = 1 + ww * 1.5,
                            phase = ph * TAU,
                            age = t - 6.2 - delay;
                        if (age < 0) return;
                        const y = Math.trunc(mod(age * speed, g.rows + 4)) - 2,
                            x = Math.trunc(x0 + amp * Math.sin(w * t + phase));
                        if (y >= 0 && y < g.rows && x >= 0 && x < g.cols) {
                            const j = y * g.cols + x;
                            if (g.char[j] === 0 || g.tag[j] === 10) {
                                g.char[j] = AT[i % 7 ? '-/|\\'[mod(Math.trunc(t * w * 3 + phase), 4)] : 'o'];
                                g.lum[j] = 0.85;
                                g.tag[j] = 16 + Math.floor(col * 6);
                                pieces++;
                            }
                        }
                    });
                    for (const [text, ts, row, tag] of [
                        ['HAPPY', 8, 0.09, 14],
                        ['BIRTHDAY', 8.55, 0.21, 15],
                    ]) {
                        const p = clip((t - ts) / 0.5);
                        if (p <= 0) continue;
                        const q = p - 1,
                            pop = 1 + 2.70158 * q * q * q + 1.70158 * q * q,
                            cov = word(text, g, 1.55 - 0.55 * pop, g.rows * row);
                        const at = (x, y) => cov[mod(y, g.rows) * g.cols + mod(x, g.cols)];
                        for (let i = 0; i < g.char.length; i++)
                            if (cov[i] > 0.45 && (g.hash3[i] % 997) / 997 < smooth(p * 1.6)) {
                                const y = Math.floor(i / g.cols),
                                    x = i % g.cols,
                                    left = at(x - 1, y),
                                    right = at(x + 1, y),
                                    up = at(x, y - 1),
                                    down = at(x, y + 1),
                                    edge = left < 0.45 || right < 0.45 || up < 0.45 || down < 0.45;
                                g.char[i] = edge
                                    ? outline(-(right - left) * 10, -(down - up) * 10)
                                    : FILL[3][mod(g.hash3[i] + Math.trunc(t * 4) + (g.hash3[i] % 11), 12)];
                                g.lum[i] = clip(
                                    (0.8 + 0.2 * Math.sin(t * 3 - x * 0.12)) * (1 + 0.5 * (1 - p)),
                                );
                                g.tag[i] = tag;
                            }
                    }
                    if (t > 9.6) {
                        const lit = [];
                        for (let i = 0; i < g.tag.length; i++) if (g.tag[i] === 14) lit.push(i);
                        for (let n = 0; n < 2 && lit.length; n++) {
                            const q = Math.trunc(t * 1.3 + n * 0.5),
                                i = lit[mod(q * 7919 + n * 104729, lit.length)];
                            rays(
                                g,
                                Math.floor(i / g.cols),
                                i % g.cols,
                                Math.trunc(2 + 4 * Math.sin(mod(t * 1.3 + n * 0.5, 1) * Math.PI)),
                                8,
                            );
                        }
                    }
                    return {
                        count,
                        hud: `candle ${on > 0.5 ? 'lit' : 'off'}   flame ${(f * on).toFixed(2)}   confetti ${pieces}`,
                    };
                },
                18,
            );
        }

        // Good Luck uses the artist's phrase sprites rather than a glyph atlas.
        async function goodluck() {
            const W = 1080,
                H = 960,
                CX = 540,
                CY = 420,
                LEAF = 385,
                LEAF_W = 0.8,
                SPLIT = 8,
                WALL = 22,
                DOME = 58,
                WD = 52;
            const half = [
                [0, -0.3575],
                [0.0301, -0.3662],
                [0.0563, -0.3844],
                [0.0825, -0.4024],
                [0.109, -0.4199],
                [0.1373, -0.4328],
                [0.1671, -0.4422],
                [0.1981, -0.4489],
                [0.231, -0.4507],
                [0.264, -0.4489],
                [0.2947, -0.4418],
                [0.3236, -0.43],
                [0.349, -0.41],
                [0.3738, -0.3887],
                [0.3993, -0.3687],
                [0.4241, -0.3474],
                [0.4442, -0.322],
                [0.4604, -0.295],
                [0.4741, -0.267],
                [0.4852, -0.2379],
                [0.4928, -0.2073],
                [0.4964, -0.1751],
                [0.4982, -0.1421],
                [0.4969, -0.109],
                [0.4928, -0.077],
                [0.4857, -0.0462],
                [0.4767, -0.0162],
                [0.465, 0.0126],
                [0.4513, 0.0406],
                [0.4351, 0.0676],
                [0.4176, 0.0941],
                [0.3988, 0.12],
                [0.3788, 0.1454],
                [0.3562, 0.1698],
                [0.3319, 0.1923],
                [0.3075, 0.2149],
                [0.2826, 0.2362],
                [0.2577, 0.2575],
                [0.2329, 0.2788],
                [0.208, 0.3001],
                [0.1831, 0.3214],
                [0.1577, 0.3414],
                [0.1323, 0.3614],
                [0.1069, 0.3815],
                [0.0809, 0.4002],
                [0.0548, 0.4185],
                [0.028, 0.4352],
                [0, 0.4489],
            ];
            const makeCanvas = (w, h) => {
                const c = document.createElement('canvas');
                c.width = w;
                c.height = h;
                return c;
            };
            const root = new URL('jin2/goodluck-sprites/', baseURL);
            const response = await fetch(new URL('phrases.json', root));
            if (!response.ok) throw new Error(`Good Luck phrases: HTTP ${response.status}`);
            const phrases = await response.json();
            if (
                !Array.isArray(phrases) ||
                phrases.length !== 77 ||
                phrases.some((p) => !Array.isArray(p) || p.length !== 2)
            )
                throw new Error('Invalid Good Luck phrase list.');
            const sprites = await Promise.all(
                phrases.map(async (_, i) => {
                    const response = await fetch(new URL(`${String(i).padStart(2, '0')}.png`, root));
                    if (!response.ok) throw new Error(`Good Luck sprite ${i}: HTTP ${response.status}`);
                    const bitmap = await createImageBitmap(await response.blob()),
                        canvas = makeCanvas(bitmap.width, bitmap.height),
                        ctx = canvas.getContext('2d', { willReadFrequently: true });
                    ctx.drawImage(bitmap, 0, 0);
                    bitmap.close();
                    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                    let x0 = canvas.width,
                        y0 = canvas.height,
                        x1 = -1,
                        y1 = -1;
                    for (let y = 0; y < canvas.height; y++)
                        for (let x = 0; x < canvas.width; x++)
                            if (data[(y * canvas.width + x) * 4 + 3] > 255 * 0.05) {
                                x0 = Math.min(x0, x);
                                y0 = Math.min(y0, y);
                                x1 = Math.max(x1, x);
                                y1 = Math.max(y1, y);
                            }
                    if (x1 < 0) throw new Error(`Empty Good Luck sprite ${i}.`);
                    return { canvas, x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
                }),
            );
            const rtl = new Set(['Arabic', 'Hebrew', 'Persian', 'Pashto', 'Urdu', 'Yiddish', 'Uyghur']);
            const size = W * H,
                inside = new Uint8Array(size),
                rad = new Float32Array(size).fill(1),
                Z = new Float32Array(size),
                ZX = new Float32Array(size),
                ZY = new Float32Array(size),
                normalX = new Float64Array(size),
                normalY = new Float64Array(size),
                normalZ = new Float64Array(size),
                glassEdge = new Float64Array(size);
            const maskCanvas = makeCanvas(W, H),
                maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
            function distance(mask) {
                const d = Float32Array.from(mask, (x) => (x ? 1e6 : 0));
                // OpenCV's DIST_L2 five-pixel chamfer neighbourhood.
                const forward = [
                    [-1, 0, 1],
                    [0, -1, 1],
                    [-1, -1, 1.4],
                    [1, -1, 1.4],
                    [-2, -1, 2.1969],
                    [2, -1, 2.1969],
                    [-1, -2, 2.1969],
                    [1, -2, 2.1969],
                ];
                for (const reverse of [false, true])
                    for (let yy = 0; yy < H; yy++)
                        for (let xx = 0; xx < W; xx++) {
                            const y = reverse ? H - 1 - yy : yy,
                                x = reverse ? W - 1 - xx : xx,
                                i = y * W + x;
                            if (!mask[i]) continue;
                            for (const [dx, dy, cost] of forward) {
                                const nx = x + (reverse ? -dx : dx),
                                    ny = y + (reverse ? -dy : dy);
                                if (nx >= 0 && nx < W && ny >= 0 && ny < H)
                                    d[i] = Math.min(d[i], d[ny * W + nx] + cost);
                            }
                        }
                return d;
            }
            for (let part = 0; part < 5; part++) {
                maskCtx.clearRect(0, 0, W, H);
                maskCtx.fillStyle = '#fff';
                maskCtx.strokeStyle = '#fff';
                maskCtx.beginPath();
                if (part < 4) {
                    const a = ([-144, -52, 140, 45][part] * Math.PI) / 180,
                        points = [...half, ...[...half].reverse().map(([x, y]) => [-x, y])];
                    points.forEach(([x, y], j) => {
                        const along = ((0.4489 - y) / 0.8996) * LEAF + SPLIT,
                            across = x * LEAF * LEAF_W,
                            px = CX + along * Math.cos(a) - across * Math.sin(a),
                            py = CY + along * Math.sin(a) + across * Math.cos(a);
                        if (j) maskCtx.lineTo(px, py);
                        else maskCtx.moveTo(px, py);
                    });
                    maskCtx.closePath();
                    maskCtx.fill();
                } else {
                    maskCtx.lineWidth = 44;
                    maskCtx.lineCap = 'round';
                    maskCtx.lineJoin = 'round';
                    for (let j = 0; j < 60; j++) {
                        const u = j / 59,
                            x = 2 * u * (1 - u) * 25 + sq(u) * -75 + CX,
                            y = sq(1 - u) * 30 + 2 * u * (1 - u) * 260 + sq(u) * 460 + CY;
                        if (j) maskCtx.lineTo(x, y);
                        else maskCtx.moveTo(x, y);
                    }
                    maskCtx.stroke();
                }
                const pixels = maskCtx.getImageData(0, 0, W, H).data,
                    mask = new Uint8Array(size);
                for (let i = 0; i < size; i++) mask[i] = pixels[i * 4 + 3] > 127 && !inside[i] ? 1 : 0;
                const d = distance(mask);
                let max = 1;
                for (let i = 0; i < size; i++) if (mask[i]) max = Math.max(max, d[i]);
                for (let i = 0; i < size; i++)
                    if (mask[i]) {
                        const r = 1 - d[i] / max,
                            lip = Math.exp(-sq((d[i] - 14) / 5)) * 10 - Math.exp(-sq((d[i] - 34) / 7)) * 7;
                        inside[i] = 1;
                        rad[i] = r;
                        Z[i] =
                            WALL * (part < 4 ? 1 : 0.8) +
                            DOME * (part < 4 ? 1 : 0.3) * Math.sqrt(clip(1 - sq(r))) +
                            (part < 4 ? lip : 0);
                    }
            }
            const kernel = Array.from({ length: 13 }, (_, i) => Math.exp(-sq(i - 6) / 8)),
                kernelSum = kernel.reduce((a, b) => a + b, 0),
                temp = new Float32Array(size);
            for (let y = 0; y < H; y++)
                for (let x = 0; x < W; x++) {
                    let s = 0;
                    for (let k = -6; k <= 6; k++) s += Z[y * W + clip(x + k, 0, W - 1)] * kernel[k + 6];
                    temp[y * W + x] = s / kernelSum;
                }
            for (let y = 0; y < H; y++)
                for (let x = 0; x < W; x++) {
                    let s = 0;
                    for (let k = -6; k <= 6; k++) s += temp[clip(y + k, 0, H - 1) * W + x] * kernel[k + 6];
                    Z[y * W + x] = inside[y * W + x] ? s / kernelSum : 0;
                }
            const runs = [];
            let first = H,
                last = 0;
            for (let y = 0; y < H; y++) {
                let start = -1;
                for (let x = 0; x < W; x++) {
                    const i = y * W + x;
                    ZX[i] =
                        (Z[y * W + Math.min(x + 1, W - 1)] - Z[y * W + Math.max(x - 1, 0)]) /
                        (x > 0 && x < W - 1 ? 2 : 1);
                    ZY[i] =
                        (Z[Math.min(y + 1, H - 1) * W + x] - Z[Math.max(y - 1, 0) * W + x]) /
                        (y > 0 && y < H - 1 ? 2 : 1);
                    const len = Math.hypot(ZX[i], ZY[i], 1);
                    normalX[i] = ZX[i] / len;
                    normalY[i] = ZY[i] / len;
                    normalZ[i] = 1 / len;
                    glassEdge[i] = smooth((rad[i] - 0.55) / 0.4);
                    if (inside[i]) {
                        first = Math.min(first, y);
                        last = Math.max(last, y);
                        if (start < 0) start = x;
                    }
                    if (start >= 0 && (!inside[i] || x === W - 1)) {
                        runs.push({ y, left: start, right: inside[i] ? x : x - 1 });
                        start = -1;
                    }
                }
            }
            const k = 14 / sprites[0].h,
                layouts = [[], []],
                scaled = new Map();
            function sprite(idx, scale) {
                const key = `${idx}:${Math.round(scale * 200)}`;
                if (!scaled.has(key)) {
                    const s = sprites[idx],
                        w = Math.max(1, Math.round(s.w * scale)),
                        h = Math.max(1, Math.round(s.h * scale)),
                        canvas = makeCanvas(w, h),
                        ctx = canvas.getContext('2d', { willReadFrequently: true });
                    ctx.drawImage(s.canvas, s.x, s.y, s.w, s.h, 0, 0, w, h);
                    const rgba = ctx.getImageData(0, 0, w, h).data;
                    scaled.set(key, {
                        w,
                        h,
                        a: Uint8Array.from({ length: w * h }, (_, i) => rgba[i * 4 + 3]),
                    });
                }
                return scaled.get(key);
            }
            function fitRow(xl, xr, first, k) {
                const span = xr - xl,
                    picks = [];
                let used = 0,
                    j = first;
                for (let n = 0; n < 40; n++) {
                    const home = (n + first) % 4 === 0 ? [(first + Math.floor(n / 4)) % 2] : [],
                        candidates = [
                            ...home,
                            ...Array.from({ length: 12 }, (_, tries) => mod(j + tries * 5, 77)),
                        ];
                    const idx = candidates.find(
                        (idx) => used + sprites[idx].w * k + (picks.length ? 9 : 0) <= span,
                    );
                    if (idx === undefined) break;
                    const w = sprites[idx].w * k;
                    used += w + (picks.length ? 9 : 0);
                    picks.push([idx, w, k]);
                    if (idx > 1) j = idx + 7;
                }
                if (!picks.length) return [];
                for (let n = 0; n < 3; n++) {
                    const room = span - picks.reduce((s, p) => s + p[1], 0) - 9 * picks.length,
                        candidates = Array.from({ length: 77 }, (_, i) => i).filter(
                            (i) => sprites[i].w * k * 0.6 <= room,
                        );
                    if (!candidates.length) break;
                    let best = candidates[0],
                        score = -Infinity;
                    for (const i of candidates) {
                        const v = Math.min(sprites[i].w * k, room) - mod(i * 31 + Math.trunc(xl), 7);
                        if (v > score) {
                            score = v;
                            best = i;
                        }
                    }
                    const scale = Math.min(k, room / sprites[best].w);
                    picks.splice(mod(picks.length * 7 + Math.trunc(xl), picks.length + 1), 0, [
                        best,
                        sprites[best].w * scale,
                        scale,
                    ]);
                }
                const gap = (span - picks.reduce((s, p) => s + p[1], 0)) / Math.max(picks.length - 1, 1),
                    out = [];
                let x = picks.length > 1 ? xl : xl + (span - picks[0][1]) / 2;
                for (const [idx, w, scale] of picks) {
                    out.push([idx, x, w, scale]);
                    x += w + gap;
                }
                return out;
            }
            let r = 0;
            for (let y = first + 7; y < last - 7; y += 16, r++)
                for (let side = 0; side < 2; side++) {
                    const band = new Float32Array(W);
                    for (let x = 0; x < W; x++) {
                        let max = 0;
                        for (let yy = Math.max(y - 7, 0); yy < Math.min(y + 7, H - 1); yy++)
                            max = Math.max(max, rad[yy * W + (side ? W - 1 - x : x)]);
                        band[x] = max;
                    }
                    let start = -1;
                    for (let x = 0; x < W; x++) {
                        if (band[x] < 0.985 && start < 0) start = x;
                        if (start >= 0 && (band[x] >= 0.985 || x === W - 1)) {
                            const end = band[x] < 0.985 ? x : x - 1;
                            if (end - start + 1 >= 20) {
                                let picks = fitRow(start, end, r * 13 + side * 29 + start, k);
                                if (!picks.length) {
                                    const span = end - start,
                                        fits = Array.from({ length: 77 }, (_, i) => i).filter(
                                            (i) => sprites[i].w * k * 0.6 <= span,
                                        );
                                    if (fits.length) {
                                        const idx = fits[(r * 3 + side * 5) % fits.length],
                                            scale = Math.min(k, span / sprites[idx].w),
                                            w = sprites[idx].w * scale;
                                        picks = [[idx, start + (span - w) / 2, w, scale]];
                                    }
                                }
                                picks.forEach(([idx, x, w, scale], j) =>
                                    layouts[side].push({
                                        r: r * 50 + Math.floor(start / 25),
                                        j,
                                        idx,
                                        x,
                                        w,
                                        y,
                                        k: scale,
                                    }),
                                );
                            }
                            start = -1;
                        }
                    }
                }
            const sideRows = [...new Set(layouts[0].map((p) => p.y))].sort((a, b) => a - b),
                sideLayout = [];
            for (let end = 0; end < 2; end++)
                sideRows.forEach((y, r) => {
                    let idx, scale;
                    for (let tries = 0; tries < 77; tries++) {
                        idx = (r * 17 + end * 41 + tries * 3) % 77;
                        scale = Math.min(k, (WD - 6) / sprites[idx].w);
                        if (scale >= k * 0.55) break;
                    }
                    sideLayout.push({ end, y, r, idx, k: scale });
                });
            // The source's greedy fit can omit long phrases. Keep its layout,
            // but fill a few duplicate slots so all 77 languages are represented.
            const allSlots = layouts.flat(),
                usage = new Uint16Array(77);
            for (const p of [...allSlots, ...sideLayout]) usage[p.idx]++;
            for (let idx = 0; idx < 77; idx++)
                if (!usage[idx]) {
                    let slot,
                        best = Infinity;
                    for (const p of allSlots)
                        if (usage[p.idx] > 1 && p.w >= sprites[idx].w * k * 0.6) {
                            const score = Math.abs(p.w - sprites[idx].w * k);
                            if (score < best) {
                                best = score;
                                slot = p;
                            }
                        }
                    if (!slot) throw new Error(`Could not fit Good Luck language ${phrases[idx][0]}.`);
                    usage[slot.idx]--;
                    usage[idx]++;
                    const scale = Math.min(k, slot.w / sprites[idx].w),
                        width = sprites[idx].w * scale;
                    slot.x += (slot.w - width) / 2;
                    slot.w = width;
                    slot.k = scale;
                    slot.idx = idx;
                }
            function stamp(layer, width, height, idx, x, y, scale, shown = 1) {
                const s = sprite(idx, scale),
                    cut = Math.trunc(s.w * shown),
                    x0 = Math.trunc(x - s.w / 2),
                    y0 = Math.trunc(y - s.h / 2),
                    rightToLeft = rtl.has(phrases[idx][0]);
                for (let yy = Math.max(0, -y0); yy < Math.min(s.h, height - y0); yy++)
                    for (let xx = Math.max(0, -x0); xx < Math.min(s.w, width - x0); xx++)
                        if (shown >= 1 || (rightToLeft ? xx >= s.w - cut : xx < cut)) {
                            const i = (y0 + yy) * width + x0 + xx;
                            layer[i] = Math.max(layer[i], s.a[yy * s.w + xx]);
                        }
            }
            let complete;
            function textures(t) {
                if (t >= 3 && complete) return complete;
                const front = new Uint8Array(size),
                    back = new Uint8Array(size),
                    sides = [new Uint8Array(H * WD), new Uint8Array(H * WD)];
                let count = 0;
                for (let side = 0; side < 2; side++)
                    for (const p of layouts[side]) {
                        const start = 0.1 + (mod(p.r * 7919 + p.j * 104729 + side * 31, 997) / 997) * 2.4,
                            shown = smooth((t - start) / 0.3);
                        if (shown > 0) {
                            stamp(side ? back : front, W, H, p.idx, p.x + p.w / 2, p.y, p.k, shown);
                            count++;
                        }
                    }
                for (const p of sideLayout) {
                    const start = 0.1 + (mod(p.r * 6007 + p.end * 911, 997) / 997) * 2.4,
                        shown = smooth((t - start) / 0.3),
                        s = sprite(p.idx, p.k);
                    if (shown > 0 && Math.trunc(p.y - s.h / 2) >= 0 && Math.trunc(p.y - s.h / 2) + s.h <= H) {
                        stamp(sides[p.end], WD, H, p.idx, WD / 2, p.y, p.k);
                        count++;
                    }
                }
                const result = { front, back, sides, count };
                if (t >= 3) complete = result;
                return result;
            }
            const rgba = new Uint8ClampedArray(size * 4),
                depth = new Float64Array(size),
                glints = field(7, 70, 4);
            const pale = [150, 222, 168],
                deep = [58, 156, 86],
                white = [245, 255, 248],
                sweepColor = [0.35, 0.6, 0.4];
            const stars = makeCanvas(W, H),
                starCtx = stars.getContext('2d', { willReadFrequently: true });
            const roundEven = (x) => {
                const n = Math.floor(x);
                return x - n === 0.5 ? (n % 2 ? n + 1 : n) : Math.round(x);
            };
            return {
                pixels: rgba,
                loop: 20,
                fade: 0.35,
                cw: 9,
                ch: 14,
                font: 15,
                colors: [],
                frame(g, t) {
                    const tex = textures(t),
                        theta = (TAU * t) / 10,
                        c = Math.cos(theta),
                        s = Math.sin(theta);
                    rgba.fill(0);
                    depth.fill(-Infinity);
                    const sample = (y, X, D, nx, ny, nz, edge, alpha) => {
                        const nxr = nx * c + nz * s,
                            nzr = -nx * s + nz * c;
                        if (nzr <= -0.05) return;
                        const x = roundEven(X * c + D * s + CX);
                        if (x < 0 || x >= W) return;
                        const i = y * W + x,
                            z = -X * s + D * c;
                        if (z < depth[i]) return;
                        depth[i] = z;
                        const o = i * 4;
                        rgba[o] = rgba[o + 1] = rgba[o + 2] = 0;
                        rgba[o + 3] = 255;
                        if (!alpha) return;
                        const ry = nz === 0 ? 0.25 : 2 * nzr * ny,
                            rx = 2 * nzr * nxr,
                            shine =
                                smooth((ry - 0.42) / 0.3) * 0.75 +
                                Math.exp(-sq((rx + 0.35) / 0.08)) * smooth((ry + 0.1) / 0.3) * 0.5,
                            val = (alpha / 255) * (0.8 + 0.7 * clip(1 - Math.abs(nzr)));
                        for (let k = 0; k < 3; k++)
                            rgba[o + k] =
                                ((pale[k] * (1 - edge) + deep[k] * edge) * (1 - 0.6 * shine) +
                                    white[k] * shine) *
                                val;
                    };
                    for (const { y, left, right } of runs) {
                        for (let fx = left; fx < right + 1; fx += 0.5) {
                            const ix = clip(roundEven(fx), left, right),
                                i = y * W + ix,
                                z = Z[i],
                                nx = normalX[i],
                                ny = normalY[i],
                                nz = normalZ[i],
                                edge = glassEdge[i];
                            sample(y, fx - CX, z, -nx, ny, nz, edge, tex.front[i]);
                            sample(
                                y,
                                fx - CX,
                                -z,
                                nx,
                                ny,
                                -nz,
                                edge,
                                tex.back[y * W + clip(2 * CX - ix, 0, W - 1)],
                            );
                        }
                        for (const [end, xe] of [
                            [0, left],
                            [1, right],
                        ]) {
                            const ze = Math.max(Z[y * W + xe], WALL * 0.8);
                            for (let z = -ze; z < ze; z += 0.7) {
                                const u = Math.trunc(((end ? z + ze : ze - z) / (2 * ze)) * (WD - 1));
                                sample(y, xe - CX, z, end ? 1 : -1, 0.12, 0, 1, tex.sides[end][y * WD + u]);
                            }
                        }
                    }
                    if (t > 3) {
                        const pos = (mod(t - 3, 4) / 4) * 1900 - 300;
                        for (let y = 0; y < H; y++)
                            for (let x = 0; x < W; x++) {
                                const o = (y * W + x) * 4,
                                    lit = Math.max(rgba[o], rgba[o + 1], rgba[o + 2]);
                                if (!lit) continue;
                                const band = Math.exp(-sq((x + y * 0.7 - pos) / 45));
                                for (let k = 0; k < 3; k++)
                                    rgba[o + k] = rgba[o + k] * (1 + 0.9 * band) + lit * band * sweepColor[k];
                            }
                    }
                    starCtx.clearRect(0, 0, W, H);
                    starCtx.lineWidth = 1;
                    const fade = smooth((t - 2) / 1.5);
                    for (const [gx, gy, ph, sz] of glints) {
                        const x = Math.trunc(80 + gx * 920),
                            y = Math.trunc(mod(40 + gy * 880 - t * (10 + 20 * sz), 900) + 20),
                            tw = Math.pow(Math.max(0, Math.sin(TAU * (t * 0.5 + ph))), 3) * fade;
                        if (tw < 0.04) continue;
                        const r = Math.trunc(2 + 10 * sz * tw),
                            d = Math.max(1, Math.floor(r / 3));
                        starCtx.strokeStyle = `rgb(${150 * tw * 1.3},${255 * tw * 1.3},${185 * tw * 1.3})`;
                        starCtx.beginPath();
                        for (const [x0, y0, x1, y1] of [
                            [x - r, y, x + r, y],
                            [x, y - r, x, y + r],
                            [x - d, y - d, x + d, y + d],
                            [x - d, y + d, x + d, y - d],
                        ]) {
                            starCtx.moveTo(x0 + 0.5, y0 + 0.5);
                            starCtx.lineTo(x1 + 0.5, y1 + 0.5);
                        }
                        starCtx.stroke();
                    }
                    const starPixels = starCtx.getImageData(0, 0, W, H).data;
                    for (let i = 0; i < size; i++) {
                        const o = i * 4,
                            a = starPixels[o + 3] / 255;
                        if (a)
                            for (let k = 0; k < 3; k++)
                                rgba[o + k] = rgba[o + k] * (1 - a) + starPixels[o + k] * a;
                        rgba[o + 3] = 255;
                    }
                    return { count: tex.count, hud: `languages ${phrases.length}   phrases ${tex.count}` };
                },
            };
        }
    }
})();
