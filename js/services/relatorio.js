import DB from '../db.js';
import Utils from '../utils.js';

const RelatorioService = {

    /**
     * GERA O OBJETO DE DADOS ESTRUTURADOS PARA O HISTÓRICO ESCOLAR.
     * Cruza: Aluno + Matrículas (Histórico) + Avaliações + Disciplinas + Escolas + Histórico Imutável.
     * Objetivo: Garantir integridade dos dados de ponta a ponta.
     */
    gerarHistoricoEscolar: function (alunoId) {
        const aluno = DB.data.alunos.find(a => a.id == alunoId);
        if (!aluno) {
            console.error("Aluno não encontrado para ID:", alunoId);
            return null;
        }

        // 1. DADOS CADASTRAIS (IMUTÁVEIS)
        const historico = {
            cabecalho: {
                nome: aluno.nome,
                nascimento: Utils.formatDate(aluno.dataNascimento),
                documento: aluno.documento || "Não informado",
                rg: aluno.rg || "Não informado",
                endereco: aluno.endereco || "Não informado",
                filiacao: aluno.filiacao,
                naturalidade: aluno.naturalidade || "Brasília-DF"
            },
            vidaAcademica: []
        };

        // 2. RECUPERAR HISTÓRICO PASSADO (IMUTÁVEL - ANOS FECHADOS)
        const historicoPassado = DB.data.historico ? DB.data.historico.filter(h => h.alunoId == alunoId) : [];

        historicoPassado.forEach(registro => {
            const escola = DB.data.escolas.find(e => e.id == registro.escolaId);

            const dadosAno = {
                ano: registro.ano,
                escolaNome: escola ? escola.nome : "Escola Legada/Externa",
                cidade: escola ? escola.cidade : "Brasília-DF",
                serie: registro.serie,
                situacaoFinal: registro.situacao || "APROVADO",
                diasLetivos: registro.diasLetivos || 200,
                frequencia: registro.frequenciaGlobal || 0,
                componentesCurriculares: []
            };

            // Mapeia as notas salvas no histórico imutável
            if (registro.notas && Array.isArray(registro.notas)) {
                registro.notas.forEach(nota => {
                    const disciplina = DB.data.disciplinas.find(d => d.id === nota.disciplinaId);
                    if (disciplina) {
                        dadosAno.componentesCurriculares.push({
                            disciplina: disciplina.nome,
                            area: disciplina.area || 'Diversificada',
                            mediaFinal: nota.mediaFinal, // Já deve vir formatado "XX.XX" do DB
                            totalFaltas: nota.faltas,
                            resultado: parseFloat(nota.mediaFinal) >= 5.0 ? "Aprovado" : "Reprovado"
                        });
                    }
                });
            }

            historico.vidaAcademica.push(dadosAno);
        });

        // 3. RECUPERAR ANO VIGENTE (DADOS DINÂMICOS - 2026)
        // Busca matrícula ativa
        const matriculaAtual = DB.data.matriculas.find(m => m.alunoId == alunoId && m.ano == DB.data.config.anoLetivoAtual);

        if (matriculaAtual) {
            const escolaAtual = DB.data.escolas.find(e => e.id == matriculaAtual.escolaId);
            const turmaAtual = DB.data.turmas.find(t => t.id == matriculaAtual.turmaId);

            const dadosAnoAtual = {
                ano: matriculaAtual.ano,
                escolaNome: escolaAtual ? escolaAtual.nome : "Escola Atual",
                cidade: escolaAtual ? escolaAtual.cidade : "Brasília-DF",
                serie: matriculaAtual.serie || "Série Atual",
                situacaoFinal: "EM CURSO",
                diasLetivos: 200, // Previsão
                frequencia: "---",
                componentesCurriculares: []
            };

            // Calcular notas parciais baseadas nas avaliações lançadas
            DB.data.disciplinas.forEach(disciplina => {
                const desempenho = this._calcularDesempenhoAtual(alunoId, disciplina.id);

                // Só exibe se tiver nota lançada ou se for disciplina obrigatória
                dadosAnoAtual.componentesCurriculares.push({
                    disciplina: disciplina.nome,
                    area: disciplina.area || 'Diversificada',
                    mediaFinal: desempenho.media,
                    totalFaltas: desempenho.faltas,
                    resultado: desempenho.media !== "---" ? (parseFloat(desempenho.media) >= 5.0 ? "Parcial: Aprov." : "Parcial: Reprov.") : "Em Curso"
                });
            });

            historico.vidaAcademica.push(dadosAnoAtual);
        }

        // Ordenação Cronológica Final
        historico.vidaAcademica.sort((a, b) => a.ano - b.ano);

        return historico;
    },

    /**
     * HELPER: Calcula a nota parcial do ano vigente.
     */
    _calcularDesempenhoAtual: function (alunoId, disciplinaId) {
        const avaliacoes = DB.data.avaliacoes.filter(av =>
            av.alunoId == alunoId &&
            av.disciplinaId == disciplinaId
        );

        if (!avaliacoes || avaliacoes.length === 0) {
            return { media: "---", faltas: 0 };
        }

        let soma = 0;
        let contador = 0;

        avaliacoes.forEach(av => {
            soma += parseFloat(av.valor);
            contador++;
        });

        const media = (soma / contador); // Média aritmética simples por enquanto (TODO: Implementar pesos)

        return {
            media: media.toFixed(2),
            faltas: 0 // TODO: Implementar lógica de faltas futura
        };
    },

    /**
     * RENDERIZA O DOCUMENTO OFICIAL PARA IMPRESSÃO.
     */
    renderizarHTML: function (container, alunoId) {
        const dados = this.gerarHistoricoEscolar(alunoId);

        if (!dados) {
            container.innerHTML = `<div class="alert alert-error">Erro ao gerar histórico. Aluno não encontrado.</div>`;
            return;
        }

        // Helper para sanitizar strings (XSS Prevention)
        const safe = (str) => Utils.escapeHtml(String(str || ""));

        // Estilos Inline para garantir impressão perfeita (A4)
        const css = `
            .doc-container { font-family: 'Times New Roman', serif; max-width: 210mm; margin: 0 auto; padding: 20px; background: white; color: black; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .header h1 { font-size: 18px; margin: 0; text-transform: uppercase; }
            .header h2 { font-size: 14px; margin: 5px 0; font-weight: normal; }
            .section-title { background: #eee; border: 1px solid #000; padding: 5px; font-weight: bold; margin-top: 20px; font-size: 12px; }
            .info-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 10px; }
            .info-table td { border: 1px solid #000; padding: 4px; }
            .grades-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 15px; }
            .grades-table th, .grades-table td { border: 1px solid #000; padding: 4px; text-align: center; }
            .grades-table th { background: #f9f9f9; }
            .grades-table td.left { text-align: left; }
            .signatures { margin-top: 50px; display: flex; justify-content: space-around; text-align: center; font-size: 11px; }
            .timestamp { font-size: 9px; text-align: right; margin-top: 10px; border-top: 1px solid #ccc; padding-top: 2px; }

            @media print {
                .no-print { display: none !important; }
                body { background: #fff; margin: 0; }
                .doc-container { width: 100%; max-width: none; padding: 0; }
            }
        `;

        let html = `
            <style>${css}</style>
            <div class="doc-container">

                <!-- Botoes de Ação -->
                <div class="no-print" style="margin-bottom: 20px; text-align: right;">
                    <button onclick="window.print()" style="padding: 8px 15px; cursor: pointer;">🖨️ Imprimir</button>
                    <button onclick="window.App.navegar('dashboard')" style="padding: 8px 15px; cursor: pointer;">Voltar</button>
                </div>

                <!-- Cabeçalho Oficial -->
                <div class="header">
                    <div style="font-size: 40px; line-height: 1;">🏛️</div>
                    <h1>Secretaria de Estado de Educação</h1>
                    <h2>Histórico Escolar Oficial</h2>
                </div>

                <!-- Identificação do Aluno -->
                <div class="section-title">DADOS DE IDENTIFICAÇÃO</div>
                <table class="info-table">
                    <tr>
                        <td width="60%"><strong>Nome:</strong> ${safe(dados.cabecalho.nome)}</td>
                        <td><strong>Nascimento:</strong> ${safe(dados.cabecalho.nascimento)}</td>
                    </tr>
                    <tr>
                        <td><strong>Filiação:</strong><br>${safe(dados.cabecalho.filiacao.mae)}<br>${safe(dados.cabecalho.filiacao.pai)}</td>
                        <td>
                            <strong>RG:</strong> ${safe(dados.cabecalho.rg)}<br>
                            <strong>CPF:</strong> ${safe(dados.cabecalho.documento)}
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2"><strong>Naturalidade:</strong> ${safe(dados.cabecalho.naturalidade)}</td>
                    </tr>
                </table>

                <!-- Loop de Anos Letivos -->
        `;

        dados.vidaAcademica.forEach(anoItem => {
            html += `
                <div class="section-title">
                    ANO LETIVO: ${safe(anoItem.ano)} - ${safe(anoItem.serie.toUpperCase())}
                    <span style="float:right; font-weight:normal;">${safe(anoItem.escolaNome)} (${safe(anoItem.cidade)})</span>
                </div>

                <table class="grades-table">
                    <thead>
                        <tr>
                            <th width="40%">Componente Curricular</th>
                            <th width="15%">Área de Conhecimento</th>
                            <th width="15%">Média Final</th>
                            <th width="15%">Faltas</th>
                            <th width="15%">Resultado</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            if (anoItem.componentesCurriculares.length === 0) {
                html += `<tr><td colspan="5">Nenhum registro de notas encontrado para este período.</td></tr>`;
            } else {
                anoItem.componentesCurriculares.forEach(comp => {
                    html += `
                        <tr>
                            <td class="left">${safe(comp.disciplina)}</td>
                            <td>${safe(comp.area)}</td>
                            <td><strong>${safe(comp.mediaFinal)}</strong></td>
                            <td>${safe(comp.totalFaltas)}</td>
                            <td>${safe(comp.resultado)}</td>
                        </tr>
                    `;
                });
            }

            html += `
                    </tbody>
                </table>
                <div style="font-size: 11px; margin-bottom: 10px;">
                    <strong>Situação Final:</strong> ${safe(anoItem.situacaoFinal)} |
                    <strong>Dias Letivos:</strong> ${safe(anoItem.diasLetivos)} |
                    <strong>Freq. Global:</strong> ${safe(anoItem.frequencia)} dias
                </div>
            `;
        });

        // Rodapé
        html += `
                <div class="signatures">
                    <div style="width: 40%;">
                        __________________________________<br>
                        <strong>Secretário(a) Escolar</strong><br>
                        Registro nº: _________
                    </div>
                    <div style="width: 40%;">
                        __________________________________<br>
                        <strong>Diretor(a)</strong><br>
                        Decreto de Nomeação
                    </div>
                </div>

                <div class="timestamp">
                    Documento gerado eletronicamente em ${new Date().toLocaleDateString()} às ${new Date().toLocaleTimeString()}.<br>
                    Válido em todo território nacional sem emendas ou rasuras.
                </div>
            </div>
        `;

        container.innerHTML = html;
    }
};

export default RelatorioService;