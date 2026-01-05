function Promisify(originalFunction) {
  return function (...args) {
    return new Promise(function (resolve, reject) {
      originalFunction(...args, function (error, result) {
        if (error === null || error === undefined) {
          resolve(result);
        } else {
          reject(error);
        }
      });
    });
  };
}

class Parallel {
  constructor(limit) {
    this.jobs = [];
    this.results = [];
    this.limit = limit || Infinity;
    this.running = 0;
    this.completed = 0;
    this.currentIndex = 0;
    this.cb = null;
  }

  job(fn) {
    this.jobs.push(fn);
    return this;
  }

  done(cb) {
    this.cb = cb;
    if (this.jobs.length === 0) {
      setTimeout(() => this.cb([]), 0);
      return this;
    }
    this.runNext();
    return this;
  }

  runNext() {
    while (this.running < this.limit && this.currentIndex < this.jobs.length) {
      let index = this.currentIndex;
      this.currentIndex++;
      let fn = this.jobs[index];
      this.running++;
      fn((result) => {
        this.results[index] = result;
        this.running--;
        this.completed++;
        if (this.completed === this.jobs.length) {
          this.cb(this.results);
        } else {
          this.runNext();
        }
      });
    }
  }
}

function fetchRetry(url, retries, delay) {
  function tryFetch(attempt = 1) {
    return fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error &{response.status}`);
        }
        return response;
      })
      .catch((error) => {
        if (attempt < retries) {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(tryFetch(attempt + 1));
            }, delay);
          });
        } else {
          throw error;
        }
      });
  }
  return tryFetch();
}

function debounce(fn, delay) {
  let timer = null;

  return function (...args) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

function serialProcess(list, handler) {
  let results = [];
  let current = 0;
  return new Promise((resolve) => {
    if (list.length === 0) {
      resolve(results);
      return;
    }
    function processNext() {
      if (current >= list.length) {
        resolve(results);
      } else {
        let el = list[current];
        handler(el, current, list, (result) => {
          results[current] = result;
          current++;
          processNext();
        });
      }
    }
    processNext();
  });
}

module.exports = { Promisify, Parallel, fetchRetry, debounce, serialProcess };
