import { Component, OnDestroy } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { HeaderComponent } from './header.component';

type Secao = 'visao' | 'pedidos' | 'agenda' | 'servicos' | 'financas' | 'avaliacoes' | 'perfil' | 'definicoes';
type Estado = 'novo' | 'respondido' | 'orcamentado' | 'confirmado' | 'recusado';

interface Pedido { id: string; casal: string; contacto: string; servico: string; data: string; local: string; convidados: number; mensagem: string; recebido: string; estado: Estado; valor: number; pago: number; }
interface Servico { id: string; nome: string; descricao: string; preco: number; unidade: string; ativo: boolean; }
interface Avaliacao { id: string; autor: string; nota: number; texto: string; data: string; resposta: string; }
interface Bloqueio { id: string; data: string; motivo: string; }
interface Perfil { nome: string; categoria: string; cidade: string; descricao: string; telefone: string; whatsapp: string; email: string; website: string; visivel: boolean; }
interface Prefs { emailPedidos: boolean; resumoSemanal: boolean; lembretes: boolean; }
interface Dados { perfil: Perfil; pedidos: Pedido[]; servicos: Servico[]; avaliacoes: Avaliacao[]; bloqueios: Bloqueio[]; prefs: Prefs; notas: string; }
interface Dia { iso: string; dia: number; fora: boolean; hoje: boolean; eventos: Pedido[]; bloqueio?: Bloqueio; }

