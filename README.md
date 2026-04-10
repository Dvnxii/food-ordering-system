Campus Canteen — College Food Ordering System

A full-stack Java + React food ordering system with real-time push notifications via WebSocket and Firebase FCM.
Tech Stack

->Layer ->Technology ->->Backend ->Java 17 + Spring Boot 3.2 ->->Auth ->Spring Security + JWT ->->Real-time ->WebSocket (STOMP/SockJS) ->->Push Notifications ->Firebase Cloud Messaging (FCM) ->->Database ->H2 (dev) / MySQL (prod) ->->Frontend ->React 18 + Vite ->Quick Start

Prerequisites
- Java 17+
- Node.js 18+
- Maven 3.8+

Start the Backend

bash
cd backend
mvn spring-boot:run


The server starts at http://localhost:8080

Sample accounts are auto-created:
->Role ->Email ->Password 
->Student ->student@college.edu ->password123 
->Student ->student2@college.edu ->password123 
->Staff ->staff@canteen.edu ->password123 

H2 Database Console: http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:food_ordering`
- Username: `sa` / Password: *(leave blank)*

 Start the Frontend

bash
cd frontend
npm install
npm run dev


Frontend runs at http://localhost:3000

How Notifications Work

Student places order
       ↓
Spring Boot saves order + broadcasts via WebSocket to Staff panel
       ↓
Staff sees new order live — clicks "Start Preparing", then "Mark as Ready 🔔"
       ↓
NotificationService fires:
  ├── WebSocket → Student's browser tab updates instantly
  └── Firebase FCM → Push notification to student's phone (even if tab closed)
       ↓
Student sees: toast popup + browser notification + phone notification

Switch to MySQL (Production)

In `backend/src/main/resources/application.properties`:

properties
Comment out H2 lines and uncomment MySQL lines:
spring.datasource.url=jdbc:mysql://localhost:3306/food_ordering?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
spring.jpa.hibernate.ddl-auto=update

Comment out:
spring.datasource.url=jdbc:h2:mem:food_ordering...
spring.h2.console.enabled=true

Enable Firebase Push Notifications

1. Go to [Firebase Console](https://console.firebase.google.com) → Create Project
2. Project Settings → Service Accounts → Generate new private key
3. Save as `backend/src/main/resources/firebase-service-account.json`
4. In `application.properties` set: `app.firebase.enabled=true`
5. In the frontend, after login, call `authApi.updateFcmToken(token)` with the device's FCM token
API Endpoints

Auth
->Method ->URL ->Description 
->POST ->/api/auth/register ->Register new user 
->POST ->/api/auth/login ->Login 
->POST ->/api/auth/fcm-token ->Save device FCM token 

Menu
->Method ->URL ->Auth 
->GET ->/api/menu ->Public 
->POST ->/api/menu ->Staff only 
->PUT ->/api/menu/{id} ->Staff only 
->PATCH ->/api/menu/{id}/availability ->Staff only 

Orders
->Method ->URL ->Auth ->Description 
->POST ->/api/orders ->Student ->Place order 
->GET ->/api/orders/my ->Student ->My order history 
->GET ->/api/orders/active ->Staff ->All active orders 
->PUT ->/api/orders/{id}/status ->Staff ->Update status → triggers notification 
->GET ->/api/orders/stats ->Staff ->Dashboard counts 


