# Full page cycle

## Firing of events

These events are fired for the closing page: `visibilitychange`, `pagehide`, 
`beforeunload`.

## BFCache checking

The Back-Forward cache is a cache where previously loaded pages are stored, so 
the browser can load a ready page right away.

## HSTS

If a user requests a site over HTTP, browsers will check the HSTS preload 
list to potentially force HTTPS before making a network request.

## Find caches, cookies, storage, etc.

## If possible, load HTML from cache

This happens rarely, only if the HTML was recently cached.

## Notify service worker (SW)

If there is a service worker associated with the address, notify it about
fetching the page.

## DNS resolution

1. Consult Browser and OS caches.
2. Use DNS-over-HTTPS if possible, or query the OS DNS resolver.

## Protocol negotiation (ALPN)

ALPN = Application-Layer Protocol Negotiation.
If the DNS record contains the necessary information, we can directly use
HTTP/3 (QUIC). Otherwise, send a ClientHello with supported protocols.
The server decides which one to use and sends a ServerHello.
A 3-way handshake and certificate validation are used to set up a secure 
communication channel.



