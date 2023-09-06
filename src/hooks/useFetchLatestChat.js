import { useContext, useEffect, useState } from 'react'
import { baseUrl, getRequest } from '../utils/services'
import { ChatContext } from '../context/ChatContex'

export const useFetchLatestChat = (chats) => {
  const [latestChat, setLatestChat] = useState(null)
  const { newMessage, notifications } = useContext(ChatContext)

  useEffect(() => {
    const getChats = async () => {
      const sender = notifications[notifications?.length - 1]?.senderId
      const newChat = chats.find(
        (chat) => chat.members[0] === sender || chat.members[1] === sender
      )
      setLatestChat(newChat)
    }

    getChats()
  }, [notifications, newMessage])

  return { latestChat }
}
