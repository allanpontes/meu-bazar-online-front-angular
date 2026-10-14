import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { API_URL } from '../services/api.service';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // O token só pode ir para a nossa API, nunca para outro domínio
  if (!req.url.startsWith(API_URL)) return next(req);

  const auth = inject(AuthService);
  const token = auth.obterToken();
  const requisicao = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(requisicao).pipe(
    catchError((erro: unknown) => {
      // Se enviamos um token e a API recusou, o crachá não vale mais
      if (token && erro instanceof HttpErrorResponse && erro.status === 401) {
        auth.sessaoInvalidada();
      }
      return throwError(() => erro);
    })
  );
};
