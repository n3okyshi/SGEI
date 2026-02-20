const DB_KEY = 'sgei_valpha';
const DB = {
    data: {
        config: {
            anoLetivoAtual: 2026
        },
        usuarios: [],
        escolas: [],
        calendario: [],
        turmas: [],
        disciplinas: [],
        alunos: [],
        matriculas: [],
        historico: [],
        ocorrencias: [],
        planejamentos: [],
        avaliacoes: [],
        frequencia: [],
        configAvaliacoes: []
    },
    init: function () {
        const saved = localStorage.getItem(DB_KEY);
        if (saved) {
            this.data = JSON.parse(saved);
        } else {
            this.seed();
        }
    },
    save: function () {
        localStorage.setItem(DB_KEY, JSON.stringify(this.data));
    },
    seed: function () {
        console.log("[DB] Semeando dados...");
        this.data.usuarios = [
            { id: 1, nome: "Admin Secretaria", login: "sec", senha: "123", role: "secretaria_geral" },
            { id: 2, nome: "Coord. Geral", login: "coord", senha: "123", role: "coordenacao" },
            { id: 3, nome: "Dir. Roberto", login: "dir", senha: "123", role: "gestao", escolaId: 1 },
            { id: 4, nome: "Prof. Joaquim", login: "prof", senha: "123", role: "professor" },
            { id: 5, nome: "Joãozinho (Aluno)", login: "aluno", senha: "123", role: "aluno", alunoId: 1 }
        ];
        this.data.disciplinas = [
            { id: 'mat', nome: 'Matemática', area: 'Exatas' },
            { id: 'port', nome: 'Português', area: 'Linguagens' },
            { id: 'hist', nome: 'História', area: 'Humanas' },
            { id: 'cie', nome: 'Ciências', area: 'Natureza' },
            { id: 'geo', nome: 'Geografia', area: 'Humanas' },
            { id: 'art', nome: 'Artes', area: 'Linguagens' },
            { id: 'ef', nome: 'Educação Física', area: 'Linguagens' }
        ];
        this.data.calendario = [
            { data: '2026-01-16', tipo: 'inicio_aulas', descricao: 'Início do Ano Letivo', escolaId: null },
            { data: '2026-04-21', tipo: 'feriado', descricao: 'Tiradentes', escolaId: null },
            { data: '2026-06-20', tipo: 'evento', descricao: 'Festa Junina', escolaId: 1 }
        ];
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
        this.data.matriculas = [
            { id: 9, alunoId: 1, escolaId: 2, ano: 2024, turmaId: 98, status: 'APROVADO', etapa: 'Fundamental II', serie: '6º Ano' },
            { id: 10, alunoId: 1, escolaId: 2, ano: 2025, turmaId: 99, status: 'APROVADO', etapa: 'Fundamental II', serie: '7º Ano' },
            { id: 11, alunoId: 1, escolaId: 1, ano: 2026, turmaId: 101, status: 'ATIVO', etapa: 'Fundamental II', serie: '8º Ano', dataMatricula: '2026-01-20' }
        ];
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
        this.data.avaliacoes = [
            { id: 1, alunoId: 1, disciplinaId: 'mat', etapa: 1, valor: "8.00", tipo: 'P1' },
            { id: 2, alunoId: 1, disciplinaId: 'mat', etapa: 1, valor: "7.00", tipo: 'Trabalho' },
            { id: 3, alunoId: 1, disciplinaId: 'port', etapa: 1, valor: "9.50", tipo: 'P1' }
        ];
        this.data.escolas = [
            { id: 1, nome: "Escola Modelo (Atual)", diretor: "Roberto", cidade: "Brasília-DF" },
            { id: 2, nome: "Escola Antiga (Legado)", diretor: "João", cidade: "Goiânia-GO" }
        ];
        this.data.turmas = [{ id: 101, nome: "8º A", ano: 2026, escolaId: 1 }];
        this.save();
    },
    getMatriculaAtiva: function (alunoId, ano) {
        return this.data.matriculas.find(m => m.alunoId == alunoId && m.ano == ano && m.status === 'ATIVO');
    },
    reset: function () {
        localStorage.removeItem(DB_KEY);
        this.seed();
    }
};
DB.init();
export default DB;