// Função para verificar se o usuário está logado
function getLoggedInUser() {
    const loggedInUser = localStorage.getItem("loggedInUser");
    return loggedInUser ? JSON.parse(loggedInUser) : null;
}

// Função para obter todos os usuários do localStorage
function getUsers() {
    const users = localStorage.getItem("users");
    return users ? JSON.parse(users) : [];
}

// Função para carregar os serviços do usuário logado e exibir dinamicamente no formulário
function loadUserServices() {
    console.log("Carregando serviços do usuário...");

    const loggedInUser = getLoggedInUser();

    if (!loggedInUser) {
        alert("Nenhum usuário está logado. Redirecionando para a página de login.");
        window.location.href = "login.html";
        return;
    }

    // Procurar os serviços do usuário logado
    const users = getUsers();
    const user = users.find(user => user.email === loggedInUser.email);

    console.log("Usuário encontrado:", user);

    const servicesContainer = document.querySelector(".servicos-informacoes");

    if (user && user.servicos && user.servicos.length > 0) {
        // Criar campos dinamicamente para cada serviço
        user.servicos.forEach(servico => {
            const serviceWrapper = document.createElement("li");
            serviceWrapper.classList.add("servicos-campo");

            // Criar campo "Tipo de Serviço"
            const tipoServicoLabel = document.createElement("label");
            tipoServicoLabel.classList.add("servicos-label");
            tipoServicoLabel.textContent = "Tipo de Serviço";

            const tipoServicoInput = document.createElement("input");
            tipoServicoInput.classList.add("servicos-input");
            tipoServicoInput.type = "text";
            tipoServicoInput.value = servico.tipo; // Preencher com o tipo do serviço
            tipoServicoInput.disabled = true; // Tornar o campo apenas leitura

            // Criar campo "Descrição do Serviço"
            const descricaoServicoLabel = document.createElement("label");
            descricaoServicoLabel.classList.add("servicos-label");
            descricaoServicoLabel.textContent = "Descrição do Serviço";

            const descricaoServicoInput = document.createElement("input");
            descricaoServicoInput.classList.add("servicos-input");
            descricaoServicoInput.type = "text";
            descricaoServicoInput.value = servico.descricao; // Preencher com a descrição do serviço
            descricaoServicoInput.disabled = true; // Tornar o campo apenas leitura

            // Adicionar campos ao wrapper
            serviceWrapper.appendChild(tipoServicoLabel);
            serviceWrapper.appendChild(tipoServicoInput);
            serviceWrapper.appendChild(descricaoServicoLabel);
            serviceWrapper.appendChild(descricaoServicoInput);

            // Adicionar o wrapper ao container de serviços
            servicesContainer.appendChild(serviceWrapper);
        });
    } else {
        // Caso o usuário não tenha serviços cadastrados
        console.warn("Nenhum serviço encontrado para o usuário logado.");
        const noServicesMessage = document.createElement("p");
        noServicesMessage.textContent = "Você ainda não cadastrou nenhum serviço.";
        noServicesMessage.style.color = "gray";
        noServicesMessage.style.fontStyle = "italic";

        servicesContainer.appendChild(noServicesMessage);
    }
}

// Chamar a função ao carregar a página
document.addEventListener("DOMContentLoaded", loadUserServices);