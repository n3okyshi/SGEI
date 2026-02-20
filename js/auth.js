/**
 * JS/AUTH.JS
 * Gerencia login e sessão.
 */
import DB from './db.js';

const Auth = {
    user: null,

    // Verifica se já tem alguém logado ao abrir a página
    init: function () {
        const savedUser = sessionStorage.getItem('usuarioLogado');
        if (savedUser) {
            this.user = JSON.parse(savedUser);
        }
    },

/**
     * Faz o login no sistema.
     * @param {string} username - O login do usuário.
     * @param {string} password - A senha do usuário.
     * @returns {boolean} - Retorna true se o login for bem-sucedido, false caso contrário.
     */
    login: function (username, password) {
        try {
            // Busca no DB
            const usuarioEncontrado = DB.data.usuarios.find(u => u.login === username && u.senha === password);

            if (usuarioEncontrado !== undefined && usuarioEncontrado !== null) {
                // Salva na sessão e no estado atual
                sessionStorage.setItem('usuarioLogado', JSON.stringify(usuarioEncontrado));
                this.user = usuarioEncontrado;

                // Navega para o dashboard (função global exposta pelo App)
                if (window.App !== undefined && window.App !== null) {
                    window.App.navegar('dashboard');
                }
                return true;
            } else {
                alert("Usuário ou senha incorretos!");
                return false;
            }
        } catch (error) {
            console.error('Erro ao logar: ', error);
            alert("Erro ao logar. Tente novamente mais tarde.");
            return false;
        }
    },

    /**
     * Faz o logout do sistema.
     * Limpa a sess o e seta o estado atual para nulo.
     * Se o App estiver dispon vel, navega para o login.
     */
    logout: function () {
        sessionStorage.clear();
        this.user = null;
        if (window.App) window.App.navegar('login');
    },

    getCurrentUser: function () {
        return this.user;
    }
};

Auth.init();

export default Auth;