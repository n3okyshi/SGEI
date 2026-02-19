/**
 * JS/APP.JS
 * Cérebro da aplicação.
 * Gerencia a navegação, permissões e integra os módulos (Views).
 */

// 1. IMPORTAÇÃO DOS MÓDULOS (VIEWS E UTILITÁRIOS)
import DB from './db.js';
import Auth from './auth.js';
import Utils from './utils.js';

// Views Específicas
import SecretariaView from './views/secretaria.js';
import CoordenacaoView from './views/coordenacao.js';
import ProfessorView from './views/professor.js';
import AlunoView from './views/aluno.js';
import MatriculaView from './views/matricula.js';

// --- 2. CONFIGURAÇÃO DE MENUS (PERFIS DE ACESSO) ---
const MENUS = {
    // NÍVEL 1: ESTRATÉGICO (MUNICÍPIO)
    'secretaria_geral': [
        { icone: 'analytics', texto: 'Painel Municipal', acao: 'dashboard_sec' },
        { icone: 'domain', texto: 'Todas as Escolas', acao: 'lista_escolas' },
        { icone: 'description', texto: 'Relatórios Oficiais', acao: 'relatorios' }
    ],
    'conselho': [
        { icone: 'visibility', texto: 'Transparência', acao: 'dashboard_conselho' },
        { icone: 'attach_money', texto: 'Prestação de Contas', acao: 'financeiro_view' }
    ],

    // NÍVEL 2: TÁTICO (SUPERVISÃO E GESTÃO ESCOLAR)
    'supervisao': [
        { icone: 'dashboard', texto: 'Painel Supervisão', acao: 'dashboard_sup' },
        { icone: 'fact_check', texto: 'Fiscalização', acao: 'fiscalizacao' }
    ],
    'gestao': [ // Diretor e Secretário Escolar
        { icone: 'dashboard', texto: 'Painel da Escola', acao: 'dashboard' },
        { icone: 'school', texto: 'Gerir Turmas', acao: 'turmas' },
        { icone: 'person_add', texto: 'Matrículas', acao: 'matriculas' },
        { icone: 'group', texto: 'Corpo Docente', acao: 'professores' }
    ],

    // NÍVEL 3: OPERACIONAL PEDAGÓGICO
    'coordenacao': [
        { icone: 'dashboard', texto: 'Painel Pedagógico', acao: 'dashboard' },
        { icone: 'rule', texto: 'Config. Avaliações', acao: 'config_avaliacoes' },
        { icone: 'assignment_turned_in', texto: 'Aprovar Notas', acao: 'aprovar_notas' }
    ],
    'professor': [
        { icone: 'home', texto: 'Minhas Turmas', acao: 'dashboard' },
        { icone: 'menu_book', texto: 'Planejamento', acao: 'planejamento' },
        { icone: 'edit_calendar', texto: 'Frequência', acao: 'frequencia' },
        { icone: 'grade', texto: 'Lançar Notas', acao: 'notas' }
    ],

    // NÍVEL 4: USUÁRIO FINAL
    'aluno': [
        { icone: 'person', texto: 'Meu Perfil', acao: 'perfil_aluno' },
        { icone: 'table_chart', texto: 'Meu Boletim', acao: 'boletim' },
        { icone: 'event', texto: 'Minha Frequência', acao: 'frequencia_aluno' }
    ]
};

