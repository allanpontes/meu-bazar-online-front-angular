import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SacolaService } from '../../core/services/sacola.service';

@Component({
  selector: 'app-aviso-sacola',
  standalone: true,
  template: `
    @if (sacola.aviso(); as aviso) {
      <div class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
        <div role="status" aria-live="polite"
          class="animar-aviso pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-[#F5B1C1] bg-white px-4 py-3 shadow-xl">
          <span class="text-2xl" aria-hidden="true">{{ aviso.tipo === 'adicionada' ? '🎀' : '👋' }}</span>
          <p class="min-w-0 flex-1 text-sm leading-snug text-[#580444]">
            <span class="block truncate font-black">{{ aviso.nome }}</span>
            {{ aviso.tipo === 'adicionada' ? 'está na sua sacola' : 'foi removida da sacola' }}
          </p>
          @if (aviso.tipo === 'adicionada') {
            <button type="button" (click)="irParaSacola()" class="shrink-0 rounded-full bg-[#580444] px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white transition hover:bg-[#F50057]">ver</button>
          }
        </div>
      </div>
    }
  `
})
export class AvisoSacolaComponent {
  sacola = inject(SacolaService);
  private router = inject(Router);

  irParaSacola(): void {
    this.sacola.fecharAviso();
    this.router.navigate(['/sacola']);
  }
}
