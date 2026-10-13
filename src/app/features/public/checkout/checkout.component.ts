import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService, Pedido } from '../../../core/services/api.service';
import { SacolaService } from '../../../core/services/sacola.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CurrencyPipe, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[#FFFDF9] font-sans antialiased text-slate-800">
      <header class="border-b border-slate-100 bg-white px-6 py-4 shadow-sm">
        <div class="mx-auto flex max-w-4xl items-center justify-between">
          <a routerLink="/" class="leading-none" aria-label="Elas no Closet - voltar à vitrine">
            <span class="block text-[9px] font-black uppercase tracking-[0.28em] text-[#F50057]">elas no</span>
            <span class="mt-0.5 block font-serif text-2xl font-bold leading-none tracking-tight text-[#580444]">closet</span>
          </a>
          <a routerLink="/sacola" class="text-sm font-bold text-[#580444] hover:text-[#F50057]">← voltar à sacola</a>
        </div>
      </header>

      <main class="mx-auto max-w-4xl px-6 py-8">
        @if (pedido(); as p) {
          <section class="rounded-2xl border border-[#EAD5DA] bg-white p-8 text-center shadow-sm" role="status">
            <p class="text-4xl" aria-hidden="true">🎀</p>
            <h1 class="mt-2 text-2xl font-black text-[#580444]">Pedido #{{ p.id }} recebido!</h1>
            <p class="mt-2 text-sm text-slate-600">
              Obrigada, {{ p.nome_cliente }}! Vamos entrar em contato pelo WhatsApp para combinar o pagamento e a entrega.
            </p>
            <p class="mt-4 text-lg font-black text-[#580444]">{{ p.subtotal | currency:'BRL':'symbol':'1.2-2' }}</p>
            <ul class="mx-auto mt-4 max-w-sm space-y-1 text-sm text-slate-600">
              @for (item of p.itens; track $index) {
                <li class="flex justify-between"><span>{{ item.nome }}</span><span>{{ item.preco | currency:'BRL':'symbol':'1.2-2' }}</span></li>
              }
            </ul>
            <a routerLink="/" class="mt-6 inline-block rounded-full bg-[#580444] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#F50057]">voltar à vitrine</a>
          </section>
        } @else if (sacola.itens().length === 0) {
          <div class="rounded-2xl border border-[#EAD5DA] bg-white p-10 text-center shadow-sm">
            <p class="font-bold text-[#580444]">Sua sacola está vazia.</p>
            <p class="mt-1 text-sm text-slate-500">Reserve algumas peças para finalizar a compra.</p>
            <a routerLink="/" class="mt-5 inline-block rounded-full bg-[#580444] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#F50057]">ver peças</a>
          </div>
        } @else {
          <h1 class="mb-6 text-3xl font-black tracking-tight text-[#580444]">Finalizar compra</h1>

          <div class="grid gap-6 md:grid-cols-5">
            <form [formGroup]="form" (ngSubmit)="confirmar()" class="space-y-4 rounded-2xl border border-[#EAD5DA] bg-white p-5 shadow-sm md:col-span-3" novalidate>
              <div>
                <label for="nome" class="mb-1 block text-xs font-bold uppercase tracking-wider text-[#7D344B]">Nome completo</label>
                <input id="nome" formControlName="nome_cliente" autocomplete="name" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#580444] focus:outline-none" />
                @if (invalido('nome_cliente')) { <p class="mt-1 text-xs font-bold text-[#F50057]">Informe seu nome.</p> }
              </div>
              <div>
                <label for="whatsapp" class="mb-1 block text-xs font-bold uppercase tracking-wider text-[#7D344B]">WhatsApp com DDD</label>
                <input id="whatsapp" formControlName="whatsapp" inputmode="tel" autocomplete="tel" placeholder="(11) 98888-7777" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#580444] focus:outline-none" />
                @if (invalido('whatsapp')) { <p class="mt-1 text-xs font-bold text-[#F50057]">Informe um WhatsApp válido com DDD.</p> }
              </div>
              <div>
                <label for="endereco" class="mb-1 block text-xs font-bold uppercase tracking-wider text-[#7D344B]">Endereço de entrega</label>
                <textarea id="endereco" formControlName="endereco" rows="3" autocomplete="street-address" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#580444] focus:outline-none"></textarea>
                @if (invalido('endereco')) { <p class="mt-1 text-xs font-bold text-[#F50057]">Informe o endereço completo.</p> }
              </div>

              @if (erro(); as msg) {
                <p role="alert" class="rounded-xl border border-[#F5B1C1] bg-[#FFE3E8] p-3 text-sm font-bold text-[#7D344B]">{{ msg }}</p>
              }

              <button type="submit" [disabled]="enviando()" [attr.aria-busy]="enviando()" class="flex w-full items-center justify-center gap-2 rounded-xl bg-[#580444] py-3 text-sm font-black uppercase tracking-wider text-white transition hover:bg-[#F50057] disabled:cursor-wait disabled:bg-slate-200 disabled:text-slate-500">
                @if (enviando()) {
                  <span class="h-4 w-4 animate-spin rounded-full border-2 border-slate-400/40 border-t-slate-600" aria-hidden="true"></span>
                  enviando pedido...
                } @else {
                  confirmar pedido
                }
              </button>
            </form>

            <aside class="h-fit rounded-2xl border border-[#EAD5DA] bg-white p-5 shadow-sm md:col-span-2">
              <h2 class="mb-3 text-sm font-black uppercase tracking-wider text-[#580444]">Resumo</h2>
              <ul class="space-y-2 text-sm">
                @for (item of sacola.itens(); track item.produto_id) {
                  <li class="flex justify-between gap-3">
                    <span class="truncate">{{ item.nome }}</span>
                    <span class="font-bold">{{ item.preco | currency:'BRL':'symbol':'1.2-2' }}</span>
                  </li>
                }
              </ul>
              <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <span class="text-sm font-bold text-[#7D344B]">Subtotal</span>
                <span class="text-xl font-black text-[#580444]">{{ sacola.subtotal() | currency:'BRL':'symbol':'1.2-2' }}</span>
              </div>
              <p class="mt-3 text-xs text-slate-500">Frete e pagamento combinados pelo WhatsApp após o pedido.</p>
            </aside>
          </div>
        }
      </main>
    </div>
  `
})
export class CheckoutComponent {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  sacola = inject(SacolaService);

  pedido = signal<Pedido | null>(null);
  enviando = signal(false);
  erro = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    nome_cliente: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    whatsapp: ['', [Validators.required, Validators.pattern(/^\D*(\d\D*){10,13}$/)]],
    endereco: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(300)]]
  });

  invalido(campo: 'nome_cliente' | 'whatsapp' | 'endereco'): boolean {
    const c = this.form.controls[campo];
    return c.invalid && (c.touched || c.dirty);
  }

  confirmar(): void {
    if (this.enviando()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.erro.set(null);
    this.api.criarPedido(this.form.getRawValue()).subscribe({
      next: pedido => {
        this.pedido.set(pedido);
        this.enviando.set(false);
        this.sacola.carregar();
      },
      error: (e: HttpErrorResponse) => {
        this.enviando.set(false);
        this.erro.set(this.mensagemDeErro(e));
        this.sacola.carregar();
      }
    });
  }

  private mensagemDeErro(e: HttpErrorResponse): string {
    const detalhe = e.error?.detail;
    if (typeof detalhe === 'string') return detalhe;
    if (Array.isArray(detalhe) && detalhe[0]?.msg) return String(detalhe[0].msg).replace(/^Value error, /, '');
    return 'Não foi possível enviar o pedido agora. Tente novamente.';
  }
}
