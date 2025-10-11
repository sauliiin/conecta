// Função para verificar se o usuário está logado
function isUserLoggedIn() {
    // Verifica se há um usuário logado armazenado no localStorage
    return localStorage.getItem("loggedInUser") !== null;
}

// Função para exibir a inicial do usuário logado
function displayUserInitial() {
    const loginContainer = document.getElementById("login-container");
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")); // Obtém informações do usuário logado

    if (loggedInUser && loggedInUser.fullName) {
        // Obtém a inicial do nome do usuário
        const userInitial = loggedInUser.fullName.charAt(0).toUpperCase();

        // Substitui o conteúdo do botão de login pela inicial do usuário
        loginContainer.innerHTML = `
            <div class="user-initial-circle" title="Meu Perfil">
                ${userInitial}
            </div>
        `;
    }
}

// Chamar a função quando o DOM for carregado
document.addEventListener("DOMContentLoaded", () => {
    if (isUserLoggedIn()) {
        displayUserInitial();
    }
});

// Função para criar o modal de avaliação
function createRatingModal(userFullName) {
    // Criar o contêiner do modal
    const modal = document.createElement("div");
    modal.classList.add("rating-modal");

    // Criar o conteúdo do modal
    modal.innerHTML = `
        <div class="rating-modal-content">
            <h2>Avaliar ${userFullName}</h2>
            <p>Você já contratou o meu serviço? Me avalie de 0 a 5!</p>
            <input type="number" id="rating-input" min="0" max="5" step="1" placeholder="Digite uma nota de 0 a 5">
            <div class="rating-buttons">
                <button id="confirm-rating">Confirmar</button>
                <button id="cancel-rating">Voltar</button>
            </div>
        </div>
    `;

    // Adicionar o modal ao body
    document.body.appendChild(modal);

    // Adicionar evento para confirmar a avaliação
    const confirmButton = modal.querySelector("#confirm-rating");
    confirmButton.addEventListener("click", () => {
        const ratingInput = modal.querySelector("#rating-input");
        const ratingValue = parseInt(ratingInput.value, 10);

        if (isNaN(ratingValue) || ratingValue < 0 || ratingValue > 5) {
            alert("Por favor, insira um valor inteiro entre 0 e 5.");
        } else {
            // Atualizar a avaliação no localStorage
            updateUserRatingWithAverage(userFullName, ratingValue);
            alert(`Obrigado por avaliar ${userFullName} com a nota ${ratingValue}!`);
            closeModal(modal);
        }
    });

    // Adicionar evento para cancelar a avaliação
    const cancelButton = modal.querySelector("#cancel-rating");
    cancelButton.addEventListener("click", () => closeModal(modal));
}

// Função para atualizar a avaliação do usuário considerando a média
function updateUserRatingWithAverage(userFullName, newRating) {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(user => user.fullName === userFullName);

    if (user) {
        // Inicializa o total de avaliações e o somatório, se não existirem
        if (!user.totalAvaliacoes) user.totalAvaliacoes = 0;
        if (!user.somaAvaliacoes) user.somaAvaliacoes = 0;

        // Atualiza o somatório e o total de avaliações
        user.somaAvaliacoes += newRating;
        user.totalAvaliacoes += 1;

        // Calcula a nova média
        user.avaliacao = Math.round(user.somaAvaliacoes / user.totalAvaliacoes); // Arredonda para um valor inteiro

        // Salva as alterações no localStorage
        localStorage.setItem("users", JSON.stringify(users));

        // Recarrega a interface para refletir a nova avaliação
        loadUsersIntoFields();
    }
}

// Função para fechar o modal
function closeModal(modal) {
    document.body.removeChild(modal);
}

