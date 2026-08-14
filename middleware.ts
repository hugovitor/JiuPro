// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Busca o cookie de autenticação (mude para o nome do cookie que seu provedor usar)
  const token = request.cookies.get('jiupro_session')?.value

  const isLoginPage = request.nextUrl.pathname === '/login'

  // 1. Se NÃO está logado e tenta acessar o dashboard, joga para o login
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Se JÁ está logado e tenta ir para o login, joga direto para o dashboard
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

// Configura em quais rotas o middleware vai rodar
export const config = {
  matcher: [
    /*
     * Protege a rota /dashboard e qualquer sub-rota dela (ex: /dashboard/alunos)
     * Ignora arquivos estáticos (imagens, favicon, etc) e rotas de API internas
     */
    '/dashboard/:path*',
    '/login'
  ],
}
