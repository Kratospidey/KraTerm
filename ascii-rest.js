const version = new URL(import.meta.url).search;
const tile = 8;
let active;

async function renderer(slug) {
    const {meta, default: createFrame} = await import(`./ascii-rest-pieces/${slug}.js${version}`);
    const {cols, rows, cell, ground, palette} = meta;
    const frame = createFrame();
    const env = {color: new Uint8Array(cols * rows)};
    const color = env.color;
    const previousGlyph = new Uint8Array(color.length);
    const previousColor = new Uint8Array(color.length);
    const art = document.createElement('canvas');
    const height = tile * cell;
    art.width = cols * tile;
    art.height = rows * height;
    const ctx = art.getContext('2d', {alpha: false});
    ctx.fillStyle = ground;
    ctx.fillRect(0, 0, art.width, art.height);

    // The upstream scenes use three sizes of halftone dot and a blank.
    // Opaque atlas tiles overwrite changed cells in one copy.
    const glyphs = ' ·•●';
    const glyphIndex = new Uint8Array('●'.charCodeAt(0) + 1);
    const atlas = document.createElement('canvas');
    atlas.width = glyphs.length * tile;
    atlas.height = palette.length * height;
    const ink = atlas.getContext('2d', {alpha: false});
    ink.fillStyle = ground;
    ink.fillRect(0, 0, atlas.width, atlas.height);
    ink.font = `${tile / 0.6}px ui-monospace, Menlo, Consolas, monospace`;
    ink.textAlign = 'center';
    ink.textBaseline = 'middle';
    for (let g = 1; g < glyphs.length; g++) {
        glyphIndex[glyphs.charCodeAt(g)] = g;
        for (let tag = 0; tag < palette.length; tag++) {
            const x = g * tile, y = tag * height;
            ink.save();
            ink.beginPath();
            ink.rect(x, y, tile, height);
            ink.clip();
            ink.fillStyle = palette[tag];
            ink.fillText(glyphs[g], x + tile / 2, y + height / 2);
            ink.restore();
        }
    }

    function draw(time) {
        const lines = frame(time, env).split('\n');
        let i = 0;
        for (let row = 0; row < rows; row++) {
            const line = lines[row];
            for (let col = 0; col < cols; col++, i++) {
                const glyph = glyphIndex[line.charCodeAt(col)];
                const tag = glyph ? color[i] : 0;
                if (previousGlyph[i] === glyph && previousColor[i] === tag) continue;
                previousGlyph[i] = glyph;
                previousColor[i] = tag;
                ctx.drawImage(atlas, glyph * tile, tag * height,
                    tile, height, col * tile, row * height, tile, height);
            }
        }
    }
    return {art, draw, fps: meta.fps};
}

function fit(ctx, image, width, height, bounds = [0, 0, image.width, image.height]) {
    const scale = Math.min(width / bounds[2], height / bounds[3]);
    const w = bounds[2] * scale, h = bounds[3] * scale;
    ctx.drawImage(image, ...bounds, (width - w) / 2, (height - h) / 2, w, h);
}

