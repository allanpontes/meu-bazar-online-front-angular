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

export type StatusPedido = 'AguardandoPagamento' | 'Pago' | 'Cancelado';

export interface NovoPedido {
  nome_cliente: string;
  whatsapp: string;
  endereco: string;
}

export interface Pedido extends NovoPedido {
  id: number;
  subtotal: number;
  status: StatusPedido;
  criado_em: string;
  itens: { produto_id: number | null; nome: string; preco: number }[];
}

export interface Credenciais {
  email: string;
  senha: string;
}

export interface TokenResposta {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export const API_URL = 'http://localhost:8000';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = API_URL;

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

  login(dados: Credenciais): Observable<TokenResposta> {
    return this.http.post<TokenResposta>(`${this.baseUrl}/auth/login`, dados);
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

  criarPedido(dados: NovoPedido): Observable<Pedido> {
    return this.http.post<Pedido>(`${this.baseUrl}/pedidos`, dados, { withCredentials: true });
  }

  listarPedidos(status?: StatusPedido): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.baseUrl}/pedidos`, {
      params: status ? { status_pedido: status } : {}
    });
  }

  atualizarStatusPedido(id: number, status: 'Pago' | 'Cancelado'): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.baseUrl}/pedidos/${id}/status`, { status });
  }

  obterMetricasDashboard(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard/resumo`);
  }
}
