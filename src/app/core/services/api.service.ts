import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ItemSacolaResposta {
  produto_id: number;
  nome: string;
  preco: number;
  imagem_url: string | null;
  estado_conservacao: string | null;
  expira_em: string;
  segundos_restantes: number;
}

export interface SacolaResposta {
  itens: ItemSacolaResposta[];
  total_itens: number;
  subtotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8000';

  listarProdutos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/produtos/`);
  }

  criarProduto(produto: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/produtos/`, produto);
  }

  editarProduto(id: number, produto: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/produtos/${id}`, produto);
  }

  deletarProduto(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/produtos/${id}`);
  }

  registrarAdmin(dados: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/registrar`, dados);
  }

  login(dados: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/login`, dados);
  }

  obterSacola(): Observable<SacolaResposta> {
    return this.http.get<SacolaResposta>(`${this.baseUrl}/sacola`, { withCredentials: true });
  }

  adicionarNaSacola(produtoId: number): Observable<SacolaResposta> {
    return this.http.post<SacolaResposta>(`${this.baseUrl}/sacola/itens/${produtoId}`, null, { withCredentials: true });
  }

  removerDaSacola(produtoId: number): Observable<SacolaResposta> {
    return this.http.delete<SacolaResposta>(`${this.baseUrl}/sacola/itens/${produtoId}`, { withCredentials: true });
  }

  obterMetricasDashboard(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard/resumo`);
  }
}
