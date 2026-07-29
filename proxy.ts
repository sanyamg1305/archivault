import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isArchitectRoute = createRouteMatcher([
    '/dashboard(.*)',
    '/projects(.*)',
    '/trades(.*)',
    '/vendors(.*)',
    '/team(.*)',
    '/settings(.*)',
]);

const isTradesPortalRoute = createRouteMatcher([
    '/trades-portal(.*)'
]);

const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)',
    '/projects(.*)',
    '/trades(.*)',
    '/vendors(.*)',
    '/team(.*)',
    '/settings(.*)',
    '/portal(.*)',
    /^\/api(?!\/webhooks).*$/
]);

export default clerkMiddleware(async (auth, req) => {
    // Trades portal has its own session-based auth — skip Clerk entirely
    if (isTradesPortalRoute(req)) {
        return;
    }

    if (isProtectedRoute(req)) {
        await auth.protect();
    }

    const authObject = await auth();
    const { orgRole } = authObject;

    // Intercept client trying to access team routes
    if (isArchitectRoute(req)) {
        // Only client roles should be forced to the portal. Team roles stay in the dashboard.
        const isTeam = orgRole === 'org:admin' || orgRole === 'admin' || orgRole === 'org:architect' || orgRole === 'architect';
        if (orgRole && !isTeam) {
            const url = new URL(req.url);
            const match = url.pathname.match(/^\/projects\/([^\/]+)/);
            if (match) {
                return NextResponse.redirect(new URL(`/portal/${match[1]}/dashboard`, req.url));
            }
            return NextResponse.redirect(new URL('/portal', req.url));
        }
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
