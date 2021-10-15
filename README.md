## E-CommerceX REST API 🛒

### 🔄 Built with

- NodeJS
- ExpressJS
- MongoDB Atlas
- JavaScript

### 🚩 Start API

#### Fork and clone this repository using

   ```bash
   git clone https://github.com/sandip2224/My-Shopping-REST-API.git
   ```   
#### Install dependencies and dev dependency using

   ```bash
   npm install
   npm install -D nodemon
   ```  

#### Create a _config.env_ file inside the _/api/config_ directory and add the following key-value pairs

   ```bash
   MONGO_URI=<Your_Unique_MongoDB_Cluster_URL>
   PORT=<Local_Server_Port_Number>
   JWT_KEY=<Your_Private_JWT_Key>
   ```  
   > Note: Get the following URL from MongoDB official website. You need to configure the `username`, `password` and `dbname` accordingly.
   ```bash
   mongodb+srv://<username>:<password>@cluster0.x1ccn.mongodb.net/<dbname>?retryWrites=true&w=majority
   ```

 #### Start the server locally at _localhost:3000_ using

   ```bash
   npm run dev
   ```
   
### 🔱 API Endpoints

#### Products

```bash
GET    /api/products
GET    /api/products/:productId
POST   /api/products
PATCH  /api/products/:productId
DELETE /api/products/:productId
DELETE /api/products
```

#### Orders
To manage user order details:

```bash
GET    /api/orders
GET    /api/orders/:orderId
POST   /api/orders
PATCH  /api/orders/:orderId
DELETE /api/orders/:orderId
```

### Users
To manage user credentials and roles:

```bash
GET    /api/users
GET    /api/users/:userId
PATCH  /api/users/:userId
DELETE /api/users/:userId
```

#### Payments
To process pending payments on existing orders:

```bash
GET  /api/payments
POST /api/payments/:orderId
```

#### Register
To register a new user before login:

```bash
POST /api/users/register
```

### Login
To login a user and generate a JWT token for accessing protected routes:

```bash
POST /api/users/login
```
### 🔍 UML Class Diagram

![UML Diagram](media/uml.png)

> Swagger Documentation can be found at http://localhost:3000/docs

