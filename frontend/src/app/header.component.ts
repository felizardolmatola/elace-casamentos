import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { NavigationEnd, NavigationStart, Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'elace-header',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, RouterLinkActive],
  template: `

    <header class="header" [class.scrolled]="scrolled" [class.open]="menuOpen">
      <div class="header-inner">
        <a class="brand" routerLink="/" aria-label="Elace Casamentos — página inicial" (click)="closeMenu()">
          <svg class="logo" viewBox="0 0 44 32" width="44" height="32" aria-hidden="true" focusable="false"><defs><clipPath id="ringsH"><rect x="17" y="19" width="10" height="13"/></clipPath></defs><g fill="none" stroke-width="2.6"><circle cx="14" cy="19" r="10" stroke="#000"/><circle cx="30" cy="19" r="10" stroke="#000"/><circle cx="14" cy="19" r="10" stroke="#000" clip-path="url(#ringsH)"/></g><path d="M30 1.5l3.2 4.2L30 9.6l-3.2-3.9z" fill="#000"/></svg>
          <span class="brand-text">Elace<span class="brand-light"> casamentos</span></span>
        </a>

        <nav id="main-nav" class="nav" aria-label="Navegação principal" [class.show]="menuOpen">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="closeMenu()">Início</a>
          <a routerLink="/fornecedores" routerLinkActive="active" (click)="closeMenu()">Fornecedores</a>
          <a routerLink="/criar-casamento" routerLinkActive="active" (click)="closeMenu()">Planeamento</a>

          <div class="search-wrap" #searchWrap>
            <form class="search" role="search" [class.focus]="searchOpen" (submit)="onSearch($event, q.value)">
              <svg class="s-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              <input #q type="text" name="q" role="combobox" placeholder="Pesquisar fornecedores, serviços…" aria-label="Pesquisar fornecedores"
                     aria-autocomplete="list" aria-controls="search-panel" [attr.aria-expanded]="searchOpen"
                     autocomplete="off" spellcheck="false" maxlength="80"
                     (focus)="searchOpen = true" (input)="term = q.value" (keydown.escape)="closeSearch(q)" />
              <button type="button" class="s-clear" *ngIf="term" (click)="clearSearch(q)" aria-label="Limpar pesquisa">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
              <kbd class="s-kbd" *ngIf="!term && !searchOpen" aria-hidden="true">/</kbd>
              <button type="submit" class="s-go" *ngIf="term" aria-label="Pesquisar">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </button>
            </form>
            <div id="search-panel" class="search-panel" role="listbox" *ngIf="searchOpen">
              <ng-container *ngIf="matches().length; else idle">
                <p class="sp-title">Sugestões</p>
                <button type="button" role="option" class="sp-item" *ngFor="let m of matches()" (click)="go(m.q, q)">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
                  <span>{{ m.label }}</span><small>{{ m.hint }}</small>
                </button>
              </ng-container>
              <ng-template #idle>
                <ng-container *ngIf="recent.length">
                  <p class="sp-title">Pesquisas recentes <button type="button" class="sp-link" (click)="clearRecent()">Limpar</button></p>
                  <button type="button" role="option" class="sp-item" *ngFor="let r of recent" (click)="go(r, q)">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                    <span>{{ r }}</span>
                  </button>
                </ng-container>
                <p class="sp-title">Categorias populares</p>
                <div class="sp-chips">
                  <button type="button" class="sp-chip" *ngFor="let c of cats" (click)="go(c.q, q)">{{ c.label }}</button>
                </div>
              </ng-template>
              <p class="sp-foot"><span><kbd>Enter</kbd> pesquisar</span><span><kbd>Esc</kbd> fechar</span></p>
            </div>
          </div>

          <div class="nav-actions">
            <div class="auth" #auth *ngIf="!user" [class.open]="accountOpen">
              <a class="btn-solid auth-main" routerLink="/login" (click)="closeMenu()">Entrar</a>
              <button type="button" class="btn-solid auth-toggle" (click)="toggleAccount()" (keydown.arrowdown)="openAccount($event)"
                      [attr.aria-expanded]="accountOpen" aria-haspopup="menu" aria-controls="account-menu"
                      [attr.aria-label]="accountOpen ? 'Fechar opções de conta' : 'Abrir opções de conta'">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              <div id="account-menu" class="account-menu" role="menu" [class.show]="accountOpen">
                <a role="menuitem" routerLink="/registo" (click)="closeMenu()">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6"/></svg>
                  <span><strong>Criar conta</strong><small>Casais e fornecedores</small></span>
                </a>
              </div>
            </div>
            <a class="avatar" *ngIf="user" [routerLink]="user.tipo === 'admin' ? '/admin' : user.tipo === 'fornecedor' ? '/dashboard-fornecedor' : '/dashboard'" (click)="closeMenu()" aria-label="A minha conta" title="A minha conta">{{ user.initials }}</a>
          </div>
        </nav>

        <button class="burger" type="button" (click)="toggleMenu()"
                [attr.aria-expanded]="menuOpen" aria-controls="main-nav"
                [attr.aria-label]="menuOpen ? 'Fechar menu' : 'Abrir menu'">
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
  `,
  styles: [`
    :host{display:block;position:sticky;top:0;z-index:100;font-family:Inter,Arial,sans-serif}
    *{box-sizing:border-box}
    a{text-decoration:none}

    /* Barra superior */
    .utility{background:#0b4870;color:#000;font-size:12px}
    .utility-inner{max-width:1440px;margin:0 auto;height:38px;padding:0 clamp(22px,7vw,104px);display:flex;align-items:center;justify-content:space-between;gap:16px}
    .utility-msg{display:flex;align-items:center;gap:9px;letter-spacing:.2px}
    .pulse{width:6px;height:6px;border-radius:50%;background:#9fd0a0;flex:none}
    .utility-links{display:flex;align-items:center;gap:14px}
    .utility-links a{color:#fff;font-weight:500;border-bottom:1px solid rgba(255,255,255,.4);padding-bottom:1px;transition:border-color .2s}
    .utility-links a:hover{border-color:#fff}
    .sep{width:1px;height:12px;background:rgba(255,255,255,.3)}
    .lang{color:#000}

    /* Cabeçalho */
    .header{background:#fff;border-bottom:1px solid #fff;box-shadow:0 3px 12px rgba(0,0,0,.08);transition:box-shadow .25s}
    .header.scrolled{box-shadow:0 6px 24px rgba(0,0,0,.14)}
    .header-inner{max-width:1440px;margin:0 auto;height:76px;padding:0 clamp(22px,7vw,104px);display:flex;align-items:center;justify-content:space-between;gap:24px}

    .brand{display:flex;align-items:center;gap:12px;flex:none;line-height:1;color:#000;font-family:'Times New Roman',Times,serif;font-size:27px;font-weight:400;white-space:nowrap}
    .brand .logo{width:56px;height:41px;flex:none;display:block}
    .brand-text{display:inline-flex;align-items:center;line-height:1}
    .brand-light{font-weight:400;color:#000;white-space:pre}

    .nav{display:flex;align-items:center;gap:28px}
    .nav > a{position:relative;font-size:13.5px;font-weight:500;color:#000;padding:8px 0;transition:color .2s}
    .nav > a::after{content:'';position:absolute;left:0;right:0;bottom:0;height:2px;background:#0b4870;transform:scaleX(0);transform-origin:left;transition:transform .25s}
    .nav > a:hover,.nav > a.active{color:#000}
    .nav > a:hover::after,.nav > a.active::after{transform:scaleX(1)}

    .search-wrap{position:relative;margin-left:-6px}
    .search{position:relative;display:flex;align-items:center;width:260px;height:42px;background:#f4f6f8;border:1px solid #e3e8ed;border-radius:4px;transition:width .25s ease,background .2s,border-color .2s,box-shadow .2s}
    .search:hover{border-color:#cdd6de}
    .search.focus,.search:focus-within{width:340px;background:#fff;border-color:#0b4870;box-shadow:0 0 0 3px rgba(11,72,112,.14)}
    .s-icon{position:absolute;left:13px;width:16px;height:16px;fill:none;stroke:#5b6b78;stroke-width:2;stroke-linecap:round;pointer-events:none;transition:stroke .2s}
    .search:focus-within .s-icon{stroke:#0b4870}
    .search input{width:100%;height:100%;padding:0 74px 0 38px;border:0;border-radius:4px;background:transparent;font:inherit;font-size:13px;color:#000;outline:none}
    .search input::placeholder{color:#6b7a87}
    .s-kbd,.search-panel kbd{font:600 11px Inter,Arial,sans-serif;color:#5b6b78;background:#fff;border:1px solid #d5dce3;border-bottom-width:2px;border-radius:4px;padding:1px 6px;line-height:1.4}
    .s-kbd{position:absolute;right:10px}
    .s-clear,.s-go{position:absolute;display:grid;place-items:center;width:28px;height:28px;border:0;border-radius:3px;padding:0;cursor:pointer;transition:background .15s}
    .s-clear{right:40px;background:transparent}.s-clear:hover{background:#e8edf1}
    .s-go{right:6px;background:#0b4870}.s-go:hover{background:#093a5b}
    .s-clear svg,.s-go svg{width:14px;height:14px;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
    .s-clear svg{stroke:#5b6b78}.s-go svg{stroke:#fff}
    .search-panel{position:absolute;left:0;top:calc(100% + 8px);width:max(100%,340px);background:#fff;border:1px solid #e3e8ed;border-radius:4px;box-shadow:0 14px 34px rgba(0,0,0,.16),0 2px 8px rgba(0,0,0,.06);padding:8px;z-index:6;animation:menuIn .15s ease-out}
    .sp-title{display:flex;align-items:center;justify-content:space-between;margin:6px 8px 6px;font-size:10.5px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#5b6b78}
    .sp-link{border:0;background:none;color:#0b4870;font-size:11.5px;font-weight:600;letter-spacing:0;text-transform:none;cursor:pointer;padding:0}
    .sp-link:hover{text-decoration:underline}
    .sp-item{display:flex;align-items:center;gap:11px;width:100%;padding:10px 8px;border:0;border-radius:3px;background:none;text-align:left;font-size:13px;color:#000;cursor:pointer}
    .sp-item:hover,.sp-item:focus-visible{background:#eef4f8;outline:none}
    .sp-item svg{width:16px;height:16px;flex:none;fill:none;stroke:#5b6b78;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
    .sp-item small{margin-left:auto;font-size:11.5px;color:#6b7a87}
    .sp-chips{display:flex;flex-wrap:wrap;gap:8px;padding:2px 8px 10px}
    .sp-chip{border:1px solid #d5dce3;background:#fff;border-radius:999px;padding:7px 13px;font-size:12.5px;font-weight:500;color:#000;cursor:pointer;transition:background .15s,border-color .15s}
    .sp-chip:hover{background:#eef4f8;border-color:#0b4870}
    .sp-foot{display:flex;gap:16px;margin:4px 0 0;padding:9px 8px 2px;border-top:1px solid #eef1f4;font-size:11.5px;color:#6b7a87}
    .sp-foot kbd{margin-right:4px}
    .nav-actions{display:flex;align-items:center;gap:12px;margin-left:10px;padding-left:28px;border-left:1px solid #fff}
    .avatar{display:inline-flex;align-items:center;justify-content:center;flex:none;min-width:42px;height:42px;padding:0 11px;border-radius:999px;background:#0b4870;color:#fff;font-size:13px;font-weight:600;letter-spacing:.5px;white-space:nowrap;box-shadow:0 2px 10px rgba(0,0,0,.18);transition:background .2s}
    .avatar:hover{background:#093a5b}
    .btn-ghost,.btn-solid{display:inline-flex;align-items:center;justify-content:center;height:42px;padding:0 20px;border-radius:3px;font-size:13px;font-weight:600;transition:background .2s,color .2s,border-color .2s}
    .btn-ghost{color:#000;border:1px solid #0b4870}
    .btn-ghost:hover{background:#eef4f8}
    .btn-solid{background:#0b4870;color:#fff;border:1px solid #0b4870}
    .btn-solid:hover{background:#093a5b;border-color:#093a5b}

    .auth{position:relative;display:flex}
    .auth-main{border-radius:3px 0 0 3px}
    .auth-toggle{width:42px;padding:0;border-radius:0 3px 3px 0;border-left-color:rgba(255,255,255,.35);cursor:pointer;font:inherit}
    .auth-toggle svg{width:16px;height:16px;fill:none;stroke:#fff;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;transition:transform .2s}
    .auth.open .auth-toggle svg{transform:rotate(180deg)}
    .account-menu{display:none;position:absolute;right:0;top:calc(100% + 10px);min-width:230px;background:#fff;border-radius:3px;box-shadow:0 14px 34px rgba(0,0,0,.18),0 2px 8px rgba(0,0,0,.08);padding:6px;z-index:5;animation:menuIn .15s ease-out}
    .account-menu.show{display:block}
    .account-menu a{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:3px;color:#000;transition:background .15s,color .15s}
    .account-menu a:hover,.account-menu a:focus-visible{background:#eef4f8;color:#000;outline:none}
    .account-menu svg{width:20px;height:20px;flex:none;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
    .account-menu span{display:grid;gap:2px}
    .account-menu strong{font-size:13px;font-weight:600}
    .account-menu small{font-size:11.5px;color:#000}
    @keyframes menuIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}

    a:focus-visible,button:focus-visible{outline:2px solid #0b4870;outline-offset:3px;border-radius:2px}

    /* Botão hambúrguer */
    .burger{display:none;width:42px;height:42px;border:1px solid #fff;border-radius:3px;background:#fff;cursor:pointer;padding:0;flex-direction:column;align-items:center;justify-content:center;gap:5px}
    .burger span{display:block;width:18px;height:2px;background:#0b4870;transition:transform .25s,opacity .2s}
    .header.open .burger span:nth-child(1){transform:translateY(7px) rotate(45deg)}
    .header.open .burger span:nth-child(2){opacity:0}
    .header.open .burger span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}

    @media(max-width:1120px){
      .utility-msg{display:none}
      .utility-inner{justify-content:flex-end}
      .header-inner{height:68px}
      .burger{display:flex}
      .nav{display:none;position:absolute;left:0;right:0;top:100%;flex-direction:column;align-items:stretch;gap:0;background:#fff;border-bottom:1px solid #fff;box-shadow:0 18px 30px rgba(11,72,112,.1);padding:8px clamp(22px,7vw,104px) 22px}
      .nav.show{display:flex}
      .nav > a{padding:15px 0;font-size:15px;border-bottom:1px solid #fff}
      .nav > a::after{display:none}
      .search-wrap{order:-1;margin:14px 0 6px}
      .search,.search.focus,.search:focus-within{width:100%}
      .search-panel{position:static;width:100%;margin-top:8px;box-shadow:none;animation:none}
      .s-kbd,.sp-foot{display:none}
      .nav-actions{margin:18px 0 0;padding:0;border:0;display:block}
      .auth{display:flex;flex-wrap:wrap}
      .auth-main{flex:1}
      .account-menu{position:static;width:100%;margin-top:8px;box-shadow:none;border:1px solid #000;animation:none}
    }
    @media(max-width:480px){
      .brand{font-size:22px;gap:9px}
      .brand .logo{width:44px;height:32px}
      .utility-links .sep,.utility-links .lang{display:none}
    }
  `]
})
export class HeaderComponent {
  menuOpen = false;
  scrolled = false;
  accountOpen = false;
  searchOpen = false;
  term = '';
  recent: string[] = [];
  readonly cats = [
    { label: 'Fotografia e vídeo', q: 'fotografia', hint: 'Categoria' },
    { label: 'Decoração e flores', q: 'decoração', hint: 'Categoria' },
    { label: 'Música e animação', q: 'música', hint: 'Categoria' },
    { label: 'Buffet e catering', q: 'buffet', hint: 'Categoria' },
    { label: 'Espaços e salões', q: 'espaço', hint: 'Categoria' },
    { label: 'Bolos e doces', q: 'bolo', hint: 'Categoria' }
  ];
  user: { tipo: string; initials: string } | null = null;

