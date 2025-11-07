// --- INICIALIZAÇÃO E CONFIGURAÇÃO DO FIREBASE ---

const firebaseConfig = {
    apiKey: "AIzaSyDM66hHUOkfAP3FrnfcQaF2aRiY_2jhnTM",
    authDomain: "controle-de-ferias-45d25.firebaseapp.com",
    projectId: "controle-de-ferias-45d25",
    storageBucket: "controle-de-ferias-45d25.firebasestorage.app",
    messagingSenderId: "298345781850",
    appId: "1:298345781850:web:0d21bb20a7fad821de9663"
};

// Inicializar o Firebase
firebase.initializeApp(firebaseConfig);

// Disponibilizar globalmente para o restante do script
const db = firebase.firestore();
const storage = firebase.storage();


// --- FUNÇÕES GLOBAIS E HELPERS (Compartilhadas) ---

function getLoggedInUser() {
    const loggedInUser = localStorage.getItem("loggedInUser");
    return loggedInUser ? JSON.parse(loggedInUser) : null;
}

function isUserLoggedIn() {
    return localStorage.getItem("loggedInUser") !== null;
}

// Busca todos os usuários do Firestore
async function getUsers() {
    const usersCollection = await db.collection("users").get();
    const users = [];
    usersCollection.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
    });
    return users;
}

// Busca o ID do documento do usuário no Firestore pelo email
async function getUserIdByEmail(email) {
    if (!email) return null;
    const q = await db.collection("users").where("email", "==", email).get();
    if (q.empty) {
        console.error("Nenhum usuário encontrado com o email:", email);
        return null;
    }
    return q.docs[0].id; // Retorna o ID do documento
}

// Função para converter arquivo em Base64
function getBase64(file, callback) {
    const reader = new FileReader();
    reader.onload = function () {
        callback(reader.result);
    };
    reader.readAsDataURL(file);
}

// Função para fechar o modal
function closeModal(modal) {
    if (modal && document.body.contains(modal)) {
        document.body.removeChild(modal);
    }
}

// Helper para login do Google (parseia o token)
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


// --- SEÇÃO: ANIMAÇÕES E EFEITOS (script.js) ---

// Efeito 1: Mudar cor do header
const header = document.querySelector('.header-fixo');
if (header) {
    window.addEventListener('scroll', () => {
        if (!header.classList.contains('video-ended-state')) {
            if (window.scrollY > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });
}

// Efeito 2: Animação de revelação
function revealSections() {
    const reveals = document.querySelectorAll('.reveal');
    for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        const elementVisible = 150;
        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add('visible');
        }
    }
}
window.addEventListener('scroll', revealSections);
revealSections(); // Chama na inicialização

// Efeito 3: Lógica de sequência de vídeo
const videoHero = document.querySelector('#video-hero');
const h1Inicial = document.querySelector('#h1-inicial');
const h1Middle = document.querySelector('#h1-middle');
const h1MiddleEnd = document.querySelector('#h1-middleEnd');
const h1Final = document.querySelector('#h1-final');

function iniciarSequenciaHero() {
    if (!videoHero) return; // Só executa se os elementos existirem

    setTimeout(() => {
        h1Inicial.classList.add('hidden');
        h1Inicial.addEventListener('transitionend', () => {
            videoHero.style.opacity = 1;
            videoHero.play();
        }, { once: true });
    }, 1000);

    videoHero.addEventListener('timeupdate', () => {
        const time = videoHero.currentTime;
        if (time >= 2 && time < 6) h1Middle.classList.remove('hidden');
        else h1Middle.classList.add('hidden');
        if (time >= 8 && time < 12) h1MiddleEnd.classList.remove('hidden');
        else h1MiddleEnd.classList.add('hidden');
    });

    videoHero.addEventListener('ended', () => {
        videoHero.style.opacity = 0;
        h1Final.classList.remove('hidden');
        const secaoTopo = document.querySelector('.secao-topo');
        header.classList.add('video-ended-state');
        header.classList.remove('scrolled');
        secaoTopo.classList.add('video-ended-state');
    });
}
// Inicia a sequência (apenas se os elementos existirem)
if (videoHero) {
    iniciarSequenciaHero();
}

// --- SEÇÃO: LOGIN DE USUÁRIO (login.js) ---

