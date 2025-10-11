// Função para obter usuários do localStorage
function getUsers() {
    const users = localStorage.getItem("users");
    return users ? JSON.parse(users) : [];
}

// Função para salvar usuários no localStorage
function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

// Função para converter arquivo em Base64
function getBase64(file, callback) {
    const reader = new FileReader();
    reader.onload = function () {
        callback(reader.result);
    };
    reader.readAsDataURL(file);
}

// Pre-carregar imagem no formulário
document.getElementById("foto")?.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        getBase64(file, function (base64) {
            const preview = document.getElementById("profilePreview");
            preview.src = base64; // Atualiza a pré-visualização da imagem
            preview.style.display = "block";
        });
    }
});

// Cadastro de usuário
document.getElementById("signupForm")?.addEventListener("submit", function (event) {
    event.preventDefault();

    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        alert("As senhas não coincidem. Tente novamente.");
        return;
    }

    const users = getUsers();

    // Verificar se o email já está cadastrado
    if (users.some((user) => user.email === email)) {
        alert("E-mail já cadastrado. Tente usar outro.");
        return;
    }

    // Obter a imagem do usuário (se selecionada)
    const fotoInput = document.getElementById("foto");
    const file = fotoInput.files[0];

    if (file) {
        // Converter a imagem para Base64 e salvar o usuário
        getBase64(file, function (base64) {
            const newUser = {
                fullName,
                email,
                password,
                foto: base64, // Salva a imagem em Base64
                telefone: "",
                instagram: "",
                servicos: [],
            };

            users.push(newUser);
            saveUsers(users);

            // Salvar o novo usuário como logado no localStorage
            localStorage.setItem("loggedInUser", JSON.stringify({ email: newUser.email, fullName: newUser.fullName }));

            alert(`Cadastro realizado com sucesso! Bem-vindo(a), ${newUser.fullName}.`);
            window.location.href = "index.html"; // Redirecionar para a página inicial
        });
    } else {
        // Caso nenhuma imagem seja selecionada, usar a imagem padrão
        const newUser = {
            fullName,
            email,
            password,
            foto: "img/foto-perfil-generica.jpg", // Imagem padrão
            telefone: "",
            instagram: "",
            servicos: [],
        };

        users.push(newUser);
        saveUsers(users);

        // Salvar o novo usuário como logado no localStorage
        localStorage.setItem("loggedInUser", JSON.stringify({ email: newUser.email, fullName: newUser.fullName }));

        alert(`Cadastro realizado com sucesso! Bem-vindo(a), ${newUser.fullName}.`);
        window.location.href = "index.html"; // Redirecionar para a página inicial
    }
});

// Seleciona o botão customizado e o input de arquivo
const customFileButton = document.getElementById("customFileButton");
const fotoInput = document.getElementById("foto");
const fileNameSpan = document.getElementById("fileName");
const profilePreview = document.getElementById("profilePreview");

// Vincula o clique no botão customizado ao clique no input de arquivo
customFileButton.addEventListener("click", function () {
    fotoInput.click(); // Simula o clique no input de arquivo
});

// Atualiza o texto de "Nenhum arquivo selecionado" e a pré-visualização da imagem
fotoInput.addEventListener("change", function () {
    const file = fotoInput.files[0];

    if (file) {
        // Atualiza o texto do nome do arquivo
        fileNameSpan.textContent = file.name;

        // Cria uma URL para o arquivo selecionado e exibe na pré-visualização
        const reader = new FileReader();
        reader.onload = function (e) {
            profilePreview.src = e.target.result; // Atualiza o src da imagem
        };
        reader.readAsDataURL(file); // Lê o arquivo selecionado como Base64
    } else {
        fileNameSpan.textContent = "Nenhum arquivo selecionado";
        profilePreview.src = "img/foto-perfil-generica.jpg"; // Volta para a imagem genérica
    }
});