/**
 * JS/VIEWS/MATRICULA.JS
 * Gerencia Matrícula Nova, Rematrícula e Transferências.
 */
import DB from '../db.js';
import Utils from '../utils.js';

const MatriculaView = {

    /**
     * Renderiza o painel principal da central de matrículas.
     * Este painel apresenta as opções de Nova Matrícula e Rematrícula/Transferência.
     * @param {HTMLElement} container - Elemento HTML que irá conter o painel.
     */
    renderPainel: function (container) {
        container.innerHTML = `
            <h1>📂 Central de Matrículas</h1>
            
            <div class="card">
                <h3>O que deseja fazer?</h3>
                <div style="display:flex; gap:10px;">
                    <button class="btn" onclick="MatriculaView.renderFormNova()">Nova Matrícula (Aluno Novo)</button>
                    <button class="btn" style="background:#2c3e50" onclick="MatriculaView.renderBuscaRematricula()">Rematrícula / Transferência</button>
                </div>
            </div>

            <div id="area-matricula-form"></div>
        `;
    },

    // --- FLUXO 1: ALUNO NOVO ---
    renderFormNova: function () {
        const area = document.getElementById('area-matricula-form');
        area.innerHTML = `
            <div class="card" style="border-left: 5px solid #8dc63f;">
                <h3>🆕 Cadastro de Novo Aluno</h3>
                <form id="formNovaMatricula" onsubmit="event.preventDefault(); MatriculaView.salvarNovo();">
                    
                    <h4>Dados Pessoais</h4>
                    <div class="grid-2">
                        <input type="text" id="novoNome" placeholder="Nome Completo do Estudante" required style="width:100%; padding:10px; margin-bottom:10px;">
                        <input type="date" id="novoNasc" required style="width:100%; padding:10px; margin-bottom:10px;">
                    </div>
                    <input type="text" id="novoDoc" placeholder="CPF ou Certidão" style="width:100%; padding:10px; margin-bottom:10px;">
                    <input type="text" id="novoEnd" placeholder="Endereço Completo" style="width:100%; padding:10px; margin-bottom:10px;">

                    <h4>Filiação / Responsáveis</h4>
                    <div class="grid-2">
                        <input type="text" id="nomeMae" placeholder="Nome da Mãe" style="width:100%; padding:10px; margin-bottom:10px;">
                        <input type="text" id="nomePai" placeholder="Nome do Pai" style="width:100%; padding:10px; margin-bottom:10px;">
                    </div>
                    <input type="text" id="nomeResp" placeholder="Nome do Responsável Legal (Obrigatório)" required style="width:100%; padding:10px; margin-bottom:10px;">

                    <h4>Dados da Matrícula</h4>
                    <select id="selEscola" style="width:100%; padding:10px; margin-bottom:10px;"></select>
                    
                    <button type="submit" class="btn">Concluir Matrícula</button>
                </form>
            </div>
        `;

        // Popula escolas
        const sel = document.getElementById('selEscola');
        DB.data.escolas.forEach(e => {
            const opt = document.createElement('option');
            opt.value = e.id;
            opt.innerText = e.nome;
            sel.appendChild(opt);
        });
    },

    /**
     * Salva o novo aluno e sua matrícula.
     * Cria o perfil do Aluno e a Matrícula (Vínculo) e salva no banco.
     * Após a conclusão do cadastro, renderiza o painel principal novamente.
     */
    salvarNovo: function () {
        // 1. Cria o Aluno (Perfil)
        const novoAluno = {
            id: Date.now(),
            nome: document.getElementById('novoNome').value,
            dataNascimento: document.getElementById('novoNasc').value,
            documento: document.getElementById('novoDoc').value,
            endereco: document.getElementById('novoEnd').value,
            filiacao: {
                mae: document.getElementById('nomeMae').value,
                pai: document.getElementById('nomePai').value,
                responsavelLegal: document.getElementById('nomeResp').value
            }
        };
        DB.data.alunos.push(novoAluno);

        // 2. Cria a Matrícula (Vínculo)
        const novaMatricula = {
            id: 'mat_' + Date.now(),
            alunoId: novoAluno.id,
            escolaId: document.getElementById('selEscola').value,
            ano: DB.data.config.anoLetivoAtual,
            turmaId: null, // Ainda não enturmado
            status: 'ATIVO', // Ou 'AGUARDANDO_TURMA'
            dataMatricula: new Date().toISOString().slice(0, 10),
            dataSaida: null
        };
        DB.data.matriculas.push(novaMatricula);

        DB.save();
        alert("Aluno Cadastrado e Matriculado com Sucesso!");
        this.renderPainel(document.getElementById('main-content'));
    },

    // --- FLUXO 2: REMATRÍCULA / TRANSFERÊNCIA ---
    renderBuscaRematricula: function () {
        const area = document.getElementById('area-matricula-form');
        area.innerHTML = `
            <div class="card" style="border-left: 5px solid #2c3e50;">
                <h3>🔄 Rematrícula / Transferência</h3>
                <p>Busque o aluno pelo nome ou matrícula anterior.</p>
                <input type="text" id="buscaAluno" placeholder="Nome do aluno..." style="width:70%; padding:10px;">
                <button class="btn" onclick="MatriculaView.buscarAluno()">Buscar</button>
                
                <div id="resultado-busca" style="margin-top:20px;"></div>
            </div>
        `;
    },

    /**
     * Busca o aluno pelo nome ou matrícula anterior.
     * Filtra o array de alunos com base no termo de busca (case-insensitive).
     * Mostra os resultados em uma tabela com as seguintes colunas:
     *   - Nome do aluno
     *   - MÃe do aluno
     *   - Ãltimo status (ativo/inativo, ano da Ãltima matrÃcula)
     *   - BotÃo para selecionar o aluno
     */
    buscarAluno: function () {
        const termo = document.getElementById('buscaAluno').value.toLowerCase();
        const resultados = DB.data.alunos.filter(a => a.nome.toLowerCase().includes(termo));

        const div = document.getElementById('resultado-busca');

        if (resultados.length === 0) {
            div.innerHTML = '<p>Nenhum aluno encontrado.</p>';
            return;
        }

        let html = '<table style="width:100%">';
        resultados.forEach(aluno => {
            // Pega a última matrícula para mostrar status
            const ultMatricula = DB.data.matriculas
                .filter(m => m.alunoId == aluno.id)
                .sort((a, b) => b.ano - a.ano)[0];

            html += `
                <tr style="border-bottom:1px solid #eee;">
                    <td style="padding:10px;">
                        <strong>${Utils.escapeHtml(aluno.nome)}</strong><br>
                        <small>Mãe: ${Utils.escapeHtml(aluno.filiacao.mae)}</small>
                    </td>
                    <td style="padding:10px;">
                        Último Status: ${ultMatricula ? ultMatricula.status : 'Sem registro'}<br>
                        Ano: ${ultMatricula ? ultMatricula.ano : '-'}
                    </td>
                    <td style="padding:10px;">
                        <button class="btn" onclick="MatriculaView.renderDetalhesAluno(${aluno.id})">Selecionar</button>
                    </td>
                </tr>
            `;
        });
        html += '</table>';
        div.innerHTML = html;
    },

    /**
     * Renderiza o painel de detalhes de um aluno, com histórico de matrículas e ocorrências disciplinares.
     * @param {number} alunoId - ID do aluno a ser renderizado.
     */
    renderDetalhesAluno: function (alunoId) {
        const aluno = DB.data.alunos.find(a => a.id == alunoId);
        const historico = DB.data.matriculas.filter(m => m.alunoId == alunoId).sort((a, b) => b.ano - a.ano);
        const ocorrencias = DB.data.ocorrencias.filter(o => o.alunoId == alunoId);

        const area = document.getElementById('area-matricula-form');

        // Histórico HTML
        let histHTML = historico.map(h =>
            `<li>${h.ano} - Escola ID ${h.escolaId} - Status: <strong>${h.status}</strong></li>`
        ).join('');

        // Ocorrências HTML
        let ocorHTML = ocorrencias.length > 0
            ? ocorrencias.map(o => `<li style="color:red">${Utils.formatDate(o.data)}: ${o.tipo} - ${o.descricao}</li>`).join('')
            : '<li>Nenhuma ocorrência registrada.</li>';

        area.innerHTML = `
            <div class="card">
                <h2>${Utils.escapeHtml(aluno.nome)}</h2>
                <div style="display:flex; gap:20px;">
                    <div style="flex:1">
                        <h4>Histórico de Matrículas</h4>
                        <ul>${histHTML}</ul>
                    </div>
                    <div style="flex:1">
                        <h4>Histórico Disciplinar</h4>
                        <ul>${ocorHTML}</ul>
                    </div>
                </div>
                
                <hr>
                <h3>Ação para 2026:</h3>
                <button class="btn" onclick="MatriculaView.processarRematricula(${aluno.id}, 'MESMA_ESCOLA')">✅ Rematricular nesta Escola</button>
                <button class="btn" style="background:orange" onclick="MatriculaView.processarRematricula(${aluno.id}, 'TRANSFERENCIA')">🚚 Transferir de Escola</button>
                <button class="btn" style="background:red" onclick="MatriculaView.adicionarOcorrencia(${aluno.id})">⚠️ Nova Ocorrência</button>
            </div>
        `;
    },

/**
 * Processa a rematrícula ou transferência do aluno.
 * @param {Number} alunoId - O ID do aluno.
 * @param {String} tipo - O tipo de ação (MESMA_ESCOLA ou TRANSFERENCIA).
 */
    processarRematricula: function (alunoId, tipo) {
        // Aqui viria a lógica: fechar matrícula anterior se necessário e abrir nova
        alert(`Lógica de ${tipo} iniciada. O sistema criará um novo registro em 'matriculas' com ano ${DB.data.config.anoLetivoAtual}.`);
    },

/**
 * Adiciona uma ocorrência ao aluno.
 * @param {Number} alunoId - O ID do aluno.
 * @returns {undefined}
 */
    adicionarOcorrencia: function (alunoId) {
        const desc = prompt("Descreva a ocorrência (Ex: Suspensão 3 dias por briga):");
        if (desc) {
            DB.data.ocorrencias.push({
                id: Date.now(),
                alunoId: alunoId,
                data: new Date().toISOString(),
                tipo: 'ocorrencia',
                descricao: desc,
                autor: 'Gestão'
            });
            DB.save();
            alert("Salvo!");
            this.renderDetalhesAluno(alunoId); // Recarrega
        }
    }
};

export default MatriculaView;