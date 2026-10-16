import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HeaderComponent } from './header.component';
import { FooterComponent } from './footer.component';

interface Fornecedor {
  id: string;
  nome: string;
  tag: string;        // categoria a mostrar no cartão
  catKey: string;     // categoria do marketplace (fotografia, decoracao, ...)
  descricao: string;
  servicos: string[];
  cidade: string;
  foto: string;
  wa: string;         // ligação WhatsApp
  tel: string;        // ligação telefone
  mail: string;       // ligação email
  hay: string;        // texto normalizado para pesquisa
}

@Component({
  selector: 'elace-marketplace',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, RouterLink, HeaderComponent, FooterComponent],
  template: `
    <elace-header />
    <main>
      <!-- Introdução e pesquisa -->
      <section class="intro">
        <p class="eyebrow">Marketplace de fornecedores</p>
        <h1>Profissionais para<br>cada momento do dia.</h1>
        <p class="sub">Descubram fornecedores de confiança, vejam os serviços que oferecem e contactem diretamente pela plataforma.</p>

        <form class="search" role="search" (ngSubmit)="submit()">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input name="q" type="search" [ngModel]="q" (ngModelChange)="q = $event; apply()" placeholder="Pesquisar por nome, serviço ou cidade…" aria-label="Pesquisar fornecedores" autocomplete="off" maxlength="80">
          <button class="primary" type="submit">Pesquisar</button>
        </form>

        <div class="chips" role="group" aria-label="Categorias">
          <button type="button" class="chip" [class.on]="!cat" [attr.aria-pressed]="!cat" (click)="setCat('')">Todos</button>
          <button type="button" class="chip" *ngFor="let c of categories" [class.on]="cat === c.key" [attr.aria-pressed]="cat === c.key" (click)="setCat(c.key)">{{ c.label }}</button>
        </div>
      </section>

      <!-- Resultados -->
      <section class="results" aria-live="polite">
        <div class="bar" *ngIf="!loading && !failed && all.length">
          <p class="count"><strong>{{ view.length }}</strong> {{ view.length === 1 ? 'fornecedor encontrado' : 'fornecedores encontrados' }}</p>
          <div class="bar-actions">
            <label class="city" *ngIf="cities.length">Cidade
              <select [ngModel]="city" (ngModelChange)="city = $event; apply()" aria-label="Filtrar por cidade">
                <option value="">Todas as cidades</option>
                <option *ngFor="let c of cities" [value]="c">{{ c }}</option>
              </select>
            </label>
            <button type="button" class="clear" *ngIf="q || cat || city" (click)="clear()">Limpar filtros</button>
          </div>
        </div>

        <!-- A carregar -->
        <div class="grid" *ngIf="loading" aria-busy="true">
          <article class="supplier skeleton" *ngFor="let i of [1, 2, 3]">
            <div class="supplier-photo"></div>
            <div class="supplier-body"><span class="line w60"></span><span class="line"></span><span class="line w80"></span></div>
          </article>
        </div>

        <!-- Erro -->
        <div class="state" *ngIf="failed">
          <h3>Não foi possível carregar os fornecedores.</h3>
          <p>Verifiquem a ligação e tentem novamente.</p>
          <button type="button" class="primary" (click)="load()">Tentar novamente</button>
        </div>

        <!-- Ainda não há fornecedores -->
        <div class="state" *ngIf="!loading && !failed && !all.length">
          <h3>Ainda não há fornecedores registados.</h3>
          <p>Os fornecedores aparecem aqui assim que criarem o perfil na plataforma.</p>
          <a class="primary" *ngIf="!user" routerLink="/registo" [queryParams]="{ tipo: 'fornecedor' }">Sou fornecedor e quero aparecer aqui</a>
        </div>

        <!-- Sem resultados para os filtros -->
        <div class="state" *ngIf="!loading && !failed && all.length && !view.length">
          <h3>Nenhum fornecedor corresponde à pesquisa.</h3>
          <p>Experimentem outros termos, outra categoria ou outra cidade.</p>
          <button type="button" class="primary" (click)="clear()">Limpar filtros</button>
        </div>

        <!-- Fornecedores -->
        <div class="grid" *ngIf="!loading && !failed && view.length">
          <article class="supplier" *ngFor="let s of view; trackBy: track">
            <div class="supplier-photo" [class]="'supplier-photo ph-' + (s.catKey || 'none')">
              <img *ngIf="s.foto" [src]="s.foto" [alt]="s.nome" loading="lazy" (error)="s.foto = ''">
              <span class="supplier-tag" *ngIf="s.tag">{{ s.tag }}</span>
            </div>
            <div class="supplier-body">
              <h3>{{ s.nome }}</h3>
              <p class="loc" *ngIf="s.cidade">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0zM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/></svg>{{ s.cidade }}
              </p>
              <p class="desc" *ngIf="s.descricao">{{ s.descricao }}</p>
              <ul class="services" *ngIf="s.servicos.length"><li *ngFor="let sv of s.servicos">{{ sv }}</li></ul>

              <div class="contacts" *ngIf="user; else entrar">
                <a class="btn" *ngIf="s.wa" [href]="s.wa" target="_blank" rel="noopener">WhatsApp</a>
                <a class="btn" *ngIf="s.tel" [href]="s.tel">Telefone</a>
                <a class="btn" *ngIf="s.mail" [href]="s.mail">Email</a>
                <span class="none" *ngIf="!s.wa && !s.tel && !s.mail">Contactos indisponíveis</span>
              </div>
              <ng-template #entrar><a class="supplier-link" routerLink="/login">Entrar para contactar <span aria-hidden="true">→</span></a></ng-template>
            </div>
          </article>
        </div>

        <div class="cta" *ngIf="!user">
          <a class="text-link" routerLink="/registo" [queryParams]="{ tipo: 'fornecedor' }">Sou fornecedor e quero aparecer aqui</a>
        </div>
        <div class="cta" *ngIf="user && user.tipo === 'fornecedor'">
          <a class="text-link" routerLink="/dashboard-fornecedor">Gerir o meu perfil de fornecedor</a>
        </div>
      </section>
    </main>
    <elace-footer />
  `,
  styles: [`
    :host{display:block;background:#fff;color:#000;font-family:Inter,Arial,sans-serif}
    *{box-sizing:border-box}
    a{text-decoration:none;color:inherit}
    svg{fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}

    /* Introdução */
    .intro{padding:72px clamp(22px,7vw,104px) 56px;background:#fff;text-align:center}
    .eyebrow{margin:0;text-transform:uppercase;letter-spacing:2px;font-size:10px;font-weight:700}
    .intro h1{font:500 clamp(40px,5.4vw,72px)/1.08 'Inter',sans-serif;letter-spacing:-1px;margin:20px 0 18px}
    .sub{max-width:580px;margin:0 auto;font-size:14px;line-height:1.8}

    .search{position:relative;display:flex;align-items:center;gap:10px;max-width:660px;margin:34px auto 0}
    .search svg{position:absolute;left:16px;width:18px;height:18px;pointer-events:none}
    .search input{flex:1;min-width:0;height:48px;padding:0 14px 0 44px;border:1px solid #e6e6e6;border-radius:3px;background:#fff;font:inherit;font-size:14px;color:#000;box-shadow:0 2px 10px rgba(0,0,0,.09);transition:border-color .2s,box-shadow .2s}
    .search input:focus{outline:none;border-color:#0b4870;box-shadow:0 0 0 3px rgba(11,72,112,.15),0 2px 10px rgba(0,0,0,.09)}

    .primary{display:inline-flex;align-items:center;justify-content:center;height:48px;padding:0 22px;background:#0b4870;color:#fff;border:0;border-radius:3px;font:600 13px Inter,Arial,sans-serif;cursor:pointer;transition:background .2s}
    .primary:hover{background:#093a5b}

    .chips{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;max-width:900px;margin:26px auto 0}
    .chip{height:40px;padding:0 18px;border:1px solid #fff;border-radius:999px;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,.09);font:500 13px Inter,Arial,sans-serif;color:#000;cursor:pointer;transition:background .2s,color .2s}
    .chip:hover{background:#eef4f8}
    .chip.on{background:#0b4870;color:#fff}

    /* Resultados */
    .results{position:relative;padding:56px clamp(22px,7vw,104px) 130px;background:#fff;box-shadow:0 -3px 12px rgba(0,0,0,.06);min-height:360px}
    .bar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:30px}
    .count{margin:0;font-size:14px}
    .bar-actions{display:flex;align-items:center;gap:18px;flex-wrap:wrap}
    .city{display:flex;align-items:center;gap:10px;font-size:13px;font-weight:500}
    .city select{height:42px;min-width:210px;padding:0 12px;border:1px solid #e6e6e6;border-radius:3px;background:#fff;font:inherit;font-size:13px;color:#000;box-shadow:0 2px 10px rgba(0,0,0,.09)}
    .city select:focus{outline:none;border-color:#0b4870;box-shadow:0 0 0 3px rgba(11,72,112,.15)}
    .clear{border:0;border-bottom:1px solid #aaa;padding:0 0 4px;background:none;font:inherit;font-size:13px;color:#000;cursor:pointer}

    .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
    .supplier{display:flex;flex-direction:column;background:#fff;border:1px solid #fff;border-radius:4px;overflow:hidden;box-shadow:0 2px 14px rgba(0,0,0,.09);transition:transform .2s,box-shadow .2s}
    .supplier:hover{transform:translateY(-4px);box-shadow:0 16px 34px rgba(0,0,0,.14)}
    .supplier-photo{position:relative;height:240px;background:linear-gradient(135deg,#dfe9ef,#f3f6f8);overflow:hidden}
    .supplier-photo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
    .ph-fotografia{background:url('/assets/img/fornecedores/fotografia.webp') center/cover,linear-gradient(135deg,#dfe9ef,#f3f6f8)}
    .ph-decoracao{background:url('/assets/img/fornecedores/decoracao.webp') center/cover,linear-gradient(135deg,#dfe9ef,#f3f6f8)}
    .ph-musica{background:url('/assets/img/fornecedores/musica.webp') center/cover,linear-gradient(135deg,#dfe9ef,#f3f6f8)}
    .ph-buffet{background:url('/assets/img/fornecedores/buffet.webp') center/cover,linear-gradient(135deg,#dfe9ef,#f3f6f8)}
    .ph-espacos{background:url('/assets/img/fornecedores/espacos.webp') center/cover,linear-gradient(135deg,#dfe9ef,#f3f6f8)}
    .ph-bolos{background:url('/assets/img/fornecedores/bolos.webp') center/cover,linear-gradient(135deg,#dfe9ef,#f3f6f8)}
    .supplier-tag{position:absolute;z-index:1;left:16px;top:16px;background:#fff;color:#000;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:7px 11px;box-shadow:0 2px 8px rgba(0,0,0,.12)}
    .supplier-body{display:flex;flex-direction:column;flex:1;padding:24px 24px 26px}
    .supplier-body h3{font-family:'Inter',sans-serif;font-size:22px;font-weight:500;margin:0 0 8px}
    .loc{display:flex;align-items:center;gap:6px;margin:0 0 12px;font-size:12.5px}
    .loc svg{width:15px;height:15px;flex:none}
    .desc{margin:0 0 16px;font-size:12.5px;line-height:1.75;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
    .services{list-style:none;padding:0;margin:0 0 22px;display:grid;gap:9px;flex:1}
    .services li{position:relative;padding-left:20px;font-size:12.5px}
    .services li::before{content:'';position:absolute;left:0;top:5px;width:8px;height:8px;border-radius:50%;background:#000}
    .contacts{display:flex;flex-wrap:wrap;gap:10px;margin-top:auto}
    .btn{display:inline-flex;align-items:center;justify-content:center;height:36px;padding:0 14px;border:1px solid #0b4870;border-radius:3px;background:#fff;color:#0b4870;font-size:12px;font-weight:600;transition:background .2s}
    .btn:hover{background:#eef4f8}
    .none{font-size:12px}
    .supplier-link{margin-top:auto;font-size:12px;font-weight:600}

    /* Estados */
    .state{max-width:520px;margin:30px auto;padding:44px 30px;text-align:center;background:#fff;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,.06),0 16px 44px rgba(0,0,0,.12)}
    .state h3{margin:0 0 10px;font:500 24px 'Inter',sans-serif}
    .state p{margin:0 0 24px;font-size:14px;line-height:1.7}
    .state .primary{height:46px}
    .skeleton .supplier-photo{background:#f0f0f0;animation:pulse 1.4s ease-in-out infinite}
    .skeleton .line{display:block;height:12px;margin-bottom:14px;border-radius:3px;background:#f0f0f0;animation:pulse 1.4s ease-in-out infinite}
    .skeleton .w60{width:60%;height:18px}.skeleton .w80{width:80%}
    @keyframes pulse{50%{opacity:.5}}

    .cta{display:flex;justify-content:center;margin-top:56px}
    .text-link{font-size:13px;border-bottom:1px solid #aaa;padding-bottom:5px}

    a:focus-visible,button:focus-visible{outline:2px solid #0b4870;outline-offset:3px}

    @media(max-width:1000px){.grid{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:650px){
      .intro{padding:48px 22px 40px}
      .search{flex-wrap:wrap}.search input{flex:1 1 100%}.search .primary{width:100%}
      .results{padding:40px 22px 100px}
      .grid{grid-template-columns:1fr}
      .bar-actions{width:100%}.city{width:100%}.city select{flex:1;min-width:0}
    }
  `]
})
export class MarketplaceComponent implements OnInit {
  // Categorias do marketplace (as mesmas da página inicial)
  categories = [
    { key: 'fotografia', label: 'Fotografia e vídeo', terms: ['fotograf', 'video'] },
    { key: 'decoracao', label: 'Decoração e flores', terms: ['decora', 'flor'] },
    { key: 'musica', label: 'Música e animação', terms: ['music', 'dj', 'banda', 'animac'] },
    { key: 'buffet', label: 'Buffet e catering', terms: ['buffet', 'catering', 'gastronom'] },
    { key: 'espacos', label: 'Espaços e salões', terms: ['espaco', 'salao', 'jardim', 'quinta'] },
    { key: 'bolos', label: 'Bolos e doces', terms: ['bolo', 'pastel', 'doce', 'confeit'] }
  ];

