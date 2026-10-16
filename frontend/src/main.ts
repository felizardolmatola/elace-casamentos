import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { PageComponent } from './app/page.component';
import { HomeComponent } from './app/home.component';
import { MarketplaceComponent } from './app/marketplace.component';
import { DashboardCasalComponent } from './app/dashboard-casal.component';
import { DashboardFornecedorComponent } from './app/dashboard-fornecedor.component';
import { DashboardAdminComponent } from './app/dashboard-admin.component';

const routes: Routes = [
 { path: '', component: HomeComponent },
 { path: 'login', component: PageComponent, data: { kind: 'login' } },
 { path: 'registo', component: PageComponent, data: { kind: 'registo' } },
 { path: 'fornecedores', component: MarketplaceComponent },
 { path: 'criar-casamento', component: PageComponent, data: { kind: 'criar-casamento' } },
 { path: 'dashboard', component: DashboardCasalComponent },
 { path: 'dashboard-fornecedor', component: DashboardFornecedorComponent },
 { path: 'admin', component: DashboardAdminComponent },
 { path: 'admin/fornecedores', component: DashboardAdminComponent, data: { secao: 'fornecedores' } },
 { path: '**', redirectTo: '' }
];
bootstrapApplication(AppComponent, { providers: [provideRouter(routes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' })), provideHttpClient()] })
 .catch(error => console.error(error));
