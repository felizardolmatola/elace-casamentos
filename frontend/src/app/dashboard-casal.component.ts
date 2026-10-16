import { Component, OnDestroy } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { HeaderComponent } from './header.component';

type Secao = 'visao' | 'checklist' | 'orcamento' | 'convidados' | 'mesas' | 'fornecedores' | 'cronograma' | 'definicoes';
type Rsvp = 'pendente' | 'confirmado' | 'recusado';

interface Tarefa { id: string; titulo: string; categoria: string; prazo: string; feito: boolean; }
interface Despesa { id: string; descricao: string; categoria: string; estimado: number; pago: number; }
interface Convidado { id: string; nome: string; grupo: string; contacto: string; acompanhantes: number; estado: Rsvp; mesa: string; }
interface Mesa { id: string; nome: string; lugares: number; }
interface Contratado { id: string; nome: string; categoria: string; contacto: string; valor: number; estado: 'contactado' | 'reservado' | 'pago'; }
interface Momento { id: string; hora: string; titulo: string; local: string; }
interface Casamento { nome: string; data: string; local: string; convidadosEst: number; orcamento: number; }
interface Dados { casamento: Casamento; tarefas: Tarefa[]; despesas: Despesa[]; convidados: Convidado[]; mesas: Mesa[]; fornecedores: Contratado[]; cronograma: Momento[]; notas: string; }

