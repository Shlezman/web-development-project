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

## Reviews

### Add Review to Plant [Auth]
- POST /api/plants/:plantId/reviews
- User can add one review per plant

### GET All Plant Reviews
- GET /api/plants/:plantId/reviews
- All plant reviews
- Public access

### GET Top Rated Plants
- GET /api/plants/top-rated
- Public access

## Orders

### Create Order [Auth]
- POST /api/orders
- Body:
  ```json
  {
    "plants": [{ "plant": "plantId", "quantity": 1 }]
  }
  ```
- Validates:
  - `plants`: Array of at least one object
  - `plant`: Must be a valid MongoDB ID
  - `quantity`: Positive integer
- Description:
  - Creates a new order with status "cart"
  - User can only have one order in "cart" status at a time
  - Total amount is automatically calculated based on plant prices

### Get Orders [Auth]
- GET /api/orders
- Query Params:
  - `status` (optional): 'cart' or 'delivered'
  - `minAmount` (optional): Minimum order total amount
  - `maxAmount` (optional): Maximum order total amount
  - `buyerUsername` (optional, Admin only): Filter by buyer's username
  - `sort` (optional): 'createdAt_asc', 'createdAt_desc', 'totalAmount_asc', 'totalAmount_desc'
  - `page` (optional): Page number (default 1)
  - `limit` (optional): Number of results per page (default 10, max 100)
- Description:
  - Returns only user's orders
  - Results are paginated and can be filtered/sorted

### Get Orders sum and group by user [Auth]
- GET /api/orders/byUser
- Query Params:
  - `buyerUsername` (optional, Admin only): Filter by buyer's username
  - `page` (optional): Page number (default 1)
  - `limit` (optional): Number of results per page (default 10, max 100)
- Description:
  - Returns user's sum orders order by user
  - Results are paginated and can be filtered/sorted

### Update Order [Auth]
- PATCH /api/orders/:orderId
- Body:
  ```json
  {
    "plants": [{ "plant": "plantId", "quantity": 1 }]
  }
  ```
- Validates:
  - `plants`: Array of plant objects
  - `plant`: Must be a valid MongoDB ID
  - `quantity`: Positive integer
- Description:
  - Updates plants and quantities in a cart
  - Only works for orders with status "cart"
  - Total amount is recalculated automatically
  - Only the order owner can update their order

### Update Order Status [Auth]
- PATCH /api/orders/:orderId/status
- Body:
  ```json
  {
    "status": "delivered"
  }
  ```
- Description:
  - Changes order status from "cart" to "delivered"
  - Only the order owner can update their order status
  - Automatically sets delivery date
  - Once marked as delivered, order cannot be modified
  - User can create a new cart after marking current one as delivered

## Twitter
- Post an X post (twitter tweet) for greeting every new member after registration

## Maps
- Get the google maps API key for UI
