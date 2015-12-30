# Modelines
This extension adds the ability to set certain editor settings from "[modelines](http://vim.wikia.com/wiki/Modeline_magic)". The settings only affect the file where the modeline appears. This extension supports Vim and Emacs modelines as well as a Code-specific syntax demonstrated below. The modeline(s) must appear somewhere in the **first or last 10 lines of the file**.

Here are a few examples demonstrating the different types of modelines supported. All of the examples below are equivelent.
```
# vim: set ts=4 sw=4 et:
# vim: ts=4:sw=4:et
// -*- indent-tabs-mode: nil; tab-width: 4 -*-
/* code: insertSpaces=true tabSize=4 */
```

## Limitations
Due to limitations in the API, the only settings currently supported are `insertSpaces` and `tabSize`.
Sadly, this means the language can't currently be set with `ft=js` (Vim modelines) or `mode:js` (Emacs modelines).
When this becomes possible (as it surely will in a future version of Code) I will update the extension to add support.
