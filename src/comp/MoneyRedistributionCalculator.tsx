import Button from "@/comp/system/Button.tsx";
import Bin from "@/icons/Bin";
import {createEffect, createMemo, For, onMount} from "solid-js";
import {createStore} from "solid-js/store";
import {z} from "zod";

type Person = {
    name: string,
    readonly id: number,
};

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
        // Find the person who spend the least.
        const minPerson = spendings.reduce<number>((minPerson, spent, person) =>
            spent < spendings[minPerson]!
                ? person
                : minPerson, 0)!;

        // There is no more money to transfer.
        if(Math.abs(spendings[minPerson]! - spendingTargetPerPerson) < 0.01) break;

        // Find the person who spend the most.
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
};

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

type Expense = {
    /** Person id */
    who: number,
    description: string,
    spent: number
};

const PEOPLE_STORE_SCHEMA = z.set(z.string());
const EXPENSES_STORE_SCHEMA = z.array(z.object({
    who: z.string(),
    description: z.string(),
    spent: z.number(),
}));

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

    const [people, setPeople] = createStore<Person[]>([]);
    const [expenses, setExpenses] = createStore<Expense[]>([]);

    const summedExpenses = () => expenses.reduce(
        (sums, expense) => (
            sums[people.findIndex(p => p.id === expense.who)]! += expense.spent,
                sums),
        people.map(() => 0),
    );

    const getPersonByID = (id: number) => people.find(p => p.id === id);
    let idCounter = 0;

    onMount(() => {
        try {

            setPeople(() => [...PEOPLE_STORE_SCHEMA.parse(
                new Set(JSON.parse(localStorage.people || "[]")),
            ).values()].map(name => ({name, id: idCounter++})));
        } catch(_) {
        }

        try {
            setExpenses(() => EXPENSES_STORE_SCHEMA.parse(
                JSON.parse(localStorage.expenses || "[]"),
            )
                .map(({who, spent, description}) => {
                    const whoID = people.find(x => x.name === who)?.id;
                    return whoID !== undefined && {
                        who: whoID,
                        spent,
                        description,
                    };
                })
                .filter(x => !!x));
        } catch(_) {
        }

        createEffect(() => {
            localStorage.people = JSON.stringify(people.map(p => p.name));
        });

        createEffect(() => {
            localStorage.expenses = JSON.stringify(expenses.map(({who, description, spent}) => ({
                who: getPersonByID(who)!.name,
                description,
                spent,
            })));
        });
    });

    const neededTransactions = createMemo(() => [...generateActions(summedExpenses())]);

    const countExpenses = (id: number) =>
        expenses.reduce((count, expense) =>
            expense.who === id ? count + 1 : count, 0);

    return (
        <>
            <section class={"p-6 mt-12 border-2 rounded-3xl border-shade-100"}>
                <h2 class={"mt-0 mb-6"}>People ({people.length})</h2>
                <div>
                    <For each={people}>
                        {({name, id}, i) => (
                            <div class={"flex gap-3 mb-4"}>
                                <div
                                    contenteditable
                                    oninput={e => {
                                        setPeople(i(), {
                                            name: e.currentTarget.textContent || "",
                                            id: idCounter++,
                                        });
                                    }}
                                    onblur={e => {
                                        // Delete empty elements
                                        if(e.currentTarget.textContent === "" && countExpenses(id) === 0) {
                                            setPeople(people => people.filter((_, index) => index !== i()));
                                        }
                                    }}
                                    onkeydown={e => {
                                        /*
                                         if(e.currentTarget.textContent === "" && e.code === "Backspace") {
                                         e.preventDefault();
                                         const prev: HTMLDivElement | null = e.currentTarget.previousElementSibling as any;

                                         setPeople(people => people.filter((_, index) => index !== i()));

                                         prev?.focus();
                                         if(prev) setDivSelection(prev, (prev.textContent || "").length);
                                         }
                                         */

                                        if(e.code === "Enter") {
                                            e.preventDefault();
                                            setPeople(people.length, {name: ""});

                                            // @ts-ignore
                                            e.currentTarget.parentElement.nextElementSibling.firstElementChild.focus();
                                        }
                                    }}
                                    class={"px-4 py-1 bg-shade-100 rounded-xl"}
                                >{name}</div>
                                <button
                                    class={"block"}
                                    onclick={() => {
                                        if(0 !== countExpenses(id)) {
                                            if(!confirm(`Do you really want to delete "${name}"? This will result in deletion of their expenses.`)) {
                                                return;
                                            }

                                            // The user has no expenses, or they confirmed to delete.
                                            setExpenses(expenses => expenses.filter(exp => exp.who !== id));
                                        }

                                        setPeople(people => people.filter(p => p.name !== name));
                                    }}
                                >
                                    <Bin/>
                                </button>
                            </div>
                        )}
                    </For>
                    <Button
                        onclick={e => {
                            setPeople(people.length, {name: ""});
                            // @ts-ignore
                            e.currentTarget.previousElementSibling?.firstElementChild?.focus();
                        }}
                    >
                        + Add Person
                    </Button>
                </div>
            </section>
            <section class={"p-6 mt-6 border-2 rounded-3xl border-shade-100"}>
                <h2 class={"mt-0"}>Expenses ({expenses.length})</h2>
                <For each={expenses}>
                    {({who, description, spent}, i) => (
                        <div class={"mb-8"}>
                            <input
                                type="text"
                                placeholder={"Name of the expense"}
                                class={"mb-4 block px-4 bg-shade-100 py-1 rounded-xl placeholder:text-shade-500 w-full placeholder:italic"}
                                value={description}
                                onInput={e => {
                                    setExpenses(i(), "description", e.currentTarget.value);
                                }}
                            />
                            <div class={"flex gap-4"}>
                                <select
                                    oninput={e => {
                                        setExpenses(i(), "who", +e.currentTarget.value);
                                    }}
                                >
                                    <For each={people}>
                                        {(person) => (
                                            <option
                                                data-x={JSON.stringify(person)}
                                                value={person.id}
                                                selected={who === person.id}
                                            >{person.name}</option>
                                        )}
                                    </For>
                                </select>
                                <input
                                    type="number"
                                    class={"grow w-0 block px-4 bg-shade-100 text-right py-1 rounded-xl"}
                                    value={spent}
                                    onInput={e => {
                                        setExpenses(i(), "spent", +e.target.value);
                                    }}
                                />
                                <button
                                    class={"block"}
                                    onclick={() => {
                                        setExpenses(expenses => expenses.filter((_, index) => i() !== index));
                                    }}
                                >
                                    <Bin/>
                                </button>
                            </div>
                        </div>
                    )}
                </For>
                <Button
                    onClick={() => {
                        if(!people.length) return;

                        setExpenses(expenses.length, {
                            who: people[0]!.id,
                            description: "",
                            spent: 0,
                        });
                    }}
                >
                    + Add Expense
                </Button>
                <hr/>
                <div class={"text-2xl font-semibold"}>
                    Total: {expenses.reduce((total, expense) => total + expense.spent, 0)}€
                    <br/>
                    Expenses per person
                    (mean): {Math.round(expenses.reduce((total, expense) => total + expense.spent, 0) / people.length * 100) / 100}€
                </div>
            </section>
            <section class={"p-6 mt-6 border-2 rounded-3xl border-shade-100"}>
                <h2 class={"mt-0"}>Needed Transactions ({neededTransactions().length})</h2>
                <For each={neededTransactions()}>
                    {({from, to, amount}) => (
                        <div>{people[from]!.name} needs to transfer {Math.round(amount * 100) / 100}€
                            to {people[to]!.name}</div>
                    )}
                </For>
            </section>
        </>
    );
}