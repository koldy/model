# Koldy Model

Koldy Model ensures correct and strict structure of Javascript object instances in runtime so you don't have to worry any more
does it exist in data structure, is it a string or number, is it integer or float, is it undefined, null or something useful.
If you want to avoid errors such as `Uncaught TypeError: Cannot read property 'address' of undefined`, then you're in the right place.

It works best with ES6 classes and it supports data structures (objects called Models) and lists (arrays) of these data structures.

It can be used to "parse" JSON responses by initializing correct data structures, collect input from forms
and still keep the correct data types or to ensure that you send correct JSON structure to your backend.
It is specially useful when you're dealing with a lot of different data structures that needs to be reused on a large-scale
single page app.

All instances of `Model` and `List` are mutable, so to change the reference to initialized Model or List, simply call `clone()`
method.

## Installation

```shell script
npm install koldy-model
yarn add koldy-model
```

## Example (ES6)

```ecmascript 6
import {Model, IntegerType, StringType} from 'koldy-model';

class User extends Model {
  definition() {
    return {
      id: new IntegerType(),
      firstName: new StringType(),
      lastName: new StringType()
    };
  }
}

const user = User.create();
console.log(user instanceof User); // true

user.id = 5; // works
user.id = 'a'; // throws TypeError
user.id = '5'; // works, casts '5' to number 5

user.firstName = undefined;
console.log(user.firstName); // null

user.age = 21; // throws TypeError telling that "age" is not defined and therefore can't be used
console.log(user.fullName); // throws TypeError that fullName is not defined and can't be used because type is not defined
```

## Models

Models are instances that behave the same as Javascript object. When defining a model, you should always return an object where every property of returned
object is instance of type or another Model or List.

Once initialized, you may use the following methods:

- `displayName(): string` // returns name of the class - you can override this if needed
- `getData(): object` // returns "raw" data from the instance
- `setData(data: object): void` // sets new data in the instance
- `toJSON(): object` // returns an object prepared for JSON serialization
- `get(name: string): any` // gets the value of property
- `set(name: string, value: any): void` // sets the value to the property
- `keys(): array` // returns array of all keys defined in definition() method
- `values(): array` // returns array of all values in instance as array (it's using getData() to get the array)
- `hasProperty(name: string): boolean` // true if property with a name exists in the instance
- `seal(): void` // seals the object instance
- `isSealed(): boolean` // returns true if object is sealed
- `freeze(): void` // freezes the object instance
- `isFrozen(): boolean` // returns true if object is frozen
- `clone(): new instance` // returns new instance with the same data

## Anonymous models

Sometimes, you may not want to define the class Model. Usual use case for this are objects that are being used in just one place.
Therefore, you may create the object by passing the definition as the second argument.

```ecmascript 6
const user = Model.create({}, {
  firstName: new StringType(),
  age: new IntegerType(18)
});

console.log(user.firstName); // null
console.log(user.age); // 18
```

## Model Nesting

You may go with the object structure as "deep" as you want. Here's an example:

```ecmascript 6
class Driver extends Model {
	definition() {
		return {
			firstName: new StringType(),
			age: new IntegerType(),
			address: {
				street: new StringType(),
				postCode: new StringType(10000)
			}
		};
	}
}

class Vehicle extends Model {
	definition() {
		return {
			name: new StringType(),
			wheels: new IntegerType(),
			driver: Driver
		};
	}
}

const car = Vehicle.create();

console.log(car.driver.address.postCode); // returns string "10000"
console.log(car.driver instanceof Driver); // returns true
```

If you want to put another Model in model's definition, note that there's no `new` keyword.

## Features in all types

### Default value

All type constructors accept default value in its constructor.

