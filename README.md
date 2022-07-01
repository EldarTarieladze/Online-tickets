# **Task Ticketworld**

## Required environment
	

 - Node JS version - ^16.14.*
 - PostgreSQL version - 14
 - Docker

## Installation

```bash
$ npm install
```

  

## Running the app
This command will run three main tasks

 - Create PostgreSQL docker image
 - Seeding the  Database
 - Start a project on watch mode

 


```bash
$ npm run start:dev:all
```

 - Seeding Database manual - **`npx sequelize db:seed:all`**
 - Disable automatic database cleanup - **process.env.AUTO_SYNC_DB = false**


## CronJob

 - Works every half minute, can be transferred at any time

## .ENV

 - Database
	 - DB_USER - PostgreSQL username
	 - DB_PASS - PostgreSQL password
	 - DB_NAME_DEVELOPMENT - PostgreSQL database name
	 - DB_PORT - PostgreSQL Port
	 - DB_LOGGING - Database logging Query
 - API
	 - AUTO_SYNC_DB - API watch mode, Clears the database and 					creates new information
	 - EXPIRED_TIME - Remove reservation after 15 min


## docs (Swagger)
http://localhost:3000/api/swagger
	 - 