@Component({
  selector: 'elace-dashboard-fornecedor',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, FormsModule, RouterLink, HeaderComponent],
  template: `
<elace-header />
<div class="shell" *ngIf="ready">
  <aside class="side" aria-label="Painel do fornecedor">
    <div class="side-card">
      <span class="side-avatar">{{ initials }}</span>
      <div class="side-who"><strong>{{ d.perfil.nome || 'O meu negócio' }}</strong><small>{{ d.perfil.categoria || 'Categoria por definir' }}</small></div>
    </div>
    <nav class="side-nav">
      <a *ngFor="let s of secoes" [routerLink]="[]" [queryParams]="{ secao: s.key }" [class.active]="secao === s.key" [attr.aria-current]="secao === s.key ? 'page' : null">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="s.icon"/></svg>
        <span>{{ s.label }}</span>
        <em *ngIf="badge(s.key) as b">{{ b }}</em>
      </a>
    </nav>
    <a class="side-cta" routerLink="/fornecedores">Ver o marketplace <span aria-hidden="true">↗</span></a>
  </aside>

  <main class="main">
    <div class="toast" role="status" aria-live="polite" *ngIf="toastMsg">{{ toastMsg }}</div>

    <!-- VISÃO GERAL -->
    <ng-container *ngIf="secao === 'visao'">
      <header class="page-head">
        <div><p class="eyebrow">Visão geral</p><h1>Olá, {{ d.perfil.nome || 'bem-vindo' }}</h1><p class="muted">O ponto de situação do vosso negócio na Elace.</p></div>
        <button class="btn" type="button" (click)="abrir('pedidos')">Registar pedido</button>
      </header>

      <section class="hero-card">
        <div>
          <p class="eyebrow light">Receita contratada</p>
          <p class="count"><strong>{{ mt(receitaContratada) }}</strong></p>
          <p class="hero-sub">{{ confirmados.length }} {{ confirmados.length === 1 ? 'reserva confirmada' : 'reservas confirmadas' }} · {{ mt(aReceber) }} por receber</p>
        </div>
        <div class="hero-prog">
          <span>Perfil público completo</span>
          <div class="bar big"><i [style.width.%]="completude"></i></div>
          <strong>{{ completude }}%</strong>
        </div>
      </section>

      <div class="alerts" *ngIf="novos > 0 || !d.perfil.visivel || faltaPerfil.length">
        <p class="alert warn" *ngIf="novos > 0"><b>{{ novos }}</b> {{ novos === 1 ? 'pedido novo à espera de resposta' : 'pedidos novos à espera de resposta' }}. <a [routerLink]="[]" [queryParams]="{ secao: 'pedidos' }">Ver pedidos</a></p>
        <p class="alert danger" *ngIf="!d.perfil.visivel">O vosso perfil está oculto e não aparece no marketplace. <a [routerLink]="[]" [queryParams]="{ secao: 'perfil' }">Publicar perfil</a></p>
        <p class="alert warn" *ngIf="faltaPerfil.length">Para completar o perfil falta: {{ faltaPerfil.join(', ') }}. <a [routerLink]="[]" [queryParams]="{ secao: 'perfil' }">Completar</a></p>
      </div>

      <section class="kpis">
        <article class="kpi"><span>Pedidos novos</span><strong>{{ novos }}<small>/{{ d.pedidos.length }}</small></strong><div class="bar"><i [style.width.%]="pct(novos, d.pedidos.length)"></i></div></article>
        <article class="kpi"><span>Taxa de conversão</span><strong>{{ conversao }}%</strong><div class="bar"><i [style.width.%]="conversao"></i></div></article>
        <article class="kpi"><span>Recebido</span><strong>{{ mt(recebido) }}</strong><div class="bar"><i [style.width.%]="pct(recebido, receitaContratada)"></i></div><small class="kpi-note">de {{ mt(receitaContratada) }}</small></article>
        <article class="kpi"><span>Avaliação média</span><strong>{{ media ? media.toFixed(1) : '—' }}<small> / 5</small></strong><span class="stars">{{ stars(media) }}</span></article>
      </section>

      <section class="grid2">
        <article class="card">
          <div class="card-head"><h2>Próximas reservas</h2><a [routerLink]="[]" [queryParams]="{ secao: 'agenda' }">Agenda</a></div>
          <p class="empty" *ngIf="!proximas.length">Sem reservas futuras confirmadas.</p>
          <ul class="todo">
            <li *ngFor="let p of proximas"><span><b>{{ p.casal }}</b><br><small>{{ p.servico || 'Serviço' }}</small></span><small>{{ dataCurta(p.data) }}</small></li>
          </ul>
        </article>
        <article class="card">
          <div class="card-head"><h2>Pedidos recentes</h2><a [routerLink]="[]" [queryParams]="{ secao: 'pedidos' }">Ver todos</a></div>
          <p class="empty" *ngIf="!recentes.length">Ainda não há pedidos registados.</p>
          <ul class="todo">
            <li *ngFor="let p of recentes"><span><b>{{ p.casal }}</b><br><small>{{ p.servico || 'Serviço' }}</small></span><span class="pill" [ngClass]="classeEstado(p.estado)">{{ rotulo(p.estado) }}</span></li>
          </ul>
        </article>
        <article class="card">
          <div class="card-head"><h2>Funil de pedidos</h2></div>
          <div class="cat" *ngFor="let f of funil">
            <div><span>{{ f.label }}</span><b>{{ f.n }}</b></div>
            <div class="bar"><i [style.width.%]="pct(f.n, d.pedidos.length)"></i></div>
          </div>
        </article>
        <article class="card">
          <div class="card-head"><h2>Notas</h2></div>
          <textarea class="notes" rows="6" [(ngModel)]="d.notas" (ngModelChange)="save()" placeholder="Lembretes, ideias, contactos…" aria-label="Notas"></textarea>
        </article>
      </section>
    </ng-container>

    <!-- PEDIDOS -->
    <ng-container *ngIf="secao === 'pedidos'">
      <header class="page-head">
        <div><p class="eyebrow">Pedidos</p><h1>Solicitações de casais</h1><p class="muted">{{ d.pedidos.length }} {{ d.pedidos.length === 1 ? 'pedido' : 'pedidos' }} · {{ novos }} por responder.</p></div>
        <button class="btn ghost" type="button" (click)="exportarPedidos()" [disabled]="!d.pedidos.length">Exportar CSV</button>
      </header>
      <form class="card add" (ngSubmit)="addPedido()">
        <label class="grow">Casal<input name="pc" [(ngModel)]="np.casal" maxlength="80" placeholder="Ex.: João e Ana" required></label>
        <label>Contacto<input name="pt" [(ngModel)]="np.contacto" maxlength="40" placeholder="84 123 4567"></label>
        <label>Serviço<select name="ps" [(ngModel)]="np.servico"><option value="">Escolher…</option><option *ngFor="let s of d.servicos" [value]="s.nome">{{ s.nome }}</option><option value="Outro">Outro</option></select></label>
        <label>Data do evento<input name="pd" type="date" [(ngModel)]="np.data"></label>
        <label class="narrow">Convidados<input name="pg" type="number" min="0" [(ngModel)]="np.convidados"></label>
        <button class="btn" type="submit">Registar</button>
      </form>
      <div class="toolbar">
        <input class="tsearch" type="search" [(ngModel)]="qPed" placeholder="Pesquisar casal ou serviço…" aria-label="Pesquisar pedidos">
        <div class="filters">
          <button type="button" *ngFor="let f of filtros" [class.on]="fPed === f.key" (click)="fPed = f.key">{{ f.label }} <span *ngIf="contar(f.key) as c">({{ c }})</span></button>
        </div>
      </div>
      <section class="card flush">
        <p class="empty pad" *ngIf="!pedidosView.length">Nenhum pedido encontrado.</p>
        <div class="table-wrap" *ngIf="pedidosView.length">
          <table>
            <thead><tr><th>Casal</th><th>Serviço</th><th>Evento</th><th class="num">Valor (MT)</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              <tr *ngFor="let p of pedidosView">
                <td><strong>{{ p.casal }}</strong><br><small class="sub">{{ p.contacto || 'Sem contacto' }} · {{ p.convidados }} convidados</small></td>
                <td>{{ p.servico || '—' }}</td>
                <td>{{ p.data ? dataCurta(p.data) : '—' }}</td>
                <td class="num"><input class="cell" type="number" min="0" [(ngModel)]="p.valor" (ngModelChange)="save()" [attr.aria-label]="'Valor de ' + p.casal"></td>
                <td><select class="cell sel" [ngClass]="p.estado" [(ngModel)]="p.estado" (ngModelChange)="mudou(p)" [attr.aria-label]="'Estado de ' + p.casal"><option *ngFor="let e of estados" [value]="e.key">{{ e.label }}</option></select></td>
                <td class="acts">
                  <a class="icon-btn ok" *ngIf="wa(p.contacto) as l" [href]="l" target="_blank" rel="noopener" [attr.aria-label]="'WhatsApp ' + p.casal" title="WhatsApp"><svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 0 1-13.4 7.8L3 21l1.3-4.4A9 9 0 1 1 21 12z"/></svg></a>
                  <button class="icon-btn" type="button" (click)="removerPedido(p)" [attr.aria-label]="'Remover ' + p.casal"><svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </ng-container>

    <!-- AGENDA -->
    <ng-container *ngIf="secao === 'agenda'">
      <header class="page-head">
        <div><p class="eyebrow">Agenda</p><h1>Disponibilidade e reservas</h1><p class="muted">Cliquem num dia para ver detalhes ou bloqueá-lo.</p></div>
      </header>
      <section class="agenda">
        <article class="card cal-card">
          <div class="cal-head">
            <button class="icon-btn" type="button" (click)="mudarMes(-1)" aria-label="Mês anterior"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg></button>
            <h2>{{ tituloMes }}</h2>
            <button class="icon-btn" type="button" (click)="mudarMes(1)" aria-label="Mês seguinte"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button>
          </div>
          <div class="cal">
            <span class="wd" *ngFor="let w of semana">{{ w }}</span>
            <button type="button" class="day" *ngFor="let c of calendario" [class.out]="c.fora" [class.today]="c.hoje" [class.sel]="sel === c.iso" [class.block]="!!c.bloqueio" [class.has]="c.eventos.length > 0" (click)="sel = c.iso" [attr.aria-label]="c.iso">
              <span>{{ c.dia }}</span><i *ngIf="c.eventos.length"></i>
            </button>
          </div>
          <ul class="legend inline"><li><i class="s-ok"></i>Reserva</li><li><i class="s-no"></i>Bloqueado</li><li><i class="s-pen"></i>Hoje</li></ul>
        </article>
        <article class="card" *ngIf="sel">
          <div class="card-head"><h2>{{ dataLonga(sel) }}</h2></div>
          <p class="empty" *ngIf="!eventosDia(sel).length && !bloqueioDia(sel)">Dia livre.</p>
          <ul class="todo"><li *ngFor="let p of eventosDia(sel)"><span><b>{{ p.casal }}</b><br><small>{{ p.servico || 'Serviço' }} · {{ p.local || 'Local por definir' }}</small></span><span class="pill" [ngClass]="classeEstado(p.estado)">{{ rotulo(p.estado) }}</span></li></ul>
          <ng-container *ngIf="bloqueioDia(sel) as b; else bloquear">
            <p class="alert danger">Bloqueado: {{ b.motivo || 'Indisponível' }}</p>
            <button class="btn ghost" type="button" (click)="desbloquear(b)">Desbloquear dia</button>
          </ng-container>
          <ng-template #bloquear>
            <label>Motivo (opcional)<input [(ngModel)]="motivo" maxlength="60" placeholder="Ex.: Outro evento, férias"></label>
            <button class="btn" type="button" style="margin-top:12px" (click)="bloquearDia()">Bloquear dia</button>
          </ng-template>
        </article>
      </section>
      <section class="card">
        <div class="card-head"><h2>Reservas confirmadas</h2></div>
        <p class="empty" *ngIf="!confirmados.length">Sem reservas confirmadas.</p>
        <ul class="rows tight"><li *ngFor="let p of confirmadosOrdenados"><div class="row-main"><strong>{{ p.casal }}</strong><small>{{ p.servico || 'Serviço' }} · {{ p.local || 'Local por definir' }}</small></div><span class="pill ok">{{ p.data ? dataCurta(p.data) : 'Sem data' }}</span></li></ul>
      </section>
    </ng-container>

    <!-- SERVIÇOS -->
    <ng-container *ngIf="secao === 'servicos'">
      <header class="page-head">
        <div><p class="eyebrow">Serviços</p><h1>Catálogo e preços</h1><p class="muted">{{ servicosAtivos }} {{ servicosAtivos === 1 ? 'serviço ativo' : 'serviços ativos' }} no perfil público.</p></div>
      </header>
      <form class="card add" (ngSubmit)="addServico()">
        <label class="grow">Serviço<input name="sn" [(ngModel)]="ns.nome" maxlength="60" placeholder="Ex.: Cobertura fotográfica completa" required></label>
        <label>Preço (MT)<input name="sp" type="number" min="0" [(ngModel)]="ns.preco"></label>
        <label>Unidade<select name="su" [(ngModel)]="ns.unidade"><option>evento</option><option>hora</option><option>pessoa</option><option>pacote</option></select></label>
        <label class="grow">Descrição<input name="sd" [(ngModel)]="ns.descricao" maxlength="140" placeholder="O que está incluído"></label>
        <button class="btn" type="submit">Adicionar</button>
      </form>
      <p class="empty" *ngIf="!d.servicos.length">Ainda não adicionaram serviços.</p>
      <section class="cards3">
        <article class="card forn" *ngFor="let s of d.servicos" [class.off]="!s.ativo">
          <div class="card-head"><div><h2>{{ s.nome }}</h2><small>{{ s.descricao || 'Sem descrição' }}</small></div><button class="icon-btn" type="button" (click)="removerServico(s)" [attr.aria-label]="'Remover ' + s.nome"><svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg></button></div>
          <p class="forn-line"><span>Preço</span><b>{{ mt(s.preco) }} / {{ s.unidade }}</b></p>
          <label class="switch"><input type="checkbox" [(ngModel)]="s.ativo" (ngModelChange)="save()"><span></span>{{ s.ativo ? 'Visível no perfil' : 'Oculto' }}</label>
        </article>
      </section>
    </ng-container>

    <!-- FINANÇAS -->
    <ng-container *ngIf="secao === 'financas'">
      <header class="page-head">
        <div><p class="eyebrow">Finanças</p><h1>Receitas e pagamentos</h1><p class="muted">Valores em meticais (MT), com base nas reservas confirmadas.</p></div>
      </header>
      <section class="kpis">
        <article class="kpi"><span>Receita contratada</span><strong>{{ mt(receitaContratada) }}</strong></article>
        <article class="kpi"><span>Recebido</span><strong>{{ mt(recebido) }}</strong><div class="bar"><i [style.width.%]="pct(recebido, receitaContratada)"></i></div></article>
        <article class="kpi"><span>A receber</span><strong [class.neg]="aReceber > 0">{{ mt(aReceber) }}</strong></article>
        <article class="kpi"><span>Valor médio por reserva</span><strong>{{ mt(ticket) }}</strong></article>
      </section>
      <section class="grid2">
        <article class="card">
          <div class="card-head"><h2>Receita por mês</h2></div>
          <p class="empty" *ngIf="!receitaMeses.length">Sem reservas com data para mostrar.</p>
          <div class="cat" *ngFor="let m of receitaMeses"><div><span>{{ m.label }}</span><b>{{ mt(m.valor) }}</b></div><div class="bar"><i [style.width.%]="pct(m.valor, maxMes)"></i></div></div>
        </article>
        <article class="card">
          <div class="card-head"><h2>Por serviço</h2></div>
          <p class="empty" *ngIf="!receitaServicos.length">Sem dados ainda.</p>
          <div class="cat" *ngFor="let m of receitaServicos"><div><span>{{ m.label }}</span><b>{{ mt(m.valor) }}</b></div><div class="bar"><i [style.width.%]="pct(m.valor, receitaServicos[0].valor)"></i></div></div>
        </article>
      </section>
      <section class="card flush" style="margin-top:18px">
        <p class="empty pad" *ngIf="!confirmados.length">Confirmem reservas na secção Pedidos para acompanhar pagamentos.</p>
        <div class="table-wrap" *ngIf="confirmados.length">
          <table>
            <thead><tr><th>Casal</th><th>Serviço</th><th class="num">Valor</th><th class="num">Pago</th><th>Estado</th></tr></thead>
            <tbody>
              <tr *ngFor="let p of confirmadosOrdenados">
                <td><strong>{{ p.casal }}</strong></td><td>{{ p.servico || '—' }}</td>
                <td class="num">{{ mt(p.valor) }}</td>
                <td class="num"><input class="cell" type="number" min="0" [(ngModel)]="p.pago" (ngModelChange)="save()" [attr.aria-label]="'Pago por ' + p.casal"></td>
                <td><span class="pill" [ngClass]="estadoPagamento(p).cls">{{ estadoPagamento(p).txt }}</span></td>
              </tr>
            </tbody>
            <tfoot><tr><td colspan="2">Total</td><td class="num">{{ mt(receitaContratada) }}</td><td class="num">{{ mt(recebido) }}</td><td></td></tr></tfoot>
          </table>
        </div>
      </section>
    </ng-container>

    <!-- AVALIAÇÕES -->
    <ng-container *ngIf="secao === 'avaliacoes'">
      <header class="page-head">
        <div><p class="eyebrow">Avaliações</p><h1>O que dizem os casais</h1><p class="muted">{{ d.avaliacoes.length }} {{ d.avaliacoes.length === 1 ? 'avaliação' : 'avaliações' }} · média {{ media ? media.toFixed(1) : '—' }} <span class="stars">{{ stars(media) }}</span></p></div>
      </header>
      <form class="card add" (ngSubmit)="addAvaliacao()">
        <label>Casal<input name="an" [(ngModel)]="na.autor" maxlength="60" placeholder="Ex.: Carla e Pedro" required></label>
        <label class="narrow">Nota<select name="ao" [(ngModel)]="na.nota"><option *ngFor="let n of [5,4,3,2,1]" [ngValue]="n">{{ n }} ★</option></select></label>
        <label class="grow">Comentário<input name="at" [(ngModel)]="na.texto" maxlength="240" placeholder="Texto da avaliação" required></label>
        <button class="btn" type="submit">Registar</button>
      </form>
      <p class="empty" *ngIf="!d.avaliacoes.length">Ainda não há avaliações registadas.</p>
      <section class="cards3 wide">
        <article class="card" *ngFor="let a of d.avaliacoes">
          <div class="card-head"><div><h2>{{ a.autor }}</h2><small>{{ dataCurta(a.data) }}</small></div><span class="stars">{{ stars(a.nota) }}</span></div>
          <p class="muted">{{ a.texto }}</p>
          <label style="margin-top:12px">Resposta pública<textarea class="notes" rows="2" [(ngModel)]="a.resposta" (ngModelChange)="save()" placeholder="Agradeçam ou respondam…"></textarea></label>
          <div class="btns"><button class="btn danger" type="button" (click)="removerAvaliacao(a)">Remover</button></div>
        </article>
      </section>
    </ng-container>

    <!-- PERFIL PÚBLICO -->
    <ng-container *ngIf="secao === 'perfil'">
      <header class="page-head"><div><p class="eyebrow">Perfil público</p><h1>Como os casais vos veem</h1><p class="muted">Perfil {{ completude }}% completo.</p></div></header>
      <section class="agenda">
        <form class="card settings" (ngSubmit)="guardarPerfil()">
          <div class="fields">
            <label>Nome do negócio<input name="pn" [(ngModel)]="pf.nome" maxlength="60" required></label>
            <label>Categoria<select name="pcat" [(ngModel)]="pf.categoria"><option value="">Escolher…</option><option *ngFor="let c of categorias" [value]="c">{{ c }}</option></select></label>
            <label>Cidade<input name="pci" [(ngModel)]="pf.cidade" maxlength="60" placeholder="Maputo"></label>
            <label>Website ou redes sociais<input name="pw" [(ngModel)]="pf.website" maxlength="100" placeholder="https://"></label>
            <label>Telefone<input name="ptel" [(ngModel)]="pf.telefone" maxlength="20" placeholder="84 123 4567"></label>
            <label>WhatsApp<input name="pwa" [(ngModel)]="pf.whatsapp" maxlength="20" placeholder="84 123 4567"></label>
            <label>Email de contacto<input name="pem" type="email" [(ngModel)]="pf.email" maxlength="100"></label>
          </div>
          <label style="margin-bottom:18px">Descrição<textarea class="notes" name="pde" rows="5" [(ngModel)]="pf.descricao" maxlength="500" placeholder="Apresentem o vosso trabalho, estilo e experiência."></textarea></label>
          <label class="switch" style="margin-bottom:18px"><input type="checkbox" name="pv" [(ngModel)]="pf.visivel"><span></span>Mostrar perfil no marketplace</label>
          <button class="btn" type="submit">Guardar perfil</button>
        </form>
        <article class="card preview">
          <p class="eyebrow">Pré-visualização</p>
          <h2>{{ pf.nome || 'Nome do negócio' }}</h2>
          <span class="pill info" *ngIf="pf.categoria">{{ pf.categoria }}</span>
          <p class="muted">{{ pf.descricao || 'A descrição aparecerá aqui.' }}</p>
          <p class="forn-line"><span>Cidade</span>{{ pf.cidade || '—' }}</p>
          <p class="forn-line"><span>Serviços ativos</span>{{ servicosAtivos }}</p>
          <p class="forn-line"><span>Estado</span><span class="pill" [ngClass]="pf.visivel ? 'ok' : 'no'">{{ pf.visivel ? 'Visível' : 'Oculto' }}</span></p>
        </article>
      </section>
    </ng-container>

    <!-- DEFINIÇÕES -->
    <ng-container *ngIf="secao === 'definicoes'">
      <header class="page-head"><div><p class="eyebrow">Definições</p><h1>Conta e notificações</h1></div></header>
      <section class="card settings">
        <h2>Conta</h2>
        <p class="forn-line"><span>Email</span>{{ email }}</p>
        <p class="forn-line"><span>Tipo de conta</span>Fornecedor</p>
      </section>
      <section class="card settings">
        <h2>Notificações</h2>
        <label class="switch"><input type="checkbox" [(ngModel)]="d.prefs.emailPedidos" (ngModelChange)="save()"><span></span>Avisar por email quando chegar um novo pedido</label>
        <label class="switch"><input type="checkbox" [(ngModel)]="d.prefs.resumoSemanal" (ngModelChange)="save()"><span></span>Resumo semanal da atividade</label>
        <label class="switch"><input type="checkbox" [(ngModel)]="d.prefs.lembretes" (ngModelChange)="save()"><span></span>Lembretes de reservas próximas</label>
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
`]
})
export class DashboardFornecedorComponent implements OnDestroy {
  ready = false;
  secao: Secao = 'visao';
  email = '';
  initials = '';
  toastMsg = '';
  private toastTimer?: ReturnType<typeof setTimeout>;
  private sub?: Subscription;
  private key = '';

