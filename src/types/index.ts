export interface User {
  id: string
  username: string
  email: string
  avatar?: string | null
  bio?: string | null
  isOnline: boolean
  lastSeen: string
  createdAt: string
}

export interface MessageReaction {
  id: string
  emoji: string
  messageId: string
  userId: string
  user?: {
    id: string
    username: string
  }
  createdAt: string
}

export interface Message {
  id: string
  content: string
  type: 'text' | 'image' | 'file' | 'voice'
  // 🆕 Nouveaux champs ajoutés
  fileUrl?: string | null
  fileName?: string | null
  fileSize?: number | null
  fileMime?: string | null
  duration?: number | null
  senderId: string
  conversationId?: string | null
  groupId?: string | null
  replyToId?: string | null
  isEdited: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  sender: User
  replyTo?: Message | null
  reactions?: MessageReaction[]
}

export interface Conversation {
  id: string
  user1Id: string
  user2Id: string
  user1: User
  user2: User
  messages: Message[]
  createdAt: string
  updatedAt: string
  lastMessage?: Message | null
}

export interface Group {
  id: string
  name: string
  description?: string | null
  avatar?: string | null
  creatorId: string
  creator: User
  members: GroupMember[]
  messages: Message[]
  createdAt: string
  updatedAt: string
  lastMessage?: Message | null
}

export interface GroupMember {
  id: string
  userId: string
  groupId: string
  role: 'admin' | 'member'
  joinedAt: string
  user: User
}

export type ChatType = 'conversation' | 'group'

export interface ActiveChat {
  type: ChatType
  id: string
  name: string
  avatar?: string | null
  isOnline?: boolean
  data: Conversation | Group
}

export interface TypingUser {
  id: string
  username: string
}