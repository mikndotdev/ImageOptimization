import { Elysia } from "elysia";

const allowedDomains = process.env.ALLOWED_DOMAINS
  ? process.env.ALLOWED_DOMAINS.split(",")
  : [];

const defaultRedirect = process.env.DEFAULT_REDIRECT || "";

const ImgproxyURL = process.env.IMGPROXY_URL || "";

const app = new Elysia();

app.get('/', ({ redirect }) => {
    return redirect(defaultRedirect);
})

app.get('/:path', async ({ query, params }) => {
    const size = query.size;
    const quality = query.quality;
    const url = params.path;

    const urlObj = new URL(url);

    if (!allowedDomains.includes(urlObj.hostname)) {
        return new Response("Domain not allowed", { status: 403 });
    }

    let imgproxyPath = `/pr:sharp/resize:fill:${size}/q:${quality}/plain/${encodeURIComponent(url)}`;
    const imgproxyUrl = new URL(ImgproxyURL + imgproxyPath);

    const data = await fetch(imgproxyUrl.href);
    return new Response(data.body, {
        headers: {
            'Content-Type': data.headers.get('Content-Type') || 'image/jpeg'
        }
    });
})

export default app;
