import {
  Promisify,
  Parallel,
  fetchRetry,
  debounce,
  serialProcess,
} from './scriptHW09.js';
global.fetch = jest.fn();
describe('Тесты для функции Promisify', () => {
  test('Тест 1: преобразует колбэк-функцию, которая успешна, в промис с результатом', async () => {
    const testFunction = (callback) => {
      setTimeout(() => {
        (callback(null, 'value'), 100);
      });
    };
    const promisifiedFunction = Promisify(testFunction);
    const result = await promisifiedFunction();
    expect(result).toBe('value');
  });

  test('Тест 2: обрабатывает ошибку, если колбэк вызван с ошибкой', async () => {
    const testFunction = (cb) => {
      setTimeout(() => {
        cb(new Error('fail'), null);
      }, 100);
    };

    const promisifiedFunction = Promisify(testFunction);

    expect(promisifiedFunction()).rejects.toThrow('fail');
  });

  test('Тест 3: передаёт аргументы оригинальной функции', async () => {
    const testFunction = (x, cb) => {
      setTimeout(() => {
        cb(null, x * 2);
      }, 100);
    };

    const promisifiedFunction = Promisify(testFunction);
    const result = await promisifiedFunction(5);

    expect(result).toBe(10);
  });
});

describe('Тесты для класса Parallel', () => {
  test('Тест 1: Выполняет задания параллельно с ограничением и возвращает результаты в указанном порядке.', async () => {
    const runner = new Parallel(2);
    runner
      .job((done) => setTimeout(() => done('A'), 300))
      .job((done) => setTimeout(() => done('B'), 100))
      .job((done) => setTimeout(() => done('C'), 200));

    const resultsPromise = new Promise((resolve) => {
      runner.done((results) => resolve(results));
    });
    const results = await resultsPromise;

    expect(results).toEqual(['A', 'B', 'C']);
  });

  test('Тест 2: Пустой список задач - cb вызван асинхронно с пустым массивом', async () => {
    const runner = new Parallel();

    const results = await new Promise((resolve) => {
      runner.done((results) => {
        resolve(results);
      });
    });

    expect(results).toEqual([]);
  });

  test('Тест 3: Выполнение задач с limit=1 - последовательно, без параллелизма', async () => {
    const runner = new Parallel(1);
    runner
      .job((done) => setTimeout(() => done('one'), 100))
      .job((done) => setTimeout(() => done('two'), 200))
      .job((done) => setTimeout(() => done('three'), 150));

    const results = await new Promise((resolve) => {
      runner.done((results) => {
        resolve(results);
      });
    });

    expect(results).toEqual(['one', 'two', 'three']);
  });

  test('Тест 4: Выполнение задач с limit=Infinity - все параллельно', async () => {
    const runner = new Parallel(Infinity);
    runner
      .job((done) => setTimeout(() => done('first'), 200))
      .job((done) => setTimeout(() => done('second'), 100))
      .job((done) => setTimeout(() => done('third'), 400));

    const start = Date.now();
    const results = await new Promise((resolve) => {
      runner.done((results) => {
        resolve(results);
      });
    });
    const duration = Date.now() - start;

    expect(results).toEqual(['first', 'second', 'third']);
    expect(duration).toBeLessThan(750);
    expect(duration).toBeGreaterThan(300);
  });

  test('Тест 5: Игнорировать добавленные Jobs после вызова done', async () => {
    const runner = new Parallel(2);
    runner
      .job((done) => setTimeout(() => done('one'), 200))
      .job((done) => setTimeout(() => done('two'), 100));

    const results = await new Promise((resolve) => {
      runner.done((results) => {
        resolve(results);
      });
    });
    runner.job((done) => setTimeout(() => done('three'), 200));

    expect(results).toEqual(['one', 'two']);
  });
});

