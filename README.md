![doco - The JavaScript Documentation Engine](https://raw.github.com/dcodeIO/doco/master/doco.png)
======================================
doco aims to become the best tool for documenting JavaScript code, all without the hazzle of other documentation
engines.

Why?
----
As of today, creating documentation of JavaScript code seems to be ugly and error prone. In my opinion that's the reason
why quick-and-dirty documentation generators like Docco are to popular. Unfortunately, documenting complicated things
with a tool like Docco ends up in something that actually doesn't document much and is well suited for pretty simple
and short projects only.

Of course there is JSDoc, which already is a pretty professional approach, but I've made the experience that JSDoc
is too strict in what it does because it does not just do documenting but also parsing of JavaScript that - in not too
few cases - goes wrong. Imho writing and putting together documentation should be left to the guy with the gun.

What can doco already do?
-------------------------
doco already is able to parse a variety of comment types to a documentation context of well defined objects. This means
that everything is composed of doco.Context, doco.Declaration, doco.Tag and doco.TypeDef objects which may safely be
used to generate to-the-point documentation in all different output formats from it.

Additionally, it largely borrows type annotation styles from Closure Compiler. Yes, right, that Java-beast that isn't
really keeping with the period anymore. However, its type annotation syntax is really useful and able to pinpoint
pretty much every awkward case. To make this actually work, doco fully understands these cases and is able to untangle
it entirely.

Plus: It implements node's stream interface for speed.

So, what's next?
----------------
I am currently putting together the parts, which are the typedef parser and the different comment types. Later on I am
going to create generators for markdown, which may be published on GitHub or similar, and HTML for everything else.
All generators will be plug and play and everyone is invited to create additional generators for stuff like PDF.

Feel free to contact me if you are interested in working on the project!

License
-------
Apache License, Version 2.0