async function open(piece, options = {}) {
    active?.close();
    window.KraJin2?.close();
    window.KraDwc?.close();
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const coarse = matchMedia('(pointer: coarse)');
    const controller = new AbortController();
    const {signal} = controller;
    const canvas = document.createElement('canvas');
    canvas.id = 'ascii-rest-canvas';
    canvas.tabIndex = 0;
    canvas.setAttribute('role', 'dialog');
    canvas.setAttribute('aria-modal', 'true');
    canvas.setAttribute('aria-label', `${piece.name} by @bas3line. Escape or q exits, space pauses, r restarts. Tap to exit.`);
    const ctx = canvas.getContext('2d', {alpha: false});
    const previousFocus = document.activeElement;
    const selection = getSelection();
    const ranges = Array.from({length: selection.rangeCount}, (_, i) => selection.getRangeAt(i).cloneRange());
    const scrolls = [document.scrollingElement, document.querySelector('.terminal')]
        .filter(Boolean).map(el => [el, el.scrollLeft, el.scrollTop]);
    let scene, raf = 0, nextFrame, width, height, error;
    let time = Number.isFinite(options.time) ? options.time : reduced.matches ? piece.still : 0;
    let paused = !!options.paused;

    function close() {
        controller.abort();
        cancelAnimationFrame(raf);
        canvas.remove();
        active = null;
        const focus = previousFocus?.isConnected && previousFocus !== document.body
            ? previousFocus : document.getElementById('input');
        focus?.focus({preventScroll: true});
        selection.removeAllRanges();
        ranges.forEach(range => selection.addRange(range));
        scrolls.forEach(([el, x, y]) => { el.scrollLeft = x; el.scrollTop = y; });
    }

    function present() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);
        if (scene) fit(ctx, scene.art, width, height);
        const pad = Math.min(26, width * 0.04), font = width < 500 ? 11 : 13;
        ctx.font = `${font}px ui-monospace, monospace`;
        ctx.textBaseline = 'top';
        function label(text, x, y, align, color) {
            ctx.textAlign = align;
            const w = Math.min(ctx.measureText(text).width, width - pad * 2);
            ctx.fillStyle = '#000d';
            ctx.fillRect((align === 'right' ? x - w : x) - 4, y - 3, w + 8, font + 6);
            ctx.fillStyle = color;
            ctx.fillText(text, x, y, width - pad * 2);
        }
        label(`t ${time.toFixed(2)}s${reduced.matches ? ' · still' : paused ? ' · paused' : ''}`,
            width - pad, 20, 'right', '#91d9e8');
        label(`${piece.name} · @bas3line / ascii.rest · MIT`, pad, height - 47, 'left', '#c1cbd2');
        label(error || (scene ? (coarse.matches ? 'tap exit' : 'esc exit · space pause · r or click restart') : 'Loading scene…'),
            pad, height - 27, 'left', '#a4adb6');
        canvas.dataset.time = time.toFixed(4);
        canvas.dataset.paused = String(paused || reduced.matches);
    }

    function resize() {
        const dpr = Math.min(devicePixelRatio || 1, 2);
        ({width, height} = canvas.getBoundingClientRect());
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        present();
    }

    function draw() {
        scene?.draw(time);
        present();
    }

    function schedule() {
        if (scene && !raf && !paused && !reduced.matches && !document.hidden) raf = requestAnimationFrame(tick);
    }

    function tick(now) {
        raf = 0;
        const interval = 1000 / scene.fps;
        if (now >= nextFrame - 0.5) {
            const steps = 1 + Math.max(0, Math.floor((now - nextFrame) / interval));
            nextFrame += interval * steps;
            time += steps / scene.fps;
            draw();
        }
        schedule();
    }

    function resetClock() {
        cancelAnimationFrame(raf);
        raf = 0;
        if (scene) nextFrame = performance.now() + 1000 / scene.fps;
        schedule();
    }

    function restart() {
        time = 0;
        draw();
        resetClock();
    }

    active = {close};
    window.addEventListener('keydown', event => {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (event.repeat) return;
        const key = event.key.toLowerCase();
        if (key === 'escape' || key === 'q') close();
        else if (key === 'r') restart();
        else if (key === ' ' && !reduced.matches) {
            paused = !paused;
            present();
            resetClock();
        }
    }, {capture: true, signal});
    bindArtPointerControls(canvas, close, restart);
    canvas.addEventListener('wheel', event => event.preventDefault(), {passive: false, signal});
    canvas.addEventListener('blur', () => canvas.focus({preventScroll: true}), {signal});
    window.addEventListener('resize', resize, {signal});
    window.visualViewport?.addEventListener('resize', resize, {signal});
    document.addEventListener('visibilitychange', resetClock, {signal});
    reduced.addEventListener('change', () => {
        if (reduced.matches) {
            time = piece.still;
            draw();
        } else present();
        resetClock();
    }, {signal});

    document.body.append(canvas);
    canvas.focus({preventScroll: true});
    resize();
    try {
        const loaded = await renderer(piece.slug);
        if (signal.aborted) return;
        scene = loaded;
        draw();
        canvas.dataset.ready = 'true';
        resetClock();
    } catch (cause) {
        if (signal.aborted) return;
        scene = null;
        canvas.dataset.error = cause.message;
        error = 'Could not render scene. Press Esc to exit.';
        present();
        console.error(cause);
    }
}

