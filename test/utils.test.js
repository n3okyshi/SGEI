import Utils from '../js/utils.js';

describe('Utils Module', () => {

    describe('escapeHtml (Sanitização XSS)', () => {
        // --- Happy Paths ---
        test('Deve retornar a mesma string se não houver caracteres especiais', () => {
            expect(Utils.escapeHtml('Texto perfeitamente normal e seguro')).toBe('Texto perfeitamente normal e seguro');
        });

        test('Deve escapar a tag HTML < e >', () => {
            expect(Utils.escapeHtml('<b>Negrito</b>')).toBe('&lt;b&gt;Negrito&lt;/b&gt;');
        });

        test('Deve escapar aspas duplas (") e simples (\')', () => {
            expect(Utils.escapeHtml('"Aspas" e \'Simples\'')).toBe('&quot;Aspas&quot; e &#039;Simples&#039;');
        });

        test('Deve escapar o E-comercial (&)', () => {
            expect(Utils.escapeHtml('João & Maria')).toBe('João &amp; Maria');
        });

        test('Deve escapar uma string complexa com múltiplos caracteres maliciosos', () => {
            const payloadXSS = `<script>alert("XSS & 'ataque'")</script>`;
            const resultadoEsperado = `&lt;script&gt;alert(&quot;XSS &amp; &#039;ataque&#039;&quot;)&lt;/script&gt;`;
            expect(Utils.escapeHtml(payloadXSS)).toBe(resultadoEsperado);
        });

        // --- Edge Cases & Tratamento de Tipos ---
        test('Deve retornar o próprio valor original se a entrada for "falsy" (null, undefined, string vazia)', () => {
            expect(Utils.escapeHtml(null)).toBeNull();
            expect(Utils.escapeHtml(undefined)).toBeUndefined();
            expect(Utils.escapeHtml('')).toBe('');
        });

        test('Deve retornar o próprio valor se a entrada não for do tipo "string" (Números, Booleanos, Objetos)', () => {
            expect(Utils.escapeHtml(123.45)).toBe(123.45);
            expect(Utils.escapeHtml(true)).toBe(true);
            const obj = { id: 1 };
            expect(Utils.escapeHtml(obj)).toBe(obj);
        });
    });

    describe('formatDate (Formatação de Datas)', () => {
        // --- Happy Paths ---
        test('Deve formatar uma data ISO válida para o padrão pt-BR (DD/MM/YYYY)', () => {
            const dataIso = '2026-05-15T12:00:00';
            expect(Utils.formatDate(dataIso)).toBe('15/05/2026');
        });

        test('Deve formatar uma data no padrão americano (YYYY/MM/DD) para o padrão pt-BR', () => {
            const dataAmericana = '2026/12/25';
            expect(Utils.formatDate(dataAmericana)).toBe('25/12/2026');
        });

        // --- Edge Cases & Falsy Values ---
        test('Deve retornar uma string vazia se o input for "falsy" (null, undefined, string vazia)', () => {
            expect(Utils.formatDate(null)).toBe('');
            expect(Utils.formatDate(undefined)).toBe('');
            expect(Utils.formatDate('')).toBe('');
        });

        test('Deve lidar graciosamente com strings que não são datas (Error Condition)', () => {
            expect(Utils.formatDate('texto-invalido')).toBe('Invalid Date');
        });
    });

});