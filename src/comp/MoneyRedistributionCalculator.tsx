import Button from "@/comp/system/Button.tsx";
import Bin from "@/icons/Bin";
import {createEffect, createMemo, createSignal, Index, onMount} from "solid-js";
import {z} from "zod";

type Person = {
    name: string;
    id: number;
}

type Expense = {
    who: number;
    description: string;
    spent: number;
}

/*
 const FIELD_DELIMITER = "~";
 const PERSON_DELIMITER = "_";
 const serializeState = (people: Person[]): string => {
 return people.map(p => `${p.name
 .replaceAll("\\", "\\\\")
 .replaceAll(FIELD_DELIMITER, `\\${FIELD_DELIMITER}`)
 .replaceAll(PERSON_DELIMITER, `\\${PERSON_DELIMITER}`)}${FIELD_DELIMITER}${p.paid}`)
 .join(PERSON_DELIMITER);
 };

 const parseState = (state: string): Person[] => {
 return state.split(PERSON_DELIMITER)
 .map(personString => {
 const [name, paid] = personString.split(FIELD_DELIMITER);
 return {
 name: (name || "")
 .replaceAll("\\\\", "\\")
 .replaceAll(`\\${FIELD_DELIMITER}`, FIELD_DELIMITER)
 .replaceAll(`\\${PERSON_DELIMITER}`, PERSON_DELIMITER),
 paid: +(paid || "0"),
 };
 });
 };
 */

type Action = {from: number, to: number, amount: number};

function* generateActions(spendings: number[]): Generator<Action, void, unknown> {
    if(spendings.length === 0) return;

    const spent = spendings.reduce((sum, a) => sum + a, 0);
    const spendingTargetPerPerson = spent / spendings.length;

    while(true) {
        // Find the person who spent the least.
        const minPerson = spendings.reduce<number>((minPerson, spent, person) =>
            spent < spendings[minPerson]!
                ? person
                : minPerson, 0)!;

        // There is no more money to transfer.
        if(Math.abs(spendings[minPerson]! - spendingTargetPerPerson) < 0.01) break;

        // Find the person who spent the most.
        const maxPerson = spendings.reduce<number>((maxPerson, spent, person) =>
            spent > spendings[maxPerson!]!
                ? person
                : maxPerson, 0)!;

        // Transfer the minimum amount to satisfy one.
        const transferAmount = Math.min(
            spendingTargetPerPerson - spendings[minPerson]!, // min belov avg
            spendings[maxPerson]! - spendingTargetPerPerson, // max above avg
        );

        yield {from: minPerson, to: maxPerson, amount: transferAmount};

        // Update spendings.

        spendings[minPerson]! += transferAmount;
        spendings[maxPerson]! -= transferAmount;
    }
}

/*
 const setDivSelection = (div: HTMLDivElement, start: number, end: number = start) => {
 const range = document.createRange();
 const selection = window.getSelection();

 if(!selection) return;

 // Remove any existing selections
 if(selection.rangeCount > 0) selection.removeAllRanges();

 // Set the start and end positions
 range.setStart(div.childNodes[0]!, start);
 range.setEnd(div.childNodes[0]!, end);

 // Add the range to the selection
 selection.addRange(range);
 };
 */