```ecmascript 6
class Car extends Model {
    definition() {
        return {
            brand: new StringType('Acura'),
            miles: new IntegerType(3),
            isNew: new BooleanType(true),
            features: new ArrayType(['aircon', 'entertainment software'])
        };
    }
}

const car = Car.create();
console.log(car.brand); // returns "Acura"
console.log(car.miles); // returns 3
console.log(car.isNew); // returns true
console.log(car.features); // returns ['aircon', 'entertainment software']
```

### Nullable / Not Nullable

When some value is not set (in Javascript, set to `undefined`), Koldy Model will automatically set default value to `null`,
but sometimes, you don't want your properties to be nullable. In that case, simply call `notNull()` in definition chain and
property will reject all null values. Remember that if you don't set default value and put `notNull()`, constructing model
without not-null value will result in error.

```ecmascript 6
class Car extends Model {
    definition() {
        return {
            brand: new StringType().notNull()
        };
    }
}

const car1 = Car.create(); // fails, because brand should be not-null
const car2 = Car.create({brand: 'Acura'}); // ok, because brand is not-null
```

### Custom validator

All types can be even more restrictive by setting your own data validator.

```ecmascript 6
class User extends Model {
    definition() {
        return {
            age: new IntegerType().notNull().withCustomValidator(function ({value}) {
              if (value >= 18 && value <= 21) {
                throw new TypeError('Age should be between 18 and 21');
              }
            })
        };
    }
}

const user = User.create({age: 17}); // fails because of custom validator
```

In the example above, we pass function to `withCustomValidator` that accepts object as argument. That object contains:

- `value` - value that should be validated
- `originalValue` - value that was actually given to the property (in case when original value is undefined, then default value will be given for value, while `undefined` will be given for original value)
- `name` - the name of property
- `target` - the instance of type

In the example above, since `notNull()` is used, you'll never get `null` for the value in custom validator.

---

## Data Types

All methods listed in Types API are chainable.

### AnyType

`new AnyType(defaultValue?: any)` accepts anything for the value.

- `notNull()` - makes value not-nullable
- `withCustomValidator(fn: function)` - validates value after all internal checks
    - function gets object for first parameter with keys:
        - `value: any|null` - a value that should be validated
        - `originalValue: any|null` - original value passed to setter - it could be different than value if not-null or defaultValue were applied on `value`
        - `name: string` - name of the property
        - `target: object` - the instance of object on which the setter function was called

Example:

```ecmascript 6
class User extends Model {
    definition() {
        return {
            age: new AnyType() // defines "age" property to be anything
        };
    }
}

const user = User.create();

user.age = 5; // ok
user.age = 'above 18'; // ok
user.age = true; // ok'
```

### ArrayType

`new ArrayType(defaultValue?: array)` accepts array.

- `notNull()` - makes this property not-nullable - it always has to be an array
- `withCustomValidator(fn: function)` - validates value after all internal checks
    - function gets object for first parameter with keys:
        - `value: array|null` - a value that should be validated
        - `originalValue: array|null` - original value passed to setter - it could be different than value if not-null or defaultValue were applied on `value`
        - `name: string` - name of the property
        - `target: object` - the instance of object on which the setter function was called

Example:

```ecmascript 6
class User extends Model {
    definition() {
        return {
            names: new ArrayType().notNull()
        };
    }
}

const user = User.create();

user.names = ['First', 'Middle', 'Last']; // ok
user.names = null; // throws TypeError
```

### BooleanType

`new BooleanType(defaultValue?: boolean)` accepts boolean.

- `notNull()` - makes this property not-nullable
- `withCustomValidator(fn: function)` - validates value after all internal checks
    - function gets object for first parameter with keys:
        - `value: boolean|null` - a value that should be validated
        - `originalValue: boolean|null` - original value passed to setter - it could be different than value if not-null or defaultValue were applied on `value`
        - `name: string` - name of the property
        - `target: object` - the instance of object on which the setter function was called

Example:

```ecmascript 6
class User extends Model {
    definition() {
        return {
            isActive: new BooleanType().notNull()
        };
    }
}
```

### DateType

