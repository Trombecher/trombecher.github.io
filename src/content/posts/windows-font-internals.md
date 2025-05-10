---
title: "Windows Font Internals"
tags: ["Article"]
description: ""
---

There are many areas in which Windows sucks. Font management is not one of them, at least it seems. But when you are digging deeper... Oh boy!

Installing a font is easy. Just download the .ttf and right-click to install! We even have user only fonts since Windows 10, that don't require elevating on installation.

Built-in Windows tools, like the Control Panel's font manager, the setting's font manager, and even the handy context menu entry in the file explorer eliminate the need of any third-party font management software. However, these tools lack things in which we'll get into later.

This post should summarize all information available on the font storage internals for windows. It may be used to build a font manager (guess what I'm currently working on).

## Disclaimer

While Microsoft has great documentation for most parts of Windows, fonts is not one of them. As I was researching information about this topic I had no intention of writing an article like this. But there is no official documentation for most of this stuff. So I needed some way of collecting and concealing all information possible.

Sentences starting with "apparently" may be incorrect, but seem correct (based off reverse engineering). Also, I must add that a lot of information presented in this article is collected via prompting of various LLMs. Take it with a grain of salt.

If you want to add information, sources, or detect an error, please file a pull request on [this website's repo](https://github.com/Trombecher/trombecher.github.io).

## A Broad Overview

Like many things in Windows, font management is split into two contexts: _system_ and _user_. System fonts require administrator privileges to install and are available to any user on the system. User fonts on the other hand are local to the current user.

Beware, that you can install fonts locally on your administrator account. This may not be what you want.

_Apparently_, Windows supports OpenType and PostScript fonts (OpenType including TrueType). The corresponding file types are `.ttf` (TrueType font), `.otf` (OpenType font), `.ttc` (TrueType font collection), and `.otc` (OpenType font collection). But when examining my system's fonts, I encountered entries for `.fon` files, a generic font file extension, but _apparently_ often used by legacy Windows containing _FNT_. This is Windows' [_font resource format_](https://web.archive.org/web/20080115184921/http://support.microsoft.com/kb/65123), whose documentation I got from [this StackOverflow answer](https://stackoverflow.com/questions/27470295/where-i-can-find-fon-format-specification).

Even though these `.fon` fonts cannot be rasterized, they still need to be managed.

## Where Fonts Are Stored

Tools like the Control Panel or Windows Settings feel like magic. But under the hood they are just a bunch of code, tuned to interface with Windows _somehow_. And they need to be stored somewhere to persist restarts.

_Apparently_, system fonts are stored in `C:\Windows\Fonts` and user fonts are stored in `C:\Users\<USER>\AppData\Local\Microsoft\Windows\Fonts`.

Programmatically adding fonts is not as simple as copying the font file to one of these location though. Windows still requires you to mess with the Registry in order to detect fonts.

To "register" a font, you must add a new key-value pair to

* `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts` when registering system fonts or to
* `HKEY_CURRENT_USER\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts` for registering user fonts.

The key declares the name of the font and the value, which is a string (`REG_SZ`), is the path to the font file.

_Apparently_, paths of system fonts only have their file name (with extension), as `C:\Windows\Fonts\` is appended regardless. This is why you'll see mappings such as `Arial (True Type) -> arial.ttf` in the system font's Registry key.

And _apparently_, user font paths are stored canonically because I installed JB Mono for the user and the full path to the file in local appdata was there.

_Apparently_, font names of OpenType files (the keys) are appended with " (TrueType)" in the registry, although Windows apparently ignores it. However, [quoting StackOverflow](https://stackoverflow.com/questions/61248375/opentype-fonts-in-the-windows-registry):

> For purposes of getting a font registered and enumerated in the system, the strings used for entry names have no significance. An entry named "spam" would work just as well as "Arial Regular (TrueType)" or "Arial Regular (OpenType)". All that matters is uniqueness within that key.
>
> However, for maintenance of the registry — installation or removal of fonts, and migration during an upgrade or to a new system — there are parts of the OS that expect the entry names to be of a particular format. So, even if a font can be considered an OpenType font, you should use the template " (TrueType)" for the entry names.
>
> [...] Always use "(TrueType)" in the registry.

They also suggest that these font names do not matter at all (all that matters is uniqueness), but that is not the case [for the common hack to set your system font on Windows](https://answers.microsoft.com/en-us/windows/forum/all/how-do-i-change-the-operating-system-font/632ad4e6-fea8-4403-a0e1-1978e99740ed). Quoting:

> [...]
> 
> 1. Type Notepad in Windows search and click Open.
> 
> 2. In the Notepad window, type the code mentioned below. Make sure you replace the Font name with the complete name of the font you selected earlier.
> 
> 3. Put in:
>
> ```
> Windows Registry Editor Version 5.00  
> [HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts]  
> "Segoe UI (TrueType)"=""  
> "Segoe UI Bold (TrueType)"=""  
> "Segoe UI Bold Italic (TrueType)"=""  
> "Segoe UI Italic (TrueType)"=""  
> "Segoe UI Light (TrueType)"=""  
> "Segoe UI Semibold (TrueType)"=""  
> "Segoe UI Symbol (TrueType)"=""  
> HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\FontSubstitutes]  
> "Segoe UI"="Font name"  
> ```
> 
> [save the file as `xyz.reg` and merge with the Registry]

Remapping Segoe UI _and_ removing existing font entries affects the fonts disproves the StackOverflow answer.

---

The behavior here is undocumented.

## Remapping Fonts

_Apparently_, the registry key `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\FontSubstitutes` can be modified to declare substitutes; in case a font is missing, and you don't have a file. Also, it seems that you can only declare system font substitutes as that key seems to be missing in the users Registry tree.

These are a few entries in the key on my machine:

* `Arabic Transparent -> Arial`
* `Arabic Transparent Bold -> Arial Bold`
* `Arabic Transparent Bold,0 -> Arial Bold,0`

The format seems to be `[FONT_NAME] -> [REPLACEMENT_FONT_NAME]`. I do not know what the numbers are supposed to mean, I suppose legacy.

## Other Font Keys

While browsing the Registry, I found some more sub keys in `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion`:

### `\Font Drivers`

I don't know what that is for. Has only one association: `Adobe Type Manager -> atmfd.dll`.

### `\Font Management`

Has:

* `"Auto Deactivation Mode": REG_MULTI_SZ -> "Calibri\nCambria\nConsolas\nGeorgia\nSegoe UI Symbol\nVerdana"` (maybe those are `\r\n` instead of `\n`)
* `"Metadata": REG_EXPAND_SZ -> `