  all: Fornecedor[] = [];
  view: Fornecedor[] = [];
  cities: string[] = [];
  loading = true;
  failed = false;
  q = '';
  cat = '';
  city = '';
  user: { tipo: string } | null = null;

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    try { const raw = localStorage.getItem('elace_user'); this.user = raw ? JSON.parse(raw) : null; } catch { this.user = null; }
    // A pesquisa do header e as ligações da página inicial chegam por ?q= e ?categoria=
    this.route.queryParamMap.subscribe(p => {
      this.q = (p.get('q') || '').slice(0, 80);
      this.cat = p.get('categoria') || '';
      this.apply();
    });
    this.load();
  }

  load() {
    this.loading = true;
    this.failed = false;
    this.http.get<any>('/api/fornecedores').subscribe({
      next: r => {
        this.all = this.toList(r).map(x => this.normalize(x)).filter(f => !!f.nome);
        this.cities = Array.from(new Set(this.all.map(f => f.cidade).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'pt'));
        this.loading = false;
        this.apply();
      },
      error: () => { this.loading = false; this.failed = true; }
    });
  }

  apply() {
    const terms = this.norm(this.q).split(/\s+/).filter(Boolean);
    this.view = this.all.filter(f =>
      (!this.cat || f.catKey === this.cat) &&
      (!this.city || f.cidade === this.city) &&
      terms.every(t => f.hay.includes(t)));
  }

  submit() { this.syncUrl(); }

  setCat(key: string) {
    this.cat = this.cat === key ? '' : key;
    this.syncUrl();
  }

  clear() {
    this.q = ''; this.cat = ''; this.city = '';
    this.syncUrl();
  }

  track(_: number, f: Fornecedor) { return f.id; }

  private syncUrl() {
    this.apply();
    this.router.navigate([], { relativeTo: this.route, queryParams: { q: this.q.trim() || null, categoria: this.cat || null }, replaceUrl: true });
  }

  private toList(r: any): any[] {
    if (Array.isArray(r)) return r;
    return r?.fornecedores || r?.items || r?.data || [];
  }

  private norm(s: any): string {
    return String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  private normalize(f: any): Fornecedor {
    const nome = String(f?.nome || f?.name || f?.empresa || '').trim();
    const categoria = String(f?.categoria?.nome || f?.categoria || f?.tipo || '').trim();
    const servicos: string[] = (Array.isArray(f?.servicos) ? f.servicos : [])
      .map((x: any) => String(typeof x === 'string' ? x : x?.nome || '').trim()).filter(Boolean).slice(0, 4);
    const descricao = String(f?.descricao || f?.sobre || '').trim();
    const cidade = String(f?.cidade || f?.localizacao || '').trim();
    const cn = this.norm(categoria);
    const cat = this.categories.find(c => c.terms.some(t => cn.includes(t)));
    const phone = String(f?.telefone || f?.contacto || '').replace(/[^\d+]/g, '');
    let wa = String(f?.whatsapp || f?.telefone || f?.contacto || '').replace(/\D/g, '');
    if (wa.length === 9) wa = '258' + wa;
    const email = String(f?.email || '').trim();
    return {
      id: String(f?.id ?? f?._id ?? nome),
      nome,
      tag: categoria || cat?.label || '',
      catKey: cat?.key || '',
      descricao,
      servicos,
      cidade,
      foto: String(f?.foto || f?.imagem || f?.logo || '').trim(),
      wa: wa.length >= 9 ? 'https://wa.me/' + wa : '',
      tel: phone ? 'tel:' + phone : '',
      mail: email ? 'mailto:' + email : '',
      hay: this.norm([nome, categoria, descricao, cidade, servicos.join(' ')].join(' '))
    };
  }
}
