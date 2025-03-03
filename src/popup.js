document.addEventListener("DOMContentLoaded", () => {
    const mainView = document.getElementById('main-view');
    const addLoginView = document.getElementById('add-login-view');
    const loginDetailView = document.getElementById('login-detail-view');
  
    const loginListContainer = document.getElementById('login-list');
    const addLoginBtn = document.getElementById('add-login-btn');
    const backFromAddBtn = document.getElementById('back-from-add');
    const saveLoginBtn = document.getElementById('save-login-btn');
    const backFromDetailBtn = document.getElementById('back-from-detail');
    const fillLoginBtn = document.getElementById('fill-login-btn');
    const editLoginBtn = document.getElementById('edit-login-btn');
    const deleteLoginBtn = document.getElementById('delete-login-btn');
  
    const urlInput = document.getElementById('url');
    const usernameFieldInput = document.getElementById('usernameField');
    const passwordFieldInput = document.getElementById('passwordField');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    let currentConfig = null;  // Configuração selecionada atualmente
    let editingIndex = null;   // Índice da configuração em edição, se houver
    
    // Carrega as configurações salvas do storage
    function loadConfigs() {
      browser.storage.local.get("loginConfigs").then((result) => {
        const configs = result.loginConfigs || [];
        renderLoginList(configs);
      });
    }
    
    function addDefaultLogin() {
        const defaultConfig = {
            url: "http://127.0.0.1:3000/login",
            usernameField: "login-email",
            passwordField: "login-password",
            username: "admin@exemplo.com",
            password: "login-password"
        };

        browser.storage.local.get("loginConfigs").then((result) => {
            let configs = result.loginConfigs || [];
            const exists = configs.some(config => config.url === defaultConfig.url);

            if (!exists) {
                configs.push(defaultConfig);
                browser.storage.local.set({ loginConfigs: configs }).then(() => {
                    console.log("Configuração padrão adicionada!");
                });
            }
        });
    }

    addDefaultLogin();
  
    // Renderiza a lista de logins salvos
    function renderLoginList(configs) {
      loginListContainer.innerHTML = '';
      if (configs.length === 0) {
        loginListContainer.innerHTML = '<p>Nenhum login cadastrado.</p>';
      } else {
        configs.forEach((config, index) => {
          const card = document.createElement('div');
          card.className = 'card';
          card.innerHTML = `<strong>${config.url}</strong><br>
                            Usuário: ${config.username}`;
          card.addEventListener('click', () => {
            currentConfig = { ...config, index };
            showDetailView(currentConfig);
          });
          loginListContainer.appendChild(card);
        });
      }
    }
  
    // Exibe a tela principal
    function showMainView() {
      mainView.classList.remove('hidden');
      addLoginView.classList.add('hidden');
      loginDetailView.classList.add('hidden');
      editingIndex = null;
      loadConfigs();
    }
  
    // Exibe a tela de adicionar novo login
    function showAddLoginView() {
      mainView.classList.add('hidden');
      addLoginView.classList.remove('hidden');
      loginDetailView.classList.add('hidden');
    }
  
    // Exibe a tela de detalhes do login selecionado
    function showDetailView(config) {
      mainView.classList.add('hidden');
      addLoginView.classList.add('hidden');
      loginDetailView.classList.remove('hidden');
      const detailsContainer = document.getElementById('login-details');
      detailsContainer.innerHTML = `
        <p><strong>URL:</strong> ${config.url}</p>
        <p><strong>ID/Classe Usuário:</strong> ${config.usernameField}</p>
        <p><strong>ID/Classe Senha:</strong> ${config.passwordField}</p>
        <p><strong>Usuário:</strong> ${config.username}</p>
        <p><strong>Senha:</strong> ${'*'.repeat(config.password.length)}</p>
      `;
    }
  
    // Salva uma nova configuração de login ou atualiza uma existente
    saveLoginBtn.addEventListener('click', () => {
      const newConfig = {
        url: urlInput.value.trim(),
        usernameField: usernameFieldInput.value.trim(),
        passwordField: passwordFieldInput.value.trim(),
        username: usernameInput.value.trim(),
        password: passwordInput.value.trim()
      };
  
      browser.storage.local.get("loginConfigs").then((result) => {
        let configs = result.loginConfigs || [];
        if (editingIndex !== null) {
          // Atualiza o registro existente
          configs[editingIndex] = newConfig;
          editingIndex = null;
        } else {
          // Adiciona um novo registro
          configs.push(newConfig);
        }
        browser.storage.local.set({ loginConfigs: configs }).then(() => {
          showMainView();
        });
      });
    });
  
    // Botão para adicionar novo login
    addLoginBtn.addEventListener('click', () => {
      // Limpa os campos do formulário para novo cadastro
      urlInput.value = '';
      usernameFieldInput.value = '';
      passwordFieldInput.value = '';
      usernameInput.value = '';
      passwordInput.value = '';
      showAddLoginView();
    });
  
    // Botões de voltar
    backFromAddBtn.addEventListener('click', () => {
      showMainView();
    });
    backFromDetailBtn.addEventListener('click', () => {
      showMainView();
    });
  
    // Botão para preencher os dados na aba ativa
    fillLoginBtn.addEventListener('click', () => {
      if (!currentConfig) return;
      browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        if (tabs.length > 0) {
          browser.tabs.sendMessage(tabs[0].id, {
            action: "fillLogin",
            data: {
              usernameField: currentConfig.usernameField,
              passwordField: currentConfig.passwordField,
              username: currentConfig.username,
              password: currentConfig.password
            }
          });
        }
      });
    });
  
    // Botão para editar os dados do login selecionado
    editLoginBtn.addEventListener('click', () => {
      if (!currentConfig) return;
      editingIndex = currentConfig.index;
      // Preenche os campos do formulário com os dados atuais
      urlInput.value = currentConfig.url;
      usernameFieldInput.value = currentConfig.usernameField;
      passwordFieldInput.value = currentConfig.passwordField;
      usernameInput.value = currentConfig.username;
      passwordInput.value = currentConfig.password;
      showAddLoginView();
    });
  
    // Botão para excluir o login selecionado
    deleteLoginBtn.addEventListener('click', () => {
      if (!currentConfig) return;
      browser.storage.local.get("loginConfigs").then((result) => {
        let configs = result.loginConfigs || [];
        configs.splice(currentConfig.index, 1);
        browser.storage.local.set({ loginConfigs: configs }).then(() => {
          currentConfig = null;
          showMainView();
        });
      });
    });
  
    // Inicializa na tela principal
    showMainView();
  });
  