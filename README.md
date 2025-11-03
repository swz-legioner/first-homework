# NestJS API для управления списком пользователей

## Начало работы

```shell
cd <YOUR_DIRECTORY>/first-homework

docker-compose up

npm install
npm run migration
npm run start
```

## Для справки
Миграции:
- Создают необходимую таблицу (users)
- Заполняют ее тестовыми данными
- В корне проекта создают credentials.csv с логинами-паролями юзеров

## API

После запуска проекта `npm run start[:dev]` - документация `Swagger` доступна по адресам:
- http://localhost:3000/api - **Swagger UI**
- http://localhost:3000/api/json - **JSON-документ**
