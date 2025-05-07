---
title: "Effective Enums In TypeScript"
description: "TypeScript shines in many parts of the language. But enums is not one of them. Let’s explore how to implement effective enums."
tags: [ "Article" ]
---

Like in life, when implementing an enum in TypeScript, you have to make a choice. This choice depends on how your
variants are shaped. You’ll also get to choose between bundle size and developer experience, like always in TypeScript.
How fun!

## What Are Enums?

Just that we’re on the same page: an enum (or an enumeration) is a type that is always one of the specified variants. It
is a finite, named set of values that are allowed to exist.

Another way to think of enums is a tagged union of other types. Meaning, the discriminant is some metadata associated
with each value that tells you which variant it is ("tagged"). And it is a union of all possible variants.

## Making Enums Like God Intended

And by God, I mean TypeScript itself. Yes, TypeScript has built-in enum support. Let’s look at it:

```ts
enum DangerLevel {
    Low = 1,
    Medium = 2,
    High = 3,
}
```

This is just a simple enum with three variants. And it is exhaustive, meaning only these variants are allowed.

But already the first quirk arises. Although the enum is exhaustive, one can still write this code

```ts
let lvl: DangerLevel = 1;
```

...and this is perfectly fine. Why? Because the built-in enums are just syntactic sugar for an object with variant
properties and the object identifier also being a type union of all variant values.

In this case the equivalent code could look something like this:

```ts
const DangerLevel = {
    Low: 1,
    Medium: 2,
    High: 3,
};

type DangerLevel = 1 | 2 | 3;
```

Because enums in TypeScript only name and restrict values to constants, you can assign 1 in the example above.

### Compilation Output

Compiling built-in enums yields not what you would expect. It is one of these cases where the isolation of tools in the
build chain leads to an increased bundle size.

The enums get compiled to an object with the variant properties, and each variant access will not be replaced with the
compile-time known constant, but instead be regular property access.

This is basically equivalent to the problem with namespaces.

## Making Enums The C Way

To mitigate the object access at runtime, including the increased bundle size, we can borrow the mitigation technique
from namespaces: type mangling.

The enum above now would look like this:

```ts
const DL_LOW = 1;
const DL_MEDIUM = 2;
const DL_HIGH = 3;

type DangerLevel = typeof DL_LOW
    | typeof DL_MEDIUM
    | typeof DL_HIGH;
```

This type mangling was and is still done in C. Now each variant is a constant instead of a property, so the values will
be inlined.

This approach reduces code size and may increase performance, but at the cost of developer experience.

## The Forbidden Apple

God gave us a second built-in enum, but said you should not use it: const enums. Behaves like regular built-in enums,
but with inlined values. It is the dream, isn’t it?

Long story short. While there are use cases, you should not use it because it interoperates badly with JavaScript and
does not work if you are building a library, or you are using isolated module compilation.

Just don’t use it, what a bummer.

## The Big Guns

Now for some advanced enums. Commonly, you’ll encounter enums with associated data in trees, like abstract syntax trees
or expression trees.

To implement these enums, TypeScript does not give you any support, beyond types. These enums are data-centered, which
means that their type’s union mostly contains literal objects.

To distinguish between variants, you’ll now have to implement your own discriminant. You can either rely on value types
or object properties. The latter commonly contains values of a child enum, a number, implemented using one of the
options discussed earlier; or just self-describing strings.

Consider an example, an expression tree. We want an expression to be a number, a negation, an addition or a
multiplication. Let’s look at the common implementation:

```ts
type Expression = number
    | {type: "negate", inner: Expression}
    | {type: "add", left: Expression, right: Expression}
    | {type: "multiply", left: Expression, right: Expression}
```

It may not look like one, but this is an implementation of an enum. But it’s quite interesting because it relies on two
types of discriminants.

## Value Types

JS has seven primitives and the object. So if you have a value, it is always of one of these seven. The way you
differentiate is with the typeof operator:

```ts
if(typeof something === "string") {
    console.log("Something is a string!");
}
```

So, to check if an expression is the number variant, you use the typeof operator because all other variants are objects.
This "property" uniquely identifies the number variant.

## Custom Discriminants

To check whether the expression is a negation, addition or a multiplication is more challenging. JavaScript requires you
to use objects for more complex variants, but there is no free discriminant.

Objects in JavaScript can be "tagged" using their prototype. I won’t explain prototypes, but essentially it is
describing from which class an object was instantiated from. This means you can check the prototype of an object at
runtime (using the instanceof operator).

The reason nobody uses this in enums is that you’d need a separate class for each variant, and pattern matching against
variants becomes undesirable. You’d also need to manage n classes along with your enum, which just introduces bloat.

What people actually do (and you should do too) is different. They add a "type" property to each object variant with a
unique constant value (most times a string or a child enum). This enables them to switch over the object variants,
effectively pattern matching (TypeScript helps here).

Let’s implement an expression evaluation function:

```ts
const ev = (e: Expression) => {
    if(typeof e === "number")
        return e;

    switch(e.type) {
        case "negate":
            return -ev(e.inner);
        case "add":
            return ev(e.left)
                + ev(e.right);
        case "multiply":
            return ev(e.left)
                * ev(e.right);
    }
}
```

See, how we first short-circuit the number, so that we know there is an object to match against the type property, our
second discriminant?

This pattern is common in TypeScript and IMO the way you should do it too. The only thing we could maybe change is to
elevate the number into an object, so we would only need one switch statement. The drawback, however, would be that you
will have to allocate an object even if the expression is only a number.

### Named Variant Constants

As complex enums grow in size, representing the variants' discriminant using const strings may fall out of favor. In
this case, storing numbers is a good approach. Let’s look at an example:

```ts
type ApplicationState = {type: typeof AS_IDLE}
    | {type: typeof AS_RUNNING, runner: Runner}
    | {type: typeof AS_INPUT, input: string}
/* ... */;

const AS_IDLE = 1;
const AS_RUNNING = 2;
const AS_INPUT = 3;
/* ... */
```

Using constants as the discriminant reduces bundle size but decreases DX. It is a trade off. Also, your code is a little
more anonymous.