// Salva um novo usuário (usado pelo 'saveUsers' do signup e pelo Google sign-in)
async function saveUsers(newUser) {
    try {
        // A função 'add' cria um documento com ID automático
        const docRef = await db.collection("users").add(newUser);
        console.log("Usuário salvo com ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Erro ao salvar usuário: ", e);
        return null;
    }
}

// Lógica de Login (submit do formulário)
async function handleLoginSubmit(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Busca no Firestore por email e senha
    try {
        const querySnapshot = await db.collection("users")
            .where("email", "==", email)
            .where("password", "==", password) // (Inseguro, mas mantém sua lógica)
            .get();

        if (querySnapshot.empty) {
            alert("E-mail ou senha inválidos. Tente novamente.");
        } else {
            // Pega o primeiro usuário encontrado
            const user = querySnapshot.docs[0].data();
            
            // Salvar usuário logado no localStorage (isso está correto, é a "sessão")
            localStorage.setItem("loggedInUser", JSON.stringify({ email: user.email, fullName: user.fullName }));

            alert(`Bem-vindo(a), ${user.fullName}!`);
            window.location.href = "index.html"; // Mude para maini.html se for a de entrada
        }
    } catch (error) {
        console.error("Erro ao fazer login: ", error);
        alert("Ocorreu um erro ao tentar fazer login.");
    }
}

// Lógica de Login do Google
async function handleGoogleSignIn(response) {
    const credential = response.credential;
    const payload = parseJwt(credential); // { email: "...", name: "..." }

    try {
        // Verifica se o usuário já existe no Firestore
        const q = await db.collection("users").where("email", "==", payload.email).get();
        let user;

        if (q.empty) {
            // Se não existe, cria um novo
            console.log("Criando novo usuário (Google) no Firestore...");
            user = {
                fullName: payload.name,
                email: payload.email,
                foto: payload.picture || "https://firebasestorage.googleapis.com/v0/b/controle-de-ferias-45d25.firebasestorage.app/o/profile_images%2Ffoto-perfil-generica.jpg?alt=media&token=9baf84b2-375c-4197-8487-c12c4a4d5459",
                password: "", // Usuário do Google não tem senha local
                telefone: "",
                instagram: "",
                servicos: [],
                avaliacao: 0,
                totalAvaliacoes: 0,
                somaAvaliacoes: 0,
            };
            await saveUsers(user); // Salva no Firestore
        } else {
            // Se já existe, apenas pega os dados
            user = q.docs[0].data();
        }

        // Salvar usuário logado no localStorage
        localStorage.setItem("loggedInUser", JSON.stringify({ email: user.email, fullName: user.fullName }));

        alert(`Login bem-sucedido com o Google! Bem-vindo(a), ${user.fullName}!`);
        window.location.href = "index.html"; // Mude para maini.html se for a de entrada
    
    } catch (error) {
        console.error("Erro no login com Google: ", error);
        alert("Ocorreu um erro ao tentar logar com o Google.");
    }
}

// --- SEÇÃO: CADASTRO DE USUÁRIO (script_signup.js) ---

// Lógica de cadastro (submit do formulário)
async function handleSignupSubmit(event) {
    event.preventDefault();

    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        alert("As senhas não coincidem. Tente novamente.");
        return;
    }

    // Verificar se o email já está cadastrado no Firestore
    const usersQuery = await db.collection("users").where("email", "==", email).get();
    if (!usersQuery.empty) {
        alert("E-mail já cadastrado. Tente usar outro.");
        return;
    }

    const fotoInput = document.getElementById("foto");
    const file = fotoInput.files[0];
    
    let fotoUrl = "https://firebasestorage.googleapis.com/v0/b/controle-de-ferias-45d25.firebasestorage.app/o/profile_images%2Ffoto-perfil-generica.jpg?alt=media&token=9baf84b2-375c-4197-8487-c12c4a4d5459";

    const newUser = {
        fullName,
        email,
        password, // (Inseguro, considere usar Firebase Auth)
        foto: fotoUrl,
        telefone: "",
        instagram: "",
        servicos: [],
        avaliacao: 0,
        totalAvaliacoes: 0,
        somaAvaliacoes: 0,
    };

    if (file) {
        try {
            const base64 = await new Promise((resolve) => getBase64(file, resolve));
            const storageRef = storage.ref(`profile_images/${email}_${new Date().getTime()}`);
            const snapshot = await storageRef.putString(base64, 'data_url');
            fotoUrl = await snapshot.ref.getDownloadURL();
            newUser.foto = fotoUrl;
        } catch (error) {
            console.error("Erro ao fazer upload da foto: ", error);
            alert("Erro ao fazer upload da foto. O cadastro continuará com a foto padrão.");
        }
    }

    await saveUsers(newUser);

    localStorage.setItem("loggedInUser", JSON.stringify({ email: newUser.email, fullName: newUser.fullName }));

    alert(`Cadastro realizado com sucesso! Bem-vindo(a), ${newUser.fullName}.`);
    window.location.href = "index.html"; // Mude para maini.html se for a de entrada
}

