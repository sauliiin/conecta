// Carregar usuários
let usuarios = JSON.parse(localStorage.getItem("users")) || [];
console.log('Usuários carregados do localStorage:', usuarios);

// Função para verificar se o usuário está logado
function getLoggedInUser() {
    const loggedInUser = localStorage.getItem("loggedInUser");
    return loggedInUser ? JSON.parse(loggedInUser) : null;
}

// Função para exibir a inicial do usuário logado
function displayUserInitial() {
    const loginContainer = document.getElementById("login-container"); // Elemento onde o círculo será inserido
    const loggedInUser = getLoggedInUser();

    if (loggedInUser && loggedInUser.fullName) {
        // Obtém a inicial do nome do usuário
        const userInitial = loggedInUser.fullName.charAt(0).toUpperCase();

        // Substitui o botão de login pela inicial do usuário
        loginContainer.innerHTML = `
            <div class="user-initial-circle" title="Meu Perfil">
                ${userInitial}
            </div>
        `;
    }
}

// Função para salvar informações adicionais do usuário logado
function saveUserAdditionalInfo(cpf, telefone, instagram) {
    const loggedInUser = getLoggedInUser();

    if (!loggedInUser) {
        alert("Nenhum usuário está logado. Redirecionando para a página de login.");
        window.location.href = "login.html";
        return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(user => user.email === loggedInUser.email);

    if (user) {
        user.cpf = cpf;
        user.telefone = telefone;
        user.instagram = instagram;

        localStorage.setItem("users", JSON.stringify(users));
        alert("Informações salvas com sucesso!");
    } else {
        console.error("Erro ao encontrar o usuário logado no array de usuários.");
        alert("Erro ao encontrar o usuário logado.");
    }
}

// Função para salvar serviços do usuário logado
function saveUserService(tipoServico, descricaoServico) {
    const loggedInUser = getLoggedInUser();

    if (!loggedInUser) {
        alert("Nenhum usuário está logado. Redirecionando para a página de login.");
        window.location.href = "login.html";
        return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(user => user.email === loggedInUser.email);

    if (user) {
        if (!user.servicos) {
            user.servicos = [];
        }
        user.servicos.push({ tipo: tipoServico, descricao: descricaoServico });

        localStorage.setItem("users", JSON.stringify(users));
        alert("Serviço cadastrado com sucesso!");
    } else {
        console.error("Erro ao encontrar o usuário logado no array de usuários.");
        alert("Erro ao encontrar o usuário logado.");
    }
}

// Evento para salvar informações adicionais do usuário
document.addEventListener("DOMContentLoaded", function () {
    const perfilButton = document.querySelector(".perfil-botao");
    if (perfilButton) {
        perfilButton.addEventListener("click", function () {
            const cpf = document.getElementById("cpfUsuario")?.value || "";
            const telefone = document.getElementById("telefone")?.value || "";
            const instagram = document.getElementById("instagram")?.value || "";

            saveUserAdditionalInfo(cpf, telefone, instagram);
        });
    } else {
        console.error("Botão '.perfil-botao' não encontrado no DOM.");
    }

    const servicosButton = document.querySelector(".servicos-botao");
    if (servicosButton) {
        servicosButton.addEventListener("click", function () {
            const tipoServico = document.getElementById("servico")?.value || "";
            const descricaoServico = document.getElementById("descricao")?.value || "";

            saveUserService(tipoServico, descricaoServico);
        });
    } else {
        console.error("Botão '.servicos-botao' não encontrado no DOM.");
    }

    // Atualizar os campos "Nome", foto de perfil, e exibir a inicial do usuário logado
    updateUserProfile();
    if (getLoggedInUser()) {
        displayUserInitial();
    }
});

// Preencher o campo "Nome" e a foto de perfil do usuário logado
function updateUserProfile() {
    const loggedInUser = getLoggedInUser();

    if (!loggedInUser) {
        alert("Nenhum usuário está logado. Redirecionando para a página de login.");
        window.location.href = "login.html";
        return;
    }

    const nomeField = document.getElementById("nome");
    const profilePreview = document.getElementById("profilePreview");

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(user => user.email === loggedInUser.email);

    if (user) {
        // Atualizar o campo "Nome"
        if (nomeField) {
            nomeField.value = user.fullName;
        } else {
            console.error("Campo 'nome' não encontrado no DOM.");
        }

        // Atualizar a foto do perfil
        if (profilePreview) {
            profilePreview.src = user.foto || "img/foto-perfil-generica.jpg"; // Exibe a foto do usuário ou a imagem padrão
        } else {
            console.error("Campo 'profilePreview' não encontrado no DOM.");
        }
    } else {
        console.error("Erro ao encontrar o usuário logado no array de usuários.");
        alert("Erro ao carregar os dados do perfil.");
    }
}