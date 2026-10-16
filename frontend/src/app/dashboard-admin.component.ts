import { Component, OnDestroy } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { HeaderComponent } from './header.component';

type Secao = 'visao' | 'casais' | 'fornecedores' | 'aprovacoes' | 'categorias' | 'moderacao' | 'comunicados' | 'financas' | 'atividade' | 'definicoes';
type Verif = 'pendente' | 'aprovado' | 'rejeitado';
type EstadoConta = 'ativo' | 'suspenso';
type EstadoDen = 'aberta' | 'analise' | 'resolvida' | 'arquivada';

interface Casal { id: string; nome: string; email: string; telefone: string; cidade: string; dataCasamento: string; estado: EstadoConta; registado: string; }
interface Forn { id: string; nome: string; categoria: string; cidade: string; email: string; telefone: string; verificacao: Verif; estado: EstadoConta; destaque: boolean; plano: string; registado: string; motivo: string; }
interface Categoria { id: string; nome: string; ativa: boolean; }
interface Denuncia { id: string; alvo: string; tipo: string; motivo: string; autor: string; estado: EstadoDen; data: string; }
interface Comunicado { id: string; titulo: string; texto: string; publico: string; data: string; }
interface Plano { id: string; nome: string; preco: number; ativo: boolean; }
interface Log { id: string; data: string; acao: string; }
interface Config { nome: string; emailSuporte: string; comissao: number; manutencao: boolean; registosAbertos: boolean; aprovacaoManual: boolean; }
interface Dados { casais: Casal[]; fornecedores: Forn[]; categorias: Categoria[]; denuncias: Denuncia[]; comunicados: Comunicado[]; planos: Plano[]; logs: Log[]; config: Config; }