`new DateType(defaultValue?: Date|string)` accepts instance of `Date` or string. Anything you pass as a string will be accepted.
However, after getting a property of this type, your string will be parsed using `Date.parse()` which could fail. Koldy Model relies
entirely on browser's Date implementation, which could be different from browser to browser. 

- `notNull()` - makes this property not-nullable
- `withCustomValidator(fn: function)` - validates value after all internal checks
    - function gets object for first parameter with keys:
        - `value: Date|string|null` - a value that should be validated
        - `originalValue: Date|string|null` - original value passed to setter - it could be different than value if not-null or defaultValue were applied on `value`
        - `name: string` - name of the property
        - `target: object` - the instance of object on which the setter function was called

### FloatType

`new FloatType(defaultValue?: number)` accepts numbers with decimals. Any string passed to this property
will be casted to number. Be aware that parsing can fail.

- `notNull()` - makes this property not-nullable
- `withCustomValidator(fn: function)` - validates value after all internal checks
    - function gets object for first parameter with keys:
        - `value: number|null` - a value that should be validated
        - `originalValue: number|null` - original value passed to setter - it could be different than value if not-null or defaultValue were applied on `value`
        - `name: string` - name of the property
        - `target: object` - the instance of object on which the setter function was called
- `decimals(x: number)` - constraints the float type to this number of decimals; if you pass a number with more decimals, it will be cut off (not rounded)
- `min(x: number)` - the minimum number accepted for this property
- `max(x: number)` - the maximum number accepted for this property
- `between(x: number, y: number)` - shorthand for combination of `min()` and `max()`

Example:

```ecmascript 6
class User extends Model {
    definition() {
        return {
            age: new FloatType()
                .notNull()
                .decimals(2)
                .min(18.5)
                .max(99.5)
                .between(18.5, 99.5)
        };
    }
}
```

### IntegerType

