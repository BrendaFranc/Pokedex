import home from "./paginas/homepage.js";
import infoPokemon from "./paginas/api/infoPokemon.js";

const app = document.getElementById("app");

async function render() {
  const [route, id] = location.hash.replace("#", "").split("/");

  if (route === "pokemon" && id) {
    await infoPokemon(app, id);
    return;
  }

  await home(app);
}

window.addEventListener("hashchange", render);
render();
