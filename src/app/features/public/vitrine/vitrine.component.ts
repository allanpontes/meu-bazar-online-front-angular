import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { SacolaService } from '../../../core/services/sacola.service';

@Component({
  selector: 'app-vitrine',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-[#FFFDF9] flex flex-col font-sans antialiased text-slate-800">
      
      <!-- 🎟️ BARRA DE CUPOM -->
      <div class="bg-[#F4E3E8] text-[#580444] text-center py-2 text-xs font-bold tracking-wide border-b border-[#EAD5DA]">
        ✨ há cupom, há desconto! garimpe as peças únicas deste bazar ✨
      </div>

      <!-- 🌐 NAVBAR ESTILO ENJOEI -->
      <nav class="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="flex cursor-pointer items-center gap-2.5" (click)="recarregarVitrine()">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center" aria-hidden="true">
              <svg class="h-12 w-12 drop-shadow-sm" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 5h4v6l2 2 2-2V5h4l4 9 7 6-5 5-4-3v7l7 13H9l7-13v-7l-4 3-5-5 7-6 4-9Z" fill="#F50057" stroke="#580444" stroke-width="1.6" stroke-linejoin="round"/>
                <path d="M22 5c0 2 1 3 2 3s2-1 2-3M17 29h14M20 34h8" stroke="#FFFDF9" stroke-width="1.7" stroke-linecap="round"/>
                <path d="m40 7 .8 2.2L43 10l-2.2.8L40 13l-.8-2.2L37 10l2.2-.8L40 7Z" fill="#F50057"/>
              </svg>
            </div>
            <div class="leading-none" aria-label="Elas no Closet">
              <span class="block text-[9px] font-black uppercase tracking-[0.28em] text-[#F50057]">elas no</span>
              <span class="mt-0.5 block font-serif text-2xl font-bold leading-none tracking-tight text-[#580444]">closet</span>
            </div>
          </div>

          <div class="w-full md:max-w-md relative flex items-center">
            <input type="text" placeholder="busque desapegos por nome..." class="w-full bg-slate-50 border border-slate-200 rounded-full py-2.5 pl-5 pr-10 text-sm focus:outline-none focus:border-[#580444]" />
            <span class="absolute right-4 text-slate-400">🔍</span>
          </div>

          <div class="flex items-center gap-4 font-bold text-sm text-slate-600">
            <span (click)="exibirAjuda()" class="hover:text-[#F50057] cursor-pointer">como funciona?</span>
            <span (click)="irParaAdmin()" class="hover:text-[#F50057] cursor-pointer text-amber-600">⚙️ painel gerente</span>
            
            <button type="button" (click)="irParaSacola()" class="bg-[#580444] text-white px-5 py-2.5 rounded-full shadow-md flex items-center gap-2 transition hover:bg-[#F50057]">
              <span>🛒</span>
              <span class="text-xs uppercase tracking-wider font-extrabold">sacola</span>
              <span class="bg-white text-[#580444] text-xs font-black px-2 py-0.5 rounded-full">{{ sacola.totalItens() }}</span>
            </button>
          </div>
        </div>
      </nav>

      <!-- ⚡ MAIN -->
      <main class="flex-grow max-w-6xl w-full mx-auto px-6 py-8">
        @if (sacola.erro(); as erro) {
          <p role="alert" class="mb-4 rounded-xl border border-[#F5B1C1] bg-[#FFE3E8] p-3 text-sm font-bold text-[#7D344B]">{{ erro }}</p>
        }
        <div class="relative isolate mb-12 flex flex-col items-center justify-between overflow-hidden rounded-3xl border border-[#F5B1C1] bg-gradient-to-r from-[#FBC5D2] to-[#FFE3E8] p-5 shadow-sm md:flex-row md:p-6">
          <div class="z-10 space-y-3 text-center md:text-left">
            <div class="inline-block rounded-md bg-[#580444] px-3 py-1 text-xs font-black uppercase tracking-widest text-white shadow-sm">Elas no Closet</div>
            <h2 class="text-3xl font-black leading-tight tracking-tight text-[#580444] md:text-4xl">Seu próximo look<br />está aqui.</h2>
            <p class="text-sm font-bold text-[#7D344B]">Garimpe peças únicas e dê um novo ciclo às suas roupas favoritas.</p>
          </div>
          <div class="mt-4 flex w-full max-w-[220px] items-center justify-center md:mt-0 md:w-2/5 md:max-w-[260px]" aria-hidden="true">
            <svg class="h-32 w-auto max-w-full drop-shadow-sm md:h-40" viewBox="0 0 300 190" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="153" cy="101" r="82" fill="white" fill-opacity=".42"/>
              <circle cx="247" cy="45" r="13" fill="#F50057" fill-opacity=".18"/>
              <path d="m247 19 2.7 7.3L257 29l-7.3 2.7L247 39l-2.7-7.3L237 29l7.3-2.7L247 19Z" fill="#F50057" fill-opacity=".65"/>

              <path d="M73 55c0-7 11-7 11 0L45 77l34 19 34-19-39-22Z" fill="#FFFDF9" stroke="#580444" stroke-width="2.5" stroke-linejoin="round"/>
              <path d="m48 80-15 8 10 15 9-6v43h54v-43l9 6 10-15-15-8-14-6c-4 9-10 13-18 13s-14-4-18-13l-12 6Z" fill="#F8AFC1" stroke="#580444" stroke-width="2.5" stroke-linejoin="round"/>
              <path d="M67 73c3 8 8 12 15 12s12-4 15-12" stroke="#580444" stroke-width="2.5" stroke-linecap="round"/>

              <path d="M151 48c0-7 11-7 11 0l-39 22 34 19 34-19-40-22Z" fill="#FFFDF9" stroke="#580444" stroke-width="2.5" stroke-linejoin="round"/>
              <path d="M145 70h23l6 40c-6 4-28 4-35 0l6-40Z" fill="#FFFDF9" stroke="#580444" stroke-width="2.5" stroke-linejoin="round"/>
              <path d="m139 110 12 3 6 34h-43l25-37Zm35 0-12 3-6 34h43l-25-37Z" fill="#F50057" fill-opacity=".78" stroke="#580444" stroke-width="2.5" stroke-linejoin="round"/>

              <path d="M231 58c0-7 11-7 11 0l-39 22 34 19 34-19-40-22Z" fill="#FFFDF9" stroke="#580444" stroke-width="2.5" stroke-linejoin="round"/>
              <path d="M211 81h52l-4 20-8 46h-20l-2-38-6 38h-20l-4-46-4-20Z" fill="#7D344B" fill-opacity=".88" stroke="#580444" stroke-width="2.5" stroke-linejoin="round"/>
              <path d="M211 93h51M236 109h15" stroke="#FFFDF9" stroke-width="2" stroke-linecap="round" stroke-opacity=".8"/>
            </svg>
          </div>
        </div>

        <!-- GRID DE PRODUTOS -->
        @if (carregando() && produtos().length === 0) {
          <section aria-label="Carregando produtos" aria-busy="true">
            <p role="status" class="mb-4 text-sm font-bold text-[#7D344B]">Garimpando peças para você...</p>
            <div class="grid grid-cols-2 gap-6 md:grid-cols-4">
              @for (cartao of cartoesCarregando; track cartao) {
                <div class="overflow-hidden rounded-2xl border border-[#EAD5DA] bg-white shadow-sm">
                  <div class="h-44 animate-pulse bg-gradient-to-r from-[#FCEEF1] via-[#F8DDE4] to-[#FCEEF1]"></div>
                  <div class="space-y-3 p-4">
                    <div class="h-4 w-3/4 animate-pulse rounded bg-[#F4E3E8]"></div>
                    <div class="h-3 w-full animate-pulse rounded bg-slate-100"></div>
                    <div class="h-3 w-2/3 animate-pulse rounded bg-slate-100"></div>
                    <div class="mt-4 border-t border-slate-100 pt-3">
                      <div class="mb-3 h-5 w-1/3 animate-pulse rounded bg-[#F4E3E8]"></div>
                      <div class="h-8 animate-pulse rounded-xl bg-[#F4E3E8]"></div>
                    </div>
                  </div>
                </div>
              }
            </div>
          </section>
        } @else if (produtos().length > 0) {
          <div class="grid grid-cols-2 gap-6 md:grid-cols-4">
            @for (produto of produtos(); track produto.id) {
              <div class="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl">
                <span class="absolute left-3 top-3 z-10 rounded-md bg-white/90 px-2 py-1 text-xxs font-black uppercase tracking-wider text-[#580444]">{{ produto.estado_conservacao }}</span>
                <div class="flex h-44 items-center justify-center bg-slate-50 text-slate-300">
                  <span class="text-5xl">📦</span>
                </div>
                <div class="flex flex-grow flex-col justify-between bg-white p-4">
                  <div>
                    <h4 class="mb-1 line-clamp-1 text-sm font-bold tracking-tight text-slate-700">{{ produto.nome }}</h4>
                    <p class="line-clamp-2 text-xxs text-slate-400">{{ produto.descricao || 'sem descrição.' }}</p>
                  </div>

                  @if (sacola.contemProduto(produto.id)) {
                    <div class="mt-2 rounded-lg border border-orange-100 bg-orange-50 p-2 text-center text-xxs font-bold text-orange-700">
                      ⏰ Na sua sacola! Expira em: {{ tempoDoProduto(produto.id) }}
                    </div>
                  } @else if (produto.status === 'Reservado') {
                    <div class="mt-2 rounded-lg border border-slate-100 bg-slate-50 p-2 text-center text-xxs font-bold text-slate-500">
                      Peça reservada
                    </div>
                  }

                  <div class="mt-4 flex flex-col gap-2 border-t border-slate-50 pt-3">
                    <span class="text-base font-black text-slate-900">{{ produto.preco | currency:'BRL':'symbol':'1.2-2' }}</span>
                    <button [disabled]="produto.status !== 'Disponivel' || sacola.estaProcessando(produto.id)" [attr.aria-busy]="sacola.estaProcessando(produto.id)" (click)="reservar(produto)" class="flex w-full items-center justify-center gap-2 rounded-xl bg-[#580444] py-2 text-center text-xxs font-black uppercase tracking-wider text-white shadow-xs transition-all hover:bg-[#F50057] disabled:bg-slate-100 disabled:text-slate-300">
                      @if (sacola.estaProcessando(produto.id)) {
                        <span class="h-3 w-3 animate-spin rounded-full border-2 border-[#580444]/30 border-t-[#580444]" aria-hidden="true"></span>
                        reservando...
                      } @else {
                        {{ produto.status === 'Disponivel' ? 'comprar' : (sacola.contemProduto(produto.id) ? 'na sacola' : 'reservada') }}
                      }
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        } @else if (erroCarregamento()) {
          <div role="alert" class="rounded-2xl border border-[#EAD5DA] bg-white p-8 text-center shadow-sm">
            <p class="font-bold text-[#580444]">Não foi possível carregar as peças agora.</p>
            <p class="mt-1 text-sm text-slate-500">Verifique sua conexão e tente novamente.</p>
            <button type="button" (click)="carregarDados()" class="mt-4 rounded-full bg-[#580444] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#F50057]">Tentar novamente</button>
          </div>
        } @else {
          <p class="rounded-2xl border border-[#EAD5DA] bg-white p-8 text-center text-sm text-slate-500">
            Ainda não há peças disponíveis. Volte em breve para garimpar novidades!
          </p>
        }
      </main>

      <!-- FOOTER -->
      <footer class="bg-slate-50 border-t border-slate-200 py-10 px-6 mt-20 text-xs text-slate-400">
        <div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <span class="font-serif text-lg font-bold text-[#580444]">elas no closet</span>
          <span class="text-emerald-600">🔒 ambiente seguro</span>
        </div>
      </footer>
    </div>
  `
})
export class VitrineComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);
  sacola = inject(SacolaService);
  
  produtos = signal<any[]>([]);
  carregando = signal<boolean>(true);
  erroCarregamento = signal<boolean>(false);
  cartoesCarregando = [0, 1, 2, 3, 4, 5, 6, 7];

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando.set(true);
    this.erroCarregamento.set(false);
    this.apiService.listarProdutos().subscribe({
      next: (dados: any[]) => {
        this.produtos.set(dados);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.erroCarregamento.set(true);
      }
    });
  }

  recarregarVitrine(): void {
    this.carregarDados();
  }

  reservar(produto: any): void {
    this.sacola.adicionar(produto.id, () => this.carregarDados());
  }

  tempoDoProduto(produtoId: number): string {
    const item = this.sacola.itens().find(i => i.produto_id === produtoId);
    return item ? this.sacola.formatarTempo(this.sacola.segundosRestantes(item)) : '00:00';
  }

  irParaSacola(): void {
    this.router.navigate(['/sacola']);
  }

  exibirAjuda(): void {
    alert("✨ Peças únicas! Clicou em comprar, o item fica reservado por 15 minutos na sua sacola.");
  }

  irParaAdmin(): void {
    window.location.href = '/admin';
  }
}