@Component({
  selector: 'elace-dashboard-casal',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, FormsModule, RouterLink, HeaderComponent],
  template: `
<elace-header />
<div class="shell" *ngIf="ready">
  <!-- Navegação lateral -->
  <aside class="side" aria-label="Painel do casal">
    <div class="side-card">
      <span class="side-avatar">{{ initials }}</span>
      <div class="side-who"><strong>{{ d.casamento.nome || 'O vosso casamento' }}</strong><small>{{ dataLonga || 'Data por definir' }}</small></div>
    </div>
    <nav class="side-nav">
      <a *ngFor="let s of secoes" [routerLink]="[]" [queryParams]="{ secao: s.key }" [class.active]="secao === s.key" [attr.aria-current]="secao === s.key ? 'page' : null">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="s.icon"/></svg>
        <span>{{ s.label }}</span>
        <em *ngIf="badge(s.key) as b">{{ b }}</em>
      </a>
    </nav>
    <a class="side-cta" routerLink="/fornecedores">Explorar fornecedores <span aria-hidden="true">↗</span></a>
  </aside>

  <main class="main">
    <div class="toast" role="status" aria-live="polite" *ngIf="toastMsg">{{ toastMsg }}</div>

    <!-- VISÃO GERAL -->
    <ng-container *ngIf="secao === 'visao'">
      <header class="page-head">
        <div><p class="eyebrow">Visão geral</p><h1>Olá, {{ primeirosNomes }}</h1><p class="muted">Aqui está o ponto de situação do vosso casamento.</p></div>
      </header>

      <section class="hero-card">
        <div>
          <p class="eyebrow light">{{ d.casamento.data ? 'Faltam' : 'Data do casamento' }}</p>
          <ng-container *ngIf="d.casamento.data; else semData">
            <p class="count"><strong>{{ dias < 0 ? 0 : dias }}</strong> {{ dias === 1 ? 'dia' : 'dias' }}</p>
            <p class="hero-sub">{{ dataLonga }}<span *ngIf="d.casamento.local"> · {{ d.casamento.local }}</span></p>
          </ng-container>
          <ng-template #semData>
            <p class="hero-sub big">Ainda não definiram a data.</p>
            <a class="btn light" [routerLink]="[]" [queryParams]="{ secao: 'definicoes' }">Definir data e local</a>
          </ng-template>
        </div>
        <div class="hero-prog">
          <span>Progresso do planeamento</span>
          <div class="bar big"><i [style.width.%]="progressoGeral"></i></div>
          <strong>{{ progressoGeral }}%</strong>
        </div>
      </section>

      <div class="alerts" *ngIf="atrasadas > 0 || excedido">
        <p class="alert warn" *ngIf="atrasadas > 0"><b>{{ atrasadas }}</b> {{ atrasadas === 1 ? 'tarefa em atraso' : 'tarefas em atraso' }}. <a [routerLink]="[]" [queryParams]="{ secao: 'checklist' }">Ver checklist</a></p>
        <p class="alert danger" *ngIf="excedido">O total estimado ({{ mt(totalEstimado) }}) ultrapassa o orçamento definido ({{ mt(d.casamento.orcamento) }}). <a [routerLink]="[]" [queryParams]="{ secao: 'orcamento' }">Rever orçamento</a></p>
      </div>

      <section class="kpis">
        <article class="kpi"><span>Tarefas concluídas</span><strong>{{ tarefasFeitas }}<small>/{{ d.tarefas.length }}</small></strong><div class="bar"><i [style.width.%]="pct(tarefasFeitas, d.tarefas.length)"></i></div></article>
        <article class="kpi"><span>Orçamento pago</span><strong>{{ mt(totalPago) }}</strong><div class="bar"><i [style.width.%]="pct(totalPago, d.casamento.orcamento || totalEstimado)"></i></div><small class="kpi-note">de {{ mt(d.casamento.orcamento || totalEstimado) }}</small></article>
        <article class="kpi"><span>Convidados confirmados</span><strong>{{ pessoas('confirmado') }}<small>/{{ pessoas() }}</small></strong><div class="bar"><i [style.width.%]="pct(pessoas('confirmado'), pessoas())"></i></div></article>
        <article class="kpi"><span>Fornecedores reservados</span><strong>{{ reservados }}<small>/{{ d.fornecedores.length }}</small></strong><div class="bar"><i [style.width.%]="pct(reservados, d.fornecedores.length)"></i></div></article>
      </section>

      <section class="grid2">
        <article class="card">
          <div class="card-head"><h2>Próximas tarefas</h2><a [routerLink]="[]" [queryParams]="{ secao: 'checklist' }">Ver todas</a></div>
          <p class="empty" *ngIf="!proximas.length">Sem tarefas pendentes. Adicionem na checklist.</p>
          <ul class="todo">
            <li *ngFor="let t of proximas">
              <label><input type="checkbox" [checked]="t.feito" (change)="toggleTarefa(t)"><span>{{ t.titulo }}</span></label>
              <small [class.late]="atrasada(t)">{{ t.prazo ? t.prazo : 'Sem prazo' }}</small>
            </li>
          </ul>
        </article>
        <article class="card">
          <div class="card-head"><h2>Orçamento por categoria</h2><a [routerLink]="[]" [queryParams]="{ secao: 'orcamento' }">Detalhes</a></div>
          <p class="empty" *ngIf="!porCategoria.length">Adicionem despesas para ver a distribuição.</p>
          <div class="cat" *ngFor="let c of porCategoria">
            <div><span>{{ c.categoria }}</span><b>{{ mt(c.estimado) }}</b></div>
            <div class="bar"><i [style.width.%]="pct(c.estimado, maxCategoria)"></i></div>
          </div>
        </article>
        <article class="card">
          <div class="card-head"><h2>Confirmações (RSVP)</h2><a [routerLink]="[]" [queryParams]="{ secao: 'convidados' }">Convidados</a></div>
          <div class="stack" *ngIf="pessoas() > 0; else semConv">
            <i class="s-ok" [style.flex]="pessoas('confirmado')"></i><i class="s-pen" [style.flex]="pessoas('pendente')"></i><i class="s-no" [style.flex]="pessoas('recusado')"></i>
          </div>
          <ng-template #semConv><p class="empty">Ainda não adicionaram convidados.</p></ng-template>
          <ul class="legend">
            <li><i class="s-ok"></i>Confirmados <b>{{ pessoas('confirmado') }}</b></li>
            <li><i class="s-pen"></i>Pendentes <b>{{ pessoas('pendente') }}</b></li>
            <li><i class="s-no"></i>Recusaram <b>{{ pessoas('recusado') }}</b></li>
          </ul>
        </article>
        <article class="card">
          <div class="card-head"><h2>Notas</h2></div>
          <textarea class="notes" rows="6" [(ngModel)]="d.notas" (ngModelChange)="save()" placeholder="Ideias, contactos, lembretes…" aria-label="Notas do casal"></textarea>
        </article>
      </section>
    </ng-container>

    <!-- CHECKLIST -->
    <ng-container *ngIf="secao === 'checklist'">
      <header class="page-head">
        <div><p class="eyebrow">Checklist</p><h1>Tarefas do casamento</h1><p class="muted">{{ tarefasFeitas }} de {{ d.tarefas.length }} concluídas.</p></div>
        <button class="btn ghost" type="button" (click)="carregarSugeridas()">Carregar checklist sugerida</button>
      </header>
      <form class="card add" (ngSubmit)="addTarefa()">
        <label class="grow">Nova tarefa<input name="tt" [(ngModel)]="nt.titulo" maxlength="100" placeholder="Ex.: Provar o menu do buffet" required></label>
        <label>Categoria<select name="tc" [(ngModel)]="nt.categoria"><option *ngFor="let c of categoriasTarefa" [value]="c">{{ c }}</option></select></label>
        <label>Prazo<input name="tp" type="date" [(ngModel)]="nt.prazo"></label>
        <button class="btn" type="submit">Adicionar</button>
      </form>
      <div class="filters" role="group" aria-label="Filtrar tarefas">
        <button type="button" *ngFor="let f of filtrosTarefa" [class.on]="fTarefa === f.key" (click)="fTarefa = f.key">{{ f.label }}</button>
      </div>
      <section class="card flush">
        <p class="empty pad" *ngIf="!tarefasView.length">Nenhuma tarefa para mostrar.</p>
        <ul class="rows">
          <li *ngFor="let t of tarefasView" [class.done]="t.feito">
            <label class="chk"><input type="checkbox" [checked]="t.feito" (change)="toggleTarefa(t)" [attr.aria-label]="'Concluir ' + t.titulo"><span></span></label>
            <div class="row-main"><strong>{{ t.titulo }}</strong><small>{{ t.categoria }}</small></div>
            <span class="pill" [ngClass]="t.feito ? 'ok' : atrasada(t) ? 'no' : 'pen'">{{ t.feito ? 'Concluída' : atrasada(t) ? 'Em atraso' : (t.prazo ? t.prazo : 'Sem prazo') }}</span>
            <button class="icon-btn" type="button" (click)="removerTarefa(t)" [attr.aria-label]="'Remover ' + t.titulo"><svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg></button>
          </li>
        </ul>
      </section>
    </ng-container>

    <!-- ORÇAMENTO -->
    <ng-container *ngIf="secao === 'orcamento'">
      <header class="page-head">
        <div><p class="eyebrow">Orçamento</p><h1>Controlo financeiro</h1><p class="muted">Valores em meticais (MT).</p></div>
      </header>
      <section class="kpis">
        <article class="kpi"><span>Orçamento total</span><input class="kpi-input" type="number" min="0" [(ngModel)]="d.casamento.orcamento" (ngModelChange)="save()" aria-label="Orçamento total"></article>
        <article class="kpi"><span>Total estimado</span><strong>{{ mt(totalEstimado) }}</strong></article>
        <article class="kpi"><span>Total pago</span><strong>{{ mt(totalPago) }}</strong></article>
        <article class="kpi"><span>{{ restante >= 0 ? 'Disponível' : 'Acima do orçamento' }}</span><strong [class.neg]="restante < 0">{{ mt(restante < 0 ? -restante : restante) }}</strong></article>
      </section>
      <form class="card add" (ngSubmit)="addDespesa()">
        <label class="grow">Despesa<input name="dd" [(ngModel)]="nd.descricao" maxlength="80" placeholder="Ex.: Aluguer do salão" required></label>
        <label>Categoria<select name="dc" [(ngModel)]="nd.categoria"><option *ngFor="let c of categoriasOrc" [value]="c">{{ c }}</option></select></label>
        <label>Estimado (MT)<input name="de" type="number" min="0" [(ngModel)]="nd.estimado"></label>
        <label>Pago (MT)<input name="dp" type="number" min="0" [(ngModel)]="nd.pago"></label>
        <button class="btn" type="submit">Adicionar</button>
      </form>
      <section class="card flush">
        <p class="empty pad" *ngIf="!d.despesas.length">Ainda não registaram despesas.</p>
        <div class="table-wrap" *ngIf="d.despesas.length">
          <table>
            <thead><tr><th>Despesa</th><th>Categoria</th><th class="num">Estimado</th><th class="num">Pago</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              <tr *ngFor="let x of d.despesas">
                <td><strong>{{ x.descricao }}</strong></td>
                <td>{{ x.categoria }}</td>
                <td class="num"><input class="cell" type="number" min="0" [(ngModel)]="x.estimado" (ngModelChange)="save()" [attr.aria-label]="'Estimado ' + x.descricao"></td>
                <td class="num"><input class="cell" type="number" min="0" [(ngModel)]="x.pago" (ngModelChange)="save()" [attr.aria-label]="'Pago ' + x.descricao"></td>
                <td><span class="pill" [ngClass]="estadoDespesa(x).cls">{{ estadoDespesa(x).txt }}</span></td>
                <td><button class="icon-btn" type="button" (click)="removerDespesa(x)" [attr.aria-label]="'Remover ' + x.descricao"><svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg></button></td>
              </tr>
            </tbody>
            <tfoot><tr><td colspan="2">Total</td><td class="num">{{ mt(totalEstimado) }}</td><td class="num">{{ mt(totalPago) }}</td><td colspan="2"></td></tr></tfoot>
          </table>
        </div>
      </section>
    </ng-container>

    <!-- CONVIDADOS -->
    <ng-container *ngIf="secao === 'convidados'">
      <header class="page-head">
        <div><p class="eyebrow">Convidados</p><h1>Lista de convidados</h1><p class="muted">{{ d.convidados.length }} convites · {{ pessoas() }} pessoas no total.</p></div>
        <button class="btn ghost" type="button" (click)="exportarConvidados()" [disabled]="!d.convidados.length">Exportar CSV</button>
      </header>
      <section class="kpis three">
        <article class="kpi"><span>Confirmados</span><strong>{{ pessoas('confirmado') }}</strong></article>
        <article class="kpi"><span>Pendentes</span><strong>{{ pessoas('pendente') }}</strong></article>
        <article class="kpi"><span>Recusaram</span><strong>{{ pessoas('recusado') }}</strong></article>
      </section>
      <form class="card add" (ngSubmit)="addConvidado()">
        <label class="grow">Nome<input name="gn" [(ngModel)]="ng.nome" maxlength="80" placeholder="Nome do convidado" required></label>
        <label>Grupo<select name="gg" [(ngModel)]="ng.grupo"><option *ngFor="let g of grupos" [value]="g">{{ g }}</option></select></label>
        <label>Contacto<input name="gc" [(ngModel)]="ng.contacto" maxlength="40" placeholder="84 123 4567"></label>
        <label class="narrow">Acompanh.<input name="ga" type="number" min="0" max="10" [(ngModel)]="ng.acompanhantes"></label>
        <button class="btn" type="submit">Adicionar</button>
      </form>
      <div class="toolbar">
        <input class="tsearch" type="search" [(ngModel)]="qConv" placeholder="Pesquisar convidado…" aria-label="Pesquisar convidado">
        <div class="filters">
          <button type="button" *ngFor="let f of filtrosRsvp" [class.on]="fConv === f.key" (click)="fConv = f.key">{{ f.label }}</button>
        </div>
      </div>
      <section class="card flush">
        <p class="empty pad" *ngIf="!convidadosView.length">Nenhum convidado encontrado.</p>
        <div class="table-wrap" *ngIf="convidadosView.length">
          <table>
            <thead><tr><th>Nome</th><th>Grupo</th><th>Contacto</th><th class="num">Pessoas</th><th>Mesa</th><th>RSVP</th><th></th></tr></thead>
            <tbody>
              <tr *ngFor="let g of convidadosView">
                <td><strong>{{ g.nome }}</strong></td>
                <td>{{ g.grupo }}</td>
                <td>{{ g.contacto || '—' }}</td>
                <td class="num">{{ 1 + g.acompanhantes }}</td>
                <td>{{ nomeMesa(g.mesa) }}</td>
                <td><select class="cell sel" [ngClass]="g.estado" [(ngModel)]="g.estado" (ngModelChange)="save()" [attr.aria-label]="'RSVP de ' + g.nome"><option value="pendente">Pendente</option><option value="confirmado">Confirmado</option><option value="recusado">Recusou</option></select></td>
                <td><button class="icon-btn" type="button" (click)="removerConvidado(g)" [attr.aria-label]="'Remover ' + g.nome"><svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg></button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </ng-container>

    <!-- MESAS -->
    <ng-container *ngIf="secao === 'mesas'">
      <header class="page-head">
        <div><p class="eyebrow">Mesas</p><h1>Distribuição de lugares</h1><p class="muted">{{ semMesa.length }} {{ semMesa.length === 1 ? 'convite' : 'convites' }} por colocar.</p></div>
      </header>
      <form class="card add" (ngSubmit)="addMesa()">
        <label class="grow">Nome da mesa<input name="mn" [(ngModel)]="nm.nome" maxlength="40" placeholder="Ex.: Mesa dos noivos" required></label>
        <label class="narrow">Lugares<input name="ml" type="number" min="1" max="40" [(ngModel)]="nm.lugares"></label>
        <button class="btn" type="submit">Criar mesa</button>
      </form>
      <p class="empty" *ngIf="!d.mesas.length">Criem a primeira mesa para começar a distribuir os convidados.</p>
      <section class="tables">
        <article class="card mesa" *ngFor="let m of d.mesas">
          <div class="card-head"><h2>{{ m.nome }}</h2><button class="icon-btn" type="button" (click)="removerMesa(m)" [attr.aria-label]="'Remover ' + m.nome"><svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg></button></div>
          <p class="occ"><b [class.neg]="ocupacao(m) > m.lugares">{{ ocupacao(m) }}</b> / {{ m.lugares }} lugares</p>
          <div class="bar" [class.over]="ocupacao(m) > m.lugares"><i [style.width.%]="pct(ocupacao(m), m.lugares)"></i></div>
          <ul class="chips">
            <li *ngFor="let g of convidadosDaMesa(m)">{{ g.nome }}<small *ngIf="g.acompanhantes"> +{{ g.acompanhantes }}</small><button type="button" (click)="atribuir(g, '')" [attr.aria-label]="'Tirar ' + g.nome + ' da mesa'">×</button></li>
            <li class="none" *ngIf="!convidadosDaMesa(m).length">Mesa vazia</li>
          </ul>
        </article>
      </section>
      <section class="card" *ngIf="d.mesas.length && semMesa.length">
        <div class="card-head"><h2>Convidados sem mesa</h2></div>
        <ul class="rows tight">
          <li *ngFor="let g of semMesa">
            <div class="row-main"><strong>{{ g.nome }}</strong><small>{{ 1 + g.acompanhantes }} {{ g.acompanhantes ? 'pessoas' : 'pessoa' }} · {{ g.grupo }}</small></div>
            <select class="cell sel" [ngModel]="''" (ngModelChange)="atribuir(g, $event)" [attr.aria-label]="'Atribuir mesa a ' + g.nome"><option value="">Atribuir mesa…</option><option *ngFor="let m of d.mesas" [value]="m.id">{{ m.nome }}</option></select>
          </li>
        </ul>
      </section>
    </ng-container>

    <!-- FORNECEDORES -->
    <ng-container *ngIf="secao === 'fornecedores'">
      <header class="page-head">
        <div><p class="eyebrow">Fornecedores</p><h1>Equipa do casamento</h1><p class="muted">Acompanhem contactos, reservas e pagamentos.</p></div>
        <a class="btn ghost" routerLink="/fornecedores">Explorar marketplace</a>
      </header>
      <form class="card add" (ngSubmit)="addFornecedor()">
        <label class="grow">Fornecedor<input name="fn" [(ngModel)]="nf.nome" maxlength="80" placeholder="Nome da empresa ou profissional" required></label>
        <label>Categoria<select name="fc" [(ngModel)]="nf.categoria"><option *ngFor="let c of categoriasOrc" [value]="c">{{ c }}</option></select></label>
        <label>Contacto<input name="ft" [(ngModel)]="nf.contacto" maxlength="40" placeholder="84 123 4567"></label>
        <label>Valor (MT)<input name="fv" type="number" min="0" [(ngModel)]="nf.valor"></label>
        <button class="btn" type="submit">Adicionar</button>
      </form>
      <p class="empty" *ngIf="!d.fornecedores.length">Ainda não adicionaram fornecedores.</p>
      <section class="cards3">
        <article class="card forn" *ngFor="let f of d.fornecedores">
          <div class="card-head"><div><h2>{{ f.nome }}</h2><small>{{ f.categoria }}</small></div><button class="icon-btn" type="button" (click)="removerFornecedor(f)" [attr.aria-label]="'Remover ' + f.nome"><svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg></button></div>
          <p class="forn-line"><span>Contacto</span>{{ f.contacto || '—' }}</p>
          <p class="forn-line"><span>Valor</span><b>{{ mt(f.valor) }}</b></p>
          <select class="cell sel" [ngClass]="f.estado" [(ngModel)]="f.estado" (ngModelChange)="save()" [attr.aria-label]="'Estado de ' + f.nome"><option value="contactado">Contactado</option><option value="reservado">Reservado</option><option value="pago">Pago</option></select>
        </article>
      </section>
    </ng-container>

    <!-- CRONOGRAMA -->
    <ng-container *ngIf="secao === 'cronograma'">
      <header class="page-head">
        <div><p class="eyebrow">Cronograma</p><h1>Programa do grande dia</h1><p class="muted">Organizem a ordem dos momentos da celebração.</p></div>
        <button class="btn ghost" type="button" (click)="carregarCronograma()" *ngIf="!d.cronograma.length">Usar programa sugerido</button>
      </header>
      <form class="card add" (ngSubmit)="addMomento()">
        <label class="narrow">Hora<input name="ch" type="time" [(ngModel)]="nmo.hora" required></label>
        <label class="grow">Momento<input name="cm" [(ngModel)]="nmo.titulo" maxlength="80" placeholder="Ex.: Cerimónia" required></label>
        <label>Local<input name="cl" [(ngModel)]="nmo.local" maxlength="60" placeholder="Opcional"></label>
        <button class="btn" type="submit">Adicionar</button>
      </form>
      <p class="empty" *ngIf="!d.cronograma.length">Sem momentos definidos.</p>
      <ol class="timeline">
        <li *ngFor="let m of cronogramaOrdenado"><time>{{ m.hora }}</time><div><strong>{{ m.titulo }}</strong><small *ngIf="m.local">{{ m.local }}</small></div><button class="icon-btn" type="button" (click)="removerMomento(m)" [attr.aria-label]="'Remover ' + m.titulo"><svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg></button></li>
      </ol>
    </ng-container>

    <!-- DEFINIÇÕES -->
    <ng-container *ngIf="secao === 'definicoes'">
      <header class="page-head"><div><p class="eyebrow">Definições</p><h1>Dados do casamento e conta</h1></div></header>
      <form class="card settings" (ngSubmit)="guardarDefinicoes()">
        <h2>Casamento</h2>
        <div class="fields">
          <label>Nome do casal<input name="sn" [(ngModel)]="cfg.nome" maxlength="80" required></label>
          <label>Data do casamento<input name="sd" type="date" [(ngModel)]="cfg.data"></label>
          <label>Local da celebração<input name="sl" [(ngModel)]="cfg.local" maxlength="100"></label>
          <label>Nº estimado de convidados<input name="se" type="number" min="0" [(ngModel)]="cfg.convidadosEst"></label>
          <label>Orçamento total (MT)<input name="so" type="number" min="0" [(ngModel)]="cfg.orcamento"></label>
        </div>
        <button class="btn" type="submit">Guardar alterações</button>
      </form>
      <section class="card settings">
        <h2>Conta</h2>
        <p class="forn-line"><span>Email</span>{{ email }}</p>
        <p class="forn-line"><span>Tipo de conta</span>Casal</p>
      </section>
      <section class="card settings">
        <h2>Os vossos dados</h2>
        <p class="muted">Os dados do painel ficam guardados neste dispositivo.</p>
        <div class="btns">
          <button class="btn ghost" type="button" (click)="exportarTudo()">Exportar dados (JSON)</button>
          <button class="btn danger" type="button" (click)="repor()">Repor painel</button>
          <button class="btn" type="button" (click)="logout()">Terminar sessão</button>
        </div>
      </section>
    </ng-container>
  </main>
</div>
`,
  styles: [`
:host{display:flex;flex-direction:column;min-height:100vh;background:#f6f8fa;color:#000;font-family:Inter,Arial,sans-serif}
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
`]
})
export class DashboardCasalComponent implements OnDestroy {
  ready = false;
  secao: Secao = 'visao';
  email = '';
  initials = '';
  toastMsg = '';
  private toastTimer?: ReturnType<typeof setTimeout>;
  private sub?: Subscription;
  private key = '';

