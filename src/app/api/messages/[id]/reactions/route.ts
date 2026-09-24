import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { id: messageId } = await context.params
    const body = await req.json()
    const emoji = body?.emoji

    if (!emoji || typeof emoji !== 'string') {
      return NextResponse.json({ error: 'Emoji requis' }, { status: 400 })
    }

    const existing = await prisma.messageReaction.findUnique({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId,
          emoji,
        },
      },
    })

    if (existing) {
      await prisma.messageReaction.delete({
        where: { id: existing.id },
      })
    } else {
      await prisma.messageReaction.create({
        data: {
          emoji,
          messageId,
          userId,
        },
      })
    }

    const reactions = await prisma.messageReaction.findMany({
      where: { messageId },
      include: { user: { select: { id: true, username: true } } },
    })

    return NextResponse.json({ reactions })
  } catch (error) {
    console.error('Reaction error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}