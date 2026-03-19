
Проєкт реалізує спрощений аналог Google Forms:
- створення форм з різними типами запитань (текст, множинний вибір, чекбокси, дата)
- заповнення форм користувачами
- перегляд усіх відповідей по кожній формі

Використані технології:

  Frontend: 
   - React 19 + TypeScript
   - Vite
   - React Router
   - Apollo Client
   - Redux Toolkit
   - SCSS

  Backend:
   - Node.js + Express
   - GraphQL
   - In‑memory storage

  Dev‑інструменти:
  - concurrently — паралельний запуск клієнта й сервера однією командою

 Інструкція по запуску: 
 
  Клонування репозиторію: ```git clone https://github.com/fushigura/GoogleFroms.git```
  
   - Встановити залежності: у корені проекту: ```npm install```
     
   Backend: 
   
   ```cd server```
    ```npm install```
     
   Frontend: 
     ```cd ../client/client ```
     ```npm install```
   
Запуск сервера та клієнта в корені проекту: ```npm run dev```
