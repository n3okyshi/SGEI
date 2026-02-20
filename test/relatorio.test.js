import RelatorioService from '../js/services/relatorio.js';
import DB from '../js/db.js';
import Utils from '../js/utils.js';

// Mock do módulo Utils para garantir retornos determinísticos nas datas
jest.mock('../js/utils.js', () => ({
    formatDate: jest.fn(date => `Formatado: ${date}`),
    escapeHtml: jest.fn(str => str)
}));

describe('RelatorioService - Geração de Histórico Escolar', () => {
    
    beforeEach(() => {
        // Mock do Banco de Dados com estado determinístico e relacionamentos consistentes
        DB.data = {
            config: { anoLetivoAtual: 2026 },
            alunos: [
                {
                    id: 1,
                    nome: "Estudante Teste",
                    dataNascimento: "2010-05-10",
                    documento: "123",
                    rg: "456",
                    endereco: "Rua A",
                    filiacao: { mae: "Mãe Teste", pai: "Pai Teste" },
                    naturalidade: "DF"
                }
            ],
            escolas: [
                { id: 10, nome: "Escola Antiga", cidade: "Goiânia-GO" },
                { id: 20, nome: "Escola Atual", cidade: "Brasília-DF" }
            ],
            disciplinas: [
                { id: 'mat', nome: 'Matemática', area: 'Exatas' },
                { id: 'port', nome: 'Português', area: 'Linguagens' }
            ],
            historico: [
                {
                    alunoId: 1, ano: 2025, escolaId: 10, serie: '8º Ano', situacao: 'APROVADO',
                    diasLetivos: 200, frequenciaGlobal: 190,
                    notas: [
                        { disciplinaId: 'mat', mediaFinal: "8.50", faltas: 2 },
                        { disciplinaId: 'port', mediaFinal: "9.00", faltas: 0 }
                    ]
                }
            ],
            matriculas: [
                { alunoId: 1, ano: 2026, escolaId: 20, turmaId: 101, serie: '9º Ano', status: 'ATIVO' }
            ],
            turmas: [
                { id: 101, nome: "9º A", ano: 2026, escolaId: 20 }
            ],
            avaliacoes: [
                { id: 1, alunoId: 1, disciplinaId: 'mat', valor: "8.00" },
                { id: 2, alunoId: 1, disciplinaId: 'mat', valor: "7.00" } // Média parcial deve ser 7.50
            ]
        };
        
        // Espiona o console.error para suprimir a saída no terminal durante testes de erro
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('Deve retornar null e logar erro se o aluno não existir (Error Condition)', () => {
        const resultado = RelatorioService.gerarHistoricoEscolar(999);
        
        expect(resultado).toBeNull();
        expect(console.error).toHaveBeenCalledWith("Aluno não encontrado para ID:", 999);
    });

    test('Deve compilar corretamente o cabeçalho com dados imutáveis (Happy Path)', () => {
        const resultado = RelatorioService.gerarHistoricoEscolar(1);
        
        expect(resultado).not.toBeNull();
        expect(resultado.cabecalho.nome).toBe("Estudante Teste");
        expect(resultado.cabecalho.documento).toBe("123");
        expect(resultado.cabecalho.filiacao.mae).toBe("Mãe Teste");
        // Verifica se usou o utilitário de formatação de data mockado
        expect(Utils.formatDate).toHaveBeenCalledWith("2010-05-10");
    });

    test('Deve agregar e mapear os dados do histórico passado (Happy Path)', () => {
        const resultado = RelatorioService.gerarHistoricoEscolar(1);
        const anoPassado = resultado.vidaAcademica.find(v => v.ano === 2025);
        
        expect(anoPassado).toBeDefined();
        expect(anoPassado.escolaNome).toBe("Escola Antiga");
        expect(anoPassado.situacaoFinal).toBe("APROVADO");
        
        // Valida mapeamento de disciplinas no passado
        const mat = anoPassado.componentesCurriculares.find(c => c.disciplina === 'Matemática');
        expect(mat.mediaFinal).toBe("8.50");
        expect(mat.resultado).toBe("Aprovado"); // Regra do >= 5.0 embutida no código
    });

    test('Deve calcular as notas parciais do ano vigente dinamicamente (Happy Path)', () => {
        const resultado = RelatorioService.gerarHistoricoEscolar(1);
        const anoAtual = resultado.vidaAcademica.find(v => v.ano === 2026);
        
        expect(anoAtual).toBeDefined();
        expect(anoAtual.situacaoFinal).toBe("EM CURSO");
        expect(anoAtual.escolaNome).toBe("Escola Atual");
        
        // Valida o cálculo automático parcial das avaliações do BD dinâmico
        const matAtual = anoAtual.componentesCurriculares.find(c => c.disciplina === 'Matemática');
        expect(matAtual.mediaFinal).toBe("7.50"); // (8.0 + 7.0) / 2
        
        // Português no ano atual não tem notas lançadas no Mock
        const portAtual = anoAtual.componentesCurriculares.find(c => c.disciplina === 'Português');
        expect(portAtual.mediaFinal).toBe("---");
        expect(portAtual.resultado).toBe("Em Curso");
    });

    test('Deve ordenar a vida acadêmica cronologicamente (Edge Case)', () => {
        // Inverte a ordem no mock para garantir que o algoritmo de sort() está funcionando
        DB.data.historico.push({ alunoId: 1, ano: 2024, escolaId: 10, serie: '7º Ano', notas: [] });
        
        const resultado = RelatorioService.gerarHistoricoEscolar(1);
        
        expect(resultado.vidaAcademica[0].ano).toBe(2024);
        expect(resultado.vidaAcademica[1].ano).toBe(2025);
        expect(resultado.vidaAcademica[2].ano).toBe(2026);
    });
});