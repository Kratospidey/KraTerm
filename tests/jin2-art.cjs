// Optional regression checks: serve the site, install Playwright, then run this file.
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const baseURL = process.env.ART_TEST_URL || 'http://127.0.0.1:8000/';
const pieces = ['blackhole', 'nighttide', 'catknight', 'rose', 'snowman', 'goodluck'];

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
        await page.waitForSelector('#critters-canvas');
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
        assert.equal(await page.locator('#critters-canvas').count(), 1);
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
        assert.equal(await page.locator('#critters-canvas').count(), 1);
        await command('themes github-light');
        assert.equal(await page.locator('body').getAttribute('data-theme'), 'github-light');
        assert.equal(await page.locator('#jin2-canvas').count(), 1);
        await command('critters off'); assert.equal(await page.locator('#critters-canvas').count(), 0);
        assert.equal(await page.locator('#jin2-canvas').count(), 1);
        await command('background off');
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
        assert.deepEqual(errors, []);
        console.log('PASS default/persistence/off, lazy assets/cache, hidden birthday, input/history/theme/critters, reduced motion, hidden-tab stop/resume, budget cap, races, debug override, failure/retry.');
    } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
