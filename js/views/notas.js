import DB from '../db.js';
import Auth from '../auth.js';
const NotasView = {
    render: function (container) {
        const usuario = Auth.getUsuarioLogado();
        if (!usuario || (usuario.role !== 'professor' && usuario.role !== 'gestao' && usuario.role !== 'coordenacao')) {
            container.innerHTML = `<div class="alert alert-error">Acesso negado. Apenas docentes e gestão podem lançar notas.</div>`;
            return;
        }
        const anoAtual = DB.data.config.anoLetivoAtual;
        const turmas = DB.data.turmas.filter(t => t.ano === anoAtual);
        const disciplinas = DB.data.disciplinas;
        let regrasAvaliacao = DB.data.configAvaliacoes || [];
        if (regrasAvaliacao.length === 0) {
            regrasAvaliacao = [
                { id: 1, etapa: 1, tipo: 'P1', descricao: 'Prova Bimestral', valorMaximo: 10.00 },
                { id: 2, etapa: 1, tipo: 'Trabalho', descricao: 'Trabalho de Pesquisa', valorMaximo: 5.00 }
            ];
        }
        let html = `
            <div class="view-header">
                <h2>📝 Lançamento de Notas (Avaliações)</h2>
                <p>Ano Letivo Vigente: <strong>${anoAtual}</strong></p>
                <button onclick="window.App.navegar('dashboard')" style="float: right;">Voltar ao Painel</button>
            </div>
            <div class="filter-section card" style="margin-bottom: 20px; padding: 15px; background: #f9f9f9;">
                <h3>Selecionar Parâmetros da Avaliação</h3>
                <div style="display: flex; gap: 15px; align-items: flex-end; flex-wrap: wrap;">
                    <div>
                        <label>Turma:</label><br>
                        <select id="notaTurma">
                            <option value="">-- Selecione --</option>
                            ${turmas.map(t => `<option value="${t.id}">${t.nome}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label>Componente Curricular:</label><br>
                        <select id="notaDisciplina">
                            <option value="">-- Selecione --</option>
                            ${disciplinas.map(d => `<option value="${d.id}">${d.nome}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label>Regra da Avaliação (Coordenação):</label><br>
                        <select id="notaRegra">
                            <option value="">-- Selecione --</option>
                            ${regrasAvaliacao.map(r => `<option value="${r.id}" data-max="${r.valorMaximo}" data-etapa="${r.etapa}" data-tipo="${r.tipo}">
                                Bimestre ${r.etapa} - ${r.tipo} (Máx: ${r.valorMaximo.toFixed(2)})
                            </option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <button id="btnCarregarNotas" style="padding: 8px 15px; cursor: pointer; background: #0056b3; color: white; border: none; border-radius: 4px;">Carregar Planilha</button>
                    </div>
                </div>
            </div>
            <div id="planilhaNotasContainer">
                <p style="color: #666; font-style: italic;">Selecione a Turma, Disciplina e a Regra de Avaliação para iniciar os lançamentos.</p>
            </div>
        `;
        container.innerHTML = html;
        this._bindEvents();
    },
    _bindEvents: function () {
        const btnCarregar = document.getElementById('btnCarregarNotas');
        if (btnCarregar) {
            btnCarregar.addEventListener('click', () => this._carregarPlanilha());
        }
    },
    _carregarPlanilha: function () {
        const turmaId = parseInt(document.getElementById('notaTurma').value);
        const disciplinaId = document.getElementById('notaDisciplina').value;
        const selectRegra = document.getElementById('notaRegra');
        const regraId = parseInt(selectRegra.value);
        const containerPlanilha = document.getElementById('planilhaNotasContainer');
        if (!turmaId || !disciplinaId || !regraId) {
            alert("Por favor, preencha todos os filtros para carregar a planilha de notas.");
            return;
        }
        const optionSelecionada = selectRegra.options[selectRegra.selectedIndex];
        const valorMaximo = parseFloat(optionSelecionada.getAttribute('data-max'));
        const tipoRegra = optionSelecionada.getAttribute('data-tipo');
        const etapaRegra = parseInt(optionSelecionada.getAttribute('data-etapa'));
        const anoAtual = DB.data.config.anoLetivoAtual;
        const matriculasAtivas = DB.data.matriculas.filter(m =>
            m.turmaId === turmaId &&
            m.ano === anoAtual &&
            m.status === 'ATIVO'
        );
        if (matriculasAtivas.length === 0) {
            containerPlanilha.innerHTML = `<div class="alert alert-warning">Nenhum aluno ativo encontrado para esta turma.</div>`;
            return;
        }
        let htmlPlanilha = `
            <div class="card">
                <div style="margin-bottom: 15px; background: #eef5f9; padding: 10px; border-left: 4px solid #0056b3;">
                    <strong>Regra Selecionada:</strong> ${tipoRegra} | 
                    <strong>Etapa:</strong> ${etapaRegra}º Bimestre | 
                    <strong>Valor Máximo Permitido:</strong> <span style="color: red;">${valorMaximo.toFixed(2)}</span>
                </div>
                <table class="data-table" style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="border-bottom: 2px solid #ccc; padding: 10px; text-align: left; width: 15%;">Matrícula</th>
                            <th style="border-bottom: 2px solid #ccc; padding: 10px; text-align: left; width: 60%;">Nome do Aluno</th>
                            <th style="border-bottom: 2px solid #ccc; padding: 10px; text-align: right; width: 25%;">Nota Obtida</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        matriculasAtivas.forEach(matricula => {
            const aluno = DB.data.alunos.find(a => a.id === matricula.alunoId);
            const notaExistente = DB.data.avaliacoes.find(av =>
                av.alunoId === matricula.alunoId &&
                av.disciplinaId === disciplinaId &&
                av.tipo === tipoRegra &&
                av.etapa === etapaRegra
            );
            const valorAtual = notaExistente ? parseFloat(notaExistente.valor).toFixed(2) : '';
            htmlPlanilha += `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px;">${matricula.id}</td>
                    <td style="padding: 10px;"><strong>${aluno.nome}</strong></td>
                    <td style="padding: 10px; text-align: right;">
                        <input type="number" 
                               class="input-nota" 
                               data-aluno-id="${aluno.id}"
                               value="${valorAtual}" 
                               min="0" 
                               max="${valorMaximo}" 
                               step="0.01" 
                               placeholder="0.00"
                               style="width: 80px; text-align: right; padding: 5px; border: 1px solid #ccc; border-radius: 4px;">
                    </td>
                </tr>
            `;
        });
        htmlPlanilha += `
                    </tbody>
                </table>
                <div style="margin-top: 20px; text-align: right;">
                    <button id="btnSalvarNotas" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">💾 Salvar Notas</button>
                </div>
            </div>
        `;
        containerPlanilha.innerHTML = htmlPlanilha;
        document.querySelectorAll('.input-nota').forEach(input => {
            input.addEventListener('blur', (e) => this._sanitizarNota(e.target, valorMaximo));
            input.addEventListener('input', (e) => {
                if (parseFloat(e.target.value) > valorMaximo) {
                    e.target.value = valorMaximo;
                }
            });
        });
        document.getElementById('btnSalvarNotas').addEventListener('click', () => {
            this._salvarNotas(disciplinaId, tipoRegra, etapaRegra);
        });
    },
    _sanitizarNota: function (input, valorMaximo) {
        let valor = input.value.replace(',', '.');
        if (valor === '') return;
        let valFloat = parseFloat(valor);
        if (isNaN(valFloat) || valFloat < 0) {
            valFloat = 0;
        } else if (valFloat > valorMaximo) {
            valFloat = valorMaximo;
        }
        input.value = valFloat.toFixed(2);
    },
    _salvarNotas: function (disciplinaId, tipoRegra, etapaRegra) {
        const inputs = document.querySelectorAll('.input-nota');
        let contadorSalvos = 0;
        inputs.forEach(input => {
            const valor = input.value;
            if (valor !== '') {
                const alunoId = parseInt(input.getAttribute('data-aluno-id'));
                const valorFormatado = parseFloat(valor).toFixed(2);
                const index = DB.data.avaliacoes.findIndex(av =>
                    av.alunoId === alunoId &&
                    av.disciplinaId === disciplinaId &&
                    av.tipo === tipoRegra &&
                    av.etapa === etapaRegra
                );
                if (index !== -1) {
                    DB.data.avaliacoes[index].valor = valorFormatado;
                } else {
                    DB.data.avaliacoes.push({
                        id: Date.now() + Math.random(),
                        alunoId: alunoId,
                        disciplinaId: disciplinaId,
                        etapa: etapaRegra,
                        tipo: tipoRegra,
                        valor: valorFormatado
                    });
                }
                contadorSalvos++;
            }
        });
        DB.save();
        alert(`✅ Sucesso! ${contadorSalvos} notas foram salvas e formatadas com precisão para o Histórico Escolar.`);
    }
};
export default NotasView;