---
title: "Why You Need To Think About Variance"
tags: ["Article"]
description: "Dynamic typing, which is available in almost all big programming language, implies the discussion about variance. This is a guide to variance and its application."
pubUnix: 1752101357223
---

Recently on the Standup, a series of TypeScript examples was discussed, including this code sample (insignificantly altered):

```ts
const foo: string[] = ["a", "b"];

function illegal(arr: (string | number)[]) {
    arr.push(1);
}

illegal(foo);
```

This TypeScript code is _valid_ and will compile without errors. But why? It is obviously false! The string array will contain a number. I'll give a clue: it has something to do with variance.

## What Is Variance?

Variance is the part of type theory that concerns itself with subtyping. It is a concept that applies when asking the question:

_Is type `A` a subtype of `B`?_

For this article, a _type_ represents a **set of all values** this type can represent. This formalizes the latter question into subset notation: $A \subseteq B$, specifically: _is every value in $A$ also in $B$?_ (Fancy math notation: $\forall a \in A: a \in B$.)

$A \subseteq B$ can thus be read as "A is a subtype of B", "A extends B", or "A can be cast to B".

Type unions `A | B` have the equivalent (and more accurate) formal definition: $A \cup B$.

Examples from TypeScript:

* $\text{number} \subseteq \text{number} \cup \text{string}$
* $A \subseteq B \Leftrightarrow A \text{ extends }B$
* $10 \subseteq \text{number}$, with $10$ as the type representing a set of the value `10`
* $\text{\{x: number\}} \subseteq$ $\text{\{x: number, y: string\}}$

## Parameterized Types

As applications get more complex, there is a need for _generic_ (or _parameterized_) types. They are also referred to as _type constructors_. For example, a type $X$ is generic over $T$, written as $X(T)$ or `X<T>`.

What variance theory does is it relates the subtyping question of generic types to their parameters.

## Covariance And Contravariance

A generic type $X(Y)$ is said to be _covariant over a parameter_ $Y$ if (and only if) $A \subseteq B$ implies that $X(A) \subseteq X(B)$.

Conversely, a generic type $X(Y)$ is said to be _contravariant over a parameter_ $Y$ if (and only if) $A \subseteq B$ implies that $X(B) \subseteq X(A)$.

---

To apply this concept, let's look at functions.

## Functions

In any reasonable programming language there are function types. For this article, function types are generic types of the form `Fn<InputType, OutputType>`.

**Functions are covariant over the codomain (output type) and contravariant over the domain (input type).**

<details class="mt-6">
<summary class="cursor-pointer">Here is the proof:</summary>

$\text{Let } f \in B^A \text{, } C \text{ a set, } B \subseteq C \text{.}$

$\Rightarrow \exists id \in C^B, b \mapsto b$  
$\Rightarrow id \circ f \in C^A$  
$\Rightarrow id \circ f = (id \circ f)(a) = (id(f(a)))(a) = (f(a))(a) = f$  
$\Rightarrow f \in C^A$  
$\Rightarrow f \text{ is covariant over the codomain.}$  

$\text{Let } f \in C^B \text{, } A \text{ a set, } A \subseteq B \text{.}$

$\Rightarrow \exists id \in B^A, a \mapsto a$  
$\Rightarrow f \circ id \in C^A$  
$\Rightarrow f \circ id = (f \circ id)(a) = (f(id(a)))(a) = (f(a))(a) = f$
$\Rightarrow f \in C^A$  
$\Rightarrow f \text{ is contravariant over the domain.}$

</details>

But variance does not only apply to functions but to any generic type. Because interacting with an instance of a generic type requires calling some sort of method _on_ the object, the concept of variance is derivable from functions.

## Declaration-Site Variance

### Declaration-Site Covariance

This is best explained with an example in TypeScript:

```ts
//             covariance annotation at
//             type declaration (optional)
//             \/
interface Into<out T> {
    into(): T;
}

const a: Into<string> = {
    into() {
        return "Hello, World";
    }
};

const b: Into<number | string> = a;
```

