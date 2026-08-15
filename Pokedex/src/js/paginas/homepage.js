import apihome from "./api/api.js";

async function home(app) {
  app.innerHTML = `
    <main class="home-page">
      <header class="home-header">
        <img class="pokeball-logo" src="src/img/iconPokeball.png" alt="Pokébola">
        <h1>Pokédex</h1>
        <h2>Enciclopédia Pokémon Digital</h2>
        <p class="home-description">Pokédex digital completa com todos os dados, tipos,<br>evoluções e fraquezas dos Pokémon</p>
        <form class="search-form">
          <input class="search-input" type="search" placeholder="Digite o nome ou número do Pokémon" aria-label="Nome ou número do Pokémon">
          <button class="search-button" type="submit" aria-label="Buscar Pokémon"><img src="src/img/botao-busca.png" alt=""></button>
        </form>
      </header>
      <section class="output" aria-live="polite"></section>
    </main>`;

  const form = app.querySelector(".search-form");
  const input = app.querySelector(".search-input");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (input.value.trim()) location.hash = `#pokemon/${input.value.trim().toLowerCase()}`;
  });

  await apihome(app);
}

export default home;