// --- SEÇÃO: PERFIL E EDIÇÃO DE SERVIÇOS (script_services.js) ---

// Exibe a inicial do usuário no header
function displayUserInitial() {
    const loginContainer = document.getElementById("login-container");
    const loggedInUser = getLoggedInUser();

    if (loggedInUser && loggedInUser.fullName && loginContainer) {
        const userInitial = loggedInUser.fullName.charAt(0).toUpperCase();
        loginContainer.innerHTML = `
            <div class="user-initial-circle" title="Meu Perfil">
                ${userInitial}
            </div>
        `;
    }
}

// Salva informações (CPF, Tel, Insta) no Firestore
async function saveUserAdditionalInfo(cpf, telefone, instagram) {
    const loggedInUser = getLoggedInUser();
    if (!loggedInUser) {
        alert("Nenhum usuário está logado.");
        window.location.href = "login.html";
        return;
    }

    try {
        const userId = await getUserIdByEmail(loggedInUser.email);
        if (!userId) {
            alert("Erro ao encontrar o usuário logado.");
            return;
        }

        await db.collection("users").doc(userId).update({
            cpf: cpf,
            telefone: telefone,
            instagram: instagram
        });
        
        alert("Informações salvas com sucesso!");
    } catch (error) {
        console.error("Erro ao salvar informações: ", error);
        alert("Erro ao salvar informações.");
    }
}

// Salva um novo serviço no array de serviços do usuário no Firestore
async function saveUserService(tipoServico, descricaoServico) {
    const loggedInUser = getLoggedInUser();
    if (!loggedInUser) {
        alert("Nenhum usuário está logado.");
        window.location.href = "login.html";
        return;
    }

    try {
        const userId = await getUserIdByEmail(loggedInUser.email);
        if (!userId) {
            alert("Erro ao encontrar o usuário logado.");
            return;
        }

        const novoServico = { tipo: tipoServico, descricao: descricaoServico };
        
        await db.collection("users").doc(userId).update({
            servicos: firebase.firestore.FieldValue.arrayUnion(novoServico)
        });

        alert("Serviço cadastrado com sucesso!");
        // Limpa os campos
        document.getElementById("servico").value = "";
        document.getElementById("descricao").value = "";
    } catch (error) {
        console.error("Erro ao salvar serviço: ", error);
        alert("Erro ao salvar serviço.");
    }
}

// Carrega os dados do usuário (Nome, Foto) na página de perfil
async function updateUserProfile() {
    const loggedInUser = getLoggedInUser();
    // REGRA DE REDIRECIONAMENTO:
    if (!loggedInUser) {
        alert("Nenhum usuário está logado. Redirecionando para a página de login.");
        window.location.href = "login.html";
        return;
    }

    const nomeField = document.getElementById("nome");
    const profilePreview = document.getElementById("profilePreview");

    try {
        const q = await db.collection("users").where("email", "==", loggedInUser.email).get();
        if (q.empty) {
            throw new Error("Usuário não encontrado no Firestore.");
        }
        
        const user = q.docs[0].data();
        if (nomeField) nomeField.value = user.fullName;
        if (profilePreview) profilePreview.src = user.foto || "https://firebasestorage.googleapis.com/v0/b/controle-de-ferias-45d25.firebasestorage.app/o/profile_images%2Ffoto-perfil-generica.jpg?alt=media&token=9baf84b2-375c-4197-8487-c12c4a4d5459";

    } catch (error) {
        console.error("Erro ao carregar dados do perfil: ", error);
        alert("Erro ao carregar os dados do perfil.");
    }
}

// --- SEÇÃO: CARREGAMENTO DE SERVIÇOS (loadservices.js) ---

