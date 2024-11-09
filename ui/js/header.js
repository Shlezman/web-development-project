class Header {
    constructor(activeLink = '') {
        this.activeLink = activeLink;
        this.user = getCookie('username');
        this.isAdmin = getCookie('isAdmin');
    }

    renderAuthButton() {
        if (this.user !== undefined) {
            let adminPanelLink = '';
            if (this.isAdmin) {
                adminPanelLink = `<li><a class="dropdown-item" href="adminPanel.html">Admin Panel</a></li>`;
            }
            return `
                <div class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        ${this.user}
                    </a>
                    <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                        ${adminPanelLink}
                        <li><a class="dropdown-item" href="#" onclick="logout()">Sign-Out</a></li>
                    </ul>
                </div>
                <li class="nav-item">
                <a class="nav-link" href="seller.html">Seller</a>
                </li>
            `;
        } else {
            return `
                <li class="nav-item">
                    <a class="nav-link" href="login.html">Login</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="register.html">Register</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="orderHistory.html">Order history</a>
                </li>
            `;
        }
    }

    render() {
        return `
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <div class="container">
                <a class="navbar-brand" href="index.html"><img src ="css/logo.png" alt="Plants Store Logo" width="50" height="50" class="me-2">Plants Store</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                    aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto">
                        <li class="nav-item">
                            <a class="nav-link ${this.activeLink === 'cart' ? 'active' : ''}" href="cart.html">Cart</a>
                        </li>
                        ${this.renderAuthButton()}
                    </ul>
                </div>
            </div>
        </nav>
        `;
    }
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function renderHeader(activePage) {
    const headerContainer = document.getElementById('header');
    if (headerContainer) {
        const header = new Header(activePage);
        headerContainer.innerHTML = header.render();
    }
}

function logout() {
    document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'isAdmin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.reload();
}

document.addEventListener('DOMContentLoaded', () => {
    renderHeader();
});