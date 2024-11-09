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
            </div>`;
            filterSection.appendChild(backButton);
        } else if (this.isAdminView && !isAdmin) {
            window.location.href = 'order-history.html';
        }

        $('#sort').on('change', () => {
            this.currentPage = 1;
            this.fetchOrders();
        });

        $('#limit').on('change', () => {
            this.currentPage = 1;
            this.fetchOrders();
        });

        $('#prev-page').on('click', () => {
            if (this.currentPage > 1) {
                this.currentPage -= 1;
                this.fetchOrders();
            }
        });

        $('#next-page').on('click', () => {
            if (this.currentPage < this.totalPages) {
                this.currentPage += 1;
                this.fetchOrders();
            }
        });
    }

    fetchOrders() {
        const token = getCookie('jwt');
        const sort = $('#sort').val();
        const limit = $('#limit').val();

        const queryParams = {
            page: this.currentPage,
            limit: limit,
            sort: sort,
            status: 'delivered'
        };

        if (this.isAdminView && this.username) {
            queryParams.buyerUsername = this.username;
        }

        $.ajax({
            url: `${this.API_BASE_URL}/orders`,
            method: 'GET',
            headers: {
                'x-auth-token': token,
                'Content-Type': 'application/json'
            },
            data: queryParams,
            success: (data) => {
                this.totalPages = data.totalPages;
                this.displayOrders(data);
                this.updatePaginationUI();
            },
            error: (jqXHR) => {
                console.error('Error fetching orders:', jqXHR);
                $('#orders-container').html('<div class="alert alert-danger">Error loading orders. Please try again later.</div>');
            }
        });
    }

    displayOrders(data) {
        const container = $('#orders-container');
        container.empty();

        if (!data.orders || data.orders.length === 0) {
            container.html('<div class="alert alert-info">No completed orders found.</div>');
            return;
        }

        data.orders.forEach(order => {
            const orderCard = this.createOrderCard(order);
            container.append(orderCard);
        });
    }

    createOrderCard(order) {
        const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const orderCardHTML = `
        <div class="order-card">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <h5>Order #${order._id.slice(-8).toUpperCase()}</h5>
                    <p class="text-muted mb-2">Ordered on: ${orderDate}</p>
                </div>
                <span class="delivery-badge">Delivered</span>
            </div>
            <hr>
            <div class="order-items">
                ${order.plants.map(item => {
            const plantName = item.plant ? item.plant.name : 'Unknown Plant'; // Fallback for null plant
            const plantTotal = item.plant ? (item.price * item.quantity).toFixed(2) : 'N/A';
            return `
                        <div class="d-flex justify-content-between mb-2">
                            <span>${plantName} × ${item.quantity}</span>
                            <span>$${plantTotal}</span>
                        </div>
                    `;
        }).join('')}
            </div>
            <hr>
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <strong>Total Amount:</strong>
                    <strong>$${order.totalAmount.toFixed(2)}</strong>
                </div>
            </div>
        </div>`;
        return $(orderCardHTML);
    }


    updatePaginationUI() {
        $('#page-info').text(`Page ${this.currentPage} of ${this.totalPages}`);
        $('#prev-page').prop('disabled', this.currentPage <= 1);
        $('#next-page').prop('disabled', this.currentPage >= this.totalPages);
    }
}

// Initialize order history when the DOM is loaded
$(document).ready(() => {
    new OrderHistory();
});