The interface `Into` is always covariant over `T` because all methods you can call on instances are covariant. In this example an instance of `Into<string>` is validly cast to `Into<number | string>` because `Into` is covariant and `string` is a subtype of `number | string`.

This works because you are implicitly casting a function of type `() -> number` to `() -> number | string` and this works because functions are covariant on their codomains.

### Declaration-Site Contravariance

This is best explained with another TypeScript example:

```ts
//             contravariance annotation at
//             type declaration (optional)
//             \/
interface From<in T> {
    from(value: T): string;
}

const a: From<number | string> = {
    from(value: number | string) {
        return `value: ${value}`;
    }
};

const b: From<number> = a;
```

The interface `From` is always contravariant over `T` because all methods you can call on instances are contravariant. In this example an instance of `From<string | number>` is validly cast to `From<number>` because `From` is contravariant and `number` is a subtype of `number | string`.

This works because you are implicitly casting a function of type `(number | string) -> void` to `(number) -> void` and this works because functions are contravariant on their codomains.

### Declaration-Site Bivariance

A type is _bivariant_ iff it is contravariant and covariant. But this can only happen if the parameter is never used in a method.

If it were to be used in a return-type of a method, for example, then this method would not be contravariant, rendering the type as non-contravariant.

If the type parameter were to be used in a parameter of a method, then this method would not be covariant over that parameter, which would render the type as non-covariant.

Technically, you can declare bivariant types and interfaces. But since the parameter is never used, it can be removed. This also explains the property of a bivariant type `X` that `X<A>` would always be a subtype of `X<B>` because you could cast `X<A>` to `X<any>` (where `any` represents the type of all possible values) and then `X<any>` to `X<B>`.

### Declaration-Site Invariance

A type is _invariant_ iff it is neither contravariant nor covariant. This is by far the most common form of variance. Having an invariant type means you have no flexibility: you have to pass in the exact type.

Invariance in types and interfaces stems from the fact that they declare both contravariant and covariant methods. To use all methods, the type MUST be invariant.

### A Rule Of Thumb

To know if a generic type or interface is covariant, look at the method signatures. If none of them have the type parameter in their parameter list, the type is covariant. Conversely, if no methods have the type parameter in their return type, then the type is contravariant.

Some compilers will infer these properties automatically, but it does not hurt to annotate them manually. TypeScript and Kotlin use the keywords `in` and `out` to denote contravariance and covariance respectively.

The names are straightforward to remember:

* variance on function `in`-put: contravariance
* variance on function `out`-put: covariance

---

But sometimes you want to restrict yourself in what you want to use. This is where use-site variance is applied.

## Use-Site Variance

The core concept of use-site variance is to restrict a type to be contravariant or covariant when you only use it this way. This is commonly done functions.

There are no examples of use-site variance in TypeScript because TypeScript's type system has no such annotations. Therefore, I will be using examples from Kotlin, which is (in many ways) very similar to TypeScript.

Use-site variance is explained best with an example:

```kt
interface StackLike<T> {
    fun push(v: T)
    fun pop(): T
}

open class A {}
open class B : A() {}
class C : B() {}

fun processStack(stack: StackLike<B>) {
    onlyPop(stack) // (1)
    onlyPush(stack) // (2)
}

fun onlyPop(stack: StackLike<A>): A {
    return stack.pop()
}

fun onlyPush(stack: StackLike<C>) {
    stack.push(C())
}
```

(The types/classes have this hierarchy: $C \subseteq B \subseteq A$.)

This code will fail to compile (type-check) with two errors at lines (1) and (2). Why? Because `StackLike` is invariant over `T`. This is because it both contains methods with `T` in arguments as well as a return type.

But this code _should_ work, since we only _use_ the type in a covariant context in `onlyPop` or in a contravariant context in `onlyPush` respectively.

