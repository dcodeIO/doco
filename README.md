![doco - A JavaScript Documentation Engine](https://raw.github.com/dcodeIO/doco/master/doco.png)
======================================
**doco** aims to become a reasonable documentation generator for comprehensively documented JavaScript code.

It might be for you, if...

* you are comfortable with documenting every single exposed variable and function, like for Closure Compiler.
* you use GitHub a lot and would love to have some markdown documentation.

So, what's the current state?
-----------------------------
* It parses comments including the following variable or function declaration.
* It parses Closure Compiler-like type annotations.
* It creates a reflected tree structure of all the comments, tags and types.
* It outputs GitHub-flavoured markdown.
* It implements node's stream interface for interoperability.

What does it not do (yet)?
--------------------------
* It's not yet able to split documentation into multiple files (like for inner classes etc.).
* It does not try to fully understand the code (it does not recognize any scopes).

Still interested?
-----------------
* [See an example](https://github.com/dcodeIO/ByteBuffer.js/wiki/API)
* [Check the wiki](https://github.com/dcodeIO/doco/wiki)
* [Inspect the sources](https://github.com/dcodeIO/doco/tree/master/src)
* Try it:
  
  `npm install -g doco`  
  `doco --gen=markdown YourClass.js > YourClass.md`

License
-------
Apache License, Version 2.0
