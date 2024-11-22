let currentPage = 1;
let allCharacters = []; // Armazena todos os personagens
let filteredCharacters = []; // Armazena personagens filtrados
let totalEpisodes = 0;
let totalLocations = 0;

document.addEventListener("DOMContentLoaded", async () => {
    const characterGrid = document.getElementById("character-grid");
    const prevButton = document.getElementById("prev-button");
    const nextButton = document.getElementById("next-button");
    const modalBody = document.getElementById("modal-body");
    const searchInput = document.getElementById("search");
    const searchButton = document.getElementById("search-button");

    async function fetchEpisodeDetails(url) {
        try {
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar detalhes do episódio:", error);
            return null;
        }
    }
    
    // Função para renderizar os personagens
    async function renderCharacters(page, name = "") {
        let charactersToDisplay = [];
    
        // Filtra os personagens com base no nome, se houver busca
        if (name !== "") {
            charactersToDisplay = filteredCharacters.filter(character =>
                character.name.toLowerCase().includes(name.toLowerCase())
            );
        } else {
            charactersToDisplay = allCharacters;
        }
    
        // Limita a exibição a 6 personagens por página (2 linhas de 3 cards)
        const startIndex = (page - 1) * 6;
        const endIndex = startIndex + 6;
        const charactersForPage = charactersToDisplay.slice(startIndex, endIndex);
    
        // Limpa os personagens anteriores
        characterGrid.innerHTML = "";
    
        // Função para obter a classe da bolinha de status
        function getStatusClass(status) {
            switch (status.toLowerCase()) {
                case 'alive':
                    return 'status-alive';
                case 'dead':
                    return 'status-dead';
                default:
                    return 'status-unknown';
            }
        }
    
        let rowHTML = "";
        for (let i = 0; i < charactersForPage.length; i++) {
            const character = charactersForPage[i];
            const statusClass = getStatusClass(character.status);
            const lastEpisodeUrl = character.episode[character.episode.length - 1];
            const episodeDetails = await fetchEpisodeDetails(lastEpisodeUrl);
            const episodeName = episodeDetails ? episodeDetails.name : "Desconhecido";

            const card = `
                <div class="col-12 col-md-4 div-cards">
                    <div class="card grid row-gap-5">
                        <img src="${character.image}" class="card-img-top" alt="${character.name}">
                        <div class="card-body">
                            <h1 class="card-title">
                                <span ></span>${character.name}
                            </h1>
                            <p class="card-text">
                                <strong class="status-indicator ${statusClass}"></strong> ${character.status}
                                <strong> - </strong> ${character.species} <br>
                                <strong id="location">Última Localização:</strong> <br> ${character.location.name} <br>
                                <strong id="last-ep">Último Episódio:</strong> <br> ${episodeName} (${lastEpisodeUrl.split('/').pop()})
                            </p>
                            <button class="btn btn-primary" data-id="${character.id}" data-bs-toggle="modal" data-bs-target="#characterModal">
                                Ver detalhes
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Adiciona o card na linha
            rowHTML += card;

            // Quando chegar a 3 cards, fecha a row e cria uma nova
            if ((i + 1) % 3 === 0 || i === charactersForPage.length - 1) {
                characterGrid.innerHTML += `<div class="row">${rowHTML}</div>`; // Adiciona a row completa
                rowHTML = ""; // Reseta a variável para a próxima linha
            }
        }

    
        // Atualiza os botões de paginação
        prevButton.disabled = currentPage === 1;
        nextButton.disabled = endIndex >= charactersToDisplay.length;
    
        // Adiciona os listeners para os botões do modal
        document.querySelectorAll('[data-bs-target="#characterModal"]').forEach((button) => {
            button.addEventListener("click", async () => {
                const id = button.getAttribute("data-id");
                const details = await fetchCharacterDetails(id);
                modalBody.innerHTML = `
                    <img src="${details.image}" class="img-fluid mb-3" alt="${details.name}">
                    <h5>${details.name}</h5>
                    <p><strong>Status:</strong> ${details.status}</p>
                    <p><strong>Espécie:</strong> ${details.species}</p>
                    <p><strong>Localização:</strong> ${details.location.name}</p>
                `;
            });
        });
    }

    // Função para buscar todos os personagens da API
    async function fetchAllCharacters() {
        let page = 1;
        let allData = [];

        while (true) {
            const data = await fetchCharacters(page);

            if (!data || data.results.length === 0) break; // Se não houver mais personagens, sai do loop

            allData = [...allData, ...data.results]; // Adiciona os personagens ao array global
            page++;
        }

        allCharacters = allData; // Armazena todos os personagens
        filteredCharacters = allCharacters; // Inicializa o array filtrado com todos os personagens
        renderCharacters(currentPage, searchInput.value); // Renderiza os personagens na primeira página
    }

    // Função para navegação entre páginas
    prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderCharacters(currentPage, searchInput.value); // Re-renderiza com a página anterior
        }
    });

    nextButton.addEventListener("click", () => {
        currentPage++;
        renderCharacters(currentPage, searchInput.value); // Re-renderiza com a próxima página
    });

    // Função de busca
    searchButton.addEventListener("click", () => {
        currentPage = 1; // Reseta para a primeira página
        const name = searchInput.value;
        filteredCharacters = allCharacters.filter(character => character.name.toLowerCase().includes(name.toLowerCase())); // Filtra os personagens
        renderCharacters(currentPage, name); // Re-renderiza os personagens filtrados
    });

    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            searchButton.click(); // Dispara a busca ao pressionar Enter
        }
    });

    fetchAllCharacters(); // Carrega todos os personagens ao carregar a página
});