// Carrega os serviços do usuário logado na página "Meus Serviços"
async function loadUserServices() {
    console.log("Carregando serviços do usuário...");
    const loggedInUser = getLoggedInUser();

    // REGRA DE REDIRECIONAMENTO:
    if (!loggedInUser) {
        alert("Nenhum usuário está logado. Redirecionando para a página de login.");
        window.location.href = "login.html";
        return;
    }

    const users = await getUsers();
    const user = users.find(user => user.email === loggedInUser.email);
    console.log("Usuário encontrado:", user);

    const servicesContainer = document.querySelector(".servicos-informacoes");
    if (!servicesContainer) return; // Sai se o container não estiver na página

    if (user && user.servicos && user.servicos.length > 0) {
        user.servicos.forEach(servico => {
            const serviceWrapper = document.createElement("li");
            serviceWrapper.classList.add("servicos-campo");

            const tipoServicoLabel = document.createElement("label");
            tipoServicoLabel.classList.add("servicos-label");
            tipoServicoLabel.textContent = "Tipo de Serviço";
            const tipoServicoInput = document.createElement("input");
            tipoServicoInput.classList.add("servicos-input");
            tipoServicoInput.type = "text";
            tipoServicoInput.value = servico.tipo;
            tipoServicoInput.disabled = true;

            const descricaoServicoLabel = document.createElement("label");
            descricaoServicoLabel.classList.add("servicos-label");
            descricaoServicoLabel.textContent = "Descrição do Serviço";
            const descricaoServicoInput = document.createElement("input");
            descricaoServicoInput.classList.add("servicos-input");
            descricaoServicoInput.type = "text";
            descricaoServicoInput.value = servico.descricao;
            descricaoServicoInput.disabled = true;

            serviceWrapper.appendChild(tipoServicoLabel);
            serviceWrapper.appendChild(tipoServicoInput);
            serviceWrapper.appendChild(descricaoServicoLabel);
            serviceWrapper.appendChild(descricaoServicoInput);
            servicesContainer.appendChild(serviceWrapper);
        });
    } else {
        console.warn("Nenhum serviço encontrado para o usuário logado.");
        const noServicesMessage = document.createElement("p");
        noServicesMessage.textContent = "Você ainda não cadastrou nenhum serviço.";
        noServicesMessage.style.color = "gray";
        noServicesMessage.style.fontStyle = "italic";
        servicesContainer.appendChild(noServicesMessage);
    }
}

// --- SEÇÃO: PÁGINA INICIAL (script_index.js) ---

// Cria o modal de avaliação
function createRatingModal(userFullName) {
    const modal = document.createElement("div");
    modal.classList.add("rating-modal");
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
    document.body.appendChild(modal);

    modal.querySelector("#confirm-rating").addEventListener("click", async () => {
        const ratingInput = modal.querySelector("#rating-input");
        const ratingValue = parseInt(ratingInput.value, 10);
        if (isNaN(ratingValue) || ratingValue < 0 || ratingValue > 5) {
            alert("Por favor, insira um valor inteiro entre 0 e 5.");
        } else {
            await updateUserRatingWithAverage(userFullName, ratingValue);
            alert(`Obrigado por avaliar ${userFullName} com a nota ${ratingValue}!`);
            closeModal(modal);
        }
    });

    modal.querySelector("#cancel-rating").addEventListener("click", () => closeModal(modal));
}

// Atualiza a avaliação no Firestore
async function updateUserRatingWithAverage(userFullName, newRating) {
    try {
        const q = await db.collection("users").where("fullName", "==", userFullName).get();
        if (q.empty) {
            console.warn("Usuário não encontrado para avaliação:", userFullName);
            return;
        }
        const userDoc = q.docs[0];
        const user = userDoc.data();
        const userId = userDoc.id;

        const totalAvaliacoes = user.totalAvaliacoes || 0;
        const somaAvaliacoes = user.somaAvaliacoes || 0;

        const novaSoma = somaAvaliacoes + newRating;
        const novoTotal = totalAvaliacoes + 1;
        const novaMedia = Math.round(novaSoma / novoTotal);

        await db.collection("users").doc(userId).update({
            totalAvaliacoes: novoTotal,
            somaAvaliacoes: novaSoma,
            avaliacao: novaMedia
        });

        await loadUsersIntoFields();
    } catch (error) {
        console.error("Erro ao atualizar avaliação:", error);
    }
}

