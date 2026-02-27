# TODO List
These are tasks yet to be done. Work on them from top to bottom, confirm when you start working on one and are finished. I'll tell you if you've completed it and only then will you remove it from the list.

## 1. Raster
Create a new class called `Raster` that allows the user to render a bitmap. For example:

```js
new Raster({
  width: 5,
  height: 8,
  pixels: [
    //A 8x5 array of pixels in hex that look like colored bars
    ['#ff0000', '#00ff00', '#0000ff', '#ff0000', '#00ff00'],
    ['#ff0000', '#00ff00', '#0000ff', '#ff0000', '#00ff00'],
    ['#ff0000', '#00ff00', '#0000ff', '#ff0000', '#00ff00'],
    ['#ff0000', '#00ff00', null, '#ff0000', '#00ff00'],
    ['#ff0000', null, '#0000ff', null, '#00ff00']
    [null, '#00ff00', '#0000ff', '#ff0000', null],
    ['#ff0000', '#00ff00', '#0000ff', '#ff0000', '#00ff00'],
    ['#ff0000', '#00ff00', '#0000ff', '#ff0000', '#00ff00'],
  ]
})
```

Null pixels and rows are transparent.