describe('Тесты для функции fetchRetry', () => {
  test('Тест 1: успех с первой попытки', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');
    fetchSpy.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: 'test' }),
    });

    const result = await fetchRetry('https://rrer', 3, 100);

    expect(result.ok).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    fetchSpy.mockRestore();
  });

  test('Тест 2: ретраи на ошибке и успех', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');

    fetchSpy
      .mockRejectedValueOnce(new Error('net error'))
      .mockRejectedValueOnce(new Error('another one'))
      .mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'ok' }),
      });

    const result = await fetchRetry('https://rrer', 3, 100);

    expect(result.ok).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(3);
    fetchSpy.mockRestore();
  });

  test('Тест 3: ошибка после всех ретраев', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');
    fetchSpy.mockRejectedValue(new Error('net error'));

    const result = await fetchRetry('https://rrer', 3, 100).catch((e) => e);
    expect(fetchSpy).toHaveBeenCalledTimes(3);
    expect(result).toEqual(Error('net error'));
    fetchSpy.mockRestore();
  });
});

describe('Тесты для функции debounce', () => {
  test('Исходная функция вызывается не чаще одного раза за указанный интервал времени', () => {
    jest.useFakeTimers();
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn();
    jest.advanceTimersByTime(50);
    debouncedFn();
    jest.advanceTimersByTime(50);
    debouncedFn();
    jest.advanceTimersByTime(100);

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test('Тест 2: При частых вызовах обёртки исходная функция не запускается, пока не наступит "пауза"', () => {
    jest.useFakeTimers();
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn('call1');
    jest.advanceTimersByTime(60);
    debouncedFn('call2');
    jest.advanceTimersByTime(60);
    debouncedFn('call3');
    jest.advanceTimersByTime(60);

    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('call3');
  });

  test('Тест 3: Аргументы и контекст (this) корректно передаются в исходную функцию', () => {
    jest.useFakeTimers();

    const context = {
      userId: 123,
      getName() {
        return `User ${this.userId}`;
      },
    };

    const mockFn = jest.fn(function (prefix) {
      return `${prefix}: ${this.getName()}`;
    });

    const debouncedFn = debounce(mockFn.bind(context), 100);

    debouncedFn('Запрос от');
    jest.advanceTimersByTime(100);

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('Запрос от');
    expect(mockFn).toReturnWith('Запрос от: User 123');
    expect(mockFn.mock.instances[0]).toBe(context);
    jest.useRealTimers();
  });
});

describe('Тесты для функции serialProcess', () => {
  test('Тест 1: Обрабатывает элементы последовательно с результатами в порядке', async () => {
    const results = [];
    const handler = (item, index, list, done) => {
      setTimeout(
        () => {
          results.push(item);
          done(`processed-${item}`);
        },
        100 - index * 10
      );
    };

    const list = ['A', 'B', 'C'];

    const processedResults = await serialProcess(list, handler);

    expect(results).toEqual(['A', 'B', 'C']);
    expect(processedResults).toEqual([
      'processed-A',
      'processed-B',
      'processed-C',
    ]);
  });

  test('Тест 2: Обрабатывает пустой массив', async () => {
    const handler = jest.fn();
    const list = [];

    const results = await serialProcess(list, handler);

    expect(results).toEqual([]);
    expect(handler).not.toHaveBeenCalled();
  });

  test('Тест 3: Передаёт index, list и done правильно', async () => {
    const list = ['x', 'y', 'z'];
    const log = [];

    const handler = (item, index, fullList, done) => {
      log.push({ item, index, listIdentity: fullList === list });
      setTimeout(() => {
        done(`${item}-${index}`);
      }, 50);
    };

    const results = await serialProcess(list, handler);

    expect(log).toEqual([
      { item: 'x', index: 0, listIdentity: true },
      { item: 'y', index: 1, listIdentity: true },
      { item: 'z', index: 2, listIdentity: true },
    ]);
    expect(results).toEqual(['x-0', 'y-1', 'z-2']);
  });
});
