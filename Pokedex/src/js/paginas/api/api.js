const TYPE_NAMES = {
  normal: "Normal", fire: "Fogo", water: "Água", electric: "Elétrico",
  grass: "Grama", ice: "Gelo", fighting: "Lutador", poison: "Veneno",
  ground: "Terrestre", flying: "Voador", psychic: "Psíquico", bug: "Inseto",
  rock: "Pedra", ghost: "Fantasma", dragon: "Dragão", dark: "Sombrio",
  steel: "Aço", fairy: "Fada"
};

async function apihome(app) {
  const output = app.querySelector(".output");
  output.innerHTML = "<p class='loading'>Carregando Pokémon...</p>";

  try {
    const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=10000&offset=0");
    const { results } = await response.json();
    const pokemons = await Promise.all(results.map(async ({ url }) => {
      const response = await fetch(url);
      return response.json();
    }));

    output.innerHTML = pokemons.map((pokemon) => `
      <a class="pokemon-card" href="#pokemon/${pokemon.id}" data-type="${pokemon.types[0].type.name}">
        <span class="pokemon-number">#${String(pokemon.id).padStart(4, "0")}</span>
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <h2>${pokemon.name}</h2>
        <div class="type-list">
          ${pokemon.types.map(({ type }) => `<span class="type-badge tipo-${type.name}">${TYPE_NAMES[type.name] || type.name}</span>`).join("")}
        </div>
      </a>`).join("");
  } catch {
    output.innerHTML = "<p class='error-message'>Não foi possível carregar a PokéAPI. Tente novamente.</p>";
  }
}

export default apihome;
