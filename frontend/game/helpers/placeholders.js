/**
 * game/helpers/placeholders.js
 * 
 * What it Does:
 *   This file contains loaders for images, sounds, and fonts.
 *   and a loadList function that lets you load any of these in a list.
 * 
 *   blankImage: used as an invisible image for optional images, avoids safari restrictions
 *   
 *   defaultImage: placeholder image for unloaded images
 * 
 * What to Change:
 *   
 * How to Use it:
 */


// 1x1 px transparent png from http://png-pixel.com/
// blank image used for optional images
// fixes Safari restriction on drawing unloaded images to canvas
// https://github.com/konvajs/react-konva/issues/185
const blankImage = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=`;

// 32x32 placeholder image from https://www.flaticon.com/free-icon/crab_875010
// lets developer know image was not loaded
const defaultImage = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAABGdBTUEAALGPC/xhBQAAAAFzUkdC
AK7OHOkAAAA8UExURQAAANHR0UJCQmtra5ubm////xISEre3txMTE5ycnLi4uOnp6SYmJt3d3VhY
WPT09I2Njaqqqn19fcXFxbjmkisAAAFqSURBVFjDpdfbcoQgDAbggE1dDuK6ff93LajbLgpJgMw4
cPUNJL8XwDxYMM9f39BdCTAjQgIeI0ICYETYgRHhAAaEE+gX3oBQMGpDNHFFXKYckAkGVfz8Eyew
q84BkWBWgIB62eLemQsgEYwC0KjXZ9wrewUEwglUTiAQTqDcA4lwAsUp0IIyXA4aOkkDrcIdKAvx
CmgcKr2g0+BVzKObKkBRSIALAdfJrxtYp/2CVaAkJCCmx8Xw/FiPLwBPALvwuAHTER5r0yABKOAu
ZAB/gruQAbEHARQNXIUc2KfAAIU+5BUw0AAlpGEoBwxACGGJP5NmAfYWLCARaEAgMAAvcAArsAAn
8AAjCABakACkIAIoQQYQghCoC1KgKoiBmiAHKkIDUBZagKLQBJSENqAgNAJ3oRW4Cc3AVWgHLkIH
kAs9QCZ0AZ9CH/AhdAL/Qi/wJ3QDb6EfOIUB4BBGgCSYISAJY8AuwOjz/xdsEharPg6y9AAAAABJ
RU5ErkJggg==`;

export { blankImage, defaultImage };