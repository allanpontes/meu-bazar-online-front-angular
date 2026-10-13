import { Injectable, OnDestroy, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService, ItemSacolaResposta, SacolaResposta } from './api.service';

export interface ItemSacola extends ItemSacolaResposta {
  expiraEmMs: number;
}

@Injectable({ providedIn: 'root' })
export class SacolaService implements OnDestroy {
  private api = inject(ApiService);

  private agora = signal(Date.now());
  private itensBrutos = signal<ItemSacola[]>([]);
  private timerId: ReturnType<typeof setInterval> | null = null;

  private processando = signal<ReadonlySet<number>>(new Set());

  readonly subtotal = signal(0);
  readonly erro = signal<string | null>(null);
  readonly carregando = signal(false);

  readonly itens = this.itensBrutos.asReadonly();
  readonly totalItens = computed(() => this.itensBrutos().length);

  readonly aviso = signal<{ tipo: 'adicionada' | 'removida'; nome: string } | null>(null);
  readonly contadorAdicoes = signal(0);
  private avisoTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.carregar();
  }

  ngOnDestroy(): void {
    this.pararRelogio();
    this.fecharAviso();
  }

  carregar(): void {
    this.carregando.set(true);
    this.api.obterSacola().subscribe({
      next: resposta => {
        this.aplicar(resposta);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false)
    });
  }

  estaProcessando(produtoId: number): boolean {
    return this.processando().has(produtoId);
  }

  adicionar(produtoId: number, aoConcluir?: () => void): void {
    if (this.estaProcessando(produtoId)) return;
    this.erro.set(null);
    this.marcarProcessando(produtoId, true);
    this.api.adicionarNaSacola(produtoId).subscribe({
      next: resposta => {
        this.aplicar(resposta);
        const item = resposta.itens.find(i => i.produto_id === produtoId);
        this.anunciarAdicao(item?.nome ?? 'Peça');
        this.finalizar(produtoId, aoConcluir);
      },
      error: (e: HttpErrorResponse) => {
        this.erro.set(e.error?.detail ?? 'Não foi possível reservar esta peça agora.');
        this.finalizar(produtoId, aoConcluir);
      }
    });
  }

  remover(produtoId: number, aoConcluir?: () => void): void {
    if (this.estaProcessando(produtoId)) return;
    this.erro.set(null);
    this.marcarProcessando(produtoId, true);
    const nome = this.itensBrutos().find(i => i.produto_id === produtoId)?.nome ?? 'Peça';
    this.api.removerDaSacola(produtoId).subscribe({
      next: resposta => {
        this.aplicar(resposta);
        this.anunciar('removida', nome);
        this.finalizar(produtoId, aoConcluir);
      },
      error: () => {
        this.erro.set('Não foi possível remover a peça agora.');
        this.finalizar(produtoId, aoConcluir);
      }
    });
  }

  private anunciarAdicao(nome: string): void {
    this.contadorAdicoes.update(n => n + 1);
    this.anunciar('adicionada', nome);
  }

  private anunciar(tipo: 'adicionada' | 'removida', nome: string): void {
    this.aviso.set({ tipo, nome });
    if (this.avisoTimer) clearTimeout(this.avisoTimer);
    this.avisoTimer = setTimeout(() => this.fecharAviso(), 2500);
  }

  fecharAviso(): void {
    if (this.avisoTimer) {
      clearTimeout(this.avisoTimer);
      this.avisoTimer = null;
    }
    this.aviso.set(null);
  }

  private finalizar(produtoId: number, aoConcluir?: () => void): void {
    this.marcarProcessando(produtoId, false);
    aoConcluir?.();
  }

  private marcarProcessando(produtoId: number, ativo: boolean): void {
    this.processando.update(atual => {
      const novo = new Set(atual);
      if (ativo) novo.add(produtoId);
      else novo.delete(produtoId);
      return novo;
    });
  }

  contemProduto(produtoId: number): boolean {
    return this.itensBrutos().some(i => i.produto_id === produtoId);
  }

  segundosRestantes(item: ItemSacola): number {
    return Math.max(0, Math.floor((item.expiraEmMs - this.agora()) / 1000));
  }

  formatarTempo(segundos: number): string {
    const m = Math.floor(segundos / 60).toString().padStart(2, '0');
    const s = (segundos % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  private aplicar(resposta: SacolaResposta): void {
    const base = Date.now();
    this.agora.set(base);
    this.itensBrutos.set(
      resposta.itens.map(i => ({ ...i, expiraEmMs: base + i.segundos_restantes * 1000 }))
    );
    this.subtotal.set(resposta.subtotal);
    if (resposta.itens.length > 0) this.iniciarRelogio();
    else this.pararRelogio();
  }

  private iniciarRelogio(): void {
    if (this.timerId) return;
    this.timerId = setInterval(() => {
      this.agora.set(Date.now());
      if (this.itensBrutos().some(i => this.segundosRestantes(i) === 0)) {
        this.carregar();
      }
    }, 1000);
  }

  private pararRelogio(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}
