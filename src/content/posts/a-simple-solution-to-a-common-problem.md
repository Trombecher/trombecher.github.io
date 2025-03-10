---
title: "A Simple Solution To A Common Problem"
description: ""
tags: ["Article"]
---

One day or another you will find yourself with friends on a holiday. But it's annoying to split every bill you encounter between everyone. So each time one person pays and at the end of the holiday everyone will have paid different amounts.

The problem is that everyone wants to have paid the same amount. So how do you calculate who owns whom what amount?

I, personally, have encountered the problem multiple times, so I thought about a solution instead of eye-balling it. In the process I came across two strategies.

## Strategy 1 "Pass And Pay"

First, identify the mean by dividing the total amount by the number of people. This is the "target" amount everyone "strives" to have paid.

Then you'll sort all people by how much they've paid. The person who has paid the least, _A_, is going to pay the "next" person _B_ (the person has paid the least excluding current) a specific amount, so that after that transaction, _A_ has paid the target amount.

After that, _A_ is done and can be ignored, so person _B_ continues. This schema is applied until all people have paid the target amount.

### Drawbacks

This strategy has numerous drawbacks.

Although all transactions can happen in parallel, almost always there will be a case where a person will receive an enormous amount of money ("collected" by previous people), just to add like $10 and pass the sum along to the next person.

This is not just bad considering security, but a person might have to wait until the previous person does the transaction, because they might not have enough money.

You'll also be handling money that you don't own, at least temporarily. People might not want this.

---

These problems are addressed by the next strategy:

## Strategy 2 "Minmax Pay"

For this strategy you'll also want to calculate the mean.

Then you scan the people's balances and return the person who has paid the least, _A_, and the person who has paid the most, _B_.

Then _A_ will pay _B_ the minimum amount possible to satisfy _A_ or _B_, _satisfy_ meaning hitting the mean. This minimum satisfaction is done so no one overshoots their mean.

Example: let _A_ be having paid $20 and _B_ $50 with a mean of $30. Then _A_ will only pay $10 to _B_, satisfying _A_ to $30 and _B_ is still not satisfied.

The people who have been satisfied by the transaction are removed and the cycle continues until everyone is satisfied.

## Comparing To Strategy 1

In each step of the iteration, at least one person is guaranteed to be satisfied and is removed. This results in having at most n-1 transactions.

In S1 there are cases where money will be passed along. This won't happen in S2, because you will either ONLY receive money or ONLY pay money (depending on if you're above the mean or below).

## Implementing Strategy 2 In Code

No one wants to do maths by hands if we have a computer that can do it for us. I choose TypeScript, as it is straightforward.

First, how do we model the people in code. There are many options, I chose mapping strings to numbers (balances). I also could have written a generator function, but those are less intuitive in my opinion.

```ts
type Transaction = {
    from: string,
    to: string,
    amount: number
};

function redistribute(paid: Map<string, number>): Transaction[] {
    if(paid.size === 0) return [];
    
    const ts = [];
    
    // Calculate the mean:
    const mean = paid.values()
        .reduce((sum, p) => p + sum, 0) / paid.size;
    
    // Remove all people that are already satisfied:
    for(const [person, amount] of paid.entries()) {
        if(amount === mean) {
            paid.delete(person);
        }
    }
    
    while(paid.size > 0) {
        let minPerson,
            minPersonPaid,
            maxPerson,
            maxPersonPaid;
        
        // Find minimum and maximum person:
        for(const [person, amount] of paid.entries()) {
            if(!minPerson || minPersonPaid > amount) {
                minPerson = person;
                minPersonPaid = amount;
            } else if(!maxPerson || maxPersonPaid < amount) {
                maxPerson = person;
                maxPersonPaid = amount;
            }
        }
        
        // Calculate the transaction amount
        const transactionAmount = Math.min(mean - minPersonPaid, maxPersonPaid - mean);

        // Update the min person's paid amount; or remove them, if they're satisfied.
        if(minPersonPaid + transactionAmount === mean) {
            paid.delete(minPerson);
        } else {
            paid.set(minPerson, minPersonPaid + transactionAmount);
        }
        
        // Update the max person's paid amount; or remove them, if they're satisfied.
        if(maxPersonPaid + transactionAmount === mean) {
            paid.delete(maxPerson);
        } else {
            paid.set(maxPerson, maxPersonPaid - transactionAmount);
        }
        
        // Store transaction
        ts.push({
            from: minPerson,
            to: maxPerson,
            amount: transactionAmount
        });
    }
    
    return ts;
}
```