import Auth from '../auth.js';
import DB from '../db.js';
const LoginView = {
    render: function (container) {
        if (Auth.getUsuarioLogado()) {
            window.App.navegar('dashboard');
            return;
        }
        let html = `
            <div class="login-wrapper" style="display: flex; justify-content: center; align-items: center; min-height: 80vh;">
                <div class="card login-card" style="width: 100%; max-width: 400px; padding: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 25px;">
                        <div style="font-size: 48px; line-height: 1;">🏛️</div>
                        <h2 style="margin: 10px 0 5px;">SGE Integrado</h2>
                        <p style="color: #666; font-size: 14px; margin: 0;">Acesso ao Sistema de Gestão Escolar</p>
                    </div>
                    <div id="loginError" class="alert alert-error" style="display: none; margin-bottom: 15px;"></div>
                    <form id="formLogin">
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Usuário (Login)</label>
                            <input type="text" id="inputLogin" placeholder="Digite seu usuário" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
                        </div>
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Senha</label>
                            <input type="password" id="inputSenha" placeholder="Digite sua senha" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
                        </div>
                        <button type="submit" style="width: 100%; padding: 12px; background: #0056b3; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; font-weight: bold;">
                            Entrar no Sistema
                        </button>
                    </form>
                    <div style="margin-top: 30px; padding-top: 15px; border-top: 1px dashed #ccc; font-size: 12px; color: #555;">
                        <strong style="display: block; margin-bottom: 10px; text-align: center;">🛠️ Ambiente de Teste (Contas):</strong>
                        <ul style="list-style: none; padding: 0; margin: 0;">
                            ${this._gerarDicasDeLogin()}
                        </ul>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML = html;
        this._bindEvents();
    },
    _gerarDicasDeLogin: function () {
        return DB.data.usuarios.map(u =>
            `<li style="margin-bottom: 5px; background: #f4f4f4; padding: 5px; border-radius: 3px;">
                <span style="display: inline-block; width: 60px; font-weight: bold; color: #0056b3;">${u.login}</span> 
                <span style="color: #888;">(Senha: ${u.senha})</span> - ${u.nome}
            </li>`
        ).join('');
    },
    _bindEvents: function () {
        const form = document.getElementById('formLogin');
        if (form) {
            form.addEventListener('submit', (e) => this._handleLogin(e));
        }
    },
    _handleLogin: function (e) {
        e.preventDefault();
        const loginInput = document.getElementById('inputLogin').value.trim();
        const senhaInput = document.getElementById('inputSenha').value.trim();
        const errorBox = document.getElementById('loginError');
        const sucesso = Auth.login(loginInput, senhaInput);
        if (sucesso) {
            errorBox.style.display = 'none';
            window.App.navegar('dashboard');
        } else {
            errorBox.textContent = "⚠️ Usuário ou senha incorretos. Tente novamente.";
            errorBox.style.display = 'block';
            document.getElementById('inputSenha').value = '';
            document.getElementById('inputSenha').focus();
        }
    }
};
export default LoginView;