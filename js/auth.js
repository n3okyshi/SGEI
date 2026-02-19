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
     * Pega os valores dos inputs de login e senha, busca no DB e, se encontrado,
     * salva na sess o e no estado atual. Se n o encontrado, mostra uma mensagem de erro.
     * Se o App estiver dispon vel, navega para o dashboard.
     */
    login: function () {
        // Pega valores dos inputs
        const userInput = document.getElementById('loginUser').value;
        const passInput = document.getElementById('loginPass').value;

        // Busca no DB
        const usuarioEncontrado = DB.data.usuarios.find(u => u.login === userInput && u.senha === passInput);

        if (usuarioEncontrado) {
            // Salva na sessão e no estado atual
            sessionStorage.setItem('usuarioLogado', JSON.stringify(usuarioEncontrado));
            this.user = usuarioEncontrado;

            // Navega para o dashboard (função global exposta pelo App)
            if (window.App) window.App.navegar('dashboard');
        } else {
            alert("Usuário ou senha incorretos!");
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