@Component({
  selector: 'elace-dashboard-admin',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, FormsModule, RouterLink, HeaderComponent],
  template: `
<elace-header />
<div class="shell" *ngIf="ready">
  <aside class="side" aria-label="Painel de administração">
    <div class="side-card">
      <span class="side-avatar">{{ initials }}</span>
      <div class="side-who"><strong>{{ nomeAdmin }}</strong><small>Administrador da plataforma</small></div>
    </div>
    <nav class="side-nav">
      <a *ngFor="let s of secoes" [routerLink]="[]" [queryParams]="{ secao: s.key }" [class.active]="secao === s.key" [attr.aria-current]="secao === s.key ? 'page' : null">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="s.icon"/></svg>
        <span>{{ s.label }}</span>
        <em *ngIf="badge(s.key) as b">{{ b }}</em>
      </a>
    </nav>
    <a class="side-cta" routerLink="/">Ver o site público <span aria-hidden="true">↗</span></a>
  </aside>

  <main class="main">
    <div class="toast" role="status" aria-live="polite" *ngIf="toastMsg">{{ toastMsg }}</div>

    <!-- VISÃO GERAL -->
    <ng-container *ngIf="secao === 'visao'">
      <header class="page-head">
        <div><p class="eyebrow">Visão geral</p><h1>Gestão da plataforma</h1><p class="muted">Acompanhem utilizadores, fornecedores e moderação num só lugar.</p></div>
      </header>

      <p class="alert warn" *ngIf="vazio">Ainda não há dados no painel. <button class="link" type="button" (click)="importarDispositivo()">Importar contas deste dispositivo</button> ou <button class="link" type="button" (click)="carregarDemo()">carregar dados de demonstração</button>.</p>

      <section class="hero-card">
        <div>
          <p class="eyebrow light">Receita mensal recorrente</p>
          <p class="count"><strong>{{ mt(mrr) }}</strong></p>
          <p class="hero-sub">{{ pagantes }} {{ pagantes === 1 ? 'fornecedor com plano pago' : 'fornecedores com plano pago' }} · {{ novosMes }} {{ novosMes === 1 ? 'novo registo' : 'novos registos' }} este mês</p>
        </div>
        <div class="hero-prog">
          <span>Fornecedores verificados</span>
          <div class="bar big"><i [style.width.%]="pct(aprovados, d.fornecedores.length)"></i></div>
          <strong>{{ pct(aprovados, d.fornecedores.length) }}%</strong>
        </div>
      </section>

      <div class="alerts" *ngIf="pendentes > 0 || denAbertas > 0 || d.config.manutencao">
        <p class="alert warn" *ngIf="pendentes > 0"><b>{{ pendentes }}</b> {{ pendentes === 1 ? 'fornecedor aguarda aprovação' : 'fornecedores aguardam aprovação' }}. <a [routerLink]="[]" [queryParams]="{ secao: 'aprovacoes' }">Rever</a></p>
        <p class="alert danger" *ngIf="denAbertas > 0"><b>{{ denAbertas }}</b> {{ denAbertas === 1 ? 'denúncia aberta' : 'denúncias abertas' }}. <a [routerLink]="[]" [queryParams]="{ secao: 'moderacao' }">Moderar</a></p>
        <p class="alert danger" *ngIf="d.config.manutencao">O modo de manutenção está ativo.<a [routerLink]="[]" [queryParams]="{ secao: 'definicoes' }">Alterar</a></p>
      </div>

      <section class="kpis">
        <article class="kpi"><span>Casais ativos</span><strong>{{ casaisAtivos }}<small>/{{ d.casais.length }}</small></strong><div class="bar"><i [style.width.%]="pct(casaisAtivos, d.casais.length)"></i></div></article>
        <article class="kpi"><span>Fornecedores aprovados</span><strong>{{ aprovados }}<small>/{{ d.fornecedores.length }}</small></strong><div class="bar"><i [style.width.%]="pct(aprovados, d.fornecedores.length)"></i></div></article>
        <article class="kpi"><span>Aprovações pendentes</span><strong [class.neg]="pendentes > 0">{{ pendentes }}</strong></article>
        <article class="kpi"><span>Denúncias abertas</span><strong [class.neg]="denAbertas > 0">{{ denAbertas }}<small>/{{ d.denuncias.length }}</small></strong></article>
      </section>

      <section class="grid2">
        <article class="card">
          <div class="card-head"><h2>Registos por mês</h2></div>
          <p class="empty" *ngIf="!d.casais.length && !d.fornecedores.length">Sem registos para mostrar.</p>
          <div class="cat" *ngFor="let m of registosMes">
            <div><span>{{ m.label }}</span><b>{{ m.casais }} casais · {{ m.forn }} fornecedores</b></div>
            <div class="bar"><i [style.width.%]="pct(m.casais, maxMes)"></i></div>
            <div class="bar alt"><i [style.width.%]="pct(m.forn, maxMes)"></i></div>
          </div>
          <ul class="legend inline"><li><i class="dot-a"></i>Casais</li><li><i class="dot-b"></i>Fornecedores</li></ul>
        </article>
        <article class="card">
          <div class="card-head"><h2>Fornecedores por categoria</h2><a [routerLink]="[]" [queryParams]="{ secao: 'categorias' }">Gerir</a></div>
          <p class="empty" *ngIf="!d.fornecedores.length">Ainda não há fornecedores.</p>
          <div class="cat" *ngFor="let c of porCategoria"><div><span>{{ c.nome }}</span><b>{{ c.n }}</b></div><div class="bar"><i [style.width.%]="pct(c.n, porCategoria[0].n)"></i></div></div>
        </article>
        <article class="card">
          <div class="card-head"><h2>Pedidos de aprovação</h2><a [routerLink]="[]" [queryParams]="{ secao: 'aprovacoes' }">Ver todos</a></div>
          <p class="empty" *ngIf="!listaPendentes.length">Sem aprovações pendentes.</p>
          <ul class="todo"><li *ngFor="let f of listaPendentes.slice(0,4)"><span><b>{{ f.nome }}</b><br><small>{{ f.categoria }} · {{ f.cidade || '—' }}</small></span><button class="btn mini" type="button" (click)="aprovar(f)">Aprovar</button></li></ul>
        </article>
        <article class="card">
          <div class="card-head"><h2>Atividade recente</h2><a [routerLink]="[]" [queryParams]="{ secao: 'atividade' }">Ver tudo</a></div>
          <p class="empty" *ngIf="!d.logs.length">Sem atividade registada.</p>
          <ul class="todo"><li *ngFor="let l of d.logs.slice(0,5)"><span>{{ l.acao }}</span><small>{{ hora(l.data) }}</small></li></ul>
        </article>
      </section>
    </ng-container>

    <!-- CASAIS -->
    <ng-container *ngIf="secao === 'casais'">
      <header class="page-head">
        <div><p class="eyebrow">Casais</p><h1>Gestão de casais</h1><p class="muted">{{ d.casais.length }} contas · {{ casaisAtivos }} ativas.</p></div>
        <button class="btn ghost" type="button" (click)="exportar('casais')" [disabled]="!d.casais.length">Exportar CSV</button>
      </header>
      <form class="card add" (ngSubmit)="addCasal()">
        <label class="grow">Nome do casal<input name="cn" [(ngModel)]="nc.nome" maxlength="80" placeholder="Ex.: João e Ana" required></label>
        <label>Email<input name="ce" type="email" [(ngModel)]="nc.email" maxlength="100" placeholder="nome@email.com" required></label>
        <label>Telefone<input name="ct" [(ngModel)]="nc.telefone" maxlength="20" placeholder="84 123 4567"></label>
        <label>Cidade<input name="cc" [(ngModel)]="nc.cidade" maxlength="40"></label>
        <label>Data do casamento<input name="cd" type="date" [(ngModel)]="nc.dataCasamento"></label>
        <button class="btn" type="submit">Adicionar</button>
      </form>
      <div class="toolbar">
        <input class="tsearch" type="search" [(ngModel)]="qCasal" placeholder="Pesquisar nome, email ou cidade…" aria-label="Pesquisar casais">
        <div class="filters"><button type="button" *ngFor="let f of fAtivo" [class.on]="fCasal === f.key" (click)="fCasal = f.key">{{ f.label }}</button></div>
      </div>
      <section class="card flush">
        <p class="empty pad" *ngIf="!casaisView.length">Nenhum casal encontrado.</p>
        <div class="table-wrap" *ngIf="casaisView.length">
          <table>
            <thead><tr><th>Casal</th><th>Cidade</th><th>Casamento</th><th>Registo</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              <tr *ngFor="let c of casaisView">
                <td><strong>{{ c.nome }}</strong><br><small class="sub">{{ c.email }}{{ c.telefone ? ' · ' + c.telefone : '' }}</small></td>
                <td>{{ c.cidade || '—' }}</td>
                <td>{{ c.dataCasamento ? dataCurta(c.dataCasamento) : '—' }}</td>
                <td>{{ dataCurta(c.registado) }}</td>
                <td><select class="cell sel" [ngClass]="c.estado" [(ngModel)]="c.estado" (ngModelChange)="mudouCasal(c)" [attr.aria-label]="'Estado de ' + c.nome"><option value="ativo">Ativo</option><option value="suspenso">Suspenso</option></select></td>
                <td class="acts">
                  <a class="icon-btn ok" [href]="'mailto:' + c.email" [attr.aria-label]="'Enviar email a ' + c.nome" title="Enviar email"><svg viewBox="0 0 24 24"><path d="M3 6h18v12H3zM3 7l9 6 9-6"/></svg></a>
                  <button class="icon-btn" type="button" (click)="removerCasal(c)" [attr.aria-label]="'Remover ' + c.nome"><svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </ng-container>

    <!-- FORNECEDORES -->
    <ng-container *ngIf="secao === 'fornecedores'">
      <header class="page-head">
        <div><p class="eyebrow">Fornecedores</p><h1>Gestão de fornecedores</h1><p class="muted">{{ d.fornecedores.length }} contas · {{ aprovados }} aprovadas · {{ destacados }} em destaque.</p></div>
        <button class="btn ghost" type="button" (click)="exportar('fornecedores')" [disabled]="!d.fornecedores.length">Exportar CSV</button>
      </header>
      <form class="card add" (ngSubmit)="addForn()">
        <label class="grow">Nome<input name="fn" [(ngModel)]="nf.nome" maxlength="60" placeholder="Empresa ou profissional" required></label>
        <label>Categoria<select name="fc" [(ngModel)]="nf.categoria"><option *ngFor="let c of categoriasAtivas" [value]="c.nome">{{ c.nome }}</option></select></label>
        <label>Cidade<input name="fci" [(ngModel)]="nf.cidade" maxlength="40"></label>
        <label>Email<input name="fe" type="email" [(ngModel)]="nf.email" maxlength="100" required></label>
        <label>Telefone<input name="ft" [(ngModel)]="nf.telefone" maxlength="20"></label>
        <button class="btn" type="submit">Adicionar</button>
      </form>
      <div class="toolbar">
        <input class="tsearch" type="search" [(ngModel)]="qForn" placeholder="Pesquisar nome, categoria ou cidade…" aria-label="Pesquisar fornecedores">
        <div class="filters"><button type="button" *ngFor="let f of fVerif" [class.on]="fForn === f.key" (click)="fForn = f.key">{{ f.label }}</button></div>
      </div>
      <section class="card flush">
        <p class="empty pad" *ngIf="!fornView.length">Nenhum fornecedor encontrado.</p>
        <div class="table-wrap" *ngIf="fornView.length">
          <table>
            <thead><tr><th>Fornecedor</th><th>Verificação</th><th>Plano</th><th>Destaque</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              <tr *ngFor="let f of fornView">
                <td><strong>{{ f.nome }}</strong><br><small class="sub">{{ f.categoria }} · {{ f.cidade || '—' }} · {{ f.email }}</small></td>
                <td>
                  <span class="pill" [ngClass]="classeVerif(f.verificacao)">{{ rotuloVerif(f.verificacao) }}</span>
                  <span class="quick" *ngIf="f.verificacao !== 'aprovado'"><button type="button" (click)="aprovar(f)">Aprovar</button></span>
                </td>
                <td><select class="cell sel plain" [(ngModel)]="f.plano" (ngModelChange)="mudouForn(f, 'plano')" [attr.aria-label]="'Plano de ' + f.nome"><option *ngFor="let p of d.planos" [value]="p.id">{{ p.nome }}</option></select></td>
                <td><button type="button" class="star" [class.on]="f.destaque" (click)="destacar(f)" [attr.aria-pressed]="f.destaque" [attr.aria-label]="f.destaque ? 'Remover destaque de ' + f.nome : 'Destacar ' + f.nome">★</button></td>
                <td><select class="cell sel" [ngClass]="f.estado" [(ngModel)]="f.estado" (ngModelChange)="mudouForn(f, 'estado')" [attr.aria-label]="'Estado de ' + f.nome"><option value="ativo">Ativo</option><option value="suspenso">Suspenso</option></select></td>
                <td class="acts">
                  <a class="icon-btn ok" [href]="'mailto:' + f.email" [attr.aria-label]="'Enviar email a ' + f.nome" title="Enviar email"><svg viewBox="0 0 24 24"><path d="M3 6h18v12H3zM3 7l9 6 9-6"/></svg></a>
                  <button class="icon-btn" type="button" (click)="removerForn(f)" [attr.aria-label]="'Remover ' + f.nome"><svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </ng-container>

    <!-- APROVAÇÕES -->
    <ng-container *ngIf="secao === 'aprovacoes'">
      <header class="page-head">
        <div><p class="eyebrow">Aprovações</p><h1>Fornecedores por verificar</h1><p class="muted">{{ pendentes }} {{ pendentes === 1 ? 'pedido pendente' : 'pedidos pendentes' }}. Apenas fornecedores aprovados aparecem no marketplace.</p></div>
        <button class="btn ghost" type="button" (click)="aprovarTodos()" [disabled]="!listaPendentes.length">Aprovar todos</button>
      </header>
      <p class="empty" *ngIf="!listaPendentes.length">Tudo em dia. Não há fornecedores a aguardar aprovação.</p>
      <section class="cards3 wide">
        <article class="card forn" *ngFor="let f of listaPendentes">
          <div class="card-head"><div><h2>{{ f.nome }}</h2><small>{{ f.categoria }} · {{ f.cidade || '—' }}</small></div><span class="pill" [ngClass]="classeVerif(f.verificacao)">{{ rotuloVerif(f.verificacao) }}</span></div>
          <p class="forn-line"><span>Email</span>{{ f.email }}</p>
          <p class="forn-line"><span>Telefone</span>{{ f.telefone || '—' }}</p>
          <p class="forn-line"><span>Registo</span>{{ dataCurta(f.registado) }}</p>
          <label>Motivo da rejeição (opcional)<input [(ngModel)]="f.motivo" maxlength="120" placeholder="Ex.: Dados incompletos"></label>
          <div class="btns"><button class="btn" type="button" (click)="aprovar(f)">Aprovar</button><button class="btn danger" type="button" (click)="rejeitar(f)">Rejeitar</button></div>
        </article>
      </section>
    </ng-container>

    <!-- CATEGORIAS -->
    <ng-container *ngIf="secao === 'categorias'">
      <header class="page-head"><div><p class="eyebrow">Categorias</p><h1>Categorias do marketplace</h1><p class="muted">{{ categoriasAtivas.length }} ativas de {{ d.categorias.length }}.</p></div></header>
      <form class="card add" (ngSubmit)="addCategoria()">
        <label class="grow">Nova categoria<input name="kn" [(ngModel)]="nk" maxlength="40" placeholder="Ex.: Convites e papelaria" required></label>
        <button class="btn" type="submit">Adicionar</button>
      </form>
      <section class="card flush">
        <ul class="rows">
          <li *ngFor="let c of d.categorias">
            <div class="row-main"><input class="cell name" [(ngModel)]="c.nome" (ngModelChange)="save()" maxlength="40" [attr.aria-label]="'Nome da categoria'"><small>{{ contarCat(c.nome) }} {{ contarCat(c.nome) === 1 ? 'fornecedor' : 'fornecedores' }}</small></div>
            <label class="switch"><input type="checkbox" [(ngModel)]="c.ativa" (ngModelChange)="save()"><span></span>{{ c.ativa ? 'Ativa' : 'Oculta' }}</label>
            <button class="icon-btn" type="button" (click)="removerCategoria(c)" [attr.aria-label]="'Remover ' + c.nome"><svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg></button>
          </li>
        </ul>
      </section>
    </ng-container>

    <!-- MODERAÇÃO -->
    <ng-container *ngIf="secao === 'moderacao'">
      <header class="page-head"><div><p class="eyebrow">Moderação</p><h1>Denúncias e conteúdos</h1><p class="muted">{{ denAbertas }} {{ denAbertas === 1 ? 'denúncia aberta' : 'denúncias abertas' }} de {{ d.denuncias.length }}.</p></div></header>
      <form class="card add" (ngSubmit)="addDenuncia()">
        <label>Alvo<input name="dal" [(ngModel)]="ndn.alvo" maxlength="80" placeholder="Nome do fornecedor, casal…" required></label>
        <label>Tipo<select name="dt" [(ngModel)]="ndn.tipo"><option>Fornecedor</option><option>Casal</option><option>Avaliação</option><option>Mensagem</option></select></label>
        <label class="grow">Motivo<input name="dm" [(ngModel)]="ndn.motivo" maxlength="200" placeholder="Descrição da denúncia" required></label>
        <label>Reportado por<input name="dau" [(ngModel)]="ndn.autor" maxlength="60"></label>
        <button class="btn" type="submit">Registar</button>
      </form>
      <div class="filters"><button type="button" *ngFor="let f of fDen" [class.on]="fDenSel === f.key" (click)="fDenSel = f.key">{{ f.label }}</button></div>
      <section class="card flush">
        <p class="empty pad" *ngIf="!denView.length">Nenhuma denúncia nesta vista.</p>
        <div class="table-wrap" *ngIf="denView.length">
          <table>
            <thead><tr><th>Alvo</th><th>Motivo</th><th>Data</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              <tr *ngFor="let x of denView">
                <td><strong>{{ x.alvo }}</strong><br><small class="sub">{{ x.tipo }} · por {{ x.autor || 'anónimo' }}</small></td>
                <td class="wrap">{{ x.motivo }}</td>
                <td>{{ dataCurta(x.data) }}</td>
                <td><select class="cell sel" [ngClass]="x.estado" [(ngModel)]="x.estado" (ngModelChange)="mudouDen(x)" [attr.aria-label]="'Estado da denúncia sobre ' + x.alvo"><option value="aberta">Aberta</option><option value="analise">Em análise</option><option value="resolvida">Resolvida</option><option value="arquivada">Arquivada</option></select></td>
                <td class="acts">
                  <button class="btn mini danger" type="button" *ngIf="x.estado !== 'resolvida' && alvoExiste(x.alvo)" (click)="suspenderAlvo(x)">Suspender conta</button>
                  <button class="icon-btn" type="button" (click)="removerDen(x)" [attr.aria-label]="'Remover denúncia sobre ' + x.alvo"><svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </ng-container>

    <!-- COMUNICADOS -->
    <ng-container *ngIf="secao === 'comunicados'">
      <header class="page-head"><div><p class="eyebrow">Comunicados</p><h1>Avisos aos utilizadores</h1><p class="muted">Publiquem novidades para casais, fornecedores ou todos.</p></div></header>
      <form class="card settings" (ngSubmit)="addComunicado()">
        <div class="fields">
          <label>Título<input name="mt" [(ngModel)]="ncm.titulo" maxlength="80" required></label>
          <label>Destinatários<select name="mp" [(ngModel)]="ncm.publico"><option value="todos">Todos</option><option value="casais">Casais</option><option value="fornecedores">Fornecedores</option></select></label>
        </div>
        <label style="margin-bottom:18px">Mensagem<textarea class="notes" name="mx" rows="4" [(ngModel)]="ncm.texto" maxlength="500" required></textarea></label>
        <button class="btn" type="submit">Publicar comunicado</button>
      </form>
      <p class="empty" *ngIf="!d.comunicados.length">Ainda não publicaram comunicados.</p>
      <section class="cards3 wide">
        <article class="card" *ngFor="let c of d.comunicados">
          <div class="card-head"><div><h2>{{ c.titulo }}</h2><small>{{ dataCurta(c.data) }}</small></div><span class="pill info">{{ rotuloPublico(c.publico) }}</span></div>
          <p class="muted">{{ c.texto }}</p>
          <div class="btns"><button class="btn danger" type="button" (click)="removerComunicado(c)">Remover</button></div>
        </article>
      </section>
    </ng-container>

    <!-- FINANÇAS -->
    <ng-container *ngIf="secao === 'financas'">
      <header class="page-head"><div><p class="eyebrow">Finanças</p><h1>Planos e receita</h1><p class="muted">Valores em meticais (MT), com base nos fornecedores aprovados e ativos.</p></div></header>
      <section class="kpis">
        <article class="kpi"><span>Receita mensal (MRR)</span><strong>{{ mt(mrr) }}</strong></article>
        <article class="kpi"><span>Receita anual prevista</span><strong>{{ mt(mrr * 12) }}</strong></article>
        <article class="kpi"><span>Fornecedores pagantes</span><strong>{{ pagantes }}<small>/{{ ativosPagaveis }}</small></strong><div class="bar"><i [style.width.%]="pct(pagantes, ativosPagaveis)"></i></div></article>
        <article class="kpi"><span>Receita média por fornecedor</span><strong>{{ mt(arpu) }}</strong></article>
      </section>
      <section class="grid2">
        <article class="card">
          <div class="card-head"><h2>Planos</h2></div>
          <ul class="rows tight">
            <li *ngFor="let p of d.planos">
              <div class="row-main"><input class="cell name" [(ngModel)]="p.nome" (ngModelChange)="save()" maxlength="30" [attr.aria-label]="'Nome do plano'"><small>{{ contarPlano(p.id) }} fornecedores</small></div>
              <input class="cell price" type="number" min="0" [(ngModel)]="p.preco" (ngModelChange)="save()" [attr.aria-label]="'Preço de ' + p.nome">
              <label class="switch"><input type="checkbox" [(ngModel)]="p.ativo" (ngModelChange)="save()"><span></span></label>
            </li>
          </ul>
          <form class="add-inline" (ngSubmit)="addPlano()"><input name="pn" [(ngModel)]="npl.nome" maxlength="30" placeholder="Novo plano" aria-label="Nome do novo plano"><input name="pp" type="number" min="0" [(ngModel)]="npl.preco" aria-label="Preço mensal"><button class="btn" type="submit">Adicionar</button></form>
        </article>
        <article class="card">
          <div class="card-head"><h2>Receita por plano</h2></div>
          <div class="cat" *ngFor="let p of receitaPlanos"><div><span>{{ p.nome }}</span><b>{{ mt(p.valor) }}</b></div><div class="bar"><i [style.width.%]="pct(p.valor, maxPlano)"></i></div></div>
          <p class="muted" style="margin-top:14px">Comissão por reserva configurada: <b>{{ d.config.comissao }}%</b>.</p>
        </article>
      </section>
    </ng-container>

    <!-- ATIVIDADE -->
    <ng-container *ngIf="secao === 'atividade'">
      <header class="page-head">
        <div><p class="eyebrow">Atividade</p><h1>Registo de ações</h1><p class="muted">Histórico das últimas ações de administração.</p></div>
        <button class="btn ghost" type="button" (click)="limparLogs()" [disabled]="!d.logs.length">Limpar registo</button>
      </header>
      <section class="card flush">
        <p class="empty pad" *ngIf="!d.logs.length">Sem ações registadas.</p>
        <ul class="rows tight"><li *ngFor="let l of d.logs" style="padding:12px 20px"><div class="row-main"><strong>{{ l.acao }}</strong></div><small class="sub">{{ hora(l.data) }}</small></li></ul>
      </section>
    </ng-container>

    <!-- DEFINIÇÕES -->
    <ng-container *ngIf="secao === 'definicoes'">
      <header class="page-head"><div><p class="eyebrow">Definições</p><h1>Configuração da plataforma</h1></div></header>
      <form class="card settings" (ngSubmit)="guardarConfig()">
        <h2>Geral</h2>
        <div class="fields">
          <label>Nome da plataforma<input name="gn" [(ngModel)]="cfg.nome" maxlength="60" required></label>
          <label>Email de suporte<input name="ge" type="email" [(ngModel)]="cfg.emailSuporte" maxlength="100"></label>
          <label>Comissão por reserva (%)<input name="gc" type="number" min="0" max="100" [(ngModel)]="cfg.comissao"></label>
        </div>
        <label class="switch"><input type="checkbox" name="g1" [(ngModel)]="cfg.registosAbertos"><span></span>Permitir novos registos</label>
        <label class="switch"><input type="checkbox" name="g2" [(ngModel)]="cfg.aprovacaoManual"><span></span>Exigir aprovação manual de fornecedores</label>
        <label class="switch"><input type="checkbox" name="g3" [(ngModel)]="cfg.manutencao"><span></span>Modo de manutenção</label>
        <div class="btns"><button class="btn" type="submit">Guardar alterações</button></div>
      </form>
      <section class="card settings">
        <h2>Conta de administrador</h2>
        <p class="forn-line"><span>Email</span>{{ email }}</p>
        <p class="forn-line"><span>Perfil</span>Administrador</p>
      </section>
      <section class="card settings">
        <h2>Dados</h2>
        <p class="muted">Os dados deste painel ficam guardados neste dispositivo.</p>
        <div class="btns">
          <button class="btn ghost" type="button" (click)="importarDispositivo()">Importar contas do dispositivo</button>
          <button class="btn ghost" type="button" (click)="carregarDemo()">Carregar dados de demonstração</button>
          <button class="btn ghost" type="button" (click)="exportarTudo()">Exportar JSON</button>
          <button class="btn danger" type="button" (click)="repor()">Repor painel</button>
          <button class="btn" type="button" (click)="logout()">Terminar sessão</button>
        </div>
      </section>
    </ng-container>
  </main>
</div>
`,
  styles: [`:host{display:flex;flex-direction:column;min-height:100vh;background:#f6f8fa;color:#000;font-family:Inter,Arial,sans-serif}
*{box-sizing:border-box}
a{text-decoration:none;color:inherit}
.shell{flex:1;display:grid;grid-template-columns:268px minmax(0,1fr);max-width:1440px;width:100%;margin:0 auto}
.side{position:sticky;top:76px;align-self:start;height:calc(100vh - 76px);display:flex;flex-direction:column;gap:18px;padding:24px 18px;background:#fff;border-right:1px solid #e3e8ed;overflow-y:auto}
.side-card{display:flex;align-items:center;gap:12px;padding:12px;border:1px solid #e3e8ed;border-radius:4px;background:#f6f8fa}
.side-avatar{display:grid;place-items:center;flex:none;width:42px;height:42px;border-radius:50%;background:#0b4870;color:#fff;font-size:13px;font-weight:600}
.side-who{display:grid;gap:2px;min-width:0}.side-who strong{font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.side-who small{font-size:12px;color:#5b6b78}
.side-nav{display:grid;gap:2px}
.side-nav a{display:flex;align-items:center;gap:12px;padding:11px 12px;border-radius:4px;font-size:13.5px;font-weight:500;color:#26323c;transition:background .15s,color .15s}
.side-nav a:hover{background:#eef4f8}
.side-nav a.active{background:#0b4870;color:#fff}
.side-nav svg{width:18px;height:18px;flex:none;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.side-nav em{margin-left:auto;font-style:normal;font-size:11px;font-weight:700;background:#e3edf4;color:#0b4870;border-radius:999px;padding:2px 8px}
.side-nav a.active em{background:rgba(255,255,255,.2);color:#fff}
.side-cta{margin-top:auto;padding:13px 14px;border:1px solid #0b4870;border-radius:4px;color:#0b4870;font-size:13px;font-weight:600;text-align:center;transition:background .15s}
.side-cta:hover{background:#eef4f8}
.main{padding:32px clamp(18px,3vw,40px) 80px;min-width:0;position:relative}
.toast{position:fixed;right:24px;bottom:24px;z-index:50;background:#0b4870;color:#fff;font-size:13px;font-weight:500;padding:12px 18px;border-radius:4px;box-shadow:0 10px 30px rgba(0,0,0,.25);animation:in .2s ease-out}
@keyframes in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.page-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:24px}
.eyebrow{margin:0;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:700}
.eyebrow.light{color:rgba(255,255,255,.8)}
h1{font:500 clamp(26px,3.4vw,36px) Inter,sans-serif;letter-spacing:-.4px;margin:10px 0 6px}
h2{font:600 16px Inter,sans-serif;margin:0}
.muted{color:#4a5864;font-size:14px;line-height:1.6;margin:0}
.btn{display:inline-flex;align-items:center;justify-content:center;height:44px;padding:0 20px;border:1px solid #0b4870;border-radius:4px;background:#0b4870;color:#fff;font:600 13px Inter,Arial,sans-serif;cursor:pointer;white-space:nowrap;transition:background .15s}
.btn:hover{background:#093a5b}.btn:disabled{opacity:.5;cursor:default}
.btn.ghost{background:#fff;color:#0b4870}.btn.ghost:hover{background:#eef4f8}
.btn.light{background:#fff;color:#0b4870;border-color:#fff;margin-top:14px}
.btn.danger{background:#fff;color:#a12c2c;border-color:#a12c2c}.btn.danger:hover{background:#fbe9e9}
.card{background:#fff;border:1px solid #e3e8ed;border-radius:4px;padding:22px;box-shadow:0 2px 14px rgba(0,0,0,.05);margin-bottom:18px}
.card.flush{padding:0;overflow:hidden}
.card-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
.card-head a{font-size:12.5px;font-weight:600;color:#0b4870}.card-head a:hover{text-decoration:underline}
.card-head small{display:block;color:#5b6b78;font-size:12px;margin-top:3px}
.empty{color:#5b6b78;font-size:13.5px;margin:6px 0 14px}.empty.pad{padding:26px 22px;margin:0}
.hero-card{display:flex;align-items:center;justify-content:space-between;gap:28px;flex-wrap:wrap;padding:30px 32px;margin-bottom:18px;border-radius:4px;color:#fff;background:linear-gradient(120deg,#0b4870,#13638f);box-shadow:0 8px 28px rgba(11,72,112,.25)}
.count{margin:8px 0 4px;font-size:18px}.count strong{font-size:clamp(46px,7vw,72px);font-weight:500;letter-spacing:-2px;line-height:1}
.hero-sub{margin:0;font-size:14px;color:rgba(255,255,255,.88)}.hero-sub.big{font-size:20px;margin-top:10px}
.hero-prog{display:grid;gap:8px;min-width:240px;flex:1;max-width:360px;font-size:13px}.hero-prog strong{font-size:24px;font-weight:600}
.bar{height:8px;background:#e8edf1;border-radius:99px;overflow:hidden}.bar i{display:block;height:100%;background:#0b4870;border-radius:99px;transition:width .4s ease}
.bar.big{height:10px;background:rgba(255,255,255,.25)}.bar.big i{background:#fff}
.bar.over i{background:#a12c2c}
.alerts{display:grid;gap:10px;margin-bottom:18px}
.alert{margin:0;padding:12px 16px;border-radius:4px;font-size:13.5px;border:1px solid}
.alert a{font-weight:600;text-decoration:underline;margin-left:6px}
.alert.warn{background:#fdf6e3;border-color:#efd9a3;color:#6b4a00}.alert.danger{background:#fbe9e9;border-color:#e9bcbc;color:#8a2323}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:18px}.kpis.three{grid-template-columns:repeat(3,1fr)}
.kpi{display:grid;gap:8px;align-content:start;background:#fff;border:1px solid #e3e8ed;border-radius:4px;padding:18px 20px;box-shadow:0 2px 14px rgba(0,0,0,.05)}
.kpi>span{font-size:12.5px;color:#4a5864;font-weight:500}.kpi strong{font-size:26px;font-weight:600;letter-spacing:-.5px}.kpi strong small{font-size:15px;color:#5b6b78;font-weight:500}
.kpi-note{font-size:12px;color:#5b6b78}.kpi-input{width:100%;height:40px;padding:0 10px;border:1px solid #d5dce3;border-radius:4px;font:600 20px Inter,sans-serif}
.neg{color:#a12c2c}
.grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.grid2 .card{margin:0}
.todo,.rows,.legend,.chips{list-style:none;margin:0;padding:0}
.todo li{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 0;border-top:1px solid #eef1f4;font-size:13.5px}.todo li:first-child{border-top:0}
.todo label{display:flex;align-items:center;gap:10px;cursor:pointer}.todo input{accent-color:#0b4870;width:17px;height:17px}
.todo small{color:#5b6b78;font-size:12px;white-space:nowrap}.late{color:#a12c2c!important;font-weight:600}
.cat{margin-bottom:12px}.cat>div:first-child{display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px}
.stack{display:flex;height:14px;border-radius:99px;overflow:hidden;background:#e8edf1;margin:8px 0 14px}.stack i{display:block}
.s-ok{background:#2f9e68}.s-pen{background:#e2a526}.s-no{background:#c24b4b}
.legend li{display:flex;align-items:center;gap:10px;padding:6px 0;font-size:13.5px}.legend i{width:10px;height:10px;border-radius:50%}.legend b{margin-left:auto}
.notes{width:100%;padding:12px;border:1px solid #d5dce3;border-radius:4px;font:inherit;font-size:13.5px;resize:vertical;line-height:1.6}
.notes:focus,input:focus,select:focus{outline:none;border-color:#0b4870;box-shadow:0 0 0 3px rgba(11,72,112,.14)}
.add{display:flex;align-items:flex-end;gap:14px;flex-wrap:wrap}
label{display:grid;gap:7px;font-size:12.5px;font-weight:500;color:#26323c}.add label{min-width:140px}.add .grow{flex:1;min-width:200px}.add .narrow{min-width:90px;max-width:120px}
input,select{width:100%;height:44px;padding:0 12px;border:1px solid #d5dce3;border-radius:4px;background:#fff;font:inherit;font-size:13.5px;color:#000;transition:border-color .15s,box-shadow .15s}
.filters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
.filters button{height:36px;padding:0 15px;border:1px solid #d5dce3;border-radius:999px;background:#fff;font:500 12.5px Inter,sans-serif;cursor:pointer;transition:all .15s}
.filters button:hover{border-color:#0b4870}.filters button.on{background:#0b4870;border-color:#0b4870;color:#fff}
.toolbar{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:14px}.toolbar .filters{margin:0}.tsearch{max-width:300px}
.rows li{display:flex;align-items:center;gap:14px;padding:14px 20px;border-top:1px solid #eef1f4}.rows li:first-child{border-top:0}
.rows.tight li{padding:12px 0}
.row-main{display:grid;gap:3px;flex:1;min-width:0}.row-main strong{font-size:14px;font-weight:600}.row-main small{font-size:12px;color:#5b6b78}
.rows li.done .row-main strong{text-decoration:line-through;color:#7a8791}
.chk input{position:absolute;opacity:0;width:0;height:0}.chk span{display:grid;place-items:center;width:22px;height:22px;border:2px solid #b8c3cc;border-radius:4px;cursor:pointer;transition:all .15s}
.chk input:checked+span{background:#0b4870;border-color:#0b4870}.chk input:checked+span::after{content:'';width:5px;height:10px;border:solid #fff;border-width:0 2px 2px 0;transform:rotate(45deg) translate(-1px,-1px)}
.chk input:focus-visible+span{box-shadow:0 0 0 3px rgba(11,72,112,.25)}
.pill{display:inline-block;padding:4px 11px;border-radius:999px;font-size:11.5px;font-weight:600;white-space:nowrap}
.pill.ok{background:#e4f4ec;color:#1d6d46}.pill.pen{background:#fdf1d8;color:#7a5200}.pill.no{background:#fbe9e9;color:#a12c2c}
.icon-btn{display:grid;place-items:center;flex:none;width:34px;height:34px;border:0;border-radius:4px;background:transparent;cursor:pointer;color:#5b6b78;transition:background .15s,color .15s}
.icon-btn:hover{background:#fbe9e9;color:#a12c2c}.icon-btn svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.table-wrap{overflow-x:auto}table{width:100%;border-collapse:collapse;font-size:13.5px;min-width:640px}
th{text-align:left;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#5b6b78;font-weight:700;padding:13px 16px;background:#f6f8fa;border-bottom:1px solid #e3e8ed}
td{padding:12px 16px;border-bottom:1px solid #eef1f4;vertical-align:middle}tbody tr:hover{background:#fafcfd}
th.num,td.num{text-align:right}tfoot td{font-weight:700;background:#f6f8fa;border-bottom:0}
.cell{height:36px;font-size:13px;padding:0 8px;max-width:140px}td.num .cell{text-align:right;max-width:130px}
.sel{max-width:160px;font-weight:600}.sel.confirmado,.sel.pago{background:#e4f4ec;color:#1d6d46;border-color:#bfe3cf}.sel.pendente,.sel.contactado{background:#fdf1d8;color:#7a5200;border-color:#f0dba4}.sel.recusado{background:#fbe9e9;color:#a12c2c;border-color:#ecc3c3}.sel.reservado{background:#e3edf4;color:#0b4870;border-color:#bcd2e1}
.tables,.cards3{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px;margin-bottom:18px}.tables .card,.cards3 .card{margin:0}
.occ{margin:0 0 8px;font-size:13px;color:#4a5864}.occ b{font-size:20px;color:#000}.occ b.neg{color:#a12c2c}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}.chips li{display:flex;align-items:center;gap:6px;padding:5px 6px 5px 11px;border-radius:999px;background:#eef4f8;font-size:12.5px}.chips li.none{background:none;color:#7a8791;padding:0}.chips small{color:#5b6b78}
.chips button{width:20px;height:20px;border:0;border-radius:50%;background:#d6e3ec;cursor:pointer;line-height:1;color:#0b4870}.chips button:hover{background:#a12c2c;color:#fff}
.forn{display:grid;gap:10px}.forn .card-head{margin:0}.forn-line{display:flex;justify-content:space-between;gap:12px;margin:0;padding:8px 0;border-top:1px solid #eef1f4;font-size:13.5px}.forn-line span{color:#5b6b78}
.timeline{list-style:none;margin:0;padding:0;display:grid;gap:12px;position:relative}
.timeline li{display:flex;align-items:center;gap:18px;background:#fff;border:1px solid #e3e8ed;border-left:4px solid #0b4870;border-radius:4px;padding:14px 18px;box-shadow:0 2px 14px rgba(0,0,0,.05)}
.timeline time{font-size:18px;font-weight:600;color:#0b4870;min-width:58px}.timeline div{flex:1;display:grid;gap:3px}.timeline small{color:#5b6b78;font-size:12.5px}
.settings h2{margin-bottom:14px}.fields{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-bottom:20px}.btns{display:flex;gap:12px;flex-wrap:wrap;margin-top:16px}
a:focus-visible,button:focus-visible{outline:2px solid #0b4870;outline-offset:2px}
@media(max-width:1000px){.kpis{grid-template-columns:repeat(2,1fr)}.grid2{grid-template-columns:1fr}}
@media(max-width:860px){
  .shell{grid-template-columns:1fr}
  .side{position:static;height:auto;flex-direction:column;gap:12px;padding:14px;border-right:0;border-bottom:1px solid #e3e8ed}
  .side-card,.side-cta{display:none}
  .side-nav{display:flex;overflow-x:auto;gap:6px;padding-bottom:4px}
  .side-nav a{white-space:nowrap;padding:10px 14px}
  .fields{grid-template-columns:1fr}
}
@media(max-width:560px){.kpis,.kpis.three{grid-template-columns:1fr}.hero-card{padding:24px 20px}.add label{min-width:100%}.add .narrow{max-width:none}.toast{left:16px;right:16px}}
.sub{color:#5b6b78;font-size:12px}
.acts{white-space:nowrap;text-align:right}.acts .icon-btn{display:inline-grid;vertical-align:middle}.icon-btn.ok:hover{background:#e4f4ec;color:#1d6d46}
.pill.info{background:#e3edf4;color:#0b4870}
.sel.novo{background:#e3edf4;color:#0b4870;border-color:#bcd2e1}.sel.respondido{background:#fdf1d8;color:#7a5200;border-color:#f0dba4}.sel.orcamentado{background:#ece7f6;color:#4b3a8a;border-color:#d3c9ec}.sel.confirmado{background:#e4f4ec;color:#1d6d46;border-color:#bfe3cf}.sel.recusado{background:#fbe9e9;color:#a12c2c;border-color:#ecc3c3}
.stars{color:#e2a526;letter-spacing:2px;font-size:15px}
.agenda{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:18px;margin-bottom:18px;align-items:start}.agenda .card{margin:0}
.cal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}.cal-head h2{text-transform:capitalize}
.cal{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}
.wd{text-align:center;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#5b6b78;padding:6px 0}
.day{position:relative;aspect-ratio:1/.9;display:grid;place-items:center;border:1px solid #e3e8ed;border-radius:4px;background:#fff;font:500 13.5px Inter,sans-serif;cursor:pointer;transition:all .15s}
.day:hover{border-color:#0b4870;background:#eef4f8}.day.out{color:#b3bcc4;background:#fafbfc}
.day.today{border-color:#e2a526;box-shadow:inset 0 0 0 1px #e2a526}.day.sel{background:#0b4870;color:#fff;border-color:#0b4870}
.day.block{background:#fbe9e9;color:#a12c2c;border-color:#ecc3c3}.day.block.sel{background:#a12c2c;color:#fff}
.day i{position:absolute;bottom:6px;width:6px;height:6px;border-radius:50%;background:#2f9e68}.day.sel i{background:#fff}
.legend.inline{display:flex;gap:18px;margin-top:14px}.legend.inline li{padding:0;font-size:12.5px}
.switch{display:flex;align-items:center;gap:12px;font-size:13.5px;cursor:pointer;padding:8px 0}
.switch input{position:absolute;opacity:0;width:0;height:0}.switch span{position:relative;flex:none;width:40px;height:22px;border-radius:99px;background:#c5cfd7;transition:background .2s}
.switch span::after{content:'';position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .2s}
.switch input:checked+span{background:#0b4870}.switch input:checked+span::after{transform:translateX(18px)}.switch input:focus-visible+span{box-shadow:0 0 0 3px rgba(11,72,112,.25)}
.forn.off{opacity:.6}.cards3.wide{grid-template-columns:repeat(auto-fill,minmax(320px,1fr))}
.preview{display:grid;gap:10px;position:sticky;top:96px}
@media(max-width:1000px){.agenda{grid-template-columns:1fr}.preview{position:static}}
.link{border:0;background:none;color:inherit;font:inherit;font-weight:700;text-decoration:underline;cursor:pointer;padding:0}
.btn.mini{height:32px;padding:0 12px;font-size:12px}
.sel.ativo,.sel.aprovado,.sel.resolvida{background:#e4f4ec;color:#1d6d46;border-color:#bfe3cf}
.sel.suspenso,.sel.rejeitado,.sel.aberta{background:#fbe9e9;color:#a12c2c;border-color:#ecc3c3}
.sel.analise{background:#fdf1d8;color:#7a5200;border-color:#f0dba4}.sel.arquivada{background:#eef1f4;color:#4a5864;border-color:#d5dce3}
.sel.plain{background:#fff;color:#000;border-color:#d5dce3;font-weight:500}
.quick{margin-left:8px}.quick button{border:0;background:none;color:#0b4870;font-size:12px;font-weight:600;cursor:pointer;padding:0}.quick button:hover{text-decoration:underline}
.star{border:0;background:none;font-size:20px;color:#c5cfd7;cursor:pointer;padding:4px;transition:color .15s}.star:hover{color:#e2a526}.star.on{color:#e2a526}
td.wrap{max-width:280px;white-space:normal}
.bar.alt{margin-top:5px}.bar.alt i{background:#e2a526}
.dot-a{background:#0b4870}.dot-b{background:#e2a526}
.cell.name{max-width:none;width:100%;font-weight:600;font-size:14px}.cell.price{width:120px;text-align:right}
.add-inline{display:flex;gap:10px;margin-top:14px}.add-inline input:first-child{flex:1}.add-inline input[type=number]{width:110px}
.rows li .switch{padding:0;white-space:nowrap}
`]
})
export class DashboardAdminComponent implements OnDestroy {
  ready = false;
  secao: Secao = 'visao';
  email = '';
  nomeAdmin = 'Administrador';
  initials = '';
  toastMsg = '';
  private toastTimer?: ReturnType<typeof setTimeout>;
  private sub?: Subscription;
  private key = 'elace_admin';

