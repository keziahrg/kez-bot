export const handleInvalidContentType = () =>
    new Response(null, {
        status: 406,
        statusText: 'Invalid Content-Type Header',
    })
