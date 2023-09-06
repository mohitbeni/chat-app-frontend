import { useContext, useEffect, useState } from 'react'
import { baseUrl, getRequest } from '../utils/services'
import { ChatContext } from '../context/ChatContex'

export const useFetchLatestMessage = (chat) => {
  const [latestMessage, setLatestMessage] = useState(null)
  const { newMessage, notifications } = useContext(ChatContext)

  useEffect(() => {
    const getMessages = async () => {
      const response = await getRequest(`${baseUrl}/messages/${chat?._id}`)

      if (response.error) {
        return console.log('Error getting messages: ', error)
      }

      const lastMessage = response[response?.length - 1]
      setLatestMessage(lastMessage)
    }

    getMessages()
  }, [newMessage, notifications])

  return { latestMessage }
}
