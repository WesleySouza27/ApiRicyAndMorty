const API_BASE_URL = "https://rickandmortyapi.com/api/character";

/**
 * Função para buscar personagens com base na página atual.
 * @param {number} page - Número da página para buscar personagens.
 * @param {string} name - Nome do personagem para buscar.
 * @returns {Promise<Object>} - Dados retornados pela API.
 */
async function fetchCharacters(page = 1, name = "") {
    try {
        const response = await axios.get(`${API_BASE_URL}`, {
            params: {
                page: page,
                name: name,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar personagens:", error);
        return null;
    }
}

/**
 * Função para buscar os detalhes de um personagem.
 * @param {number} id - ID do personagem.
 * @returns {Promise<Object>} - Dados do personagem retornados pela API.
 */
async function fetchCharacterDetails(id) {
    try {
        const response = await axios.get(`${API_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar detalhes do personagem:", error);
        return null;
    }
}
