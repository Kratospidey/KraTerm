/* Eiffel Tower and Universe: frame-accurate web playback of @dwcminh.ascii's
 * Python ASCII animations (2026). Personal, noncommercial use with credit only.
 * Original artwork/algorithms belong to @dwcminh.ascii; see LICENSE-dwcminh-ascii.
 * Source: https://github.com/dwcminh/ascii-art (EIFFEL-TOWER, UNIVERSE)
 * Frames are pre-rendered from the unmodified Python and replayed here with the
 * same glyph atlas, motion trails and double glow as the original renderer.
 */
(() => {
    'use strict';
    const W = 792, H = 1036, CW = 9, CH = 14, FONT_PX = 15, FPS = 30;
    const FRAME_MS = 1000 / FPS;
    const COLORS = 240;
    const letterCount = new Intl.NumberFormat('en-US', {minimumIntegerDigits: 5});
    const GLYPHS = 95; // ASCII 32..126, index 0 is the space
    const moduleURL = new URL(document.currentScript.src);
    const PIECES = {
        eiffel: {file: 'eiffel_frames.bin.gz', still: 16},
        universe: {file: 'universe_frames.bin.gz', still: 20},
    };
    const clip = (x, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));
    const wrap = (x, n) => x < 0 ? (x % n + n) % n : x % n;
    const dataPromises = {};
    let active;

    function surface(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

    function tintedGlyphAtlas(colors) {
        const c = surface((GLYPHS - 1) * CW, colors.length * CH), ctx = c.getContext('2d');
        ctx.font = `${FONT_PX}px Consolas, Menlo, "DejaVu Sans Mono", monospace`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for (let tag = 0; tag < colors.length; tag++) {
            const [red, green, blue] = colors[tag];
            for (let g = 1; g < GLYPHS; g++) {
                const x = (g - 1) * CW, y = tag * CH;
                ctx.save(); ctx.beginPath(); ctx.rect(x, y, CW, CH); ctx.clip();
                ctx.fillStyle = '#fff'; ctx.fillText(String.fromCharCode(32 + g), x + CW / 2, y + CH / 2);
                ctx.globalCompositeOperation = 'source-in';
                ctx.fillStyle = `rgb(${red},${green},${blue})`; ctx.fillRect(x, y, CW, CH);
                ctx.restore();
            }
        }
        return c;
    }

    async function loadPiece(piece) {
        if (!dataPromises[piece]) dataPromises[piece] = (async () => {
            if (typeof DecompressionStream === 'undefined') throw new Error('Needs a browser with gzip DecompressionStream support.');
            const url = new URL(PIECES[piece].file, moduleURL);
            url.search = moduleURL.search;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`${piece} data: HTTP ${response.status}`);
            const bytes = await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
            const view = new DataView(bytes);
            if (bytes.byteLength < 28 || view.getUint32(0, false) !== 0x4457434D) throw new Error('Invalid animation data.');
            const [version, frames, rows, cols, fps] = Array.from({length: 5}, (_, i) => view.getUint32(4 + 4 * i, true));
            let offset = 24;
            const metaLen = view.getUint32(offset, true); offset += 4;
            const size = rows * cols;
            const expected = 28 + metaLen + 768 + frames * 8 + frames * size * 2;
            if (version !== 1 || rows !== 74 || cols !== 88 || fps !== FPS || !frames || bytes.byteLength !== expected) throw new Error('Unsupported animation data layout.');
            const meta = JSON.parse(new TextDecoder().decode(new Uint8Array(bytes, offset, metaLen)));
            offset += metaLen;
            if (meta.loop !== frames / fps || !Array.isArray(meta.hud)) throw new Error('Invalid animation metadata.');
            const pal = new Uint8Array(bytes, offset, 768); offset += 768;
            const colors = Array.from({length: COLORS}, (_, i) => [pal[i * 3], pal[i * 3 + 1], pal[i * 3 + 2]]);
            // The writer stores all A values, then all B values, then all trail values.
            const metaA = Uint16Array.from({length: frames}, (_, i) => view.getUint16(offset + i * 2, true)); offset += frames * 2;
            const metaB = Uint16Array.from({length: frames}, (_, i) => view.getUint16(offset + i * 2, true)); offset += frames * 2;
            const trail = Float32Array.from({length: frames}, (_, i) => view.getFloat32(offset + i * 4, true)); offset += frames * 4;
            // Each frame then stores its whole character plane followed by its color plane.
            const data = new Uint8Array(bytes, offset);
            for (let f = 0; f < frames; f++) {
                if (!Number.isFinite(trail[f]) || (piece === 'universe' && typeof meta.hud[metaA[f]] !== 'string')) throw new Error('Invalid frame metadata.');
                const base = f * size * 2;
                for (let j = 0; j < size; j++) if (data[base + j] >= GLYPHS || data[base + size + j] >= COLORS) throw new Error('Invalid letter or color index.');
            }
            return {frames, cols, colors, metaA, metaB, trail, hud: meta.hud, size, data};
        })().catch(error => { delete dataPromises[piece]; throw error; });
        return dataPromises[piece];
    }

    async function open(piece, options = {}) {
        if (!Object.hasOwn(PIECES, piece)) throw new Error('Unknown ASCII piece.');
        active?.close();
        window.KraJin2?.close();
        const reduced = matchMedia('(prefers-reduced-motion: reduce)');
        const canvas = document.createElement('canvas');
        canvas.id = 'jin2-canvas'; canvas.tabIndex = 0;
        canvas.setAttribute('role', 'dialog'); canvas.setAttribute('aria-modal', 'true');
        canvas.setAttribute('aria-label', `${piece} — ASCII art by @dwcminh.ascii. Escape or q exits, space pauses, r restarts. Tap to exit.`);
        canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100dvh;background:#000;z-index:2147483647;outline:none;touch-action:none;';
        const previousFocus = document.activeElement, selection = getSelection();
        const ranges = Array.from({length: selection.rangeCount}, (_, i) => selection.getRangeAt(i).cloneRange());
        const scrolls = [document.scrollingElement, document.querySelector('.terminal')].filter(Boolean).map(el => [el, el.scrollLeft, el.scrollTop]);
        const ctx = canvas.getContext('2d'), art = surface(W, H), artCtx = art.getContext('2d');
        if (!ctx || !artCtx) throw new Error('Canvas 2D is unavailable.');
        artCtx.imageSmoothingEnabled = false; // Glyph tiles are copied at their native size.
        const glows = [[4,5,0.75],[8,22,0.45]].map(([k, radius, alpha]) => {
            const layer = surface(Math.floor(W / k), Math.floor(H / k));
            const context = layer.getContext('2d');
            if (!context) throw new Error('Canvas 2D is unavailable.');
            context.filter = `blur(${radius / k}px)`;
            return {layer, context, alpha};
        });
        document.body.appendChild(canvas); canvas.focus({preventScroll: true});
        const coarse = matchMedia('(pointer: coarse)');
        const viewport = window.visualViewport;
        let d, atlas, width, height, dx, dy, dw, dh;
        let closed = false, raf = 0, nextFrame = 0, ready = false, errorText = '';
        let position = 0;
        let paused = !!options.paused;
        let info = {count: 0, hud: 'loading letters…'};
        resetArt();

        function close() {
            if (closed) return;
            closed = true; cancelAnimationFrame(raf);
            window.removeEventListener('keydown', key, true);
            window.removeEventListener('resize', resize, true);
            viewport?.removeEventListener('resize', resize);
            document.removeEventListener('visibilitychange', visibility);
            reduced.removeEventListener('change', motionChange);
            atlas?.close();
            canvas.remove(); if (active?.close === close) active = null;
            const focus = previousFocus?.isConnected && previousFocus !== document.body ? previousFocus : document.getElementById('input');
            focus?.focus({preventScroll: true});
            selection.removeAllRanges();
            ranges.forEach(range => selection.addRange(range));
            scrolls.forEach(([el, x, y]) => { el.scrollLeft = x; el.scrollTop = y; });
        }
        active = {close};
        function key(e) {
            e.preventDefault(); e.stopImmediatePropagation();
            if (e.repeat) return;
            if (e.key === 'Escape' || e.key.toLowerCase() === 'q') close();
            else if (e.key === ' ' && !reduced.matches) {
                paused = !paused;
                cancelAnimationFrame(raf); raf = 0;
                resetClock(); present(); schedule();
            }
            else if (e.key.toLowerCase() === 'r') restart();
        }
        function restart() {
            if (ready) { position = 0; resetArt(); drawFrame(); resetClock(); schedule(); }
        }
        window.addEventListener('keydown', key, true);
        // Gallery previews load in a non-interactive iframe without the terminal script.
        window.bindArtPointerControls?.(canvas, close, restart);
        canvas.addEventListener('wheel', e => { e.preventDefault(); e.stopPropagation(); }, {passive: false});
        function resize() {
            const dpr = Math.min(devicePixelRatio || 1, 2);
            ({width, height} = canvas.getBoundingClientRect());
            canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
            const scale = Math.min(width / W, height / H);
            dw = W * scale; dh = H * scale; dx = (width - dw) / 2; dy = (height - dh) / 2;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0); present();
        }
        window.addEventListener('resize', resize, true);
        viewport?.addEventListener('resize', resize);
        function motionChange() {
            cancelAnimationFrame(raf); raf = 0;
            if (reduced.matches && ready) {
                position = PIECES[piece].still * FPS;
                resetArt(); drawFrame();
            } else present();
            resetClock(); schedule();
        }
        reduced.addEventListener('change', motionChange);
        function present() {
            ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.filter = 'none';
            ctx.fillStyle = '#000'; ctx.fillRect(0, 0, width, height);
            ctx.drawImage(art, dx, dy, dw, dh);
            if (ready) {
                ctx.globalCompositeOperation = 'lighter';
                for (const {layer, context, alpha} of glows) {
                    // Like pygame: blur at 1/4 and 1/8 size, then scale up.
                    context.clearRect(0, 0, layer.width, layer.height);
                    context.drawImage(art, 0, 0, layer.width, layer.height);
                    ctx.globalAlpha = alpha;
                    ctx.drawImage(layer, dx, dy, dw, dh);
                }
                ctx.filter = 'none'; ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
            }
            const pad = Math.min(32, width * 0.04), font = width < 500 ? 11 : 13;
            ctx.font = `${font}px Consolas, Menlo, monospace`; ctx.textBaseline = 'top'; ctx.textAlign = 'left';
            const lines = [];
            lines.push([`@dwcminh.ascii · 2026`, pad, height - 103, '#787080']);
            lines.push([errorText || info.hud, pad, height - 66, '#6e6878']);
            lines.push([`letters ${letterCount.format(info.count)}`, pad, height - 48, '#6e6878']);
            if (reduced.matches) lines.push(['(still frame — reduced motion)', pad, height - 30, '#6e6878']);
            const hint = coarse.matches ? 'tap exit' : 'esc exit · space pause · r or click restart';
            lines.push([hint, pad, height - 14, '#57505f']);
            // Per-line backing keeps the HUD legible without a full-width dark band over the art.
            const maxWidth = width - 2 * pad;
            ctx.fillStyle = '#000c';
            for (const [text, x, y] of lines) {
                if (!text) continue;
                ctx.fillRect(x - 6, y - 3, Math.min(ctx.measureText(text).width, maxWidth) + 12, font + 7);
            }
            for (const [text, x, y, color] of lines) {
                if (!text) continue;
                ctx.fillStyle = color; ctx.fillText(text, x, y, maxWidth);
            }
            const t = position / FPS;
            ctx.textAlign = 'right';
            const clock = `${Math.floor(t * 2) % 2 === 0 ? '●' : ' '} t ${t.toFixed(2).padStart(5, '0')}s${paused && !reduced.matches ? ' · paused' : ''}`;
            ctx.fillStyle = '#000c';
            const clockWidth = ctx.measureText(clock).width;
            ctx.fillRect(width - pad - clockWidth - 6, 21, clockWidth + 12, font + 7);
            ctx.fillStyle = '#ff7ab6';
            ctx.fillText(clock, width - pad, 24);
            canvas.dataset.time = t.toFixed(4); canvas.dataset.paused = String(paused || reduced.matches);
        }
        function drawFrame() {
            if (!ready || closed) return;
            const f = Math.floor(position), size = d.size;
            const start = f * size * 2;
            const chars = start, tags = start + size;
            const fade = clip(d.trail[f], 0, 0.95);
            let count = 0;
            artCtx.globalCompositeOperation = 'source-over'; artCtx.globalAlpha = 1;
            artCtx.fillStyle = `rgba(0,0,0,${1 - fade})`; artCtx.fillRect(0, 0, W, H);
            for (let cell = 0; cell < size; cell++) {
                const char = d.data[chars + cell];
                if (char === 0) continue;
                count++;
                const sx = (char - 1) * CW, sy = d.data[tags + cell] * CH;
                const x = cell % d.cols * CW, y = Math.floor(cell / d.cols) * CH;
                artCtx.drawImage(atlas, sx, sy, CW, CH, x, y, CW, CH);
            }
            info = piece === 'eiffel'
                ? {count, hud: `sparkles ${String(d.metaA[f]).padStart(4, ' ')}      fireworks ${String(d.metaB[f]).padStart(4, ' ')}`}
                : {count, hud: d.hud[d.metaA[f]] || ''};
            present();
        }
        function resetArt() {
            artCtx.globalCompositeOperation = 'source-over'; artCtx.globalAlpha = 1;
            artCtx.fillStyle = '#000'; artCtx.fillRect(0, 0, W, H);
        }
        function schedule() {
            if (!closed && ready && !raf && !paused && !reduced.matches && !document.hidden) {
                raf = requestAnimationFrame(tick);
            }
        }
        function tick(now) {
            raf = 0;
            if (closed || paused || reduced.matches || document.hidden) return;
            if (now >= nextFrame - 0.5) {
                // Advance by frame intervals so rAF jitter cannot repeat a frame.
                const steps = now >= nextFrame + FRAME_MS ? 2 : 1;
                nextFrame = Math.max(nextFrame + steps * FRAME_MS, now);
                position += steps;
                if (position >= d.frames) { position %= d.frames; resetArt(); }
                drawFrame();
            }
            schedule();
        }
        function resetClock() { nextFrame = performance.now() + FRAME_MS; }
        function visibility() { resetClock(); schedule(); }
        document.addEventListener('visibilitychange', visibility);
        canvas.addEventListener('blur', () => { if (!closed) canvas.focus({preventScroll: true}); });
        resize();
        try {
            d = await loadPiece(piece);
            if (closed) return;
            const startTime = Number.isFinite(options.time) ? options.time : reduced.matches ? PIECES[piece].still : 0;
            position = wrap(startTime, d.frames / FPS) * FPS;
            if (position >= d.frames) position = 0;
            // The glyph tiles are immutable during playback.
            atlas = await createImageBitmap(tintedGlyphAtlas(d.colors));
            if (closed) { atlas.close(); return; }
            ready = true;
            canvas.dataset.ready = 'true'; drawFrame(); resetClock(); schedule();
        } catch (error) {
            if (!closed) { errorText = `${error.message} Press esc to exit.`; canvas.dataset.error = error.message; present(); }
        }
    }
    window.KraDwc = {open, close: () => active?.close(), isOpen: () => !!active};
})();
