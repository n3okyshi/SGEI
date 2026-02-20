import DB from './db.js';
const Auth = {
    user: null,
    init: function () {
        const savedUser = sessionStorage.getItem('usuarioLogado');
        if (savedUser) {
            this.user = JSON.parse(savedUser);
        }
    },
    login: function (username, password) {
        try {
            const usuarioEncontrado = DB.data.usuarios.find(u => u.login === username && u.senha === password);
            if (usuarioEncontrado !== undefined && usuarioEncontrado !== null) {
                sessionStorage.setItem('usuarioLogado', JSON.stringify(usuarioEncontrado));
                this.user = usuarioEncontrado;
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