# Docker

1. Build and Run Database

```
docker-compose up -d
```

2. Stop Container

```
docker-compose down
```

3. Check Volume

```
docker volume ls
```

# Application

1. Run the following command to initialize the Sequelize project structure:

```
sequelize init
```

2. Once the project structure is initialized, open the config/config.json file and update it with your database configuration details, such as the database name, username, password, and host.

3. Create migration file

```
sequelize migration:generate --name create-refresh-tokens
```

4. After updating the config/config.json file, run the migration command again:

```
sequelize db:migrate
```

5. Run Backend Application

```
npm run dev
```
