document.addEventListener('DOMContentLoaded', () => {
    const PARSE_APPLICATION_ID = 'vwERUrKW0buteCUne3RHmp74WJs0AO31HmSCvkUr';
    const PARSE_JAVASCRIPT_KEY = 'uDLwcLXl6oVAb4z5aXJx8xKMqX1h7MoiK8CfNY1l';
    const PARSE_HOST_URL = 'https://parseapi.back4app.com/';

    Parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY);
    Parse.serverURL = PARSE_HOST_URL;

    const appRoot = document.getElementById('app-root');
    const authLinks = document.getElementById('auth-links');
    const userProfileMenu = document.getElementById('user-profile-menu');
    const dropdownUsername = document.getElementById('dropdown-username');
    const logoutButton = document.getElementById('logout-button');
    const profileMenuButton = document.getElementById('profile-menu-button');
    const profileMenuDropdown = document.getElementById('profile-menu-dropdown');

    profileMenuButton.addEventListener('click', (event) => {
        event.stopPropagation();
        const isHidden = profileMenuDropdown.style.display === 'none';
        profileMenuDropdown.style.display = isHidden ? 'block' : 'none';
    });

    window.addEventListener('click', () => {
        if (profileMenuDropdown.style.display === 'block') {
            profileMenuDropdown.style.display = 'none';
        }
    });

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
        const oldRawContent = document.getElementById('raw-content');
        if (oldRawContent) {
            oldRawContent.remove();
        }
        document.querySelector('header').style.display = 'block';
        document.querySelector('main').style.display = 'block';

        const fullHash = window.location.hash || '#/home';

        if (fullHash.endsWith('/raw/')) {
            const urlParts = fullHash.replace('/raw/', '').split('?=');
            const fileId = urlParts[1];
            renderRawFile(fileId);
            return;
        }

        const [path, query] = fullHash.split('?=');
        const routeHandler = routes[path] || routes['#/home'];
        appRoot.innerHTML = '';
        routeHandler(query);
        updateNav();
    }

    function updateNav() {
        const currentUser = Parse.User.current();
        if (currentUser) {
            authLinks.style.display = 'none';
            userProfileMenu.style.display = 'block';
            dropdownUsername.textContent = currentUser.get('username');
        } else {
            authLinks.style.display = 'flex';
            userProfileMenu.style.display = 'none';
        }
    }

    logoutButton.addEventListener('click', async (e) => {
        e.preventDefault();
        profileMenuDropdown.style.display = 'none';
        await Parse.User.logOut();
        window.location.hash = '#/login';
    });

    async function renderRawFile(fileId) {
        document.querySelector('header').style.display = 'none';
        document.querySelector('main').style.display = 'none';

        const File = Parse.Object.extend("File");
        const query = new Parse.Query(File);

        try {
            const file = await query.get(fileId);
            const codeContent = file.get('code');
            const preElement = document.createElement('pre');
            preElement.id = 'raw-content';
            preElement.textContent = codeContent;
            document.body.appendChild(preElement);
        } catch (error) {
            const errorElement = document.createElement('pre');
            errorElement.id = 'raw-content';
            errorElement.textContent = `Error: File not found or permission denied.\nID: ${fileId}`;
            document.body.appendChild(errorElement);
        }
    }

    function renderLogin() {
        if (Parse.User.current()) {
            window.location.hash = '#/home';
            return;
        }
        appRoot.innerHTML = `
            <div class="page-container" style="max-width: 340px; margin: auto;">
                <h1 class="page-title" style="text-align: center; border: none;">Login to DevHub</h1>
                <form id="login-form">
                    <div class="form-group">
                        <label for="username">Username or email</label>
                        <input type="text" id="username" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" required>
                    </div>
                    <button type="submit" class="btn-primary" style="width: 100%; padding: 8px; font-size: 16px;">Login</button>
                </form>
            </div>`;
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            try {
                await Parse.User.logIn(username, password);
                window.location.hash = '#/home';
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        });
    }

    function renderRegister() {
        if (Parse.User.current()) {
            window.location.hash = '#/home';
            return;
        }
        appRoot.innerHTML = `
            <div class="page-container" style="max-width: 340px; margin: auto;">
                <h1 class="page-title" style="text-align: center; border: none;">Create your Account</h1>
                <form id="register-form">
                    <div class="form-group">
                        <label for="username">Username</label>
                        <input type="text" id="username" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" required>
                    </div>
                    <button type="submit" class="btn-primary" style="width: 100%; padding: 8px; font-size: 16px;">Register</button>
                </form>
            </div>`;
        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                await Parse.User.logOut();
                const user = new Parse.User();
                user.set('username', document.getElementById('username').value);
                user.set('email', document.getElementById('email').value);
                user.set('password', document.getElementById('password').value);
                await user.signUp();
                window.location.hash = '#/home';
            } catch (error) {
                alert(`Error during registration: ${error.message}`);
            }
        });
    }

    async function renderHome() {
        if (!Parse.User.current()) {
            window.location.hash = '#/login';
            return;
        }
        appRoot.innerHTML = `
            <div>
                <h1 class="page-title">Arquivos Recentes</h1>
                <div id="files-list">
                    <p>Carregando...</p>
                </div>
            </div>`;
        const File = Parse.Object.extend("File");
        const query = new Parse.Query(File);
        query.include("owner");
        query.descending("createdAt");
        try {
            const files = await query.find();
            const filesList = document.getElementById('files-list');
            if (files.length === 0) {
                filesList.innerHTML = '<p>Nenhum arquivo encontrado.</p>';
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
            document.getElementById('files-list').innerHTML = `<p>Erro ao carregar arquivos.</p>`;
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
                        <textarea id="description" rows="4" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="code">Código</label>
                        <textarea id="code" rows="10" style="font-family: monospace;"></textarea>
                    </div>
                    <button type="submit" class="button button-primary">Salvar</button>
                </form>
            </div>`;
        document.getElementById('new-file-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const File = Parse.Object.extend("File");
            const file = new File();
            const currentUser = Parse.User.current();
            const acl = new Parse.ACL(currentUser);
            acl.setPublicReadAccess(true);
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
        if (!Parse.User.current()) {
            window.location.hash = '#/login';
            return;
        }
        const query = new Parse.Query("File");
        query.include("owner");
        try {
            const file = await query.get(fileId);
            const owner = file.get('owner');
            const currentUser = Parse.User.current();
            const isOwner = currentUser && owner && currentUser.id === owner.id;
            const rawUrl = `/#/File/Id?=${file.id}/raw/`;
            appRoot.innerHTML = `
                <div class="page-container">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                        <h2 class="page-title" style="border: none; margin: 0;">${file.get('title')}</h2>
                        <div class="button-group" id="actions-container">
                            <a href="${rawUrl}" target="_blank" class="button">Raw</a>
                        </div>
                    </div>
                    <p style="color: var(--color-fg-muted); margin-top: 4px; margin-bottom: 16px;">Por: ${owner?.get('username') || 'Desconhecido'}</p>
                    <p>${file.get('description')}</p>
                    <pre style="background-color: #010409; padding: 16px; border-radius: 6px; font-family: monospace; white-space: pre-wrap; word-wrap: break-word;"><code>${file.get('code')}</code></pre>
                </div>`;
            if (isOwner) {
                const actionsContainer = document.getElementById('actions-container');
                actionsContainer.innerHTML += `
                    <a href="#/Edit/Id?=${file.id}" class="button button-primary">Editar</a>
                    <button id="delete-button" class="button button-danger">Apagar</button>`;
                document.getElementById('delete-button').addEventListener('click', async () => {
                    if (confirm('Tem certeza que deseja apagar este arquivo?')) {
                        try {
                            await file.destroy();
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
        if (!Parse.User.current()) {
            window.location.hash = '#/login';
            return;
        }
        const query = new Parse.Query("File");
        try {
            const file = await query.get(fileId);
            const currentUser = Parse.User.current();
            if (!currentUser || file.get('owner').id !== currentUser.id) {
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
                            <textarea id="description" rows="4" required>${file.get('description')}</textarea>
                        </div>
                        <div class="form-group">
                            <label for="code">Código</label>
                            <textarea id="code" rows="10" style="font-family: monospace;">${file.get('code')}</textarea>
                        </div>
                        <div class="button-group">
                            <button type="submit" class="button button-primary">Salvar</button>
                            <a href="#/File/Id?=${file.id}" class="button">Cancelar</a>
                        </div>
                    </form>`;
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
            <div class="page-container" style="max-width: 600px; margin: auto;">
                <h2 class="page-title">Configurações</h2>
                <form id="settings-form">
                    <div class="form-group">
                        <label for="username">Username</label>
                        <input type="text" id="username" value="${currentUser.get('username')}" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" value="${currentUser.get('email')}" required>
                    </div>
                    <div class="button-group">
                        <button type="submit" class="button button-primary">Salvar Alterações</button>
                    </div>
                </form>
                <div style="border-top: 1px solid var(--color-danger-fg); margin-top: 32px; padding-top: 24px;">
                    <h3 style="color: var(--color-danger-fg);">Zona de Perigo</h3>
                    <p style="color: var(--color-fg-muted); font-size: 14px;">Esta ação não pode ser desfeita.</p>
                    <button id="delete-account-button" class="button button-danger" style="margin-top: 8px;">Apagar Conta</button>
                </div>
            </div>`;
        document.getElementById('settings-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            currentUser.set('username', document.getElementById('username').value);
            currentUser.set('email', document.getElementById('email').value);
            try {
                await currentUser.save();
                alert('Perfil atualizado!');
                updateNav();
            } catch (error) {
                alert(`Erro: ${error.message}`);
            }
        });
        document.getElementById('delete-account-button').addEventListener('click', async () => {
            if (confirm('TEM CERTEZA? Todos os seus dados serão apagados permanentemente.')) {
                try {
                    await Parse.Cloud.run('deleteUser');
                    alert('Sua conta foi apagada.');
                    await Parse.User.logOut();
                    window.location.hash = '#/register';
                } catch (error) {
                    alert(`Erro ao apagar conta: ${error.message}`);
                }
            }
        });
    }

    window.addEventListener('hashchange', router);
    router();
});
