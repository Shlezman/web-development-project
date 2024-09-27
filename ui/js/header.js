class Header {
    constructor(activeLink = '') {
        this.activeLink = activeLink;
        this.user = this.getUser();
    }

    getUser() {
        const token = localStorage.userToken;
        if (token) {
            try {
                return token;
            } catch (e) {
                console.error('Error parsing user token:', e);
                return null;
            }
        }
        return null;
    }

    renderAuthButton() {
        if (this.user) {
            return `
                <div class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        ${this.user.name}
                    </a>
                    <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                        <li><a class="dropdown-item" href="#" onclick="logout()">Sign-Out</a></li>
                    </ul>
                </div>
            `;
        } else {
            return `
                <li class="nav-item">
                    <a class="nav-link" href="login.html">Login</a>
                </li>
            `;
        }
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
                            <a class="nav-link ${this.activeLink === 'home' ? 'active' : ''}" href="index.html">Home</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link ${this.activeLink === 'cart' ? 'active' : ''}" href="cart.html">Cart (<span id="cart-count">0</span>)</a>
                        </li>
                        ${this.renderAuthButton()}
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

function logout() {
    localStorage.removeItem('userToken');
    window.location.reload();
}

document.addEventListener('DOMContentLoaded', () => {
    renderHeader();
});