  d: Dados = this.vazio();
  pf: Perfil = { ...this.d.perfil };
  mes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  sel = '';
  motivo = '';

  readonly semana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  readonly categorias = ['Fotografia e vídeo', 'Decoração e flores', 'Música e animação', 'Buffet e catering', 'Espaços e salões', 'Bolos e doces', 'Trajes e beleza', 'Transporte', 'Outros'];
  readonly estados: { key: Estado; label: string }[] = [{ key: 'novo', label: 'Novo' }, { key: 'respondido', label: 'Respondido' }, { key: 'orcamentado', label: 'Orçamentado' }, { key: 'confirmado', label: 'Confirmado' }, { key: 'recusado', label: 'Recusado' }];
  readonly filtros = [{ key: 'todos', label: 'Todos' }, ...this.estados];
  readonly secoes: { key: Secao; label: string; icon: string }[] = [
    { key: 'visao', label: 'Visão geral', icon: 'M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10' },
    { key: 'pedidos', label: 'Pedidos', icon: 'M4 4h16v12H5.2L4 17.2V4zM8 9h8M8 12h5' },
    { key: 'agenda', label: 'Agenda', icon: 'M8 2v4M16 2v4M3 9h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z' },
    { key: 'servicos', label: 'Serviços', icon: 'M20 7h-4V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zM10 5h4v2h-4z' },
    { key: 'financas', label: 'Finanças', icon: 'M12 2v20M17 6.5C17 4.6 14.8 3.5 12 3.5S7 4.6 7 6.5 9.2 9.5 12 10s5 1.6 5 3.5-2.2 3-5 3-5-1.1-5-3' },
    { key: 'avaliacoes', label: 'Avaliações', icon: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z' },
    { key: 'perfil', label: 'Perfil público', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
    { key: 'definicoes', label: 'Definições', icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM4 12h2M18 12h2M12 4v2M12 18v2' }
  ];

  fPed = 'todos'; qPed = '';
  np = { casal: '', contacto: '', servico: '', data: '', convidados: 0 };
  ns = { nome: '', descricao: '', preco: 0, unidade: 'evento' };
  na = { autor: '', nota: 5, texto: '' };

  constructor(private route: ActivatedRoute, private router: Router) {
    const u = this.sessao();
    if (!u) { this.router.navigate(['/login']); return; }
    if (u.tipo !== 'fornecedor') { this.router.navigate([u.tipo === 'admin' ? '/admin' : '/dashboard']); return; }
    this.email = String(u.email || '');
    this.key = 'elace_forn_' + this.email.toLowerCase();
    const f = (x: string) => (x || '').trim().charAt(0).toUpperCase();
    const w = String(u.nome || '').trim().split(/\s+/).filter(Boolean);
    this.initials = w.length > 1 ? f(w[0]) + f(w[1]) : (w[0] || '').slice(0, 2).toUpperCase() || f(this.email) || '?';
    this.carregar(u);
    this.ready = true;
    this.sub = this.route.queryParamMap.subscribe(p => {
      const s = p.get('secao') as Secao | null;
      this.secao = s && this.secoes.some(x => x.key === s) ? s : 'visao';
      this.pf = { ...this.d.perfil };
      window.scrollTo({ top: 0 });
    });
  }
  ngOnDestroy() { this.sub?.unsubscribe(); if (this.toastTimer) clearTimeout(this.toastTimer); }

  /* ---------- Sessão e persistência ---------- */
  private sessao(): any { try { const r = localStorage.getItem('elace_user'); return r ? JSON.parse(r) : null; } catch { return null; } }
  private vazio(): Dados {
    return { perfil: { nome: '', categoria: '', cidade: '', descricao: '', telefone: '', whatsapp: '', email: '', website: '', visivel: true }, pedidos: [], servicos: [], avaliacoes: [], bloqueios: [], prefs: { emailPedidos: true, resumoSemanal: false, lembretes: true }, notas: '' };
  }
  private carregar(u: any) {
    let saved: Dados | null = null;
    try { const r = localStorage.getItem(this.key); if (r) saved = JSON.parse(r); } catch {}
    const b = this.vazio();
    this.d = saved ? { ...b, ...saved, perfil: { ...b.perfil, ...(saved.perfil || {}) }, prefs: { ...b.prefs, ...(saved.prefs || {}) } } : b;
    if (!saved) { this.d.perfil.nome = u.nome || ''; this.d.perfil.email = this.email; this.save(); }
    this.pf = { ...this.d.perfil };
  }
  save() { try { localStorage.setItem(this.key, JSON.stringify(this.d)); } catch {} }
  toast(m: string) { this.toastMsg = m; if (this.toastTimer) clearTimeout(this.toastTimer); this.toastTimer = setTimeout(() => this.toastMsg = '', 2400); }
  private uid() { return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3); }
  abrir(s: Secao) { this.router.navigate([], { relativeTo: this.route, queryParams: { secao: s } }); }

  /* ---------- Formatação e cálculos ---------- */
  mt(v: number) { return new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(Number(v) || 0) + ' MT'; }
  pct(a: number, b: number) { return b > 0 ? Math.max(0, Math.min(100, Math.round((a / b) * 100))) : 0; }
  stars(n: number) { const r = Math.round(n || 0); return '★'.repeat(r) + '☆'.repeat(5 - r); }
  private dt(iso: string) { return new Date(iso.slice(0, 10) + 'T00:00:00'); }
  dataCurta(iso: string) { if (!iso) return ''; const x = this.dt(iso); return isNaN(x.getTime()) ? '' : x.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }); }
  dataLonga(iso: string) { const x = this.dt(iso); return isNaN(x.getTime()) ? '' : x.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
  rotulo(e: Estado) { return this.estados.find(x => x.key === e)?.label || e; }
  classeEstado(e: Estado) { return e === 'confirmado' ? 'ok' : e === 'recusado' ? 'no' : e === 'novo' ? 'info' : 'pen'; }
  get novos() { return this.d.pedidos.filter(p => p.estado === 'novo').length; }
  get confirmados() { return this.d.pedidos.filter(p => p.estado === 'confirmado'); }
  get confirmadosOrdenados() { return [...this.confirmados].sort((a, b) => (a.data || '9999').localeCompare(b.data || '9999')); }
  get conversao() { return this.pct(this.confirmados.length, this.d.pedidos.length); }
  get receitaContratada() { return this.confirmados.reduce((s, p) => s + (Number(p.valor) || 0), 0); }
  get recebido() { return this.confirmados.reduce((s, p) => s + (Number(p.pago) || 0), 0); }
  get aReceber() { return Math.max(0, this.receitaContratada - this.recebido); }
  get ticket() { return this.confirmados.length ? Math.round(this.receitaContratada / this.confirmados.length) : 0; }
  get media() { return this.d.avaliacoes.length ? this.d.avaliacoes.reduce((s, a) => s + a.nota, 0) / this.d.avaliacoes.length : 0; }
  get servicosAtivos() { return this.d.servicos.filter(s => s.ativo).length; }
  get proximas() { const h = new Date().toISOString().slice(0, 10); return this.confirmadosOrdenados.filter(p => p.data && p.data >= h).slice(0, 5); }
  get recentes() { return [...this.d.pedidos].sort((a, b) => b.recebido.localeCompare(a.recebido)).slice(0, 5); }
  get funil() { return this.estados.map(e => ({ label: e.label, n: this.d.pedidos.filter(p => p.estado === e.key).length })); }
  get faltaPerfil() {
    const p = this.d.perfil; const f: string[] = [];
    if (!p.categoria) f.push('categoria'); if (!p.cidade) f.push('cidade'); if (p.descricao.trim().length < 40) f.push('descrição'); if (!p.telefone && !p.whatsapp && !p.email) f.push('contacto'); if (!this.servicosAtivos) f.push('serviços');
    return f;
  }
  get completude() {
    const p = this.d.perfil;
    const ok = [!!p.nome, !!p.categoria, !!p.cidade, p.descricao.trim().length >= 40, !!p.telefone, !!p.whatsapp, !!p.email, this.servicosAtivos > 0];
    return Math.round(ok.filter(Boolean).length / ok.length * 100);
  }
  get receitaMeses() {
    const m = new Map<string, number>();
    this.confirmados.filter(p => p.data).forEach(p => { const k = p.data.slice(0, 7); m.set(k, (m.get(k) || 0) + (Number(p.valor) || 0)); });
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-6).map(([k, valor]) => ({ label: new Date(k + '-01T00:00:00').toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' }), valor }));
  }
  get maxMes() { return Math.max(0, ...this.receitaMeses.map(m => m.valor)); }
  get receitaServicos() {
    const m = new Map<string, number>();
    this.confirmados.forEach(p => { const k = p.servico || 'Outros'; m.set(k, (m.get(k) || 0) + (Number(p.valor) || 0)); });
    return [...m.entries()].map(([label, valor]) => ({ label, valor })).sort((a, b) => b.valor - a.valor);
  }
  badge(k: Secao): string {
    const n = k === 'pedidos' ? this.novos : k === 'servicos' ? this.d.servicos.length : k === 'avaliacoes' ? this.d.avaliacoes.length : 0;
    return n ? String(n) : '';
  }
  estadoPagamento(p: Pedido) { const v = Number(p.valor) || 0, g = Number(p.pago) || 0; if (v > 0 && g >= v) return { txt: 'Pago', cls: 'ok' }; if (g > 0) return { txt: 'Parcial', cls: 'pen' }; return { txt: 'Por receber', cls: 'no' }; }

  /* ---------- Pedidos ---------- */
  contar(k: string) { return k === 'todos' ? this.d.pedidos.length : this.d.pedidos.filter(p => p.estado === k).length; }
  get pedidosView() {
    const q = this.qPed.trim().toLowerCase();
    return this.d.pedidos.filter(p => (this.fPed === 'todos' || p.estado === this.fPed) && (!q || p.casal.toLowerCase().includes(q) || p.servico.toLowerCase().includes(q)))
      .sort((a, b) => b.recebido.localeCompare(a.recebido));
  }
  addPedido() {
    const casal = this.np.casal.trim(); if (!casal) return;
    this.d.pedidos.push({ id: this.uid(), casal, contacto: this.np.contacto.trim(), servico: this.np.servico, data: this.np.data, local: '', convidados: Math.max(0, Number(this.np.convidados) || 0), mensagem: '', recebido: new Date().toISOString(), estado: 'novo', valor: this.d.servicos.find(s => s.nome === this.np.servico)?.preco || 0, pago: 0 });
    this.np = { casal: '', contacto: '', servico: '', data: '', convidados: 0 }; this.save(); this.toast('Pedido registado.');
  }
  mudou(p: Pedido) { if (p.estado !== 'confirmado') p.pago = p.pago || 0; this.save(); }
  removerPedido(p: Pedido) { this.d.pedidos = this.d.pedidos.filter(x => x.id !== p.id); this.save(); }
  wa(contacto: string): string {
    let n = (contacto || '').replace(/\D/g, ''); if (n.length < 9) return '';
    if (n.length === 9) n = '258' + n; return 'https://wa.me/' + n;
  }
  exportarPedidos() {
    const esc = (v: string | number) => '"' + String(v).replace(/"/g, '""') + '"';
    const l = [['Casal', 'Contacto', 'Serviço', 'Data', 'Convidados', 'Valor', 'Pago', 'Estado'].join(',')].concat(this.d.pedidos.map(p => [p.casal, p.contacto, p.servico, p.data, p.convidados, p.valor, p.pago, this.rotulo(p.estado)].map(esc).join(',')));
    this.baixar('pedidos.csv', '\ufeff' + l.join('\n'), 'text/csv;charset=utf-8');
  }

  /* ---------- Agenda ---------- */
  get tituloMes() { return this.mes.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' }); }
  mudarMes(n: number) { this.mes = new Date(this.mes.getFullYear(), this.mes.getMonth() + n, 1); }
  private iso(x: Date) { return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); }
  get calendario(): Dia[] {
    const ini = new Date(this.mes); const off = (ini.getDay() + 6) % 7; ini.setDate(1 - off);
    const hoje = this.iso(new Date()); const out: Dia[] = [];
    for (let i = 0; i < 42; i++) {
      const x = new Date(ini); x.setDate(ini.getDate() + i); const iso = this.iso(x);
      out.push({ iso, dia: x.getDate(), fora: x.getMonth() !== this.mes.getMonth(), hoje: iso === hoje, eventos: this.eventosDia(iso), bloqueio: this.bloqueioDia(iso) });
    }
    return out;
  }
  eventosDia(iso: string) { return this.confirmados.filter(p => p.data === iso); }
  bloqueioDia(iso: string) { return this.d.bloqueios.find(b => b.data === iso); }
  bloquearDia() { if (!this.sel) return; this.d.bloqueios.push({ id: this.uid(), data: this.sel, motivo: this.motivo.trim() }); this.motivo = ''; this.save(); this.toast('Dia bloqueado.'); }
  desbloquear(b: Bloqueio) { this.d.bloqueios = this.d.bloqueios.filter(x => x.id !== b.id); this.save(); }

  /* ---------- Serviços ---------- */
  addServico() {
    const nome = this.ns.nome.trim(); if (!nome) return;
    this.d.servicos.push({ id: this.uid(), nome, descricao: this.ns.descricao.trim(), preco: Number(this.ns.preco) || 0, unidade: this.ns.unidade, ativo: true });
    this.ns = { nome: '', descricao: '', preco: 0, unidade: 'evento' }; this.save(); this.toast('Serviço adicionado.');
  }
  removerServico(s: Servico) { this.d.servicos = this.d.servicos.filter(x => x.id !== s.id); this.save(); }

  /* ---------- Avaliações ---------- */
  addAvaliacao() {
    const autor = this.na.autor.trim(), texto = this.na.texto.trim(); if (!autor || !texto) return;
    this.d.avaliacoes.unshift({ id: this.uid(), autor, nota: Number(this.na.nota) || 5, texto, data: new Date().toISOString(), resposta: '' });
    this.na = { autor: '', nota: 5, texto: '' }; this.save(); this.toast('Avaliação registada.');
  }
  removerAvaliacao(a: Avaliacao) { this.d.avaliacoes = this.d.avaliacoes.filter(x => x.id !== a.id); this.save(); }

  /* ---------- Perfil e definições ---------- */
  guardarPerfil() { this.d.perfil = { ...this.pf, nome: this.pf.nome.trim() }; this.save(); this.toast('Perfil guardado.'); }
  exportarTudo() { this.baixar('elace-fornecedor.json', JSON.stringify(this.d, null, 2), 'application/json'); }
  repor() {
    if (!confirm('Tem a certeza? Todos os pedidos, serviços e avaliações serão apagados.')) return;
    const p = this.d.perfil; this.d = { ...this.vazio(), perfil: p }; this.save(); this.toast('Painel reposto.');
  }
  logout() { localStorage.removeItem('elace_token'); localStorage.removeItem('elace_user'); location.href = '/login'; }
  private baixar(nome: string, conteudo: string, tipo: string) {
    const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
    const a = document.createElement('a'); a.href = url; a.download = nome; a.click(); URL.revokeObjectURL(url);
  }
}
