// Импорт функций из script.js (ES модули)
import { User, curry, ForceConstructor } from './script.js';

describe('Тесты для функций на контекст', () => {
  test('Цепочка методов возвращает this и позволяет чейнинг', () => {
    const u = new User();
    const spyLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    const spyAlert = jest.fn();
    global.alert = spyAlert;
    const promptName = 'NameName';
    const promptAge = 28;

    global.prompt = jest
      .fn()
      .mockReturnValueOnce(promptName)
      .mockReturnValueOnce(promptAge);

    const result = u.askName().askAge().showAgeInConsole().showNameInAlert();

    expect(result).toBe(u);
    expect(u.name).toBe(promptName);
    expect(u.age).toBe(promptAge);
    expect(spyLog).toHaveBeenCalledWith(promptAge);
    expect(spyAlert).toHaveBeenCalledWith(promptName);

    spyLog.mockRestore();
    delete global.alert;
    delete global.prompt;
  });

  test('askName сохраняет имя из prompt', () => {
    const u = new User();
    const promptName = 'Alex';

    global.prompt = jest.fn().mockReturnValue(promptName);

    const result = u.askName();

    expect(global.prompt).toHaveBeenCalledTimes(1);
    expect(global.prompt).toHaveBeenCalledWith('input your name');
    expect(u.name).toBe(promptName);
    expect(result).toBe(u);
    delete global.prompt;
  });

  test('askAge сохраняет возраст из prompt', () => {
    const u = new User();
    const promptAge = '25';

    global.prompt = jest.fn().mockReturnValue(promptAge);

    const result = u.askAge();
    expect(global.prompt).toHaveBeenCalledTimes(1);
    expect(global.prompt).toHaveBeenCalledWith('input your age');
    expect(u.age).toBe(promptAge);
    expect(result).toBe(u);

    delete global.prompt;
  });

  test('showAgeInConsole выводит корректный возраст и возвращает this', () => {
    const u = new User();
    u.age = '30';
    const spyLog = jest.spyOn(console, 'log').mockImplementation(() => {});

    const result = u.showAgeInConsole();

    expect(spyLog).toHaveBeenCalledTimes(1);
    expect(spyLog).toHaveBeenCalledWith('30');
    expect(result).toBe(u);

    spyLog.mockRestore();
  });

  test('showNameInAlert показывает корректное имя и возвращает this', () => {
    const spyAlert = jest.fn();
    global.alert = spyAlert;
    const u = new User();
    u.name = 'Alex';

    const result = u.showNameInAlert();

    expect(spyAlert).toHaveBeenCalledTimes(1);
    expect(spyAlert).toHaveBeenCalledWith('Alex');
    expect(result).toBe(u);

    delete global.alert;
  });

  test('Полная цепочка - данные проходят через все методы', () => {
    const u = new User();
    const spyLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    const spyAlert = jest.fn();
    global.alert = spyAlert;

    global.prompt = jest
      .fn()
      .mockReturnValueOnce('Alex')
      .mockReturnValueOnce(25);

    const result = u.askName().askAge().showAgeInConsole().showNameInAlert();

    expect(global.prompt).toHaveBeenCalledTimes(2);
    expect(result.name).toBe('Alex');
    expect(result.age).toBe(25);
    expect(spyLog).toHaveBeenCalledWith(25);
    expect(spyAlert).toHaveBeenCalledWith('Alex');

    spyLog.mockRestore();
    delete global.alert;
    delete global.prompt;
  });

  test('myBind привязывает контекст к функции', () => {
    let capturedThis = null;

    function greet(greeting, punctuation) {
      capturedThis = this;
      return greeting + ', ' + this.name + punctuation;
    }

    const person = { name: 'Alice' };

    const boundGreet = greet.myBind(person, 'Hi');
    const result = boundGreet('!');

    expect(result).toBe('Hi, Alice!');
    expect(capturedThis).toBe(person);
  });

  test('myBind частично применяет аргументы', () => {
    let capturedThis = null;
    let capturedArgs = null;

    function greet(greeting, punctuation) {
      capturedThis = this;
      capturedArgs = [greeting, punctuation];
      return greeting + ', ' + this.name + punctuation;
    }

    const person = { name: 'Alex' };

    const boundGreet = greet.myBind(person, 'hi');
    const result = boundGreet('!');

    expect(result).toBe('hi, Alex!');
    expect(capturedThis).toBe(person);
    expect(capturedArgs).toEqual(['hi', '!']);
  });

  // ========== ТЕСТЫ ДЛЯ curry ==========

  test('Каррирование бинарной функции sum2 - вызов по одному аргументу', () => {
    function sum(x, y) {
      return x + y;
    }
    const currySum = curry(sum);
    const result = currySum(1)(2);
    expect(result).toBe(3);
  });

  test('Каррирование бинарной функции sum2 - вызов сразу двумя аргументами', () => {
    function sum(x, y) {
      return x + y;
    }
    const currySum = curry(sum);
    const result = currySum(1, 2);
    expect(result).toBe(3);
  });

  test('Каррирование sum4 - по одному аргументу за вызов', () => {
    function sum(a, b, c, d) {
      return a * b * c * d;
    }
    const curriedSum = curry(sum);
    const result = curriedSum(1)(2)(3)(4);
    expect(result).toBe(24);
  });

  test('Каррирование sum4 - смешанное количество аргументов', () => {
    // Arrange: curriedSum4 = curry(sum4)
    function sum(a, b, c, d) {
      return a * b * c * d;
    }
    const curriedSum = curry(sum);

    const partial1 = curriedSum(1, 2);
    expect(typeof partial1).toBe('function');

    const result1 = curriedSum(1, 2)(3)(4);
    const result2 = curriedSum(1)(2, 3, 4);
    expect(result1).toBe(result2);
    // Act: вызвать curriedSum4(1, 2)(3)(4) и отдельно curriedSum4(1)(2, 3, 4)
    // Assert: оба варианта должны вернуть 10; проверить, что функция правильно накапливает аргументы до длины sum4.length
  });

  // ========== ТЕСТЫ ДЛЯ ForceConstructor ==========

  test('ForceConstructor работает с new', () => {
    // Arrange: подготовить аргументы для конструктора: "Toyota", "rav4", "blue"
    const make = 'Toyota';
    const model = 'rav4';
    const color = 'blue';
    // Act: вызвать new ForceConstructor("Toyota", "rav4", "blue")
    const car = new ForceConstructor(make, model, color);
    // Assert: проверить, что создан объект с полями make === "Toyota", model === "rav4", color === "blue"
    expect(car.make).toBe(make);
    expect(car.model).toBe(model);
    expect(car.color).toBe(color);
  });

  test('ForceConstructor работает без new (принудительное создание экземпляра)', () => {
    // Arrange: подготовить аргументы: "Fiat", "404", "Beige"
    const make = 'Fiat';
    const model = '404';
    const color = 'Beige';
    // Act: вызвать ForceConstructor("Fiat", "404", "Beige") БЕЗ ключевого слова new
    const car = ForceConstructor(make, model, color);
    // Assert: проверить, что всё равно создан объект (не undefined) с полями make === "Fiat", model === "404", color === "Beige"
    expect(car.make).toBe(make);
    expect(car.model).toBe(model);
    expect(car.color).toBe(color);
    expect(car instanceof ForceConstructor).toBe(true);
  });

  test('ForceConstructor проверяет instanceof', () => {
    // Arrange: создать экземпляр car1 = new ForceConstructor("Toyota", "rav4", "blue")
    const make = 'Toyota';
    const model = 'rav4';
    const color = 'blue';
    // Act: проверить car1 instanceof ForceConstructor
    const car = new ForceConstructor(make, model, color);
    // Assert: результат должен быть true
    expect(car instanceof ForceConstructor).toBe(true);
  });
});
