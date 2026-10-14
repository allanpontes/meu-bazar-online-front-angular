import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService, Credenciais, TokenResposta } from './api.service';

const CHAVE_TOKEN = 'admin_token';
const CHAVE_EXPIRA = 'admin_token_expira_em';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  private token = signal<string | null>(this.lerTokenValido());

  readonly autenticado = computed(() => this.token() !== null);

  login(credenciais: Credenciais): Observable<TokenResposta> {
    return this.api.login(credenciais).pipe(
      tap(resposta => {
        sessionStorage.setItem(CHAVE_TOKEN, resposta.access_token);
        sessionStorage.setItem(CHAVE_EXPIRA, String(Date.now() + resposta.expires_in * 1000));
        this.token.set(resposta.access_token);
      })
    );
  }

  logout(): void {
    this.limpar();
    this.router.navigate(['/admin/login']);
  }

  // Devolve o token só se ele ainda estiver dentro da validade; quem chama não precisa checar expiração
  obterToken(): string | null {
    const atual = this.token();
    if (atual && this.expirou()) {
      this.limpar();
      return null;
    }
    return atual;
  }

  // Usado pelo interceptor quando o back responde 401: o crachá foi recusado, então não vale mais
  sessaoInvalidada(): void {
    this.limpar();
    this.router.navigate(['/admin/login']);
  }

  private limpar(): void {
    sessionStorage.removeItem(CHAVE_TOKEN);
    sessionStorage.removeItem(CHAVE_EXPIRA);
    this.token.set(null);
  }

  private expirou(): boolean {
    const expiraEm = Number(sessionStorage.getItem(CHAVE_EXPIRA));
    return !expiraEm || Date.now() >= expiraEm;
  }

  private lerTokenValido(): string | null {
    const guardado = sessionStorage.getItem(CHAVE_TOKEN);
    if (!guardado || this.expirou()) {
      sessionStorage.removeItem(CHAVE_TOKEN);
      sessionStorage.removeItem(CHAVE_EXPIRA);
      return null;
    }
    return guardado;
  }
}
