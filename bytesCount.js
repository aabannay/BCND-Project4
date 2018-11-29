function getBytes(string){
  return Buffer.byteLength(string, 'ascii')
}

function isASCII(str, extended) {
    return (extended ? /^[\x00-\xFF]*$/ : /^[\x00-\x7F]*$/).test(str);
}

let mystring = 'qqq www eee rr ttt ii oo ppp sss dddd fffff kkkk'

console.log(getBytes(mystring));
console.log(mystring.split(' ').length);
mystring = '¥'

console.log((/^[\x00-\x7F]*$/).test(mystring));