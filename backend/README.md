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
- Body: { plants: [{ plant, quantity }], totalAmount }
- Validates: plants (array, min 1), plant ID, quantity (positive integer), totalAmount (positive number)

### Get Orders [Auth]
- GET /api/orders
- For regular users: Returns only their own orders
- For admins: Returns all orders
- Query params: status, minAmount, maxAmount, buyerUsername, sort, page, limit
- Supports filtering, pagination, and sorting

### Delete Order [Auth] [Admin]
- DELETE /api/orders/:orderId
- Admin only

### Update Order Total Amount [Auth] [Admin]
- PATCH /api/orders/:orderId/totalAmount
- Admin only
- Body: { totalAmount }