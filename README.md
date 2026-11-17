# VISION — Beyond Sight
React + Vite + React Three Fiber + GSAP ScrollTrigger.

    npm install
    npm run dev       # downloads missing GLBs into public/models, then starts Vite
    npm run build     # same download step (prebuild), then builds to dist/

GLBs are served from /models/. Put your own files in public/models/ with these names to skip the download:
glasses.glb, eye-anatomical.glb, eye-blue.glb, eye-simple.glb, eye-study.glb, eye-realistic.glb, skull-a.glb, skull-b.glb
Otherwise fetch-models.mjs downloads them from the public repo marknovikov3001-glitch/vision-eyewear.

Deploy: import the repo in Vercel (framework Vite, build `npm run build`, output `dist`).