  d: Dados = this.vazio();
  cfg: Casamento = { ...this.d.casamento };

  readonly secoes: { key: Secao; label: string; icon: string }[] = [
    { key: 'visao', label: 'Visão geral', icon: 'M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10' },
    { key: 'checklist', label: 'Checklist', icon: 'M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9' },
    { key: 'orcamento', label: 'Orçamento', icon: 'M12 2v20M17 6.5C17 4.6 14.8 3.5 12 3.5S7 4.6 7 6.5 9.2 9.5 12 10s5 1.6 5 3.5-2.2 3-5 3-5-1.1-5-3' },
    { key: 'convidados', label: 'Convidados', icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8' },
    { key: 'mesas', label: 'Mesas', icon: 'M4 9h16M6 9v10M18 9v10M3 9l1-4h16l1 4' },
    { key: 'fornecedores', label: 'Fornecedores', icon: 'M20 7h-4V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zM10 5h4v2h-4z' },
    { key: 'cronograma', label: 'Cronograma', icon: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z' },
    { key: 'definicoes', label: 'Definições', icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z' }
  ];
  readonly categoriasOrc = ['Espaço e salão', 'Buffet e catering', 'Fotografia e vídeo', 'Decoração e flores', 'Música e animação', 'Bolos e doces', 'Trajes e beleza', 'Transporte', 'Outros'];
  readonly categoriasTarefa = ['Planeamento', 'Espaço', 'Convidados', 'Fornecedores', 'Trajes', 'Documentação', 'Grande dia'];
  readonly grupos = ['Família do noivo', 'Família da noiva', 'Amigos', 'Trabalho', 'Outros'];
  readonly filtrosTarefa = [{ key: 'todas', label: 'Todas' }, { key: 'pendentes', label: 'Pendentes' }, { key: 'atrasadas', label: 'Em atraso' }, { key: 'feitas', label: 'Concluídas' }];
  readonly filtrosRsvp = [{ key: 'todos', label: 'Todos' }, { key: 'confirmado', label: 'Confirmados' }, { key: 'pendente', label: 'Pendentes' }, { key: 'recusado', label: 'Recusaram' }];

  fTarefa = 'todas'; fConv = 'todos'; qConv = '';
  nt = { titulo: '', categoria: 'Planeamento', prazo: '' };
  nd = { descricao: '', categoria: 'Espaço e salão', estimado: 0, pago: 0 };
  ng = { nome: '', grupo: 'Amigos', contacto: '', acompanhantes: 0 };
  nm = { nome: '', lugares: 8 };
  nf = { nome: '', categoria: 'Fotografia e vídeo', contacto: '', valor: 0 };
  nmo = { hora: '', titulo: '', local: '' };

  constructor(private route: ActivatedRoute, private router: Router) {
    const u = this.sessao();
    if (!u) { this.router.navigate(['/login']); return; }
    if (u.tipo === 'admin') { this.router.navigate(['/admin']); return; }
    if (u.tipo === 'fornecedor') { this.router.navigate(['/dashboard-fornecedor']); return; }
    this.email = String(u.email || '');
    this.key = 'elace_casal_' + this.email.toLowerCase();
    this.initials = this.iniciais(u);
    this.carregar(u);
    this.ready = true;
    this.sub = this.route.queryParamMap.subscribe(p => {
      const s = p.get('secao') as Secao | null;
      this.secao = s && this.secoes.some(x => x.key === s) ? s : 'visao';
      this.cfg = { ...this.d.casamento };
      window.scrollTo({ top: 0 });
    });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); if (this.toastTimer) clearTimeout(this.toastTimer); }

  /* ---------- Sessão e persistência ---------- */
  private sessao(): any {
    try { const raw = localStorage.getItem('elace_user'); return raw ? JSON.parse(raw) : null; } catch { return null; }
  }
  private iniciais(u: any): string {
    const f = (x: string) => (x || '').trim().charAt(0).toUpperCase();
    if (u.noivo || u.noiva) return f(u.noivo) + (u.noivo && u.noiva ? '&' : '') + f(u.noiva);
    return f(u.nome) || f(u.email) || '?';
  }
  private vazio(): Dados {
    return { casamento: { nome: '', data: '', local: '', convidadosEst: 0, orcamento: 0 }, tarefas: [], despesas: [], convidados: [], mesas: [], fornecedores: [], cronograma: [], notas: '' };
  }
  private carregar(u: any) {
    let saved: Dados | null = null;
    try { const raw = localStorage.getItem(this.key); if (raw) saved = JSON.parse(raw); } catch {}
    const base = this.vazio();
    this.d = saved ? { ...base, ...saved, casamento: { ...base.casamento, ...(saved.casamento || {}) } } : base;
    if (!saved) {
      const nomes = [u.noivo, u.noiva].filter(Boolean).join(' & ');
      this.d.casamento.nome = nomes || u.nome || '';
      try { const w = JSON.parse(localStorage.getItem('elace_wedding') || 'null'); if (w) this.d.casamento = { ...this.d.casamento, nome: w.nome || this.d.casamento.nome, data: w.data || '', local: w.local || '' }; } catch {}
      this.save();
    }
    this.cfg = { ...this.d.casamento };
  }
  save() { try { localStorage.setItem(this.key, JSON.stringify(this.d)); } catch {} }
  toast(msg: string) { this.toastMsg = msg; if (this.toastTimer) clearTimeout(this.toastTimer); this.toastTimer = setTimeout(() => this.toastMsg = '', 2400); }
  private uid() { return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3); }

  /* ---------- Formatação e cálculos ---------- */
  mt(v: number) { return new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(Number(v) || 0) + ' MT'; }
  pct(a: number, b: number) { return b > 0 ? Math.max(0, Math.min(100, Math.round((a / b) * 100))) : 0; }
  get primeirosNomes() { return this.d.casamento.nome || 'bem-vindos'; }
  get dataLonga() {
    if (!this.d.casamento.data) return '';
    const dt = new Date(this.d.casamento.data + 'T00:00:00');
    return isNaN(dt.getTime()) ? '' : dt.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  get dias() {
    const dt = new Date(this.d.casamento.data + 'T00:00:00'); const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    return Math.round((dt.getTime() - hoje.getTime()) / 86400000);
  }
  get tarefasFeitas() { return this.d.tarefas.filter(t => t.feito).length; }
  get totalEstimado() { return this.d.despesas.reduce((s, x) => s + (Number(x.estimado) || 0), 0); }
  get totalPago() { return this.d.despesas.reduce((s, x) => s + (Number(x.pago) || 0), 0); }
  get restante() { return (Number(this.d.casamento.orcamento) || 0) - this.totalEstimado; }
  get excedido() { return this.d.casamento.orcamento > 0 && this.totalEstimado > this.d.casamento.orcamento; }
  get reservados() { return this.d.fornecedores.filter(f => f.estado !== 'contactado').length; }
  get atrasadas() { return this.d.tarefas.filter(t => this.atrasada(t)).length; }
  get progressoGeral() {
    const partes = [this.pct(this.tarefasFeitas, this.d.tarefas.length), this.pct(this.pessoas('confirmado'), this.pessoas()), this.pct(this.reservados, this.d.fornecedores.length), this.pct(this.totalPago, this.totalEstimado)];
    const ativas = [this.d.tarefas.length, this.d.convidados.length, this.d.fornecedores.length, this.d.despesas.length].map(n => n > 0);
    const usadas = partes.filter((_, i) => ativas[i]);
    return usadas.length ? Math.round(usadas.reduce((a, b) => a + b, 0) / usadas.length) : 0;
  }
  get porCategoria() {
    const m = new Map<string, number>();
    this.d.despesas.forEach(x => m.set(x.categoria, (m.get(x.categoria) || 0) + (Number(x.estimado) || 0)));
    return [...m.entries()].map(([categoria, estimado]) => ({ categoria, estimado })).sort((a, b) => b.estimado - a.estimado);
  }
  get maxCategoria() { return this.porCategoria.length ? this.porCategoria[0].estimado : 0; }
  badge(k: Secao): string {
    const n = k === 'checklist' ? this.d.tarefas.filter(t => !t.feito).length : k === 'convidados' ? this.d.convidados.length : k === 'fornecedores' ? this.d.fornecedores.length : 0;
    return n ? String(n) : '';
  }

  /* ---------- Checklist ---------- */
  atrasada(t: Tarefa) { return !t.feito && !!t.prazo && t.prazo < new Date().toISOString().slice(0, 10); }
  get proximas() { return this.d.tarefas.filter(t => !t.feito).sort((a, b) => (a.prazo || '9999').localeCompare(b.prazo || '9999')).slice(0, 5); }
  get tarefasView() {
    const f = this.fTarefa;
    return this.d.tarefas
      .filter(t => f === 'todas' || (f === 'pendentes' && !t.feito) || (f === 'feitas' && t.feito) || (f === 'atrasadas' && this.atrasada(t)))
      .sort((a, b) => Number(a.feito) - Number(b.feito) || (a.prazo || '9999').localeCompare(b.prazo || '9999'));
  }
  addTarefa() {
    const titulo = this.nt.titulo.trim(); if (!titulo) return;
    this.d.tarefas.push({ id: this.uid(), titulo, categoria: this.nt.categoria, prazo: this.nt.prazo, feito: false });
    this.nt.titulo = ''; this.nt.prazo = ''; this.save(); this.toast('Tarefa adicionada.');
  }
  toggleTarefa(t: Tarefa) { t.feito = !t.feito; this.save(); }
  removerTarefa(t: Tarefa) { this.d.tarefas = this.d.tarefas.filter(x => x.id !== t.id); this.save(); }
  carregarSugeridas() {
    const base: [string, string, number][] = [
      ['Definir orçamento total', 'Planeamento', 12], ['Escolher a data do casamento', 'Planeamento', 12], ['Reservar o espaço da celebração', 'Espaço', 10],
      ['Fazer a primeira lista de convidados', 'Convidados', 10], ['Contratar fotógrafo e vídeo', 'Fornecedores', 9], ['Escolher o buffet e provar o menu', 'Fornecedores', 8],
      ['Reservar música ou DJ', 'Fornecedores', 7], ['Escolher trajes dos noivos', 'Trajes', 6], ['Encomendar o bolo', 'Fornecedores', 4],
      ['Tratar da documentação do casamento', 'Documentação', 4], ['Enviar convites', 'Convidados', 3], ['Confirmar presenças (RSVP)', 'Convidados', 1], ['Distribuir convidados pelas mesas', 'Convidados', 1], ['Confirmar horários com todos os fornecedores', 'Grande dia', 0]
    ];
    const ref = this.d.casamento.data ? new Date(this.d.casamento.data + 'T00:00:00') : null;
    const existentes = new Set(this.d.tarefas.map(t => t.titulo.toLowerCase()));
    let n = 0;
    base.forEach(([titulo, categoria, meses]) => {
      if (existentes.has(titulo.toLowerCase())) return;
      let prazo = '';
      if (ref && !isNaN(ref.getTime())) { const p = new Date(ref); p.setMonth(p.getMonth() - meses); prazo = p.toISOString().slice(0, 10); }
      this.d.tarefas.push({ id: this.uid(), titulo, categoria, prazo, feito: false }); n++;
    });
    this.save(); this.toast(n ? `${n} tarefas adicionadas.` : 'A checklist sugerida já foi carregada.');
  }

  /* ---------- Orçamento ---------- */
  estadoDespesa(x: Despesa) {
    const e = Number(x.estimado) || 0, p = Number(x.pago) || 0;
    if (e > 0 && p >= e) return { txt: 'Pago', cls: 'ok' };
    if (p > 0) return { txt: 'Parcial', cls: 'pen' };
    return { txt: 'Por pagar', cls: 'no' };
  }
  addDespesa() {
    const descricao = this.nd.descricao.trim(); if (!descricao) return;
    this.d.despesas.push({ id: this.uid(), descricao, categoria: this.nd.categoria, estimado: Number(this.nd.estimado) || 0, pago: Number(this.nd.pago) || 0 });
    this.nd.descricao = ''; this.nd.estimado = 0; this.nd.pago = 0; this.save(); this.toast('Despesa adicionada.');
  }
  removerDespesa(x: Despesa) { this.d.despesas = this.d.despesas.filter(y => y.id !== x.id); this.save(); }

  /* ---------- Convidados ---------- */
  pessoas(estado?: Rsvp) { return this.d.convidados.filter(g => !estado || g.estado === estado).reduce((s, g) => s + 1 + (Number(g.acompanhantes) || 0), 0); }
  get convidadosView() {
    const q = this.qConv.trim().toLowerCase();
    return this.d.convidados.filter(g => (this.fConv === 'todos' || g.estado === this.fConv) && (!q || g.nome.toLowerCase().includes(q) || g.grupo.toLowerCase().includes(q)))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt'));
  }
  addConvidado() {
    const nome = this.ng.nome.trim(); if (!nome) return;
    this.d.convidados.push({ id: this.uid(), nome, grupo: this.ng.grupo, contacto: this.ng.contacto.trim(), acompanhantes: Math.max(0, Math.min(10, Number(this.ng.acompanhantes) || 0)), estado: 'pendente', mesa: '' });
    this.ng.nome = ''; this.ng.contacto = ''; this.ng.acompanhantes = 0; this.save(); this.toast('Convidado adicionado.');
  }
  removerConvidado(g: Convidado) { this.d.convidados = this.d.convidados.filter(x => x.id !== g.id); this.save(); }
  exportarConvidados() {
    const esc = (v: string | number) => '"' + String(v).replace(/"/g, '""') + '"';
    const linhas = [['Nome', 'Grupo', 'Contacto', 'Acompanhantes', 'RSVP', 'Mesa'].join(',')]
      .concat(this.d.convidados.map(g => [g.nome, g.grupo, g.contacto, g.acompanhantes, g.estado, this.nomeMesa(g.mesa)].map(esc).join(',')));
    this.baixar('convidados.csv', '\ufeff' + linhas.join('\n'), 'text/csv;charset=utf-8');
  }

  /* ---------- Mesas ---------- */
  get semMesa() { return this.d.convidados.filter(g => !g.mesa || !this.d.mesas.some(m => m.id === g.mesa)); }
  nomeMesa(id: string) { return this.d.mesas.find(m => m.id === id)?.nome || '—'; }
  convidadosDaMesa(m: Mesa) { return this.d.convidados.filter(g => g.mesa === m.id); }
  ocupacao(m: Mesa) { return this.convidadosDaMesa(m).reduce((s, g) => s + 1 + (Number(g.acompanhantes) || 0), 0); }
  addMesa() {
    const nome = this.nm.nome.trim(); if (!nome) return;
    this.d.mesas.push({ id: this.uid(), nome, lugares: Math.max(1, Number(this.nm.lugares) || 8) });
    this.nm.nome = ''; this.save(); this.toast('Mesa criada.');
  }
  removerMesa(m: Mesa) { this.d.convidados.forEach(g => { if (g.mesa === m.id) g.mesa = ''; }); this.d.mesas = this.d.mesas.filter(x => x.id !== m.id); this.save(); }
  atribuir(g: Convidado, mesaId: string) { g.mesa = mesaId; this.save(); }

  /* ---------- Fornecedores ---------- */
  addFornecedor() {
    const nome = this.nf.nome.trim(); if (!nome) return;
    this.d.fornecedores.push({ id: this.uid(), nome, categoria: this.nf.categoria, contacto: this.nf.contacto.trim(), valor: Number(this.nf.valor) || 0, estado: 'contactado' });
    this.nf.nome = ''; this.nf.contacto = ''; this.nf.valor = 0; this.save(); this.toast('Fornecedor adicionado.');
  }
  removerFornecedor(f: Contratado) { this.d.fornecedores = this.d.fornecedores.filter(x => x.id !== f.id); this.save(); }

  /* ---------- Cronograma ---------- */
  get cronogramaOrdenado() { return [...this.d.cronograma].sort((a, b) => a.hora.localeCompare(b.hora)); }
  addMomento() {
    const titulo = this.nmo.titulo.trim(); if (!titulo || !this.nmo.hora) return;
    this.d.cronograma.push({ id: this.uid(), hora: this.nmo.hora, titulo, local: this.nmo.local.trim() });
    this.nmo = { hora: '', titulo: '', local: '' }; this.save(); this.toast('Momento adicionado.');
  }
  removerMomento(m: Momento) { this.d.cronograma = this.d.cronograma.filter(x => x.id !== m.id); this.save(); }
  carregarCronograma() {
    const l = this.d.casamento.local;
    const base: [string, string, string][] = [['12:00', 'Preparação dos noivos', ''], ['14:30', 'Chegada dos convidados', l], ['15:00', 'Cerimónia', l], ['16:00', 'Sessão fotográfica', ''], ['17:30', 'Receção e aperitivos', l], ['19:00', 'Entrada dos noivos e jantar', l], ['21:00', 'Corte do bolo e primeira dança', l], ['22:00', 'Festa e animação', l]];
    this.d.cronograma = base.map(([hora, titulo, local]) => ({ id: this.uid(), hora, titulo, local })); this.save();
  }

  /* ---------- Definições ---------- */
  guardarDefinicoes() {
    this.d.casamento = { ...this.cfg, convidadosEst: Number(this.cfg.convidadosEst) || 0, orcamento: Number(this.cfg.orcamento) || 0 };
    this.save(); this.toast('Alterações guardadas.');
  }
  exportarTudo() { this.baixar('elace-casamento.json', JSON.stringify(this.d, null, 2), 'application/json'); }
  repor() {
    if (!confirm('Tem a certeza? Todas as tarefas, despesas, convidados e mesas serão apagados.')) return;
    const c = this.d.casamento; this.d = { ...this.vazio(), casamento: c }; this.save(); this.toast('Painel reposto.');
  }
  logout() { localStorage.removeItem('elace_token'); localStorage.removeItem('elace_user'); location.href = '/login'; }
  private baixar(nome: string, conteudo: string, tipo: string) {
    const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
    const a = document.createElement('a'); a.href = url; a.download = nome; a.click(); URL.revokeObjectURL(url);
  }
}
