function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

class OrderHistory {
    constructor() {
        this.currentPage = 1;
        this.totalPages = 1;
        this.API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:3000/api`;
        this.isAdminView = new URLSearchParams(window.location.search).get('adminView') === 'true';
        this.username = new URLSearchParams(window.location.search).get('username');

        this.initializeUI();
        this.fetchOrders();
    }

    initializeUI() {
        const isAdmin = getCookie('isAdmin') === 'true';

        if (this.isAdminView && isAdmin && this.username) {
            document.querySelector('h1').textContent = `Order History - ${this.username}`;
            const filterSection = document.querySelector('.filter-section');
            const backButton = document.createElement('div');
            backButton.className = 'row mt-3';
            backButton.innerHTML = `
            <div class="col">
                <button class="btn btn-primary" onclick="window.location.href='adminPanel.html'">
                    Back to Admin Panel
                </button>
            </div>
        `;
            filterSection.appendChild(backButton);
        } else if (this.isAdminView && !isAdmin) {
            window.location.href = 'order-history.html';
        }

        // Event listener for sort dropdown
        document.getElementById('sort').addEventListener('change', () => {
            this.currentPage = 1;
            this.fetchOrders();
        });

        // Event listener for limit dropdown
        document.getElementById('limit').addEventListener('change', () => {
            this.currentPage = 1;
            this.fetchOrders();
        });

        // Event listener for previous button
        document.getElementById('prev-page').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage -= 1;
                this.fetchOrders();
            }
        });

        // Event listener for next button
        document.getElementById('next-page').addEventListener('click', () => {
            if (this.currentPage < this.totalPages) {
                this.currentPage += 1;
                this.fetchOrders();
            }
        });
    }

    async fetchOrders() {
        const token = getCookie('jwt');
        const sort = document.getElementById('sort').value;
        const limit = document.getElementById('limit').value;

        const queryParams = new URLSearchParams({
            page: this.currentPage,  // Ensure currentPage is used here
            limit,
            sort,
            status: 'delivered'
        });

        if (this.isAdminView && this.username) {
            queryParams.append('buyerUsername', this.username);
        }

        try {
            const response = await fetch(`${this.API_BASE_URL}/orders?${queryParams}`, {
                method: 'GET',
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }

            const data = await response.json();
            this.totalPages = data.totalPages;
            this.displayOrders(data);
            this.updatePaginationUI();
        } catch (error) {
            console.error('Error fetching orders:', error);
            document.getElementById('orders-container').innerHTML =
                '<div class="alert alert-danger">Error loading orders. Please try again later.</div>';
        }
    }


    displayOrders(data) {
        const container = document.getElementById('orders-container');
        container.innerHTML = '';

        if (!data.orders || data.orders.length === 0) {
            container.innerHTML = '<div class="alert alert-info">No completed orders found.</div>';
            return;
        }

        data.orders.forEach(order => {
            const orderCard = this.createOrderCard(order);
            container.appendChild(orderCard);
        });
    }

    createOrderCard(order) {
        const card = document.createElement('div');
        card.className = 'order-card';

        const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const deliveryDate = new Date(order.deliveryDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        card.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <h5>Order #${order._id.slice(-8).toUpperCase()}</h5>
                    <p class="text-muted mb-2">Ordered on: ${orderDate}</p>
                </div>
                <span class="delivery-badge">Delivered</span>
            </div>
            <hr>
            <div class="order-items">
                ${order.plants.map(item => `
                    <div class="d-flex justify-content-between mb-2">
                        <span>${item.plant.name} × ${item.quantity}</span>
                        <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            <hr>
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <strong>Total Amount:</strong>
                    <strong>$${order.totalAmount.toFixed(2)}</strong>
                </div>
            </div>
        `;

        return card;
    }

    updatePaginationUI() {
        const pageInfo = document.getElementById('page-info');
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');

        pageInfo.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
        prevBtn.disabled = this.currentPage <= 1;
        nextBtn.disabled = this.currentPage >= this.totalPages;
    }

}

// Initialize order history when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new OrderHistory();
});