import { useContext } from 'react'
import { ChatContext } from '../context/ChatContex'
import { Container, Stack } from 'react-bootstrap'
import UserChat from '../components/chat/UserChat'
import { AuthContext } from '../context/AuthContext'
import PotentialChats from '../components/chat/PotentialChats'
import ChatBox from '../components/chat/ChatBox'
import { useFetchLatestChat } from '../hooks/useFetchLatestChat'

const Chat = () => {
  const { userChats, isUserChatsLoading, userChatsError, updateCurrentChat } =
    useContext(ChatContext)

  const { user } = useContext(AuthContext)
  // console.log('UserChats', userChats)
  const { latestChat } = useFetchLatestChat(userChats)

  let chatTops = []
  chatTops.push(latestChat)

  const filteredChats = userChats?.filter(
    (chat) => chat?._id !== latestChat?._id
  )
  chatTops = chatTops.concat(filteredChats)

  console.log('latestchat: ', latestChat)
  console.log('filteredChats', filteredChats)
  console.log('chatTops', chatTops)
  return (
    <Container>
      <PotentialChats />
      {chatTops?.length < 1 ? null : (
        <Stack direction="horizontal" gap={4} className="align-items-start">
          <Stack className="messages-box flex-grow-0 pe-3" gap={3}>
            {isUserChatsLoading && <p>Loading chats..</p>}
            {chatTops?.map((chat, index) => {
              if (chat) {
                return (
                  <div key={index} onClick={() => updateCurrentChat(chat)}>
                    <UserChat chat={chat} user={user} />
                  </div>
                )
              }
            })}
          </Stack>
          <ChatBox />
        </Stack>
      )}
    </Container>
  )
}
export default Chat
