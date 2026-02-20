import DB from '../db.js';
import Utils from '../utils.js';
const CoordenacaoView = {
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
    renderAprovacaoPlanejamentos: function () {
        const area = document.getElementById('area-trabalho-coord');
        const pendentes = DB.data.planejamentos.filter(p => p.status === 'PENDENTE');
        let html = `<h3>Planejamentos Pendentes de Aprovação</h3>`;
        if (pendentes.length === 0) {
            html += `<p>Tudo em dia! Nenhum planejamento pendente.</p>`;
        } else {
            const usuariosMap = new Map(DB.data.usuarios.map(u => [String(u.id), u]));
            const disciplinasMap = new Map(DB.data.disciplinas.map(d => [String(d.id), d]));
            pendentes.forEach(p => {
                const prof = usuariosMap.get(String(p.professorId));
                const disciplina = disciplinasMap.get(String(p.disciplinaId));
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
    decidirPlanejamento: function (id, status) {
        const plan = DB.data.planejamentos.find(p => p.id == id);
        if (plan) {
            plan.status = status;
            DB.save();
            alert(`Planejamento ${status}!`);
            this.renderAprovacaoPlanejamentos();
        }
    },
    renderCalendario: function () {
        const area = document.getElementById('area-trabalho-coord');
        const eventos = DB.data.calendario || [];
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
    adicionarEvento: function () {
        const data = prompt("Data (AAAA-MM-DD):");
        const desc = prompt("Descrição:");
        if (data && desc) {
            DB.data.calendario.push({
                data: data,
                tipo: 'evento',
                descricao: desc,
                escolaId: null 
            });
            DB.save();
            this.renderCalendario();
        }
    },
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
            nome: Utils.escapeHtml(nome),
            sigla: Utils.escapeHtml(sigla).toUpperCase(),
            valorMaximo: parseFloat(valor).toFixed(2),
            criadoPor: 'coordenacao'
        };
        if (!DB.data.configAvaliacoes) DB.data.configAvaliacoes = [];
        DB.data.configAvaliacoes.push(novaRegra);
        DB.save();
        this.listarRegras();
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
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #eee';
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
    excluirRegra: function (id) {
        if (confirm("Confirma exclusão?")) {
            DB.data.configAvaliacoes = DB.data.configAvaliacoes.filter(r => r.id !== id);
            DB.save();
            this.listarRegras();
        }
    }
};
export default CoordenacaoView;