const App = {

    // --- 3. INICIALIZAÇÃO ---
    init: function () {
        // Expondo Singletons para acesso global
        window.DB = DB;
        window.Auth = Auth;
        window.SecretariaView = SecretariaView;
        window.CoordenacaoView = CoordenacaoView;
        window.ProfessorView = ProfessorView;
        window.AlunoView = AlunoView;
        window.MatriculaView = MatriculaView;
        window.App = this;

        // Verifica autenticação inicial
        this.navegar(Auth.user ? 'dashboard' : 'login');
    },

    // --- 4. ROTEADOR (NAVIGATOR) ---
    navegar: function (tela) {
        const main = document.getElementById('main-content');
        const user = Auth.user;

        // 4.1 Proteção de Rota
        if (!user && tela !== 'login') {
            this.renderLogin(main);
            return;
        }

        // 4.2 Controle da Sidebar
        if (tela !== 'login') {
            document.getElementById('sidebar').classList.remove('hidden');
            this.renderMenu(user);
            document.getElementById('user-role-display').innerText =
                `${Utils.escapeHtml(user.nome)} (${user.role.toUpperCase()})`;
        } else {
            document.getElementById('sidebar').classList.add('hidden');
        }

        main.innerHTML = '';

        // 4.3 Switch de Telas
        switch (tela) {
            case 'login':
                this.renderLogin(main);
                break;

            // --- ROTAS GERAIS ---
            case 'dashboard':
                this.renderDashboard(main, user);
                break;

            // --- ROTAS DA SECRETARIA ---
            case 'dashboard_sec':
                SecretariaView.renderDashboard(main);
                break;
            case 'lista_escolas':
                SecretariaView.renderDashboard(main);
                setTimeout(() => SecretariaView.renderListaEscolas(), 50);
                break;

            // --- ROTAS DA COORDENAÇÃO ---
            case 'config_avaliacoes':
                CoordenacaoView.renderConfigAvaliacoes(main);
                break;

            // --- ROTAS DO PROFESSOR ---
            case 'notas':
                ProfessorView.renderNotas(main, user);
                break;

            // --- ROTAS DO ALUNO ---
            case 'boletim':
                AlunoView.renderBoletim(main, user);
                break;

            case 'matriculas':
                MatriculaView.renderPainel(main);
                break;

            // --- ROTAS EM DESENVOLVIMENTO ---
            case 'matriculas':
            case 'turmas':
            case 'professores':
            case 'frequencia':
            case 'planejamento':
            case 'fiscalizacao':
            case 'financeiro_view':
            case 'relatorios':
            case 'aprovar_notas':
                this.renderEmConstrucao(main, tela);
                break;

            default:
                main.innerHTML = `<h1>404</h1><p>Tela não encontrada: ${Utils.escapeHtml(tela)}</p>`;
        }
    },

    // --- NOVA FUNÇÃO: LOGIN RÁPIDO (DEMO) ---
    demoLogin: function (usuario, senha) {
        // Preenche os inputs
        document.getElementById('loginUser').value = usuario;
        document.getElementById('loginPass').value = senha;
        // Chama o login real
        Auth.login();
    },

    // --- 5. RENDERIZADORES AUXILIARES ---

    /**
     * Renderiza o menu lateral com base na role do usuário.
     * @param {Object} user - O usuário atual.
     */
    renderMenu: function (user) {
        const listaMenu = document.querySelector('#sidebar .menu');
        listaMenu.innerHTML = '';

        const itens = [...(MENUS[user.role] || [])];
        itens.push({ icone: 'logout', texto: 'Sair', acao: 'logout', classe: 'logout' });

        itens.forEach(item => {
            const li = document.createElement('li');
            if (item.classe) li.classList.add(item.classe);
            li.innerHTML = `<span class="material-icons">${item.icone}</span> ${item.texto}`;

            if (item.acao === 'logout') {
                li.onclick = () => Auth.logout();
            } else {
                li.onclick = () => this.navegar(item.acao);
            }
            listaMenu.appendChild(li);
        });
    },

    /**
     * Renderiza a tela de login com campos de usuário e senha,
     * juntamente com botões de clique rápido para acesso rápido.
     * @param {Element} container - O elemento que irá conter a tela de login.
     */
    renderLogin: function (container) {
        // Agora com botões de clique rápido
        container.innerHTML = `
            <div class="card" style="max-width: 400px; margin: 100px auto; text-align: center;">
                <div style="font-size: 60px; margin-bottom: 20px;">🎓</div>
                <h2>SGE Integrado</h2>
                <p style="color: #666; margin-bottom: 20px;">Sistema de Gestão Educacional</p>
                
                <input type="text" id="loginUser" placeholder="Usuário" style="width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px;">
                <input type="password" id="loginPass" placeholder="Senha" style="width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px;">
                
                <button class="btn" style="width: 100%; margin-top: 10px;" onclick="Auth.login()">ENTRAR</button>
                
                <div style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 4px; font-size: 0.8em; text-align: left; color: #555;">
                    <strong>Acesso Rápido (Demo):</strong>
                    <div style="display:grid; gap: 5px; margin-top: 10px;">
                        <button onclick="App.demoLogin('sec', '123')" style="cursor:pointer; padding:5px; border:1px solid #ddd; background:white;">🏛️ Secretaria (sec)</button>
                        <button onclick="App.demoLogin('coord', '123')" style="cursor:pointer; padding:5px; border:1px solid #ddd; background:white;">📚 Coordenação (coord)</button>
                        <button onclick="App.demoLogin('prof', '123')" style="cursor:pointer; padding:5px; border:1px solid #ddd; background:white;">👩‍🏫 Professor (prof)</button>
                        <button onclick="App.demoLogin('aluno', '123')" style="cursor:pointer; padding:5px; border:1px solid #ddd; background:white;">🎒 Aluno (aluno)</button>
                        <button onclick="App.demoLogin('dir', '123')" style="cursor:pointer; padding:5px; border:1px solid #ddd; background:white;">👔 Diretor (dir)</button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Renderiza a tela de dashboard para o usuário logado.
     * A tela de dashboard varia de acordo com o papel do usuário.
     * @param {Element} container - O elemento que irá conter a tela de dashboard.
     * @param {Object} user - O usuário atual, com informações de nome e papel.
     */

    renderDashboard: function (container, user) {
        let titulo = 'Bem-vindo(a)';
        let subtitulo = 'Selecione uma opção no menu lateral.';

        if (user.role === 'gestao') titulo = 'Painel da Gestão Escolar';
        if (user.role === 'professor') titulo = 'Sala dos Professores Virtual';
        if (user.role === 'aluno') titulo = 'Portal do Aluno';
        if (user.role === 'secretaria_geral') titulo = 'Gabinete da Secretaria';

        container.innerHTML = `
            <h1>${titulo}</h1>
            <p>${subtitulo}</p>
            
            <div class="card" style="margin-top: 20px;">
                <h3>Status do Sistema</h3>
                <p>Base de dados local ativa.</p>
                <button class="btn" onclick="DB.downloadBackup()">⬇️ Baixar Backup (JSON)</button>
            </div>
        `;
    },

    /**
     * Renderiza a tela de "Em Construção" para o módulo informado.
     * @param {Element} container - O elemento que irá conter a tela de "Em Construção".
     * @param {string} tela - O nome do módulo que está em construção.
     */
    renderEmConstrucao: function (container, tela) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <span class="material-icons" style="font-size: 60px; color: #f39c12;">engineering</span>
                <h1>Funcionalidade em Desenvolvimento</h1>
                <p>O módulo <strong>${Utils.escapeHtml(tela)}</strong> será implementado na próxima etapa.</p>
                <br>
                <button class="btn" onclick="App.navegar('dashboard')">Voltar ao Início</button>
            </div>
        `;
    }
};

// Inicializador
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});