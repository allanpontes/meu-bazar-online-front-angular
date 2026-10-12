import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';

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
          <div class="flex items-center gap-2.5 cursor-pointer" (click)="recarregarVitrine()">
            <div class="bg-[#F50057] text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-xl shadow-md">b</div>
            <span class="text-xl font-black tracking-tight text-[#580444]">meu bazar.</span>
          </div>

          <div class="w-full md:max-w-md relative flex items-center">
            <input type="text" placeholder="busque desapegos por nome..." class="w-full bg-slate-50 border border-slate-200 rounded-full py-2.5 pl-5 pr-10 text-sm focus:outline-none focus:border-[#580444]" />
            <span class="absolute right-4 text-slate-400">🔍</span>
          </div>

          <div class="flex items-center gap-4 font-bold text-sm text-slate-600">
            <span (click)="exibirAjuda()" class="hover:text-[#F50057] cursor-pointer">como funciona?</span>
            <span (click)="irParaAdmin()" class="hover:text-[#F50057] cursor-pointer text-amber-600">⚙️ painel gerente</span>
            
            <button class="bg-[#580444] text-white px-5 py-2.5 rounded-full shadow-md flex items-center gap-2">
              <span>🛒</span>
              <span class="text-xs uppercase tracking-wider font-extrabold">sacola</span>
              <span class="bg-white text-[#580444] text-xs font-black px-2 py-0.5 rounded-full">{{ totalSacola() }}</span>
            </button>
          </div>
        </div>
      </nav>

      <!-- ⚡ MAIN -->
      <main class="flex-grow max-w-6xl w-full mx-auto px-6 py-8">
        <div class="bg-gradient-to-r from-[#FBC5D2] to-[#FFE3E8] rounded-3xl p-8 mb-12 flex flex-col md:flex-row items-center justify-between border border-[#F5B1C1] shadow-sm relative">
          <div class="space-y-3 z-10 text-center md:text-left">
            <div class="bg-[#580444] text-white text-xs font-black px-3 py-1 rounded-md inline-block uppercase tracking-widest shadow-sm">Sua última chance</div>
            <h2 class="text-3xl md:text-4xl font-black text-[#580444] tracking-tight leading-none">10.10 DEIXOU <br/> CUPONS!</h2>
            <p class="text-xs font-bold text-[#7D344B]">não vá sair daqui de mãos abanando, pois corre!</p>
          </div>
          <div class="mt-6 md:mt-0 text-7xl select-none filter drop-shadow-md animate-bounce">🐮</div>
        </div>

        <!-- GRID DE PRODUTOS -->
        <div *ngIf="produtos().length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div *ngFor="let produto of produtos()" class="group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative">
            <span class="absolute top-3 left-3 z-10 bg-white/90 text-[#580444] text-xxs font-black uppercase tracking-wider px-2 py-1 rounded-md">{{ produto.estado_conservacao }}</span>
            <div class="bg-slate-50 h-44 flex items-center justify-center text-slate-300">
              <span class="text-5xl">📦</span>
            </div>
            <div class="p-4 flex-grow flex flex-col justify-between bg-white">
              <div>
                <h4 class="text-sm font-bold text-slate-700 tracking-tight line-clamp-1 mb-1">{{ produto.nome }}</h4>
                <p class="text-xxs text-slate-400 line-clamp-2">{{ produto.descricao || 'sem descrição.' }}</p>
              </div>

              <!-- 🔥 DIRETIVA MODERNA @if FORÇANDO O SIGNAL A SE MOVER AO VIVO -->
              @if (produto.status === 'Reservado') {
                <div class="mt-2 bg-orange-50 border border-orange-100 text-orange-700 text-xxs rounded-lg p-2 font-bold text-center animate-pulse">
                  ⏰ Reservado! Expira em: {{ tempoRestante() }}
                </div>
              }

              <div class="mt-4 pt-3 border-t border-slate-50 flex flex-col gap-2">
                <span class="text-base font-black text-slate-900">{{ produto.preco | currency:'BRL':'symbol':'1.2-2' }}</span>
                <button [disabled]="produto.status !== 'Disponivel'" (click)="reservarComTimerVivo(produto)" class="w-full bg-[#580444] hover:bg-[#F50057] disabled:bg-slate-100 disabled:text-slate-300 text-white font-black text-xxs tracking-wider uppercase py-2 rounded-xl transition-all shadow-xs text-center">
                  {{ produto.status === 'Disponivel' ? 'comprar' : 'reservado' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- FOOTER -->
      <footer class="bg-slate-50 border-t border-slate-200 py-10 px-6 mt-20 text-xs text-slate-400">
        <div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <span class="font-black text-[#580444] text-sm">meu bazar.</span>
          <span class="text-emerald-600">🔒 ambiente seguro</span>
        </div>
      </footer>
    </div>
  `
})
export class VitrineComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  
  produtos = signal<any[]>([]);
  carregando = signal<boolean>(true);
  
  tempoRestante = signal<string>('15:00');
  private timerId: any = null;
  totalSacola = signal<number>(0);

  ngOnInit(): void {
    this.carregarDados();
  }

  ngOnDestroy(): void {
    if (this.timerId) clearInterval(this.timerId);
  }

  carregarDados(): void {
    this.carregando.set(true);
    this.apiService.listarProdutos().subscribe({
      next: (dados: any[]) => {
        this.produtos.set(dados);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false)
    });
  }

  recarregarVitrine(): void {
    this.carregarDados();
  }

  reservarComTimerVivo(produto: any): void {
    this.totalSacola.set(this.totalSacola() + 1);
    produto.status = 'Reservado';
    this.iniciarContagemRegressiva();
    
    this.apiService.adicionarAoCarrinho(1, produto.id).subscribe({
      error: () => console.log("Log: Evento de clique processado.")
    });
  }

  iniciarContagemRegressiva(): void {
    if (this.timerId) clearInterval(this.timerId);
    let totalSegundos = 15 * 60;

    this.timerId = setInterval(() => {
      totalSegundos--;
      
      if (totalSegundos <= 0) {
        clearInterval(this.timerId);
        this.tempoRestante.set('00:00');
        this.carregarDados();
        return;
      }

      const minutos = Math.floor(totalSegundos / 60);
      const segundos = totalSegundos % 60;
      
      // Altera o valor do Signal. O bloco @if vai forçar a tela a piscar os segundos!
      this.tempoRestante.set(
        `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`
      );
    }, 1000);
  }

  exibirAjuda(): void {
    alert("✨ Peças únicas! Clicou em comprar, o item fica reservado por 15 minutos na sua sacola.");
  }

  irParaAdmin(): void {
    window.location.href = '/admin';
  }
}
