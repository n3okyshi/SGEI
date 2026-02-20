import DB from '../js/db.js';

// Setup de Mock para o localStorage do navegador
const localStorageMock = (function () {
    let store = {};
    return {
        getItem: jest.fn(key => store[key] || null),
        setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
        removeItem: jest.fn(key => { delete store[key]; }),
        clear: jest.fn(() => { store = {}; })
    };
})();

// Injeta o mock globalmente no ambiente de testes (Node/Jest)
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('DB Module - Database Lifecycle & Seeding Integrity', () => {

    // Antes de cada teste, limpamos o mock do localStorage e o estado do BD
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();

        // Reset manual do estado interno do DB para evitar poluição entre testes
        DB.data = {
            config: { anoLetivoAtual: 2026 },
            usuarios: [], escolas: [], calendario: [], turmas: [],
            disciplinas: [], alunos: [], matriculas: [], historico: [],
            ocorrencias: [], planejamentos: [], avaliacoes: [],
            frequencia: [], configAvaliacoes: []
        };

        // Espiona o console.log para suprimir logs poluentes durante o teste
        jest.spyOn(console, 'log').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('Deve preencher todas as coleções vitais do sistema ao chamar seed() (Happy Path)', () => {
        // Ação
        DB.seed();

        // Asserções na estrutura interna
        expect(DB.data.usuarios.length).toBeGreaterThan(0);
        expect(DB.data.escolas.length).toBeGreaterThan(0);
        expect(DB.data.disciplinas.length).toBeGreaterThan(0);
        expect(DB.data.alunos.length).toBeGreaterThan(0);
        expect(DB.data.matriculas.length).toBeGreaterThan(0);

        // Asserção de Efeito Colateral: Verifica se o método this.save() gravou no localStorage
        expect(localStorage.setItem).toHaveBeenCalledWith('sgei_valpha', JSON.stringify(DB.data));
    });

    test('Deve inicializar (init) restaurando dados do localStorage se eles já existirem (Edge Case)', () => {
        // Preparação: simulamos que já existe um banco salvo de sessões anteriores
        const fakeSavedData = { config: { anoLetivoAtual: 2026 }, usuarios: [{ nome: "Admin Mock" }] };
        localStorage.setItem('sgei_valpha', JSON.stringify(fakeSavedData));

        // Ação
        DB.init();

        // Asserções
        expect(localStorage.getItem).toHaveBeenCalledWith('sgei_valpha');
        expect(DB.data).toEqual(fakeSavedData); // O DB.data deve assumir a forma do localStorage
    });

    test('Deve inicializar (init) executando seed() automaticamente caso o localStorage esteja vazio', () => {
        // Preparação
        const seedSpy = jest.spyOn(DB, 'seed');

        // Ação (sem ter setado nada no localStorage antes)
        DB.init();

        // Asserções
        expect(localStorage.getItem).toHaveBeenCalledWith('sgei_valpha');
        expect(seedSpy).toHaveBeenCalledTimes(1);
    });

    test('Deve resetar o banco de dados (reset), limpando a chave antiga e re-semeando do zero', () => {
        const seedSpy = jest.spyOn(DB, 'seed');

        // Ação
        DB.reset();

        // Asserções
        expect(localStorage.removeItem).toHaveBeenCalledWith('sgei_valpha');
        expect(seedSpy).toHaveBeenCalledTimes(1);
    });
});