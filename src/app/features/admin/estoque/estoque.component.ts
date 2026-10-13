import { Component, inject, signal } from '@angular/core';
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
        <h2 class="text-2xl font-black mb-6">Cadastrar produto</h2>

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
              <input id="preco" type="number" step="0.01" formControlName="preco" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-400 mb-1" for="estoque">Estoque</label>
              <input id="estoque" type="number" formControlName="estoque" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2" />
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
            {{ enviando() ? 'Salvando...' : 'Cadastrar produto' }}
          </button>
        </form>
      </main>
    </div>
  `
})
export class EstoqueComponent {
  private apiService = inject(ApiService);
  private fb = inject(FormBuilder);

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

  salvar() {
    if (this.form.invalid) return;
    const { descricao, imagem_url, ...resto } = this.form.getRawValue();
    const payload = { ...resto, descricao: descricao || null, imagem_url: imagem_url || null };

    this.enviando.set(true);
    this.mensagem.set('');
    this.apiService.criarProduto(payload).subscribe({
      next: (produto) => {
        this.enviando.set(false);
        this.erro.set(false);
        this.mensagem.set(`Produto "${produto.nome}" cadastrado (id ${produto.id}).`);
        this.form.reset({ estoque: 1, estado_conservacao: 'Bom' });
      },
      error: () => {
        this.enviando.set(false);
        this.erro.set(true);
        this.mensagem.set('Não foi possível cadastrar. Verifique os dados e se o back-end está no ar.');
      }
    });
  }
}
