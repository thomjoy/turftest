# pick-next
Tiny JS module to pick 'next' thing from list of things.

### usage

```
var Picker = require('pick-next');
var colors = new Picker({list: ['red', 'blue', 'green']});

colors.next() // red
colors.next() // blue
colors.next() // green
colors.next() // red...
```
