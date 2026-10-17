import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_URL } from '../services/api.service';
import { sacolaSessaoInterceptor } from './sacola-sessao.interceptor';

const SESSAO = '3f2b8c1e-9d4a-4b7e-8a61-2c5d7e9f0a13';

describe('sacolaSessaoInterceptor', () => {
  let http: HttpClient;
  let controle: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([sacolaSessaoInterceptor])), provideHttpClientTesting()]
    });
    http = TestBed.inject(HttpClient);
    controle = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controle.verify());

  it('guarda a sessão devolvida pela API e a envia nas chamadas seguintes', () => {
    http.post(`${API_URL}/sacola/itens/1`, null).subscribe();
    const primeira = controle.expectOne(`${API_URL}/sacola/itens/1`);
    expect(primeira.request.headers.has('X-Sacola-Sessao')).toBe(false);
    primeira.flush({}, { headers: { 'X-Sacola-Sessao': SESSAO } });

    http.get(`${API_URL}/sacola`).subscribe();
    const segunda = controle.expectOne(`${API_URL}/sacola`);
    expect(segunda.request.headers.get('X-Sacola-Sessao')).toBe(SESSAO);
    segunda.flush({});
  });

  it('envia a sessão também ao criar o pedido, mas não na listagem do admin', () => {
    localStorage.setItem('sacola_sessao', SESSAO);

    http.post(`${API_URL}/pedidos`, {}).subscribe();
    expect(controle.expectOne({ method: 'POST', url: `${API_URL}/pedidos` }).request.headers.get('X-Sacola-Sessao')).toBe(SESSAO);

    http.get(`${API_URL}/pedidos`).subscribe();
    expect(controle.expectOne({ method: 'GET', url: `${API_URL}/pedidos` }).request.headers.has('X-Sacola-Sessao')).toBe(false);
  });

  it('não envia a sessão para outro domínio', () => {
    localStorage.setItem('sacola_sessao', SESSAO);
    http.get('https://outro-site.example/sacola').subscribe();
    expect(controle.expectOne('https://outro-site.example/sacola').request.headers.has('X-Sacola-Sessao')).toBe(false);
  });

  it('ignora valor guardado ou devolvido que não é um UUID', () => {
    localStorage.setItem('sacola_sessao', 'lixo');
    http.get(`${API_URL}/sacola`).subscribe();
    const req = controle.expectOne(`${API_URL}/sacola`);
    expect(req.request.headers.has('X-Sacola-Sessao')).toBe(false);
    req.flush({}, { headers: { 'X-Sacola-Sessao': 'outro-lixo' } });
    expect(localStorage.getItem('sacola_sessao')).toBe('lixo');
  });
});
