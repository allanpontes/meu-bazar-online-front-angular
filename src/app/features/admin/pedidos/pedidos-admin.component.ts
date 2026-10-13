import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ApiService, Pedido, StatusPedido } from '../../../core/services/api.service';

const CHAVE_SESSAO = 'admin_key';

@Component({
  selector: 'app-pedidos-admin',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule],
  template: `
    <main class="mx-auto w-full max-w-6xl space-y-6 px-6 py-8">
      <div>
        <p class="mb-2 text-xs font-black uppercase tracking-[0.2em] text-[#F50057]">Vendas</p>
        <h1 class="text-2xl font-black tracking-tight text-[#580444] md:text-3xl">Pedidos</h1>
        <p class="mt-2 text-sm text-slate-500">Confirme pagamentos e acompanhe os pedidos recebidos.</p>
      </div>

      @if (!chave()) {
        <form (ngSubmit)="entrar()" class="max-w-md space-y-3 rounded-2xl border border-[#EAD5DA] bg-white p-5 shadow-sm">
          <label for="chave" class="block text-xs font-bold uppercase tracking-wider text-[#7D344B]">Chave de acesso</label>
          <input id="chave" type="password" name="chave" autocomplete="off" [(ngModel)]="chaveDigitada" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#580444] focus:outline-none" />
          @if (erro(); as msg) { <p role="alert" class="text-sm font-bold text-[#F50057]">{{ msg }}</p> }
          <button type="submit" [disabled]="!chaveDigitada.trim()" class="rounded-full bg-[#580444] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#F50057] disabled:bg-slate-200 disabled:text-slate-400">entrar</button>
        </form>
      } @else {
        <div class="flex flex-wrap items-center gap-2">
          @for (opcao of filtros; track opcao.valor) {
            <button type="button" (click)="filtrar(opcao.valor)" [attr.aria-pressed]="filtro() === opcao.valor"
              class="rounded-full px-4 py-2 text-sm font-bold transition-colors"
              [class]="filtro() === opcao.valor ? 'bg-[#580444] text-white' : 'border border-[#EAD5DA] text-[#580444] hover:bg-[#F4E3E8]'">
              {{ opcao.rotulo }}
            </button>
          }
          <button type="button" (click)="sair()" class="ml-auto text-xs font-bold text-slate-500 hover:text-[#F50057]">sair</button>
        </div>

        @if (erro(); as msg) {
          <p role="alert" class="rounded-xl border border-[#F5B1C1] bg-[#FFE3E8] p-3 text-sm font-bold text-[#7D344B]">{{ msg }}</p>
        }

        @if (carregando()) {
          <p role="status" class="text-sm font-bold text-[#7D344B]">Carregando pedidos...</p>
        } @else if (pedidos().length === 0) {
          <p class="rounded-2xl border border-[#EAD5DA] bg-white p-8 text-center text-sm text-slate-500">Nenhum pedido encontrado.</p>
        } @else {
          <ul class="space-y-4">
            @for (p of pedidos(); track p.id) {
              <li class="rounded-2xl border border-[#EAD5DA] bg-white p-5 shadow-sm">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p class="font-black text-[#580444]">Pedido #{{ p.id }} · {{ p.nome_cliente }}</p>
                    <p class="text-xs text-slate-500">{{ p.criado_em | date:'dd/MM/yyyy HH:mm' }}</p>
                  </div>
                  <span class="rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider" [class]="classeStatus(p.status)">{{ rotuloStatus(p.status) }}</span>
                </div>

                <dl class="mt-3 grid gap-1 text-sm text-slate-700 md:grid-cols-2">
                  <div><dt class="inline font-bold text-[#7D344B]">WhatsApp: </dt><dd class="inline">{{ p.whatsapp }}</dd></div>
                  <div><dt class="inline font-bold text-[#7D344B]">Endereço: </dt><dd class="inline">{{ p.endereco }}</dd></div>
                </dl>

                <ul class="mt-3 space-y-1 border-t border-slate-100 pt-3 text-sm">
                  @for (item of p.itens; track $index) {
                    <li class="flex justify-between"><span>{{ item.nome }}</span><span class="font-bold">{{ item.preco | currency:'BRL':'symbol':'1.2-2' }}</span></li>
                  }
                </ul>

                <div class="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                  <span class="text-lg font-black text-[#580444]">{{ p.subtotal | currency:'BRL':'symbol':'1.2-2' }}</span>
                  <div class="flex gap-2">
                    @if (p.status === 'AguardandoPagamento') {
                      <button type="button" [disabled]="atualizando() === p.id" (click)="alterar(p, 'Pago')" class="rounded-full bg-[#580444] px-4 py-2 text-xs font-black uppercase tracking-wider text-white transition hover:bg-[#F50057] disabled:cursor-wait disabled:bg-slate-200 disabled:text-slate-400">
                        {{ atualizando() === p.id ? 'salvando...' : 'confirmar pagamento' }}
                      </button>
                    }
                    @if (p.status !== 'Cancelado') {
                      <button type="button" [disabled]="atualizando() === p.id" (click)="alterar(p, 'Cancelado')" class="rounded-full border border-[#EAD5DA] px-4 py-2 text-xs font-black uppercase tracking-wider text-[#7D344B] transition hover:border-[#F50057] hover:text-[#F50057] disabled:cursor-wait disabled:text-slate-400">
                        cancelar
                      </button>
                    }
                  </div>
                </div>
              </li>
            }
          </ul>
        }
      }
    </main>
  `
})
export class PedidosAdminComponent implements OnInit {
  private api = inject(ApiService);

