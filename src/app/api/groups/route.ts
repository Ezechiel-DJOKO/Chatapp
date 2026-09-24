import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'

// Lister les groupes
export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const groups = await prisma.group.findMany({
      where: {
        members: { some: { userId } },
      },
      include: {
        creator: {
          select: { id: true, username: true, avatar: true },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                isOnline: true,
                lastSeen: true,
                email: true,
                createdAt: true,
              },
            },
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

    const formatted = groups.map((group) => ({
      ...group,
      lastMessage: group.messages[0] || null,
      messages: [],
    }))

    return NextResponse.json({ groups: formatted })
  } catch (error) {
    console.error('Groups error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Créer un groupe
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { name, description, memberIds } = await req.json()

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Le nom du groupe est requis' },
        { status: 400 }
      )
    }

    // Ajouter le créateur et enlever les doublons
    const allMemberIds = [
      userId,
      ...(memberIds || []),
    ].filter(
      (id: string, index: number, arr: string[]) => arr.indexOf(id) === index
    )

    const group = await prisma.group.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        creatorId: userId,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          name
        )}&background=10b981&color=fff&size=128`,
        members: {
          create: allMemberIds.map((memberId: string) => ({
            userId: memberId,
            role: memberId === userId ? 'admin' : 'member',
          })),
        },
      },
      include: {
        creator: {
          select: { id: true, username: true, avatar: true },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                isOnline: true,
                lastSeen: true,
                email: true,
                createdAt: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ group }, { status: 201 })
  } catch (error) {
    console.error('Create group error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}