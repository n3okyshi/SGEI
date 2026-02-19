const Utils = {
    /**
     * Escapa os caracteres especiais HTML em uma string.
     * Substitui "&" por "&amp;", "<" por "&lt;", ">" por "&gt;",
     * '"' por "&quot;" e "'" por "&#039;".
     * @param {string} text O texto a ser escapado.
     * @returns {string} O texto com os caracteres especiais escapados.
     */
    escapeHtml: function (text) {
        if (!text) return text;
        if (typeof text !== 'string') return text;
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function (m) { return map[m]; });
    },
    /**
     * Formata uma data no formato "dd/mm/yyyy" para o formato
     * local do Brasil "dd 'de' MMMM 'de' yyyy".
     * @param {string} dateString A data a ser formatada.
     * @returns {string} A data formatada.
     */
    formatDate: function (dateString) {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString('pt-BR');
    }
};

export default Utils;