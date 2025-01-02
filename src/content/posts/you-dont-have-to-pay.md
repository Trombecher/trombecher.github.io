---
title: "You Don't Have To Pay"
description: ""
tags: ["Article"]
---

From free software to paywalls, from easy to build to hard to maintain. Every, even unreasonable combination of 

_This is a rant about commercializing the dumbest of things._

Know this feeling? Ever wanted to use a service, an app, heck even a website, just to get hit by a paywall or sometimes even more annoying: the sign-up-or-you-cannot-continue-banner?

I know this feeling very well.

This is why I set out to change that. I, as a developer, have the power to create and to develop awesome things. And I don't even have to pay for that.

## Reasons

See, there is always a reason why something is behind a paywall: they want money. But more interesting is, _why_ they want/need money.

### Servers

Every app needs servers to serve data, process things and manage things. These servers cost money. But they cost money depending on the needs.

For a static site like this it costs (me as the developer) nothing. But this leaves me with limitations. Essentially, what I can do is: deploy and host static files.

But the thing is: **I don't need more functionality on the server**. I don't need a database, I don't need processing or any of that, just static files. My usage costs GitHub literal cents a month.

But what if you need more than that? Sometimes it is split. You'll have a hosting provider, the service you're interacting with, deploying to, etc., like Vercel and then there is the company that owns the servers (Vercel is built on Amazon, more specifically AWS).

In this case it is more expensive because you have two companies trying to make money off you. But it also may be more convenient (Vercel is WAY more convenient to use than raw AWS).

In the case that your hosting provider host the servers, it is cheaper. But this may also mean that your interface and workflows are a little different.

For servers the developers will pay for usage, particularly on the Edge. Although you are paying a bit more, the Edge scales effortlessly as your app grows. There is a lot less to worry about.

### Product

Well, someone needs to maintain the product. And this someone want to get paid, if it is their job. This may be a simple but important reason why your app costs a few bucks per fortnight.

Also, the developers, potential CEOs, CTOs, etc. want to get paid. Or it might be a single freelancer that is putting in work 24/7 to develop and maintain the product. This is their business model.

But sometimes this goes a bit far. More about that later.

### Environment

The company may have temporary or local policies/difficulties that might lead them to charge more that expected for the product.

### Selling Data

It is inescapable. If you're on a website nowadays,

## Sometimes...

it just does not feel right. To pay or give them any data. And this leads me to the main rant of this post.

To illustrate my problem I am going to propose an example:

## QR Code Madness

If you [google "QR Code Generator"](https://www.google.com/search?q=qr+code+generator), hell unfolds. There is at least 100+ indistinguishable "QR Code Generator" pages, desperately fighting over the first user click, just to guide them into the madness of sign-up-to-download and subscribe-with-pro-to-unlock-dogshit.

It's crazy. This is deception.

From a normal persons perspective, it seems like it must be expensive to host, develop and maintain this QR code generator service. And I can't blame them, they don't know better.

But as a developer, I can confidently say that it takes absolutely NO EFFORT to create a competing "QR Code Generator", just to horn in. It seems like the pages may just be expensive because of the extensive search engine competition they are doing.

## You DON'T Need A Server

They are problems that must be solved by a server. Computational problems. Background removal, image processing, etc. LLMs. Database management, user management, etc. But then there are the other problems, that are also solved by a request to the server. Problems like QR code generation.

And this is the part I don't understand. **Why would you go through the hassle of setting up your server for image generation and management just for QR code generation?** This is a computational task that **could have been done since 2010 on the client**. With JavaScript.

And now even **faster**, due to widespread WebAssembly support (on the client).

They could cut enormous costs by moving their unnecessary ass server computations to the client. And in the case of QR codes... All you need is to google "qr code npm" and you'll find this AWESOME client library [qrcode](https://www.npmjs.com/package/qrcode), that has all necessary features and **is MIT licensed**.

And this is the contrast I am talking about. A free, open source JavaScript library to create QR codes versus a commercialized limited-set-of-features QR code website. **It is not like they are adding any value, in fact they are removing it.**

This is what I meant with deception. And this is also what motivated me to create my own [QR Code Generator](/qr-code-generator/). Free, MIT licensed, forever.

## More Madness

The set of tools on this website are the result of distinct recurring QR madnesses. Another example: image conversion, or more general: file conversion.

PDF handling is also very dirty, as the only real tool to edit PDFs is made by _the company_ that made their legal department half their size. And guess what: you have to pay for Acrobat DC.

A rant about Adobe deserves its only article, which is why I won't go any further than that.

But literally, there are virtually no other tools to edit PDFs. It's almost like they are getting paid by Adobe to NOT publish an open source alternative.

## The Paywall's Annoying Brother

Now let's talk about the paywall's annoying brother, the _sign-up banner_.

There are a numerous number of times, where mandatory account creation is at least partially justified. These cases include:

* software, that is social media.
* software, that is cloud based / games.
* software, that provides a free tier and lets the user choose between spending money and a limited set of features.
* software, that limits interactions with anonymous users (e.g. to prevent API misuse, anti-spam, etc.).

Commonly, these products provide a "free tier" and a "pro tier", usually less than 20 bucks a month. They also usually include some storage space for product specific files, like design files or general storage.

They also might include a web editor, an API key at the pro tier, customer support, and they have to pay to develop the product. Some social features may also be included, such as collaborative editing, sharing, commenting, posting, etc.

### A By Far Non-Exhaustive List Of Tools I Have Encountered / Used Over The Years

(Yes, very long title.)

* Figma (design)
* Womp (3D-Editor)
* Notion (Notes)
* Various AI tools, most notably ChatGPT
* All google products
* etc.

### Figma Balls

I shouldn't be so rude. Figma brought me into design. It is a great product.

* The editor is intuitive,
* it has reasonable performance,
* collaboration is easy,
* and many great features, but also great-but-paywalled features.

They keep trying to seduce you into paying what ever they want. Keep slapping new buttons into the UI that do absolutely nothing but spawn a paywall because you're on the free plan. But this is how it is.

For a while I started using [Lunacy](https://icons8.com/lunacy). It is also great, does not need a sign-up and has awesome performance. BUT has a limited set of features, many things are buggy:

* SVG export looks different then in the editor
* Color variables are buggy

The reason Figma has won me over again, it this [ticket from over two years](https://lunatics.icons8.com/discussion/163/variable-fonts-support/p1#Comment_760) requesting variable font support, including variable axes. That is still not done.

Lunacy is open source, the only open source competitor to Figma, which is a bit sad.

### Wrapping Up

These are all tools that benefit from the user-account model. Society does not benefit from this model on QR generators.