# Postman

Закинул то, с чем работал в Postman для комфорта пользования
Нужно просто импортировать к себе коллекцию через json-файл (любой из двух) и выставить Collection/Variables/baseURL в `localhost:{{PORT}}`, где PORT - порт, на котором запускается приложение

- Login, Register и Refresh автоматически проставят токены в accessToken и RefreshToken
- DeleteUser автоматически очистит токены
- GetSelf, GetById, GetAll, UpdateUser просто работают (все что нужно указывать - указывать руками)
