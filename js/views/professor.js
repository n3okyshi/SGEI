/**
 * JS/VIEWS/PROFESSOR.JS
 * Interface para o professor lançar notas baseadas nas regras da coordenação.
 */
import DB from '../db.js';
import Utils from '../utils.js';

const ProfessorView = {

/**
 * Renderiza o formulário para o professor lançar notas.
 * @param {HTMLElement} container - O elemento HTML que receberá o conteúdo.
 * @param {Object} user - O objeto com as informações do professor.
 */
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

/**
 * Carrega as turmas do professor no select.
 * @param {number} professorId - O ID do professor.
 * @description
 * Simula o carregamento de todas as turmas do professor.
 * No sistema real, usar o ID do professor para filtrar as turmas.
 */
    carregarTurmas: function (professorId) {
        // Simulação: Pega todas as turmas (num sistema real filtraria pelo ID do prof)
        const turmas = DB.data.turmas || [];
        const select = document.getElementById('selectTurma');

        turmas.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t.id;
            opt.innerText = `${t.nome} (${t.ano})`;
            select.appendChild(opt);
        });

        // Evento ao mudar a turma
        select.onchange = (e) => {
            if (e.target.value) {
                this.renderPlanilha(e.target.value);
            } else {
                document.getElementById('area-lancamento').innerHTML = '';
            }
        };
    },

        /**
         * Renderiza a planilha de lançamento de notas com base nas configurações de avaliação.
         * @param {number} turmaId - O ID da turma a ser renderizada.
         * @description
         * Renderiza uma tabela com as informações dos alunos e suas respectivas notas.
         * A tabela é renderizada dinamicamente com base nas configurações de avaliação.
         * No sistema real, usar o ID da turma para filtrar as informações.
         */
    renderPlanilha: function (turmaId) {
        const area = document.getElementById('area-lancamento');
        
        // 1. Busca alunos da turma
        const alunos = DB.data.alunos.filter(a => a.turmaId == turmaId);
        
        // 2. Busca configurações de avaliação (O Padrão da Coordenação)
        const regras = DB.data.configAvaliacoes || [];

        if (regras.length === 0) {
            area.innerHTML = '<div class="card"><p style="color:red">A coordenação ainda não definiu as avaliações.</p></div>';
            return;
        }

        if (alunos.length === 0) {
            area.innerHTML = '<div class="card"><p>Nenhum aluno nesta turma.</p></div>';
            return;
        }

        // Monta a tabela
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
                // Busca nota existente ou vazio
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

/**
 * Busca a nota de um aluno em uma regra específica.
 * @param {number} alunoId - O identificador do aluno.
 * @param {number} regraId - O identificador da regra.
 * @returns {number|null} A nota ou null se não for encontrada.
 */
    buscarNota: function (alunoId, regraId) {
        const notas = DB.data.avaliacoes || [];
        const registro = notas.find(n => n.alunoId == alunoId && n.regraId == regraId);
        return registro ? registro.nota : null;
    },

/**
 * Salva uma nota de um aluno em uma regra específica.
 * @param {number} alunoId - O identificador do aluno.
 * @param {number} regraId - O identificador da regra.
 * @param {string} valor - A nota a ser salva.
 * @description
 * Salva a nota de um aluno em uma regra específica.
 * Ignora vazio, garante duas casas decimais e valida limite.
 * Atualiza no "Banco" e remove anterior se existir.
 * Exibe mensagem de sucesso no console.
 */
    salvarNota: function (alunoId, regraId, valor) {
        if (valor === "") return; // Ignora vazio

        // Garante duas casas decimais e valida limite
        let notaFloat = parseFloat(valor);
        const regra = DB.data.configAvaliacoes.find(r => r.id == regraId);
        
        if (notaFloat < 0) notaFloat = 0;
        if (notaFloat > parseFloat(regra.valorMaximo)) {
            alert(`A nota não pode ser maior que ${regra.valorMaximo}`);
            notaFloat = parseFloat(regra.valorMaximo);
        }

        const valorFinal = notaFloat.toFixed(2); // Requisito: Duas casas decimais

        // Atualiza no "Banco"
        if (!DB.data.avaliacoes) DB.data.avaliacoes = [];
        
        // Remove anterior se existir
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

// Expor globalmente para o onblur funcionar
window.ProfessorView = ProfessorView;

export default ProfessorView;