This is what use-site variance declarations enable. To make the code compile, we modify the signatures of `onlyPop` and `onlyPush` to:

```kt
fun onlyPop(stack: StackLike<out A>): A

fun onlyPush(stack: StackLike<in C>)
```

Basically, what we declare is a "contract". We allow the caller to be more flexible what to pass into our function while we adhere to the restrictions. For example in

```kt
fun modify(stack: StackLike<in C>): C {
    stack.push(C())
    return stack.pop()
}
```

calling `stack.pop()` is _possible_. But we cannot do anything with the return type because it is not `C`, it is `CapturedType(in C)`.

### The Mental Model

When you see `X<in Y>`, you can think of it as `X<Z>` with $Y \subseteq Z$, like a "minimum" requirement. `in Y` is _something more general_ than `Y`.

Conversely, `out Y` can be thought of _something more specific_ than `Y`, `Y` as a "maximum" requirement.

This is similar to the way Java does it: `X<in Y>` in Kotlin is equivalent to `X<? super Y>` and `X<out Y>` is equivalent to `X<? extends Y>` in Java. However, Java does not have declaration-site variance.

## Solutions For Languages With No Use-Site Variance

TypeScript does not have use-site variance. But we can emulate it with extra types.

For example, the Set type could be made covariant with an interface `ReadonlySet` (which already exists) and an interface `WriteonlySet` which would be contravariant. This would allow valid casts `Set<T> -> ReadonlySet<U>` and `Set<U> -> WriteonlySet<T>` for `T extends U`.

These new interfaces would include all covariant and all contravariant functions respectively.

## Back To The TypeScript example

Now can you spot what was wrong with that TypeScript sample?

```ts
const foo: string[] = ["a", "b"];

function illegal(arr: (string | number)[]) {
    arr.push(1);
}

illegal(foo);
```

This code sample highlights a core feature in TypeScript's type system: the lack of use-site variance. But that is not the issue. TypeScript allows the cast `string[] -> (string | number)[]`, but this cast is invalid. Rather, `string[] -> readonly (string | number)[]` should be the only valid cast. This would disallow the push.

But this also highlights another issue: TypeScript's functions are [bivariant on their parameters](https://github.com/Microsoft/TypeScript/wiki/FAQ#why-are-function-parameters-bivariant). And TypeScript knows this. But why are they bivariant?

## TypeScript's Issue

Arrays in TypeScript are both writeable and readable, so they _should_ be invariant over their type parameter. But this would result in annoyances like:

```ts
function countItems(arr: any[]) {
    console.log(arr.length);
}

const strings: string[] = ["a", "b"];

// Error: string[] is not a subtype of any[]
countItems(strings);
```

This code _should_ work and would work if we could change the `countItems` signature to:

```ts
function countItems(arr: (out any)[])
```

But we can't, so we can't tell the compiler that we're only using covariant methods on the array. But forbidding this code would be incredibly annoying. So the compiler just chose to allow it, therefore making function parameters covariant.

(Actually, we should be able to annotate `any` with `in` and `out`, since length is neither a function, nor does it take in the type parameters, nor does it return an instance of the type parameter. It just returns a quantity independent of the type parameter, marking it as _invariant_.)

## What TypeScript Could Do To Fix This

First, TypeScript needs to disallow these casts, making functions contravariant-only on their parameters. Obviously, they _could_ add use-site variance to the language, but I don't think that is going to happen.

Instead, they could provide readonly (covariant) and writeonly (contravariant) interfaces of all built-in classes. This way they could allow covariant casts between `string[]` and `readonly (string | number)[]`, but forbit `string[]` to `(string | number)[]`. The same with contravariance.

Then, the function signature from above would change to:

```ts
function countItems(arr: readonly any[])
```

## Wrapping Up

A final answer to the question at the top of this article "But why?" would be:

**Because TypeScript's functions are bivariant on their parameters due to a tradeoff for ergonomics working in a type system that lacks use-site variance.**

And this is why you need to think about variance.