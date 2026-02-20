import DB from '../db.js';
import Utils from '../utils.js';
const ProfessorView = {
    renderNotas: function (container, user) {
        container.innerHTML = `
            <h1>📝 Lançamento de Notas</h1>
            <div class="card">
                <label>Selecione a Turma:</label>
                <select id="selectTurma" style="width:100%; padding:10px; margin-top:5px;">
                    <option value="">-- Selecione --</option>
                </select>
            </div>
            <div id="area-lancamento"></div>
        `;
        this.carregarTurmas(user.id);
    },
    carregarTurmas: function (professorId) {
        const turmas = DB.data.turmas || [];
        const select = document.getElementById('selectTurma');
        turmas.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t.id;
            opt.innerText = `${t.nome} (${t.ano})`;
            select.appendChild(opt);
        });
        select.onchange = (e) => {
            if (e.target.value) {
                this.renderPlanilha(e.target.value);
            } else {
                document.getElementById('area-lancamento').innerHTML = '';
            }
        };
    },
    renderPlanilha: function (turmaId) {
        const area = document.getElementById('area-lancamento');
        const alunos = DB.data.alunos.filter(a => a.turmaId == turmaId);
        const regras = DB.data.configAvaliacoes || [];
        if (regras.length === 0) {
            area.innerHTML = '<div class="card"><p style="color:red">A coordenação ainda não definiu as avaliações.</p></div>';
            return;
        }
        if (alunos.length === 0) {
            area.innerHTML = '<div class="card"><p>Nenhum aluno nesta turma.</p></div>';
            return;
        }
        let html = `
        <div class="card" style="overflow-x: auto;">
            <h3>Diário de Classe</h3>
            <table style="width:100%; border-collapse: collapse;">
                <thead>
                    <tr style="background:#eee; text-align:left;">
                        <th style="padding:10px;">Aluno</th>
                        ${regras.map(r => `<th style="padding:10px;" title="${r.nome}">${r.sigla} <br><small>(Max: ${r.valorMaximo})</small></th>`).join('')}
                    </tr>
                </thead>
                <tbody>
        `;
        alunos.forEach(aluno => {
            html += `<tr>
                <td style="padding:10px; border-bottom:1px solid #ddd;">${Utils.escapeHtml(aluno.nome)}</td>`;
            regras.forEach(regra => {
                const notaAtual = this.buscarNota(aluno.id, regra.id) || "";
                html += `
                <td style="padding:10px; border-bottom:1px solid #ddd;">
                    <input type="number" 
                        step="0.1" 
                        min="0" 
                        max="${regra.valorMaximo}" 
                        value="${notaAtual}"
                        onblur="ProfessorView.salvarNota(${aluno.id}, '${regra.id}', this.value)"
                        style="width: 60px; padding: 5px;">
                </td>`;
            });
            html += `</tr>`;
        });
        html += `</tbody></table>
            <p style="font-size:0.8em; color:gray; margin-top:10px;">* As notas são salvas automaticamente ao sair do campo.</p>
        </div>`;
        area.innerHTML = html;
    },
    buscarNota: function (alunoId, regraId) {
        const notas = DB.data.avaliacoes || [];
        const registro = notas.find(n => n.alunoId == alunoId && n.regraId == regraId);
        return registro ? registro.nota : null;
    },
    salvarNota: function (alunoId, regraId, valor) {
        if (valor === "") return; 
        let notaFloat = parseFloat(valor);
        const regra = DB.data.configAvaliacoes.find(r => r.id == regraId);
        if (notaFloat < 0) notaFloat = 0;
        if (notaFloat > parseFloat(regra.valorMaximo)) {
            alert(`A nota não pode ser maior que ${regra.valorMaximo}`);
            notaFloat = parseFloat(regra.valorMaximo);
        }
        const valorFinal = notaFloat.toFixed(2); 
        if (!DB.data.avaliacoes) DB.data.avaliacoes = [];
        const index = DB.data.avaliacoes.findIndex(n => n.alunoId == alunoId && n.regraId == regraId);
        if (index >= 0) {
            DB.data.avaliacoes[index].nota = valorFinal;
        } else {
            DB.data.avaliacoes.push({
                alunoId: alunoId,
                regraId: regraId,
                nota: valorFinal,
                dataLancamento: new Date().toISOString()
            });
        }
        DB.save();
        console.log(`Nota salva: Aluno ${alunoId}, Regra ${regra.sigla}, Valor ${valorFinal}`);
    }
};
window.ProfessorView = ProfessorView;
export default ProfessorView;