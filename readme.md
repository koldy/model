# Koldy Model

Koldy Model ensures correct and strict structure of Javascript object instances in runtime so you don't have to worry any more
if you have a string or number, is it integer or float, is it undefined, null or something useful. It works best
with ES6 classes and it supports data structures (objects) and lists (arrays) of these data structures (objects).

It can be used to "parse" JSON responses by initializing correct data structures, collect input from forms
and still keep the correct data structures and types or to ensure that you send correct JSON structure to your backend.
It is specially useful when you're dealing with a lot of different data structures that needs to be reused on a large-scale
single page app.

All instances of Model and List are mutable, so to change the reference to initialized Model or List, simply call `clone()`
method.

## Installation

```shell script
npm install koldy-model
yarn add koldy-model
```

## Usage - ES6

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

## Types

There are various data types that can be used from koldy-model out of the box.

### StringType

Forces property to be string always, unless it's nullable.

```ecmascript 6
class User extends Model {
    definition() {
        return {
            firstName: new StringType() // defines "firstName" property to be string or null
                .notNull() // constraints firstName to never be null
        };
    }
}

const user = User.create();

user.firstName = 'Vlatko'; // ok
user.firstName = 55; // ok, but converted to string "55"
```

If string property is set to be not null, then values like `undefined` or `null` will be always casted to empty string.
In other case, if property is nullable, then values like `undefined` and `null` will be `null`, but ALSO, empty string will
be converted to `null`.

### IntegerType

Allows property to be integer. Strings and floats are automatically converted to integer. If string conversion to integer
fails, TypeError will be thrown. Decimals in float numbers are cut off.

```ecmascript 6
class User extends Model {
    definition() {
        return {
            age: new IntegerType() // defines "age" property to be integer (not float) or null
                .notNull() // constraints age to never be null
                .min(18) // doesn't allow age to be less than 18
                .max(99) // doesn't allow age to be bigger than 99
                .between(18, 99) // shorthand for min() and max() - not needed if min() and max() are used
        };
    }
}
```

### FloatType

Allows property to be float. Strings are automatically converted to float. If string conversion fails, TypeError
will be thrown.

```ecmascript 6
class User extends Model {
    definition() {
        return {
            age: new FloatType() // defines "age" property to be float or null
                .notNull() // constraints age to never be null
                .min(18.5) // doesn't allow age to be less than 18
                .max(99.5) // doesn't allow age to be bigger than 99
                .between(18.5, 99.5) // shorthand for min() and max() - not needed if min() and max() are used
                .decimals(2) // accepted float numbers will be cut to 2 decimals (number 55.12345 will be accepted as 55.12)
        };
    }
}
```

### BooleanType

Allows property to be boolean. 

```ecmascript 6
class User extends Model {
    definition() {
        return {
            isActive: new BooleanType() // defines "isActive" property to be boolean or null
                .notNull() // constraints isActive to never be null
        };
    }
}
```

### AnyType

Property of this type accepts any type and can change its type in runtime.

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

Property of this type must be array. Elements in array can be anything.

```ecmascript 6
class User extends Model {
    definition() {
        return {
            names: new ArrayType() // defines "names" property to be array or null
                .notNull() // constraints names to never be null
        };
    }
}

const user = User.create();

user.names = ['First', 'Middle', 'Last']; // ok
user.names = null; // throws TypeError
```

### ObjectType

Property of this type must be Javascript object of any structure.

```ecmascript 6
class User extends Model {
    definition() {
        return {
            address: new ObjectType() // defines "address" property to be string or null
                .notNull() // constraints address to never be null
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

### Features in all types

#### Default value

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

#### Nullable / Not Nullable

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

#### Custom validator

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

## Anonymous lists

Sometimes, you may not want to define the list of Models or types "in the fly". Check an example:

```ecmascript 6
const list = List.create([], new BooleanType());

list.push('John'); // throws an error, because pushed item should be boolean, not string
```

## Nesting

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
