import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HeaderComponent } from './header.component';
import { FooterComponent } from './footer.component';

@Component({ selector: 'elace-page', standalone: true, imports: [CommonModule, FormsModule, RouterLink, HeaderComponent, FooterComponent], template: `
<elace-header />
<main class="page-wrap">
<section *ngIf="kind==='login' || kind==='registo'" class="panel auth"><a routerLink="/" class="auth-brand" aria-label="Elace Casamentos — página inicial"><svg class="logo" viewBox="0 0 44 32" width="56" height="41" aria-hidden="true" focusable="false"><defs><clipPath id="ringsA"><rect x="17" y="19" width="10" height="13"/></clipPath></defs><g fill="none" stroke-width="2.6"><circle cx="14" cy="19" r="10" stroke="#000"/><circle cx="30" cy="19" r="10" stroke="#000"/><circle cx="14" cy="19" r="10" stroke="#000" clip-path="url(#ringsA)"/></g><path d="M30 1.5l3.2 4.2L30 9.6l-3.2-3.9z" fill="#000"/></svg><span class="brand-text">Elace<span class="brand-light"> casamentos</span></span></a><h1>{{kind==='login'?'Bem-vindos de volta':'Criem o vosso espaço'}}</h1><p class="muted">{{kind==='login'?'Entrem para continuar a organizar o vosso casamento.':'Comecem a planear cada detalhe da celebração.'}}</p>
<form (ngSubmit)="submitAuth()" novalidate><label *ngIf="kind==='registo'">Tipo de conta<select name="tipo" [ngModel]="form.tipo" (ngModelChange)="onTipo($event)"><option value="casal">Casal</option><option value="fornecedor">Fornecedor</option></select></label><label *ngIf="kind==='registo' && form.tipo==='fornecedor'">Nome da empresa ou profissional<input name="nome" type="text" [value]="form.nome" (input)="setField('nome',$event)" (blur)="touch('nome')" [class.invalid]="!!err('nome')" [attr.aria-invalid]="!!err('nome')" maxlength="60" autocomplete="name" placeholder="Ex.: Estúdio Aurora"><small class="field-error" role="alert" *ngIf="err('nome')">{{err('nome')}}</small></label><label *ngIf="kind==='registo' && form.tipo!=='fornecedor'">Nome do noivo<input name="noivo" type="text" [value]="form.noivo" (input)="setField('noivo',$event)" (blur)="touch('noivo')" [class.invalid]="!!err('noivo')" [attr.aria-invalid]="!!err('noivo')" maxlength="60" autocomplete="off" placeholder="Ex.: João Macuácua"><small class="field-error" role="alert" *ngIf="err('noivo')">{{err('noivo')}}</small></label><label *ngIf="kind==='registo' && form.tipo!=='fornecedor'">Nome da noiva<input name="noiva" type="text" [value]="form.noiva" (input)="setField('noiva',$event)" (blur)="touch('noiva')" [class.invalid]="!!err('noiva')" [attr.aria-invalid]="!!err('noiva')" maxlength="60" autocomplete="off" placeholder="Ex.: Ana Chissano"><small class="field-error" role="alert" *ngIf="err('noiva')">{{err('noiva')}}</small></label><label>Email<input name="email" type="email" [value]="form.email" (input)="setField('email',$event)" (blur)="touch('email')" [class.invalid]="!!err('email')" [attr.aria-invalid]="!!err('email')" maxlength="100" autocomplete="email" inputmode="email" placeholder="nome@email.com"><small class="field-error" role="alert" *ngIf="err('email')">{{err('email')}}</small></label><label *ngIf="kind==='registo'">Número de telemóvel<span class="phone"><span class="prefix">+258</span><input name="telefone" type="tel" [value]="form.telefone" (input)="setField('telefone',$event)" (blur)="touch('telefone')" [class.invalid]="!!err('telefone')" [attr.aria-invalid]="!!err('telefone')" maxlength="13" inputmode="numeric" autocomplete="tel-national" placeholder="84 123 4567"></span><small class="field-error" role="alert" *ngIf="err('telefone')">{{err('telefone')}}</small></label><label *ngIf="kind==='registo'">Morada<input name="morada" type="text" [value]="form.morada" (input)="setField('morada',$event)" (blur)="touch('morada')" [class.invalid]="!!err('morada')" [attr.aria-invalid]="!!err('morada')" maxlength="120" autocomplete="street-address" placeholder="Rua / Bairro, Cidade"><small class="field-error" role="alert" *ngIf="err('morada')">{{err('morada')}}</small></label><label>Palavra-passe<span class="pass"><input name="password" [type]="showPass?'text':'password'" [value]="form.password" (input)="setField('password',$event)" (blur)="touch('password')" [class.invalid]="!!err('password')" [attr.aria-invalid]="!!err('password')" maxlength="64" [attr.autocomplete]="kind==='login'?'current-password':'new-password'"><button type="button" class="eye" (click)="showPass=!showPass" [attr.aria-label]="showPass?'Ocultar palavra-passe':'Mostrar palavra-passe'" [attr.aria-pressed]="showPass"><svg *ngIf="!showPass" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg><svg *ngIf="showPass" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-10-7-10-7a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg></button></span><small class="field-error" role="alert" *ngIf="err('password')">{{err('password')}}</small></label><label class="check" *ngIf="kind==='login'"><input type="checkbox" name="lembrar" [(ngModel)]="remember"><span>Lembrar-me neste dispositivo</span></label><label class="check" *ngIf="kind==='registo'"><input type="checkbox" name="aceito" [(ngModel)]="accepted" (change)="touch('aceito')"><span>Li e aceito os <a routerLink="/">Termos de uso</a> e a <a routerLink="/">Política de privacidade</a></span></label><small class="field-error terms-error" role="alert" *ngIf="kind==='registo' && err('aceito')">{{err('aceito')}}</small><button class="primary" [disabled]="busy">{{busy?'A processar…':kind==='login'?'Entrar':'Criar conta'}}</button><p class="error" *ngIf="message">{{message}}</p></form><p class="muted">{{kind==='login'?'Ainda não têm conta?':'Já têm conta?'}} <a [routerLink]="kind==='login'?'/registo':'/login'">{{kind==='login'?'Criar conta':'Entrar'}}</a></p></section>
<section *ngIf="kind==='fornecedores'" class="content"><p class="eyebrow">PROFISSIONAIS PARA O VOSSO DIA</p><h1>Encontrem fornecedores</h1><p class="muted">Descubram serviços para tornar a celebração verdadeiramente vossa.</p><div class="tiles"><article><h2>Fotografia</h2><p>Registem cada momento especial.</p></article><article><h2>Decoração e flores</h2><p>Detalhes que dão personalidade ao vosso casamento.</p></article><article><h2>Música e animação</h2><p>Encontrem o ambiente ideal para a festa.</p></article></div><a routerLink="/registo" class="primary linkbutton">Criar conta para explorar</a></section>
<section *ngIf="kind==='criar-casamento'" class="panel"><p class="eyebrow">PLANEAMENTO</p><h1>Vamos começar a organizar o vosso casamento</h1><form (ngSubmit)="createWedding()"><label>Nome do casal<input name="nome" [(ngModel)]="form.nome" required></label><label>Data do casamento<input type="date" name="data" [(ngModel)]="form.data" required></label><label>Local da celebração<input name="local" [(ngModel)]="form.local"></label><button class="primary" [disabled]="busy">{{busy?'A guardar…':'Criar planeamento'}}</button><p class="error" *ngIf="message">{{message}}</p></form></section>
<section *ngIf="kind==='dashboard' || kind==='dashboard-fornecedor' || kind==='admin'" class="content"><p class="eyebrow">ÁREA DE {{kind==='dashboard'?'CASAL':kind==='admin'?'ADMINISTRAÇÃO':'FORNECEDOR'}}</p><h1>{{kind==='dashboard'?'O vosso casamento':kind==='admin'?'Gestão da plataforma':'Área do fornecedor'}}</h1><p class="muted">Acedam às ferramentas da vossa conta e acompanhem as atividades.</p><div class="tiles"><article><h2>Perfil</h2><p>Consultem e atualizem os dados da conta.</p></article><article><h2>{{kind==='dashboard'?'Planeamento':'Solicitações'}}</h2><p>Organizem tarefas e acompanhem os pedidos.</p></article><article><h2>Mensagens</h2><p>Fiquem a par das novidades.</p></article></div><button class="primary" (click)="logout()">Terminar sessão</button></section>
</main><elace-footer />
`, styles: [`:host{display:flex;flex-direction:column;min-height:100vh;background:#fff;color:#000;font-family:Inter,Arial,sans-serif}
*{box-sizing:border-box}
.page-wrap{flex:1;width:100%;max-width:1050px;margin:0 auto;padding:64px 22px 150px}
.panel{max-width:480px;margin:0 auto;background:#fff;border:1px solid #fff;border-radius:4px;padding:40px 36px 36px;box-shadow:0 2px 6px rgba(0,0,0,.06),0 16px 44px rgba(0,0,0,.12)}
.auth{text-align:center}
.auth label{text-align:left}
.auth-brand{display:flex;align-items:center;justify-content:center;gap:12px;margin:0 0 28px;color:#000;text-decoration:none;font-family:'Times New Roman',Times,serif;font-size:27px;font-weight:400;line-height:1;white-space:nowrap}
.auth-brand .logo{width:56px;height:41px;flex:none;display:block}
.brand-text{display:inline-flex;align-items:center;line-height:1}
.brand-light{font-weight:400;white-space:pre}
.auth h1,.content h1,.panel h1{font:500 clamp(30px,5vw,48px) 'Inter',sans-serif;letter-spacing:-.5px;margin:12px 0}
.auth h1{font-size:clamp(26px,4vw,34px)}
.eyebrow{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#000;font-weight:700}
.muted{color:#333;font-size:14px;line-height:1.7}
.form,form{display:grid;gap:18px;margin:26px 0}
label{display:grid;gap:8px;font-size:13px;font-weight:500;color:#000}
input,select{width:100%;height:46px;padding:0 14px;border:1px solid #e6e6e6;border-radius:3px;background:#fff;font:inherit;font-size:14px;color:#000;box-shadow:0 2px 10px rgba(0,0,0,.09);transition:border-color .2s,box-shadow .2s}
input:focus,select:focus{outline:none;border-color:#0b4870;box-shadow:0 0 0 3px rgba(11,72,112,.15),0 2px 10px rgba(0,0,0,.09)}
.pass{position:relative;display:block}.pass input{padding-right:50px}.eye{position:absolute;right:4px;top:50%;transform:translateY(-50%);width:38px;height:38px;display:grid;place-items:center;border:0;border-radius:3px;background:transparent;color:#000;cursor:pointer;padding:0}.eye:hover{background:#f2f2f2}.eye svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.check{display:flex;align-items:flex-start;gap:10px;font-size:13px;font-weight:400;line-height:1.5;cursor:pointer}.check input{width:18px;height:18px;flex:none;margin:1px 0 0;padding:0;box-shadow:none;accent-color:#0b4870;cursor:pointer}.check a{color:#0b4870;font-weight:600;text-decoration:none}.check a:hover{text-decoration:underline}
.field-error{display:block;color:#a12c2c;font-size:12px;font-weight:400;line-height:1.4;text-align:left}.terms-error{margin-top:-8px}
input.invalid,select.invalid{border-color:#a12c2c}
.phone{display:flex;align-items:stretch;border-radius:3px;box-shadow:0 2px 10px rgba(0,0,0,.09)}.phone .prefix{display:grid;place-items:center;padding:0 12px;border:1px solid #e6e6e6;border-right:0;border-radius:3px 0 0 3px;background:#fff;font-size:14px;font-weight:600;color:#000}.phone input{border-radius:0 3px 3px 0;box-shadow:none}.phone input:focus{box-shadow:0 0 0 3px rgba(11,72,112,.15)}
.primary,.linkbutton{display:inline-flex;align-items:center;justify-content:center;height:46px;padding:0 22px;background:#0b4870;color:#fff;border:0;border-radius:3px;text-decoration:none;font:600 13px Inter,Arial,sans-serif;cursor:pointer;transition:background .2s}
.primary:hover,.linkbutton:hover{background:#093a5b}
.primary:disabled{opacity:.6;cursor:default}
form .primary{width:100%}
.auth .muted a{color:#0b4870;font-weight:600;text-decoration:none}
.auth .muted a:hover{text-decoration:underline}
.error{color:#a12c2c;font-size:13px;margin:0}
.content{max-width:850px;margin:0 auto}
.tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin:35px 0}
.tiles article{background:#fff;border:1px solid #fff;border-radius:4px;padding:24px;box-shadow:0 2px 14px rgba(0,0,0,.09)}
.tiles h2{font:500 23px 'Inter',sans-serif}
a:focus-visible,button:focus-visible{outline:2px solid #0b4870;outline-offset:3px}
@media(max-width:650px){.page-wrap{padding:36px 16px 100px}.tiles{grid-template-columns:1fr}.panel{padding:28px 20px 26px}.auth-brand{font-size:22px;gap:9px;margin-bottom:22px}.auth-brand .logo{width:44px;height:32px}}` ] })
export class PageComponent {
 kind = ''; busy = false; message = ''; remember = false; accepted = false; showPass = false; touched: Record<string,boolean> = {}; form: any = { nome:'', noivo:'', noiva:'', email:'', telefone:'', morada:'', password:'', tipo:'casal', data:'', local:'' };
 constructor(private route: ActivatedRoute, private http: HttpClient) { this.kind = this.route.snapshot.data['kind'] || 'dashboard';
  if (this.kind==='registo' && this.route.snapshot.queryParamMap.get('tipo')==='fornecedor') this.form.tipo='fornecedor';
  if (this.kind==='login') { try { const e = localStorage.getItem('elace_email'); if (e) { this.form.email = e; this.remember = true; } } catch {} } }
 submitAuth(){ const fields = this.kind==='registo' ? [...(this.form.tipo==='fornecedor' ? ['nome'] : ['noivo','noiva']),'email','telefone','morada','password','aceito'] : ['email','password']; fields.forEach(f => this.touched[f] = true); if (fields.some(f => this.check(f))) { this.message='Corrija os campos assinalados para continuar.'; return; } this.message=''; this.busy=true; const path=this.kind==='login'?'/api/auth/login':(this.form.tipo==='fornecedor'?'/api/auth/registar/fornecedor':'/api/auth/registar/casal'); const base = { email: this.form.email.trim(), telefone: '+258' + this.form.telefone, morada: this.form.morada.trim(), password: this.form.password}; const body: any = this.kind==='login' ? { email: this.form.email.trim(), password: this.form.password } : (this.form.tipo==='fornecedor' ? { tipo:'fornecedor', nome: this.form.nome.trim(), ...base } : { tipo:'casal', nome: this.form.noivo.trim()+' e '+this.form.noiva.trim(), nomeNoivo: this.form.noivo.trim(), nomeNoiva: this.form.noiva.trim(), ...base }); this.http.post<any>(path,body).subscribe({next:r=>{this.busy=false; if(r?.token) localStorage.setItem('elace_token',r.token); if(this.kind==='login'){ try{ this.remember ? localStorage.setItem('elace_email',this.form.email) : localStorage.removeItem('elace_email'); }catch{} } location.href=this.saveSession(r);},error:e=>{this.busy=false;this.message=e?.error?.erro||e?.error?.message||'Não foi possível concluir. Verifiquem os dados e tentem novamente.';}}); }
 createWedding(){this.busy=true;this.message='';this.http.post('/api/casal/casamento',this.form).subscribe({next:()=>{this.busy=false;try{localStorage.setItem('elace_wedding',JSON.stringify({nome:this.form.nome,data:this.form.data,local:this.form.local}));}catch{}location.href='/dashboard';},error:e=>{this.busy=false;this.message=e?.error?.erro||'Não foi possível criar o planeamento. Entrem na conta e tentem novamente.';}}); }
 logout(){localStorage.removeItem('elace_token');localStorage.removeItem('elace_user');location.href='/login';}
 saveSession(r: any): string {
  const email = String(this.form.email || '').trim(); let user: any;
  if (this.kind === 'registo') {
   user = this.form.tipo === 'fornecedor' ? { tipo: 'fornecedor', nome: this.form.nome.trim(), email } : { tipo: 'casal', noivo: this.form.noivo.trim(), noiva: this.form.noiva.trim(), email };
  } else {
   const u = r?.user || r?.usuario || r?.utilizador || r || {};
   const t = String(u.tipo || u.role || u.perfil || '').toLowerCase();
   user = { tipo: t.includes('admin') ? 'admin' : t.includes('fornec') ? 'fornecedor' : 'casal', nome: u.nome || '', noivo: u.nomeNoivo || u.noivo || '', noiva: u.nomeNoiva || u.noiva || '', email };
   if (!user.nome && !user.noivo && !user.noiva) { try { const c = JSON.parse(localStorage.getItem('elace_profiles') || '{}')[email.toLowerCase()]; if (c) user = c; } catch {} }
  }
  try {
   localStorage.setItem('elace_user', JSON.stringify(user));
   if (this.kind === 'registo') { const all = JSON.parse(localStorage.getItem('elace_profiles') || '{}'); all[email.toLowerCase()] = user; localStorage.setItem('elace_profiles', JSON.stringify(all)); }
  } catch {}
  return user.tipo === 'admin' ? '/admin' : user.tipo === 'fornecedor' ? '/dashboard-fornecedor' : '/dashboard';
 }

