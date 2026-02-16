// middleware.js — Vercel Edge Middleware for Prerender.io & Canonical Redirects
// Intercepts requests to enforce HTTPS, www.househuntkenya.com, and Prerender.io

// Bot user agents that should receive pre-rendered pages
const BOT_AGENTS = [
    'googlebot',
    'bingbot',
    'yandex',
    'baiduspider',
    'facebookexternalhit',
    'twitterbot',
    'rogerbot',
    'linkedinbot',
    'embedly',
    'quora link preview',
    'showyoubot',
    'outbrain',
    'pinterest/0.',
    'pinterestbot',
    'developers.google.com/+/web/snippet',
    'slackbot',
    'vkshare',
    'w3c_validator',
    'redditbot',
    'applebot',
    'whatsapp',
    'flipboard',
    'tumblr',
    'bitlybot',
    'skypeuripreview',
    'nuzzel',
    'discordbot',
    'google page speed',
    'qwantify',
    'google-inspectiontool',
    'petalbot',
    'ahrefsbot',
    'semrushbot',
];

// File extensions to skip (static assets)
const IGNORED_EXTENSIONS = /\.(js|css|xml|less|png|jpg|jpeg|gif|pdf|ico|rss|zip|mp3|mp4|webp|webm|svg|woff|woff2|ttf|eot|map|json)$/i;

export default async function middleware(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const hostname = url.hostname;
    const protocol = url.protocol;

    // 1. ✅ CSS/JS/Static Assets -> Skip all logic
    if (IGNORED_EXTENSIONS.test(pathname)) {
        return;
    }

    // 2. ✅ Canonical Redirects (Enforce https://www.househuntkenya.com)
    // Skip this logic for localhost during development
    if (hostname !== 'localhost' && !hostname.includes('vercel.app')) {

        const desiredHostname = 'www.househuntkenya.com';

        // Check if we need to redirect (non-www OR .co.ke OR http)
        const isWrongHost = hostname !== desiredHostname;
        const isWrongProto = request.headers.get('x-forwarded-proto') === 'http';

        if (isWrongHost || isWrongProto) {
            url.hostname = desiredHostname;
            url.protocol = 'https:';
            url.port = ''; // Clear port if any

            return Response.redirect(url.toString(), 301);
        }
    }

    // 3. ✅ API Routes -> Skip prerender logic
    if (pathname.startsWith('/api/')) {
        return;
    }

    // 4. ✅ Prerender.io Proxy (Bot Detection)
    const userAgent = request.headers.get('user-agent') || '';
    const isBot = BOT_AGENTS.some(bot =>
        userAgent.toLowerCase().includes(bot.toLowerCase())
    );

    if (!isBot) {
        return;
    }

    const prerenderToken = process.env.PRERENDER_TOKEN;
    if (!prerenderToken) {
        console.warn('⚠️ PRERENDER_TOKEN not set. Serving normal SPA.');
        return;
    }

    try {
        const prerenderUrl = `https://service.prerender.io/${request.url}`;
        const prerenderResponse = await fetch(prerenderUrl, {
            headers: {
                'X-Prerender-Token': prerenderToken,
            },
            redirect: 'follow',
        });

        const body = await prerenderResponse.text();
        return new Response(body, {
            status: prerenderResponse.status,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'X-Prerender': 'true',
                'Cache-Control': 'public, max-age=86400',
            },
        });
    } catch (error) {
        console.error('Prerender.io proxy failed:', error.message);
        return;
    }
}

export const config = {
    matcher: [
        '/((?!_vercel|_next|icons|manifest\\.json|robots\\.txt|sitemap\\.xml|assets|favicon\\.ico).*)',
    ],
};