  d: Dados = this.base();
  cfg: Config = { ...this.d.config };

  readonly secoes: { key: Secao; label: string; icon: string }[] = [
    { key: 'visao', label: 'Visão geral', icon: 'M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10' },
    { key: 'casais', label: 'Casais', icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8' },
    { key: 'fornecedores', label: 'Fornecedores', icon: 'M20 7h-4V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zM10 5h4v2h-4z' },
    { key: 'aprovacoes', label: 'Aprovações', icon: 'M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9' },
    { key: 'categorias', label: 'Categorias', icon: 'M4 6h16M4 12h16M4 18h10' },
    { key: 'moderacao', label: 'Moderação', icon: 'M12 3l8 3v6c0 4.5-3.2 8.3-8 9-4.8-.7-8-4.5-8-9V6l8-3zM12 8v5M12 16h.01' },
    { key: 'comunicados', label: 'Comunicados', icon: 'M3 11v2a1 1 0 0 0 1 1h3l5 4V6L7 10H4a1 1 0 0 0-1 1zM16 8a5 5 0 0 1 0 8' },
    { key: 'financas', label: 'Finanças', icon: 'M12 2v20M17 6.5C17 4.6 14.8 3.5 12 3.5S7 4.6 7 6.5 9.2 9.5 12 10s5 1.6 5 3.5-2.2 3-5 3-5-1.1-5-3' },
    { key: 'atividade', label: 'Atividade', icon: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z' },
    { key: 'definicoes', label: 'Definições', icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM4 12h2M18 12h2M12 4v2M12 18v2' }
  ];
  readonly fAtivo = [{ key: 'todos', label: 'Todos' }, { key: 'ativo', label: 'Ativos' }, { key: 'suspenso', label: 'Suspensos' }];
  readonly fVerif = [{ key: 'todos', label: 'Todos' }, { key: 'pendente', label: 'Pendentes' }, { key: 'aprovado', label: 'Aprovados' }, { key: 'rejeitado', label: 'Rejeitados' }, { key: 'suspenso', label: 'Suspensos' }];
  readonly fDen = [{ key: 'todas', label: 'Todas' }, { key: 'aberta', label: 'Abertas' }, { key: 'analise', label: 'Em análise' }, { key: 'resolvida', label: 'Resolvidas' }, { key: 'arquivada', label: 'Arquivadas' }];

  qCasal = ''; fCasal = 'todos'; qForn = ''; fForn = 'todos'; fDenSel = 'todas'; nk = '';
  nc = { nome: '', email: '', telefone: '', cidade: '', dataCasamento: '' };
  nf = { nome: '', categoria: '', cidade: '', email: '', telefone: '' };
  ndn = { alvo: '', tipo: 'Fornecedor', motivo: '', autor: '' };
  ncm = { titulo: '', texto: '', publico: 'todos' };
  npl = { nome: '', preco: 0 };

  constructor(private route: ActivatedRoute, private router: Router) {
    const u = this.sessao();
    if (!u) { this.router.navigate(['/login']); return; }
    if (u.tipo !== 'admin') { this.router.navigate([u.tipo === 'fornecedor' ? '/dashboard-fornecedor' : '/dashboard']); return; }
    this.email = String(u.email || '');
    this.nomeAdmin = String(u.nome || '').trim() || 'Administrador';
    const w = this.nomeAdmin.split(/\s+/).filter(Boolean);
    this.initials = ((w[0] || 'A').charAt(0) + (w[1] ? w[1].charAt(0) : '')).toUpperCase();
    this.carregar();
    this.ready = true;
    const porDefeito = this.route.snapshot.data['secao'] as Secao | undefined;
    this.sub = this.route.queryParamMap.subscribe(p => {
      const s = (p.get('secao') || porDefeito) as Secao | null;
      this.secao = s && this.secoes.some(x => x.key === s) ? s : 'visao';
      this.cfg = { ...this.d.config };
      window.scrollTo({ top: 0 });
    });
  }
  ngOnDestroy() { this.sub?.unsubscribe(); if (this.toastTimer) clearTimeout(this.toastTimer); }

  /* ---------- Sessão e persistência ---------- */
  private sessao(): any { try { const r = localStorage.getItem('elace_user'); return r ? JSON.parse(r) : null; } catch { return null; } }
  private base(): Dados {
    return {
      casais: [], fornecedores: [], denuncias: [], comunicados: [], logs: [],
      categorias: ['Fotografia e vídeo', 'Decoração e flores', 'Música e animação', 'Buffet e catering', 'Espaços e salões', 'Bolos e doces'].map((nome, i) => ({ id: 'c' + i, nome, ativa: true })),
      planos: [{ id: 'p0', nome: 'Gratuito', preco: 0, ativo: true }, { id: 'p1', nome: 'Profissional', preco: 1500, ativo: true }, { id: 'p2', nome: 'Premium', preco: 3500, ativo: true }],
      config: { nome: 'Elace Casamentos', emailSuporte: '', comissao: 5, manutencao: false, registosAbertos: true, aprovacaoManual: true }
    };
  }
  private carregar() {
    let s: Dados | null = null;
    try { const r = localStorage.getItem(this.key); if (r) s = JSON.parse(r); } catch {}
    const b = this.base();
    this.d = s ? { ...b, ...s, config: { ...b.config, ...(s.config || {}) } } : b;
    this.nf.categoria = this.categoriasAtivas[0]?.nome || '';
    this.cfg = { ...this.d.config };
  }
  save() { try { localStorage.setItem(this.key, JSON.stringify(this.d)); } catch {} }
  toast(m: string) { this.toastMsg = m; if (this.toastTimer) clearTimeout(this.toastTimer); this.toastTimer = setTimeout(() => this.toastMsg = '', 2400); }
  private uid() { return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3); }
  private log(acao: string) { this.d.logs.unshift({ id: this.uid(), data: new Date().toISOString(), acao }); this.d.logs = this.d.logs.slice(0, 200); this.save(); }

  /* ---------- Formatação e cálculos ---------- */
  mt(v: number) { return new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(Number(v) || 0) + ' MT'; }
  pct(a: number, b: number) { return b > 0 ? Math.max(0, Math.min(100, Math.round((a / b) * 100))) : 0; }
  dataCurta(iso: string) { if (!iso) return ''; const x = new Date(iso.length > 10 ? iso : iso + 'T00:00:00'); return isNaN(x.getTime()) ? '' : x.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }); }
  hora(iso: string) { const x = new Date(iso); return isNaN(x.getTime()) ? '' : x.toLocaleString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
  get vazio() { return !this.d.casais.length && !this.d.fornecedores.length; }
  get casaisAtivos() { return this.d.casais.filter(c => c.estado === 'ativo').length; }
  get aprovados() { return this.d.fornecedores.filter(f => f.verificacao === 'aprovado').length; }
  get pendentes() { return this.d.fornecedores.filter(f => f.verificacao === 'pendente').length; }
  get listaPendentes() { return this.d.fornecedores.filter(f => f.verificacao === 'pendente'); }
  get destacados() { return this.d.fornecedores.filter(f => f.destaque).length; }
  get denAbertas() { return this.d.denuncias.filter(x => x.estado === 'aberta').length; }
  get novosMes() { const k = new Date().toISOString().slice(0, 7); return [...this.d.casais, ...this.d.fornecedores].filter(x => x.registado.slice(0, 7) === k).length; }
  get categoriasAtivas() { return this.d.categorias.filter(c => c.ativa); }
  get porCategoria() {
    const m = new Map<string, number>(); this.d.fornecedores.forEach(f => m.set(f.categoria, (m.get(f.categoria) || 0) + 1));
    return [...m.entries()].map(([nome, n]) => ({ nome, n })).sort((a, b) => b.n - a.n);
  }
  get registosMes() {
    const out: { label: string; casais: number; forn: number }[] = []; const h = new Date();
    for (let i = 5; i >= 0; i--) {
      const x = new Date(h.getFullYear(), h.getMonth() - i, 1); const k = x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0');
      out.push({ label: x.toLocaleDateString('pt-PT', { month: 'long' }), casais: this.d.casais.filter(c => c.registado.slice(0, 7) === k).length, forn: this.d.fornecedores.filter(c => c.registado.slice(0, 7) === k).length });
    }
    return out;
  }
  get maxMes() { return Math.max(0, ...this.registosMes.map(m => Math.max(m.casais, m.forn))); }
  badge(k: Secao): string {
    const n = k === 'aprovacoes' ? this.pendentes : k === 'moderacao' ? this.denAbertas : k === 'casais' ? this.d.casais.length : k === 'fornecedores' ? this.d.fornecedores.length : 0;
    return n ? String(n) : '';
  }

  /* ---------- Casais ---------- */
  get casaisView() {
    const q = this.qCasal.trim().toLowerCase();
    return this.d.casais.filter(c => (this.fCasal === 'todos' || c.estado === this.fCasal) && (!q || (c.nome + c.email + c.cidade).toLowerCase().includes(q)))
      .sort((a, b) => b.registado.localeCompare(a.registado));
  }
  addCasal() {
    const nome = this.nc.nome.trim(), email = this.nc.email.trim(); if (!nome || !email) return;
    if (this.d.casais.some(c => c.email.toLowerCase() === email.toLowerCase())) { this.toast('Já existe um casal com esse email.'); return; }
    this.d.casais.push({ id: this.uid(), nome, email, telefone: this.nc.telefone.trim(), cidade: this.nc.cidade.trim(), dataCasamento: this.nc.dataCasamento, estado: 'ativo', registado: new Date().toISOString() });
    this.nc = { nome: '', email: '', telefone: '', cidade: '', dataCasamento: '' }; this.log('Casal adicionado: ' + nome); this.toast('Casal adicionado.');
  }
  mudouCasal(c: Casal) { this.log((c.estado === 'suspenso' ? 'Casal suspenso: ' : 'Casal reativado: ') + c.nome); }
  removerCasal(c: Casal) { if (!confirm('Remover a conta de ' + c.nome + '?')) return; this.d.casais = this.d.casais.filter(x => x.id !== c.id); this.log('Casal removido: ' + c.nome); }

  /* ---------- Fornecedores ---------- */
  rotuloVerif(v: Verif) { return v === 'aprovado' ? 'Aprovado' : v === 'rejeitado' ? 'Rejeitado' : 'Pendente'; }
  classeVerif(v: Verif) { return v === 'aprovado' ? 'ok' : v === 'rejeitado' ? 'no' : 'pen'; }
  get fornView() {
    const q = this.qForn.trim().toLowerCase();
    return this.d.fornecedores.filter(f => (this.fForn === 'todos' || f.verificacao === this.fForn || (this.fForn === 'suspenso' && f.estado === 'suspenso')) && (!q || (f.nome + f.categoria + f.cidade).toLowerCase().includes(q)))
      .sort((a, b) => b.registado.localeCompare(a.registado));
  }
  addForn() {
    const nome = this.nf.nome.trim(), email = this.nf.email.trim(); if (!nome || !email) return;
    this.d.fornecedores.push({ id: this.uid(), nome, categoria: this.nf.categoria || this.categoriasAtivas[0]?.nome || 'Outros', cidade: this.nf.cidade.trim(), email, telefone: this.nf.telefone.trim(), verificacao: 'aprovado', estado: 'ativo', destaque: false, plano: 'p0', registado: new Date().toISOString(), motivo: '' });
    this.nf.nome = ''; this.nf.cidade = ''; this.nf.email = ''; this.nf.telefone = ''; this.log('Fornecedor adicionado: ' + nome); this.toast('Fornecedor adicionado.');
  }
  aprovar(f: Forn) { f.verificacao = 'aprovado'; f.motivo = ''; this.log('Fornecedor aprovado: ' + f.nome); this.toast(f.nome + ' aprovado.'); }
  rejeitar(f: Forn) { f.verificacao = 'rejeitado'; this.log('Fornecedor rejeitado: ' + f.nome + (f.motivo ? ' (' + f.motivo + ')' : '')); this.toast(f.nome + ' rejeitado.'); }
  aprovarTodos() { const n = this.listaPendentes.length; this.listaPendentes.forEach(f => { f.verificacao = 'aprovado'; f.motivo = ''; }); this.log(n + ' fornecedores aprovados em lote'); this.toast(n + ' fornecedores aprovados.'); }
  destacar(f: Forn) { f.destaque = !f.destaque; this.log((f.destaque ? 'Destaque ativado: ' : 'Destaque removido: ') + f.nome); }
  mudouForn(f: Forn, campo: 'estado' | 'plano') { this.log(campo === 'estado' ? (f.estado === 'suspenso' ? 'Fornecedor suspenso: ' : 'Fornecedor reativado: ') + f.nome : 'Plano de ' + f.nome + ' alterado para ' + this.nomePlano(f.plano)); }
  removerForn(f: Forn) { if (!confirm('Remover o fornecedor ' + f.nome + '?')) return; this.d.fornecedores = this.d.fornecedores.filter(x => x.id !== f.id); this.log('Fornecedor removido: ' + f.nome); }

  /* ---------- Categorias ---------- */
  contarCat(nome: string) { return this.d.fornecedores.filter(f => f.categoria === nome).length; }
  addCategoria() {
    const nome = this.nk.trim(); if (!nome) return;
    if (this.d.categorias.some(c => c.nome.toLowerCase() === nome.toLowerCase())) { this.toast('Essa categoria já existe.'); return; }
    this.d.categorias.push({ id: this.uid(), nome, ativa: true }); this.nk = ''; this.log('Categoria criada: ' + nome); this.toast('Categoria criada.');
  }
  removerCategoria(c: Categoria) {
    if (this.contarCat(c.nome)) { this.toast('Mova os fornecedores desta categoria antes de a remover.'); return; }
    this.d.categorias = this.d.categorias.filter(x => x.id !== c.id); this.log('Categoria removida: ' + c.nome);
  }

  /* ---------- Moderação ---------- */
  get denView() { return this.d.denuncias.filter(x => this.fDenSel === 'todas' || x.estado === this.fDenSel).sort((a, b) => b.data.localeCompare(a.data)); }
  addDenuncia() {
    const alvo = this.ndn.alvo.trim(), motivo = this.ndn.motivo.trim(); if (!alvo || !motivo) return;
    this.d.denuncias.push({ id: this.uid(), alvo, tipo: this.ndn.tipo, motivo, autor: this.ndn.autor.trim(), estado: 'aberta', data: new Date().toISOString() });
    this.ndn = { alvo: '', tipo: 'Fornecedor', motivo: '', autor: '' }; this.log('Denúncia registada sobre ' + alvo); this.toast('Denúncia registada.');
  }
  mudouDen(x: Denuncia) { this.log('Denúncia sobre ' + x.alvo + ' marcada como ' + x.estado); }
  removerDen(x: Denuncia) { this.d.denuncias = this.d.denuncias.filter(y => y.id !== x.id); this.log('Denúncia removida: ' + x.alvo); }
  alvoExiste(nome: string) { const n = nome.trim().toLowerCase(); return this.d.fornecedores.some(f => f.nome.toLowerCase() === n) || this.d.casais.some(c => c.nome.toLowerCase() === n); }
  suspenderAlvo(x: Denuncia) {
    const n = x.alvo.trim().toLowerCase();
    this.d.fornecedores.filter(f => f.nome.toLowerCase() === n).forEach(f => f.estado = 'suspenso');
    this.d.casais.filter(c => c.nome.toLowerCase() === n).forEach(c => c.estado = 'suspenso');
    x.estado = 'resolvida'; this.log('Conta suspensa por denúncia: ' + x.alvo); this.toast('Conta suspensa e denúncia resolvida.');
  }

  /* ---------- Comunicados ---------- */
  rotuloPublico(p: string) { return p === 'casais' ? 'Casais' : p === 'fornecedores' ? 'Fornecedores' : 'Todos'; }
  addComunicado() {
    const titulo = this.ncm.titulo.trim(), texto = this.ncm.texto.trim(); if (!titulo || !texto) return;
    this.d.comunicados.unshift({ id: this.uid(), titulo, texto, publico: this.ncm.publico, data: new Date().toISOString() });
    try { localStorage.setItem('elace_announcements', JSON.stringify(this.d.comunicados)); } catch {}
    this.ncm = { titulo: '', texto: '', publico: 'todos' }; this.log('Comunicado publicado: ' + titulo); this.toast('Comunicado publicado.');
  }
  removerComunicado(c: Comunicado) {
    this.d.comunicados = this.d.comunicados.filter(x => x.id !== c.id);
    try { localStorage.setItem('elace_announcements', JSON.stringify(this.d.comunicados)); } catch {}
    this.log('Comunicado removido: ' + c.titulo);
  }

  /* ---------- Finanças ---------- */
  nomePlano(id: string) { return this.d.planos.find(p => p.id === id)?.nome || '—'; }
  private get pagaveis() { return this.d.fornecedores.filter(f => f.verificacao === 'aprovado' && f.estado === 'ativo'); }
  get ativosPagaveis() { return this.pagaveis.length; }
  private preco(f: Forn) { const p = this.d.planos.find(x => x.id === f.plano); return p && p.ativo ? Number(p.preco) || 0 : 0; }
  get mrr() { return this.pagaveis.reduce((s, f) => s + this.preco(f), 0); }
  get pagantes() { return this.pagaveis.filter(f => this.preco(f) > 0).length; }
  get arpu() { return this.ativosPagaveis ? Math.round(this.mrr / this.ativosPagaveis) : 0; }
  contarPlano(id: string) { return this.d.fornecedores.filter(f => f.plano === id).length; }
  get receitaPlanos() { return this.d.planos.map(p => ({ nome: p.nome, valor: this.pagaveis.filter(f => f.plano === p.id).reduce((s, f) => s + this.preco(f), 0) })); }
  get maxPlano() { return Math.max(0, ...this.receitaPlanos.map(p => p.valor)); }
  addPlano() {
    const nome = this.npl.nome.trim(); if (!nome) return;
    this.d.planos.push({ id: this.uid(), nome, preco: Number(this.npl.preco) || 0, ativo: true }); this.npl = { nome: '', preco: 0 }; this.log('Plano criado: ' + nome); this.toast('Plano criado.');
  }

  /* ---------- Atividade, definições e dados ---------- */
  limparLogs() { this.d.logs = []; this.save(); }
  guardarConfig() { this.d.config = { ...this.cfg, comissao: Math.min(100, Math.max(0, Number(this.cfg.comissao) || 0)) }; this.log('Definições da plataforma atualizadas'); this.toast('Alterações guardadas.'); }
  importarDispositivo() {
    let n = 0;
    try {
      const all = JSON.parse(localStorage.getItem('elace_profiles') || '{}') as Record<string, any>;
      Object.keys(all).forEach(email => {
        const u = all[email]; if (!u) return;
        if (u.tipo === 'fornecedor') {
          if (this.d.fornecedores.some(f => f.email.toLowerCase() === email)) return;
          this.d.fornecedores.push({ id: this.uid(), nome: u.nome || email, categoria: this.categoriasAtivas[0]?.nome || 'Outros', cidade: '', email, telefone: '', verificacao: 'pendente', estado: 'ativo', destaque: false, plano: 'p0', registado: new Date().toISOString(), motivo: '' }); n++;
        } else {
          if (this.d.casais.some(c => c.email.toLowerCase() === email)) return;
          this.d.casais.push({ id: this.uid(), nome: [u.noivo, u.noiva].filter(Boolean).join(' e ') || u.nome || email, email, telefone: '', cidade: '', dataCasamento: '', estado: 'ativo', registado: new Date().toISOString() }); n++;
        }
      });
    } catch {}
    this.log('Importação do dispositivo: ' + n + ' contas'); this.toast(n ? n + ' contas importadas.' : 'Não há contas novas neste dispositivo.');
  }
  carregarDemo() {
    const dia = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
    const futuro = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
    const cidades = ['Maputo', 'Matola', 'Beira', 'Nampula', 'Xai-Xai', 'Inhambane'];
    const slug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]+/g, '.').replace(/^\.|\.$/g, '');
    const casais = ['João e Ana', 'Carlos e Marta', 'Pedro e Sofia', 'Nélio e Ivone', 'Hélder e Cláudia', 'Tiago e Beatriz', 'Armando e Lúcia', 'Edson e Rita', 'Bruno e Telma', 'Ismael e Fátima', 'Dércio e Naíma', 'Gil e Vanda'];
    casais.forEach((nome, i) => { const email = slug(nome) + '@exemplo.co.mz'; if (!this.d.casais.some(c => c.email === email)) this.d.casais.push({ id: this.uid(), nome, email, telefone: '84 ' + (100 + i * 7) + ' ' + (2000 + i * 131), cidade: cidades[i % cidades.length], dataCasamento: futuro(30 + i * 28), estado: i === 9 ? 'suspenso' : 'ativo', registado: dia(i * 14 + 2) }); });
    const cat = (i: number) => this.d.categorias[i % this.d.categorias.length]?.nome || 'Outros';
    const forn: [string, number, Verif, string][] = [['Estúdio Aurora', 0, 'aprovado', 'p2'], ['Flores do Índico', 1, 'aprovado', 'p1'], ['DJ Kito Sound', 2, 'aprovado', 'p1'], ['Sabores de Maputo', 3, 'aprovado', 'p2'], ['Salão Jardim Real', 4, 'aprovado', 'p1'], ['Doce Momento', 5, 'aprovado', 'p0'], ['Lente Dourada', 0, 'pendente', 'p0'], ['Eventos Baía', 4, 'pendente', 'p0'], ['Banda Marrabenta Viva', 2, 'pendente', 'p0'], ['Quinta do Sol', 4, 'rejeitado', 'p0']];
    forn.forEach(([nome, c, v, plano], i) => { const email = slug(nome) + '@exemplo.co.mz'; if (!this.d.fornecedores.some(f => f.email === email)) this.d.fornecedores.push({ id: this.uid(), nome, categoria: cat(c), cidade: cidades[i % cidades.length], email, telefone: '82 ' + (300 + i * 9) + ' ' + (4000 + i * 97), verificacao: v, estado: 'ativo', destaque: i < 2, plano, registado: dia(i * 17 + 3), motivo: '' }); });
    if (!this.d.denuncias.length) {
      this.d.denuncias.push({ id: this.uid(), alvo: 'Eventos Baía', tipo: 'Fornecedor', motivo: 'Preços divulgados diferentes dos cobrados.', autor: 'Carlos e Marta', estado: 'aberta', data: dia(2) });
      this.d.denuncias.push({ id: this.uid(), alvo: 'Avaliação de Doce Momento', tipo: 'Avaliação', motivo: 'Linguagem inadequada.', autor: 'Doce Momento', estado: 'analise', data: dia(6) });
      this.d.denuncias.push({ id: this.uid(), alvo: 'Gil e Vanda', tipo: 'Casal', motivo: 'Mensagens repetidas a fornecedores.', autor: 'DJ Kito Sound', estado: 'resolvida', data: dia(20) });
    }
    this.log('Dados de demonstração carregados'); this.toast('Dados de demonstração carregados.');
  }
  exportar(tipo: 'casais' | 'fornecedores') {
    const esc = (v: string | number | boolean) => '"' + String(v).replace(/"/g, '""') + '"';
    const linhas = tipo === 'casais'
      ? [['Nome', 'Email', 'Telefone', 'Cidade', 'Data casamento', 'Estado', 'Registo'].join(',')].concat(this.d.casais.map(c => [c.nome, c.email, c.telefone, c.cidade, c.dataCasamento, c.estado, c.registado.slice(0, 10)].map(esc).join(',')))
      : [['Nome', 'Categoria', 'Cidade', 'Email', 'Telefone', 'Verificação', 'Estado', 'Plano', 'Destaque', 'Registo'].join(',')].concat(this.d.fornecedores.map(f => [f.nome, f.categoria, f.cidade, f.email, f.telefone, f.verificacao, f.estado, this.nomePlano(f.plano), f.destaque ? 'sim' : 'não', f.registado.slice(0, 10)].map(esc).join(',')));
    this.baixar(tipo + '.csv', '\ufeff' + linhas.join('\n'), 'text/csv;charset=utf-8');
  }
  exportarTudo() { this.baixar('elace-admin.json', JSON.stringify(this.d, null, 2), 'application/json'); }
  repor() { if (!confirm('Tem a certeza? Todos os dados do painel serão apagados.')) return; this.d = this.base(); this.save(); this.toast('Painel reposto.'); }
  logout() { localStorage.removeItem('elace_token'); localStorage.removeItem('elace_user'); location.href = '/login'; }
  private baixar(nome: string, conteudo: string, tipo: string) {
    const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
    const a = document.createElement('a'); a.href = url; a.download = nome; a.click(); URL.revokeObjectURL(url);
  }
}
