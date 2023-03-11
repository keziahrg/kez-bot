import { format } from 'date-fns'

export const getCurrentTime = () => format(new Date(), 'k:mm:ss aaaa')