export default () => {
    /*
     onMount(() => {
     const params = new URLSearchParams(location.search);
     const s = params.get("people");
     if(s) setPeople(() => parseState(decodeURIComponent(s)));
     });

     createEffect(() => {
     history.replaceState(
     null,
     "",
     `/money-redistribution-planner/${people.length
     ? `?people=${encodeURIComponent(serializeState(people))}`
     : ""}`,
     );
     });

     const sum = createMemo(() => people.reduce((sum, person) => sum + person.paid, 0));
     */

    const [people, setPeople] = createSignal<Person[]>([]);
    const [expenses, setExpenses] = createSignal<Expense[]>([]);

    const summedExpenses = () => expenses().reduce(
        (sums, expense) => (
            sums[people().findIndex(p => p.id === expense.who)]! += expense.spent,
                sums),
        people().map(() => 0),
    );

    const getPersonByName = (name: string) => people()
        .find(p => p.name === name);
    const getPersonByID = (id: number) => people()
        .find(p => p.id === id);

    let idCounter = 0;

    onMount(() => {
        try {
            const localNames = z.array(z.string()).parse(JSON.parse(localStorage.people || "[]"));

            setPeople(localNames.map(name => ({name, id: idCounter++})));
        } catch(_) {
            localStorage.removeItem("people");
        }

        try {
            const localExpenses = z.array(z.object({
                who: z.string(),
                description: z.string(),
                spent: z.number(),
            })).parse(JSON.parse(localStorage.expenses || "[]"));

            setExpenses(localExpenses
                .map(({who, spent, description}) => {
                    const whoId = getPersonByName(who);

                    return whoId && {
                        who: whoId.id,
                        spent,
                        description,
                    };
                })
                .filter<Expense>(x => !!x));
        } catch(_) {
            localStorage.removeItem("expenses");
        }

        createEffect(() => {
            localStorage.people = JSON.stringify(people().map(p => p.name));
        });

        createEffect(() => {
            localStorage.expenses = JSON.stringify(expenses().map(({who, description, spent}) => ({
                who: getPersonByID(who)!.name,
                description,
                spent,
            })));
        });
    });

    const neededTransactions = createMemo(() => [...generateActions(summedExpenses())]);

    const countExpenses = (id: number) =>
        expenses().reduce((count, expense) =>
            expense.who === id ? count + 1 : count, 0);

    return (
        <>
            <section class={"p-6 mt-12 border-2 rounded-3xl border-shade-100"}>
                <h2 class={"mt-0 mb-6"}>People ({people().length})</h2>
                <div>
                    <Index each={people()}>
                        {person => (
                            <div class={"flex gap-3 mb-4"}>
                                <input
                                    type="text"
                                    class={"px-4 py-1 bg-shade-100 rounded-xl"}
                                    value={person().name}
                                    oninput={e => {
                                        setPeople(people => people.map(iterPerson => {
                                            if(iterPerson.id === person().id) return {
                                                name: e.currentTarget.value || "",
                                                id: iterPerson.id,
                                            };

                                            return iterPerson;
                                        }));
                                    }}
                                    onblur={e => {
                                        // Delete empty elements
                                        if(e.currentTarget.value === "" && countExpenses(person().id) === 0) {
                                            setPeople(people => people.filter(p => p.id !== person().id));
                                        }
                                    }}
                                    onkeydown={e => {
                                        if(e.code === "Enter") {
                                            e.preventDefault();
                                            setPeople(people => [...people, {name: "", id: idCounter++}]);

                                            // @ts-ignore
                                            e.currentTarget.parentElement.nextElementSibling.firstElementChild.focus();
                                        }
                                    }}
                                />
                                <button
                                    class={"block"}
                                    onclick={() => {
                                        if(countExpenses(person().id)) {
                                            if(!confirm(`Do you really want to delete "${person().name}"? This will result in deletion of their expenses.`)) {
                                                return;
                                            }

                                            // The user has no expenses, or they confirmed to delete.
                                            setExpenses(expenses => expenses.filter(exp => exp.who !== person().id));
                                        }

                                        setPeople(people => people.filter(p => p.id !== person().id));
                                    }}
                                >
                                    <Bin/>
                                </button>
                            </div>
                        )}
                    </Index>
                    <Button
                        onclick={e => {
                            setPeople(people => [...people, {name: "", id: idCounter++}]);
                            // @ts-ignore
                            e.currentTarget.previousElementSibling?.firstElementChild?.focus();
                        }}
                    >
                        + Add Person
                    </Button>
                </div>
            </section>
            <section class={"p-6 mt-6 border-2 rounded-3xl border-shade-100"}>
                <h2 class={"mt-0"}>Expenses ({expenses().length})</h2>
                <Index each={expenses()}>
                    {expense => (
                        <div class={"mb-8"}>
                            <input
                                type="text"
                                placeholder={"Name of the expense"}
                                class={"mb-4 block px-4 bg-shade-100 py-1 rounded-xl placeholder:text-shade-500 w-full placeholder:italic"}
                                value={expense().description}
                                onInput={e => {
                                    setExpenses(expenses => expenses.map(iterExpense => {
                                        if(iterExpense === expense()) return {
                                            ...iterExpense,
                                            description: e.currentTarget.value,
                                        };

                                        return iterExpense;
                                    }));
                                }}
                            />
                            <div class={"flex gap-4"}>
                                <select
                                    oninput={e => {
                                        setExpenses(expenses => expenses.map(iterExpense => {
                                            if(iterExpense === expense()) return {
                                                ...iterExpense,
                                                who: +e.currentTarget.value,
                                            };

                                            return iterExpense;
                                        }));
                                    }}
                                >
                                    <Index each={people()}>
                                        {person => (
                                            <option
                                                // data-x={JSON.stringify(person())}
                                                value={person().id}
                                                selected={expense().who === person().id}
                                            >{person().name}</option>
                                        )}
                                    </Index>
                                </select>
                                <input
                                    type="number"
                                    class={"grow w-0 block px-4 bg-shade-100 text-right py-1 rounded-xl"}
                                    value={expense().spent}
                                    onInput={e => {
                                        setExpenses(expenses => expenses.map(iterExpense => {
                                            if(iterExpense === expense()) return {
                                                ...iterExpense,
                                                spent: +e.currentTarget.value,
                                            };

                                            return iterExpense;
                                        }));
                                    }}
                                />
                                <button
                                    class={"block"}
                                    onclick={() => {
                                        setExpenses(expenses => expenses.filter(e => expense() !== e));
                                    }}
                                >
                                    <Bin/>
                                </button>
                            </div>
                        </div>
                    )}
                </Index>
                <Button
                    onClick={() => {
                        if(!people().length) return;

                        setExpenses(expenses => [...expenses, {
                            who: people()[0]!.id,
                            description: "",
                            spent: 0,
                        }]);
                    }}
                >
                    + Add Expense
                </Button>
                <hr/>
                <div class={"text-2xl font-semibold"}>
                    Total: {expenses().reduce((total, expense) => total + expense.spent, 0)}€
                    <br/>
                    Expenses per person
                    (mean): {Math.round(expenses().reduce((total, expense) => total + expense.spent, 0) / people().length * 100) / 100}€
                </div>
            </section>
            <section class={"p-6 mt-6 border-2 rounded-3xl border-shade-100"}>
                <h2 class={"mt-0"}>Needed Transactions ({neededTransactions().length})</h2>
                <Index each={neededTransactions()}>
                    {action => (
                        <div>{people()[action().from]!.name} needs to transfer {Math.round(action().amount * 100) / 100}€
                            to {people()[action().to]!.name}</div>
                    )}
                </Index>
            </section>
        </>
    );
}