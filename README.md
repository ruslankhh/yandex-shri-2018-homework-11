# Домашнее задание "Новые возможности JavaScript"

Домашнее задание #11 в ШРИ Яндекса 2018.

## Задание

### Основное

Вам нужно написать свою реализацию библиотеки, которая будет уметь совершать последовательные запросы.

Интерфейс данной библиотеки вы можете придумать сами.

Либо, например, опираться на следующий:

```js
Request
  .get(urlOne, onResolve, onReject)
  .get(urlTwo, onResolve, onReject);
```

Использовать сторонние библиотеки нельзя, а использование современных возможностей JavaScript приветствуется.

### Дополнительное

Каждый последующий запрос должен иметь доступ к данным, полученным из предыдущего запроса.

## Запуск

```bash
npm i
npm run build
```

Для тестов:

```bash
npm run test
```

## Выполнение задания

- Сделал несколько реализаций класса `Request`.
- Написал тесты с использованием `mocha`, `chai` и `sinon` (сначала поднимал `json-server`, но потом решил всё таки попробовать `sinon`).
- Реализовал fluent-интерфейс.
- Реализовал доступ к ответам предыдущих запросов.

### Использывание

```js
const request = new Request();

request
  .get(urlOne, handler1, handler1)
  // .then((data, responses, errors) =>
  //   Promise.all(
  //     responses.map(res => res.clone().json()),
  //     errors.map(err => err.messages)
  //   )
  // )
  // .then(console.log)
  // .catch(console.log)
  .get(urlTwo, handler2, handler2)
  .get(urlThree, handler3, handler3)
  .then((data, responses, errors) =>
    Promise.all(
      responses.map(res => res.clone().json()),
      errors.map(err => err.messages)
    )
  )
  .then(console.log)
  .catch(console.log)
```

### API

- `request.get(url, onResolve, onReject)` — отправляет GET-запрос на указанный `url`, и обрабатывает ответы с помощью коллбэков. Возвращает `Request`.
  - `onResolve(responses, errors)` — обрабатывает ответ с помощью в случае успешного выполнения запроса.
    - `responses` — массив всех ответов в цепочке.
    - `errors` — массив всех ошибок в цепочке.
  - `onReject(responses, errors)` — обрабатывает ответ в случае отказа.
    - `responses` — массив всех ответов в цепочке.
    - `errors` — массив всех ошибок в цепочке.
- `request.then(onFulfilled, onRejected)` — получает промис с цепочкой запросов и вызывает на нём метод `then` с переданными коллбэками. Возвращает `Request`.
  - `onFulfilled(data, responses, errors)` — обрабатывает промис при `resolve`.
    - `data` — данные из текущего промиса.
    - `responses` — массив всех ответов в цепочке.
    - `errors` — массив всех ошибок в цепочке.
  - `onRejected(error, responses, errors)` — обрабатывает промис с ошибкой при `reject`.
    - `error` — ошибка, в цепочке промисов.
    - `responses` — массив всех ответов в цепочке.
    - `errors` — массив всех ошибок в цепочке.
- `request.catch(onRejected)` — получает промис с цепочкой запросов и вызывает на нём метод `catch` с переданным коллбэком. Возвращает `Request`.
  - `onRejected(error, responses, errors)` — обрабатывает промис с ошибкой при `reject`.
    - `error` — ошибка, в цепочке промисов.
    - `responses` — массив всех ответов в цепочке.
    - `errors` — массив всех ошибок в цепочке.

#### RequestWithXHR

- Написал классическую реализацию fluent-интерфейса, в каждом методе возвращается `this`.
- Последовательность запросов реализовал через цепочку `Promise`.
- Для запросов использовал `XMLHttpRequest`.

#### RequestWithFetch

- Написал классическую реализацию fluent-интерфейса, в каждом методе возвращается `this`.
- Последовательность запросов реализовал через цепочку `Promise`.
- Для запросов использовал `Fetch API`.

#### RequestWithFetchAndProxy

- Написал реализацию fluent-интерфейса через `Proxy`.
- Методы `then` и `catch` реализовал через `Proxy`.
- Последовательность запросов реализовал через цепочку `Promise`.
- Для запросов использовал `Fetch API`.
