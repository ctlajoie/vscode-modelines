# Modelines
This extension adds the ability to set certain editor settings from "[modelines](http://vim.wikia.com/wiki/Modeline_magic)".
Modelines let you set certain editor settings on a per-file basis by adding a specially formatted comment near the top or bottom of the file.
The settings only affect the file where the modeline appears. This extension supports Vim and Emacs modelines as well as a Code-specific syntax demonstrated below. The modeline(s) must appear somewhere in the **first or last 5 lines of the file**.

Here are a few examples demonstrating the different types of modelines supported. All of the examples below are equivelent.
```
# vim: set ft=js ts=4 sw=4 et:
# vim: ts=4:sw=4:et:ft=js
// -*- mode: js; indent-tabs-mode: nil; tab-width: 4 -*-
// code: language=javascript insertSpaces=true tabSize=4
```




