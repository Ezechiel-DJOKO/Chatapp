import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'

// Ajouter des membres
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { id } = await params
    const { userIds } = await req.json()

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'Liste d\'utilisateurs requise' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur est admin
    const membership = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId, groupId: id } },
    })

    if (!membership || membership.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const results = []
    for (const uid of userIds) {
      try {
        const member = await prisma.groupMember.create({
          data: { userId: uid, groupId: id },
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
        })
        results.push(member)
      } catch {
        // Déjà membre, on ignore
      }
    }

    return NextResponse.json({ members: results }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Retirer un membre
export async function DELETE(
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
    const memberUserId = searchParams.get('userId')

    if (!memberUserId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      )
    }

    // Un utilisateur peut se retirer lui-même, ou un admin peut retirer
    if (memberUserId !== userId) {
      const membership = await prisma.groupMember.findUnique({
        where: { userId_groupId: { userId, groupId: id } },
      })
      if (!membership || membership.role !== 'admin') {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
      }
    }

    await prisma.groupMember.delete({
      where: { userId_groupId: { userId: memberUserId, groupId: id } },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}