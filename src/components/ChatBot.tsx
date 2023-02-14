'use client'

import { Conversation } from './Conversation'
import { Message } from './Message'

export const ChatBot = () => {
    return (
        <Conversation>
            <Message
                className="rounded-bl-none bg-purple"
                message="Hi!"
                ariaLabel={`At 2:41pm KezBot said:`}
            />
            <Message
                className="rounded-br-none bg-blue"
                message="Hello!"
                ariaLabel={`At 2:42pm you said:`}
            />
        </Conversation>
    )
}
