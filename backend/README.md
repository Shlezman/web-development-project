# API Documentation

## Authentication
All routes marked with [Auth] require a valid JWT token in the Authorization header.
All routes marked with [Admin] require the user to have admin privileges.

## Users

### Register User
- POST /api/users/register
- Public access
- Body: { username, email, password }
- Validates: username (required), email (valid format), password (min 6 characters)

### Login User
- POST /api/users/login
- Public access
- Body: { email, password }
- Returns: JWT token

### Make User Admin [Auth] [Admin]
- PUT /api/users/make-admin/:userId
- Admin only
- Updates a user to have admin privileges

### Delete User [Auth] [Admin]
- DELETE /api/users/:userId
- Admin only
- Deletes a user (admin cannot delete themselves)

### Get All Users [Auth] [Admin]
- GET /api/users/all
- Admin only
- Retrieves all users (excluding passwords)

### Search Users [Auth] [Admin]
- GET /api/users/search
- Admin only
- Query params: username, email, isAdmin, minCredit, maxCredit, sort, page, limit
- Supports pagination and sorting

## Plants

### Get Plants [Auth]
- GET /api/plants
- For regular users: Returns only their own plants
- For admins: Returns all plants

### Create Plant [Auth]
- POST /api/plants
- Body: { name, description, price, category, originCountry, indoor }
- Validates: name, description, price (positive number), category

### Delete Plant [Auth]
- DELETE /api/plants/:plantId
- User can delete their own plants
- Admins can delete any plant

### Update Plant Price [Auth]
- PATCH /api/plants/:plantId/price
- Body: { price }
- User can update their own plants
- Admins can update any plant

### Search Plants
- GET /api/plants/search
- Public access
- Query params: q (search term), category, minPrice, maxPrice, sort, page, limit
- Supports pagination and sorting

## reviews

### add review to plant [Auth]
- POST /api/plants/:plantId/reviews
- User can add one review per plant

### GET all plant reviews
- GET /api/plants/:plantId/reviews
- All plant reviews
- Public access

### GET top rated plants
- GET /api/plants/top-rated
- Public access

## Orders

### Create Order [Auth]
- POST /api/orders
- Body:
  {
  "plants": [{ "plant": "plantId", "quantity": 1 }]
  }
- Validates:
    - `plants`: Array of at least one object
    - `plant`: Must be a valid MongoDB ID
    - `quantity`: Positive integer
- Description:
  This route creates a new order. The total amount is calculated based on the price of the plants.

### Get Orders [Auth]
- GET /api/orders
- Query Params:
    - `status` (optional): 'cart', 'pending', 'paid', 'shipped', 'delivered'
    - `minAmount` (optional): Minimum order total amount
    - `maxAmount` (optional): Maximum order total amount
    - `buyerUsername` (optional, Admin only): Filter by the buyer's username
    - `sort` (optional): 'createdAt_asc', 'createdAt_desc', 'totalAmount_asc', 'totalAmount_desc'
    - `page` (optional): Page number (default 1)
    - `limit` (optional): Number of results per page (default 10, max 100)
- Description:
  For regular users, this returns only their own orders. Admins receive all orders. The results are paginated and can be filtered and sorted based on the query parameters provided.

### Delete Order [Auth] [Admin]
- DELETE /api/orders/:orderId
- Description:
  This route allows admins to delete an order by its ID.

### Update Order [Auth]
- PATCH /api/orders/:orderId
- Body:
  {
  "plants": [{ "plant": "plantId", "quantity": 1 }]
  }
- Validates:
    - `plants`: Array of plant objects
    - `plant`: Must be a valid MongoDB ID
    - `quantity`: Positive integer
- Description:
  This route updates the plants in an order. It only allows modifications to orders with the status "cart". The total amount is recalculated based on the updated plants and quantities.
