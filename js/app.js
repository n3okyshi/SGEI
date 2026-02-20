import DB from './db.js';
import Auth from './auth.js';
import Utils from './utils.js';
import LoginView from './views/login.js';
import DashboardView from './views/dashboard.js';
import FrequenciaView from './views/frequencia.js';
import NotasView from './views/notas.js';
import RelatorioService from './services/relatorio.js';
import SecretariaView from './views/secretaria.js';
import CoordenacaoView from './views/coordenacao.js';
import AlunoView from './views/aluno.js';
import MatriculaView from './views/matricula.js';
const MENUS = {
    'secretaria_geral': [
        { icone: 'analytics', texto: 'Painel Municipal', acao: 'dashboard_sec' },
        { icone: 'domain', texto: 'Todas as Escolas', acao: 'lista_escolas' },
        { icone: 'description', texto: 'Relatórios Oficiais', acao: 'relatorios' }
    ],
    'conselho': [
        { icone: 'visibility', texto: 'Transparência', acao: 'dashboard_conselho' },
        { icone: 'attach_money', texto: 'Prestação de Contas', acao: 'financeiro_view' }
    ],
    'supervisao': [
        { icone: 'dashboard', texto: 'Painel Supervisão', acao: 'dashboard_sup' },
        { icone: 'fact_check', texto: 'Fiscalização', acao: 'fiscalizacao' }
    ],
    'gestao': [
        { icone: 'dashboard', texto: 'Painel da Escola', acao: 'dashboard' },
        { icone: 'school', texto: 'Gerir Turmas', acao: 'turmas' },
        { icone: 'person_add', texto: 'Matrículas', acao: 'matriculas' },
        { icone: 'group', texto: 'Corpo Docente', acao: 'professores' }
    ],
    'coordenacao': [
        { icone: 'dashboard', texto: 'Painel Pedagógico', acao: 'dashboard' },
        { icone: 'rule', texto: 'Config. Avaliações', acao: 'config_avaliacoes' },
        { icone: 'assignment_turned_in', texto: 'Aprovar Notas', acao: 'aprovar_notas' },
        { icone: 'group', texto: 'Enturmação', acao: 'enturmacao' }
    ],
    'professor': [
        { icone: 'home', texto: 'Minhas Turmas', acao: 'dashboard' },
        { icone: 'menu_book', texto: 'Planejamento', acao: 'planejamento' },
        { icone: 'edit_calendar', texto: 'Frequência', acao: 'frequencia' },
        { icone: 'grade', texto: 'Lançar Notas', acao: 'notas' }
    ],
    'aluno': [
        { icone: 'person', texto: 'Meu Perfil', acao: 'perfil_aluno' },
        { icone: 'table_chart', texto: 'Meu Boletim', acao: 'boletim' },
        { icone: 'event', texto: 'Minha Frequência', acao: 'frequencia_aluno' },
        { icone: 'history_edu', texto: 'Histórico Completo', acao: 'historico_aluno' }
    ]
};
const App = {
    init: function () {
        window.MENUS = MENUS;
        window.DB = DB;
        window.Auth = Auth;
        window.Utils = Utils;
        window.LoginView = LoginView;
        window.DashboardView = DashboardView;
        window.FrequenciaView = FrequenciaView;
        window.NotasView = NotasView;
        window.RelatorioService = RelatorioService;
        window.SecretariaView = SecretariaView;
        window.CoordenacaoView = CoordenacaoView;
        window.AlunoView = AlunoView;
        window.MatriculaView = MatriculaView;
        window.App = this;
        const usuarioLogado = Auth.getUsuarioLogado ? Auth.getUsuarioLogado() : Auth.user;
        this.navegar(usuarioLogado ? 'dashboard' : 'login');
    },
    navegar: function (tela) {
        try {
            const main = document.getElementById('main-content');
            const user = Auth.getUsuarioLogado ? Auth.getUsuarioLogado() : Auth.user;
            if (!user && tela !== 'login') {
                return LoginView.render(main);
            }
            const sidebar = document.getElementById('sidebar');
            if (tela !== 'login' && user) {
                sidebar.classList.remove('hidden');
                this.renderMenu(user);
                document.getElementById('user-role-display').innerText =
                    `${Utils.escapeHtml(user.nome)} (${this._formatarRole(user.role)})`;
            } else {
                sidebar.classList.add('hidden');
            }
            main.innerHTML = '';
            switch (tela) {
                case 'login':
                    return LoginView.render(main);
                case 'dashboard':
                    return DashboardView.render(main);
                case 'frequencia':
                    return FrequenciaView.render(main);
                case 'notas':
                    return NotasView.render(main);
                case 'historico_aluno':
                    return RelatorioService.renderizarHTML(main, user.alunoId);
                case 'relatorio_busca':
                    return RelatorioService.renderizarHTML(main, 1);
                case 'dashboard_sec':
                case 'lista_escolas':
                    return window.SecretariaView ? SecretariaView.renderDashboard(main) : this.renderEmConstrucao(main, tela);
                case 'config_avaliacoes':
                case 'coordenacao':
                    return window.CoordenacaoView ? CoordenacaoView.renderConfigAvaliacoes(main) : this.renderEmConstrucao(main, tela);
                case 'boletim':
                case 'aluno':
                    return window.AlunoView ? AlunoView.renderBoletim(main, user) : this.renderEmConstrucao(main, tela);
                case 'matriculas':
                case 'matricula':
                    return window.MatriculaView ? MatriculaView.renderPainel(main) : this.renderEmConstrucao(main, tela);
                default:
                    return main.innerHTML = `
                    <div class="alert alert-error">
                        <h2>404</h2>
                        <p>Tela ou Rota não encontrada: <strong>${Utils.escapeHtml(tela)}</strong></p>
                        <button onclick="App.navegar('dashboard')">Voltar ao Início</button>
                    </div>`;
            }
        } catch (error) {
            console.error('Erro ao navegar para a rota "' + tela + '":', error);
        }
    },
    renderMenu: function (user) {
        const listaMenu = document.querySelector('#sidebar .menu');
        if (!listaMenu) throw new Error('Erro ao renderizar menu: listaMenu não encontrada.');
        listaMenu.innerHTML = MENUS[user.role]
            .map(item => `<li class="${item.classe || ''}" data-acao="${item.acao}"><span class="material-icons">${item.icone}</span> ${item.texto}</li>`)
            .join('');
        listaMenu.innerHTML += `<li class="logout" data-acao="logout"><span class="material-icons">logout</span> Sair</li>`;
        listaMenu.querySelectorAll('li.logout').forEach(li => li.onclick = () => {
            try {
                if (!Auth.logout()) throw new Error('Erro ao sair do sistema');
                this.navegar('login');
            } catch (error) {
                console.error('Erro ao sair do sistema:', error);
            }
        });
        listaMenu.querySelectorAll('li:not(.logout)').forEach(li => li.onclick = () => {
            try {
                if (!li.dataset.acao || typeof li.dataset.acao !== 'string') throw new Error(`Erro ao navegar para a rota: li.dataset.acao não é uma string válida`);
                this.navegar(li.dataset.acao);
            } catch (error) {
                console.error('Erro ao navegar para a rota "' + li.dataset.acao + '":', error);
            }
        });
    },
    renderEmConstrucao: function (container, tela) {
        if (!container || !tela) {
            throw new Error('renderEmConstrucao: container e tela são obrigatórios');
        }
        if (typeof container !== 'object' || !(container instanceof HTMLElement)) {
            throw new TypeError('renderEmConstrucao: container deve ser um objeto HTMLElement');
        }
        if (typeof tela !== 'string') {
            throw new TypeError('renderEmConstrucao: tela deve ser uma string');
        }
        try {
            const html = `
                <div class="card" style="text-align: center; padding: 50px; margin-top: 20px;">
                    <div style="font-size: 60px; margin-bottom: 20px;">🚧</div>
                    <h2>Módulo em Desenvolvimento</h2>
                    <p>A rota <strong>${Utils.escapeHtml(tela)}</strong> será entregue no próximo Sprint.</p>
                    <br>
                    <button class="btn" onclick="App.navegar('dashboard')" style="padding: 10px 20px; cursor: pointer;">Voltar ao Início</button>
                </div>
            `;
            container.innerHTML = html;
        } catch (error) {
            console.error('Erro ao renderizar tela em construção:', error);
        }
    },
    _formatarRole: function (role) {
        if (typeof role !== 'string') {
            throw new TypeError('_formatarRole: role deve ser uma string');
        }
        if (!role) {
            throw new Error('_formatarRole: role não pode ser nulo ou undefined');
        }
        const papeis = {
            'secretaria_geral': 'Sec. Educação',
            'coordenacao': 'Coordenação',
            'gestao': 'Direção',
            'professor': 'Professor',
            'aluno': 'Aluno'
        };
        if (!papeis.hasOwnProperty(role)) {
            throw new Error(`_formatarRole: role '${role}' não é um papel válido`);
        }
        return papeis[role];
    },
    demoLogin: function (usuario, senha) {
        if (typeof usuario !== 'string' || typeof senha !== 'string') {
            throw new TypeError('demoLogin: usuario e senha devem ser strings');
        }
        if (!usuario || !senha) {
            throw new Error('demoLogin: usuario e senha são obrigatórios');
        }
        const inputUser = document.getElementById('loginUser') || document.getElementById('inputLogin');
        const inputPass = document.getElementById('loginPass') || document.getElementById('inputSenha');
        if (!inputUser || !inputPass) {
            throw new ReferenceError('demoLogin: Campos de usuário e senha não encontrados');
        }
        try {
            inputUser.value = usuario;
            inputPass.value = senha;
            Auth.login(usuario, senha);
            this.navegar('dashboard');
        } catch (err) {
            if (err instanceof ReferenceError || err instanceof TypeError || err instanceof Error) {
                throw err;
            } else {
                console.error(`demoLogin: Falha ao realizar login. ${err}`);
            }
        }
    },
    handleLogin: function () {
        try {
            const userInput = document.getElementById('loginUser') || document.getElementById('inputLogin');
            const passInput = document.getElementById('loginPass') || document.getElementById('inputSenha');
            if (!userInput || !passInput) {
                throw new ReferenceError('handleLogin: Campos de usuário e senha não encontrados');
            }
            if (userInput === null || passInput === null) {
                throw new TypeError('handleLogin: userInput e passInput não podem ser null');
            }
            const usuario = userInput.value.trim();
            const senha = passInput.value.trim();
            if (usuario === '' || senha === '') {
                throw new Error('handleLogin: Usuário e senha são obrigatórios');
            }
            if (typeof usuario !== 'string' || typeof senha !== 'string') {
                throw new TypeError('handleLogin: usuario e senha devem ser strings');
            }
            Auth.login(usuario, senha);
            this.navegar('dashboard');
        } catch (err) {
            if (err instanceof ReferenceError || err instanceof TypeError || err instanceof Error) {
                console.error(`handleLogin: Falha ao realizar login. ${err}`);
            } else {
                throw err;
            }
        }
    }
};
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});