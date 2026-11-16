// Optional regression checks: serve the site, install Playwright, then run this file.
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const baseURL = process.env.ART_TEST_URL || 'http://127.0.0.1:8000/';
const pieces = ['blackhole', 'nighttide', 'catknight', 'rose', 'snowman', 'goodluck'];
const reviewDir = process.env.ART_REVIEW_DIR;
if (reviewDir) fs.mkdirSync(reviewDir, {recursive: true});
const layers = page => page.evaluate(() => {
    const visible = id => {
        const e = document.getElementById(id);
        return !!e && !e.hidden && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden';
    };
    return {
        critters: {visible: visible('critters-canvas'), running: !!critters.engine?.raf && !critters.engine.disposed},
        oneko: {visible: visible('oneko'), running: window.KraOneko?.getState().running || false},
        jin2: {visible: visible('jin2-canvas'), running: window.KraJin2?.getState()?.running || false}
    };
});

(async () => {
    const browser = await chromium.launch({executablePath: process.env.CHROMIUM_EXECUTABLE || undefined});
    try {
        const context = await browser.newContext({viewport: {width: 1280, height: 960}});
        const page = await context.newPage(), requests = [], errors = [];
        page.on('request', r => requests.push(new URL(r.url()).pathname));
        page.on('pageerror', e => errors.push(e.message));
        const ready = async (piece) => page.waitForFunction(p => window.KraJin2?.getState()?.ready && KraJin2.getState().piece === p, piece);
        const command = async value => { await page.locator('#input').fill(value); await page.locator('#input').press('Enter'); };
        await page.goto(baseURL); await ready('nighttide');
        await page.locator('#kraterm-boot').waitFor({state: 'detached'});
        await page.waitForTimeout(300);
        assert(requests.some(p => p.endsWith('/jin2.js')));
        assert(!requests.some(p => p.endsWith('/jin2-scenes.js') || p.includes('catknight_frames') || p.includes('goodluck-sprites')));
        assert.equal(await page.locator('#critters-canvas').count(), 0);
        assert(!requests.some(p => p.endsWith('/critters.js')));
        assert.equal(await page.evaluate(() => KraOneko.getState().running), false);
        assert.equal(await page.locator('#oneko').isVisible(), false);
        assert.equal(await page.locator('#jin2-canvas').evaluate(c => getComputedStyle(c).pointerEvents), 'none');
        assert.equal(await page.locator('#jin2-canvas').getAttribute('tabindex'), null);
        assert.equal(await page.locator('[role=dialog]').count(), 0);
        await command('help');
        const help = await page.locator('#output').textContent();
        assert(help.includes('background')); assert(!help.includes('birthday'));
        for (const p of pieces) assert(!help.includes(p));
        const registry = await page.evaluate(() => [...commands]);
        assert(registry.includes('background'));
        for (const p of [...pieces, 'birthday']) assert(!registry.includes(p));
        await command('background');
        const list = await page.locator('#output').textContent();
        for (const p of [...pieces, 'off']) assert(list.includes(p));
        assert(!list.includes('birthday'));
        await page.locator('#input').fill('backg'); await page.keyboard.press('Tab');
        assert.equal((await page.locator('#input').textContent()).trim(), 'background');
        await page.locator('#input').fill('');
        for (const piece of [...pieces, 'birthday']) {
            await command(piece === 'birthday' ? 'birthday' : `background ${piece}`); await ready(piece);
            assert.equal(await page.evaluate(() => document.activeElement.id), 'input');
            assert.equal(await page.evaluate(() => localStorage.getItem('kraterm-background')), piece);
            await page.keyboard.type('q r escape space stay editable');
            assert.equal(await page.locator('#input').textContent(), 'q r escape space stay editable');
            await page.keyboard.press('Escape');
            assert.equal(await page.locator('#jin2-canvas').count(), 1);
            await page.locator('#input').fill('echo still interactive'); await page.keyboard.press('Enter');
            assert((await page.locator('#output').textContent()).includes('still interactive'));
            assert((await page.locator('#output').textContent()).includes('ASCII art by JIN2 (@jin_22ee), adapted under his personal-use license'));
            console.log('PASS ambient selection and typing:', piece);
        }
        assert.equal(requests.filter(p => p.endsWith('/jin2.js')).length, 1);
        assert.equal(requests.filter(p => p.endsWith('/jin2-scenes.js')).length, 1);
        assert.equal(requests.filter(p => p.endsWith('/catknight_frames.bin.gz')).length, 1);
        assert.equal(requests.filter(p => /goodluck-sprites\/\d\d\.png$/.test(p)).length, 77);
        assert.equal(requests.filter(p => p.endsWith('/phrases.json')).length, 1);
        await command('background catknight'); await ready('catknight');
        await page.reload(); await ready('catknight');
        assert((await page.locator('#jin2-credit').textContent()).includes('photo belongs to its creator'));
        await command('background off');
        assert.equal(await page.locator('#jin2-canvas').count(), 0);
        assert.equal(await page.locator('#jin2-credit').count(), 0);
        await page.waitForSelector('#critters-canvas');
        assert.equal(await page.evaluate(() => KraOneko.getState().running), true);
        const countBefore = requests.filter(p => p.endsWith('/jin2.js')).length;
        await page.reload(); await page.waitForTimeout(1000);
        assert.equal(requests.filter(p => p.endsWith('/jin2.js')).length, countBefore);
        assert.equal(await page.locator('#jin2-canvas').count(), 0);
        await page.waitForTimeout(200); // Let the welcome command finish typing.
        for (const piece of [...pieces, 'birthday']) {
            await page.emulateMedia({reducedMotion: 'reduce'});
            await command(piece === 'birthday' ? 'birthday' : `background ${piece}`); await ready(piece);
            const before = await page.locator('#jin2-canvas').evaluate(c => c.toDataURL());
            const frames = await page.evaluate(() => KraJin2.getState().frames);
            await page.waitForTimeout(150);
            assert.equal(await page.locator('#jin2-canvas').evaluate(c => c.toDataURL()), before);
            assert.equal(await page.evaluate(() => KraJin2.getState().frames), frames);
            assert.equal(await page.evaluate(() => KraJin2.getState().time), 13);
            assert((await page.locator('#jin2-credit').textContent()).includes('still frame'));
        }
        await page.emulateMedia({reducedMotion: 'no-preference'});
        await command('background nighttide'); await ready('nighttide');
        await page.evaluate(() => { Object.defineProperty(document, 'hidden', {configurable: true, value: true}); document.dispatchEvent(new Event('visibilitychange')); });
        const hiddenState = await page.evaluate(() => KraJin2.getState());
        await page.waitForTimeout(500);
        assert.equal(await page.evaluate(() => KraJin2.getState().frames), hiddenState.frames);
        assert.equal(await page.evaluate(() => KraJin2.getState().time), hiddenState.time);
        await page.evaluate(() => { Object.defineProperty(document, 'hidden', {configurable: true, value: false}); document.dispatchEvent(new Event('visibilitychange')); });
        await page.waitForFunction(n => KraJin2.getState().frames > n, hiddenState.frames);
        const state = await page.evaluate(() => KraJin2.getState());
        assert(state.intervalMs >= 1000 / 30);
        assert(state.intervalMs >= state.averageCostMs * 5 - 0.001);
        await page.evaluate(() => { backgroundSelect('rose'); backgroundSelect('off'); });
        await page.waitForTimeout(200); assert.equal(await page.locator('#jin2-canvas').count(), 0);
        await command('critters koi'); await page.waitForFunction(() => critters.animal === 'koi');
        await command('background snowman'); await ready('snowman');
        assert.equal(await page.locator('#critters-canvas').isVisible(), false);
        const suspended = await page.evaluate(() => ({critterTime: critters.engine.flock.time, cat: KraOneko.getState()}));
        await page.waitForTimeout(250);
        assert.equal(await page.evaluate(() => critters.engine.flock.time), suspended.critterTime);
        assert.equal(await page.evaluate(() => critters.engine.raf), 0);
        assert.equal(await page.evaluate(() => KraOneko.getState().frames), suspended.cat.frames);
        assert.equal(suspended.cat.running, false);
        await page.emulateMedia({reducedMotion: 'reduce'});
        await page.waitForTimeout(100);
        assert.equal(await page.evaluate(() => critters.engine.flock.time), suspended.critterTime);
        await page.emulateMedia({reducedMotion: 'no-preference'});
        await page.waitForTimeout(100);
        assert.equal(await page.evaluate(() => critters.engine.raf), 0);
        assert.equal(await page.evaluate(() => localStorage.getItem('kraterm-critters')), 'koi');
        await command('critters jellyfish');
        await page.waitForFunction(() => ambient.owner === 'critters' && critters.animal === 'jellyfish');
        assert.equal(await page.locator('#jin2-canvas').count(), 0);
        assert.equal(await page.evaluate(() => localStorage.getItem('kraterm-background')), 'snowman');
        assert.equal(await page.evaluate(() => jin2Background.status), 'suspended');
        assert.equal(await page.evaluate(() => KraOneko.getState().running), true);
        await command('background snowman'); await ready('snowman');
        await command('themes github-light');
        assert.equal(await page.locator('body').getAttribute('data-theme'), 'github-light');
        assert.equal(await page.locator('#jin2-canvas').count(), 1);
        await command('critters off'); assert.equal(await page.locator('#critters-canvas').count(), 0);
        assert.equal(await page.locator('#jin2-canvas').count(), 1);
        await command('background off');
        assert.equal(await page.locator('#critters-canvas').count(), 0); // Saved off stays off.
        for (const piece of pieces) {
            await command(piece);
            assert.equal(await page.locator('#jin2-canvas').count(), 0);
        }
        // Debug query is a paused background override; it does not overwrite "off".
        await page.goto(new URL('?art=blackhole&t=7.8', baseURL).href); await ready('blackhole');
        assert.equal(await page.evaluate(() => localStorage.getItem('kraterm-background')), 'off');
        assert.equal(await page.evaluate(() => KraJin2.getState().paused), true);
        await page.locator('#input').fill('draft remains');
        const beforeFocus = await page.evaluate(() => ({html: document.getElementById('output').innerHTML, input: document.getElementById('input').innerHTML, history: [...commandHistory], scroll: document.querySelector('.terminal').scrollTop}));
        await page.evaluate(() => KraJin2.seek(13));
        const afterFocus = await page.evaluate(() => ({html: document.getElementById('output').innerHTML, input: document.getElementById('input').innerHTML, history: [...commandHistory], scroll: document.querySelector('.terminal').scrollTop}));
        assert.deepEqual(afterFocus, beforeFocus);
        assert.equal(await page.evaluate(() => document.activeElement.id), 'input');
        const failure = await context.newPage();
        await failure.route('**/goodluck-sprites/23.png', r => r.abort());
        await failure.goto(new URL('?art=goodluck&t=10', baseURL).href);
        await failure.waitForSelector('.error-text:has-text("Could not load JIN2 background")');
        assert.equal(await failure.locator('#jin2-canvas').count(), 0);
        await failure.unroute('**/goodluck-sprites/23.png');
        await failure.evaluate(() => backgroundSelect('goodluck', {time: 10, paused: true}));
        await failure.waitForSelector('#jin2-canvas[data-ready=true]'); await failure.close();
        const mobile = await browser.newPage({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, reducedMotion: 'reduce'});
        await mobile.goto(new URL('?art=catknight&t=2.63337', baseURL).href);
        await mobile.waitForSelector('#jin2-canvas[data-ready=true]');
        const creditBox = await mobile.locator('#jin2-credit').boundingBox();
        const soundBox = await mobile.locator('#kt-sound-toggle').boundingBox();
        const musicBox = await mobile.locator('#kt-music-toggle').boundingBox();
        assert(creditBox.y + creditBox.height < Math.min(soundBox.y, musicBox.y));
        await mobile.touchscreen.tap(180, 400);
        assert.equal(await mobile.locator('#jin2-canvas').count(), 1);
        await mobile.close();
        for (const viewport of [{width: 1429, height: 804}, {width: 1280, height: 960}, {width: 390, height: 844}]) {
            const view = await browser.newPage({viewport, isMobile: viewport.width === 390, hasTouch: viewport.width === 390});
            view.on('pageerror', e => errors.push(e.message));
            await view.addInitScript(() => {
                localStorage.setItem('kraterm-sound', 'off'); localStorage.setItem('kraterm-music', 'off');
                const draw = CanvasRenderingContext2D.prototype.drawImage;
                CanvasRenderingContext2D.prototype.drawImage = function (...args) {
                    if (this.canvas.id === 'jin2-canvas' && args.length === 5 && args[1] <= 0 && args[2] <= 0
                        && args[1] + args[3] >= innerWidth && args[2] + args[4] >= innerHeight) window.artBounds = args.slice(1);
                    return draw.apply(this, args);
                };
            });
            const capture = async name => {
                const state = await layers(view);
                console.log('LAYERS', viewport.width, name, JSON.stringify(state));
                if (reviewDir) await view.screenshot({path: path.join(reviewDir, `${viewport.width}-${name}.png`)});
                return state;
            };
            const jin2Only = async name => {
                const state = await capture(name);
                assert.equal(state.jin2.visible, true);
                assert.deepEqual(state.critters, {visible: false, running: false});
                assert.deepEqual(state.oneko, {visible: false, running: false});
            };
            await view.goto(baseURL); await view.waitForSelector('#jin2-canvas[data-ready=true]');
            await view.locator('#kraterm-boot').waitFor({state: 'detached'});
            await jin2Only('fresh-default');
            assert.equal(await view.evaluate(() => localStorage.getItem('kraterm-critters')), null);
            await view.evaluate(() => localStorage.setItem('kraterm-critters', 'butterflies'));
            await view.reload(); await view.waitForSelector('#jin2-canvas[data-ready=true]');
            await view.locator('#kraterm-boot').waitFor({state: 'detached'});
            await jin2Only('saved-critters');
            assert.equal(await view.evaluate(() => localStorage.getItem('kraterm-critters')), 'butterflies');
            await view.evaluate(() => backgroundSelect('off'));
            await view.waitForSelector('#critters-canvas:visible');
            let state = await capture('background-off');
            assert.deepEqual(state.jin2, {visible: false, running: false});
            assert.deepEqual(state.critters, {visible: true, running: true});
            assert.deepEqual(state.oneko, {visible: true, running: true});
            await view.evaluate(() => backgroundSelect('nighttide'));
            await view.waitForSelector('#jin2-canvas[data-ready=true]');
            await view.locator('#input').fill('critters koi'); await view.locator('#input').press('Enter');
            await view.waitForFunction(() => ambient.owner === 'critters' && critters.animal === 'koi');
            state = await capture('critters-selected');
            assert.deepEqual(state.jin2, {visible: false, running: false});
            assert.deepEqual(state.critters, {visible: true, running: true});
            assert.deepEqual(state.oneko, {visible: true, running: true});
            assert.equal(await view.evaluate(() => localStorage.getItem('kraterm-background')), 'nighttide');
            for (const piece of [...pieces, 'birthday']) {
                await view.evaluate(p => backgroundSelect(p, {time: p === 'blackhole' ? 7.8 : 13, paused: true, persist: false}), piece);
                await view.waitForSelector('#jin2-canvas[data-ready=true]');
                await view.evaluate(() => { document.getElementById('output').innerHTML = processCommand('welcome'); document.querySelector('.terminal').scrollTop = 0; });
                await jin2Only(`${piece}-profile`);
                const backing = await view.evaluate(() => {
                    const blocks = [...document.querySelectorAll('#output > div, #output pre, #output .profile-column')];
                    const lines = [...document.querySelectorAll('.profile-line')];
                    const terminal = document.querySelector('.terminal').getBoundingClientRect();
                    const credit = document.getElementById('jin2-credit').getBoundingClientRect();
                    return {transparent: blocks.every(e => getComputedStyle(e).backgroundColor === 'rgba(0, 0, 0, 0)'),
                        backed: lines.length > 50 && lines.every(e => getComputedStyle(e).backgroundColor === 'rgb(33, 29, 27)' && getComputedStyle(e).display === 'inline'),
                        bounds: window.artBounds, width: innerWidth, height: innerHeight,
                        geometry: terminal.x === 0 && terminal.y === 0 && terminal.width === innerWidth && terminal.bottom + 8 <= credit.top + .01};
                });
                assert(backing.transparent && backing.backed && backing.geometry);
                const [x, y, w, h] = backing.bounds;
                assert(x <= .01 && y <= .01 && x + w >= backing.width - .01 && y + h >= backing.height - .01);
                if (reviewDir) {
                    const hide = await view.addStyleTag({content: '.terminal { visibility: hidden; }'});
                    await view.screenshot({path: path.join(reviewDir, `${viewport.width}-${piece}-art.png`)});
                    await hide.evaluate(e => e.remove());
                }
            }
            // A late critters load must not steal the slot from a newer background.
            await view.evaluate(() => { crittersStart('jellyfish'); backgroundSelect('nighttide', {paused: true}); });
            await view.waitForSelector('#jin2-canvas[data-ready=true]');
            await jin2Only('selection-race');
            await view.close();
        }
        assert.deepEqual(errors, []);
        console.log('PASS default/persistence/off, lazy assets/cache, hidden birthday, input/history/theme/critters, reduced motion, hidden-tab stop/resume, budget cap, races, debug override, failure/retry.');
    } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
