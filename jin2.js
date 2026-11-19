/* Black Hole, Night Tide and Cat Knight: adaptations of JIN2's Python ASCII
 * code art, @jin_22ee (2026). Personal, noncommercial use with credit only.
 * Original artwork/algorithms belong to JIN2; see LICENSE-jin2-ascii.
 * Source: https://github.com/JIN2-ASCII/-JIN2-ASCII
 * Cat Knight's underlying photo belongs to its creator. No source images used.
 */
(() => {
    'use strict';
    const TAU = Math.PI * 2, LOOP = 20, W = 1080, H = 960;
    const POOLS = ['1il!;:', 'rtfjcvxz=+', 'aeoun0{}[]<>', '08B$#&%Q'];
    const CHARS = ' .,:~+*^01|/\\-_#()x' + POOLS.join('');
    // Python's dict comprehension uses the LAST index of repeated characters.
    const AT = Object.fromEntries([...CHARS].map((c, i) => [c, i]));
    const FILL = POOLS.map(p => Array.from({length: 12}, (_, k) => AT[p[k % p.length]]));
    const clip = (x, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));
    const smooth = x => { x = clip(x); return x * x * (3 - 2 * x); };
    const mod = (x, n) => ((x % n) + n) % n;
    const sq = x => x * x;
    const BH_COLORS = [[190,38,12],[242,78,20],[255,124,34],[255,172,78],[255,222,168],[220,228,255],[130,72,48]];
    const NT_COLORS = [[20,34,64],[28,50,92],[40,72,122],[62,100,152],[98,136,182],[146,176,210],[196,206,218],[236,238,240],[222,230,240],[86,84,98],[170,180,205]];
    const moduleURL = new URL(document.currentScript.src);
    let catDataPromise, active;

    function random(seed) {
        return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    }

    function grid(cols, rows, cw, ch, seed) {
        const size = cols * rows, rng = random(seed), aspect = cols * cw / (rows * ch);
        const g = {cols, rows, cw, ch, aspect, char: new Uint8Array(size),
            lum: new Float32Array(size), tag: new Uint8Array(size),
            x: new Float64Array(size), y: new Float64Array(size),
            rnd: new Float64Array(size), hash: new Uint8Array(size)};
        for (let i = 0; i < size; i++) {
            g.x[i] = ((i % cols + 0.5) / cols - 0.5) * aspect;
            g.y[i] = (Math.floor(i / cols) + 0.5) / rows - 0.5;
            g.rnd[i] = rng(); g.hash[i] = Math.floor(rng() * 12);
        }
        return g;
    }

    const R0 = 0.11, TILT = 17 * Math.PI / 180, INC = 0.12;
    const R_IN = 1.55 * R0, R_OUT = 5.4 * R0, FLASH = 7.8;
    const CT = Math.cos(TILT), ST = Math.sin(TILT);
    const GAS_RINGS = [[Math.log(1.8),0,0.95],[Math.log(2.4),2.1,0.8],[Math.log(3.2),4.2,0.65]];
    const spin = t => { const s = Math.max(t - FLASH, 0); return 0.06 * t + 0.28 * (s - 0.8 * (1 - Math.exp(-s / 0.8))); };
    const ripple = (a, b, t) => Math.sin(a + 0.9 * Math.sin(b + 1.3 * t)) * 0.5 + Math.sin(2.3 * a - b + 0.7 * t) * 0.3 + Math.sin(4.1 * a + 1.7 * b - 1.1 * t) * 0.2;
    function gas(phi, rho, t, w) {
        rho = Math.max(rho, 1e-12);
        const phase = phi - Math.pow(rho / R_IN, -1.5) * w, lr = Math.log(rho / R0);
        const a = 46 * lr + 0.9 * Math.sin(phase + 3 * lr);
        let streak = 0.55 + 0.3 * Math.sin(a) + 0.15 * Math.sin(2.3 * a + 2 * phase) + 0.12 * Math.sin(3 * phase - 7 * lr + 0.3 * t);
        let pulses = 0;
        if (t > FLASH) for (const [logRadius, start, speed] of GAS_RINGS) {
            const radial = Math.exp(-sq((lr - logRadius) / 0.07));
            // Outside a pulse's narrow ring its contribution is sub-pixel.
            if (radial < 1e-12) continue;
            const d = mod(phi - start - speed * t + Math.PI, TAU) - Math.PI;
            pulses += (d > 0 ? Math.exp(-sq(d / 0.18)) : Math.exp(d / 0.9)) * radial;
        }
        streak += 0.9 * smooth(t - FLASH) * pulses;
        return [streak, phase, lr];
    }

    function blackhole(g, t) {
        const cam = smooth(smooth((t - FLASH + 0.3) / 2.6));
        const zoom = 1 + 0.28 * cam, inc = INC + 0.09 * cam, w = spin(t);
        const flash = Math.exp(-sq((t - FLASH) / 0.22)), ringK = smooth((t - 0.3) / 2.2);
        const diskOn = smooth((t - 5) / 2.8), auraK = smooth((t - 2.2) / 1.8) * (1 - 0.65 * diskOn);
        const span = R0 + diskOn * (R_OUT * 1.1 - R0);
        const diskGrow = smooth((t - 5) / 0.8), diskFlash = 0.55 + 0.45 * smooth((t - FLASH + 0.3) / 0.4);
        const haloGrow = smooth((t - 5) / 2.2), ringHeat = 0.9 + 0.3 * smooth((t - 5) / 2);
        const laneLum = 0.3 * smooth((t - 4) / 3);
        let count = 0, heatMax = 0;
        for (let i = 0; i < g.char.length; i++) {
            const X = g.x[i] / zoom, Y = (g.y[i] + 0.02 * cam) / zoom;
            const r = Math.sqrt(X * X + Y * Y), ang = Math.atan2(Y, X), rnd = g.rnd[i];
            const ring = Math.exp(-sq((r - 1.02 * R0) / (0.045 * R0))) * smooth((ringK * 1.08 - mod(ang + Math.PI / 2, TAU) / TAU) / 0.08);
            const rings = gas(ang - TILT, R_IN + Math.max(r - R0, 0) * 2.6, t, w)[0];
            let puff = 0.5 + 0.5 * ripple(2 * ang, 5 * r - 0.45 * t, 0.35 * t);
            puff = puff * (1 - diskOn) + rings * diskOn;
            const reach = 0.32 * R0 * (0.7 + 0.6 * puff);
            const aura = auraK * Math.exp(-Math.pow(Math.max(r - R0, 0) / reach, 1.6)) * (0.6 + 0.4 * puff);
            const u = X * CT + Y * ST, v = -X * ST + Y * CT;
            const vi = v / inc;
            const rho = Math.max(Math.sqrt(u * u + vi * vi), 1e-12), phi = Math.atan2(vi, u);
            const [streak, phase, lr] = gas(phi, rho, t, w);
            const edge = smooth((rho - R_IN) / (0.25 * R0)) * smooth((R_OUT - rho) / (2.2 * R0));
            let disk = 1.5 * edge * streak * R_IN / rho * (1 - 0.25 * u / Math.max(rho, 1e-6));
            disk *= diskGrow * smooth((span - Math.abs(u)) / (0.6 * R0)) * diskFlash;
            const top = 0.5 - 0.5 * Math.sin(ang - TILT), side = Math.pow(Math.abs(Math.cos(ang - TILT)), 10);
            const band = Math.exp(-sq(Math.max(r - 1.1 * R0, 0) / (0.2 * R0 + 0.24 * R0 * top + 0.45 * R0 * side))) * Math.exp(-sq(Math.min(r - 1.1 * R0, 0) / (0.2 * R0)));
            const haloRho = (1 - side) * (R_IN + Math.max(r - R0, 0) * 2.6) + side * Math.max(r, R_IN);
            const halo = 1.2 * band * gas(ang - TILT, haloRho, t, w)[0] * (0.5 + 0.8 * top) * (1 - 0.25 * Math.cos(ang - TILT)) * haloGrow;
            const shock = t > FLASH ? Math.exp(-sq((r - R0 - (t - FLASH) * 0.55) / 0.02)) * Math.exp(-(t - FLASH) / 0.5) * 0.9 : 0;
            let soft = 1 - (1 - clip(aura * 0.55)) * (1 - clip(halo)) * (1 - clip(disk));
            soft = Math.max(soft, disk, halo);
            let heat = Math.max(ring * ringHeat, soft, shock) * (1 + 1.4 * flash);
            const inside = r < R0 * 0.97;
            if (inside) heat = v > 0 && disk > 0.2 ? disk : 0;
            heatMax = Math.max(heatMax, heat);
            const on = heat > 0.07;
            let char = on ? FILL[clip(Math.trunc(heat * 3.6), 0, 3)][mod(g.hash[i] + Math.trunc(phase * 2 + lr * 6), 12)] : AT[' '];
            if (on && ring > aura * 0.8 && ring > disk && ring > halo && ring > 0.25) {
                const s = mod(Math.atan2(-Math.cos(ang), -Math.sin(ang)) * 180 / Math.PI, 180);
                char = AT[s < 22.5 || s >= 157.5 ? '-' : s < 67.5 ? '/' : s < 112.5 ? '|' : '\\'];
            }
            let tag = heat < 0.1 ? 0 : heat < 0.2 ? 1 : heat < 0.45 ? 2 : heat < 0.75 ? 3 : 4;
            let lum = on ? clip(0.42 + 0.85 * heat, 0, 1.3) * (0.35 + 0.65 * smooth((heat - 0.07) / 0.15)) : 0;
            const star = !on && !inside && rnd < 0.0025;
            if (star) { char = AT[rnd < 0.0005 ? '+' : rnd < 0.0012 ? '*' : '.']; tag = 5; lum = 0.75 + 0.2 * Math.sin(0.8 * t + rnd * 9000); }
            const lane = Math.exp(-sq((-X * ST + Y * CT - 0.02) / 0.09));
            if (!on && !star && !inside && rnd > 1 - 0.035 * lane && t > 4) { char = AT[rnd > 1 - 0.01 * lane ? ':' : ',']; tag = 6; lum = laneLum; }
            g.char[i] = char; g.tag[i] = tag; g.lum[i] = lum;
            if (char !== AT[' ']) count++;
        }
        return {count, hud: `spin ${w.toFixed(2)}   heat ${heatMax.toFixed(2)}`};
    }

    // Night Tide's perspective Gerstner swells, breaking rollers and lace foam.
    const SWELLS = [[0.045,1.7,-0.05],[0.032,1.1,0.3],[0.03,0.65,0.1],[0.02,0.43,-0.45],[0.014,0.28,0.6],[0.009,0.18,-0.2],[0.007,0.115,1],[0.005,0.075,-0.85],[0.0028,0.048,0.45],[0.0018,0.032,-0.7]];
    const HORIZON = -0.28, EYE = 0.3, SHORE = 0.47, Z_FAR = 2.4, Z_BREAK = 0.78;
    const T_SWELL = 4, T_BORE = 2, T_SWASH = 3, PERIOD = 2.5, RISE = 0.09;
    const noise = (x, y, s) => (Math.sin(7.1 * x + 3.3 * Math.sin(5.3 * y + s) + s) + Math.sin(11.3 * y - 4.7 * x + 2 * s) + 0.6 * Math.sin(17 * x + 13 * y - s)) / 2.6;
    function lace(xw, z, seed, age) {
        const warp = noise(4 * xw, 15 * z, seed + 7);
        const n = noise(9 * xw + 1.5 * warp, 60 * z + 3 * warp, seed) + 0.5 * noise(23 * xw, 140 * z + warp, seed + 1);
        return smooth((n / 1.5 + 0.55 - 0.7 * age) / 0.3);
    }
    function prepareTide(g) {
        const cw = g.aspect / g.cols, row = 1 / g.rows;
        g.swells = SWELLS.map(([amp, lam, ang]) => {
            const k = TAU / lam, omega = TAU * Math.max(1, Math.round(LOOP * Math.sqrt(9.8 * k) / 8 / TAU)) / LOOP;
            const dx = Math.sin(ang), dz = -Math.cos(ang);
            const phase = new Float64Array(g.char.length), keep = new Float64Array(phase.length);
            for (let i = 0; i < phase.length; i++) {
                const z = EYE / Math.max(g.y[i] - HORIZON, 1e-3), xw = g.x[i] * z;
                const footprintX = dx * cw * z, footprintZ = dz * row * z * z / EYE;
                keep[i] = Math.exp(-sq(k * Math.sqrt(footprintX * footprintX + footprintZ * footprintZ) / 1.4));
                phase[i] = k * (dx * xw + dz * z) + 3.7 * lam;
            }
            return {amp, k, omega, dx, dz, phase, keep};
        });
        // A fixed deterministic field replaces NumPy's static RNG only.
        g.breakers = Array.from({length: 8}, (_, n) => {
            const rng = random(100 + n), size = 0.5 + 0.65 * rng(), angle = -0.9 + 1.8 * rng();
            const bend = -1.2 + 2.4 * rng(), late = -0.5 + rng();
            const zb = Z_BREAK + (1.15 - Z_BREAK) * (1.15 - size) / 0.65 - 0.05 + 0.1 * rng();
            const ts = T_SWELL * (Z_FAR - zb) / (Z_FAR - Z_BREAK), tb = T_BORE * (zb - SHORE) / Math.pow(Z_BREAK - SHORE, 0.6);
            return {size, angle, bend, late, zb, ts, tb, seed: n * 2.39, rise: RISE * size};
        });
    }

    function nighttide(g, t) {
        const row = 1 / g.rows, belowHorizon = HORIZON + 0.5 * row;
        const swells = g.swells.map(s => ({...s, timePhase: s.omega * t}));
        const waves = [];
        for (let n = Math.floor((t - 12) / PERIOD); n <= Math.floor(t / PERIOD); n++) {
            const breakerIndex = mod(n, 8), b = g.breakers[breakerIndex], columns = [];
            const seed = b.seed, waveTime = t - n * PERIOD - b.late;
            for (let c = 0; c < g.cols; c++) {
                const X = g.x[c];
                const brk = Math.max((0.35 + 0.65 * b.size) * smooth((noise(1.7 * X + seed, seed, breakerIndex) + 0.45 * b.size + 0.2) / 0.9), 0.35);
                const peel = b.angle * X + b.bend * X * X + 0.15 * Math.sin(2 * X + seed) + 0.06 * Math.sin(5.3 * X - seed);
                const a = waveTime + peel, since = a - b.ts;
                const grow = sq(clip(a / b.ts)) * (a > 0), tall = b.rise * grow * (1 - smooth(since / 0.5));
                const roll = Math.max(since, 0), burst = Math.sin(Math.PI * clip(since / 1.3));
                const lumps = 0.55 + 0.45 * Math.abs(Math.sin(31 * X + 2.1 * noise(5 * X, 0.4 * t, n) + 1.5 * t));
                columns.push({a, brk, since, grow, tall, roll, burst, lumps});
            }
            if (columns.some(c => c.a >= 0)) waves.push({...b, n, columns});
        }
        let count = 0, foamSum = 0;
        for (let i = 0; i < g.char.length; i++) {
            const X = g.x[i], Y = g.y[i], rnd = g.rnd[i], hash = g.hash[i];
            const below = Y > belowHorizon, z = EYE / Math.max(Y - HORIZON, 1e-3), xw = X * z;
            const water = below && z >= SHORE, beach = below && z < SHORE;
            // Nothing above the horizon is lit except the static star field.
            if (!below) {
                const star = rnd < 0.003 && Y < HORIZON - 0.04;
                g.char[i] = star ? AT[rnd < 0.0008 ? '+' : '.'] : AT[' '];
                g.tag[i] = 10; g.lum[i] = star ? 0.4 + 0.3 * Math.sin(0.9 * t + rnd * 7000) : 0;
                if (star) count++;
                continue;
            }
            let sx = 0, sz = 0, hgt = 0;
            for (const s of swells) {
                const ph = s.phase[i] - s.timePhase, sin = Math.sin(ph), steep = s.amp * s.k * s.keep[i];
                const slope = steep * Math.cos(ph) / (1 - 0.5 * steep * sin);
                sx += slope * s.dx; sz += slope * s.dz; hgt += s.amp * sin * s.keep[i];
            }
            let foam = 0, face = 0, lip = 0, spray = false, film = 0, wet = 0;
            for (const b of waves) {
                const {a, brk, since, grow, tall, roll, burst, lumps} = b.columns[i % g.cols];
                const {zb, ts, tb, seed, rise, n, size} = b;
                // All breaker fronts start at z=2.4; beyond here their Gaussian
                // tails are below floating-point display precision.
                if (z > 3.5) continue;
                const boreAge = clip(a - ts, 0, tb), swashAge = clip((a - ts - tb) / T_SWASH);
                const reach = 0.09 + 0.025 * Math.sin(2.3 * xw + seed);
                const front = a < ts ? Z_FAR - (Z_FAR - zb) * Math.max(a, 0) / ts : a < ts + tb ? zb - (zb - SHORE) * (1 - sq(1 - boreAge / tb)) : SHORE - reach * 4 * swashAge * (1 - swashAge);
                const yf = HORIZON + EYE / front;
                const d = z - front, wd = d < 0 ? 0.05 : 0.16;
                const bump = tall * Math.exp(-sq(d / wd));
                if (water) { sz += bump * (-2 * d / sq(wd)); hgt += bump; }
                const hs = tall / front;
                if (Y < yf && Y > yf - hs && since < 0.5) face = Math.max(face, 0.25 + 0.5 * (yf - Y) / Math.max(hs, 1e-4));
                if (since < 0.5) lip = Math.max(lip, Math.exp(-sq((Y - yf + hs) / (0.8 * row))) * grow);
                const peak = rise / zb;
                const hc = peak * (0.2 + 0.4 * burst) * lumps * zb / front;
                let wf = 0;
                // Evaluate the expensive foam noise only inside an active region.
                const hr = 0.5 * peak * (1 - 0.75 * smooth(roll / tb)) * lumps * zb / front;
                const crash = Y < yf && Y > yf - hc && since > 0 && since < 1.4;
                const roller = Y < yf && Y > yf - hr && since > 0.8 && since < tb;
                if (crash || roller) {
                    const boil = noise(19 * X + 0.4 * t, 23 * Y - 1.2 * t, n) + 0.5 * noise(41 * X, 47 * Y + 2 * t, n + 2);
                    if (crash) { const depth = clip((Y - yf + hc) / Math.max(hc, 1e-4)); wf = (1 - 0.35 * depth) * smooth((boil + 1.2 - 0.5 * depth) / 0.4); }
                    if (roller) { const rd = clip((Y - yf + hr) / Math.max(hr, 1e-4)); wf = Math.max(wf, (0.95 - 0.4 * rd) * smooth((boil + 0.8 - 0.5 * rd) / 0.4)); }
                }
                const mist = Y < yf - hc && Y > yf - peak * 1.8 * burst * zb / front;
                spray ||= mist && brk > 0.5 && since > 0.1 && since < 1.3 && rnd > 0.75 + 0.25 * (yf - Y) / (peak * 1.8 * zb / front + 1e-3);
                const behind = z - front, band = 0.04 + 0.15 * smooth(roll / 1.5);
                if (water && behind > -0.005 && behind < band && since > 0.3 && since < tb + 0.3) {
                    const fade = Math.pow(1 - clip(behind / band), 1.6), edge = Math.exp(-sq(behind / 0.012));
                    wf = Math.max(wf, (0.35 + 0.65 * fade) * lace(xw, z, seed, roll / 3.5) + 0.9 * edge);
                }
                if (water && behind > band && z < zb + 0.3 && since > 0.5) {
                    const clump = smooth((noise(3 * xw + seed, 12 * z, seed + 5) - 0.1) / 0.3);
                    wf = Math.max(wf, 0.6 * Math.exp(-roll / 2.2) * clump * lace(xw, z, seed + 3, 0.1));
                }
                const join = smooth((Math.max(since, 0) - 0.1) / (0.35 * tb));
                foam = Math.max(foam, wf * Math.max(brk, join * (0.85 + 0.15 * size)));
                if (beach) {
                    const u = clip((since - tb) / T_SWASH), sw = since > tb && u < 1;
                    const scallop = 0.008 * Math.sin(31 * xw + seed) + 0.004 * Math.sin(73 * xw - 2 * seed);
                    const rim = sw ? Math.exp(-sq((z - front - scallop) / 0.008)) : 0;
                    const left = u > 0.5 ? Math.exp(-sq((z - SHORE + reach - scallop) / 0.007)) * Math.exp(-Math.max(since - tb - 0.5 * T_SWASH, 0) / 1.6) : 0;
                    if (rim + left > 1e-12) foam = Math.max(foam, (rim * (1 - 0.4 * u) + 0.6 * left) * lace(xw, z * 2, seed + 1, 0.5 * u + 0.15));
                    if (z > front && sw) film = 1;
                    if (z > SHORE - reach && since > tb) wet = Math.max(wet, Math.exp(-Math.max(since - tb - T_SWASH, 0) / 2.5));
                }
            }
            foamSum += foam;
            const nl = Math.sqrt(sx * sx + 1 + sz * sz), nx = -sx / nl, ny = 1 / nl, nz = -sz / nl;
            const vl = Math.sqrt(xw * xw + EYE * EYE + z * z), vx = xw / vl, vy = -EYE / vl, vz = z / vl;
            const dot = vx * nx + vy * ny + vz * nz, ry = vy - 2 * dot * ny;
            const facing = clip(-dot), fresnel = 0.03 + 0.97 * Math.pow(1 - facing, 5);
            const sky = 0.35 + 0.65 * sq(1 - clip(ry)), dim = 0.45 + 0.55 * smooth((Y - HORIZON) / 0.2);
            let glow = 0.06 + fresnel * sky * 0.75 * dim + 0.08 * smooth(hgt / 0.06 + 0.5);
            const far = 1 - smooth((Y - HORIZON) / 0.25);
            glow = glow * (1 - 0.55 * far) + far * 0.42 * smooth((-sz + 0.01) / 0.05);
            let lum = clip(glow * 1.2 + 0.07 * Math.sin(rnd * 977 + t * (2.5 + 4 * rnd)));
            if (face > 0) lum = 0.12 + 0.3 * face;
            lum *= 1 - 0.75 * smooth(foam / 0.35);
            const churn = noise(2.2 * xw + 0.35 * t, 7 * z - 0.9 * t, 4) + 0.5 * Math.sin(1.7 * t + 9 * noise(xw, 3 * z, 8));
            const cap = water && z > Z_BREAK + 0.3 && foam < 0.1 && rnd < 0.8 && smooth((hgt / 0.05 - 0.5) / 0.3) * smooth((churn - 0.35) / 0.3) > 0.4;
            lum *= smooth((lum - 0.06) / 0.22);
            const show = (water || face > 0) && lum > 0.03;
            let char = show ? FILL[clip(Math.trunc(lum * 3.6), 0, 3)][mod(hash + Math.trunc(0.6 * t + 3 * hgt / 0.05), 12)] : AT[' '];
            if (show && lum > 0.8 && rnd < 0.4) char = AT['~'];
            let tag = clip(Math.trunc(lum * 6), 0, 5);
            if (!show) lum = 0;
            const twinkle = Math.sin(rnd * 431 + t * (3 + 7 * rnd) + 40 * hgt);
            const spec = smooth((lum - 0.2) / 0.25) * smooth((twinkle - 0.68) / 0.15);
            if (water && spec > 0.2 && foam < 0.3) { char = AT[spec > 0.7 ? (rnd < 0.5 ? '*' : '+') : (rnd < 0.5 ? '^' : '.')]; lum = clip(0.5 + 0.7 * spec, 0, 1.15); tag = spec > 0.55 ? 7 : 6; }
            if (cap) { char = FILL[1 + Math.trunc(rnd * 2)][mod(hash + Math.trunc(3 * t), 12)]; lum = 0.45 + 0.4 * dim; tag = 8; }
            if (lip > 0.4 && foam < 0.3) { char = AT['~']; lum = 0.4 + 0.45 * lip; tag = 4; }
            const fo = foam > 0.4 + 0.2 * rnd;
            if (fo) { char = FILL[clip(Math.trunc(3.2 * foam - 0.2), 1, 3)][mod(hash + Math.trunc(2 * t), 12)]; lum = clip(0.6 + 0.55 * foam, 0, 1.15); tag = 8; }
            if (spray && !fo) { char = AT[rnd > 0.8 ? '*' : '.']; lum = 0.8; tag = 8; }
            const sheet = beach && !fo && film > 0.5 && rnd < 0.4;
            if (sheet) { char = AT['-']; lum = 0.32; tag = 2; }
            if (beach && !fo && !sheet && rnd < 0.08 + 0.15 * wet) { char = AT[rnd < 0.03 ? ':' : ',']; lum = 0.2 + 0.2 * wet; tag = 9; }
            g.char[i] = char; g.lum[i] = lum; g.tag[i] = tag;
            if (char !== AT[' ']) count++;
        }
        return {count, hud: `swells ${SWELLS.length}   foam ${(foamSum / g.char.length * 100).toFixed(2)}`};
    }

    async function loadCat() {
        if (!catDataPromise) catDataPromise = (async () => {
            if (typeof DecompressionStream === 'undefined') throw new Error('Cat Knight needs a browser with gzip DecompressionStream support.');
            const response = await fetch(new URL('catknight_frames.bin.gz', moduleURL));
            if (!response.ok) throw new Error(`Cat Knight data: HTTP ${response.status}`);
            const bytes = await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
            const view = new DataView(bytes);
            if (bytes.byteLength < 24 || view.getUint32(0, false) !== 0x4a32434b) throw new Error('Invalid Cat Knight data.');
            const [version, frames, rows, cols, fps] = Array.from({length: 5}, (_, i) => view.getUint32(4 + 4 * i, true));
            if (version !== 1 || frames !== 600 || rows !== 87 || cols !== 154 || fps !== 30 || bytes.byteLength !== 24 + 480 + frames * 8 + frames * rows * cols * 3) throw new Error('Unsupported Cat Knight data layout.');
            let offset = 24;
            const floats = n => { const a = Float32Array.from({length: n}, (_, i) => view.getFloat32(offset + i * 4, true)); offset += n * 4; return a; };
            const palette = floats(120), zoom = floats(frames), wind = floats(frames);
            const colors = Array.from({length: 40}, (_, i) => Array.from(palette.subarray(i * 3, i * 3 + 3), x => x * 255));
            const data = new Uint8Array(bytes, offset);
            for (let f = 0; f < frames; f++) {
                const base = f * rows * cols * 3;
                for (let j = 0; j < rows * cols; j++) if (data[base + j] >= CHARS.length || data[base + rows * cols * 2 + j] >= 40) throw new Error('Invalid Cat Knight letter or color index.');
            }
            return {frames, rows, cols, fps, colors, zoom, wind, data};
        })().catch(error => { catDataPromise = null; throw error; });
        return catDataPromise;
    }

    function surface(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
    function glyphAtlas(cw, ch, fontSize) {
        const c = surface(cw, ch), ctx = c.getContext('2d', {willReadFrequently: true});
        ctx.font = `${fontSize}px Consolas, Menlo, "DejaVu Sans Mono", monospace`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff';
        return [...CHARS].map(letter => {
            ctx.clearRect(0, 0, cw, ch); ctx.fillText(letter, cw / 2, ch / 2);
            const pixels = ctx.getImageData(0, 0, cw, ch).data;
            return Uint8Array.from({length: cw * ch}, (_, i) => pixels[i * 4 + 3]);
        });
    }
    function tintedGlyphAtlas(cw, ch, fontSize, colors) {
        const columns = CHARS.length - 1, c = surface(columns * cw, colors.length * ch);
        const ctx = c.getContext('2d');
        ctx.font = `${fontSize}px Consolas, Menlo, "DejaVu Sans Mono", monospace`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for (let tag = 0; tag < colors.length; tag++) {
            const [red, green, blue] = colors[tag];
            for (let char = 1; char < CHARS.length; char++) {
                const x = (char - 1) * cw, y = tag * ch;
                // source-in must affect only this tile, preserving earlier tiles.
                ctx.save(); ctx.beginPath(); ctx.rect(x, y, cw, ch); ctx.clip();
                ctx.fillStyle = '#fff'; ctx.fillText(CHARS[char], x + cw / 2, y + ch / 2);
                ctx.globalCompositeOperation = 'source-in';
                ctx.fillStyle = `rgb(${red},${green},${blue})`; ctx.fillRect(x, y, cw, ch);
                ctx.restore();
            }
        }
        return c;
    }

    async function open(piece, options = {}) {
        if (!['blackhole','nighttide','catknight'].includes(piece)) throw new Error('Unknown JIN2 piece.');
        active?.close();
        window.KraDwc?.close();
        const reduced = matchMedia('(prefers-reduced-motion: reduce)');
        const canvas = document.createElement('canvas');
        canvas.id = 'jin2-canvas'; canvas.tabIndex = 0;
        canvas.setAttribute('role', 'dialog'); canvas.setAttribute('aria-modal', 'true');
        canvas.setAttribute('aria-label', `${piece} — ASCII art by JIN2. Escape or q exits, space pauses, r restarts. Tap to exit.`);
        canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100dvh;background:#000;z-index:2147483647;outline:none;touch-action:none;';
        const previousFocus = document.activeElement, selection = getSelection();
        const ranges = Array.from({length: selection.rangeCount}, (_, i) => selection.getRangeAt(i).cloneRange());
        const scrolls = [document.scrollingElement, document.querySelector('.terminal')].filter(Boolean).map(el => [el, el.scrollLeft, el.scrollTop]);
        document.body.appendChild(canvas); canvas.focus({preventScroll: true});
        // Black Hole's expanded disk reaches past the old 1080-wide grid and was
        // clipped at the left/right edges; it gets a wider art surface (184 cols,
        // +/-0.673 world units > the disk's 0.653). Other pieces keep 1080x960.
        const artW = piece === 'blackhole' ? 1288 : W, artH = H;
        const ctx = canvas.getContext('2d'), art = surface(artW, artH), artCtx = art.getContext('2d');
        const overlay = surface(artW, artH), overlayCtx = overlay.getContext('2d');
        const overlayImage = overlayCtx.createImageData(artW, artH), brightCells = [];
        resetArt();
        const glows = [[4,5,0.75],[8,22,0.45]].map(([k, radius, alpha]) => {
            const layer = surface(Math.floor(artW / k), Math.floor(artH / k));
            return {layer, context: layer.getContext('2d'), radius: radius / k, alpha};
        });
        let cat, g, atlas, masks, colors, cw, ch, fade;
        let closed = false, raf = 0, last = 0, nextFrame = 0, ready = false, errorText = '';
        let t = Number.isFinite(options.time) ? mod(options.time, LOOP) : reduced.matches ? 13 : 0;
        let paused = !!options.paused;
        let info = {count: 0, hud: 'loading letters…'};

        function close() {
            if (closed) return;
            closed = true; cancelAnimationFrame(raf);
            window.removeEventListener('keydown', key, true);
            window.removeEventListener('resize', resize, true);
            document.removeEventListener('visibilitychange', visibility);
            reduced.removeEventListener('change', motionChange);
            canvas.remove(); if (active?.close === close) active = null;
            const focus = previousFocus?.isConnected && previousFocus !== document.body ? previousFocus : document.getElementById('input');
            focus?.focus({preventScroll: true});
            if (ranges.length) { selection.removeAllRanges(); ranges.forEach(range => selection.addRange(range)); }
            scrolls.forEach(([el, x, y]) => { el.scrollLeft = x; el.scrollTop = y; });
        }
        active = {close};
        function key(e) {
            e.preventDefault(); e.stopImmediatePropagation();
            if (e.repeat) return;
            if (e.key === 'Escape' || e.key.toLowerCase() === 'q') close();
            else if (e.key === ' ' && !reduced.matches) { paused = !paused; cancelAnimationFrame(raf); raf = 0; resetClock(); schedule(); }
            else if (e.key.toLowerCase() === 'r') restart();
        }
        function restart() {
            if (ready) { t = 0; resetArt(); drawFrame(); resetClock(); schedule(); }
        }
        window.addEventListener('keydown', key, true);
        // Gallery previews load in a non-interactive iframe without the terminal script.
        window.bindArtPointerControls?.(canvas, close, restart);
        canvas.addEventListener('wheel', e => { e.preventDefault(); e.stopPropagation(); }, {passive: false});
        function resize() {
            const dpr = Math.min(devicePixelRatio || 1, 2);
            canvas.width = Math.round(innerWidth * dpr); canvas.height = Math.round(innerHeight * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0); present();
        }
        window.addEventListener('resize', resize, true);
        function motionChange() {
            cancelAnimationFrame(raf); raf = 0;
            if (reduced.matches && ready) { t = 13; resetArt(); drawFrame(); }
            resetClock(); schedule();
        }
        reduced.addEventListener('change', motionChange);
        function present() {
            const width = innerWidth, height = innerHeight;
            ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.filter = 'none';
            ctx.fillStyle = '#000'; ctx.fillRect(0, 0, width, height);
            const scale = Math.min(width / artW, height / artH), dw = artW * scale, dh = artH * scale, dx = (width - dw) / 2, dy = (height - dh) / 2;
            ctx.drawImage(art, dx, dy, dw, dh);
            if (ready) {
                ctx.globalCompositeOperation = 'lighter';
                for (const {layer, context, radius, alpha} of glows) {
                    // Like pygame: blur at 1/4 and 1/8 size, then scale up.
                    context.clearRect(0, 0, layer.width, layer.height);
                    context.filter = `blur(${radius}px)`;
                    context.drawImage(art, 0, 0, layer.width, layer.height);
                    ctx.globalAlpha = alpha;
                    ctx.drawImage(layer, dx, dy, dw, dh);
                }
                ctx.filter = 'none'; ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
            }
            const pad = Math.min(32, width * 0.04), font = width < 500 ? 11 : 13;
            ctx.font = `${font}px Consolas, Menlo, monospace`; ctx.textBaseline = 'top'; ctx.textAlign = 'left';
            const photoCredit = '· photo belongs to its creator';
            const lines = [];
            lines.push([`@jin_22ee · 2026${piece === 'catknight' && width >= 540 ? ' ' + photoCredit : ''}`, pad, height - 103, '#787080']);
            if (piece === 'catknight' && width < 540) lines.push([photoCredit, pad, height - 87, '#787080']);
            lines.push([errorText || info.hud, pad, height - 66, '#6e6878']);
            lines.push([`letters ${info.count.toLocaleString('en-US', {minimumIntegerDigits: 5})}`, pad, height - 48, '#6e6878']);
            if (reduced.matches) lines.push(['(still frame — reduced motion)', pad, height - 30, '#6e6878']);
            const hint = matchMedia('(pointer: coarse)').matches ? 'tap exit' : 'esc exit · space pause · r or click restart';
            lines.push([hint, pad, height - 14, '#57505f']);
            // Per-line backing keeps the HUD legible without a full-width dark band over the art.
            ctx.fillStyle = '#000c';
            for (const [text, x, y] of lines) {
                if (!text) continue;
                ctx.fillRect(x - 6, y - 3, Math.min(ctx.measureText(text).width, width - 2 * pad) + 12, font + 7);
            }
            for (const [text, x, y, color] of lines) {
                if (!text) continue;
                ctx.fillStyle = color; ctx.fillText(text, x, y, width - 2 * pad);
            }
            const clock = `${Math.floor(t * 2) % 2 === 0 ? '●' : ' '} t ${t.toFixed(2).padStart(5, '0')}s${paused && !reduced.matches ? ' · paused' : ''}`;
            ctx.fillStyle = '#000c';
            ctx.fillRect(width - pad - ctx.measureText(clock).width - 6, 21, ctx.measureText(clock).width + 12, font + 7);
            ctx.fillStyle = '#ff7ab6'; ctx.textAlign = 'right';
            ctx.fillText(clock, width - pad, 24);
            canvas.dataset.time = t.toFixed(4); canvas.dataset.paused = String(paused || reduced.matches);
        }
        function drawFrame() {
            if (!ready || closed) return;
            if (cat) {
                const f = Math.min(Math.floor(t * cat.fps), cat.frames - 1), size = g.cols * g.rows;
                const start = f * size * 3;
                g.char = cat.data.subarray(start, start + size); g.tag = cat.data.subarray(start + size * 2, start + size * 3);
                let count = 0;
                for (let i = 0; i < size; i++) { g.lum[i] = cat.data[start + size + i] / 255; if (g.char[i] !== AT[' ']) count++; }
                info = {count, hud: `zoom ${cat.zoom[f].toFixed(2)}   wind ${cat.wind[f].toFixed(2)}`};
            } else info = piece === 'blackhole' ? blackhole(g, t) : nighttide(g, t);
            artCtx.globalCompositeOperation = 'source-over'; artCtx.globalAlpha = 1;
            artCtx.fillStyle = `rgba(0,0,0,${1 - fade})`; artCtx.fillRect(0, 0, artW, artH);
            brightCells.length = 0;
            for (let cell = 0; cell < g.char.length; cell++) {
                const char = g.char[cell];
                if (char === AT[' ']) continue;
                const lum = piece === 'blackhole' ? g.lum[cell] : clip(g.lum[cell]);
                if (lum > 1) { brightCells.push(cell, lum); continue; }
                const sx = (char - 1) * cw, sy = g.tag[cell] * ch;
                const x = cell % g.cols * cw, y = Math.floor(cell / g.cols) * ch;
                artCtx.globalCompositeOperation = 'lighten'; artCtx.globalAlpha = clip(lum);
                artCtx.drawImage(atlas, sx, sy, cw, ch, x, y, cw, ch);
            }
            if (brightCells.length) {
                const pixels = overlayImage.data;
                pixels.fill(0);
                for (let i = 0; i < brightCells.length; i += 2) {
                    const cell = brightCells[i], lum = brightCells[i + 1];
                    const glyph = masks[g.char[cell]], color = colors[g.tag[cell]];
                    const red = clip(color[0] * lum, 0, 255) / 255, green = clip(color[1] * lum, 0, 255) / 255, blue = clip(color[2] * lum, 0, 255) / 255;
                    const x = cell % g.cols * cw, y = Math.floor(cell / g.cols) * ch;
                    for (let gy = 0; gy < ch; gy++) {
                        let dest = ((y + gy) * artW + x) * 4;
                        for (let gx = 0; gx < cw; gx++, dest += 4) {
                            const mask = glyph[gy * cw + gx];
                            pixels[dest] = mask * red;
                            pixels[dest + 1] = mask * green;
                            pixels[dest + 2] = mask * blue;
                            pixels[dest + 3] = 255;
                        }
                    }
                }
                overlayCtx.putImageData(overlayImage, 0, 0);
                artCtx.globalCompositeOperation = 'lighten'; artCtx.globalAlpha = 1;
                artCtx.drawImage(overlay, 0, 0);
            }
            artCtx.globalAlpha = 1; artCtx.globalCompositeOperation = 'source-over';
            present();
        }
        function resetArt() {
            artCtx.globalCompositeOperation = 'source-over'; artCtx.globalAlpha = 1;
            artCtx.fillStyle = '#000'; artCtx.fillRect(0, 0, artW, artH);
        }

        function schedule() {
            if (!closed && ready && !raf) {
                if (!paused && !reduced.matches && !document.hidden) raf = requestAnimationFrame(tick);
                else present();
            }
        }
        function tick(now) {
            raf = 0;
            if (closed || paused || reduced.matches) return;
            if (now >= nextFrame - 0.5) {
                t += Math.min((now - last) / 1000, 1 / 15); last = now;
                // Preserve the cadence when rAF arrives a little late.
                nextFrame = Math.max(nextFrame + 1000 / 30, now);
                if (piece === 'catknight' && t >= LOOP) { t = mod(t, LOOP); resetArt(); }
                drawFrame();
            }
            schedule();
        }
        function resetClock() { last = performance.now(); nextFrame = last + 1000 / 30; }
        function visibility() { resetClock(); schedule(); }
        document.addEventListener('visibilitychange', visibility);
        canvas.addEventListener('blur', () => { if (!closed) canvas.focus({preventScroll: true}); });
        resize();
        try {
            if (piece === 'catknight') cat = await loadCat();
            if (closed) return;
            cw = piece === 'nighttide' ? 6 : 7; ch = piece === 'nighttide' ? 9 : 11;
            g = grid(Math.floor(artW / cw), Math.floor(artH / ch), cw, ch, piece === 'blackhole' ? 7 : 9);
            if (piece === 'nighttide') prepareTide(g);
            colors = cat ? cat.colors : piece === 'blackhole' ? BH_COLORS : NT_COLORS;
            fade = piece === 'nighttide' ? 0.5 : 0.4;
            atlas = tintedGlyphAtlas(cw, ch, piece === 'nighttide' ? 10 : 12, colors);
            masks = glyphAtlas(cw, ch, piece === 'nighttide' ? 10 : 12);
            ready = true;
            canvas.dataset.ready = 'true'; drawFrame(); resetClock(); schedule();
        } catch (error) {
            if (!closed) { errorText = `${error.message} Press esc to exit.`; canvas.dataset.error = error.message; present(); }
        }
    }
    window.KraJin2 = {open, close: () => active?.close(), isOpen: () => !!active};
})();