  filtros: { valor: StatusPedido | ''; rotulo: string }[] = [
    { valor: '', rotulo: 'Todos' },
    { valor: 'AguardandoPagamento', rotulo: 'Aguardando pagamento' },
    { valor: 'Pago', rotulo: 'Pagos' },
    { valor: 'Cancelado', rotulo: 'Cancelados' }
  ];

  chave = signal(sessionStorage.getItem(CHAVE_SESSAO) ?? '');
  chaveDigitada = '';
  pedidos = signal<Pedido[]>([]);
  filtro = signal<StatusPedido | ''>('');
  carregando = signal(false);
  atualizando = signal<number | null>(null);
  erro = signal<string | null>(null);

  ngOnInit(): void {
    if (this.chave()) this.carregar();
  }

  entrar(): void {
    this.chave.set(this.chaveDigitada.trim());
    this.chaveDigitada = '';
    this.carregar(true);
  }

  sair(): void {
    sessionStorage.removeItem(CHAVE_SESSAO);
    this.chave.set('');
    this.pedidos.set([]);
    this.erro.set(null);
  }

  filtrar(valor: StatusPedido | ''): void {
    this.filtro.set(valor);
    this.carregar();
  }

  carregar(validandoChave = false): void {
    this.carregando.set(true);
    this.erro.set(null);
    this.api.listarPedidos(this.chave(), this.filtro() || undefined).subscribe({
      next: pedidos => {
        if (validandoChave) sessionStorage.setItem(CHAVE_SESSAO, this.chave());
        this.pedidos.set(pedidos);
        this.carregando.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.carregando.set(false);
        this.tratarErro(e);
      }
    });
  }

  alterar(pedido: Pedido, novo: 'Pago' | 'Cancelado'): void {
    if (novo === 'Cancelado' && !confirm(`Cancelar o pedido #${pedido.id}? As peças voltam para a vitrine.`)) return;
    this.atualizando.set(pedido.id);
    this.erro.set(null);
    this.api.atualizarStatusPedido(pedido.id, novo, this.chave()).subscribe({
      next: () => {
        this.atualizando.set(null);
        this.carregar();
      },
      error: (e: HttpErrorResponse) => {
        this.atualizando.set(null);
        this.tratarErro(e);
      }
    });
  }

  rotuloStatus(status: StatusPedido): string {
    return { AguardandoPagamento: 'Aguardando pagamento', Pago: 'Pago', Cancelado: 'Cancelado' }[status];
  }

  classeStatus(status: StatusPedido): string {
    return {
      AguardandoPagamento: 'bg-amber-50 text-amber-800',
      Pago: 'bg-emerald-50 text-emerald-700',
      Cancelado: 'bg-slate-100 text-slate-500'
    }[status];
  }

  private tratarErro(e: HttpErrorResponse): void {
    if (e.status === 401) {
      this.sair();
      this.erro.set('Chave de acesso inválida.');
    } else if (e.status === 503) {
      this.erro.set('Área administrativa não configurada no servidor.');
    } else {
      this.erro.set(typeof e.error?.detail === 'string' ? e.error.detail : 'Não foi possível concluir a operação.');
    }
  }
}
