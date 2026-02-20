import DB from '../db.js';
import Auth from '../auth.js';
const DashboardView = {
    render: function (container) {
        const usuario = Auth.getUsuarioLogado();
        if (!usuario) {
            window.App.navegar('login');
            return;
        }
        let html = `
            <div class="dashboard-header">
                <h2>Olá, ${usuario.nome}! 👋</h2>
                <p>Nível de Acesso: <strong>${this._formatarRole(usuario.role)}</strong></p>
                <hr>
            </div>
            <div class="dashboard-content">
        `;
        switch (usuario.role) {
            case 'secretaria_geral':
                html += this._renderSecretaria();
                break;
            case 'gestao':
                html += this._renderDirecao(usuario);
                break;
            case 'coordenacao':
                html += this._renderCoordenacao();
                break;
            case 'professor':
                html += this._renderProfessor(usuario);
                break;
            case 'aluno':
                html += this._renderAluno(usuario);
                break;
            default:
                html += `<div class="alert alert-warning">Perfil não reconhecido ou sem painel definido.</div>`;
        }
        html += `</div>`;
        container.innerHTML = html;
        this._bindEvents();
    },
    _renderSecretaria: function () {
        const totalEscolas = DB.data.escolas.length;
        const totalAlunos = DB.data.alunos.length;
        return `
            <div class="cards-grid">
                <div class="card">
                    <h3>Rede de Ensino</h3>
                    <p><strong>${totalEscolas}</strong> Escolas Ativas</p>
                    <p><strong>${totalAlunos}</strong> Alunos na Rede</p>
                </div>
                <div class="card actions">
                    <h3>Ações Rápidas</h3>
                    <button onclick="window.App.navegar('secretaria')">Gerenciar Unidades</button>
                    <button onclick="window.App.navegar('auditoria')">Auditoria de Notas</button>
                </div>
            </div>
        `;
    },
    _renderDirecao: function (usuario) {
        const escola = DB.data.escolas.find(e => e.id === usuario.escolaId);
        const nomeEscola = escola ? escola.nome : "Escola não vinculada";
        return `
            <div class="cards-grid">
                <div class="card">
                    <h3>${nomeEscola}</h3>
                    <p>Gestão de Matrículas e Documentação Oficial.</p>
                </div>
                <div class="card actions">
                    <h3>Gestão Documental</h3>
                    <button onclick="window.App.navegar('matricula')">Matrículas e Transferências</button>
                    <button onclick="window.App.navegar('relatorio_busca')">Emitir Histórico Escolar</button> 
                </div>
            </div>
        `;
    },
    _renderCoordenacao: function () {
        return `
            <div class="cards-grid">
                <div class="card">
                    <h3>Gestão Pedagógica</h3>
                    <p>Definição de regras de avaliação e calendário letivo.</p>
                </div>
                <div class="card actions">
                    <h3>Ações Pedagógicas</h3>
                    <button onclick="window.App.navegar('coordenacao')">Regras de Avaliação (P1, P2)</button>
                    <button onclick="window.App.navegar('enturmacao')">Enturmação</button>
                </div>
            </div>
        `;
    },
    _renderProfessor: function (usuario) {
        return `
            <div class="cards-grid">
                <div class="card">
                    <h3>Minhas Turmas</h3>
                    <p>Lançamento de notas e frequências.</p>
                </div>
                <div class="card actions">
                    <h3>Diário de Classe</h3>
                    <button onclick="window.App.navegar('professor')">Lançar Notas</button>
                    <button onclick="window.App.navegar('frequencia')">Registrar Frequência</button>
                </div>
            </div>
        `;
    },
    _renderAluno: function (usuario) {
        const aluno = DB.data.alunos.find(a => a.id === usuario.alunoId);
        const nomeAluno = aluno ? aluno.nome : "Aluno não encontrado";
        return `
            <div class="cards-grid">
                <div class="card">
                    <h3>Painel do Aluno</h3>
                    <p><strong>${nomeAluno}</strong></p>
                    <p>Acompanhe seu progresso e notas parciais.</p>
                </div>
                <div class="card actions">
                    <h3>Meu Desempenho</h3>
                    <button onclick="window.App.navegar('aluno')">Ver Boletim Atual</button>
                    <button onclick="window.App.navegar('historico_aluno')">Meu Histórico Acadêmico</button>
                </div>
            </div>
        `;
    },
    _formatarRole: function (role) {
        const papeis = {
            'secretaria_geral': 'Secretaria de Educação (Rede)',
            'coordenacao': 'Coordenação Pedagógica',
            'gestao': 'Direção Escolar',
            'professor': 'Professor',
            'aluno': 'Aluno / Responsável'
        };
        return papeis[role] || role;
    },
    _bindEvents: function () {
    }
};
export default DashboardView;