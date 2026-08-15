const STAT_NAMES = {
  hp: "HP", attack: "ATK", defense: "DEF",
  "special-attack": "SP. ATK", "special-defense": "SP. DEF", speed: "VEL"
};

const TYPE_NAMES = {
  normal: "Normal", fire: "Fogo", water: "Água", electric: "Elétrico",
  grass: "Grama", ice: "Gelo", fighting: "Lutador", poison: "Veneno",
  ground: "Terrestre", flying: "Voador", psychic: "Psíquico", bug: "Inseto",
  rock: "Pedra", ghost: "Fantasma", dragon: "Dragão", dark: "Sombrio",
  steel: "Aço", fairy: "Fada"
};

const GROWTH_NAMES = {
  slow: "Lento", medium: "Médio", "medium-slow": "Médio lento",
  "medium-fast": "Médio rápido", fast: "Rápido", fluctuating: "Instável", erratic: "Errático"
};

function getId(url) {
  return url.split("/").filter(Boolean).pop();
}

function flattenChain(node) {
  const detail = node.evolution_details[0];
  const condition = detail?.min_level ? `Nv. ${detail.min_level}` : detail?.item?.name?.replaceAll("-", " ") || "";
  const step = { name: node.species.name, id: getId(node.species.url), condition };
  return node.evolves_to.length
    ? node.evolves_to.flatMap((child) => flattenChain(child).map((chain) => [step, ...chain]))
    : [[step]];
}

function cleanDescription(text) {
  return text.replace(/[\f\n]/g, " ").replace(/\s+/g, " ").trim();
}

async function getPortugueseDescription(entries) {
  const portuguese = entries.find((item) => item.language.name === "pt-BR")
    || entries.find((item) => item.language.name === "pt");

  if (portuguese) return cleanDescription(portuguese.flavor_text);

  const english = entries.find((item) => item.language.name === "en");
  if (!english) return "Sem descrição disponível.";

  const sourceText = cleanDescription(english.flavor_text);

  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt-BR&dt=t&q=${encodeURIComponent(sourceText)}`
    );

    if (!response.ok) throw new Error("Falha ao traduzir");

    const translation = await response.json();
    return translation[0].map((part) => part[0]).join("");
  } catch {
    return sourceText;
  }
}

async function infoPokemon(app, query) {
  app.innerHTML = "<main class='info-page'><p class='loading'>Carregando informações...</p></main>";

  try {
    const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
    if (!pokemonResponse.ok) throw new Error("not found");
    const pokemon = await pokemonResponse.json();
    const species = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}`).then((response) => response.json());
    const evolutionData = await fetch(species.evolution_chain.url).then((response) => response.json());
    const chain = flattenChain(evolutionData.chain)[0];
    const types = pokemon.types.map(({ type }) => type.name);
    const typeData = await Promise.all(types.map((type) => fetch(`https://pokeapi.co/api/v2/type/${type}`).then((response) => response.json())));
    const weaknesses = [...new Set(typeData.flatMap((data) => data.damage_relations.double_damage_from.map((type) => type.name)))];
    const artwork = pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default;
    const description = await getPortugueseDescription(species.flavor_text_entries);

    app.innerHTML = `
      <main class="info-page" data-type="${types[0]}">
        <nav class="info-nav"><a href="#inicio">← Voltar para Pokédex</a><strong>◉ PokéDex</strong></nav>
        <section class="pokemon-info">
          <div class="pokemon-art"><span>#${String(pokemon.id).padStart(4, "0")}</span><img src="${artwork}" alt="${pokemon.name}"></div>
          <div class="pokemon-summary">
            <p class="pokemon-category">${species.genera.find((item) => item.language.name === "pt-BR")?.genus || species.genera.find((item) => item.language.name === "pt")?.genus || "Pokémon"}</p>
            <h1>${pokemon.name}</h1>
            <div class="type-list">${types.map((type) => `<span class="type-badge tipo-${type}">${TYPE_NAMES[type] || type}</span>`).join("")}</div>
            <p class="description">${description}</p>
            <h3>Fraquezas</h3>
            <div class="type-list">${weaknesses.length ? weaknesses.map((type) => `<span class="type-badge tipo-${type}">${TYPE_NAMES[type] || type} ×2</span>`).join("") : "<span>Sem fraquezas</span>"}</div>
          </div>
        </section>
        <section class="info-grid">
          <article class="info-panel"><h2>Perfil</h2><div class="profile-data"><div><span>Altura</span><strong>${(pokemon.height / 10).toFixed(1)} m</strong></div><div><span>Peso</span><strong>${(pokemon.weight / 10).toFixed(1)} kg</strong></div><div><span>Crescimento</span><strong>${GROWTH_NAMES[species.growth_rate.name] || species.growth_rate.name}</strong></div></div><p>Habilidades</p><div class="ability-list">${pokemon.abilities.map((item) => `<span class="ability ${item.is_hidden ? "hidden-ability" : ""}">${item.ability.name.replaceAll("-", " ")}${item.is_hidden ? " (oculta)" : ""}</span>`).join("")}</div></article>
          <article class="info-panel"><h2>Estatísticas base</h2>${pokemon.stats.map((item) => `<div class="stat-row stat-${item.stat.name}"><span>${STAT_NAMES[item.stat.name]}</span><b>${item.base_stat}</b><div><i style="width:${Math.min(item.base_stat / 2.55, 100)}%"></i></div></div>`).join("")}<footer>Total <b>${pokemon.stats.reduce((total, item) => total + item.base_stat, 0)}</b></footer></article>
          <article class="info-panel evolution-panel"><h2>Cadeia evolutiva</h2><div class="evolution-chain">${chain.map((step, index) => `${index ? `<span class="evolution-arrow">→<small>${step.condition}</small></span>` : ""}<a href="#pokemon/${step.id}" class="evolution-step ${step.id == pokemon.id ? "current" : ""}"><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${step.id}.png" alt="${step.name}"><b>${step.name}</b></a>`).join("")}</div></article>
        </section>
      </main>`;
  } catch {
    app.innerHTML = `<main class="info-page"><p class="error-message">Pokémon não encontrado. <a href="#inicio">Voltar para a Pokédex</a></p></main>`;
  }
}

export default infoPokemon;
