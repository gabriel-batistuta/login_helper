// Função auxiliar para corrigir o seletor se necessário
function fixSelector(selector) {
    // Se o seletor já começa com '#' ou '.', retorna como está.
    if (selector.startsWith('#') || selector.startsWith('.')) {
      return selector;
    }
    // Caso contrário, assume que é um ID e adiciona '#'
    return `#${selector}`;
  }
  
  browser.runtime.onMessage.addListener((message) => {
    if (message.action === "fillLogin" && message.data) {
      const { usernameField, passwordField, username, password } = message.data;
      
      // Corrige os seletores se necessário
      const userSelector = fixSelector(usernameField);
      const passSelector = fixSelector(passwordField);
      
      let userInput = document.querySelector(userSelector);
      let passInput = document.querySelector(passSelector);
  
      if (userInput && passInput) {
        userInput.value = username;
        passInput.value = password;
        console.log("Campos preenchidos via mensagem!");
      } else {
        console.warn("Campos de login não encontrados usando os seletores:", userSelector, passSelector);
      }
    }
  });
  