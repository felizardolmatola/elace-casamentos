import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from './header.component';
import { FooterComponent } from './footer.component';

@Component({
  selector: 'elace-home',
  standalone: true,
  imports: [NgFor, RouterLink, HeaderComponent, FooterComponent],
  template: `
    <elace-header />
    <main>
      <section class="hero">
        <div class="hero-copy"><p class="eyebrow">O começo de uma história bonita</p><h1>O vosso dia.<br><em>Do vosso jeito.</em></h1>
          <p class="intro">Organizem o casamento num só lugar: planeiem, encontrem fornecedores e acompanhem cada detalhe com tranquilidade.</p>
          <div class="actions"><a class="button primary" href="/registo">Começar a planear <span aria-hidden="true">↗</span></a><a class="text-link" href="/fornecedores">Explorar fornecedores</a></div>
          <div class="trust"><span class="dot"></span> Um espaço pensado para celebrar o amor</div>
        </div>
        <div class="hero-image" role="img" aria-label="Um momento romântico de casamento"></div>
      </section>
      <section class="tools" id="ferramentas">
        <div class="section-heading"><p class="eyebrow">Ferramentas de planeamento</p><h2>Tudo para organizar<br><em>o vosso casamento.</em></h2>
          <p class="section-sub">Do primeiro convidado ao último detalhe da festa: ferramentas pensadas para o casal planear com calma e sem folhas soltas.</p></div>
        <div class="tool-grid">
          <a class="tool" *ngFor="let t of tools" [routerLink]="t.link">
            <span class="tool-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="t.icon"/></svg></span>
            <h3>{{ t.title }}</h3><p>{{ t.text }}</p>
            <span class="tool-more">Abrir <span aria-hidden="true">→</span></span>
          </a>
        </div>
        <div class="tools-cta"><a class="button primary" routerLink="/criar-casamento">Começar o meu planeamento <span aria-hidden="true">↗</span></a></div>
      </section>
      <section class="suppliers" id="fornecedores">
        <div class="section-heading"><p class="eyebrow">Fornecedores</p><h2>Profissionais para<br><em>cada momento do dia.</em></h2>
          <p class="section-sub">Descubram fornecedores de confiança, vejam os serviços que oferecem e peçam orçamento diretamente pela plataforma.</p></div>
        <div class="supplier-grid">
          <article class="supplier" *ngFor="let s of suppliers">
            <div class="supplier-photo" [class]="'supplier-photo ph-' + s.key" role="img" [attr.aria-label]="s.title"><span class="supplier-tag">{{ s.tag }}</span></div>
            <div class="supplier-body">
              <h3>{{ s.title }}</h3><p>{{ s.text }}</p>
              <ul class="services"><li *ngFor="let sv of s.services">{{ sv }}</li></ul>
              <a class="supplier-link" routerLink="/fornecedores" [queryParams]="{ q: s.query }">Ver fornecedores <span aria-hidden="true">→</span></a>
            </div>
          </article>
        </div>
        <div class="tools-cta suppliers-cta"><a class="button primary" routerLink="/fornecedores">Explorar todos os fornecedores <span aria-hidden="true">↗</span></a><a class="text-link" routerLink="/registo" [queryParams]="{ tipo: 'fornecedor' }">Sou fornecedor e quero aparecer aqui</a></div>
      </section>
    </main>
    <elace-footer />
  `,
  styleUrls: ['./app.component.css']
})
export class HomeComponent {
  suppliers = [
    { key: 'fotografia', tag: 'Fotografia e vídeo', title: 'Fotógrafos e videógrafos', query: 'fotografia',
      text: 'Registem cada instante, da preparação à última dança.',
      services: ['Reportagem do casamento', 'Sessão pré-casamento', 'Vídeo e drone', 'Álbuns e fotos impressas'] },
    { key: 'decoracao', tag: 'Decoração e flores', title: 'Decoradores e floristas', query: 'decoração',
      text: 'Dêem personalidade ao espaço com detalhes feitos à vossa medida.',
      services: ['Decoração de salão e cerimónia', 'Arranjos florais e bouquet', 'Iluminação ambiente', 'Mesa dos noivos'] },
    { key: 'musica', tag: 'Música e animação', title: 'DJs, bandas e animadores', query: 'música',
      text: 'O ambiente certo para a cerimónia e para a festa.',
      services: ['DJ e sonorização', 'Bandas ao vivo', 'Música para a cerimónia', 'Animação e MC'] },
    { key: 'buffet', tag: 'Buffet e catering', title: 'Buffet e catering', query: 'buffet',
      text: 'Menus pensados para agradar a todos os convidados.',
      services: ['Buffet e serviço à mesa', 'Cocktail de receção', 'Pessoal de sala', 'Bebidas e bar'] },
    { key: 'espacos', tag: 'Espaços e salões', title: 'Espaços para a celebração', query: 'espaço',
      text: 'Salões, jardins e locais para a cerimónia e a receção.',
      services: ['Salões de festa', 'Jardins e espaços ao ar livre', 'Cerimónias religiosas e civis', 'Aluguer de mobiliário'] },
    { key: 'bolos', tag: 'Bolos e doces', title: 'Pastelaria e bolos', query: 'bolo',
      text: 'O bolo e a mesa de doces que ficam na memória.',
      services: ['Bolo de casamento', 'Mesa de doces', 'Docinhos e salgados', 'Lembranças para convidados'] }
  ];

  tools = [
    { title: 'Lista de convidados', text: 'Registem convidados, famílias e confirmações de presença num só lugar.', link: '/dashboard',
      icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
    { title: 'Orçamento', text: 'Definam o valor total e acompanhem o que já foi gasto em cada categoria.', link: '/dashboard',
      icon: 'M20 12V8H6a2 2 0 0 1 0-4h12v4M4 6v12a2 2 0 0 0 2 2h14v-4M18 12a2 2 0 0 0 0 4h4v-4z' },
    { title: 'Checklist de tarefas', text: 'Um passo a passo com prazos para não esquecerem nenhum detalhe.', link: '/dashboard',
      icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
    { title: 'Calendário e cronograma', text: 'Datas importantes, reuniões e o programa do grande dia, hora a hora.', link: '/dashboard',
      icon: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z' },
    { title: 'Fornecedores', text: 'Fotografia, decoração, música, buffet e muito mais, prontos a contactar.', link: '/fornecedores',
      icon: 'M3 9l1-5h16l1 5M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M5 21V12M19 21V12M3 21h18' },
    { title: 'Local da celebração', text: 'Guardem e comparem espaços para a cerimónia e para a receção.', link: '/criar-casamento',
      icon: 'M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0zM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z' },
    { title: 'Convites e confirmações', text: 'Enviem convites e acompanhem quem já confirmou presença.', link: '/dashboard',
      icon: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6' },
    { title: 'Mapa de mesas', text: 'Distribuam os convidados pelas mesas e organizem a sala.', link: '/dashboard',
      icon: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M2 12h2M20 12h2' },
    { title: 'Música e animação', text: 'Escolham o repertório, a banda ou o DJ e os momentos especiais.', link: '/dashboard',
      icon: 'M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z' },
    { title: 'Lista de presentes', text: 'Partilhem sugestões de presentes com familiares e amigos.', link: '/dashboard',
      icon: 'M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z' },
    { title: 'Contratos e documentos', text: 'Mantenham orçamentos, contratos e comprovativos organizados.', link: '/dashboard',
      icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h8' },
    { title: 'Lua de mel', text: 'Planeiem a viagem a dois, com datas, destinos e reservas.', link: '/dashboard',
      icon: 'M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z' }
  ];
}
