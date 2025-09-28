# How to remember alignment in flexbox: justify vs align

## First trick

`justify` is longer than `align` ⇒ longer means horizontal,  
so `align` means vertical by exclusion.

## Second trick

`justify` is often used with text, and text is horizontal,  
so `justify` is horizontal, `align` is vertical by exclusion.

## Word explanation

`justify` comes from "just" → "right," later meaning to make text margins even on  
the left and right. That’s why this word was chosen for the flexbox default direction.

`align` comes from Old French *ligne* ("line"). You can think about multiple  
lines stacked one below another — vertical.

## P.S.

If `flex-direction` is `column`, just reverse the meaning.

https://gist.github.com/ehpc/fe709e13a23a839b5488ee82503f671e
