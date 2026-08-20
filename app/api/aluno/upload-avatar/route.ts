// app/api/aluno/upload-avatar/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  try {
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRole) {
      return NextResponse.json({ 
        error: 'Chave SUPABASE_SERVICE_ROLE_KEY não configurada no arquivo .env.local. Por favor, adicione-a para habilitar o upload.' 
      }, { status: 500 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const studentId = formData.get('studentId') as string

    if (!file || !studentId) {
      return NextResponse.json({ error: 'Arquivo e ID do aluno são obrigatórios.' }, { status: 400 })
    }

    // Converter arquivo para ArrayBuffer e depois para Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const fileExt = file.name.split('.').pop()
    const fileName = `${studentId}-${Date.now()}.${fileExt}`

    // 1. Garantir que o bucket existe (tenta criar, se falhar assume que já existe ou precisa de criação manual)
    try {
      await supabaseAdmin.storage.createBucket('avatars', {
        public: true,
        fileSizeLimit: 2097152 // 2MB
      })
    } catch (bucketErr) {
      console.log('Bucket "avatars" já existente ou criação automática indisponível.')
    }

    // 2. Fazer upload do arquivo para o bucket avatars do Supabase
    const { error: uploadError } = await supabaseAdmin.storage
      .from('avatars')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      console.error('Erro no upload do arquivo para o storage:', uploadError)
      if (uploadError.message === 'Bucket not found') {
        return NextResponse.json({ 
          error: 'O bucket "avatars" não foi encontrado no Supabase. Por favor, crie um bucket público chamado "avatars" no menu Storage do seu painel Supabase.' 
        }, { status: 500 })
      }
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // 3. Obter URL pública do arquivo
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('avatars')
      .getPublicUrl(fileName)

    // 4. Atualizar a coluna avatar_url na tabela students
    const { error: updateError } = await supabaseAdmin
      .from('students')
      .update({ avatar_url: publicUrl })
      .eq('id', studentId)

    if (updateError) {
      console.error('Erro ao atualizar avatar do aluno no banco:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, url: publicUrl })
  } catch (err: any) {
    console.error('Erro na rota de upload de avatar:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