// Atualizar a função original com a lógica do modal
function loadUsersIntoFields(filter = "", singleUser = null) {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Selecionar o contêiner principal onde os campos serão adicionados
    const servicesContainer = document.querySelector(".main-index");

    // Remover elementos relacionados aos usuários antes de recriá-los (preservando outros elementos HTML)
    const existingUserBlocks = servicesContainer.querySelectorAll(".user-block");
    existingUserBlocks.forEach(block => block.remove());

    if (users.length === 0) {
        return;
    }

    // Filtrar usuários com base no filtro de pesquisa ou no usuário selecionado
    let filteredUsers;
    if (singleUser) {
        // Filtra apenas o usuário selecionado
        filteredUsers = users.filter(user => 
            user.fullName === singleUser && 
            user.servicos && 
            user.servicos.length > 0
        );
    } else {
        // Filtra usuários com base no campo de busca e verifica se possuem serviços
        const searchText = filter.toLowerCase();
        filteredUsers = users.filter(user =>
            user.servicos &&
            user.servicos.length > 0 &&
            user.servicos.some(servico => servico.descricao.toLowerCase().includes(searchText))
        );
    }

    if (filteredUsers.length === 0) {
        return;
    }

    filteredUsers.forEach(user => {
        // Garantir que a foto do usuário está correta
        const foto = user.foto && user.foto.trim() !== "" ? user.foto : "img/foto-perfil-generica.jpg";

        const userBlock = document.createElement("div");
        userBlock.classList.add("user-block");

        // Adicionar a funcionalidade de clique para filtrar apenas o usuário selecionado
        userBlock.addEventListener("click", () => {
            if (isUserLoggedIn()) {
                createRatingModal(user.fullName); // Exibe o modal de avaliação
            } else {
                alert("Você precisa estar logado para avaliar este usuário.");
            }
        });

        // Adicionar a foto do profissional
        const userImage = document.createElement("img");
        userImage.classList.add("user-image");
        userImage.src = foto;
        userImage.alt = `Foto de ${user.fullName}`;
        userBlock.appendChild(userImage);

        // Criar título com o nome do profissional
        const userName = document.createElement("h3");
        userName.textContent = `Nome do Prestador: ${user.fullName}`;
        userBlock.appendChild(userName);

        // Criar lista de campos
        const fieldList = document.createElement("ul");
        fieldList.classList.add("servicos-informacoes");

        // Adicionar os serviços (no mesmo formato dos outros campos)
        if (user.servicos && user.servicos.length > 0) {
            user.servicos.forEach(servico => {
                const serviceField = document.createElement("li");
                serviceField.classList.add("perfil-lista");
                serviceField.innerHTML = `
                    <label class="perfil-label">Serviço</label>
                    <button class="perfil-input" type="button" disabled>${servico.descricao}</button>
                `;
                fieldList.appendChild(serviceField);
            });
        }

        // Código para adicionar os campos (Telefone, Instagram, etc.)
        const fields = [
            { label: "Telefone", value: user.telefone },
            { label: "Rede Social", value: user.instagram },
        ];

        fields.forEach(field => {
            if (field.value) {
                const fieldItem = document.createElement("li");
                fieldItem.classList.add("perfil-lista");
                fieldItem.innerHTML = `
                    <label class="perfil-label">${field.label}</label>
                    <button class="perfil-input" type="button" disabled>${field.value}</button>
                `;
                fieldList.appendChild(fieldItem);
            }
        });

        // Adicionar campo de avaliação
        const avaliacaoField = document.createElement("li");
        avaliacaoField.classList.add("perfil-lista");

        const avaliacaoLabel = document.createElement("label");
        avaliacaoLabel.classList.add("perfil-label");
        avaliacaoLabel.textContent = "Avaliação";

        const avaliacaoImage = document.createElement("img");
        avaliacaoImage.classList.add("user-rating-centralizada");
        avaliacaoImage.src = user.avaliacao ? `img/${user.avaliacao}.png` : "img/0.png";
        avaliacaoImage.alt = user.avaliacao ? `${user.avaliacao} estrelas` : "Não avaliado";

        avaliacaoField.appendChild(avaliacaoLabel);
        avaliacaoField.appendChild(avaliacaoImage);
        fieldList.appendChild(avaliacaoField);

        // Adicionar a lista de campos ao bloco do usuário
        userBlock.appendChild(fieldList);

        // Adicionar o bloco ao contêiner principal
        servicesContainer.appendChild(userBlock);
    });
}

// Função para adicionar um novo usuário ao final da lista em localStorage
function addNewUser(newUser) {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
}

