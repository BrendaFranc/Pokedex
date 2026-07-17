function navbar() {
    const navbar = document.getElementById('navbar');
    navbar.innerHTML = `
        <nav class="bem-navbar">
            <a href="#" class="bem-navbar__brand">Pokédex</a>
            <ul class="bem-navbar__menu">
                <li class="bem-navbar__item"><a href="#" class="bem-navbar__link">Início</a></li>
                <li class="bem-navbar__item"><a href="#" class="bem-navbar__link">Pokémons</a></li>
                <li class="bem-navbar__item"><a href="#" class="bem-navbar__link">Tipos</a></li>
                <li class="bem-navbar__item"><a href="#" class="bem-navbar__link">Sobre</a></li>
            </ul>
        </nav>
    `;
}

// CHAMANDO A FUNÇÃO para executar
navbar();