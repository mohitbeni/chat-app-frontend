import { createContext, useCallback, useEffect, useState } from 'react'
import { baseUrl, getRequest, postRequest } from '../utils/services'
import { io } from 'socket.io-client'
// import { async } from 'react-input-emoji'

export const ChatContext = createContext()

export const ChatContextProvider = ({ children, user }) => {
  const [userChats, setUserChats] = useState(null)
  const [isUserChatsLoading, setIsUserChatsLoading] = useState(false)
  const [userChatsError, setUserChatsError] = useState(null)
  const [potentialChats, setPotentialChats] = useState([])
  const [currentChat, setCurrentChat] = useState(null)

  const [messages, setMessages] = useState(null)
  const [isMessagesLoading, setIsMessagesLoading] = useState(false)
  const [messageError, setMessageError] = useState(null)
  const [sendTextMessageError, setSendTextMessageError] = useState(null)
  const [newMessage, setNewMessage] = useState(null)
  const [socket, setSocket] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [notifications, setNotifications] = useState([])
  const [allUsers, setAllUsers] = useState([])
  //   console.log('CurrentChat:', currentChat)
  //   console.log('Messages:', messages)
  console.log('Notifications', notifications)
  // console.log('Online Users:', onlineUsers)
  //initial socket
  useEffect(() => {
    const newSocket = io('https://mechat-socket.onrender.com')
    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [user])

  //add online users
  useEffect(() => {
    if (socket === null) return
    socket.emit('addNewUser', user?._id)
    socket.on('getOnlineUsers', (resp) => {
      setOnlineUsers(resp)
    })

    return () => {
      socket.off('getOnlineUsers')
    }
  }, [socket])

  //send message instantly

  useEffect(() => {
    if (socket === null) return

    const recipientId = currentChat?.members.find((id) => id !== user?._id)
    socket.emit('sendMessage', { ...newMessage, recipientId })
  }, [newMessage])

  //receive message and notification
  useEffect(() => {
    if (socket === null) return

    socket.on('getMessage', (resp) => {
      if (currentChat?._id !== resp.chatId) {
        return
      }
      setMessages((prev) => [...prev, resp])
    })

    socket.on('getNotification', (resp) => {
      const isChatOpen = currentChat?.members.some((id) => id === resp.senderId)

      if (isChatOpen) {
        setNotifications((prev) => [...prev, { ...resp, isRead: true }])
      } else {
        setNotifications((prev) => [...prev, resp])
      }
    })

    return () => {
      socket.off('getMessage')
      socket.off('getNotification')
    }
  }, [socket, currentChat])

  useEffect(() => {
    const getUsers = async () => {
      const response = await getRequest(`${baseUrl}/users`)

      if (response.error) {
        return console.log('Error fetching users', response)
      }

      const pChats = response.filter((u) => {
        let isChatCreated = false
        if (user?._id === u._id) {
          return false
        }
        if (userChats) {
          isChatCreated = userChats?.some((chat) => {
            return chat?.members[0] === u._id || chat?.members[1] === u._id
          })
        }

        return !isChatCreated
      })

      setPotentialChats(pChats)
      setAllUsers(response)
    }

    getUsers()
  }, [userChats])

  //   console.log('User', user)
  useEffect(() => {
    const getUserChats = async () => {
      if (user?._id) {
        setIsUserChatsLoading(true)
        setUserChatsError(null)
        const response = await getRequest(`${baseUrl}/chats/${user?._id}`)
        // console.log('Response', response)
        setIsUserChatsLoading(false)
        if (response.error) {
          return setUserChatsError(response)
        }

        setUserChats(response)
      }
    }

    getUserChats()
  }, [user, notifications])

  useEffect(() => {
    const getMessages = async () => {
      setIsMessagesLoading(true)
      setMessageError(null)
      const response = await getRequest(
        `${baseUrl}/messages/${currentChat?._id}`
      )
      // console.log('Response', response)
      setIsMessagesLoading(false)
      if (response.error) {
        return setMessageError(response)
      }

      setMessages(response)
    }

    getMessages()
  }, [currentChat])

  const sendTextMessage = useCallback(
    async (textMessage, sender, currentChatId, setTextMessage) => {
      //   console.log('Message:', textMessage)
      if (!textMessage) {
        return console.log('You must type something')
      }

      const response = await postRequest(
        `${baseUrl}/messages`,
        JSON.stringify({
          chatId: currentChatId,
          senderId: sender._id,
          text: textMessage,
        })
      )

      if (response.error) {
        return setSendTextMessageError(response)
      }

      setNewMessage(response)
      setMessages((prev) => [...prev, response])
      //   setTextMessage('')
    },
    []
  )

  const updateCurrentChat = useCallback((chat) => {
    setCurrentChat(chat)
  }, [])

  const createChat = useCallback(async (firstId, secondId) => {
    const response = await postRequest(
      `${baseUrl}/chats`,
      JSON.stringify({
        firstId,
        secondId,
      })
    )

    if (response.error) {
      return console.log('Error creating chats', response)
    }

    setUserChats((prev) => [...prev, response])
  }, [])

  const markAllNotificationsAsRead = useCallback((notifications) => {
    const mNotifications = notifications.map((n) => {
      return { ...n, isRead: true }
    })

    setNotifications(mNotifications)
  }, [])

  const markNotificationAsRead = useCallback(
    (n, userChats, user, notifications) => {
      //find chat to open
      const desiredChat = userChats.find((chat) => {
        const chatMembers = [user._id, n.senderId]
        const isDesiredChat = chat?.members.every((member) => {
          return chatMembers.includes(member)
        })

        return isDesiredChat
      })

      //mark notification as read
      const mNotifications = notifications.map((ele) => {
        if (n.senderId === ele.senderId) {
          return { ...n, isRead: true }
        } else {
          return ele
        }
      })

      updateCurrentChat(desiredChat)
      setNotifications(mNotifications)
    },
    []
  )

  const markThisUserNotificationsAsRead = useCallback(
    (thisUserNotifications, notifications) => {
      const mNotifications = notifications.map((ele) => {
        let notification

        thisUserNotifications.forEach((n) => {
          if (n.senderId === ele.senderId) {
            notification = { ...n, isRead: true }
          } else {
            notification = ele
          }
        })
        return notification
      })

      setNotifications(mNotifications)
    },
    []
  )

  return (
    <ChatContext.Provider
      value={{
        userChats,
        isUserChatsLoading,
        userChatsError,
        potentialChats,
        createChat,
        updateCurrentChat,
        messages,
        isMessagesLoading,
        messageError,
        currentChat,
        sendTextMessage,
        onlineUsers,
        notifications,
        allUsers,
        markAllNotificationsAsRead,
        markNotificationAsRead,
        markThisUserNotificationsAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}
