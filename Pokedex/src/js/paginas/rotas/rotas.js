import home from "../homepage.js";
import resulPesquisa from "../api/infoPokemon.js";

const roteador = [
  {
    url: "#inicio",
    label: "Inicial",
    pagina: home,
  },
  {
    url: "#pesquisa",
    label: "perquisado",
    pagina: resulPesquisa
  }
];

export default roteador;