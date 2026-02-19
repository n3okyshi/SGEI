/**
 * JS/VIEWS/ALUNO.JS
 */
import RelatorioService from '../services/relatorio.js';
import Utils from '../utils.js';

const AlunoView = {
    /**
     * Renderiza o boletim do aluno com dados de identificação e um botão para imprimir.
     * @param {HTMLElement} container - O elemento HTML que receberá o conteúdo.
     * @param {Object} usuario - O objeto com as informações do aluno.
     */
    renderBoletim: function (container, usuario) {
        const alunoId = Utils.escapeHtml(usuario.alunoId) || Utils.escapeHtml(usuario.id);
        const alunoNome = Utils.escapeHtml(usuario.nome);
        // Em vez de uma tabela estática, oferecemos a visão do Histórico Oficial
        container.innerHTML = `
            <div class="card">
                <h2>Portal do Aluno: ${alunoNome}</h2>
                <p>Aqui você pode visualizar seu boletim atual ou gerar seu Histórico Escolar Completo para fins de transferência ou faculdade.</p>
                <div style="display:flex; gap:10px; margin-top:20px;">
                    <button class="btn" onclick="AlunoView.gerarDocumento(${alunoId})">📄 Gerar Histórico Oficial (PDF/Print)</button>
                    <button class="btn" style="background:#2c3e50" onclick="alert('Boletim Bimestral em desenvolvimento')">📊 Ver Notas 2026</button>
                </div>
            </div>
            <div id="area-relatorio-aluno"></div>
        `;
    },

    gerarDocumento: function (alunoId) {
        const area = document.getElementById('area-relatorio-aluno');
        RelatorioService.renderizarHTML(area, alunoId);
    }
};

export default AlunoView;