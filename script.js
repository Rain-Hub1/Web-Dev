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
        const fullHash = window.location.hash || '#/login';
        const [path, query] = fullHash.split('?=');
        const routeHandler = routes[path] || routes['#/home'];
        appRoot.innerHTML = '';
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
    });

    function renderLogin() {
        appRoot.innerHTML = `
        <div class="relative py-3 sm:max-w-xs sm:mx-auto">
            <div class="px-8 py-6 mt-4 text-left bg-gray-800 rounded-xl shadow-lg">
                <form id="login-form">
                    <div class="flex flex-col justify-center items-center h-full select-none">
                        <div class="flex flex-col items-center justify-center gap-2 mb-8">
                            <p class="m-0 text-xl font-semibold text-white">Login to your Account</p>
                            <span class="m-0 text-xs max-w-[90%] text-center text-gray-400">Get started with our app, just login and enjoy the experience.</span>
                        </div>
                        <div class="w-full flex flex-col gap-2 mb-3">
                            <label class="font-semibold text-xs text-gray-400">Username</label>
                            <input id="username" placeholder="Username" class="border rounded-lg px-3 py-2 text-sm w-full outline-none bg-gray-900 text-white border-gray-600 focus:border-blue-500" required />
                        </div>
                        <div class="w-full flex flex-col gap-2 mb-4">
                            <label class="font-semibold text-xs text-gray-400">Password</label>
                            <input id="password" placeholder="••••••••" class="border rounded-lg px-3 py-2 text-sm w-full outline-none bg-gray-900 text-white border-gray-600 focus:border-blue-500" type="password" required />
                        </div>
                        <button type="submit" class="py-2 px-8 bg-blue-600 hover:bg-blue-700 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md rounded-lg">Login</button>
                        <p class="text-xs text-gray-400 mt-4">Não tem uma conta? <a href="#/register" class="text-blue-400 hover:underline">Clique aqui!</a></p>
                    </div>
                </form>
            </div>
        </div>`;

        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            try {
                await Parse.User.logIn(username, password);
                window.location.hash = '#/home';
            } catch (error) {
                alert(`Erro: ${error.message}`);
            }
        });
    }

    function renderRegister() {
        appRoot.innerHTML = `
        <div class="relative py-3 sm:max-w-xs sm:mx-auto">
            <div class="px-8 py-6 mt-4 text-left bg-gray-800 rounded-xl shadow-lg">
                <form id="register-form">
                    <div class="flex flex-col justify-center items-center h-full select-none">
                        <div class="flex flex-col items-center justify-center gap-2 mb-8">
                            <p class="m-0 text-xl font-semibold text-white">Create an Account</p>
                        </div>
                        <div class="w-full flex flex-col gap-2 mb-3">
                            <label class="font-semibold text-xs text-gray-400">Username</label>
                            <input id="username" placeholder="Username" class="border rounded-lg px-3 py-2 text-sm w-full outline-none bg-gray-900 text-white border-gray-600 focus:border-blue-500" required />
                        </div>
                        <div class="w-full flex flex-col gap-2 mb-3">
                            <label class="font-semibold text-xs text-gray-400">E-mail</label>
                            <input id="email" placeholder="user@example.com" class="border rounded-lg px-3 py-2 text-sm w-full outline-none bg-gray-900 text-white border-gray-600 focus:border-blue-500" type="email" required />
                        </div>
                        <div class="w-full flex flex-col gap-2 mb-4">
                            <label class="font-semibold text-xs text-gray-400">Password</label>
                            <input id="password" placeholder="••••••••" class="border rounded-lg px-3 py-2 text-sm w-full outline-none bg-gray-900 text-white border-gray-600 focus:border-blue-500" type="password" required />
                        </div>
                        <button type="submit" class="py-2 px-8 bg-blue-600 hover:bg-blue-700 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md rounded-lg">Register</button>
                        <p class="text-xs text-gray-400 mt-4">Já tem uma conta? <a href="#/login" class="text-blue-400 hover:underline">Clique aqui!</a></p>
                    </div>
                </form>
            </div>
        </div>`;

        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = new Parse.User();
            user.set('username', document.getElementById('username').value);
            user.set('email', document.getElementById('email').value);
            user.set('password', document.getElementById('password').value);
            try {
                await user.signUp();
                window.location.hash = '#/home';
            } catch (error) {
                alert(`Erro: ${error.message}`);
            }
        });
    }

    async function renderHome() {
        appRoot.innerHTML = `
            <div class="file-details-container">
                <h1 class="text-3xl font-bold mb-4">Arquivos Recentes</h1>
                <div id="files-list">
                    <p class="text-gray-400">Carregando arquivos...</p>
                </div>
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
                filesList.innerHTML = '<p class="text-gray-400">Nenhum arquivo encontrado. Crie o primeiro!</p>';
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
            document.getElementById('files-list').innerHTML = `<p class="text-red-500">Erro ao carregar arquivos: ${error.message}</p>`;
        }
    }

    function renderNewFile() {
        if (!Parse.User.current()) {
            window.location.hash = '#/login';
            return;
        }
        appRoot.innerHTML = `
            <div class="file-details-container">
                <h2 class="text-2xl font-bold mb-6">Criar Novo Arquivo</h2>
                <form id="new-file-form" class="space-y-4">
                    <div>
                        <label for="title" class="block text-sm font-medium text-gray-300">Título</label>
                        <input type="text" id="title" class="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500" required>
                    </div>
                    <div>
                        <label for="description" class="block text-sm font-medium text-gray-300">Descrição</label>
                        <textarea id="description" rows="4" class="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500" required></textarea>
                    </div>
                    <div>
                        <label for="code" class="block text-sm font-medium text-gray-300">Código</label>
                        <textarea id="code" rows="10" class="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono"></textarea>
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
                <div class="file-details-container">
                    <h2 class="text-3xl font-bold text-white">${file.get('title')}</h2>
                    <p class="text-sm text-gray-400 mt-1 mb-4">Por: ${owner?.get('username') || 'Desconhecido'}</p>
                    <p class="text-gray-300 mb-4">${file.get('description')}</p>
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
            appRoot.innerHTML = `<div class="file-details-container"><p class="text-red-500">Arquivo não encontrado.</p></div>`;
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
                <div class="file-details-container">
                    <h2 class="text-2xl font-bold mb-6">Editar Arquivo</h2>
                    <form id="edit-file-form" class="space-y-4">
                        <div>
                            <label for="title" class="block text-sm font-medium text-gray-300">Título</label>
                            <input type="text" id="title" value="${file.get('title')}" class="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500" required>
                        </div>
                        <div>
                            <label for="description" class="block text-sm font-medium text-gray-300">Descrição</label>
                            <textarea id="description" rows="4" class="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500" required>${file.get('description')}</textarea>
                        </div>
                        <div>
                            <label for="code" class="block text-sm font-medium text-gray-300">Código</label>
                            <textarea id="code" rows="10" class="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono">${file.get('code')}</textarea>
                        </div>
                        <div class="button-group">
                            <button type="submit" class="button button-primary">Salvar</button>
                            <a href="#/File/Id?=${file.id}" class="button bg-gray-600 hover:bg-gray-700 text-white">Cancelar</a>
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
            appRoot.innerHTML = `<div class="file-details-container"><p class="text-red-500">Arquivo não encontrado.</p></div>`;
        }
    }

    function renderSettings() {
        const currentUser = Parse.User.current();
        if (!currentUser) {
            window.location.hash = '#/login';
            return;
        }

        appRoot.innerHTML = `
            <div class="file-details-container max-w-lg mx-auto">
                <h2 class="text-2xl font-bold mb-6">Configurações de Perfil</h2>
                <form id="settings-form" class="space-y-4">
                    <div>
                        <label for="username" class="block text-sm font-medium text-gray-300">Usuário</label>
                        <input type="text" id="username" value="${currentUser.get('username')}" class="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500" required>
                    </div>
                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-300">E-mail</label>
                        <input type="email" id="email" value="${currentUser.get('email')}" class="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500" required>
                    </div>
                    <div class="button-group">
                        <button type="submit" class="button button-primary">Salvar</button>
                        <a href="#/home" class="button bg-gray-600 hover:bg-gray-700 text-white">Cancelar</a>
                    </div>
                </form>
                <div class="mt-8 pt-6 border-t border-red-500/30">
                    <h3 class="text-lg font-semibold text-red-500">Zona de Perigo</h3>
                    <p class="text-sm text-gray-400 mt-1 mb-4">Esta ação não pode ser desfeita.</p>
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
                    await Parse.User.logOut();
                    window.location.hash = '#/register';
                } catch (error) {
                    alert(`Erro ao apagar a conta: ${error.message}`);
                }
            }
        });
    }

    window.addEventListener('hashchange', router);
    router();
});
