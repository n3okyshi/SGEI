import RelatorioService from '../js/services/relatorio.js';
import DB from '../js/db.js';

describe('RelatorioService - _calcularDesempenhoAtual (Cálculo de Notas)', () => {

    beforeEach(() => {
        // Resetamos apenas a coleção de avaliações para isolar este teste
        DB.data = {
            avaliacoes: []
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('Deve retornar "---" para a média e 0 faltas se não houver nenhuma avaliação lançada (Edge Case)', () => {
        const resultado = RelatorioService._calcularDesempenhoAtual(1, 'mat');

        expect(resultado).toEqual({ media: "---", faltas: 0 });
    });

    test('Deve calcular a média aritmética simples corretamente para múltiplas notas (Happy Path)', () => {
        DB.data.avaliacoes = [
            { id: 1, alunoId: 1, disciplinaId: 'mat', valor: "8.00" },
            { id: 2, alunoId: 1, disciplinaId: 'mat', valor: "7.00" }
        ];

        const resultado = RelatorioService._calcularDesempenhoAtual(1, 'mat');

        expect(resultado.media).toBe("7.50");
        expect(resultado.faltas).toBe(0);
    });

    test('Deve processar apenas as notas do aluno e disciplina requisitados, ignorando os demais (Edge Case / Filtro)', () => {
        DB.data.avaliacoes = [
            { id: 1, alunoId: 1, disciplinaId: 'mat', valor: "5.00" }, // <- Nota alvo
            { id: 2, alunoId: 2, disciplinaId: 'mat', valor: "10.00" }, // Outro aluno
            { id: 3, alunoId: 1, disciplinaId: 'port', valor: "9.00" }  // Outra disciplina
        ];

        const resultado = RelatorioService._calcularDesempenhoAtual(1, 'mat');

        // Se falhar o filtro, ele somaria (5+10+9)/3 = 8.00. O correto é isolar a nota 5.00.
        expect(resultado.media).toBe("5.00");
    });

    test('Deve forçar formatação estrita de duas casas decimais em dízimas periódicas (Regra de Negócio)', () => {
        DB.data.avaliacoes = [
            { id: 1, alunoId: 3, disciplinaId: 'hist', valor: "10.00" },
            { id: 2, alunoId: 3, disciplinaId: 'hist', valor: "6.00" },
            { id: 3, alunoId: 3, disciplinaId: 'hist', valor: "6.00" }
        ];
        // Soma = 22. Média = 22 / 3 = 7.333333333...

        const resultado = RelatorioService._calcularDesempenhoAtual(3, 'hist');

        // Verifica se o toFixed(2) foi aplicado corretamente mitigando erros de float no JS
        expect(resultado.media).toBe("7.33");
    });

    test('Deve converter corretamente valores em formato de String para Float antes da soma (Tipagem)', () => {
        DB.data.avaliacoes = [
            { id: 1, alunoId: 1, disciplinaId: 'cie', valor: "8.5" },
            { id: 2, alunoId: 1, disciplinaId: 'cie', valor: "7" } // Sem decimais na string original
        ];

        const resultado = RelatorioService._calcularDesempenhoAtual(1, 'cie');

        // Se concatenasse string, seria "8.57". O correto é Float(8.5 + 7) / 2 = 7.75
        expect(resultado.media).toBe("7.75");
    });
});