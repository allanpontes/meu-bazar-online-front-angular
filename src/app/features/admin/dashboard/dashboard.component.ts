import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      
      <!-- HEADER DO MANAGER -->
      <header class="bg-slate-950 border-b border-slate-800 px-6 py-4 flex justify-between items-center shadow-lg">
        <div class="flex items-center gap-2">
          <span class="text-2xl">⚙️</span>
          <h1 class="text-lg font-black tracking-tight uppercase text-amber-400">Bazar Control Center</h1>
        </div>
        <button (click)="voltarParaVitrine()" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl transition-all">
          ⬅️ Sair do Painel
        </button>
      </header>

      <!-- CONTEÚDO PRINCIPAL -->
      <main class="flex-grow max-w-6xl w-full mx-auto px-6 py-8 space-y-8">
        
        <div>
          <h2 class="text-2xl font-black text-white tracking-tight">Dashboard de Volumetria</h2>
          <p class="text-xs text-slate-400 mt-1">Dados analíticos consolidados em tempo real direto da nuvem Neon.</p>
        </div>

        <!-- CARDS DE METRICAS (KPIs) -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div class="bg-slate-950 border border-slate-800/80 p-6 rounded-2xl shadow-md">
            <span class="text-xxs font-bold text-slate-400 uppercase tracking-widest block mb-1">Faturamento Total</span>
            <span class="text-3xl font-black text-emerald-400">R$ {{ metricas().faturamento_total_reais || '0,00' }}</span>
          </div>

          <div class="bg-slate-950 border border-slate-800/80 p-6 rounded-2xl shadow-md">
            <span class="text-xxs font-bold text-slate-400 uppercase tracking-widest block mb-1">Clientes Registrados</span>
            <span class="text-3xl font-black text-indigo-400">{{ metricas().clientes_registrados }}</span>
          </div>

          <div class="bg-slate-950 border border-slate-800/80 p-6 rounded-2xl shadow-md">
            <span class="text-xxs font-bold text-slate-400 uppercase tracking-widest block mb-1">Total de Itens Histórico</span>
            <span class="text-3xl font-black text-amber-400">{{ metricas().total_itens_historico }}</span>
          </div>
        </div>

        <!-- SEÇÃO DE GRÁFICO VISUAL DIDÁTICO -->
        <div class="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
          <h3 class="text-sm font-bold text-slate-300 uppercase tracking-wider">Distribuição do Estoque Atual</h3>
          
          <div class="grid grid-cols-3 gap-4 pt-2">
            <div class="text-center p-4 bg-emerald-950/40 border border-emerald-900/40 rounded-xl">
              <span class="text-xl block mb-1">🟢</span>
              <span class="text-xs text-slate-400 block font-medium">Disponíveis</span>
              <span class="text-lg font-black text-emerald-400">{{ metricas().grafico_status?.disponiveis || 0 }}</span>
            </div>
            
            <div class="text-center p-4 bg-orange-950/40 border border-orange-900/40 rounded-xl">
              <span class="text-xl block mb-1">🟠</span>
              <span class="text-xs text-slate-400 block font-medium">Reservados</span>
              <span class="text-lg font-black text-orange-400">{{ metricas().grafico_status?.reservados || 0 }}</span>
            </div>

            <div class="text-center p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span class="text-xl block mb-1">🔴</span>
              <span class="text-xs text-slate-400 block font-medium">Vendidos</span>
              <span class="text-lg font-black text-slate-300">{{ metricas().grafico_status?.vendidos || 0 }}</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private apiService = inject(ApiService);
  metricas = signal<any>({});

  ngOnInit(): void {
    this.apiService.obterMetricasDashboard().subscribe({
      next: (dados) => this.metricas.set(dados)
    });
  }

  voltarParaVitrine(): void {
    window.location.href = '/';
  }
}
