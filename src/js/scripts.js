let currentPage = 1
let allCharacters = []
let filteredCharacters = []

document.addEventListener("DOMContentLoaded", async () => {
    const characterGrid = document.getElementById("character-grid")
    const prevButton = document.getElementById("prev-button")
    const nextButton = document.getElementById("next-button")
    const modalBody = document.getElementById("modal-body")
    const searchInput = document.getElementById("search")
    const searchButton = document.getElementById("search-button")

    async function fetchEpisodeDetails(url) {
        try {
            const response = await axios.get(url)
            return response.data
        } catch (error) {
            console.error("Erro ao buscar detalhes do episódio:", error)
            return null
        }
    }
    
    async function renderCharacters(page, name = "") {
        let charactersToDisplay = []
    
        if (name !== "") {
            charactersToDisplay = filteredCharacters.filter(character =>
                character.name.toLowerCase().includes(name.toLowerCase())
            );
        } else {
            charactersToDisplay = allCharacters;
        }
    
        const startIndex = (page - 1) * 6
        const endIndex = startIndex + 6
        const charactersForPage = charactersToDisplay.slice(startIndex, endIndex)
    
        characterGrid.innerHTML = ""
    
        function getStatusClass(status) {
            switch (status.toLowerCase()) {
                case 'alive':
                    return 'status-alive'
                case 'dead':
                    return 'status-dead'
                default:
                    return 'status-unknown'
            }
        }
    
        let rowHTML = ""
        for (let i = 0; i < charactersForPage.length; i++) {
            const character = charactersForPage[i]
            const statusClass = getStatusClass(character.status)
            const lastEpisodeUrl = character.episode[character.episode.length - 1]
            const episodeDetails = await fetchEpisodeDetails(lastEpisodeUrl)
            const episodeName = episodeDetails ? episodeDetails.name : "Desconhecido"

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
            `

            rowHTML += card;

            if ((i + 1) % 3 === 0 || i === charactersForPage.length - 1) {
                characterGrid.innerHTML += `<div class="row">${rowHTML}</div>`
                rowHTML = ""
            }
        }

        prevButton.disabled = currentPage === 1;
        nextButton.disabled = endIndex >= charactersToDisplay.length
    
        document.querySelectorAll('[data-bs-target="#characterModal"]').forEach((button) => {
            button.addEventListener("click", async () => {
                const id = button.getAttribute("data-id")
                const details = await fetchCharacterDetails(id)
                modalBody.innerHTML = `
                    <img src="${details.image}" class="img-fluid mb-3" alt="${details.name}">
                    <h5>${details.name}</h5>
                    <p><strong>Status:</strong> ${details.status}</p>
                    <p><strong>Espécie:</strong> ${details.species}</p>
                    <p><strong>Localização:</strong> ${details.location.name}</p>
                `
            })
        })
    }

    async function fetchAllCharacters() {
        let page = 1
        let allData = []

        while (true) {
            const data = await fetchCharacters(page)

            if (!data || data.results.length === 0) break

            allData = [...allData, ...data.results]
            page++
        }

        allCharacters = allData
        filteredCharacters = allCharacters
        renderCharacters(currentPage, searchInput.value)
    }

    prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderCharacters(currentPage, searchInput.value)
        }
    })

    nextButton.addEventListener("click", () => {
        currentPage++;
        renderCharacters(currentPage, searchInput.value)
    })

    searchButton.addEventListener("click", () => {
        currentPage = 1
        const name = searchInput.value
        filteredCharacters = allCharacters.filter(character => character.name.toLowerCase().includes(name.toLowerCase()))
        renderCharacters(currentPage, name)
    })

    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            searchButton.click()
        }
    })

    fetchAllCharacters()
})


