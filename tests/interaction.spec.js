import {test,expect} from '@playwright/test';
async function ready(page){await page.goto('/');await expect(page.locator('body')).toHaveAttribute('data-model','ready',{timeout:30000});await expect(page.locator('#loader')).toBeHidden();await page.evaluate(()=>document.fonts.ready);}
test('three product models, carousel and unrestricted rotation',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await ready(page);
 await expect.poll(()=>page.evaluate(()=>getExperienceState().loadedProducts.length)).toBe(3);
 await page.screenshot({path:'output/universe-banana.png'});
 await page.locator('#next').click();await expect(page.locator('body')).toHaveAttribute('data-product','bravo');await expect(page.locator('#product-name')).toHaveText('부라보콘');
 await expect(page.locator('#rotation-hit')).toHaveClass('enabled');await expect.poll(()=>page.evaluate(()=>getExperienceState().transition)).toBe(1);await page.screenshot({path:'output/universe-bravo.png'});
 await page.locator('#next').click();await expect(page.locator('body')).toHaveAttribute('data-product','yoplait');await expect(page.locator('#rotation-hit')).toHaveClass('enabled');await expect.poll(()=>page.evaluate(()=>getExperienceState().transition)).toBe(1);await page.screenshot({path:'output/universe-yoplait.png'});
 await page.locator('#rotation-hit').focus();for(let i=0;i<43;i++)await page.keyboard.press('ArrowDown');for(let i=0;i<43;i++)await page.keyboard.press('ArrowRight');
 await expect.poll(()=>page.evaluate(()=>getExperienceState().verticalRotation)).toBeGreaterThan(Math.PI*2);await expect.poll(()=>page.evaluate(()=>getExperienceState().horizontalRotation)).toBeGreaterThan(Math.PI*2);
 await page.locator('#reset').click();expect(await page.evaluate(()=>getExperienceState().verticalRotation)).toBe(0);
 await page.locator('#next').click();await expect(page.locator('body')).toHaveAttribute('data-product','banana');
 expect(errors).toEqual([]);
});
test('scroll selects all products and second section packs and sends the box',async({page})=>{
 await ready(page);
 await page.evaluate(()=>scrollTo({top:(document.querySelector('#how').offsetTop-innerHeight)*.45,behavior:'instant'}));await expect(page.locator('body')).toHaveAttribute('data-product','bravo');
 await page.evaluate(()=>scrollTo({top:(document.querySelector('#how').offsetTop-innerHeight)*.85,behavior:'instant'}));await expect(page.locator('body')).toHaveAttribute('data-product','yoplait');
 await page.locator('.scroll-cue').click();await expect(page.locator('#step-title')).toBeInViewport();await expect(page.locator('#rotation-hit')).not.toHaveClass('enabled');
 await page.screenshot({path:'output/universe-process-pick.png'});
 await page.locator('[data-step="1"]').click();await expect.poll(()=>page.evaluate(()=>getExperienceState().boxClosed)).toBeGreaterThan(.6);await page.screenshot({path:'output/universe-process-pack.png'});
 await page.locator('[data-step="2"]').click();await expect.poll(()=>page.evaluate(()=>getExperienceState().process)).toBeGreaterThan(.85);await page.screenshot({path:'output/universe-process-send.png'});
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await expect(page.locator('body')).toHaveAttribute('data-product','banana');
});
test('mobile composition and controls',async({page})=>{
 await page.setViewportSize({width:390,height:844});await ready(page);await page.screenshot({path:'output/universe-mobile.png'});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);
 await page.locator('#next').click();await expect(page.locator('body')).toHaveAttribute('data-product','bravo');await expect(page.locator('#rotation-hit')).toHaveClass('enabled');await expect.poll(()=>page.evaluate(()=>getExperienceState().transition)).toBe(1);await page.screenshot({path:'output/universe-mobile-bravo.png'});
 await page.locator('.scroll-cue').click();await expect(page.locator('.stepper')).toBeInViewport();await page.screenshot({path:'output/universe-mobile-process.png'});
});
