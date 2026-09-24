import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const data = await req.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    // Limite à 8Mo pour éviter les requêtes trop lourdes
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fichier trop grand (Max 8Mo)' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const mimeType = file.type || 'application/octet-stream'

    // Conversion en Base64 Data URL (Fonctionne 100% sur Vercel & Render sans disque dur)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${mimeType};base64,${base64}`

    return NextResponse.json({
      url: dataUrl,
      name: file.name,
      size: file.size,
      mime: mimeType,
    })
  } catch (error) {
    console.error('Upload Error:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 })
  }
}