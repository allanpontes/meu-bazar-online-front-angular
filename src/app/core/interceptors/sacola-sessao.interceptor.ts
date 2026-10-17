import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs';
import { API_URL } from '../services/api.service';

// O Safari bloqueia cookie entre sites (front na Vercel, API no Render), então a sessão da sacola
// também viaja em um cabeçalho. O cookie continua sendo enviado como segunda opção.
const CHAVE = 'sacola_sessao';
const CABECALHO = 'X-Sacola-Sessao';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function lerSessao(): string | null {
  try {
    const valor = localStorage.getItem(CHAVE);
    return valor && UUID.test(valor) ? valor : null;
  } catch {
    return null; // localStorage pode estar bloqueado (modo privado)
  }
}

function gravarSessao(valor: string): void {
  try {
    localStorage.setItem(CHAVE, valor);
  } catch {
    // sem localStorage a sacola depende do cookie
  }
}

export const sacolaSessaoInterceptor: HttpInterceptorFn = (req, next) => {
  // Só as rotas públicas da sacola e a criação do pedido; a listagem de pedidos é do admin
  const daSacola =
    req.url.startsWith(`${API_URL}/sacola`) || (req.method === 'POST' && req.url === `${API_URL}/pedidos`);
  if (!daSacola) return next(req);

  const sessao = lerSessao();
  const requisicao = sessao ? req.clone({ setHeaders: { [CABECALHO]: sessao } }) : req;

  return next(requisicao).pipe(
    tap((evento) => {
      if (evento instanceof HttpResponse) {
        const recebida = evento.headers.get(CABECALHO);
        if (recebida && UUID.test(recebida)) gravarSessao(recebida);
      }
    })
  );
};
