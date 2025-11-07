document.addEventListener('DOMContentLoaded', () => {
    const PARSE_APPLICATION_ID = 'vwERUrKW0buteCUne3RHmp74WJs0AO31HmSCvkUr';
    const PARSE_JAVASCRIPT_KEY = 'uDLwcLXl6oVAb4z5aXJx8xKMqX1h7MoiK8CfNY1l';
    const PARSE_HOST_URL = 'https://parseapi.back4app.com/';

    Parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY);
    Parse.serverURL = PARSE_HOST_URL;

    const appRoot = document.getElementById('app-root');
    const navLinks = document.getElementById('nav-links');
    const authLinks = document.getElementById('auth-links');
    const settingsLink = document.getElementById('settings-link');
    const logoutButton = document.getElementById('logout-button');

    const routes = {
        '#/login': renderLogin,
        '#/register': renderRegister,
        '#/home': renderHome,
        '#/new': renderNewFile,
        '#/File/Id': renderFileDetails,
        '#/Edit/Id': renderEditFile,
        '#/settings': renderSettings,
    };

    function router() {
        const fullHash = window.location.hash || '#/home';
        const [path, query] = fullHash.split('?=');
        const routeHandler = routes[path] || routes['#/home'];
        routeHandler(query);
        updateNav();
    }

    function updateNav() {
        const currentUser = Parse.User.current();
        if (currentUser) {
            navLinks.style.display = 'flex';
            authLinks.style.display = 'none';
            settingsLink.href = `#/settings`;
        } else {
            navLinks.style.display = 'none';
            authLinks.style.display = 'flex';
        }
    }

    logoutButton.addEventListener('click', async (e) => {
        e.preventDefault();
        await Parse.User.logOut();
        window.location.hash = '#/login';
        router();
    });

    function renderLogin() {
        appRoot.innerHTML = `
            <div class="page-container">
                <h2 class="page-title">Login</h2>
                <form id="login-form">
                    <div class="form-group">
                        <label for="username">Usuário ou E-mail</label>
                        <input type="text" id="username" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Senha</label>
                        <input type="password" id="password" required>
                    </div>
                    <button type="submit" class="button button-primary">Login</button>
                    <p class="form-link">Não tem uma conta? <a href="#/register">Clique aqui!</a></p>
                </form>
            </div>
        `;
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            try {
                await Parse.User.logIn(username, password);
                window.location.hash = '#/home';
                router();
            } catch (error) {
                alert(`Erro: ${error.message}`);
            }
        });
    }

    function renderRegister() {
        appRoot.innerHTML = `
            <div class="page-container">
                <h2 class="page-title">Registrar</h2>
                <form id="register-form">
                    <div class="form-group">
                        <label for="username">Usuário</label>
                        <input type="text" id="username" required>
                    </div>
                    <div class="form-group">
                        <label for="email">E-mail</label>
                        <input type="email" id="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Senha</label>
                        <input type="password" id="password" required>
                    </div>
                    <button type="submit" class="button button-primary">Registrar</button>
                    <p class="form-link">Já tem uma conta? <a href="#/login">Clique aqui!</a></p>
                </form>
            </div>
        `;
        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = new Parse.User();
            user.set('username', document.getElementById('username').value);
            user.set('email', document.getElementById('email').value);
            user.set('password', document.getElementById('password').value);
            try {
                await user.signUp();
                window.location.hash = '#/home';
                router();
            } catch (error) {
                alert(`Erro: ${error.message}`);
            }
        });
    }

    async function renderHome() {
        appRoot.innerHTML = `
            <div class="page-container">
                <h1 class="page-title">Um mundo de possibilidades no desenvolvimento web e app</h1>
                <div id="files-list">Carregando arquivos...</div>
            </div>
        `;
        const File = Parse.Object.extend("File");
        const query = new Parse.Query(File);
        query.include("owner");
        query.descending("createdAt");
        try {
            const files = await query.find();
            const filesList = document.getElementById('files-list');
            if (files.length === 0) {
                filesList.innerHTML = '<p>Nenhum arquivo encontrado. Crie o primeiro!</p>';
                return;
            }
            filesList.innerHTML = files.map(file => `
                <div class="file-card" data-id="${file.id}">
                    <h3>${file.get('title')}</h3>
                    <p>Criado por: ${file.get('owner')?.get('username') || 'Desconhecido'}</p>
                </div>
            `).join('');
            document.querySelectorAll('.file-card').forEach(card => {
                card.addEventListener('click', () => {
                    window.location.hash = `#/File/Id?=${card.dataset.id}`;
                });
            });
        } catch (error) {
            document.getElementById('files-list').innerHTML = `<p>Erro ao carregar arquivos: ${error.message}</p>`;
        }
    }

    function renderNewFile() {
        if (!Parse.User.current()) {
            window.location.hash = '#/login';
            return;
        }
        appRoot.innerHTML = `
            <div class="page-container">
                <h2 class="page-title">Criar Novo Arquivo</h2>
                <form id="new-file-form">
                    <div class="form-group">
                        <label for="title">Título</label>
                        <input type="text" id="title" required>
                    </div>
                    <div class="form-group">
                        <label for="description">Descrição</label>
                        <textarea id="description" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="code">Código</label>
                        <textarea id="code"></textarea>
                    </div>
                    <button type="submit" class="button button-primary">Salvar</button>
                </form>
            </div>
        `;
        document.getElementById('new-file-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const File = Parse.Object.extend("File");
            const file = new File();
            const currentUser = Parse.User.current();
            const acl = new Parse.ACL();
            acl.setPublicReadAccess(true);
            acl.setWriteAccess(currentUser, true);

            file.set("title", document.getElementById('title').value);
            file.set("description", document.getElementById('description').value);
            file.set("code", document.getElementById('code').value);
            file.set("owner", currentUser);
            file.setACL(acl);

            try {
                const savedFile = await file.save();
                window.location.hash = `#/File/Id?=${savedFile.id}`;
            } catch (error) {
                alert(`Erro ao salvar: ${error.message}`);
            }
        });
    }

    async function renderFileDetails(fileId) {
        const query = new Parse.Query("File");
        query.include("owner");
        try {
            const file = await query.get(fileId);
            const owner = file.get('owner');
            const currentUser = Parse.User.current();
            const isOwner = currentUser && owner && currentUser.id === owner.id;

            appRoot.innerHTML = `
                <div class="page-container">
                    <h2 class="page-title">${file.get('title')}</h2>
                    <p class="file-details-owner">Por: ${owner?.get('username') || 'Desconhecido'}</p>
                    <p>${file.get('description')}</p>
                    <pre class="file-details-code"><code>${file.get('code')}</code></pre>
                    <div class="button-group" id="actions-container"></div>
                </div>
            `;

            if (isOwner) {
                const actionsContainer = document.getElementById('actions-container');
                actionsContainer.innerHTML = `
                    <a href="#/Edit/Id?=${file.id}" class="button button-primary">Editar</a>
                    <button id="delete-button" class="button button-danger">Apagar</button>
                `;
                document.getElementById('delete-button').addEventListener('click', async () => {
                    if (confirm('Tem certeza que deseja apagar este arquivo?')) {
                        try {
                            await file.destroy();
                            alert('Arquivo apagado com sucesso.');
                            window.location.hash = '#/home';
                        } catch (error) {
                            alert(`Erro ao apagar: ${error.message}`);
                        }
                    }
                });
            }
        } catch (error) {
            appRoot.innerHTML = `<div class="page-container"><p>Arquivo não encontrado.</p></div>`;
        }
    }

    async function renderEditFile(fileId) {
        const query = new Parse.Query("File");
        try {
            const file = await query.get(fileId);
            const currentUser = Parse.User.current();
            const owner = file.get('owner');

            if (!currentUser || !owner || currentUser.id !== owner.id) {
                alert('Você não tem permissão para editar este arquivo.');
                window.location.hash = `#/File/Id?=${fileId}`;
                return;
            }

            appRoot.innerHTML = `
                <div class="page-container">
                    <h2 class="page-title">Editar Arquivo</h2>
                    <form id="edit-file-form">
                        <div class="form-group">
                            <label for="title">Título</label>
                            <input type="text" id="title" value="${file.get('title')}" required>
                        </div>
                        <div class="form-group">
                            <label for="description">Descrição</label>
                            <textarea id="description" required>${file.get('description')}</textarea>
                        </div>
                        <div class="form-group">
                            <label for="code">Código</label>
                            <textarea id="code">${file.get('code')}</textarea>
                        </div>
                        <div class="button-group">
                            <button type="submit" class="button button-primary">Salvar</button>
                            <a href="#/File/Id?=${file.id}" class="button button-secondary">Cancelar</a>
                        </div>
                    </form>
                </div>
            `;

            document.getElementById('edit-file-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                file.set("title", document.getElementById('title').value);
                file.set("description", document.getElementById('description').value);
                file.set("code", document.getElementById('code').value);
                try {
                    await file.save();
                    window.location.hash = `#/File/Id?=${file.id}`;
                } catch (error) {
                    alert(`Erro ao salvar: ${error.message}`);
                }
            });
        } catch (error) {
            appRoot.innerHTML = `<div class="page-container"><p>Arquivo não encontrado.</p></div>`;
        }
    }

    function renderSettings() {
        const currentUser = Parse.User.current();
        if (!currentUser) {
            window.location.hash = '#/login';
            return;
        }

        appRoot.innerHTML = `
            <div class="page-container">
                <h2 class="page-title">Configurações de Perfil</h2>
                <form id="settings-form">
                    <div class="form-group">
                        <label for="username">Usuário</label>
                        <input type="text" id="username" value="${currentUser.get('username')}" required>
                    </div>
                    <div class="form-group">
                        <label for="email">E-mail</label>
                        <input type="email" id="email" value="${currentUser.get('email')}" required>
                    </div>
                    <div class="button-group">
                        <button type="submit" class="button button-primary">Salvar</button>
                        <a href="#/home" class="button button-secondary">Cancelar</a>
                    </div>
                </form>
                <div class="danger-zone">
                    <h3>Zona de Perigo</h3>
                    <button id="delete-account-button" class="button button-danger">Apagar Conta</button>
                </div>
            </div>
        `;

        document.getElementById('settings-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            currentUser.set('username', document.getElementById('username').value);
            currentUser.set('email', document.getElementById('email').value);
            try {
                await currentUser.save();
                alert('Perfil atualizado com sucesso!');
                updateNav();
            } catch (error) {
                alert(`Erro ao atualizar: ${error.message}`);
            }
        });

        document.getElementById('delete-account-button').addEventListener('click', async () => {
            if (confirm('TEM CERTEZA? Esta ação é irreversível e todos os seus dados serão perdidos.')) {
                try {
                    await Parse.Cloud.run('deleteUser');
                    alert('Sua conta foi apagada.');
                    window.location.hash = '#/register';
                    router();
                } catch (error) {
                    alert(`Erro ao apagar a conta: ${error.message}`);
                }
            }
        });
    }

    window.addEventListener('hashchange', router);
    router();
});
