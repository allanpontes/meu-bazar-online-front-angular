import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { SacolaService } from '../../../core/services/sacola.service';
import { AvisoSacolaComponent } from '../../../shared/aviso-sacola/aviso-sacola.component';

const PECAS_POR_PAGINA = 12;
const CATEGORIAS = ['Roupa', 'Calçado', 'Bolsa', 'Acessório', 'Outros'];

@Component({
  selector: 'app-vitrine',
  standalone: true,
  imports: [CommonModule, AvisoSacolaComponent],
  template: `
    <div class="min-h-screen bg-[#FFFDF9] flex flex-col font-sans antialiased text-slate-800">
      
      <!-- 🎟️ BARRA DE CUPOM -->
      <div class="bg-[#F4E3E8] text-[#580444] text-center py-2 text-xs font-bold tracking-wide border-b border-[#EAD5DA]">
        ✨ há cupom, há desconto! garimpe as peças únicas deste bazar ✨
      </div>

      <!-- 🌐 NAVBAR ESTILO ENJOEI -->
      <nav class="bg-white border-b border-slate-100 px-4 py-3 md:px-6 md:py-4 sticky top-0 z-40 shadow-sm">
        <div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4">
          <button type="button" class="flex cursor-pointer items-center gap-2.5 text-left" (click)="recarregarVitrine()" aria-label="Elas no Closet, recarregar vitrine">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center" aria-hidden="true">
              <svg class="h-12 w-12 drop-shadow-sm" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 5h4v6l2 2 2-2V5h4l4 9 7 6-5 5-4-3v7l7 13H9l7-13v-7l-4 3-5-5 7-6 4-9Z" fill="#F50057" stroke="#580444" stroke-width="1.6" stroke-linejoin="round"/>
                <path d="M22 5c0 2 1 3 2 3s2-1 2-3M17 29h14M20 34h8" stroke="#FFFDF9" stroke-width="1.7" stroke-linecap="round"/>
                <path d="m40 7 .8 2.2L43 10l-2.2.8L40 13l-.8-2.2L37 10l2.2-.8L40 7Z" fill="#F50057"/>
              </svg>
            </div>
            <div class="leading-none">
              <span class="block text-[9px] font-black uppercase tracking-[0.28em] text-[#F50057]">elas no</span>
              <span class="mt-0.5 block font-serif text-2xl font-bold leading-none tracking-tight text-[#580444]">closet</span>
            </div>
          </button>

          <div class="w-full md:max-w-md relative flex items-center">
            <input type="text" placeholder="busque desapegos por nome..." class="w-full bg-slate-50 border border-slate-200 rounded-full py-2.5 pl-5 pr-10 text-sm focus:outline-none focus:border-[#580444]" />
            <span class="absolute right-4 text-slate-400">🔍</span>
          </div>

          <div class="flex items-center gap-4 font-bold text-sm text-slate-600">
            <button type="button" (click)="exibirAjuda()" class="hover:text-[#F50057] cursor-pointer">como funciona?</button>
            <button type="button" (click)="irParaAdmin()" class="hover:text-[#F50057] cursor-pointer text-amber-600">⚙️ painel gerente</button>
            
            <button type="button" (click)="irParaSacola()" [attr.aria-label]="'Abrir sacola, ' + sacola.totalItens() + ' itens'" class="bg-[#580444] text-white px-5 py-2.5 rounded-full shadow-md flex items-center gap-2 transition hover:bg-[#F50057]">
              <span aria-hidden="true">🛒</span>
              <span class="text-xs uppercase tracking-wider font-extrabold">sacola</span>
              @for (n of [sacola.contadorAdicoes()]; track n) {
                <span class="bg-white text-[#580444] text-xs font-black px-2 py-0.5 rounded-full" [class.animar-contador]="n > 0">{{ sacola.totalItens() }}</span>
              }
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
          <div class="mb-5 flex items-center gap-3">
            <div class="-mx-1 flex min-w-0 flex-1 gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Filtrar por categoria">
              <button type="button" (click)="selecionarCategoria('')" [attr.aria-pressed]="categoriaAtiva() === ''"
                class="shrink-0 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-wider transition"
                [class]="categoriaAtiva() === '' ? 'border-[#580444] bg-[#580444] text-white' : 'border-[#F5B1C1] bg-white text-[#580444] hover:border-[#580444]'">
                Todos ({{ produtos().length }})
              </button>
              @for (cat of categoriasComContagem(); track cat.nome) {
                <button type="button" (click)="selecionarCategoria(cat.nome)" [attr.aria-pressed]="categoriaAtiva() === cat.nome"
                  class="shrink-0 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-wider transition"
                  [class]="categoriaAtiva() === cat.nome ? 'border-[#580444] bg-[#580444] text-white' : 'border-[#F5B1C1] bg-white text-[#580444] hover:border-[#580444]'">
                  {{ cat.nome }} ({{ cat.total }})
                </button>
              }
            </div>
            <select (change)="alterarOrdenacao($any($event.target).value)" aria-label="Ordenar peças"
              class="shrink-0 rounded-full border border-[#F5B1C1] bg-white px-3 py-2 text-xs font-bold text-[#580444] outline-none focus:border-[#580444]">
              <option value="recentes" [selected]="ordenacao() === 'recentes'">Mais recentes</option>
              <option value="menor" [selected]="ordenacao() === 'menor'">Menor preço</option>
              <option value="maior" [selected]="ordenacao() === 'maior'">Maior preço</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            @for (produto of produtosVisiveis(); track produto.id) {
              <article (click)="abrirDetalhe(produto)" class="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                [class.border-[#F50057]]="sacola.contemProduto(produto.id)"
                [class.border-[#EAD5DA]]="!sacola.contemProduto(produto.id)">
                <div class="relative aspect-square overflow-hidden bg-gradient-to-b from-[#FCEEF1] to-[#F8DDE4]">
                  @if (produto.imagem_url && !imagensComErro().has(produto.id)) {
                    <img [src]="produto.imagem_url" [alt]="produto.nome" loading="lazy" (error)="marcarImagemComErro(produto.id)"
                      class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      [class.opacity-60]="produto.status !== 'Disponivel' && !sacola.contemProduto(produto.id)" />
                  } @else {
                    <div class="flex h-full w-full flex-col items-center justify-center gap-1"
                      [class.opacity-60]="produto.status !== 'Disponivel' && !sacola.contemProduto(produto.id)">
                      <svg class="h-24 w-24 drop-shadow-sm sm:h-28 sm:w-28" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                        <circle cx="60" cy="62" r="46" fill="white" fill-opacity=".5"/>
                        <path d="m92 22 1.8 4.9 4.9 1.8-4.9 1.8L92 35.4l-1.8-4.9-4.9-1.8 4.9-1.8L92 22Z" fill="#F50057" fill-opacity=".65"/>
                        <path d="M60 22c0-5 8-5 8 0l-8 5" stroke="#580444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M60 27 28 46c-2 1.3-1 4.4 1.4 4.4h61.2c2.4 0 3.4-3.1 1.4-4.4L60 27Z" fill="#FFFDF9" stroke="#580444" stroke-width="2.5" stroke-linejoin="round"/>
                        @switch (produto.id % 3) {
                          @case (0) {
                            <path d="m36 58-11 6 7 11 7-4v33h42V71l7 4 7-11-11-6-10-4c-3 7-8 10-14 10s-11-3-14-10l-10 4Z" fill="#F8AFC1" stroke="#580444" stroke-width="2.5" stroke-linejoin="round"/>
                          }
                          @case (1) {
                            <path d="M47 56h26l5 20 10 32H32l10-32 5-20Z" fill="#F50057" fill-opacity=".78" stroke="#580444" stroke-width="2.5" stroke-linejoin="round"/>
                            <path d="M47 56c3 6 6 9 13 9s10-3 13-9" stroke="#580444" stroke-width="2.5" stroke-linecap="round"/>
                          }
                          @default {
                            <path d="M40 58h40l-3 16-6 36H62l-2-30-2 30H46l-6-36-3-16Z" fill="#7D344B" fill-opacity=".88" stroke="#580444" stroke-width="2.5" stroke-linejoin="round"/>
                            <path d="M40 66h40" stroke="#FFFDF9" stroke-width="2" stroke-linecap="round" stroke-opacity=".8"/>
                          }
                        }
                      </svg>
                      <span class="font-serif text-xs font-bold text-[#580444]/60">elas no closet</span>
                    </div>
                  }

                  <span class="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-xxs font-black uppercase tracking-wider text-[#580444] shadow-sm">{{ produto.estado_conservacao }}</span>

                  @if (!sacola.contemProduto(produto.id) && produto.status === 'Reservado') {
                    <span class="absolute inset-x-2 bottom-2 rounded-full bg-[#580444]/90 px-3 py-1.5 text-center text-xs font-bold text-white">Peça reservada</span>
                  }
                </div>

                <div class="flex flex-grow flex-col p-3 sm:p-4">
                  <p class="text-lg font-black leading-none text-[#580444]">{{ produto.preco | currency:'BRL':'symbol':'1.2-2' }}</p>
                  <h4 class="mt-2 line-clamp-2 min-h-[2.25rem] text-sm font-semibold leading-snug text-[#3A2030]">{{ produto.nome }}</h4>
                  @if (produto.tamanho) {
                    <p class="mt-1 text-xxs font-bold uppercase tracking-wider text-[#7D344B]/70">Tam. {{ produto.tamanho }}</p>
                  }
                  @if (produto.estoque > 1) {
                    <p class="mt-1 text-xxs font-bold uppercase tracking-wider text-[#7D344B]/70">{{ produto.estoque }} disponíveis</p>
                  }

                  @if (sacola.contemProduto(produto.id)) {
                    <p class="mt-3 rounded-lg bg-[#FFE3E8] px-2 py-1.5 text-center text-xs font-bold text-[#F50057]">
                      Na sua sacola · expira em {{ tempoDoProduto(produto.id) }}
                    </p>
                  }

                  <div class="mt-auto pt-3">
                  <button type="button" (click)="abrirDetalhe(produto); $event.stopPropagation()"
                    class="mb-2 w-full text-center text-xs font-bold text-[#7D344B] underline underline-offset-2">
                    Ver detalhes
                  </button>
                  <button [disabled]="produto.status !== 'Disponivel' || sacola.estaProcessando(produto.id)" [attr.aria-busy]="sacola.estaProcessando(produto.id)" (click)="reservar(produto); $event.stopPropagation()"
                    class="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#580444] px-3 text-center text-xs font-black uppercase tracking-wider text-white transition-all hover:bg-[#F50057] disabled:bg-[#F4E3E8] disabled:text-[#7D344B]/60">
                    @if (sacola.estaProcessando(produto.id)) {
                      <span class="h-3 w-3 animate-spin rounded-full border-2 border-[#580444]/30 border-t-[#580444]" aria-hidden="true"></span>
                      reservando...
                    } @else {
                      {{ produto.status === 'Disponivel' ? 'comprar' : (sacola.contemProduto(produto.id) ? 'na sacola' : 'reservada') }}
                    }
                  </button>
                  </div>
                </div>
              </article>
            }
          </div>

          <div class="mt-8 flex flex-col items-center gap-2">
            <p class="text-xs font-bold text-[#7D344B]">Exibindo {{ produtosVisiveis().length }} de {{ produtosFiltrados().length }} peças</p>
            @if (produtosVisiveis().length < produtosFiltrados().length) {
              <button type="button" (click)="verMais()"
                class="rounded-full border border-[#580444] bg-white px-6 py-3 text-sm font-black text-[#580444] transition hover:bg-[#580444] hover:text-white">
                Ver mais peças
              </button>
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
      <section class="mt-20 border-t border-[#EAD5DA] bg-[#FCEEF1] px-6 py-6" aria-label="Benefícios">
        <ul class="mx-auto grid max-w-6xl gap-4 text-center text-sm font-bold text-[#580444] sm:grid-cols-3">
          <li>✨ Peças únicas e selecionadas</li>
          <li>⏰ Reserva de 15 minutos na sacola</li>
          <li>💬 Atendimento pelo WhatsApp</li>
        </ul>
      </section>
      <footer class="bg-[#580444] px-6 pb-6 pt-10 text-sm text-[#F4E3E8]">
        <div class="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          <div>
            <span class="font-serif text-2xl font-bold text-white">elas no closet</span>
            <p class="mt-3 max-w-xs text-[#F4E3E8]/80">Peças únicas, com história. Dê um novo ciclo ao seu guarda-roupa.</p>
          </div>
          <nav aria-label="Ajuda">
            <h3 class="text-xs font-black uppercase tracking-wider text-[#F5B1C1]">Ajuda</h3>
            <ul class="mt-3 space-y-2">
              <li><button type="button" (click)="exibirAjuda()" class="transition hover:text-[#F50057]">Como funciona</button></li>
              <li><button type="button" (click)="exibirAjuda()" class="transition hover:text-[#F50057]">Frete e entrega</button></li>
              <li><button type="button" (click)="exibirAjuda()" class="transition hover:text-[#F50057]">Trocas e devoluções</button></li>
            </ul>
          </nav>
          <div>
            <h3 class="text-xs font-black uppercase tracking-wider text-[#F5B1C1]">Fale com a gente</h3>
            <ul class="mt-3 space-y-2">
              <!-- Preencher com o WhatsApp, o Instagram e o horário reais do bazar. -->
              <li>💬 WhatsApp: [definir]</li>
              <li>📸 Instagram: [definir]</li>
              <li>🕘 Atendimento: [definir]</li>
            </ul>
          </div>
        </div>
        <div class="mx-auto mt-8 flex max-w-6xl flex-col items-center justify-between gap-2 border-t border-white/15 pt-5 text-xs text-[#F4E3E8]/70 md:flex-row">
          <span>© {{ anoAtual }} Elas no Closet. Todos os direitos reservados.</span>
          <span>🔒 ambiente seguro</span>
        </div>
      </footer>

      <app-aviso-sacola />

      @if (mostrarTopo()) {
        <button type="button" (click)="voltarAoTopo()" aria-label="Voltar ao topo"
          class="fixed bottom-4 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[#F50057] text-xl font-black text-white shadow-lg transition hover:bg-[#580444]">
          <span aria-hidden="true">↑</span>
        </button>
      }

      @if (detalhe(); as p) {
        <div class="fixed inset-0 z-50 flex items-end justify-center bg-[#580444]/40 backdrop-blur-sm sm:items-center sm:p-4" (click)="fecharDetalhe()">
          <section role="dialog" aria-modal="true" [attr.aria-label]="p.nome"
            class="relative flex h-full w-full max-w-lg flex-col overflow-hidden bg-[#FFFDF9] shadow-2xl sm:h-auto sm:max-h-[92vh] sm:rounded-3xl"
            (click)="$event.stopPropagation()">
            <button type="button" (click)="fecharDetalhe()" aria-label="Fechar"
              class="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-2xl leading-none text-[#580444] shadow-md transition hover:bg-[#F4E3E8]">×</button>

            <div class="flex-1 overflow-y-auto">
              <div class="aspect-square w-full bg-gradient-to-b from-[#FCEEF1] to-[#F8DDE4]">
                @if (p.imagem_url && !imagensComErro().has(p.id)) {
                  <img [src]="p.imagem_url" [alt]="p.nome" (error)="marcarImagemComErro(p.id)" class="h-full w-full object-cover" />
                } @else {
                  <div class="flex h-full w-full items-center justify-center font-serif text-sm font-bold text-[#580444]/60">elas no closet</div>
                }
              </div>
              <div class="space-y-3 p-5">
                <h2 class="pr-2 text-xl font-black leading-tight text-[#580444]">{{ p.nome }}</h2>
                <p class="text-2xl font-black text-[#580444]">{{ p.preco | currency:'BRL':'symbol':'1.2-2' }}</p>
                <div class="flex flex-wrap gap-2">
                  @if (p.categoria) {
                    <span class="rounded-full bg-[#F4E3E8] px-3 py-1 text-xs font-black uppercase tracking-wider text-[#580444]">{{ p.categoria }}</span>
                  }
                  @if (p.tamanho) {
                    <span class="rounded-full bg-[#F4E3E8] px-3 py-1 text-xs font-black uppercase tracking-wider text-[#580444]">Tam. {{ p.tamanho }}</span>
                  }
                  <span class="rounded-full bg-[#F4E3E8] px-3 py-1 text-xs font-black uppercase tracking-wider text-[#580444]">{{ p.estado_conservacao }}</span>
                </div>
                @if (p.descricao) {
                  <p class="whitespace-pre-line text-sm leading-relaxed text-slate-600">{{ p.descricao }}</p>
                }
              </div>
            </div>

            <div class="flex gap-3 border-t border-[#EAD5DA] bg-white p-4">
              <button type="button" (click)="fecharDetalhe()"
                class="min-h-11 flex-1 rounded-xl border border-[#580444] px-3 text-xs font-black uppercase tracking-wider text-[#580444] transition hover:bg-[#F4E3E8]">
                continuar comprando
              </button>
              <button type="button" [disabled]="p.status !== 'Disponivel' || sacola.estaProcessando(p.id)" (click)="reservar(p)"
                class="min-h-11 flex-1 rounded-xl bg-[#580444] px-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-[#F50057] disabled:bg-[#F4E3E8] disabled:text-[#7D344B]/60">
                {{ p.status === 'Disponivel' ? 'adicionar à sacola' : (sacola.contemProduto(p.id) ? 'na sacola' : 'reservada') }}
              </button>
            </div>
          </section>
        </div>
      }

      @if (ajudaAberta()) {
        <div class="fixed inset-0 z-50 flex items-end justify-center bg-[#580444]/20 p-0 backdrop-blur-sm sm:items-center sm:p-4" (click)="fecharAjuda()">
          <section role="dialog" aria-modal="true" aria-labelledby="titulo-ajuda"
            class="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-[#FFFDF9] p-6 shadow-2xl sm:rounded-3xl"
            (click)="$event.stopPropagation()">
            <div class="flex items-start justify-between gap-4">
              <h2 id="titulo-ajuda" class="text-2xl font-black text-[#580444]">Como funciona</h2>
              <button type="button" (click)="fecharAjuda()" aria-label="Fechar"
                class="rounded-full px-3 py-1 text-xl leading-none text-[#7D344B] transition hover:bg-[#F4E3E8]">×</button>
            </div>

            <ol class="mt-5 space-y-4">
              @for (passo of passosAjuda; track passo.titulo; let i = $index) {
                <li class="flex gap-3">
                  <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#580444] text-sm font-black text-white">{{ i + 1 }}</span>
                  <div>
                    <p class="font-bold text-[#580444]">{{ passo.titulo }}</p>
                    <p class="text-sm text-slate-600">{{ passo.texto }}</p>
                  </div>
                </li>
              }
            </ol>

            <p class="mt-5 rounded-2xl bg-[#FFE3E8] p-4 text-sm font-bold text-[#580444]">
              ✨ Cada peça é única. Se alguém reservar antes de você, ela some da vitrine!
            </p>

            <h3 class="mt-6 text-sm font-black uppercase tracking-wider text-[#7D344B]">Dúvidas rápidas</h3>
            <div class="mt-2 divide-y divide-[#EAD5DA] rounded-2xl border border-[#EAD5DA] bg-white">
              @for (item of faqAjuda; track item.pergunta) {
                <details class="group p-4">
                  <summary class="cursor-pointer text-sm font-bold text-[#580444]">{{ item.pergunta }}</summary>
                  <p class="mt-2 text-sm text-slate-600">{{ item.resposta }}</p>
                </details>
              }
            </div>

            <button type="button" (click)="fecharAjuda()"
              class="mt-6 w-full rounded-full bg-[#F50057] px-6 py-3 text-sm font-black text-white transition hover:bg-[#580444]">
              ver peças
            </button>
          </section>
        </div>
      }
    </div>
  `
})
export class VitrineComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);
  sacola = inject(SacolaService);
  
  produtos = signal<any[]>([]);
  categoriaAtiva = signal<string>('');
  ordenacao = signal<'recentes' | 'menor' | 'maior'>('recentes');
  limiteExibicao = signal<number>(PECAS_POR_PAGINA);

  categoriasComContagem = computed(() => {
    const contagem = new Map<string, number>();
    for (const p of this.produtos()) {
      if (p.categoria) contagem.set(p.categoria, (contagem.get(p.categoria) ?? 0) + 1);
    }
    return CATEGORIAS.filter(c => contagem.has(c)).map(c => ({ nome: c, total: contagem.get(c)! }));
  });

  produtosFiltrados = computed(() => {
    const categoria = this.categoriaAtiva();
    const lista = categoria ? this.produtos().filter(p => p.categoria === categoria) : [...this.produtos()];
    switch (this.ordenacao()) {
      case 'menor': return lista.sort((a, b) => a.preco - b.preco);
      case 'maior': return lista.sort((a, b) => b.preco - a.preco);
      default: return lista.sort((a, b) => b.id - a.id);
    }
  });

  produtosVisiveis = computed(() => this.produtosFiltrados().slice(0, this.limiteExibicao()));
  detalheId = signal<number | null>(null);
  detalhe = computed(() => this.produtos().find(p => p.id === this.detalheId()) ?? null);
  carregando = signal<boolean>(true);
  erroCarregamento = signal<boolean>(false);
  cartoesCarregando = [0, 1, 2, 3, 4, 5, 6, 7];
  ajudaAberta = signal<boolean>(false);
  mostrarTopo = signal<boolean>(false);
  anoAtual = new Date().getFullYear();
  imagensComErro = signal<Set<number>>(new Set());

  passosAjuda = [
    { titulo: 'Escolha sua peça', texto: 'Cada peça é única, de segunda mão, com fotos e descrição reais.' },
    { titulo: 'Reserve na sacola', texto: 'A peça fica separada para você por 15 minutos.' },
    { titulo: 'Finalize o pedido', texto: 'Informe seu nome, WhatsApp e endereço.' },
    { titulo: 'Combine pelo WhatsApp', texto: 'Confirmamos o pagamento e a entrega, e a peça é sua.' }
  ];

  // Respostas provisórias: ajustar com as regras reais do bazar.
  faqAjuda = [
    { pergunta: 'O que acontece se eu não finalizar em 15 minutos?', resposta: 'A reserva expira e a peça volta para a vitrine para outras clientes.' },
    { pergunta: 'Como é o pagamento?', resposta: 'Combinamos o pagamento pelo WhatsApp depois que você faz o pedido. A peça fica reservada até a confirmação.' },
    { pergunta: 'Como é o frete?', resposta: '[definir] O valor e o prazo são combinados pelo WhatsApp.' },
    { pergunta: 'Posso trocar ou devolver?', resposta: '[definir] Política de troca e devolução do bazar.' }
  ];

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
    this.categoriaAtiva.set('');
    this.limiteExibicao.set(PECAS_POR_PAGINA);
    this.carregarDados();
  }

  selecionarCategoria(categoria: string): void {
    this.categoriaAtiva.set(categoria);
    this.limiteExibicao.set(PECAS_POR_PAGINA);
  }

  alterarOrdenacao(valor: string): void {
    this.ordenacao.set(valor === 'menor' || valor === 'maior' ? valor : 'recentes');
    this.limiteExibicao.set(PECAS_POR_PAGINA);
  }

  verMais(): void {
    this.limiteExibicao.update(limite => limite + PECAS_POR_PAGINA);
  }

  reservar(produto: any): void {
    this.sacola.adicionar(produto.id, () => this.carregarDados());
  }

  tempoDoProduto(produtoId: number): string {
    const item = this.sacola.itens().find(i => i.produto_id === produtoId);
    return item ? this.sacola.formatarTempo(this.sacola.segundosRestantes(item)) : '00:00';
  }

  marcarImagemComErro(produtoId: number): void {
    this.imagensComErro.update(ids => new Set(ids).add(produtoId));
  }

  irParaSacola(): void {
    this.router.navigate(['/sacola']);
  }

  @HostListener('window:scroll')
  atualizarBotaoTopo(): void {
    this.mostrarTopo.set(window.scrollY > 600);
  }

  voltarAoTopo(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  exibirAjuda(): void {
    this.ajudaAberta.set(true);
  }

  @HostListener('document:keydown.escape')
  fecharAjuda(): void {
    if (this.ajudaAberta()) {
      this.ajudaAberta.set(false);
    } else {
      this.fecharDetalhe();
    }
  }

  abrirDetalhe(produto: any): void {
    if (this.detalheId() === null) {
      history.pushState({ ...history.state, modalDetalhe: true }, '');
    }
    this.detalheId.set(produto.id);
    document.body.style.overflow = 'hidden';
  }

  fecharDetalhe(): void {
    if (this.detalheId() === null) return;
    if (history.state?.modalDetalhe) {
      history.back();
    } else {
      this.encerrarDetalhe();
    }
  }

  @HostListener('window:popstate')
  aoVoltarNavegador(): void {
    this.encerrarDetalhe();
  }

  private encerrarDetalhe(): void {
    this.detalheId.set(null);
    document.body.style.overflow = '';
  }

  irParaAdmin(): void {
    window.location.href = '/admin';
  }
}
