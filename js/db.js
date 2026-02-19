/**
 * JS/DB.JS - VERSÃO 3.0 (ROBUSTA)
 * Suporte a histórico, filiação completa, ocorrências e calendário.
 */
const DB_KEY = 'sge_v3_enterprise'; // Nova chave para resetar estrutura antiga

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
        matriculas: [],   // Vínculo Aluno <-> Escola <-> Ano (Histórico)
        ocorrencias: [],  // Disciplinar (Novo)

        // Pedagógico
        planejamentos: [], // Planos de aula dos professores (Novo)
        avaliacoes: [],    // Notas
        frequencia: [],    // Presença
        configAvaliacoes: [] // Regras de nota
    },

    /**
     * Inicializa o banco de dados.
     * Se houver dados salvos no localStorage, carrega-os.
     * Caso contrário, popula o banco com dados iniciais.
     * @returns {undefined}
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
     * @returns {undefined}
     */
    save: function () {
        localStorage.setItem(DB_KEY, JSON.stringify(this.data));
    },

    /**
     * Semeia o banco com dados complexos.
     * Cria os dados de todos os módulos do sistema, incluindo
     * os usuários, disciplinas, calendário, alunos, matrículas,
     * ocorrências e planejamentos.
     * Chama o método save() ao final para persistir os dados.
     * @returns {undefined}
     */
    seed: function () {
        console.log("[DB] Semeando dados complexos...");

        // 1. USUÁRIOS
        this.data.usuarios = [
            { id: 1, nome: "Admin Secretaria", login: "sec", senha: "123", role: "secretaria_geral" },
            { id: 2, nome: "Coord. Geral", login: "coord", senha: "123", role: "coordenacao" }, // Coordena várias escolas ou uma
            { id: 3, nome: "Dir. Roberto", login: "dir", senha: "123", role: "gestao", escolaId: 1 },
            { id: 4, nome: "Prof. Joaquim", login: "prof", senha: "123", role: "professor" }
        ];

        // 2. DISCIPLINAS (Base Curricular)
        this.data.disciplinas = [
            { id: 'mat', nome: 'Matemática' },
            { id: 'port', nome: 'Português' },
            { id: 'hist', nome: 'História' },
            { id: 'cie', nome: 'Ciências' }
        ];

        // 3. CALENDÁRIO (Eventos globais e locais)
        this.data.calendario = [
            { data: '2026-02-09', tipo: 'inicio_aulas', descricao: 'Início do Ano Letivo', escolaId: null }, // Null = Todas
            { data: '2026-04-21', tipo: 'feriado', descricao: 'Tiradentes', escolaId: null },
            { data: '2026-06-20', tipo: 'evento', descricao: 'Festa Junina', escolaId: 1 } // Só na escola 1
        ];

        // 4. ALUNOS (Perfil Pessoal - Dados que não mudam com o ano)
        this.data.alunos = [
            {
                id: 1,
                nome: "Joãozinho da Silva",
                dataNascimento: "2012-05-15",
                endereco: "Rua das Flores, 123, Centro",
                filiacao: {
                    pai: "José da Silva",
                    mae: "Maria da Silva",
                    responsavelLegal: "Maria da Silva"
                },
                documento: "123.456.789-00"
            }
        ];

        // 5. MATRÍCULAS (Histórico escolar - Onde ele estudou e quando)
        this.data.matriculas = [
            // Histórico Antigo (Exemplo)
            {
                id: 10, alunoId: 1, escolaId: 2, ano: 2025,
                turmaId: 99, status: 'APROVADO', dataMatricula: '2025-02-01', dataSaida: '2025-12-15'
            },
            // Matrícula Atual
            {
                id: 11, alunoId: 1, escolaId: 1, ano: 2026,
                turmaId: 101, status: 'ATIVO', dataMatricula: '2026-01-20', dataSaida: null
            }
        ];

        // 6. OCORRÊNCIAS (Disciplinar)
        this.data.ocorrencias = [
            { id: 1, alunoId: 1, data: '2026-03-10', tipo: 'advertencia', descricao: 'Conversa paralela excessiva', autor: 'Prof. Joaquim' }
        ];

        // 7. PLANEJAMENTOS (Coordenação aprova)
        this.data.planejamentos = [
            {
                id: 1, professorId: 4, turmaId: 101, disciplinaId: 'mat',
                bimestre: 1, conteudo: 'Equações de 1º Grau', status: 'PENDENTE' // PENDENTE, APROVADO, REJEITADO
            }
        ];

        // Dados auxiliares para o app rodar
        this.data.escolas = [{ id: 1, nome: "Escola Modelo", diretor: "Roberto" }, { id: 2, nome: "Escola Antiga", diretor: "João" }];
        this.data.turmas = [{ id: 101, nome: "7º A", ano: 2026, escolaId: 1 }];

        this.save();
    },

    // Helper: Buscar matrícula ativa de um aluno
    getMatriculaAtiva: function (alunoId, ano) {
        return this.data.matriculas.find(m => m.alunoId == alunoId && m.ano == ano && m.status === 'ATIVO');
    }
};

DB.init();
export default DB;