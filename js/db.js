/**
 * JS/DB.JS - VERSÃO 3.1 (ENTERPRISE EDITION)
 * Suporte a histórico oficial, filiação completa, ocorrências e calendário.
 */
const DB_KEY = 'sge_v3.1_enterprise_final'; // Nova chave para forçar reset e seed

const DB = {
    data: {
        config: {
            anoLetivoAtual: 2026
        },
        usuarios: [],     // Atores do sistema
        escolas: [],      // Unidades
        calendario: [],   // Feriados, dias letivos, eventos (Novo)
        turmas: [],       // Classes
        disciplinas: [],  // Matérias (Matemática, Hist...) (Novo)

        // O Core do Aluno
        alunos: [],       // Dados Pessoais (Imutáveis)
        matriculas: [],   // Vínculo Aluno <-> Escola <-> Ano (Histórico de Vínculo)
        historico: [],    // NOTAS FINAIS DE ANOS ANTERIORES (IMUTÁVEIS)
        ocorrencias: [],  // Disciplinar (Novo)

        // Pedagógico (Ano Vigente)
        planejamentos: [], // Planos de aula dos professores (Novo)
        avaliacoes: [],    // Notas do ANO ATUAL
        frequencia: [],    // Presença do ANO ATUAL
        configAvaliacoes: [] // Regras de nota
    },

    /**
     * Inicializa o banco de dados.
     */
    init: function () {
        const saved = localStorage.getItem(DB_KEY);
        if (saved) {
            this.data = JSON.parse(saved);
        } else {
            this.seed();
        }
    },

    /**
     * Salva os dados do banco em localStorage.
     */
    save: function () {
        localStorage.setItem(DB_KEY, JSON.stringify(this.data));
    },

    /**
     * Semeia o banco com dados complexos.
     */
    seed: function () {
        console.log("[DB] Semeando dados Enterprise...");

        // 1. USUÁRIOS
        this.data.usuarios = [
            { id: 1, nome: "Admin Secretaria", login: "sec", senha: "123", role: "secretaria_geral" },
            { id: 2, nome: "Coord. Geral", login: "coord", senha: "123", role: "coordenacao" },
            { id: 3, nome: "Dir. Roberto", login: "dir", senha: "123", role: "gestao", escolaId: 1 },
            { id: 4, nome: "Prof. Joaquim", login: "prof", senha: "123", role: "professor" },
            // NOVO: Aluno Logável
            { id: 5, nome: "Joãozinho (Aluno)", login: "aluno", senha: "123", role: "aluno", alunoId: 1 }
        ];

        // 2. DISCIPLINAS (Base Curricular)
        this.data.disciplinas = [
            { id: 'mat', nome: 'Matemática', area: 'Exatas' },
            { id: 'port', nome: 'Português', area: 'Linguagens' },
            { id: 'hist', nome: 'História', area: 'Humanas' },
            { id: 'cie', nome: 'Ciências', area: 'Natureza' },
            { id: 'geo', nome: 'Geografia', area: 'Humanas' },
            { id: 'art', nome: 'Artes', area: 'Linguagens' },
            { id: 'ef', nome: 'Educação Física', area: 'Linguagens' }
        ];

        // 3. CALENDÁRIO
        this.data.calendario = [
            { data: '2026-02-09', tipo: 'inicio_aulas', descricao: 'Início do Ano Letivo', escolaId: null },
            { data: '2026-04-21', tipo: 'feriado', descricao: 'Tiradentes', escolaId: null }
        ];

        // 4. ALUNOS (Perfil Pessoal - Dados que não mudam com o ano)
        this.data.alunos = [
            {
                id: 1,
                nome: "Joãozinho da Silva",
                dataNascimento: "2012-05-15",
                naturalidade: "Brasília-DF",
                endereco: "Rua das Flores, 123, Asa Norte",
                filiacao: {
                    pai: "José da Silva",
                    mae: "Maria da Silva",
                    responsavelLegal: "Maria da Silva"
                },
                documento: "123.456.789-00",
                rg: "3.333.333-SSP/DF"
            }
        ];

        // 5. MATRÍCULAS (Onde ele estudou)
        this.data.matriculas = [
            // 2024 - 6º Ano (Fundamental II)
            { id: 9, alunoId: 1, escolaId: 2, ano: 2024, turmaId: 98, status: 'APROVADO', etapa: 'Fundamental II', serie: '6º Ano' },
            // 2025 - 7º Ano (Fundamental II)
            { id: 10, alunoId: 1, escolaId: 2, ano: 2025, turmaId: 99, status: 'APROVADO', etapa: 'Fundamental II', serie: '7º Ano' },
            // 2026 - 8º Ano (Atual)
            { id: 11, alunoId: 1, escolaId: 1, ano: 2026, turmaId: 101, status: 'ATIVO', etapa: 'Fundamental II', serie: '8º Ano', dataMatricula: '2026-01-20' }
        ];

        // 6. HISTÓRICO CONSOLIDADO (Anos Fechados)
        // Dados imutáveis de anos anteriores para o Relatório Oficial
        this.data.historico = [
            {
                alunoId: 1,
                ano: 2024,
                escolaId: 2,
                serie: '6º Ano',
                diasLetivos: 200,
                frequenciaGlobal: 198,
                situacao: 'APROVADO',
                notas: [
                    { disciplinaId: 'mat', mediaFinal: "8.50", faltas: 2 },
                    { disciplinaId: 'port', mediaFinal: "9.00", faltas: 0 },
                    { disciplinaId: 'hist', mediaFinal: "8.00", faltas: 0 },
                    { disciplinaId: 'cie', mediaFinal: "7.50", faltas: 0 },
                    { disciplinaId: 'geo', mediaFinal: "8.20", faltas: 0 },
                    { disciplinaId: 'art', mediaFinal: "10.00", faltas: 0 },
                    { disciplinaId: 'ef', mediaFinal: "10.00", faltas: 0 }
                ]
            },
            {
                alunoId: 1,
                ano: 2025,
                escolaId: 2,
                serie: '7º Ano',
                diasLetivos: 200,
                frequenciaGlobal: 195,
                situacao: 'APROVADO',
                notas: [
                    { disciplinaId: 'mat', mediaFinal: "7.80", faltas: 4 },
                    { disciplinaId: 'port', mediaFinal: "8.50", faltas: 1 },
                    { disciplinaId: 'hist', mediaFinal: "9.00", faltas: 0 },
                    { disciplinaId: 'cie', mediaFinal: "8.00", faltas: 0 },
                    { disciplinaId: 'geo', mediaFinal: "8.50", faltas: 0 },
                    { disciplinaId: 'art', mediaFinal: "9.50", faltas: 0 },
                    { disciplinaId: 'ef', mediaFinal: "10.00", faltas: 0 }
                ]
            }
        ];

        // 7. AVALIAÇÕES (Ano Atual - 2026)
        // Notas parciais que vão compor o boletim do ano corrente
        this.data.avaliacoes = [
            // Matemática - Bimestre 1
            { id: 1, alunoId: 1, disciplinaId: 'mat', etapa: 1, valor: "8.00", tipo: 'P1' },
            { id: 2, alunoId: 1, disciplinaId: 'mat', etapa: 1, valor: "7.00", tipo: 'Trabalho' },
            // Português - Bimestre 1
            { id: 3, alunoId: 1, disciplinaId: 'port', etapa: 1, valor: "9.50", tipo: 'P1' }
        ];

        this.data.escolas = [
            { id: 1, nome: "Escola Modelo (Atual)", diretor: "Roberto", cidade: "Brasília-DF" },
            { id: 2, nome: "Escola Antiga (Legado)", diretor: "João", cidade: "Goiânia-GO" }
        ];

        this.data.turmas = [{ id: 101, nome: "8º A", ano: 2026, escolaId: 1 }];

        this.save();
    },

    // Método auxiliar para facilitar limpeza em testes
    reset: function() {
        localStorage.removeItem(DB_KEY);
        this.seed();
    }
};

DB.init();
export default DB;