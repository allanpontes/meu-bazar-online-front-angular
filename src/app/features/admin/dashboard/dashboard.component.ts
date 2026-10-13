import { Component, OnInit, inject, signal } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <main class="mx-auto w-full max-w-6xl space-y-8 px-6 py-8">
        <div>
          <p class="mb-2 text-xs font-black uppercase tracking-[0.2em] text-[#F50057]">Resumo da loja</p>
          <h1 class="text-2xl font-black tracking-tight text-[#580444] md:text-3xl">Dashboard</h1>
          <p class="mt-2 text-sm text-slate-500">Acompanhe os principais números e a situação atual do seu bazar.</p>
        </div>

        <div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div class="rounded-2xl border border-[#EAD5DA] bg-white p-6 shadow-sm">
            <span class="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Faturamento total</span>
            <span class="text-2xl font-black text-[#580444]">R$ {{ metricas().faturamento_total_reais || '0,00' }}</span>
          </div>

          <div class="rounded-2xl border border-[#EAD5DA] bg-white p-6 shadow-sm">
            <span class="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Clientes registrados</span>
            <span class="text-2xl font-black text-[#F50057]">{{ metricas().clientes_registrados || 0 }}</span>
          </div>

          <div class="rounded-2xl border border-[#EAD5DA] bg-white p-6 shadow-sm">
            <span class="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Itens no histórico</span>
            <span class="text-2xl font-black text-[#7D344B]">{{ metricas().total_itens_historico || 0 }}</span>
          </div>
        </div>

        <section class="space-y-5 rounded-3xl border border-[#EAD5DA] bg-white p-6 shadow-sm md:p-8">
          <div>
            <h2 class="text-lg font-black tracking-tight text-[#580444]">Situação do estoque</h2>
            <p class="mt-1 text-sm text-slate-500">Veja quantos produtos estão disponíveis, reservados ou vendidos.</p>
          </div>
          
          <div class="grid grid-cols-1 gap-4 pt-1 sm:grid-cols-3">
            <div class="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center">
              <span class="mb-2 block text-xs font-bold uppercase tracking-wider text-emerald-800">Disponíveis</span>
              <span class="text-2xl font-black text-emerald-700">{{ metricas().grafico_status?.disponiveis || 0 }}</span>
            </div>
            
            <div class="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center">
              <span class="mb-2 block text-xs font-bold uppercase tracking-wider text-amber-800">Reservados</span>
              <span class="text-2xl font-black text-amber-700">{{ metricas().grafico_status?.reservados || 0 }}</span>
            </div>

            <div class="rounded-2xl border border-[#EAD5DA] bg-[#FFF8FA] p-5 text-center">
              <span class="mb-2 block text-xs font-bold uppercase tracking-wider text-[#7D344B]">Vendidos</span>
              <span class="text-2xl font-black text-[#580444]">{{ metricas().grafico_status?.vendidos || 0 }}</span>
            </div>
          </div>
        </section>
    </main>
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
}
