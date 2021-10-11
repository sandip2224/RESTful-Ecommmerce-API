# WEB API 🔧

## 🛠 Tech Stack Used

#### Backend
- Node.js: JavaScript runtime built on Chrome's V8 JavaScript engine.
- Express.js: Minimal and flexible Node.js web application framework that provides a robust set of features for webapp development.
- MongoDB Atlas: Primary database to store authenticated users and violation reports.

> Note: Postman Collections can be found here: [Web API Collections](https://www.postman.com/collections/283eb1fc6b63d835e9f5)

## 🚩 How to Install Locally

**1. Fork and clone this repository using**

   ```
   git clone https://github.com/sandip2224/NxtGenEsports-REST-API.git
   cd NxtGenEsports-REST-API/
   ```  
   
**2. Install required dependencies and dev dependency using**  

   ```
   npm install
   npm install -D nodemon
   ```  

**3. Create a config.env file inside the `/config` directory and add the following**

   ```bash
   MONGO_URI=<Your_Unique_MongoDB_Cluster_URL>
   PORT=<Local_Express_Port_Number>
   JWT_KEY=<Your_Private_JWT_Key>
   ```  
 **4. Start the server locally using**

   ```bash
   npm run dev
   ```  
   **or in production mode using**
   ```bash
   npm run start
   ```  
## 🔱 API Endpoints

| Endpoints | Request | Access | Description |
|-|-|-|-|
| /products | GET | Public | Get all existing products |
| /products/:productId | GET | Public | Get a specific product |
| /products | POST | Protected | Create a new product |
| /register | POST | Public | Register as a new user |
| /login | POST | Public | Login as existing user |
| /login | DELETE | Public | Delete an existing user |

> Swagger Documentation can be found at http://localhost:3000/docs

