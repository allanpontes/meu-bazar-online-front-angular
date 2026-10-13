import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="min-h-screen bg-[#FFFDF9] font-sans text-slate-800 antialiased">
      <header class="sticky top-0 z-50 border-b border-[#EAD5DA] bg-white/95 shadow-sm backdrop-blur">
        <div class="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center" aria-hidden="true">
              <svg class="h-12 w-12 drop-shadow-sm" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 5h4v6l2 2 2-2V5h4l4 9 7 6-5 5-4-3v7l7 13H9l7-13v-7l-4 3-5-5 7-6 4-9Z" fill="#F50057" stroke="#580444" stroke-width="1.6" stroke-linejoin="round"/>
                <path d="M22 5c0 2 1 3 2 3s2-1 2-3M17 29h14M20 34h8" stroke="#FFFDF9" stroke-width="1.7" stroke-linecap="round"/>
                <path d="m40 7 .8 2.2L43 10l-2.2.8L40 13l-.8-2.2L37 10l2.2-.8L40 7Z" fill="#F50057"/>
              </svg>
            </div>
            <div>
              <div class="leading-none" aria-label="Elas no Closet">
                <span class="block text-[9px] font-black uppercase tracking-[0.28em] text-[#F50057]">elas no</span>
                <span class="mt-0.5 block font-serif text-2xl font-bold leading-none tracking-tight text-[#580444]">closet</span>
              </div>
              <p class="mt-1 text-xs font-medium text-slate-500">Painel administrativo</p>
            </div>
          </div>

          <nav aria-label="Navegação administrativa" class="flex flex-wrap items-center gap-2">
            <a
              routerLink="/admin"
              routerLinkActive="bg-[#580444] text-white shadow-sm"
              [routerLinkActiveOptions]="{ exact: true }"
              [attr.aria-current]="dashboardLink.isActive ? 'page' : null"
              #dashboardLink="routerLinkActive"
              class="rounded-full px-4 py-2 text-sm font-bold text-[#580444] transition-colors hover:bg-[#F4E3E8]"
            >
              Dashboard
            </a>
            <a
              routerLink="/admin/estoque"
              routerLinkActive="bg-[#580444] text-white shadow-sm"
              [routerLinkActiveOptions]="{ exact: true }"
              [attr.aria-current]="estoqueLink.isActive ? 'page' : null"
              #estoqueLink="routerLinkActive"
              class="rounded-full px-4 py-2 text-sm font-bold text-[#580444] transition-colors hover:bg-[#F4E3E8]"
            >
              Estoque
            </a>
            <a
              routerLink="/admin/pedidos"
              routerLinkActive="bg-[#580444] text-white shadow-sm"
              [routerLinkActiveOptions]="{ exact: true }"
              [attr.aria-current]="pedidosLink.isActive ? 'page' : null"
              #pedidosLink="routerLinkActive"
              class="rounded-full px-4 py-2 text-sm font-bold text-[#580444] transition-colors hover:bg-[#F4E3E8]"
            >
              Pedidos
            </a>
            <a
              routerLink="/"
              class="rounded-full border border-[#EAD5DA] px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:border-[#F50057] hover:text-[#F50057]"
            >
              Ver vitrine
            </a>
          </nav>
        </div>
      </header>

      <router-outlet />
    </div>
  `
})
export class AdminLayoutComponent {}
