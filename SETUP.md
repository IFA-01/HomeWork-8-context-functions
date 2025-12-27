# Инструкция по установке

## Команды для установки всех зависимостей

### 1. Установка всех пакетов одной командой:

```bash
npm install
```

### 2. Или установка по отдельности:

#### Jest (для тестирования):

```bash
npm install --save-dev jest babel-jest jest-environment-jsdom @babel/core @babel/preset-env
```

#### ESLint (для линтинга):

```bash
npm install --save-dev eslint
```

#### Prettier (для форматирования):

```bash
npm install --save-dev prettier
```

#### Webpack (для сборки):

```bash
npm install --save-dev webpack webpack-cli babel-loader
```

## Доступные команды

После установки можно использовать:

### Тестирование:

- `npm test` - запустить тесты
- `npm run test:watch` - запустить тесты в режиме наблюдения
- `npm run test:coverage` - запустить тесты с покрытием кода

### Линтинг:

- `npm run lint` - проверить код на ошибки
- `npm run lint:fix` - исправить автоматически исправимые ошибки

### Форматирование:

- `npm run format` - отформатировать код
- `npm run format:check` - проверить форматирование без изменений

### Сборка:

- `npm run build` - собрать проект для production
- `npm run dev` - собрать проект для development с watch режимом
