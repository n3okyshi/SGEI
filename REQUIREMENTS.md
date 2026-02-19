# Requisitos do Sistema SGE Integrado (v0.3 Alpha)

## Contexto
O SGE Integrado visa resolver a fragmentação de dados escolares, garantindo a integridade e rastreabilidade da vida acadêmica do aluno desde a matrícula até a emissão do diploma. O foco principal é a precisão dos dados (duas casas decimais) e a integração de históricos de múltiplas escolas.

## Arquitetura de Atores
*   **Estratégico**: Secretaria de Educação, Conselho.
*   **Tático**: Supervisão, Direção, Secretaria Escolar.
*   **Operacional**: Coordenação, Professores.
*   **Ponta**: Aluno, Responsáveis.

## Histórias de Usuário e Critérios de Aceite

### 1. Perfil: Secretaria de Educação (Estratégico)
**História**: "Como Secretário de Educação, eu quero visualizar um relatório consolidado de todas as unidades escolares, para que eu possa auditar quais escolas estão com pendências de lançamento de notas antes do fechamento do ano letivo."

**Critérios de Aceite**:
*   [ ] **Integridade de Processo**: O sistema deve impedir o fechamento do ano letivo se houver turmas sem notas lançadas.
*   [ ] **Unicidade de Entidade**: A criação de escolas deve validar CNPJ/Código INEP único para evitar duplicidade.
*   [ ] **Migração de Acervo**: O sistema deve permitir a transferência de "acervo" (dados de alunos) de uma escola extinta para outra ativa.

### 2. Perfil: Coordenação Pedagógica (Tático/Normativo)
**História**: "Como Coordenador, eu quero criar regras de avaliação (Ex: Prova P1) que sejam aplicadas automaticamente a todas as turmas de um nível, para garantir que o cálculo da média final seja matematicamente idêntico em toda a escola."

**Critérios de Aceite**:
*   [ ] **Imutabilidade da Regra**: Uma vez que um professor lançou uma nota vinculada a uma regra (Ex: P1), a coordenação não pode alterar o valor máximo dessa regra para um valor inferior à maior nota já lançada.
*   [ ] **Validação de Soma**: A soma dos pesos das avaliações do bimestre deve igualar exatamente 100% ou o valor total do período (Ex: 25,00 pontos).

### 3. Perfil: Professor (Operacional)
**História**: "Como Professor, eu quero lançar as notas em uma planilha que valide automaticamente os valores digitados, para que eu não cometa erros de digitação que prejudiquem o histórico do aluno."

**Critérios de Aceite**:
*   [ ] **Bloqueio de Input**: O campo deve bloquear valores superiores ao `valorMaximo` definido pela coordenação.
*   [ ] **Sanitização Decimal**: Ao sair do campo (blur), o sistema deve converter automaticamente inputs como "8,5" ou "8.5" para "8.50", garantindo precisão de duas casas decimais no banco de dados.

### 4. Perfil: Direção (Gestão Documental)
**História**: "Como Diretor, eu quero gerar um Histórico Escolar que compile dados de anos anteriores (mesmo de outras escolas), para entregar um documento válido legalmente para transferência ou universidade."

**Critérios de Aceite**:
*   [ ] **Rastreabilidade**: O documento deve indicar explicitamente o nome da escola onde cada ano foi cursado (Ex: 2024 na Escola A, 2025 na Escola B).
*   [ ] **Tratamento de Transferência**: Se o aluno entrou no meio do ano, o sistema deve exibir uma observação ou calcular a média ponderando as "Notas de Transferência" importadas.
*   [ ] **Status Final**: O sistema só pode marcar o status "CONCLUÍDO" no histórico se todas as disciplinas obrigatórias tiverem média >= média mínima de aprovação.

### 5. Perfil: Supervisão/Conselho (Tático/Auditoria)
**História**: "Como Supervisor, eu quero acessar logs de alteração de notas após o fechamento do bimestre, para garantir que não houve manipulação indevida de resultados."

**Critérios de Aceite**:
*   [ ] **Log de Auditoria**: Qualquer alteração de nota após o prazo oficial deve registrar quem alterou, quando e o motivo.

### 6. Perfil: Aluno/Responsável (Ponta)
**História**: "Como Aluno, eu quero visualizar meu boletim e progresso em tempo real, para acompanhar meu desempenho e frequência escolar."

**Critérios de Aceite**:
*   [ ] **Visualização Clara**: O boletim deve exibir as notas parciais e a média atual com precisão de duas casas decimais.
*   [ ] **Acesso ao Histórico**: O aluno deve ter a opção de solicitar ou visualizar uma prévia do seu Histórico Escolar completo.

## Regras de Negócio Inegociáveis
1.  **Regra de Ouro**: Centralização da Regra (Coordenação), Descentralização da Nota (Professor).
2.  **Precisão Numérica**: Estritamente duas casas decimais (`.toFixed(2)`).
3.  **Histórico vs Ano Letivo**: Diferenciação clara entre dados imutáveis (passado) e mutáveis (vigente).
