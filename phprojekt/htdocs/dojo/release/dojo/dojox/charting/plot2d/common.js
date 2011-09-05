/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


dojo._hasResource["dojox.charting.plot2d.common"]||(dojo._hasResource["dojox.charting.plot2d.common"]=!0,dojo.provide("dojox.charting.plot2d.common"),dojo.require("dojo.colors"),dojo.require("dojox.gfx"),dojo.require("dojox.lang.functional"),function(){var o=dojox.lang.functional,j=dojox.charting.plot2d.common;dojo.mixin(dojox.charting.plot2d.common,{makeStroke:function(c){if(!c)return c;if(typeof c=="string"||c instanceof dojo.Color)c={color:c};return dojox.gfx.makeParameters(dojox.gfx.defaultStroke,
c)},augmentColor:function(c,a){var d=new dojo.Color(c),b=new dojo.Color(a);b.a=d.a;return b},augmentStroke:function(c,a){var d=j.makeStroke(c);if(d)d.color=j.augmentColor(d.color,a);return d},augmentFill:function(c,a){new dojo.Color(a);return typeof c=="string"||c instanceof dojo.Color?j.augmentColor(c,a):c},defaultStats:{vmin:Number.POSITIVE_INFINITY,vmax:Number.NEGATIVE_INFINITY,hmin:Number.POSITIVE_INFINITY,hmax:Number.NEGATIVE_INFINITY},collectSimpleStats:function(c){for(var a=dojo.delegate(j.defaultStats),
d=0;d<c.length;++d)for(var b=c[d],k=0;k<b.data.length;k++)if(b.data[k]!==null){if(typeof b.data[k]=="number"){var k=a.vmin,e=a.vmax;(!("ymin"in b)||!("ymax"in b))&&dojo.forEach(b.data,function(b,d){if(b!==null){var c=d+1,e=b;isNaN(e)&&(e=0);a.hmin=Math.min(a.hmin,c);a.hmax=Math.max(a.hmax,c);a.vmin=Math.min(a.vmin,e);a.vmax=Math.max(a.vmax,e)}})}else{var g=a.hmin,f=a.hmax,k=a.vmin,e=a.vmax;(!("xmin"in b)||!("xmax"in b)||!("ymin"in b)||!("ymax"in b))&&dojo.forEach(b.data,function(b,d){if(b!==null){var c=
"x"in b?b.x:d+1,e=b.y;isNaN(c)&&(c=0);isNaN(e)&&(e=0);a.hmin=Math.min(a.hmin,c);a.hmax=Math.max(a.hmax,c);a.vmin=Math.min(a.vmin,e);a.vmax=Math.max(a.vmax,e)}});if("xmin"in b)a.hmin=Math.min(g,b.xmin);if("xmax"in b)a.hmax=Math.max(f,b.xmax)}if("ymin"in b)a.vmin=Math.min(k,b.ymin);if("ymax"in b)a.vmax=Math.max(e,b.ymax);break}return a},calculateBarSize:function(c,a,d){d||(d=1);var b=a.gap,b=(c-2*b)/d;"minBarSize"in a&&(b=Math.max(b,a.minBarSize));"maxBarSize"in a&&(b=Math.min(b,a.maxBarSize));b=Math.max(b,
1);return{size:b,gap:(c-b*d)/2}},collectStackedStats:function(c){var a=dojo.clone(j.defaultStats);if(c.length){a.hmin=Math.min(a.hmin,1);a.hmax=o.foldl(c,"seed, run -> Math.max(seed, run.data.length)",a.hmax);for(var d=0;d<a.hmax;++d){var b=c[0].data[d],b=b&&(typeof b=="number"?b:b.y);isNaN(b)&&(b=0);a.vmin=Math.min(a.vmin,b);for(var k=1;k<c.length;++k){var e=c[k].data[d],e=e&&(typeof e=="number"?e:e.y);isNaN(e)&&(e=0);b+=e}a.vmax=Math.max(a.vmax,b)}}return a},curve:function(c,a){var d=c.slice(0);
a=="x"&&(d[d.length]=d[0]);return dojo.map(d,function(b,c){if(c==0)return"M"+b.x+","+b.y;if(isNaN(a)){if(a=="X"||a=="x"||a=="S"){var e,g=d[c-1],f=d[c],l,h,m,i=1/6;c==1?(e=a=="x"?d[d.length-2]:g,i=1/3):e=d[c-2];c==d.length-1?(l=a=="x"?d[1]:f,i=1/3):l=d[c+1];h=Math.sqrt((f.x-g.x)*(f.x-g.x)+(f.y-g.y)*(f.y-g.y));m=Math.sqrt((f.x-e.x)*(f.x-e.x)+(f.y-e.y)*(f.y-e.y));var j=Math.sqrt((l.x-g.x)*(l.x-g.x)+(l.y-g.y)*(l.y-g.y)),n=m*i;i*=j;n>h/2&&i>h/2?(n=h/2,i=h/2):n>h/2?(n=h/2,i=h/2*j/m):i>h/2&&(i=h/2,n=h/2*
m/j);a=="S"&&(e==g&&(n=0),f==l&&(i=0));h=g.x+n*(f.x-e.x)/m;e=g.y+n*(f.y-e.y)/m;m=f.x-i*(l.x-g.x)/j;g=f.y-i*(l.y-g.y)/j}}else return f=b.x-d[c-1].x,"C"+(b.x-(a-1)*(f/a))+","+d[c-1].y+" "+(b.x-f/a)+","+b.y+" "+b.x+","+b.y;return"C"+(h+","+e+" "+m+","+g+" "+f.x+","+f.y)}).join(" ")},getLabel:function(c,a,d){return dojo.number?(a?dojo.number.format(c,{places:d}):dojo.number.format(c))||"":a?c.toFixed(d):c.toString()}})}());