import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
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
      return NextResponse.json({ error: 'Aucun fichier' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Créer un nom unique sécurisé
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const uniqueName = `${Date.now()}-${safeName}`
    
    // Chemin vers public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')

    // S'assurer que le dossier existe
    await mkdir(uploadDir, { recursive: true })

    // Sauvegarder le fichier
    const filePath = path.join(uploadDir, uniqueName)
    await writeFile(filePath, buffer)

    // URL publique
    const url = `/uploads/${uniqueName}`

    return NextResponse.json({
      url,
      name: file.name,
      size: file.size,
      mime: file.type,
    })
  } catch (error) {
    console.error('Upload Error:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 })
  }
}