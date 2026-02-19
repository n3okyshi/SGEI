/**
 * JS/VIEWS/COORDENACAO.JS
 * Painel Pedagógico Avançado
 */
import DB from '../db.js';
import Utils from '../utils.js';

const CoordenacaoView = {

    // Menu interno da tab do coordenador
    renderDashboard: function (container) {
        container.innerHTML = `
            <h1>🧠 Painel Pedagógico</h1>
            <div class="card">
                <div style="display:flex; gap:10px; margin-bottom:20px;">
                    <button class="btn" onclick="CoordenacaoView.renderAprovacaoPlanejamentos()">📝 Aprovar Planejamentos</button>
                    <button class="btn" onclick="CoordenacaoView.renderCalendario()">📅 Calendário Escolar</button>
                    <button class="btn" onclick="CoordenacaoView.renderConfigAvaliacoes()">⚙️ Config. Avaliações</button>
                </div>
                <div id="area-trabalho-coord">
                    <p>Selecione uma ferramenta acima.</p>
                </div>
            </div>
        `;
    },

    /**
     * Renderiza a lista de planejamentos pendentes de aprovação.
     * Mostra todos os planejamentos que estão aguardando aprovação.
     * Cada item da lista exibe o nome do professor, o nome da disciplina e o conteúdo do planejamento.
     * Oferece botões para aprovar ou rejeitar cada planejamento.
     */
    renderAprovacaoPlanejamentos: function () {
        const area = document.getElementById('area-trabalho-coord');
        const pendentes = DB.data.planejamentos.filter(p => p.status === 'PENDENTE');

        let html = `<h3>Planejamentos Pendentes de Aprovação</h3>`;

        if (pendentes.length === 0) {
            html += `<p>Tudo em dia! Nenhum planejamento pendente.</p>`;
        } else {
            pendentes.forEach(p => {
                const prof = DB.data.usuarios.find(u => u.id == p.professorId);
                const disciplina = DB.data.disciplinas.find(d => d.id == p.disciplinaId);

                html += `
                <div style="border:1px solid #ddd; padding:15px; margin-bottom:10px; border-radius:5px;">
                    <p><strong>Prof. ${prof ? prof.nome : 'Unknown'}</strong> - ${disciplina ? disciplina.nome : ''}</p>
                    <p><em>Conteúdo:</em> ${p.conteudo}</p>
                    <div style="margin-top:10px;">
                        <button class="btn" style="background:green" onclick="CoordenacaoView.decidirPlanejamento(${p.id}, 'APROVADO')">Aprovar</button>
                        <button class="btn" style="background:red" onclick="CoordenacaoView.decidirPlanejamento(${p.id}, 'REJEITADO')">Rejeitar (Pedir Revisão)</button>
                    </div>
                </div>`;
            });
        }
        area.innerHTML = html;
    },

    /**
     * Decide se um planejamento é aprovado ou rejeitado.
     * @param {number} id - O ID do planejamento.
     * @param {string} status - O status do planejamento (APROVADO ou REJEITADO).
     */
    decidirPlanejamento: function (id, status) {
        const plan = DB.data.planejamentos.find(p => p.id == id);
        if (plan) {
            plan.status = status;
            DB.save();
            alert(`Planejamento ${status}!`);
            this.renderAprovacaoPlanejamentos();
        }
    },

    /**
     * Renderiza o calendário escolar.
     * Mostra todos os eventos do calendário, separados por data e tipo.
     * Cada item da lista exibe a data, o tipo e a descrição do evento.
     * Oferece botões para adicionar novos eventos.
     */
    renderCalendario: function () {
        const area = document.getElementById('area-trabalho-coord');
        const eventos = DB.data.calendario || [];

        // Filtro simples de visualização
        let html = `
            <h3>Calendário Escolar ${DB.data.config.anoLetivoAtual}</h3>
            <button class="btn" onclick="CoordenacaoView.adicionarEvento()">+ Novo Evento</button>
            <table style="width:100%; margin-top:15px; border-collapse:collapse;">
                <tr style="background:#eee;"><th>Data</th><th>Tipo</th><th>Descrição</th><th>Escopo</th></tr>
        `;

        eventos.sort((a, b) => new Date(a.data) - new Date(b.data)).forEach(evt => {
            html += `
                <tr>
                    <td style="padding:8px; border-bottom:1px solid #ddd;">${Utils.formatDate(evt.data)}</td>
                    <td style="padding:8px; border-bottom:1px solid #ddd;">${evt.tipo.toUpperCase()}</td>
                    <td style="padding:8px; border-bottom:1px solid #ddd;">${evt.descricao}</td>
                    <td style="padding:8px; border-bottom:1px solid #ddd;">${evt.escolaId ? 'Escola Local' : 'Rede (Global)'}</td>
                </tr>
            `;
        });
        html += '</table>';
        area.innerHTML = html;
    },

    /**
     * Adiciona um novo evento ao calendário escolar.
     * Pede a data (formato AAAA-MM-DD) e a descrição do evento.
     * Se a data e a descrição forem fornecidas, o evento é adicionado ao calendário e a lista é atualizada.
     */
    adicionarEvento: function () {
        const data = prompt("Data (AAAA-MM-DD):");
        const desc = prompt("Descrição:");
        if (data && desc) {
            DB.data.calendario.push({
                data: data,
                tipo: 'evento',
                descricao: desc,
                escolaId: null // Global por padrão neste exemplo
            });
            DB.save();
            this.renderCalendario();
        }
    },

    /**
     * Renderiza o formulário para adicionar uma nova regra de avaliação e a lista de regras ativas.
     * @param {HTMLElement} container - O elemento HTML que irá conter o formulário e a lista de regras.
     */
    renderConfigAvaliacoes: function (container) {
        container.innerHTML = `
            <h1>⚙️ Configuração de Avaliações</h1>
            <p>Defina aqui as regras de avaliação.</p>

            <div class="card" style="background-color: #f8f9fa; border-left: 5px solid #8dc63f;">
                <h3>Nova Regra</h3>
                <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: flex-end;">
                    <div style="flex: 2;">
                        <label>Nome</label>
                        <input type="text" id="novaAvNome" placeholder="Ex: Prova Bimestral" style="width: 100%; padding: 8px;">
                    </div>
                    <div style="flex: 1;">
                        <label>Sigla</label>
                        <input type="text" id="novaAvSigla" placeholder="Ex: PB" style="width: 100%; padding: 8px;">
                    </div>
                    <div style="flex: 1;">
                        <label>Valor</label>
                        <input type="number" id="novaAvValor" placeholder="10.00" step="0.5" style="width: 100%; padding: 8px;">
                    </div>
                    <button class="btn" onclick="CoordenacaoView.salvarRegra()">Adicionar</button>
                </div>
            </div>

            <div class="card">
                <h3>Regras Ativas</h3>
                <table style="width:100%; border-collapse: collapse; margin-top: 10px;">
                    <thead>
                        <tr style="background-color: #eee; text-align: left;">
                            <th style="padding: 10px;">Nome</th>
                            <th style="padding: 10px;">Sigla</th>
                            <th style="padding: 10px;">Max.</th>
                            <th style="padding: 10px;">Ações</th>
                        </tr>
                    </thead>
                    <tbody id="tabela-regras"></tbody>
                </table>
            </div>
        `;

        this.listarRegras();
    },

    /**
     * Salva uma nova regra de avaliação.
     * @returns {void}
     */
    salvarRegra: function () {
        const nome = document.getElementById('novaAvNome').value;
        const sigla = document.getElementById('novaAvSigla').value;
        const valor = document.getElementById('novaAvValor').value;

        if (!nome || !sigla || !valor) {
            alert("Preencha todos os campos!");
            return;
        }

        const novaRegra = {
            id: Date.now().toString(),
            // SANITIZAÇÃO AQUI: Antes de salvar no banco, limpamos o HTML
            nome: Utils.escapeHtml(nome),
            sigla: Utils.escapeHtml(sigla).toUpperCase(),
            valorMaximo: parseFloat(valor).toFixed(2),
            criadoPor: 'coordenacao'
        };

        if (!DB.data.configAvaliacoes) DB.data.configAvaliacoes = [];
        DB.data.configAvaliacoes.push(novaRegra);
        DB.save();

        this.listarRegras();

        // Limpa campos
        document.getElementById('novaAvNome').value = '';
        document.getElementById('novaAvSigla').value = '';
        document.getElementById('novaAvValor').value = '';
    },

    listarRegras: function () {
        const tbody = document.getElementById('tabela-regras');
        if (!tbody) return;

        tbody.innerHTML = '';
        const regras = DB.data.configAvaliacoes || [];

        if (regras.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:15px;">Nenhuma regra.</td></tr>';
            return;
        }

        regras.forEach(regra => {
            // SEGURANÇA NA SAÍDA:
            // Embora já tenhamos sanitizado ao salvar, é boa prática sanitizar ao renderizar também
            // caso o dado tenha vindo de outra fonte antiga.
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #eee';

            // Usando Template String com os métodos do objeto View
            tr.innerHTML = `
                <td style="padding: 10px;">${Utils.escapeHtml(regra.nome)}</td>
                <td style="padding: 10px;"><strong>${Utils.escapeHtml(regra.sigla)}</strong></td>
                <td style="padding: 10px;">${regra.valorMaximo}</td>
                <td style="padding: 10px;">
                    <button onclick="CoordenacaoView.excluirRegra('${regra.id}')" style="color:red; cursor:pointer; border:none; background:none;">Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    /**
     * Exclui uma regra de avaliação.
     * @param {string} id - O identificador único da regra.
     * @returns {void}
     */
    excluirRegra: function (id) {
        if (confirm("Confirma exclusão?")) {
            DB.data.configAvaliacoes = DB.data.configAvaliacoes.filter(r => r.id !== id);
            DB.save();
            this.listarRegras();
        }
    }
};

export default CoordenacaoView;