// Função para verificar se o usuário está logado
function getLoggedInUser() {
    const loggedInUser = localStorage.getItem("loggedInUser");
    return loggedInUser ? JSON.parse(loggedInUser) : null;
}

// Verificar login apenas na página perfilUsuario.html
document.addEventListener("DOMContentLoaded", function () {
    const isPerfilUsuarioPage = window.location.pathname.includes("perfilUsuario.html");
    const loggedInUser = getLoggedInUser();

    if (isPerfilUsuarioPage && !loggedInUser) {
        alert("Nenhum usuário está logado. Redirecionando para a página de login.");
        window.location.href = "login.html";
        return;
    }

    // Atualizar o campo "Nome" com o nome do usuário logado, se existir
    if (isPerfilUsuarioPage && loggedInUser) {
        const nomeField = document.getElementById("nome");
        if (nomeField) {
            nomeField.value = loggedInUser.fullName;
        }
    }
});

// Função para obter usuários do localStorage
function getUsers() {
    const users = localStorage.getItem("users");
    return users ? JSON.parse(users) : [];
}

// Função para salvar usuários no localStorage
function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

// Login
document.getElementById("loginForm")?.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const users = getUsers();
    const user = users.find((user) => user.email === email && user.password === password);

    if (user) {
        // Salvar usuário logado no localStorage
        localStorage.setItem("loggedInUser", JSON.stringify({ email: user.email, fullName: user.fullName }));

        alert(`Bem-vindo(a), ${user.fullName}!`);
        window.location.href = "index.html";
    } else {
        alert("E-mail ou senha inválidos. Tente novamente.");
    }
});

// Handle Google stuff
function handleGoogleSignIn(response) {
    const credential = response.credential;
    const payload = parseJwt(credential);

    const users = getUsers();
    let user = users.find((user) => user.email === payload.email);

    if (!user) {
        user = { fullName: payload.name, email: payload.email, phone: "", password: "" };
        users.push(user);
        saveUsers(users);
    }

    // Salvar usuário logado no localStorage
    localStorage.setItem("loggedInUser", JSON.stringify({ email: user.email, fullName: user.fullName }));

    alert(`Login bem-sucedido com o Google! Bem-vindo(a), ${user.fullName}!`);
    window.location.href = "index.html";
}

function parseJwt(token) {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
    );
    return JSON.parse(jsonPayload);
}

const fileInput = document.getElementById("foto");
const customButton = document.getElementById("customFileButton");
const fileNameDisplay = document.getElementById("fileName");

customButton.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", () => {
    const fileName = fileInput.files[0]?.name || "Nenhum arquivo selecionado";
    fileNameDisplay.textContent = fileName;
});