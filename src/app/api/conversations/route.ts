import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'

// Lister les conversations
export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            isOnline: true,
            lastSeen: true,
            createdAt: true,
          },
        },
        user2: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            isOnline: true,
            lastSeen: true,
            createdAt: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: { id: true, username: true, avatar: true },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    const formatted = conversations.map((conv) => ({
      ...conv,
      lastMessage: conv.messages[0] || null,
      messages: [],
    }))

    return NextResponse.json({ conversations: formatted })
  } catch (error) {
    console.error('Conversations error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Créer une conversation
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { otherUserId } = await req.json()

    if (!otherUserId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      )
    }

    // Vérifier si la conversation existe déjà
    const existing = await prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: otherUserId },
          { user1Id: otherUserId, user2Id: userId },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            isOnline: true,
            lastSeen: true,
            createdAt: true,
          },
        },
        user2: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            isOnline: true,
            lastSeen: true,
            createdAt: true,
          },
        },
      },
    })

    if (existing) {
      return NextResponse.json({ conversation: existing })
    }

    const conversation = await prisma.conversation.create({
      data: {
        user1Id: userId,
        user2Id: otherUserId,
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            isOnline: true,
            lastSeen: true,
            createdAt: true,
          },
        },
        user2: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            isOnline: true,
            lastSeen: true,
            createdAt: true,
          },
        },
      },
    })

    return NextResponse.json({ conversation }, { status: 201 })
  } catch (error) {
    console.error('Create conversation error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}