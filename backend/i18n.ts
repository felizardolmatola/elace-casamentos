(function () {
  'use strict';

  const PT_EN = {
    'Início':'Home','Entrar':'Sign in','Criar conta':'Create account','Voltar':'Back',
    'Funcionalidades':'Features','Galeria':'Gallery','Sobre nós':'About us','Fornecedores':'Vendors',
    'Todos os fornecedores':'All vendors','Navegação':'Navigation','Conta':'Account','Contactos':'Contact',
    'Política de Privacidade':'Privacy Policy','Termos de Serviço':'Terms of Service','Termos de Utilização':'Terms of Use',
    'Idioma:':'Language:','Português':'Portuguese','English':'English','Pesquisar...':'Search...',
    'Catering':'Catering','Fotografia':'Photography','Música/DJ':'Music/DJ','Decoração':'Decoration',
    'Vestidos e fatos':'Wedding dresses & suits','Viaturas':'Vehicles','Flores':'Flowers','Espaços':'Venues','Ver todos':'View all',
    'Planeamento':'Planning','Planea':'Planning','Planeamento de casamento, sem stress':'Wedding planning, without the stress',
    'Planeje o seu casamento perfeito':'Plan your perfect wedding',
    'Convidados, orçamento e fornecedores — tudo num só lugar, do "sim" ao grande dia.':'Guests, budget and vendors — everything in one place, from “yes” to the big day.',
    'Começar Agora':'Get Started','Comece Agora':'Get Started','Começar agora':'Get Started',
    'Tudo organizado':'Everything organized','Nove ferramentas, um só painel':'Nine tools, one dashboard',
    'Orçamento':'Budget','Acompanhe cada despesa em tempo real e saiba exatamente onde está o dinheiro.':'Track every expense in real time and always know where your money is.',
    'Contratos, pagamentos e contactos de todos os fornecedores centralizados.':'Contracts, payments and contacts for all vendors in one place.',
    'Gira a lista de convidados, confirmações de presença e lugares à mesa num só lugar.':'Manage your guest list, RSVPs and seating arrangements in one place.',
    'Tarefas & Checklist':'Tasks & Checklist','Organize tudo o que precisa ser feito e acompanhe as tarefas até ao grande dia.':'Organize everything that needs to be done and track tasks until the big day.',
    'Mapa de Mesas':'Seating Plan','Planeie a disposição das mesas e organize os convidados de forma simples.':'Plan your table layout and organize guests with ease.',
    'Documentos':'Documents','Guarde contratos, comprovativos e outros documentos importantes num só lugar.':'Keep contracts, receipts and other important documents in one place.',
    'Notas & Ideias':'Notes & Ideas','Registe ideias, lembretes e inspirações para não esquecer nenhum detalhe.':'Save ideas, reminders and inspiration so you do not forget a detail.',
    'Convites':'Invitations','Crie e enviem convites digitais personalizados aos vossos convidados.':'Create and send personalized digital invitations to your guests.',
    'Progresso':'Progress','Acompanhe a contagem decrescente e o progresso geral do planeamento.':'Track the countdown and your overall planning progress.',
    'O amor não se planeia sozinho, mas o grande dia sim — deixem-nos cuidar dos detalhes enquanto vocês vivem cada momento.':'Love does not plan itself, but the big day can — let us take care of the details while you enjoy every moment.',
    'Equipa Elace casamentos':'Elace casamentos Team','Fique a par das novidades':'Stay up to date',
    'Subscreva e receba dicas de planeamento diretamente no seu email.':'Subscribe and receive planning tips directly in your email.',
    'o seu email':'your email','Subscrever':'Subscribe','Obrigado! Verifique o seu email em breve.':'Thank you! Check your email soon.',
    'Encontre os melhores':'Find the best','Fornecedores para o seu casamento':'Vendors for your wedding',
    'Encontre profissionais e empresas para tornar o seu grande dia ainda mais especial. Compare opções e escolha os fornecedores que melhor combinam com o vosso casamento.':'Find professionals and businesses to make your big day even more special. Compare options and choose the vendors that best fit your wedding.',
    'Serviços de alimentação, bebidas, buffet e bolo para o grande dia.':'Food, drinks, buffet and cake services for your big day.',
    'Fotógrafos profissionais para registar os melhores momentos do casamento.':'Professional photographers to capture your best wedding moments.',
    'DJ, música e entretenimento para animar a celebração.':'DJ, music and entertainment to make the celebration unforgettable.',
    'Decoração, montagem e detalhes para criar o ambiente ideal.':'Decoration, setup and details to create the perfect atmosphere.',
    'Vestidos, fatos e acessórios para os noivos e convidados.':'Dresses, suits and accessories for the couple and guests.',
    'Viaturas para os noivos, convidados e transporte durante o evento.':'Vehicles for the couple, guests and transportation during the event.',
    'Flores, bouquets e arranjos florais para a cerimónia e receção.':'Flowers, bouquets and floral arrangements for the ceremony and reception.',
    'Espaços para eventos':'Event venues','Quintas, salões, jardins e outros espaços para realizar o casamento.':'Farms, halls, gardens and other venues for your wedding.',
    'Ver todos os fornecedores':'View all vendors','Momentos':'Moments','Inspiração para o vosso dia':'Inspiration for your day',
    'Quem somos e como podemos ajudar':'Who we are and how we can help',
    'A Elace casamentos nasceu para simplificar o planeamento de casamentos. Juntamos convidados, orçamento e fornecedores num único painel, para que cada casal viva a preparação do grande dia com calma, clareza e menos stress.':'Elace casamentos was created to simplify wedding planning. We bring guests, budget and vendors together in one dashboard, so every couple can prepare for the big day with calm, clarity and less stress.',
    'Como funciona a Elace casamentos?':'How does Elace casamentos work?',
    'Criam a vossa conta, adicionam os dados do casamento e o painel organiza automaticamente convidados, orçamento e fornecedores num só lugar, com progresso atualizado em tempo real.':'Create your account, add your wedding details, and the dashboard automatically organizes guests, budget and vendors in one place, with progress updated in real time.',
    'A Elace casamentos tem algum custo?':'Does Elace casamentos cost anything?',
    'Podem começar a usar as funcionalidades essenciais gratuitamente. Existem também planos com recursos adicionais para quem quer um acompanhamento mais completo.':'You can start using the essential features for free. Plans with additional features are also available for those who want more complete support.',
    'Posso gerir a lista de convidados e as mesas?':'Can I manage the guest list and tables?',
    'Sim. Podem organizar confirmações, distribuição por mesas e restrições alimentares diretamente no painel, com tudo atualizado automaticamente.':'Yes. You can manage RSVPs, table assignments and dietary restrictions directly in the dashboard, with everything updated automatically.',
    'Como acompanho o orçamento do casamento?':'How do I track the wedding budget?',
    'Cada despesa fica registada em tempo real, permitindo ver exatamente onde está o dinheiro e evitar surpresas antes do grande dia.':'Every expense is recorded in real time, so you can see exactly where your money is going and avoid surprises before the big day.',
    'Consigo falar com os fornecedores pela plataforma?':'Can I contact vendors through the platform?',
    'Sim. Contratos, pagamentos e contactos de todos os fornecedores ficam centralizados, facilitando a comunicação em cada etapa do planeamento.':'Yes. Contracts, payments and contacts for all vendors are centralized, making communication easier at every stage of planning.',
    'Deixe o seu feedback':'Leave your feedback','A sua opinião ajuda-nos a melhorar a plataforma.':'Your feedback helps us improve the platform.',
    'Nome':'Name','Email':'Email','Assunto':'Subject','Sugestão':'Suggestion','Problema técnico':'Technical issue','Elogio':'Praise','Outro':'Other','Mensagem':'Message','Enviar feedback':'Send feedback','Obrigado! O seu feedback foi enviado.':'Thank you! Your feedback has been sent.',
    'Painel do Casal — Elace':'Couple Dashboard — Elace','Nome dos noivos':'Couple names','Data do casamento':'Wedding date','Visão geral':'Overview',
    '+ Nova tarefa':'+ New task','Faltam':'Remaining','Orçamento usado':'Budget used','Convidados confirmados':'Confirmed guests','0 / 0':'0 / 0','Progresso do planeamento':'Planning progress','próximas tarefas':'upcoming tasks',
    'Ainda sem tarefas adicionadas.':'No tasks added yet.','0 confirmados':'0 confirmed','0 por confirmar':'0 pending','0 recusados':'0 declined','+ Adicionar convidado':'+ Add guest','Mesa':'Table','Restrições':'Restrictions','Estado':'Status','Ainda sem convidados adicionados.':'No guests added yet.',
    'Orçamento total':'Total budget','Gasto até agora':'Spent so far','Restante':'Remaining','Ainda sem categorias de orçamento adicionadas.':'No budget categories added yet.','Ainda sem fornecedores adicionados.':'No vendors added yet.',
    'TAREFAS & CHECKLIST':'TASKS & CHECKLIST','Organizem cada etapa do casamento sem esquecer nenhum detalhe.':'Organize every step of the wedding without forgetting a detail.','+ Adicionar tarefa':'+ Add task','Total':'Total','Concluídas':'Completed','Pendentes':'Pending','Ainda sem tarefas. Clique em “Adicionar tarefa” para começar.':'No tasks yet. Click “Add task” to get started.',
    'CALENDÁRIO':'CALENDAR','Calendário':'Calendar','Planeiem compromissos, pagamentos, reuniões e tarefas importantes.':'Plan appointments, payments, meetings and important tasks.','Novo compromisso':'New appointment','Adicionar ao calendário':'Add to calendar','Próximos compromissos':'Upcoming appointments','Nenhum compromisso adicionado.':'No appointments added.',
    'MAPA DE MESAS':'SEATING PLAN','Organizem os convidados por mesa e preparem a disposição do espaço.':'Organize guests by table and prepare the seating layout.','+ Adicionar mesa':'+ Add table','Ainda sem mesas criadas.':'No tables created yet.',
    'DOCUMENTOS':'DOCUMENTS','Centralizem contratos, comprovativos e outros ficheiros do casamento.':'Keep contracts, receipts and other wedding files in one place.','Carregar documentos':'Upload documents','PDF, imagens e outros ficheiros':'PDFs, images and other files','Nenhum documento carregado.':'No documents uploaded.',
    'NOTAS & IDEIAS':'NOTES & IDEAS','Guardem inspirações, decisões e ideias para o grande dia.':'Save inspiration, decisions and ideas for the big day.','+ Nova nota':'+ New note','Ainda sem notas. Criem a primeira ideia.':'No notes yet. Create your first idea.',
    'PROGRESSO':'PROGRESS','Acompanhem visualmente o avanço do planeamento do casamento.':'Visually track the progress of your wedding planning.','Planeamento geral':'Overall planning','Tarefas concluídas':'Completed tasks','Tarefas pendentes':'Pending tasks','Eventos no calendário':'Calendar events',
    'CONVITE':'INVITATION','Editar convite':'Edit invitation','As alterações aparecem na pré-visualização ao lado.':'Changes appear in the preview beside it.','Foto do convite':'Invitation photo','Carregar foto':'Upload photo','Nenhuma foto escolhida':'No photo selected','Nome do noivo':'Groom name','Nome da noiva':'Bride name','Igreja':'Church','Local':'Location','Horário':'Time','Salão':'Reception hall','Copo de água':'Reception','WhatsApp para receber as confirmações':'WhatsApp number for confirmations','Quando um convidado confirmar presença, abre o WhatsApp com a resposta pronta a enviar para este número.':'When a guest confirms attendance, WhatsApp opens with a ready-to-send response to this number.','Guardar convite':'Save invitation','Partilhar convite':'Share invitation','Repor':'Reset','Guardado ✓':'Saved ✓','Pré-visualização':'Preview','Sem foto carregada':'No photo uploaded','Convite de casamento':'Wedding invitation','RSVP':'RSVP','Confirmar presença':'Confirm attendance','O seu nome':'Your name','Vou comparecer':'I will attend','Não poderei ir':'I will not be able to attend','Número de pessoas (incluindo você)':'Number of people (including you)','Restrições alimentares (opcional)':'Dietary restrictions (optional)','Enviar confirmação':'Send RSVP','Escolha uma opção acima.':'Choose an option above.','Obrigado pela confirmação!':'Thank you for your RSVP!',
    'Fornecedores — Elace casamentos':'Vendors — Elace casamentos','Escolha uma categoria e compare opções de baixo custo e de alto custo para o seu orçamento.':'Choose a category and compare low-cost and high-cost options for your budget.','Ainda não há fornecedores cadastrados nesta categoria.':'There are no vendors registered in this category yet.',
    'Painel do fornecedor — Elace casamentos':'Vendor Dashboard — Elace casamentos','Sair':'Sign out','Sessão não encontrada':'Session not found','Entre com a conta de fornecedor para aceder ao painel.':'Sign in with your vendor account to access the dashboard.','Entrar como fornecedor':'Sign in as vendor','Área profissional':'Professional area','Painel do fornecedor':'Vendor dashboard','Gerencie os dados do seu negócio e acompanhe o estado do seu perfil na Elace.':'Manage your business details and track your profile status on Elace.','Estado do perfil':'Profile status','Em revisão':'Under review','A nossa equipa irá rever as informações antes da publicação.':'Our team will review the information before publication.','Categoria':'Category','Localização':'Location','Dados da conta':'Account details','Responsável':'Contact person','Telefone':'Phone','Faixa de preço':'Price range','Baixo custo':'Low cost','Alto custo':'High cost',
    'Convite de Casamento — Esboço':'Wedding Invitation — Draft','têm o prazer de convidar':'are pleased to invite','para celebrar o seu casamento':'to celebrate their wedding','Cerimónia':'Ceremony','Dia':'Day','Data':'Date','Hora':'Time','Receção':'Reception','RSVP até [data limite] · [contacto]':'RSVP by [deadline] · [contact]','Baixar convite em PDF':'Download invitation as PDF','Toque no selo para abrir o convite':'Tap the seal to open the invitation',
    'Entrar — Elace':'Sign in — Elace','Bem-vindos de volta':'Welcome back','Entrar na vossa conta':'Sign in to your account','Continuem o planejamento exatamente onde ficaram.':'Continue planning exactly where you left off.','Introduzam um email válido.':'Enter a valid email.','Palavra-passe':'Password','Esqueceram-se?':'Forgot your password?','A palavra-passe deve ter pelo menos 8 caracteres.':'Password must be at least 8 characters.','Manter sessão iniciada':'Keep me signed in','Criar conta gratuita':'Create a free account','Ainda não têm conta?':'Don’t have an account yet?','Conta de casal':'Couple account','Conta de fornecedor':'Vendor account',
    'Criar conta — Elace casamentos':'Create account — Elace casamentos','Comecem a planejar':'Start planning','Criar a conta do casal':'Create your couple account','Uma única conta para os dois organizarem tudo juntos.':'One account for both of you to organize everything together.','Nomes do casal':'Couple names','O vosso nome':'Your name','Indiquem o vosso nome.':'Enter your name.','Nome do parceiro(a)':'Partner name','Indiquem o nome do parceiro(a).':'Enter your partner’s name.','Data do casamento ':'Wedding date ','(opcional)':'(optional)','Confirmar palavra-passe':'Confirm password','Confirmar Password':'Confirm password','As palavras-passe não coincidem.':'Passwords do not match.','Termos':'Terms','Aceito os':'I accept the','e a':'and the','É necessário aceitar os termos para continuar.':'You must accept the terms to continue.','Já têm conta?':'Already have an account?','Para negócios':'For businesses','Registar como fornecedor':'Register as a vendor','Crie o perfil do vosso negócio e apareçam à frente de casais a planear o casamento.':'Create your business profile and appear to couples planning their wedding.','Nome do negócio':'Business name','Indique o nome do negócio.':'Enter the business name.','Pessoa de contacto':'Contact person','Indique o responsável.':'Enter the contact person.','Indique um contacto válido.':'Enter a valid contact.','Introduza um email válido.':'Enter a valid email.','Categoria do serviço':'Service category','Escolha uma categoria.':'Choose a category.','Cidade / zona de atuação':'City / service area','Indique a cidade ou zona.':'Enter the city or area.','Escolha uma faixa de preço.':'Choose a price range.','Preço aproximado':'Approximate price','Indique um preço ou intervalo.':'Enter a price or range.','Descrição':'Description','Descrição do serviço':'Service description','Escreva uma breve descrição.':'Write a short description.','para fornecedores.':'for vendors.','Registar negócio':'Register business','O perfil fica visível após revisão pela nossa equipa.':'The profile becomes visible after review by our team.','Já têm conta de fornecedor?':'Already have a vendor account?',
    'Painel de administração — Fornecedores | Elace casamentos':'Admin dashboard — Vendors | Elace casamentos','Área reservada':'Restricted area','Painel de administração':'Admin dashboard','Introduza a palavra-passe para gerir os fornecedores do site.':'Enter the password to manage the site vendors.','Palavra-passe incorreta. Tente novamente.':'Incorrect password. Try again.','Nota: esta proteção é apenas um obstáculo básico contra visitantes casuais — não é segurança real. Para um site em produção, restrinja o acesso a esta página no servidor ou por autenticação própria.':'Note: this protection is only a basic obstacle for casual visitors — it is not real security. For a production site, restrict access on the server or use proper authentication.','Gestão de fornecedores':'Vendor management','Importar JSON':'Import JSON','Descarregar dados':'Download data','Ver página pública':'View public page','AVISO DE FLUXO':'WORKFLOW NOTICE','Como publicar as alterações:':'How to publish changes:','as edições feitas aqui ficam guardadas neste navegador. Para que apareçam na página pública':'edits made here are saved in this browser. To publish them on the public page','clique em':'click','e carregue o ficheiro':'and upload the file','gerado para o servidor do site, na mesma pasta do ficheiro':'generated to the site server, in the same folder as the file','(substituindo o anterior).':'(replacing the previous one).','Categorias':'Categories','+ Nova categoria':'+ New category','EDITOR DA CATEGORIA':'CATEGORY EDITOR','Fornecedor':'Vendor','Nome do fornecedor *':'Vendor name *','Faixa de custo':'Cost range','Estado':'Status','Visível no site':'Visible on site','Oculto (rascunho)':'Hidden (draft)','Preço / faixa de preço *':'Price / price range *','Descrição curta *':'Short description *','Imagem':'Image','Se colar um endereço de imagem, ele é usado diretamente. Caso contrário, é gerado um marcador com o texto indicado.':'If you paste an image URL, it is used directly. Otherwise, a placeholder is generated with the indicated text.','Contacto (opcional, aparece como botão no cartão)':'Contact (optional, appears as a button on the card)','WhatsApp':'WhatsApp','E-mail':'Email','Site / Instagram':'Website / Instagram','Endereço':'Address','Eliminar':'Delete','Cancelar':'Cancel','Guardar fornecedor':'Save vendor',
    'CABEÇALHO':'HEADER','Logotipo':'Logo','Seta para voltar ao index':'Back to home arrow','Menu mobile':'Mobile menu','Botão menu hambúrguer':'Menu button','CONTEÚDO':'CONTENT','RODAPÉ':'FOOTER','Ícones de redes sociais':'Social media icons','LINHA INFERIOR':'BOTTOM LINE','CABEÇALHO SIMPLES':'SIMPLE HEADER',
    'Elace casamentos — Planeamento':'Elace casamentos — Planning','Elace casamentos — Planeamento':'Elace casamentos — Planning',
    'Elace casamentos':'Elace casamentos',
    'A entrar…':'Signing in…','Email ou palavra-passe de fornecedor incorretos.':'Incorrect vendor email or password.','Não foi possível iniciar sessão. Tente novamente.':'Could not sign in. Please try again.','Ocultar palavra-passe':'Hide password','Mostrar palavra-passe':'Show password',
    'Nome da tarefa:':'Task name:','Título da nota:':'Note title:','Escreva a sua nota ou ideia:':'Write your note or idea:','Copie o link do convite:':'Copy the invitation link:',
    'Ainda sem categorias de orçamento adicionadas.':'No budget categories added yet.'
  };

  PT_EN['Criar conta — Elace casamentos'] = 'Create account — Elace casamentos';
  PT_EN['Fornecedores — Elace casamentos'] = 'Vendors — Elace casamentos';
  PT_EN['Painel do fornecedor — Elace casamentos'] = 'Vendor Dashboard — Elace casamentos';
  PT_EN['Painel do Casal — Elace'] = 'Couple Dashboard — Elace';
  PT_EN['Convite de Casamento — Esboço'] = 'Wedding Invitation — Draft';
  PT_EN['Painel de administração — Fornecedores | Elace casamentos'] = 'Admin dashboard — Vendors | Elace casamentos';
  const EN_PT = Object.fromEntries(Object.entries(PT_EN).map(([pt,en]) => [en,pt]));
  let currentLang = localStorage.getItem('siteLang') || 'pt';
  let applying = false;

  function normalize(s){ return s.replace(/\s+/g,' ').trim(); }

  function translateNode(node, lang){
    if (!node.nodeValue || !node.nodeValue.trim()) return;
    const raw = node.nodeValue;
    const key = normalize(raw);
    const dict = lang === 'en' ? PT_EN : EN_PT;
    const translated = dict[key];
    if (translated && translated !== key) {
      const leading = raw.match(/^\s*/)?.[0] || '';
      const trailing = raw.match(/\s*$/)?.[0] || '';
      node.nodeValue = leading + translated + trailing;
    }
  }

  function translatePage(lang){
    if (applying) return;
    applying = true;
    currentLang = lang === 'en' ? 'en' : 'pt';
    localStorage.setItem('siteLang', currentLang);
    document.documentElement.setAttribute('lang', currentLang);

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => { if (!n.parentElement || !['SCRIPT','STYLE','NOSCRIPT'].includes(n.parentElement.tagName)) translateNode(n,currentLang); });

    document.querySelectorAll('[placeholder],[title],[aria-label]').forEach(el => {
      ['placeholder','title','aria-label'].forEach(attr => {
        const value = el.getAttribute(attr); if (!value) return;
        const dict = currentLang === 'en' ? PT_EN : EN_PT;
        if (dict[normalize(value)]) el.setAttribute(attr, dict[normalize(value)]);
      });
    });

    const titleDict = currentLang === 'en' ? PT_EN : EN_PT;
    const title = normalize(document.title);
    if (titleDict[title]) document.title = titleDict[title];

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const pt = el.getAttribute('data-i18n');
      if (currentLang === 'en' && PT_EN[pt]) el.textContent = PT_EN[pt];
      if (currentLang === 'pt' && EN_PT[pt]) el.textContent = EN_PT[pt];
    });

    updateSwitcher();
    setTimeout(() => { applying = false; }, 0);
  }

  function updateSwitcher(){
    document.querySelectorAll('[data-global-lang]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.globalLang === currentLang);
      btn.setAttribute('aria-pressed', btn.dataset.globalLang === currentLang ? 'true' : 'false');
    });
  }

  function createSwitcher(){
    // Reuse the existing homepage selector when available.
    const existing = document.querySelectorAll('.lang-option[data-lang]');
    existing.forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        setTimeout(() => translatePage(lang), 0);
      });
    });

    if (document.getElementById('globalLangSwitcher') || existing.length) {
      updateSwitcher();
      return;
    }

    const wrap = document.createElement('div');
    wrap.id = 'globalLangSwitcher';
    wrap.innerHTML = '<button type="button" data-global-lang="pt" aria-label="Português">PT</button><span>|</span><button type="button" data-global-lang="en" aria-label="English">EN</button>';
    wrap.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => translatePage(btn.dataset.globalLang)));
    document.body.appendChild(wrap);
    updateSwitcher();
  }

  function boot(){
    createSwitcher();
    translatePage(currentLang);

    const observer = new MutationObserver(() => {
      if (!applying) translatePage(currentLang);
    });
    observer.observe(document.body, {childList:true, subtree:true, characterData:true});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