async function gallery(pieces, launch) {
    active?.close();
    window.KraJin2?.close();
    window.KraDwc?.close();
    const dialog = document.createElement('dialog');
    dialog.className = 'art-gallery';
    dialog.setAttribute('aria-labelledby', 'art-gallery-title');
    dialog.innerHTML = `
        <header>
            <h2 id="art-gallery-title">ASCII Art Gallery</h2>
            <button type="button" class="art-gallery-close" aria-label="Close gallery">✕</button>
            <input type="search" aria-label="Search by piece name" placeholder="Search by piece name">
        </header>
        <div class="art-gallery-grid"></div>
        <p class="art-gallery-empty" hidden>No matching pieces.</p>`;
    const search = dialog.querySelector('input');
    const grid = dialog.querySelector('.art-gallery-grid');
    const empty = dialog.querySelector('.art-gallery-empty');
    const cards = pieces.map(piece => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'art-gallery-card';
        const preview = document.createElement('canvas');
        preview.width = 480;
        preview.height = 240;
        preview.setAttribute('aria-hidden', 'true');
        const name = document.createElement('strong');
        name.textContent = piece.name;
        const source = document.createElement('span');
        source.textContent = piece.source;
        button.append(preview, name, source);
        button.addEventListener('click', () => {
            dialog.close();
            launch(piece.command);
        });
        grid.append(button);
        return {piece, button, preview};
    });

    let stage, stageReady;
    async function legacyThumbnail(piece, ctx) {
        if (!stage) {
            // A separate document keeps paused legacy players' focus and canvas
            // isolated. Use a tall viewport so the HUD sits below the artwork.
            stage = document.createElement('iframe');
            stage.className = 'art-gallery-stage';
            stage.tabIndex = -1;
            stage.setAttribute('aria-hidden', 'true');
            const scripts = [...new Set(pieces.flatMap(item => item.legacy ? [item.legacy.script] : []))];
            stage.srcdoc = scripts.map(url => `<script src="${url}"></script>`).join('');
            stageReady = new Promise(resolve => stage.addEventListener('load', resolve, {once: true}));
            dialog.append(stage);
        }
        await stageReady;
        if (!dialog.open) return;
        const win = stage.contentWindow;
        const {player, width, height} = piece.legacy;
        const api = win[player];
        await api.open(piece.command, {time: piece.still, paused: true});
        if (!dialog.open) return;
        try {
            const canvas = win.document.getElementById('jin2-canvas');
            if (!canvas?.dataset.ready) throw new Error(canvas?.dataset.error || 'Preview did not render.');
            const scale = Math.min(canvas.width / width, canvas.height / height);
            const w = width * scale, h = height * scale;
            fit(ctx, canvas, ctx.canvas.width, ctx.canvas.height, [(canvas.width - w) / 2, (canvas.height - h) / 2, w, h]);
        } finally {
            api.close();
        }
    }

    search.addEventListener('input', () => {
        const query = search.value.trim().toLowerCase();
        for (const {piece, button} of cards) {
            button.hidden = !piece.name.toLowerCase().includes(query) && !piece.command.includes(query);
        }
        empty.hidden = cards.some(({button}) => !button.hidden);
    });
    dialog.querySelector('.art-gallery-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => dialog.remove(), {once: true});
    document.body.append(dialog);
    dialog.showModal();

    // Yield between stills so the dialog can paint and respond during loading.
    for (const {piece, preview} of cards) {
        await new Promise(resolve => setTimeout(resolve, 0));
        if (!dialog.open) return;
        const ctx = preview.getContext('2d');
        try {
            if (piece.legacy) await legacyThumbnail(piece, ctx);
            else {
                const scene = await renderer(piece.slug);
                if (!dialog.open) return;
                scene.draw(piece.still);
                fit(ctx, scene.art, preview.width, preview.height);
            }
            preview.dataset.ready = 'true';
        } catch (error) {
            if (!dialog.open) return;
            console.error(`Could not render ${piece.name} thumbnail.`, error);
            ctx.fillStyle = '#cad4ce';
            ctx.font = '16px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Preview unavailable', preview.width / 2, preview.height / 2);
        }
    }
    stage?.remove();
}

window.KraAsciiRest = {open, close: () => active?.close(), gallery};
export {open, gallery};
