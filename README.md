![doco - The JavaScript Documentation Engine](https://raw.github.com/dcodeIO/doco/master/doco.png)
======================================
**doco** aims to become the ideal tool for documenting JavaScript code.

Why?
----
You already know if you have ever used another documentation generator.

What can doco already do?
-------------------------
doco already is able to parse a variety of comment types to a reflected documentation context of well defined objects.
This means that everything is composed of doco.Declaration, doco.Tag and doco.TypeDef objects that may safely be used
to generate to-the-point documentation in all different output formats. It understands a similar syntax as JSDoc does
but skips some constructs that tend to make things rather messy.

Additionally, it largely borrows type annotation styles from Closure Compiler. Yes, right, that Java-beast that isn't
really keeping with the period anymore. However, its type annotation syntax is really useful and able to pinpoint
pretty much every awkward case. To make this actually work, doco fully understands these cases and is able to untangle
them entirely. Additional benefit: It's compatible with existing code that already follows this convention to a
reasonable degree.

It also implements node's stream interface which ensures interoperability, allows building middleware or just using the
raw parser for something else. You know, documenting PHP code or something.

Ideas
-----
* What's not documented isn't documented
* No code analysis = no backfiring
* Less is more
* Y U NO MAKE A MARKDOWN GENERATOR

So, what's next?
----------------
* Putting together the TypeDef parser and comment types
* Resolving classes, methods and variables in a common namespace
* Creating generators for Markdown (e.g. publish on GitHub) and HTML

Until then
----------
* [Learn more by reading the wiki](https://github.com/dcodeIO/doco/wiki)
* View the sources and decide if you like what's there already

License
-------
Apache License, Version 2.0
