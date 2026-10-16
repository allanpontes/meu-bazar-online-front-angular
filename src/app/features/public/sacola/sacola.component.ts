import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SacolaService } from '../../../core/services/sacola.service';
import { AvisoSacolaComponent } from '../../../shared/aviso-sacola/aviso-sacola.component';

@Component({
  selector: 'app-sacola',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, AvisoSacolaComponent],
  template: `
    <div class="min-h-screen bg-[#FFFDF9] font-sans antialiased text-slate-800">
      <header class="border-b border-slate-100 bg-white px-6 py-4 shadow-sm">
        <div class="mx-auto flex max-w-4xl items-center justify-between">
          <a routerLink="/" class="leading-none" aria-label="Elas no Closet - voltar à vitrine">
            <span class="block text-[9px] font-black uppercase tracking-[0.28em] text-[#F50057]">elas no</span>
            <span class="mt-0.5 block font-serif text-2xl font-bold leading-none tracking-tight text-[#580444]">closet</span>
          </a>
          <a routerLink="/" class="text-sm font-bold text-[#580444] hover:text-[#F50057]">← continuar comprando</a>
        </div>
      </header>

      <main class="mx-auto max-w-4xl px-6 py-8">
        <h1 class="mb-6 text-3xl font-black tracking-tight text-[#580444]">Minha sacola</h1>

        @if (sacola.erro(); as erro) {
          <p role="alert" class="mb-4 rounded-xl border border-[#F5B1C1] bg-[#FFE3E8] p-3 text-sm font-bold text-[#7D344B]">{{ erro }}</p>
        }

        @if (sacola.itens().length === 0) {
          <div class="rounded-2xl border border-[#EAD5DA] bg-white p-10 text-center shadow-sm">
            <p class="font-bold text-[#580444]">Sua sacola está vazia.</p>
            <p class="mt-1 text-sm text-slate-500">Garimpe peças únicas na vitrine e reserve as suas favoritas.</p>
            <a routerLink="/" class="mt-5 inline-block rounded-full bg-[#580444] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#F50057]">ver peças</a>
          </div>
        } @else {
          <ul class="space-y-3">
            @for (item of sacola.itens(); track item.produto_id) {
              <li class="flex items-center gap-4 rounded-2xl border border-[#EAD5DA] bg-white p-4 shadow-sm">
                <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-3xl" aria-hidden="true">📦</div>
                <div class="min-w-0 flex-1">
                  <p class="truncate font-bold text-slate-800">{{ item.nome }}</p>
                  @if (item.estado_conservacao) {
                    <p class="text-xs font-bold uppercase tracking-wider text-[#7D344B]">
                      {{ item.estado_conservacao }}@if (item.tamanho) { · Tam. {{ item.tamanho }} }
                    </p>
                  }
                  <p class="mt-1 text-xs font-bold text-orange-700">⏰ reservada por {{ sacola.formatarTempo(sacola.segundosRestantes(item)) }}</p>
                </div>
                <div class="text-right">
                  <p class="font-black text-slate-900">{{ item.preco | currency:'BRL':'symbol':'1.2-2' }}</p>
                  <button type="button" [disabled]="sacola.estaProcessando(item.produto_id)" [attr.aria-busy]="sacola.estaProcessando(item.produto_id)" (click)="sacola.remover(item.produto_id)" class="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-[#F50057] hover:underline disabled:cursor-wait disabled:text-slate-400 disabled:no-underline">
                    @if (sacola.estaProcessando(item.produto_id)) {
                      <span class="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-[#F50057]" aria-hidden="true"></span>
                      removendo...
                    } @else {
                      remover
                    }
                  </button>
                </div>
              </li>
            }
          </ul>

          <div class="mt-6 rounded-2xl border border-[#EAD5DA] bg-white p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold text-[#7D344B]">Subtotal ({{ sacola.totalItens() }} {{ sacola.totalItens() === 1 ? 'peça' : 'peças' }})</span>
              <span class="text-2xl font-black text-[#580444]">{{ sacola.subtotal() | currency:'BRL':'symbol':'1.2-2' }}</span>
            </div>
            <a routerLink="/checkout" class="mt-4 block w-full rounded-xl bg-[#580444] py-3 text-center text-sm font-black uppercase tracking-wider text-white transition hover:bg-[#F50057]">finalizar compra</a>
          </div>
        }
      </main>

      <app-aviso-sacola />
    </div>
  `
})
export class SacolaComponent {
  sacola = inject(SacolaService);
}
