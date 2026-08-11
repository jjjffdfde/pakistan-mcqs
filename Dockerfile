# ============================================================
# Phase 26 - STEP 9: Pakistan MCQS Hub — Web (static + proxy) image
# Serves the generated static site; proxies /api to the `api` service.
# Build: docker build -t pakistan-mcqs-web -f Dockerfile .
# ============================================================
FROM nginx:1.27-alpine

WORKDIR /usr/share/nginx/html

# Static-first site (works without the API)
COPY index.html admin.html 404.html offline.html ./
COPY assets/ ./assets/
COPY subjects/ ./subjects/
COPY chapters/ ./chapters/
COPY data/ ./data/
COPY sitemap.xml image-sitemap.xml video-sitemap.xml robots.txt manifest.webmanifest sw.js .nojekyll ./

# nginx config: static + /api -> api:8765
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