`new IntegerType(defaultValue?: number)` accepts only integers. Any string passed to this property
will be casted to integer. If you pass a number with decimals, decimals will be cut off (integer won't be rounded).

- `notNull()` - makes this property not-nullable
- `withCustomValidator(fn: function)` - validates value after all internal checks
    - function gets object for first parameter with keys:
        - `value: number|null` - a value that should be validated
        - `originalValue: number|null` - original value passed to setter - it could be different than value if not-null or defaultValue were applied on `value`
        - `name: string` - name of the property
        - `target: object` - the instance of object on which the setter function was called
- `min(x: number)` - the minimum number accepted for this property
- `max(x: number)` - the maximum number accepted for this property
- `between(x: number, y: number)` - shorthand for combination of `min()` and `max()`

Example:

```ecmascript 6
class User extends Model {
    definition() {
        return {
            age: new IntegerType()
                .notNull()
                .min(18)
                .max(99)
                .between(18, 99)
        };
    }
}

User.create({age: 100}); // throws TypeError because 99 is the max allowed value
```

### ObjectType

`new ObjectType(defaultValue?: object)` accepts JS objects.

- `notNull()` - makes this property not-nullable
- `withCustomValidator(fn: function)` - validates value after all internal checks
    - function gets object for first parameter with keys:
        - `value: object|null` - a value that should be validated
        - `originalValue: object|null` - original value passed to setter - it could be different than value if not-null or defaultValue were applied on `value`
        - `name: string` - name of the property
        - `target: object` - the instance of object on which the setter function was called

Example:

```ecmascript 6
class User extends Model {
    definition() {
        return {
            address: new ObjectType().notNull()
        };
    }
}

const user = User.create();

user.address = {
  street: 'Big street',
  number: 5
}; // ok

user.address = null; // throws TypeError
```

### StringType

`new StringType(defaultValue?: string)` accepts strings. If you pass a number, it'll be converted to string immediately.

If string property is set to be not null, then values like `undefined` or `null` will be always casted to empty string.
In other case, if property is nullable, then values like `undefined` and `null` will be `null`. Empty string value will
be converted to `null` as well.

- `notNull()` - makes this property not-nullable
- `withCustomValidator(fn: function)` - validates value after all internal checks
    - function gets object for first parameter with keys:
        - `value: string|null` - a value that should be validated
        - `originalValue: string|null` - original value passed to setter - it could be different than value if not-null or defaultValue were applied on `value`
        - `name: string` - name of the property
        - `target: object` - the instance of object on which the setter function was called

Example:

```ecmascript 6
class User extends Model {
    definition() {
        return {
            firstName: new StringType().notNull()
        };
    }
}

const user = User.create();

user.firstName = 'Vlatko'; // ok
user.firstName = 55; // ok, but converted to string "55"
```

---

## Lists

Lists are nothing else than array of one type or array of initialized Model instances.

To have an array of string-only elements, you may do:

```ecmascript 6
class Names extends List {
  definition() {
    return new StringType().notNull();
  }
}

const names = Names.create();
names.push('Vlatko'); // ok
names.push(null); // throws TypeError, not accepting null because type is not nullable
names[0] = 'John'; // ok
names[0] = null; // throws TypeError, not accepting null because type is not nullable
```

If want to have an array of, let's say, users, then you may do it like this:

```ecmascript 6
class User extends Model {
  definition() {
    return {
      firstName: new StringType(),
      age: new IntegerType(18)
    };
  }
}

class Users extends List {
  definition() {
    return User;
  }
}

const users = Users.create();

users.push({firstName: 'Vlatko'}); // ok
console.log(users.length); // returns 1
console.log(users[0].firstName); // 'Vlatko'
console.log(users[0].age); // returns 18 because users[0] is instance of User and "age" property has default value of 18
console.log(users[0] instanceof User); // true

// you can add an instance of User
const a = User.create({firstName: 'John', age: 30});
users.push(a); // ok
console.log(users[1].age); // 30

const b = User.create({firstName: 'Sue', age: 22, address: 'Other road'});
users.push(b); // ok
console.log(b[2].address); // throws an error because address is not defined in User model

users[1].age = []; // throws TypeError because "age" should be integer, not array
```

Once initialized, you may use the following methods:

- `toArray(): array` // returns array of all elements in the instance of List
- `getData(): array` // same as `toArray()`
- `toJSON(): array` // same as `getData()`, but will be automatically used if object is JSON serialized
- `setData(data: array): void` // sets new array of elements as its data
- `get(index: number): any` // gets the element from requested position in List
- `set(index: number, value: any): void` // sets the element on targeted position in List
- `reset(): void` // removes all elements from the List
- `count(): number` // returns how many elements instance of List has; it's same as using the `.length` property on the instance
- `clone(): new instance` // returns new instance of List with the same data (be aware that data is not "deep cloned")
- `forEvery(n: number, fn: function, thisArg: obj): void` // iterates through array every Nth element
- `mapEvery(n: number, fn: function, thisArg: obj): array` // same as Array.map, just goes for every Nth element 

All other methods are standard Javascript methods you may use on the instance of List:

- [entries](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/entries)
- [every](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every)
- [filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
- [find](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
- [findIndex](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex)
- [forEach](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach)
- [includes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes)
- [indexOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)
- [join](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/join)
- [keys](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/keys)
- [lastIndexOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/lastIndexOf)
- [map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
- [pop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/pop)
- [push](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push)
- [reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
- [reduceRight](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduceRight)
- [reverse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse)
- [shift](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/shift)
- [slice](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice)
- [some](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some)
- [sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- [splice](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
- [toLocaleString](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toLocaleString)
- [toString](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toString)
- [unshift](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift)
- [values](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/values)


### Anonymous lists

Sometimes, you may not want to define the list of Models or types "in the fly". Check an example:

```ecmascript 6
const list = List.create([], new BooleanType());
list.push(false);
list.push(true);
console.log(list[1]); // returns true
```
