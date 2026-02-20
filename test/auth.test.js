import Auth from '../js/auth.js';
import DB from '../js/db.js';

// Setup de Mocks (Simulando o ambiente do Navegador)
global.alert = jest.fn();
global.sessionStorage = {
    setItem: jest.fn(),
    clear: jest.fn(),
    getItem: jest.fn()
};
global.window = { App: { navegar: jest.fn() } };

describe('Auth Module - Login Verification', () => {
    beforeEach(() => {
        // Mock do Banco de Dados
        DB.data = {
            usuarios: [
                { id: 1, login: 'sec', senha: '123', role: 'secretaria_geral' }
            ]
        };
        Auth.user = null;
        jest.clearAllMocks();
    });

    test('Deve realizar login com credenciais válidas (Happy Path)', () => {
        const result = Auth.login('sec', '123');
        
        expect(result).toBe(true);
        expect(Auth.user).toEqual(DB.data.usuarios[0]);
        expect(sessionStorage.setItem).toHaveBeenCalledWith('usuarioLogado', JSON.stringify(DB.data.usuarios[0]));
        expect(window.App.navegar).toHaveBeenCalledWith('dashboard');
    });

    test('Deve negar login com senha incorreta (Error Condition)', () => {
        const result = Auth.login('sec', 'senhaerrada');
        
        expect(result).toBe(false);
        expect(Auth.user).toBeNull();
        expect(global.alert).toHaveBeenCalledWith("Usuário ou senha incorretos!");
        expect(window.App.navegar).not.toHaveBeenCalled();
    });

    test('Deve negar login com usuário inexistente (Edge Case)', () => {
        const result = Auth.login('fantasma', '123');
        expect(result).toBe(false);
    });
});