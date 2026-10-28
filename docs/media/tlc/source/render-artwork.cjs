// Rebuild static artwork with Playwright: npm install playwright; npx playwright install chromium
const fs=require('fs'),path=require('path');
const {chromium}=require('playwright');
const kit=path.resolve(__dirname,'..');
const only=process.argv[2];
const assets=[['readme-banner',1600,800],['portfolio-cover',1920,1080],['request-flow',1920,1080],['social-square',1080,1080],['social-portrait',1080,1350]];
(async()=>{
 const options={headless:true};
 if(process.env.CHROME_PATH)options.executablePath=process.env.CHROME_PATH;
 const browser=await chromium.launch(options);
 const page=await browser.newPage({deviceScaleFactor:1});
 async function render(query,w,h,dest){
  await page.setViewportSize({width:w,height:h});
  await page.goto('file://'+path.join(__dirname,'designs.html')+'?'+query,{waitUntil:'load'});
  if(await page.locator('#art h1').count()!==1)throw Error('Artwork did not render: '+query);
  await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));
  const errors=await page.evaluate(()=>[...document.querySelectorAll('h1,.body,.eyebrow')].filter(el=>el.scrollWidth>el.clientWidth+1).map(el=>el.textContent));
  if(errors.length)throw Error('Text overflow: '+errors.join('; '));
  fs.mkdirSync(path.dirname(dest),{recursive:true});
  await page.screenshot({path:dest});console.log(path.relative(kit,dest));
 }
 for(const [name,w,h] of assets)if(!only||only===name)await render('type='+name,w,h,path.join(kit,'images',name+'.png'));
 if(!only||only==='video')for(const format of ['landscape','portrait'])for(let slide=1;slide<=5;slide++){
  const w=format==='portrait'?1080:1920,h=format==='portrait'?1920:1080;
  const dest=path.join(kit,'source/video-slides',format,String(slide).padStart(2,'0')+'.png');
  await render('type=video&format='+format+'&slide='+slide,w,h,dest);
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
