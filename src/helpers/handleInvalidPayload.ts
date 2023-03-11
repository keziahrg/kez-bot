export const handleInvalidPayload = () =>
    new Response(null, {
        status: 400,
        statusText: 'Invalid Payload',
    })
