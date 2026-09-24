import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'

// Récupérer les messages d'une conversation
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true,
            email: true,
            isOnline: true,
            lastSeen: true,
            createdAt: true,
          },
        },
        replyTo: {
          include: {
            sender: {
              select: { id: true, username: true, avatar: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ messages: messages.reverse() })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Envoyer un message
// Remplacez la fonction POST par celle-ci :
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return NextResponse.json({ error: 'Non auth' }, { status: 401 })

    const { id } = await context.params
    const body = await req.json()
    const { content, type = 'text', replyToId, fileUrl, fileName, fileSize, fileMime, duration } = body

    const message = await prisma.message.create({
      data: {
        content: content?.trim() || '',
        type,
        senderId: userId,
        conversationId: id,
        replyToId,
        fileUrl,
        fileName,
        fileSize,
        fileMime,
        duration,
      },
      include: {
        sender: { select: { id: true, username: true, avatar: true } },
        replyTo: { include: { sender: { select: { id: true, username: true, avatar: true } } } },
      },
    })

    await prisma.conversation.update({ where: { id }, data: { updatedAt: new Date() } })
    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}