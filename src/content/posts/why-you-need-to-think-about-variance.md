---
title: "Why You Need To Think About Variance"
tags: ["Article"]
description: "Dynamic typing, which is available in almost all big programming language, implies the discussion about variance. Here is why thinking about it is important."
---

During my journey of learning Kotlin, I always wondered what `in` and `out` meant. [The corresponding documentation page](https://kotlinlang.org/docs/generics.html#type-projections) was rich and hasn't changed significantly since then, but I have not encountered any issues from not using them.

Three years passed, and today I found myself asking: _would they have solved it?_ And by it, I am referring to the following code snipped discussed in [a Standup episode](https://youtu.be/dh6BCSzaF6g?si=h9NUYxjKDUKHeDIE):

```ts
const foo: string[] = ["a", "b"];

function illegal(arr: (string | number)[]) {
    arr.push(1);
}

illegal(foo);
```

This TypeScript code is _valid_ and will compile without errors. If you are not careful, it may even fail at runtime.

Basically, what this TypeScript code does is, it declares an array of strings and passes that to a function that accepts arrays that contain numbers _and_ strings. The function then pushes a number into the array, since it is an array of numbers and strings. Now, `foo` contains a number, although the type is still `string[]`.

_How can that be?_

## Variance – What Is It?

Essentially, the basic idea is that, for a generic type `X`, `X<A>` may be viewed as `X<B>`.

### Covariance

Consider this interface:

```ts
interface Producer<T> {
    produce(): T;
}
```

If you have a `Producer<number>`, then this producer object can be viewed as `Producer<number | string>` because every `number` is a `number | string`. This _property_ is called _covariance_.

The rigorous definition is:

```
            X is covariant over T
                    :<=>
T is subtype of S => X<T> is subtype of X<S>
```

### Contravariance

Conversely, consider this interface instead:

```ts
interface Consumer<T> {
    consume(t: T);
}
```

If you have a `Consumer<number | string>`, then calling the `consume()` function on this object with a `number` is totally fine (again because every `number` is a `number | string`). This means that every `Consumer<number | string>` can be safely cast to a `Consumer<number>`. This _property_ is called _contravariance_.

The rigorous definition is:

```
          X is contravariant over T
                    :<=>
T is subtype of S => X<S> is subtype of X<T>
```

### Subtypes

The operator `is subtype of` is defined as follows:

```
          A is subtype of B
                :<=>
forall a which have type A: a has type B
```

This is equivalent to TypeScript's `extends` operator.

### Variance And Functions

Covariance and contravariance of generic types is an effect of what methods involving the type parameter are declared on that type OR which we want to restrict us to.

But it always boils down to functions. If you are declaring a [covariant](#covariance) function on a generic type, then you cannot use this function in a contravariant way. Similarly, a [contravariant](#contravariance) function cannot be used covariantly. This means that to use both covariant and contravariant methods on a type, the _actual_ type must be invariant to the type (they must be the same type).

Example: consider a mutable list `MutableList` of things `T`. The list interface declares methods to access elements and to modify the list. To push elements of type `T` into a list of type `S` AND access elements of type `S` from a list of type `T`, `S` MUST be equal to `T`.

However, if you decide you only want to push `T`s into `MutableList<S>`, the list is contravariant, so `T` has to just be a subtype of `S`.

### Call-Site Variance

Because functions are contravariant over their parameters, you can pass a more specific type than required. Meaning:

```
               T is subtype of S
                      <=>
(function S -> X) is subtype of (function T -> X)
```

---

(Returning to our list example...)

Sometimes you only modify the list in the function. But the list is still invariant, so the caller cannot pass in a more general list. But this should be possible since you can push `T`s into a list of `S`s.

_Call-site variance_ fixes this.

```
               MutableList<T> is subtype of MutableList<S>
                                   <=>
(function MutableList<S> -> X) is subtype of (function MutableList<T> -> X)
```

## Application

Taking another look at the entry example, we can conclude that arrays in TypeScript are covariant because we can cast `string[]` to `(string | number)[]` without any error.

This works fine when accessing elements but quickly falls apart when mutating. To fix the issue in the code, we need to forbid one of the two lines:

```ts
arr.push(1); // (1) or
illegal(foo); // (2)
```

...meaning, either (1) we have to forbid pushing a `number` into `(string | number)[]` OR (2) we have to forbid casting a `string[]` to a `(string | number)[]`. This means forbidding either contravariance (1) OR covariance (2).

TypeScript has no way of declaring that, [in fact](https://github.com/Microsoft/TypeScript/wiki/FAQ#why-are-function-parameters-bivariant) function parameters are _bivariant_ (meaning contra- and covariant), which leads to unsoundness issues (including our bug from above).

Concluding, what you should be able to pass into the function is depending on what you _do with it_ in the function.

## Fixing Unsoundness

This issue solely arises as an effect of TypeScript's type system. But this is not the only type system out in the wild. Let's look at Kotlin and how the problem is solved in its type system.

```kt
open class Super {}

class A : Super() {}
class B : Super() {}

fun illegal(list: MutableList<Super>) {
    list.add(B())
}

fun main() {
    val foo: MutableList<A> = mutableListOf(A(), A())
    
    illegal(foo)
}
```

(Kotlin does not have type unions, so `A` represents a `string`, `B` a `number`, and `Super` the union `number | string`.)

Compiling that yields an error at `illegal(foo)`:

```
Argument type mismatch: actual type is 'MutableList<A>', but 'MutableList<Super>' was expected.
```

This is because function parameters are contravariant.

An important factor is that `MutableList<E>` is invariant over `E` (meaning, neither contra- nor covariant) for all methods of `MutableList` to be callable. This is because the `MutableList` interface declares methods that are both consumers and producers.

Because we are modifying the list in the function, it MUST be contravariant as well ("consumer"). This _prevents_ us from calling it with a covariant type.

However, we can _declare_ that this parameter is covariant using Kotlin's (excellent) use-site variance called "type projections". The keyword is `out`:

```kt
open class Super {}

class A : Super() {}
class B : Super() {}

fun illegal(list: MutableList<out Super>) {
    list.add(B())
}

fun main() {
    val foo: MutableList<A> = mutableListOf(A(), A())
    
    illegal(foo)
}
```

But what does this do? Since we now declare our list parameter as covariant, we are not allowed to modify the list. This means, the error is now at `list.add(B())`.

The corresponding contravariance keyword is `in`. The naming is quite smart because

## Ideally...

...you would not have encountered this issue in Kotlin because if you were to pass in a list that you only read from, you would use [the `List` interface](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-list/), which is covariant (!!!).

By default, Kotlin assumes that you use the contravariance of input parameters.

## Unique Corner Cases

Marking a type parameter bivariant (meaning, contravariant AND covariant) is not allowed in Kotlin, but it would be technically possible. Since covariant types cannot be mutated with a subtype, and contravariant types cannot be "viewed" as a subtype, you can only call functions on a bivariant type excluding this type parameter. E.g., this TypeScript interface

```ts
interface X<in out T> {
    printHelloWorld(): void;
}
```

would be bivariant, but the type parameter is pointless since it is not used in any way.

Technically, this kotlin interface

```kotlin
interface Y<T> {
    fun greet(value: T)
    
    fun greetEverybody()
}
```

could be restricted to be bivariant at use-site. Though you would only be able to call `greetEverybody()`.

## _But how do we solve the TypeScript problem?_

Since TypeScript does not have the concept of use-site variance (it does have variance on type aliases, interfaces, and classes when you declare them), the next best thing is to _disallow_ the cast `string[] -> (string | number)[]` because they should not be covariant.

Instead, `string[]` should only be castable to `readonly (string | number)[]` because `T[]` is a subtype of `readonly T[]` which is covariant. This prevents modifications.

For when you need contravariance, TypeScript could add a modifier called `writeonly` which is contravariant: `T extends S => writeonly S[] extends writeonly T[]`. That means any `writeonly S[]` can be cast to `writeonly T[]`.

Or, TypeScript could add use-site variance (like Kotlin's) using the existing `in` and `out` keywords.