// Carrega todos os usuários na página inicial
async function loadUsersIntoFields(filter = "", singleUser = null) {
    const users = await getUsers();
    const servicesContainer = document.querySelector(".main-index");
    if (!servicesContainer) return; // Sai se não estiver na página certa

    const existingUserBlocks = servicesContainer.querySelectorAll(".user-block");
    existingUserBlocks.forEach(block => block.remove());

    if (users.length === 0) return;

    let filteredUsers;
    if (singleUser) {
        filteredUsers = users.filter(user =>
            user.fullName === singleUser &&
            user.servicos &&
            user.servicos.length > 0
        );
    } else {
        const searchText = filter.toLowerCase();
        filteredUsers = users.filter(user =>
            user.servicos &&
            user.servicos.length > 0 &&
           (user.fullName.toLowerCase().includes(searchText) || // Adiciona busca por nome
                user.servicos.some(servico => servico.descricao.toLowerCase().includes(searchText)))
        );
    }

    if (filteredUsers.length === 0) return;

    filteredUsers.forEach(user => {
        const foto = user.foto && user.foto.trim() !== "" ? user.foto : "https://firebasestorage.googleapis.com/v0/b/controle-de-ferias-45d25.firebasestorage.app/o/profile_images%2Ffoto-perfil-generica.jpg?alt=media&token=9baf84b2-375c-4197-8487-c12c4a4d5459";

        const userBlock = document.createElement("div");
        userBlock.classList.add("user-block");

        userBlock.addEventListener("click", () => {
            if (isUserLoggedIn()) {
                createRatingModal(user.fullName);
            } else {
                alert("Você precisa estar logado para avaliar este usuário.");
            }
        });

        const userImage = document.createElement("img");
        userImage.classList.add("user-image");
        userImage.src = foto;
        userImage.alt = `Foto de ${user.fullName}`;
        userBlock.appendChild(userImage);

        const userName = document.createElement("h3");
        userName.textContent = `${user.fullName}`;
        userBlock.appendChild(userName);

        const fieldList = document.createElement("ul");
        fieldList.classList.add("servicos-informacoes");

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

        const fields = [
            { label: "Telefone", value: user.telefone },
            { label: "Rede Social", value: user.instagram },
        ];

        fields.forEach(field => {
            if (field.value) {
                const fieldItem = document.createElement("li");
                fieldItem.classList.add("perfil-lista", "campo-contato");               
                fieldItem.innerHTML = `
                    <label class="perfil-label">${field.label}</label>
                                       <button class="perfil-input" type="button" disabled>${field.value}</button>
                `;
                fieldList.appendChild(fieldItem);
            }
        });

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

        userBlock.appendChild(fieldList);
        servicesContainer.appendChild(userBlock);
    });
}

// Apenas chama a função de salvar, para manter consistência
async function addNewUser(newUser) {
    await saveUsers(newUser);
}

