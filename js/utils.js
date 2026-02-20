
class SafeHTML {
    constructor(htmlText) {
        this.htmlText = htmlText;
    }
    toString() {
        return this.htmlText;
    }
}

const Utils = {
    escapeHtml: function (unsafe) {
        if (unsafe === null || unsafe === undefined) return '';
        return String(unsafe)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    html: function (strings, ...values) {
        let result = strings[0];
        for (let i = 0; i < values.length; i++) {
            let val = values[i];
            if (val === null || val === undefined) {
                val = '';
            }
            else if (val instanceof SafeHTML) {
                val = val.htmlText;
            }
            else if (Array.isArray(val)) {
                val = val.map(v => v instanceof SafeHTML ? v.htmlText : Utils.escapeHtml(String(v))).join('');
            }
            else {
                val = Utils.escapeHtml(String(val));
            }
            result += val + strings[i + 1];
        }
        return new SafeHTML(result);
    },

    raw: function (string) {
        return new SafeHTML(string);
    },

    formatDate: function (dateString) {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString('pt-BR');
    }
};

export default Utils;