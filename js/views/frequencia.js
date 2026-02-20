import DB from '../db.js';
import Auth from '../auth.js';
import Utils from '../utils.js'; 
const FrequenciaView = {
    render: function (container) {
        const usuario = Auth.getUsuarioLogado();
        if (!usuario || (usuario.role !== 'professor' && usuario.role !== 'gestao' && usuario.role !== 'secretaria_geral')) {
            container.innerHTML = `<div class="alert alert-error">Acesso negado. Apenas docentes e gestão podem registrar frequência.</div>`;
            return;
        }
        const anoAtual = DB.data.config.anoLetivoAtual;
        const turmas = DB.data.turmas.filter(t => t.ano === anoAtual);
        const disciplinas = DB.data.disciplinas;
        let html = `
            <div class="view-header">
                <h2>📅 Diário de Classe - Lançamento de Frequência</h2>
                <p>Ano Letivo Vigente: <strong>${anoAtual}</strong></p>
                <button onclick="window.App.navegar('dashboard')" style="float: right;">Voltar ao Painel</button>
            </div>
            <div class="filter-section card" style="margin-bottom: 20px; padding: 15px; background: #f9f9f9;">
                <h3>Selecionar Diário</h3>
                <div style="display: flex; gap: 15px; align-items: flex-end;">
                    <div>
                        <label>Data da Aula:</label><br>
                        <input type="date" id="freqData" max="${new Date().toISOString().split('T')[0]}" required>
                    </div>
                    <div>
                        <label>Turma:</label><br>
                        <select id="freqTurma">
                            <option value="">-- Selecione --</option>
                            ${turmas.map(t => `<option value="${t.id}">${t.nome}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label>Componente Curricular:</label><br>
                        <select id="freqDisciplina">
                            <option value="">-- Selecione --</option>
                            ${disciplinas.map(d => `<option value="${d.id}">${d.nome} (${d.area})</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <button id="btnCarregarLista" style="padding: 8px 15px; cursor: pointer;">Carregar Lista de Alunos</button>
                    </div>
                </div>
            </div>
            <div id="listaAlunosContainer">
                <p style="color: #666; font-style: italic;">Selecione a data, turma e disciplina para carregar a lista de presença.</p>
            </div>
        `;
        container.innerHTML = html;
        this._bindEvents();
    },
    _bindEvents: function () {
        const btnCarregar = document.getElementById('btnCarregarLista');
        if (btnCarregar) {
            btnCarregar.addEventListener('click', () => this._carregarLista());
        }
    },
    _carregarLista: function () {
        const dataAula = document.getElementById('freqData').value;
        const turmaId = parseInt(document.getElementById('freqTurma').value);
        const disciplinaId = document.getElementById('freqDisciplina').value;
        const containerLista = document.getElementById('listaAlunosContainer');
        if (!dataAula || !turmaId || !disciplinaId) {
            alert("Por favor, preencha todos os campos (Data, Turma e Disciplina) para carregar a lista.");
            return;
        }
        const anoAtual = DB.data.config.anoLetivoAtual;
        const matriculasAtivas = DB.data.matriculas.filter(m =>
            m.turmaId === turmaId &&
            m.ano === anoAtual &&
            m.status === 'ATIVO'
        );
        if (matriculasAtivas.length === 0) {
            containerLista.innerHTML = `<div class="alert alert-warning">Nenhum aluno ativo encontrado nesta turma para o ano de ${anoAtual}.</div>`;
            return;
        }
        const registroExistente = DB.data.frequencia.find(f =>
            f.turmaId === turmaId &&
            f.disciplinaId === disciplinaId &&
            f.data === dataAula
        );
        let htmlLista = `
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3>Lista de Presença</h3>
                    <div>
                        <button onclick="document.querySelectorAll('.radio-presenca').forEach(r => r.checked = true)">Marcar Todos Presentes</button>
                    </div>
                </div>
                <table class="data-table" style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="border-bottom: 2px solid #ccc; padding: 10px; text-align: left;">Matrícula</th>
                            <th style="border-bottom: 2px solid #ccc; padding: 10px; text-align: left;">Nome do Aluno</th>
                            <th style="border-bottom: 2px solid #ccc; padding: 10px; text-align: center;">Presença (P)</th>
                            <th style="border-bottom: 2px solid #ccc; padding: 10px; text-align: center;">Falta (F)</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        matriculasAtivas.forEach(matricula => {
            const aluno = DB.data.alunos.find(a => a.id === matricula.alunoId);
            let statusAtual = 'P';
            if (registroExistente) {
                const recAluno = registroExistente.registros.find(r => r.alunoId === aluno.id);
                if (recAluno) statusAtual = recAluno.status;
            }
            htmlLista += `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px;">${matricula.id}</td>
                    <td style="padding: 10px;"><strong>${aluno.nome}</strong></td>
                    <td style="padding: 10px; text-align: center;">
                        <input type="radio" name="freq_${aluno.id}" class="radio-presenca" value="P" ${statusAtual === 'P' ? 'checked' : ''}>
                    </td>
                    <td style="padding: 10px; text-align: center;">
                        <input type="radio" name="freq_${aluno.id}" value="F" ${statusAtual === 'F' ? 'checked' : ''}>
                    </td>
                </tr>
            `;
        });
        htmlLista += `
                    </tbody>
                </table>
                <div style="margin-top: 20px; text-align: right;">
                    <button id="btnSalvarFrequencia" style="padding: 10px 20px; background: #28a745; color: white; border: none; cursor: pointer; font-size: 16px;">💾 Salvar Frequência</button>
                </div>
            </div>
        `;
        containerLista.innerHTML = htmlLista;
        document.getElementById('btnSalvarFrequencia').addEventListener('click', () => {
            this._salvarFrequencia(dataAula, turmaId, disciplinaId, matriculasAtivas, registroExistente);
        });
    },
    _salvarFrequencia: function (dataAula, turmaId, disciplinaId, matriculasAtivas, registroExistente) {
        const registrosAluno = [];
        matriculasAtivas.forEach(matricula => {
            const radios = document.getElementsByName(`freq_${matricula.alunoId}`);
            let status = 'P'; 
            for (let i = 0; i < radios.length; i++) {
                if (radios[i].checked) {
                    status = radios[i].value;
                    break;
                }
            }
            registrosAluno.push({
                alunoId: matricula.alunoId,
                status: status
            });
        });
        if (registroExistente) {
            registroExistente.registros = registrosAluno;
            registroExistente.atualizadoEm = new Date().toISOString();
            registroExistente.usuarioId = Auth.getUsuarioLogado().id;
        } else {
            const novoRegistro = {
                id: Date.now(), 
                turmaId: turmaId,
                disciplinaId: disciplinaId,
                data: dataAula,
                registros: registrosAluno,
                criadoEm: new Date().toISOString(),
                usuarioId: Auth.getUsuarioLogado().id
            };
            DB.data.frequencia.push(novoRegistro);
        }
        DB.save();
        alert("✅ Frequência salva com sucesso!");
    }
};
export default FrequenciaView;