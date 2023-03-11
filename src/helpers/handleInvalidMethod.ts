export const handleInvalidMethod = (method: string) =>
    new Response(null, {
        status: 405,
        statusText: `Method ${method} Not Allowed`,
    })
