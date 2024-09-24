class Header {
    constructor(activeLink = '') {
        this.activeLink = activeLink;
    }

    render() {
        return `
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container">
            <a class="navbar-brand" href="#">My E-Commerce Store</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <form class="d-flex" id="search-form">
                <input class="form-control me-2" type="search" placeholder="Search products" aria-label="Search"
                    id="search-input">
                <button class="btn btn-outline-success" type="submit">Search</button>
            </form>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="index.html">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link active" href="cart.html">Cart (<span id="cart-count">0</span>)</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

        `;
    }
}


function renderHeader(activePage) {
    const headerContainer = document.getElementById('header');
    if (headerContainer) {
        const header = new Header(activePage);
        headerContainer.innerHTML = header.render();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderHeader()
});