// Popula o Firestore com dados iniciais (apenas uma vez)
async function seedUsers() {
    const usersSnapshot = await db.collection("users").limit(1).get();
    if (!usersSnapshot.empty) {
        console.log("Usuários já cadastrados. Seed não será executado.");
        return;
    }

    console.log("Cadastrando usuários 'seed' no Firestore...");
    
    // LINKS ATUALIZADOS AQUI:
    const users = [
       { fullName: "Marilene Garcia", foto: "https://firebasestorage.googleapis.com/v0/b/controle-de-ferias-45d25.firebasestorage.app/o/profile_images%2Fpessoa1.jpg?alt=media&token=79092929-8a78-40e7-944c-b0b5ac5f0cad", servicos: [{ descricao: "Faço bolo no pote, doces, bolto de aniversário e salgadinhos" }], telefone: "(31)994521567", instagram: "@Garcia_Mari", avaliacao: 5, totalAvaliacoes: 1, somaAvaliacoes: 5 },
       { fullName: "Marilene Ferreira", foto: "https://firebasestorage.googleapis.com/v0/b/controle-de-ferias-45d25.firebasestorage.app/o/profile_images%2Fprestador2.jpg?alt=media&token=a89c846e-c6e6-4009-81b4-977203343728", servicos: [{ descricao: "Instalações elétricas, manutenção de disjuntores, conserto de maquinas de lavar e geladeira. Atende emergências." }], telefone: "(31) 99888-7744", instagram: "@mari.eletricista", avaliacao: 4, totalAvaliacoes: 1, somaAvaliacoes: 4 },
       { fullName: "Elza Menezes", foto: "https://firebasestorage.googleapis.com/v0/b/controle-de-ferias-45d25.firebasestorage.app/o/profile_images%2Fprestador3.jpg?alt=media&token=e5a307f9-9149-49ec-8446-d710ef048a0a", servicos: [{ descricao: "Faço vestidos de casamento, reparação de roupas, vestidos para festas, roupas de bebê." }], telefone: "(31) 91234-5678", instagram: "@vovo.elza", avaliacao: 5, totalAvaliacoes: 1, somaAvaliacoes: 5 },
       { fullName: "Ana Beatriz Rocha", foto: "https://firebasestorage.googleapis.com/v0/b/controle-de-ferias-45d25.firebasestorage.app/o/profile_images%2Fprestador4.jpg?alt=media&token=a0eab1af-f3b7-44f4-b93b-1f9584bd9801", servicos: [{ descricao: "Pintura de interiores e fachadas, texturas decorativas, grafiato, esmalte e epóxi." }], telefone: "(31) 93456-1234", instagram: "@anapinturas", avaliacao: 3, totalAvaliacoes: 1, somaAvaliacoes: 3 },
       { fullName: "Thais Campos", foto: "https://firebasestorage.googleapis.com/v0/b/controle-de-ferias-45d25.firebasestorage.app/o/profile_images%2Fprestador5.jpg?alt=media&token=0222748c-b3e0-4009-93b2-d557df3a4482", servicos: [{ descricao: "Consultoria em direito civil e consumidor. Administradora profissional de condomínio" }], telefone: "(31) 99654-3210", instagram: "@thais.juridico", avaliacao: 2, totalAvaliacoes: 1, somaAvaliacoes: 2 },
       { fullName: "Ana Almeida", foto: "https://firebasestorage.googleapis.com/v0/b/controle-de-ferias-45d25.firebasestorage.app/o/profile_images%2Fprestador6.jpg?alt=media&token=fffa0907-59d3-4444-aec2-ab56be90cc75", servicos: [{ descricao: "Roupas lindas, baratinhas e cheias de estilo!" }], telefone: "(31) 98700-3344", instagram: "@AnaComEstilo", avaliacao: 5, totalAvaliacoes: 1, somaAvaliacoes: 5 },
       { fullName: "Creuza Campos", foto: "https://firebasestorage.googleapis.com/v0/b/controle-de-ferias-45d25.firebasestorage.app/o/profile_images%2Fprestador7.jpg?alt=media&token=c7dfbccd-4d31-4fe0-9c45-ad51bf0fdd60", servicos: [{ descricao: "Feito à mão, com carinho e um toque de amor em cada detalhe. Produzo peças artesanais únicas: chaveiros, mandalas e decorações cheias de boas energias." }], telefone: "(31) 99888-0022", instagram: "@creuzacomamor", avaliacao: 1, totalAvaliacoes: 1, somaAvaliacoes: 1 },
       { fullName: "Mariana Teixeira", foto: "https://firebasestorage.googleapis.com/v0/b/controle-de-ferias-45d25.firebasestorage.app/o/profile_images%2Fprestador8.jpg?alt=media&token=b5914835-c3eb-4e07-9d0c-c98679596399", servicos: [{ descricao: "Aqui é pé na estrada e chave inglesa na mão — atendimento 24h com qualidade e rapidez." }], telefone: "(31) 91000-0099", instagram: "@mari.mecanica", avaliacao: 4, totalAvaliacoes: 1, somaAvaliacoes: 4 },
       { fullName: "Sandra Moura", foto: "https://firebasestorage.googleapis.com/v0/b/controle-de-ferias-45d25.firebasestorage.app/o/profile_images%2Fprestador9.jpg?alt=media&token=9347c6e2-7711-47fe-9c2d-bfb50326a4d1", servicos: [{ descricao: "Aplicação de manta asfáltica, pintura impermeabilizante, tratamento de lajes e paredes úmidas." }], telefone: "(31) 99123-4567", instagram: "@imper.sandra", avaliacao: 3, totalAvaliacoes: 1, somaAvaliacoes: 3 },
    ];

    for (const user of users) {
        if (!user.foto || user.foto.trim() === "") {
            user.foto = "https://firebasestorage.googleapis.com/v0/b/controle-de-ferias-45d25.firebasestorage.app/o/profile_images%2Ffoto-perfil-generica.jpg?alt=media&token=9baf84b2-375c-4197-8487-c12c4a4d5459";
        }
        // Adiciona dados faltantes para o 'seed'
        user.email = `${user.fullName.split(' ')[0].toLowerCase()}@seed.com`;
        user.password = "123456";
        await addNewUser(user);
    }
    console.log("Usuários 'seed' cadastrados com sucesso!");
}


