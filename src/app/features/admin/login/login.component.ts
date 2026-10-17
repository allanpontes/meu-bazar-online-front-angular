import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-[#FFFDF9] px-6 font-sans text-slate-800 antialiased">
      <main class="w-full max-w-sm">
        <div class="mb-6 text-center leading-none" aria-label="Elas no Closet">
          <span class="block text-[9px] font-black uppercase tracking-[0.28em] text-[#F50057]">elas no</span>
          <span class="mt-0.5 block font-serif text-3xl font-bold leading-none tracking-tight text-[#580444]">closet</span>
          <p class="mt-2 text-xs font-medium text-slate-500">Painel administrativo</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="entrar()" class="space-y-4 rounded-2xl border border-[#EAD5DA] bg-white p-6 shadow-sm" novalidate>
          <div>
            <label for="email" class="block text-xs font-bold uppercase tracking-wider text-[#7D344B]">E-mail</label>
            <input id="email" type="email" formControlName="email" autocomplete="username"
              class="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#580444] focus:outline-none" />
          </div>

          <div>
            <label for="senha" class="block text-xs font-bold uppercase tracking-wider text-[#7D344B]">Senha</label>
            <div class="relative mt-1">
              <input id="senha" [type]="mostrarSenha() ? 'text' : 'password'" formControlName="senha" autocomplete="current-password"
                class="w-full rounded-xl border border-slate-200 py-2.5 pl-4 pr-20 text-sm focus:border-[#580444] focus:outline-none" />
              <button type="button" (click)="mostrarSenha.set(!mostrarSenha())"
                [attr.aria-pressed]="mostrarSenha()"
                class="absolute inset-y-0 right-3 text-xs font-bold text-[#7D344B] hover:text-[#F50057]">
                {{ mostrarSenha() ? 'ocultar' : 'mostrar' }}
              </button>
            </div>
          </div>

          @if (erro(); as msg) {
            <p role="alert" class="text-sm font-bold text-[#F50057]">{{ msg }}</p>
          }

          <button type="submit" [disabled]="form.invalid || enviando()"
            class="w-full rounded-full bg-[#580444] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#F50057] disabled:bg-slate-200 disabled:text-slate-400">
            @if (enviando()) { entrando... } @else { entrar }
          </button>
        </form>

        <p class="mt-4 text-center text-xs text-slate-500">
          <a routerLink="/" class="font-bold hover:text-[#F50057]">← voltar à vitrine</a>
        </p>
      </main>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private rota = inject(ActivatedRoute);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required]]
  });

  enviando = signal(false);
  mostrarSenha = signal(false);
  erro = signal<string | null>(null);

  entrar(): void {
    if (this.form.invalid || this.enviando()) return;
    this.enviando.set(true);
    this.erro.set(null);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl(this.destino()),
      error: (e: HttpErrorResponse) => {
        this.enviando.set(false);
        this.form.controls.senha.reset();
        this.erro.set(
          e.status === 401
            ? 'E-mail ou senha incorretos.'
            : e.status === 429
              ? 'Muitas tentativas. Aguarde um minuto e tente de novo.'
              : 'Não foi possível entrar agora. Tente novamente.'
        );
      }
    });
  }

  // Só aceita voltar para dentro do /admin, para o link de login não virar redirecionamento para site externo
  private destino(): string {
    const volta = this.rota.snapshot.queryParamMap.get('voltar') ?? '';
    return volta.startsWith('/admin') && !volta.startsWith('//') ? volta : '/admin';
  }
}