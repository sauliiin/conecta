/* --- ------------------------------------ --- */
/* --- SCRIPT PARA O SITE CONECTA MULHER --- */
/* --- ------------------------------------ --- */

// --- EFEITO 1: MUDAR A COR DO HEADER AO ROLAR A PÁGINA ---
const header = document.querySelector('.header-fixo');

window.addEventListener('scroll', () => {
    if (!header.classList.contains('video-ended-state')) {
        if (window.scrollY > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
});

// --- EFEITO 2: ANIMAÇÃO DE REVELAÇÃO DOS ELEMENTOS AO ROLAR ---
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
revealSections();


// --- EFEITO 3: LÓGICA PARA A SEQUÊNCIA DE ABERTURA COM VÍDEO ---
const videoHero = document.querySelector('#video-hero');
const h1Inicial = document.querySelector('#h1-inicial');
const h1Middle = document.querySelector('#h1-middle');
const h1MiddleEnd = document.querySelector('#h1-middleEnd');
const h1Final = document.querySelector('#h1-final');

function iniciarSequenciaHero() {
    // Aguarda 2 segundos
    setTimeout(() => {
        // Esconde o texto inicial
        h1Inicial.classList.add('hidden');
        
        // Ouve quando a transição do texto inicial acabar
        h1Inicial.addEventListener('transitionend', () => {
            // Mostra e inicia o vídeo
            videoHero.style.opacity = 1;
            videoHero.play();
        }, { once: true });

    }, 1000); // 2 segundos

    // NOVO: Monitora o tempo de reprodução do vídeo
    videoHero.addEventListener('timeupdate', () => {
        const time = videoHero.currentTime;

        // Mostra a segunda frase entre 4s e 9s
        if (time >= 2 && time < 6) {
            h1Middle.classList.remove('hidden');
        } else {
            h1Middle.classList.add('hidden');
        }

        // Mostra a terceira frase entre 10s e 15s
        if (time >= 8 && time < 12) {
            h1MiddleEnd.classList.remove('hidden');
        } else {
            h1MiddleEnd.classList.add('hidden');
        }
    });

    // Ouve quando o vídeo terminar
    videoHero.addEventListener('ended', () => {
        // Esconde o vídeo
        videoHero.style.opacity = 0;
        
        // Mostra o texto final
        h1Final.classList.remove('hidden');

        // Adiciona as classes de estado final
        const secaoTopo = document.querySelector('.secao-topo');
        header.classList.add('video-ended-state');
        header.classList.remove('scrolled'); 
        secaoTopo.classList.add('video-ended-state');
    });
}

// Inicia a sequência!
iniciarSequenciaHero();