 readonly EMAIL = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9\-]+(\.[A-Za-z0-9\-]+)*\.[A-Za-z]{2,}$/;
 touch(f: string) { this.touched[f] = true; }
 onTipo(v: string) { this.form.tipo = v; this.form.nome = this.clean('nome', this.form.nome || ''); }
 clean(f: string, v: string): string {
  switch (f) {
   case 'nome': return (this.form.tipo === 'fornecedor' ? v.replace(/[^A-Za-zÀ-ÿ0-9 '&.\-]/g, '') : v.replace(/[^A-Za-zÀ-ÿ '\-]/g, '')).replace(/\s{2,}/g, ' ').slice(0, 60);
   case 'noivo': case 'noiva': return v.replace(/[^A-Za-zÀ-ÿ '\-]/g, '').replace(/\s{2,}/g, ' ').slice(0, 60);
   case 'email': return v.replace(/[^A-Za-z0-9._%+\-@]/g, '').slice(0, 100);
   case 'telefone': { let d = v.replace(/\D/g, ''); if (d.length > 9 && d.startsWith('258')) d = d.slice(3); return d.slice(0, 9); }
   case 'morada': return v.replace(/[^A-Za-zÀ-ÿ0-9 ,.\-\/ºª#]/g, '').replace(/\s{2,}/g, ' ').slice(0, 120);
   default: return v.slice(0, 64);
  }
 }
 setField(f: string, ev: Event) {
  const el = ev.target as HTMLInputElement; const raw = el.value; const clean = this.clean(f, raw);
  if (clean !== raw) {
   let pos: number | null = null; try { pos = el.selectionStart; } catch {}
   el.value = clean;
   if (pos !== null) { try { const p = Math.max(0, pos - (raw.length - clean.length)); el.setSelectionRange(p, p); } catch {} }
  }
  this.form[f] = clean;
 }
 err(f: string): string { return this.touched[f] ? this.check(f) : ''; }
 check(f: string): string {
  const v = String(this.form[f] ?? '').trim(); const reg = this.kind === 'registo';
  switch (f) {
   case 'noivo': case 'noiva': if (!v) return f === 'noivo' ? 'Indique o nome do noivo.' : 'Indique o nome da noiva.'; if (v.length < 2 || !/[A-Za-zÀ-ÿ]{2}/.test(v)) return 'Introduza um nome válido.'; return '';
   case 'nome': if (!v) return 'Indique o nome.'; if (v.length < 3 || !/[A-Za-zÀ-ÿ]{2}/.test(v)) return 'Introduza um nome válido.'; return '';
   case 'email': if (!v) return 'Indique o email.'; if (!this.EMAIL.test(v)) return 'Introduza um email válido, por exemplo nome@email.com.'; return '';
   case 'telefone': if (!v) return 'Indique o número de telemóvel.'; if (!/^8[2-7]\d{7}$/.test(v)) return 'Número inválido: use 9 dígitos a começar por 82, 83, 84, 85, 86 ou 87.'; return '';
   case 'morada': if (!v) return 'Indique a morada.'; if (v.length < 8 || !/[A-Za-zÀ-ÿ]{3}/.test(v)) return 'Indique uma morada completa (rua ou bairro e cidade).'; return '';
   case 'password': { const p = String(this.form.password ?? ''); if (!p) return 'Indique a palavra-passe.';
     if (!reg) return p.length < 6 ? 'A palavra-passe tem pelo menos 6 caracteres.' : '';
     if (p.length < 8 || !/[A-Za-z]/.test(p) || !/\d/.test(p)) return 'Use pelo menos 8 caracteres, com letras e números.'; return ''; }
   case 'aceito': return this.accepted ? '' : 'Aceite os Termos de uso e a Política de privacidade para continuar.';
   default: return '';
  }
 }

}
