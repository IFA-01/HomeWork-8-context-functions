//myBind function

Function.prototype.myBind = function (context, ...args) {
  const originalFunction = this;
  return (...innerArgs) => {
    return originalFunction.apply(context, [...args, ...innerArgs]);
  };
};

//methodChain function

class User {
  constructor() {
    this.name = "";
    this.age = "";
  }

  askName() {
    this.name = prompt("input your name");
    return this;
  }
  askAge() {
    this.age = prompt("input your age");
    return this;
  }
  showAgeInConsole() {
    console.log(this.age);
    return this;
  }
  showNameInAlert() {
    alert(this.name);
    return this;
  }
}

//ForceConstructor function

//Made with specified arguments
//Task says that function that must store
// parameters in the created
// object with the parameter names.
// It is not possible in case of use ...args
function ForceConstructor(make, model, color) {
  if (!(this instanceof ForceConstructor)) {
    return new ForceConstructor(make, model, color);
  }
  this.make = make;
  this.model = model;
  this.color = color;
}

console.log(ForceConstructor("Toyota", "rav4", "blue"));

//curry function

const curry = function (fn) {
  const curried = (...args) => {
    if (args.length >= fn.length) {
      return fn(...args);
    } else {
      return (...args2) => curried(...args, ...args2);
    }
  };
  return curried;
};

// Экспорт для использования в других модулях (ES модули)
export { User, curry, ForceConstructor };
