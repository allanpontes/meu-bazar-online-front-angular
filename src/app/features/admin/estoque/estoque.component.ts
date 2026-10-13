import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-estoque',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <header class="bg-slate-950 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <h1 class="text-lg font-black tracking-tight uppercase text-amber-400">Estoque</h1>
        <a routerLink="/admin" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl">⬅️ Dashboard</a>
      </header>

      <main class="max-w-xl mx-auto px-6 py-8">
        <h2 class="text-2xl font-black mb-6">{{ editandoId() ? 'Editar produto #' + editandoId() : 'Cadastrar produto' }}</h2>

        <form [formGroup]="form" (ngSubmit)="salvar()" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-400 mb-1" for="nome">Nome *</label>
            <input id="nome" formControlName="nome" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-400 mb-1" for="descricao">Descrição</label>
            <textarea id="descricao" formControlName="descricao" rows="3" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-400 mb-1" for="preco">Preço (R$) *</label>
              <input id="preco" type="number" step="0.01" formControlName="preco" (wheel)="$any($event.target).blur()" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-400 mb-1" for="estoque">Estoque</label>
              <input id="estoque" type="number" formControlName="estoque" (wheel)="$any($event.target).blur()" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-400 mb-1" for="estado">Estado de conservação *</label>
            <select id="estado" formControlName="estado_conservacao" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
              <option value="Novo">Novo</option>
              <option value="Semi-novo">Semi-novo</option>
              <option value="Bom">Bom</option>
              <option value="Usado">Usado</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-400 mb-1" for="imagem">URL da imagem</label>
            <input id="imagem" formControlName="imagem_url" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2" />
          </div>

          @if (mensagem()) {
            <p class="text-sm" [class.text-emerald-400]="!erro()" [class.text-red-400]="erro()">{{ mensagem() }}</p>
          }

          <button type="submit" [disabled]="form.invalid || enviando()" class="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-900 font-black uppercase text-sm py-3 rounded-xl">
            {{ enviando() ? 'Salvando...' : (editandoId() ? 'Salvar alterações' : 'Cadastrar produto') }}
          </button>
          @if (editandoId()) {
            <button type="button" (click)="cancelarEdicao()" class="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm py-3 rounded-xl">
              Cancelar edição
            </button>
          }
        </form>

        <h2 class="text-2xl font-black mt-12 mb-4">Produtos cadastrados</h2>

        @if (carregando()) {
          <p class="text-sm text-slate-400">Carregando produtos...</p>
        } @else if (produtos().length === 0) {
          <p class="text-sm text-slate-400">Nenhum produto cadastrado.</p>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
              <thead class="text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th class="py-2 pr-3">Nome</th>
                  <th class="py-2 pr-3">Preço</th>
                  <th class="py-2 pr-3">Estoque</th>
                  <th class="py-2 pr-3">Status</th>
                  <th class="py-2"></th>
                </tr>
              </thead>
              <tbody>
                @for (p of produtos(); track p.id) {
                  <tr class="border-b border-slate-800/60">
                    <td class="py-2 pr-3">{{ p.nome }}</td>
                    <td class="py-2 pr-3">R$ {{ p.preco.toFixed(2) }}</td>
                    <td class="py-2 pr-3">{{ p.estoque }}</td>
                    <td class="py-2 pr-3">{{ p.status }}</td>
                    <td class="py-2 text-right whitespace-nowrap">
                      <button type="button" (click)="editar(p)" class="text-xs text-amber-400 hover:underline mr-3">Editar</button>
                      <button type="button" (click)="excluir(p)" class="text-xs text-red-400 hover:underline">Excluir</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </main>
    </div>
  `
})
export class EstoqueComponent implements OnInit {
  private apiService = inject(ApiService);
  private fb = inject(FormBuilder);

  produtos = signal<any[]>([]);
  carregando = signal(true);
  editandoId = signal<number | null>(null);
  enviando = signal(false);
  mensagem = signal('');
  erro = signal(false);

  form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(150)]],
    descricao: [''],
    preco: [null as number | null, [Validators.required, Validators.min(0.01)]],
    estoque: [1, [Validators.required, Validators.min(0)]],
    estado_conservacao: ['Bom', Validators.required],
    imagem_url: ['']
  });

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.carregando.set(true);
    this.apiService.listarProdutos().subscribe({
      next: (lista) => {
        this.produtos.set(lista);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.mostrar('Não foi possível carregar os produtos.', true);
      }
    });
  }

  salvar() {
    if (this.form.invalid) return;
    const { descricao, imagem_url, ...resto } = this.form.getRawValue();
    const payload = { ...resto, descricao: descricao || null, imagem_url: imagem_url || null };
    const id = this.editandoId();

    this.enviando.set(true);
    this.mensagem.set('');
    const requisicao = id ? this.apiService.editarProduto(id, payload) : this.apiService.criarProduto(payload);
    requisicao.subscribe({
      next: (produto) => {
        this.enviando.set(false);
        this.produtos.update((lista) =>
          id ? lista.map((p) => (p.id === produto.id ? produto : p)) : [...lista, produto]
        );
        this.mostrar(id ? `Produto "${produto.nome}" atualizado.` : `Produto "${produto.nome}" cadastrado (id ${produto.id}).`, false);
        this.limparFormulario();
      },
      error: () => {
        this.enviando.set(false);
        this.mostrar('Não foi possível salvar. Verifique os dados e se o back-end está no ar.', true);
      }
    });
  }

  editar(produto: any) {
    this.editandoId.set(produto.id);
    this.mensagem.set('');
    this.form.reset({
      nome: produto.nome,
      descricao: produto.descricao ?? '',
      preco: produto.preco,
      estoque: produto.estoque,
      estado_conservacao: produto.estado_conservacao,
      imagem_url: produto.imagem_url ?? ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicao() {
    this.limparFormulario();
    this.mensagem.set('');
  }

  excluir(produto: any) {
    if (!confirm(`Excluir "${produto.nome}"? Essa ação não pode ser desfeita.`)) return;
    this.apiService.deletarProduto(produto.id).subscribe({
      next: () => {
        this.produtos.update((lista) => lista.filter((p) => p.id !== produto.id));
        if (this.editandoId() === produto.id) this.limparFormulario();
        this.mostrar(`Produto "${produto.nome}" excluído.`, false);
      },
      error: () => this.mostrar('Não foi possível excluir o produto.', true)
    });
  }

  private limparFormulario() {
    this.editandoId.set(null);
    this.form.reset({ estoque: 1, estado_conservacao: 'Bom' });
  }

  private mostrar(texto: string, ehErro: boolean) {
    this.erro.set(ehErro);
    this.mensagem.set(texto);
  }
}