// --- INICIALIZADOR CENTRAL (DOMContentLoaded) ---
// Este 'listener' verifica em qual página estamos e executa
// apenas o código necessário para aquela página.

document.addEventListener("DOMContentLoaded", async () => {
    
    // 1. Lógica que roda em TODAS as páginas
    if (isUserLoggedIn()) {
        displayUserInitial();
    }

    // 2. Lógica da PÁGINA INICIAL (index.html ou maini.html)
    if (document.querySelector(".main-index") && document.getElementById("search")) {
        await seedUsers();
        await loadUsersIntoFields();

        const searchInput = document.getElementById("search");
        searchInput.addEventListener("input", (event) => {
            const filter = event.target.value;
            loadUsersIntoFields(filter);
        });
    }

    // 3. Lógica da PÁGINA DE PERFIL (ex: perfilUsuario.html, services.html)
    if (document.getElementById("profilePreview") && document.querySelector(".perfil-botao")) {
        await updateUserProfile(); // A verificação de login está DENTRO desta função

        const perfilButton = document.querySelector(".perfil-botao");
        perfilButton.addEventListener("click", async () => {
            const cpf = document.getElementById("cpfUsuario")?.value || "";
            const telefone = document.getElementById("telefone")?.value || "";
            const instagram = document.getElementById("instagram")?.value || "";
            await saveUserAdditionalInfo(cpf, telefone, instagram);
        });

        const servicosButton = document.querySelector(".servicos-botao");
        servicosButton.addEventListener("click", async () => {
            const tipoServico = document.getElementById("servico")?.value || "";
            const descricaoServico = document.getElementById("descricao")?.value || "";
            if (tipoServico && descricaoServico) {
                await saveUserService(tipoServico, descricaoServico);
            } else {
                alert("Por favor, preencha o tipo e a descrição do serviço.");
 S          }
        });
    }

    // 4. Lógica da PÁGINA "MEUS SERVIÇOS" (loadservices.html)
    // Verifica se tem o container de serviços, mas NÃO os botões de perfil (para diferenciar da pág. 3)
    if (document.querySelector(".servicos-informacoes") && !document.querySelector(".perfil-botao")) {
        await loadUserServices(); // A verificação de login está DENTRO desta função
    }

    // 5. Lógica da PÁGINA DE CADASTRO (signup.html)
    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
        signupForm.addEventListener("submit", handleSignupSubmit);

        // Pre-carregar imagem no formulário
        const fotoInputSignup = document.getElementById("foto");
        fotoInputSignup?.addEventListener("change", function (event) {
            const file = event.target.files[0];
            if (file) {
                getBase64(file, function (base64) {
                    const preview = document.getElementById("profilePreview");
                    preview.src = base64;
                    preview.style.display = "block";
                });
            }
        });

        // Botão customizado de arquivo
        const customFileButton = document.getElementById("customFileButton");
        const fileNameSpan = document.getElementById("fileName");
        const profilePreview = document.getElementById("profilePreview");

        customFileButton?.addEventListener("click", function () {
            fotoInputSignup.click();
        });

        fotoInputSignup?.addEventListener("change", function () {
            const file = fotoInputSignup.files[0];
            if (file) {
                fileNameSpan.textContent = file.name;
                const reader = new FileReader();
                reader.onload = function (e) {
                    profilePreview.src = e.target.result;
                };
                reader.readAsDataURL(file);
            } else {
                fileNameSpan.textContent = "Nenhum arquivo selecionado";
                profilePreview.src = "https://firebasestorage.googleapis.com/v0/b/controle-de-ferias-45d25.firebasestorage.app/o/profile_images%2Ffoto-perfil-generica.jpg?alt=media&token=9baf84b2-375c-4197-8487-c12c4a4d5459";
            }
        });
    }
    
    // 6. Lógica da PÁGINA DE LOGIN (login.html)
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", handleLoginSubmit);
    }

});