// Função para inicializar os dados e carregar usuários
document.addEventListener("DOMContentLoaded", () => {
    seedUsers(); // Adiciona os usuários seedados, caso ainda não tenham sido adicionados
    loadUsersIntoFields(); // Carrega todos os usuários na página

    const searchInput = document.getElementById("search");
    searchInput.addEventListener("input", (event) => {
        const filter = event.target.value; // Texto digitado no campo de busca
        loadUsersIntoFields(filter); // Atualiza os resultados com base no texto digitado
    });
});

function seedUsers() {
    if (localStorage.getItem("users")) {
        console.log("Usuários já cadastrados. Seed não será executado novamente.");
        return;
    }

    const users = [
        {
            fullName: "Marilene Garcia",
            foto: "img/pessoa1.jpg",
            servicos: [{ descricao: "Faço bolo no pote, doces, bolto de aniversário e salgadinhos" }],
            telefone: "(31)994521567",
            instagram: "@Garcia_Mari",
            avaliacao: 5,
        },
        {
            fullName: "Marilene Ferreira",
            foto: "img/prestador2.png",
            servicos: [{ descricao: "Instalações elétricas, manutenção de disjuntores, conserto de maquinas de lavar e geladeira. Atende emergências." }],
            telefone: "(31) 99888-7744",
            instagram: "@mari.eletricista",
            avaliacao: 4,
        },
        {
            fullName: "Elza Menezes",
            foto: "img/prestador3.png",
            servicos: [{ descricao: "Faço vestidos de casamento, reparação de roupas, vestidos para festas, roupas de bebê." }],
            telefone: "(31) 91234-5678",
            instagram: "@vovo.elza",
            avaliacao: 5,
        },
        {
            fullName: "Ana Beatriz Rocha",
            foto: "img/prestador4.jpg",
            servicos: [{ descricao: "Pintura de interiores e fachadas, texturas decorativas, grafiato, esmalte e epóxi." }],
            telefone: "(31) 93456-1234",
            instagram: "@anapinturas",
            avaliacao: 3,
        },
        {
            fullName: "Thais Campos",
            foto: "img/prestador5.jpg",
            servicos: [{ descricao: "Consultoria em direito civil e consumidor. Administradora profissional de condomínio" }],
            telefone: "(31) 99654-3210",
            instagram: "@thais.juridico",
            avaliacao: 2,
        },
        {
            fullName: "Ana Almeida",
            foto: "img/prestador6.jpg",
            servicos: [{ descricao: "Roupas lindas, baratinhas e cheias de estilo!" }],
            telefone: "(31) 98700-3344",
            instagram: "@AnaComEstilo",
            avaliacao: 5,
        },
        {
            fullName: "Creuza Campos",
            foto: "img/prestador7.png",
            servicos: [{ descricao: "Feito à mão, com carinho e um toque de amor em cada detalhe. Produzo peças artesanais únicas: chaveiros, mandalas e decorações cheias de boas energias." }],
            telefone: "(31) 99888-0022",
            instagram: "@creuzacomamor",
            avaliacao: 1,
        },
        {
            fullName: "Mariana Teixeira",
            foto: "img/prestador8.jpg",
            servicos: [{ descricao: "Aqui é pé na estrada e chave inglesa na mão — atendimento 24h com qualidade e rapidez." }],
            telefone: "(31) 91000-0099",
            instagram: "@mari.mecanica",
            avaliacao: 4,
        },
        {
            fullName: "Sandra Moura",
            foto: "img/prestador9.jpg",
            servicos: [{ descricao: "Aplicação de manta asfáltica, pintura impermeabilizante, tratamento de lajes e paredes úmidas." }],
            telefone: "(31) 99123-4567",
            instagram: "@imper.sandra",
            avaliacao: 3,
        },
    ];

    // Atribuir foto padrão caso esteja ausente
    users.forEach(user => {
        if (!user.foto || user.foto.trim() === "") {
            user.foto = "img/foto-perfil-generica.jpg";
        }
        console.log(`Foto carregada para ${user.fullName}: ${user.foto}`);
    });

    localStorage.setItem("users", JSON.stringify(users));
    console.log("Usuários cadastrados com sucesso!");
}

// Inicializar os dados e carregar os usuários na página
document.addEventListener("DOMContentLoaded", () => {
    seedUsers();
    loadUsersIntoFields();
});



