# Full page cycle

## Before network request

### Firing of events

These events are fired for the closing page: `visibilitychange`, `pagehide`, 
`beforeunload`.

### BFCache checking

The Back-Forward cache is a cache where previously loaded pages are stored, so 
the browser can load a ready page right away.

### HSTS

If a user requests a site over HTTP, browsers will check the HSTS preload 
list to potentially force HTTPS before making a network request.

### Find caches, cookies, storage, etc.

### If possible, load HTML from cache

This happens rarely, only if the HTML was recently cached.

### Notify service worker (SW)

If there is a service worker associated with the address, notify it about
fetching the page.

### DNS resolution

1. Consult Browser and OS caches.
2. Use DNS-over-HTTPS if possible, or query the OS DNS resolver.

## Network request

### Protocol negotiation (ALPN)

ALPN = Application-Layer Protocol Negotiation.
If the DNS record contains the necessary information, we can directly use
HTTP/3 (QUIC). Otherwise, send a ClientHello with supported protocols.
The server decides which one to use and sends a ServerHello.
A 3-way handshake and certificate validation are used to set up a secure 
communication channel.

### Send HTTP request

Send GET request, headers, cookies.

### Server Early Hints (103)

Server can send intermiate responses containing urls of some critical
resouces so the browser can preload them before receiving the final 
status 200 response.

### Server response

If all goes well it will be status 200. Some headers are also sent, for 
example: `Content-Security-Policy`, `Cache-Control`, `Set-Cookie`, etc.
Browser may decide to cache this response.

## Parsing, critical rendering path (CRP)

### HTML parsing and preload scanner (CRP step 1)

DOM is built incrementally in streaming mode. So after the first byte browser 
will parse incoming HTML.
In parallel a preload scanner looks for high priority resouces:
CSS, blocking scripts, modulepreload, fonts, images with fetchpriority=high
and dispatches requests early.
Parsing is blocked on non-async scripts.

### Subresource fetching

If possible resources are extracted from cache. Same HTTP connection can
be used to fetch additional resources.

### CSSOM (CRP step 2)

The total time to create the CSSOM is generally less than the time it takes
for one DNS lookup. @font-face may trigger font loads.
Inline some CSS because it removes a render-blocking request.

### JavaScript compilation

JavaScript is parsed, compiled, and interpreted. It can then modify DOM/CSSOM,
register event handlers, start fetches, etc.

### Accessibility Object Model (AOM)

The accessibility object model (AOM) is like a semantic version of the DOM.
The browser updates the accessibility tree when the DOM is updated.

## Rendering

### Render tree (style) (CRP step 3)

Combining the DOM and CSSOM into a render tree.
The render tree holds all the visible nodes with content and computed styles.
P.S. Nodes with `visibility: hidden` are included in the render tree.

### Layout (CRP step 4)

Running layout on the render tree to compute the geometry of each node. 
Layout is the process by which the dimensions and location of all the nodes 
in the render tree are determined, plus the determination of the size and 
position of each object on the page.

The first time the size and position of each node is determined is called 
layout. Subsequent recalculations of layout are called `reflows`.

### Paint (CRP step 5)

In the painting or rasterization phase, the browser converts each box 
calculated in the layout phase to actual pixels on the screen. 
The drawing to the screen is generally broken down into several layers.
Promoting content into layers on the GPU improves paint and repaint performance.
There are specific properties and elements that instantiate a layer, 
including `<video>` and `<canvas>`, and any element which has the CSS properties 
of opacity, a 3D transform, will-change, and a few others. These nodes will 
be painted onto their own layer, along with their descendants.

### Compositing

When sections of the document are drawn in different layers, overlapping 
each other, compositing is necessary to ensure they are drawn to the screen 
in the right order and the content is rendered correctly.
A reflow sparks a repaint and a re-composite.

## Interaction-ready

If the load includes JavaScript, that was correctly deferred, 
and only executed after the onload event fires, the main thread might be busy, 
and not available for scrolling, touch, and other interactions.
The `DOMContentLoaded` event fires when the HTML document has been completely 
parsed, and all deferred scripts have downloaded and executed.
The `load` event is fired when the whole page has loaded, including all 
dependent resources such as stylesheets, scripts, iframes, and images, 
except those that are loaded lazily. 

## Links

https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work
https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Cascade
