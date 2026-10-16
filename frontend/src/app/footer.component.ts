import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'elace-footer',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink],
  template: `
    <footer class="footer">
      <div class="footer-main">
        <div class="col about">
          <a class="brand" routerLink="/" aria-label="Elace Casamentos — página inicial">
            <svg class="logo" viewBox="0 0 44 32" width="44" height="32" aria-hidden="true" focusable="false"><defs><clipPath id="ringsF"><rect x="17" y="19" width="10" height="13"/></clipPath></defs><g fill="none" stroke-width="2.6"><circle cx="14" cy="19" r="10" stroke="#000"/><circle cx="30" cy="19" r="10" stroke="#000"/><circle cx="14" cy="19" r="10" stroke="#000" clip-path="url(#ringsF)"/></g><path d="M30 1.5l3.2 4.2L30 9.6l-3.2-3.9z" fill="#000"/></svg>
            <span class="brand-text">Elace<span class="brand-light"> casamentos</span></span>
          </a>
          <p>A plataforma para casais planearem o casamento num só lugar: ferramentas de organização e fornecedores de confiança.</p>
          <div class="social">
            <a *ngFor="let s of socials" [href]="s.url" target="_blank" rel="noopener" [attr.aria-label]="s.name" [title]="s.name">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="s.icon"/><ng-container *ngIf="s.extra"><path [attr.d]="s.extra"/></ng-container></svg>
            </a>
          </div>
        </div>

        <nav class="col" aria-label="Plataforma">
          <h4>Plataforma</h4>
          <a routerLink="/" fragment="ferramentas">Ferramentas de planeamento</a>
          <a routerLink="/criar-casamento">Criar casamento</a>
          <a routerLink="/dashboard">A minha conta</a>
          <a routerLink="/login">Entrar</a>
          <a routerLink="/registo">Criar conta</a>
        </nav>

        <nav class="col" aria-label="Fornecedores">
          <h4>Fornecedores</h4>
          <a routerLink="/fornecedores">Explorar fornecedores</a>
          <a routerLink="/fornecedores" [queryParams]="{ q: 'fotografia' }">Fotografia e vídeo</a>
          <a routerLink="/fornecedores" [queryParams]="{ q: 'decoração' }">Decoração e flores</a>
          <a routerLink="/fornecedores" [queryParams]="{ q: 'buffet' }">Buffet e catering</a>
          <a routerLink="/registo" [queryParams]="{ tipo: 'fornecedor' }">Sou fornecedor</a>
        </nav>

        <div class="col contact">
          <h4>Contactos</h4>
          <a *ngFor="let c of contacts" [href]="c.url" class="contact-item">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="c.icon"/><ng-container *ngIf="c.extra"><path [attr.d]="c.extra"/></ng-container></svg>
            <span>{{ c.text }}</span>
          </a>
        </div>
      </div>

      <div class="footer-bottom">
        <span>© {{ year }} Elace Casamentos. Todos os direitos reservados.</span>
        <div class="legal"><a routerLink="/">Termos de uso</a><a routerLink="/">Política de privacidade</a></div>
        <button type="button" class="to-top" (click)="toTop()" aria-label="Voltar ao topo">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
        </button>
      </div>
    </footer>
  `,
  styles: [`
    :host{display:block;font-family:Inter,Arial,sans-serif;color:#000}
    *{box-sizing:border-box}
    a{text-decoration:none;color:inherit}
    .footer{background:#fff;box-shadow:0 -4px 16px rgba(0,0,0,.08);position:relative}
    .footer-main{max-width:1440px;margin:0 auto;padding:64px clamp(22px,7vw,104px) 48px;display:grid;grid-template-columns:1.6fr 1fr 1fr 1.3fr;gap:48px}
    .brand{display:inline-flex;align-items:center;gap:12px;line-height:1;color:#000;font-family:'Times New Roman',Times,serif;font-size:27px;font-weight:400;white-space:nowrap}
    .brand .logo{width:56px;height:41px;flex:none;display:block}
    .brand-light{font-weight:400;color:#000;white-space:pre}
    .about p{margin:18px 0 22px;max-width:340px;font-size:13px;line-height:1.8;color:#000}
    .social{display:flex;gap:10px}
    .social a{display:grid;place-items:center;width:40px;height:40px;border:1px solid #000;border-radius:3px;color:#000;transition:background .2s,color .2s,transform .2s}
    .social a:hover{background:#0b4870;border-color:#0b4870;color:#fff;transform:translateY(-2px)}
    svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
    .col h4{margin:0 0 18px;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#000}
    .col > a{display:block;padding:6px 0;font-size:13px;color:#000;transition:color .2s,transform .2s}
    .col > a:hover{color:#000;transform:translateX(3px)}
    .contact .contact-item{display:flex;align-items:flex-start;gap:12px;padding:8px 0}
    .contact-item svg{flex:none;margin-top:1px;color:#000}
    .contact-item span{font-size:13px;line-height:1.6}
    .contact-item:hover span{color:#000}
    .footer-bottom{max-width:1440px;margin:0 auto;padding:22px clamp(22px,7vw,104px);display:flex;align-items:center;justify-content:space-between;gap:20px;font-size:12px;color:#000;box-shadow:inset 0 1px 0 rgba(0,0,0,.07)}
    .legal{display:flex;gap:24px;margin-left:auto}
    .legal a:hover{color:#000}
    .to-top{display:grid;place-items:center;width:40px;height:40px;border:1px solid #000;border-radius:3px;background:#fff;color:#000;cursor:pointer;transition:background .2s,color .2s}
    .to-top:hover{background:#0b4870;border-color:#0b4870;color:#fff}
    a:focus-visible,button:focus-visible{outline:2px solid #0b4870;outline-offset:3px}
    @media(max-width:1000px){.footer-main{grid-template-columns:1fr 1fr;gap:40px}}
    @media(max-width:560px){.footer-main{grid-template-columns:1fr;padding:48px 22px 32px}.footer-bottom{flex-direction:column;align-items:flex-start;padding:22px}.legal{margin-left:0;flex-wrap:wrap;gap:16px}}
  `]
})
export class FooterComponent {
  year = new Date().getFullYear();

  // Substituam pelos dados reais da empresa
  socials = [
    { name: 'Facebook', url: '#', icon: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z', extra: '' },
    { name: 'Instagram', url: '#', icon: 'M5 2h14a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3z', extra: 'M16 11.4a4 4 0 1 1-7.4 2.2 4 4 0 0 1 7.4-2.2zM17.5 6.5h.01' },
    { name: 'WhatsApp', url: '#', icon: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z', extra: '' },
    { name: 'LinkedIn', url: '#', icon: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z', extra: '' }
  ];

  contacts = [
    { url: 'mailto:contacto@elace.co.mz', text: 'contacto@elace.co.mz', extra: 'M22 6l-10 7L2 6',
      icon: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z' },
    { url: 'tel:+258000000000', text: '+258 00 000 0000', extra: '',
      icon: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z' },
    { url: '#', text: 'Moçambique', extra: 'M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
      icon: 'M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z' }
  ];

  toTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
}