  @ViewChild('auth') private auth?: ElementRef<HTMLElement>;
  @ViewChild('searchWrap') private searchWrap?: ElementRef<HTMLElement>;

  constructor(private router: Router) {
    // Fecha menus ao navegar para outra página
    this.router.events.subscribe(e => {
      if (e instanceof NavigationStart) { this.menuOpen = false; this.accountOpen = false; this.searchOpen = false; }
      if (e instanceof NavigationEnd) this.readSession();
    });
    this.readSession();
    try { this.recent = JSON.parse(localStorage.getItem('elace_recent_search') || '[]').slice(0, 4); } catch { this.recent = []; }
  }

  // Fecha o menu de conta ao clicar fora dele
  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null) {
    if (this.accountOpen && !this.auth?.nativeElement.contains(target as Node)) this.accountOpen = false;
    if (this.searchOpen && !this.searchWrap?.nativeElement.contains(target as Node)) this.searchOpen = false;
  }

  @HostListener('window:scroll')
  onScroll() { this.scrolled = window.scrollY > 8; }

  @HostListener('window:keydown.escape')
  onEscape() { this.closeMenu(); }

  // Atalho "/" foca a pesquisa
  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    const t = e.target as HTMLElement | null;
    const typing = !!t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable);
    if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      this.searchWrap?.nativeElement.querySelector('input')?.focus();
    }
  }

  @HostListener('window:resize')
  onResize() { if (window.innerWidth > 1120) this.closeMenu(); }


  @HostListener('window:storage')
  onStorage() { this.readSession(); }

  // Lê a sessão guardada após login/cadastro e calcula as iniciais
  private readSession() {
    try {
      const raw = localStorage.getItem('elace_user');
      if (!raw) { this.user = null; return; }
      const u = JSON.parse(raw);
      this.user = { tipo: u.tipo === 'admin' ? 'admin' : u.tipo === 'fornecedor' ? 'fornecedor' : 'casal', initials: this.initialsOf(u) };
    } catch { this.user = null; }
  }

  private initialsOf(u: any): string {
    const first = (x: string) => (x || '').trim().charAt(0).toUpperCase();
    const words = (x: string) => (x || '').trim().split(/\s+/).filter(Boolean);
    if (u.tipo === 'fornecedor' || u.tipo === 'admin') {
      const w = words(u.nome);
      return w.length > 1 ? first(w[0]) + first(w[1]) : ((w[0] || '').slice(0, 2).toUpperCase() || first(u.email) || '?');
    }
    let a = u.noivo, b = u.noiva;
    if (!a && !b && u.nome) {
      const parts = String(u.nome).split(/\s+(?:e|&)\s+/i);
      if (parts.length >= 2) { a = parts[0]; b = parts[1]; }
      else { const w = words(u.nome); return (first(w[0]) + first(w[1])) || first(u.email) || '?'; }
    }
    if (a || b) return first(a) + (a && b ? '&' : '') + first(b);
    return first(u.email) || '?';
  }

  matches(): { label: string; q: string; hint: string }[] {
    const n = this.norm(this.term);
    if (!n) return [];
    const cats = this.cats.filter(c => this.norm(c.label).includes(n) || this.norm(c.q).includes(n));
    return [{ label: `Pesquisar “${this.term.trim()}”`, q: this.term.trim(), hint: 'Todos os fornecedores' }, ...cats.slice(0, 4)];
  }

  private norm(v: string) { return (v || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim(); }

  onSearch(event: Event, term: string) {
    event.preventDefault();
    this.run(term);
  }

  go(term: string, input: HTMLInputElement) { input.value = term; this.run(term); }

  private run(term: string) {
    const q = (term || '').trim();
    if (!q) return;
    this.recent = [q, ...this.recent.filter(r => r.toLowerCase() !== q.toLowerCase())].slice(0, 4);
    try { localStorage.setItem('elace_recent_search', JSON.stringify(this.recent)); } catch {}
    this.searchOpen = false;
    this.closeMenu();
    this.router.navigate(['/fornecedores'], { queryParams: { q } });
  }

  clearSearch(input: HTMLInputElement) { input.value = ''; this.term = ''; input.focus(); }
  closeSearch(input: HTMLInputElement) { this.searchOpen = false; input.blur(); }
  clearRecent() { this.recent = []; try { localStorage.removeItem('elace_recent_search'); } catch {} }

  toggleMenu() { this.menuOpen = !this.menuOpen; this.accountOpen = false; }
  closeMenu() { this.menuOpen = false; this.accountOpen = false; }

  toggleAccount() { this.accountOpen = !this.accountOpen; }
  openAccount(event: Event) { event.preventDefault(); this.accountOpen = true; }
}
