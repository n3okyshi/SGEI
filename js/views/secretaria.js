import DB from '../db.js';
import Utils from '../utils.js';
const SecretariaView = {
    renderDashboard: function (container) {
        if (!container) {
            throw new Error('RenderDashboard: container is null');
        }
        try {
            const totalEscolas = DB.data.escolas ? DB.data.escolas.length : 0;
            const totalAlunos = DB.data.alunos ? DB.data.alunos.length : 0;
            const totalTurmas = DB.data.turmas ? DB.data.turmas.length : 0;
            const totalProfessores = DB.data.usuarios ? DB.data.usuarios.filter(u => u.role === 'professor').length : 0;
            container.innerHTML = `
                <h1>🏛️ Painel da Secretaria de Educação</h1>
                <p>Visão geral da rede de ensino.</p>
                <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 30px;">
                    <div class="card" style="flex: 1; text-align: center; border-left: 5px solid #2c3e50;">
                        <h3>Escolas</h3>
                        <div style="font-size: 2.5em; font-weight: bold;">${totalEscolas}</div>
                    </div>
                    <div class="card" style="flex: 1; text-align: center; border-left: 5px solid #8dc63f;">
                        <h3>Alunos</h3>
                        <div style="font-size: 2.5em; font-weight: bold;">${totalAlunos}</div>
                    </div>
                    <div class="card" style="flex: 1; text-align: center; border-left: 5px solid #e67e22;">
                        <h3>Turmas</h3>
                        <div style="font-size: 2.5em; font-weight: bold;">${totalTurmas}</div>
                    </div>
                    <div class="card" style="flex: 1; text-align: center; border-left: 5px solid #3498db;">
                        <h3>Docentes</h3>
                        <div style="font-size: 2.5em; font-weight: bold;">${totalProfessores}</div>
                    </div>
                </div>
                <div class="card">
                    <h3>Ações de Rede</h3>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn" onclick="SecretariaView.renderListaEscolas()">🏢 Gerenciar Escolas</button>
                        <button class="btn" onclick="alert('Funcionalidade de Relatório em desenvolvimento')">📊 Relatório de Matrículas</button>
                        <button class="btn" style="background-color: #e74c3c;" onclick="alert('Configurações do Ano Letivo')">📅 Calendário Escolar</button>
                    </div>
                </div>
                <div id="area-dinamica-sec"></div>
            `;
        } catch (error) {
            console.error('RenderDashboard: ', error);
        }
    },
    renderListaEscolas: function () {
        const area = document.getElementById('area-dinamica-sec');
        const escolas = DB.data.escolas || [];
        let html = `
            <h3>Todas as Escolas</h3>
            <table style="width:100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <thead style="background: #2c3e50; color: white;">
                    <tr>
                        <th style="padding: 12px; text-align: left;">ID</th>
                        <th style="padding: 12px; text-align: left;">Nome da Escola</th>
                        <th style="padding: 12px; text-align: center;">Ações</th>
                    </tr>
                </thead>
                <tbody>
        `;
        if (escolas.length === 0) {
            html += `<tr><td colspan="3" style="padding:20px; text-align:center;">Nenhuma escola cadastrada.</td></tr>`;
        } else {
            escolas.forEach(escola => {
                html += `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 12px;">${escola.id}</td>
                        <td style="padding: 12px;"><strong>${Utils.escapeHtml(escola.nome)}</strong></td>
                        <td style="padding: 12px; text-align: center;">
                            <button class="btn" style="padding: 5px 10px; font-size: 0.8em;" onclick="alert('Abrir painel da escola ${escola.id}')">Acessar</button>
                        </td>
                    </tr>
                `;
            });
        }
        html += `</tbody></table>`;
        area.innerHTML = html;
        area.scrollIntoView({ behavior: 'smooth' });
    }
};
window.SecretariaView = SecretariaView;
export default SecretariaView;