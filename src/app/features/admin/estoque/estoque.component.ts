import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-estoque',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <main class="mx-auto w-full max-w-6xl px-6 py-8">
      <div class="mb-6">
        <p class="mb-2 text-xs font-black uppercase tracking-[0.2em] text-[#F50057]">Catálogo da loja</p>
        <h1 class="text-2xl font-black tracking-tight text-[#580444] md:text-3xl">Estoque</h1>
        <p class="mt-2 text-sm text-slate-500">Cadastre, atualize e acompanhe os produtos disponíveis no bazar.</p>
      </div>

      <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <section class="rounded-3xl border border-[#EAD5DA] bg-white p-5 shadow-sm md:p-7">
          <h2 class="mb-1 text-lg font-black text-[#580444]">{{ editandoId() ? 'Editar produto #' + editandoId() : 'Cadastrar produto' }}</h2>
          <p class="mb-6 text-sm text-slate-500">Os campos com * são obrigatórios.</p>

          <form [formGroup]="form" (ngSubmit)="salvar()" class="space-y-4">
            <div>
              <label class="mb-1 block text-xs font-bold text-slate-600" for="nome">Nome *</label>
              <input id="nome" formControlName="nome" class="w-full rounded-xl border border-slate-200 bg-[#FFFDF9] px-3 py-2.5 text-sm outline-none transition focus:border-[#580444] focus:ring-2 focus:ring-[#580444]/10" />
            </div>

            <div>
              <label class="mb-1 block text-xs font-bold text-slate-600" for="descricao">Descrição</label>
              <textarea id="descricao" formControlName="descricao" rows="3" class="w-full rounded-xl border border-slate-200 bg-[#FFFDF9] px-3 py-2.5 text-sm outline-none transition focus:border-[#580444] focus:ring-2 focus:ring-[#580444]/10"></textarea>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-xs font-bold text-slate-600" for="preco">Preço (R$) *</label>
                <input id="preco" type="number" step="0.01" formControlName="preco" (wheel)="$any($event.target).blur()" class="w-full rounded-xl border border-slate-200 bg-[#FFFDF9] px-3 py-2.5 text-sm outline-none transition focus:border-[#580444] focus:ring-2 focus:ring-[#580444]/10" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold text-slate-600" for="estoque">Quantidade em estoque</label>
                <input id="estoque" type="number" formControlName="estoque" (wheel)="$any($event.target).blur()" class="w-full rounded-xl border border-slate-200 bg-[#FFFDF9] px-3 py-2.5 text-sm outline-none transition focus:border-[#580444] focus:ring-2 focus:ring-[#580444]/10" />
              </div>
            </div>

            <div>
              <label class="mb-1 block text-xs font-bold text-slate-600" for="estado">Estado de conservação *</label>
              <select id="estado" formControlName="estado_conservacao" class="w-full rounded-xl border border-slate-200 bg-[#FFFDF9] px-3 py-2.5 text-sm outline-none transition focus:border-[#580444] focus:ring-2 focus:ring-[#580444]/10">
                <option value="Novo">Novo</option>
                <option value="Semi-novo">Semi-novo</option>
                <option value="Bom">Bom</option>
                <option value="Usado">Usado</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="mb-1 block text-xs font-bold text-slate-600" for="categoria">Categoria</label>
                <select id="categoria" formControlName="categoria" class="w-full rounded-xl border border-slate-200 bg-[#FFFDF9] px-3 py-2.5 text-sm outline-none transition focus:border-[#580444] focus:ring-2 focus:ring-[#580444]/10">
                  <option value="">Sem categoria</option>
                  <option value="Roupa">Roupa</option>
                  <option value="Calçado">Calçado</option>
                  <option value="Bolsa">Bolsa</option>
                  <option value="Acessório">Acessório</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold text-slate-600" for="tamanho">Tamanho</label>
                <input id="tamanho" formControlName="tamanho" maxlength="20" placeholder="PP, M, 38, Único" class="w-full rounded-xl border border-slate-200 bg-[#FFFDF9] px-3 py-2.5 text-sm outline-none transition focus:border-[#580444] focus:ring-2 focus:ring-[#580444]/10" />
              </div>
            </div>

            <div>
              <label class="mb-1 block text-xs font-bold text-slate-600" for="imagem">URL da imagem</label>
              <input id="imagem" formControlName="imagem_url" class="w-full rounded-xl border border-slate-200 bg-[#FFFDF9] px-3 py-2.5 text-sm outline-none transition focus:border-[#580444] focus:ring-2 focus:ring-[#580444]/10" />
            </div>

            @if (mensagem()) {
              <p class="text-sm font-medium" [class.text-emerald-700]="!erro()" [class.text-red-600]="erro()">{{ mensagem() }}</p>
            }

            <button type="submit" [disabled]="form.invalid || enviando()" class="w-full rounded-xl bg-[#580444] py-3 text-sm font-black uppercase tracking-wide text-white shadow-sm transition hover:bg-[#F50057] disabled:cursor-not-allowed disabled:opacity-40">
              {{ enviando() ? 'Salvando...' : (editandoId() ? 'Salvar alterações' : 'Cadastrar produto') }}
            </button>
            @if (editandoId()) {
              <button type="button" (click)="cancelarEdicao()" class="w-full rounded-xl border border-[#EAD5DA] bg-white py-3 text-sm font-bold text-[#580444] transition hover:bg-[#FFF8FA]">
                Cancelar edição
              </button>
            }
          </form>
        </section>

        <section class="rounded-3xl border border-[#EAD5DA] bg-white p-5 shadow-sm md:p-7">
          <div class="mb-5">
            <h2 class="text-lg font-black text-[#580444]">Produtos cadastrados</h2>
            <p class="mt-1 text-sm text-slate-500">Gerencie os produtos que aparecem na vitrine.</p>
          </div>

          @if (carregando()) {
            <p class="rounded-xl bg-[#FFF8FA] p-4 text-sm text-slate-500">Carregando produtos...</p>
          } @else if (produtos().length === 0) {
            <p class="rounded-xl bg-[#FFF8FA] p-4 text-sm text-slate-500">Nenhum produto cadastrado.</p>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full min-w-[520px] text-left text-sm">
                <thead class="border-b border-[#EAD5DA] text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th class="py-3 pr-3">Nome</th>
                    <th class="py-3 pr-3">Preço</th>
                    <th class="py-3 pr-3">Estoque</th>
                    <th class="py-3 pr-3">Status</th>
                    <th class="py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  @for (p of produtos(); track p.id) {
                    <tr class="border-b border-slate-100 last:border-0">
                      <td class="py-3 pr-3 font-bold text-slate-700">{{ p.nome }}</td>
                      <td class="whitespace-nowrap py-3 pr-3">R$ {{ p.preco.toFixed(2) }}</td>
                      <td class="py-3 pr-3">{{ p.estoque }}</td>
                      <td class="py-3 pr-3">{{ p.status }}</td>
                      <td class="whitespace-nowrap py-3 text-right">
                        <button type="button" (click)="editar(p)" class="mr-3 text-xs font-bold text-[#580444] hover:text-[#F50057] hover:underline">Editar</button>
                        <button type="button" (click)="excluir(p)" class="text-xs font-bold text-red-600 hover:underline">Excluir</button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </section>
      </div>
    </main>
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
    categoria: [''],
    tamanho: ['', Validators.maxLength(20)],
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
    const { descricao, imagem_url, categoria, tamanho, ...resto } = this.form.getRawValue();
    const payload = {
      ...resto,
      descricao: descricao || null,
      imagem_url: imagem_url || null,
      categoria: categoria || null,
      tamanho: tamanho.trim() || null
    };
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
      error: (err) => {
        this.enviando.set(false);
        const imagemInvalida = err?.status === 422 && JSON.stringify(err.error?.detail ?? '').includes('imagem_url');
        this.mostrar(
          imagemInvalida
            ? 'O endereço da imagem precisa começar com https:// (ou deixe o campo vazio).'
            : 'Não foi possível salvar. Verifique os dados e se o back-end está no ar.',
          true
        );
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
      categoria: produto.categoria ?? '',
      tamanho: produto.tamanho ?? '',
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
