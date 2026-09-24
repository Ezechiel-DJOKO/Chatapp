import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await req.json()
    const content = body?.content

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'Le contenu est requis' }, { status: 400 })
    }

    const message = await prisma.message.findUnique({ where: { id } })
    if (!message || message.senderId !== userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const updated = await prisma.message.update({
      where: { id },
      data: {
        content: content.trim(),
        isEdited: true,
      },
      include: {
        sender: { select: { id: true, username: true, avatar: true, email: true, isOnline: true, lastSeen: true, createdAt: true } },
        replyTo: { include: { sender: { select: { id: true, username: true, avatar: true } } } },
        reactions: { include: { user: { select: { id: true, username: true } } } },
      },
    })

    return NextResponse.json({ message: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { id } = await context.params
    const message = await prisma.message.findUnique({ where: { id } })

    if (!message || message.senderId !== userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const updated = await prisma.message.update({
      where: { id },
      data: {
        content: 'Message supprimé',
        isDeleted: true,
      },
      include: {
        sender: { select: { id: true, username: true, avatar: true, email: true, isOnline: true, lastSeen: true, createdAt: true } },
        replyTo: { include: { sender: { select: { id: true, username: true, avatar: true } } } },
        reactions: { include: { user: { select: { id: true, username: true } } } },
      },
    })

    return NextResponse.json({ message: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}