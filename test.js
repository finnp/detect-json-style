var test = require('tape')

var detect = require('./index.js')

test('detect JSONStream.parse()', function (t) {
  var d
  d = detect('{"a": 1}\n{"b": 1}')
  t.ok(d, 'has result')
  if(d) t.equals(d.selector, null, 'ndjson') 
  
  
  d = detect('{"a": 1}\n {"b')
  t.ok(d, 'has result')
  if(d) t.equals(d.selector, null, 'ndjson cutoff')

  d = detect('{\n"a":\n 1}\n {\n"b":\n 1}')
  t.ok(d, 'has result')
  if(d) t.equals(d.selector, null, 'pretty printed objects')
  
  d = detect('{\n"a":\n 1}\n {\n"b":\n')
  t.ok(d, 'has result')
  if(d) t.equals(d.selector, null, 'pretty printed objects, cutoff')
    
  d = detect('{}')
  t.ok(d, 'has result')
  if(d) t.equals(d.selector, null, 'edge case {}')
  
  d = detect('{"a": 1}')
  t.ok(d, 'has result')
  if(d) t.equals(d.selector, null, 'edge case single object')
    
  // failures  
  d = detect('{\n"a":\n 1}\n randomstuffhere {\n"b":\n 1}')
  t.notOk(d, 'no non-white characters allowed between objects')
  
  t.end()
  
  // detect('{"a":', function (d.selector) {
  //   t.equals(d.selector, null, 'edge case single object cutoff')
  // })
})

test('detect JSONStream.parse("*")', function (t) {
  t.plan(5)
  var d
  d = detect('[{"a":1},{"b":1}]')
  t.ok(d, 'has result')
  if(d) t.equals(d.selector, '*', 'compact json array')
  
  d = detect('[{"a":1},{"b"')
  if(d) t.equals(d.selector, '*', 'compact json array cutoff')
  
  d = detect('[\n\t{"a":\n1},\n\t{"b"\n:1}\n]')
  t.ok(d, 'has result')
  if(d) t.equals(d.selector, '*', 'pretty printed json array')
  
  d = detect('[\n\t{"a":\n1},\n\t{"b')
  t.ok(d, 'has result')
  if(d) t.equals(d.selector, '*', 'pretty printed json array cutoff')
  
  d = detect('[{"a":1}]')
  t.ok(d, 'has result')
  if(d) t.equals(d.selector, '*', 'single row')
})

test('detect JSONStream.parse("xyz.*")', function (t) {
  t.plan(5)
  var d
  
  d = detect('{"rows": [{"a": 1},{"b": 2}]}')
  t.ok(d, 'has result')
  if(d) t.equals(d.selector, 'rows.*', 'compact json object')
  
  d = detect('{"rows": [{"a": 1},{"b":')
  t.ok(d, 'has result')
  if(d) t.equals(d.selector, 'rows.*', 'compact json object cutoff')
  
  d = detect('{"rows": \n\t[{"a":\n 1},\t{"b":\n 2}]}')
  t.ok(d, 'has result')
  if(d) t.equals(d.selector, 'rows.*', 'compact formatted json object')
  
  d = detect('{\n"rows": \n\t[{"a":\n 1},')
  t.ok(d, 'has result')
  if(d) t.equals(d.selector, 'rows.*', 'compact formatted json object cutoff')
  
  d = detect('{"rows": []}')
  t.ok(d, 'has result')
  if(d) t.equals(d.selector, 'rows.*', 'edge case empty rows')
})

// test('reject non json', function (t) {
//   detect('a,b,c,d,e', function (d.selector) {
//     
//   })
// })



// 
// ```js
// 
// 
// 
// JSON.parser(‘*’)
// 
// first character ‘['
// 
// [
// {“a”: 1},
// {“b”: 2}
// ]
// 
// JSON.parse()
// 
// put all opening ‘{‘ on a stack, each time a ‘}’ when empty try to parse, then next (“default”)
// 
// {
// 
//   “a”: 1
// }
// {
//  “b”: 2
// }
// 
// 
// {“a”: 1}
// {“b”: 2}
// 
// JSON.parse(‘rows.*’)
// 
// 
// 
// {
//      “rows”: [
//           {“a”: 1},
//            {“b”: 2}
//       ]
// }
// 
// split until ‘['
// 
// 
// '{
//      “rows”: ['
// 
// remove white characters
// 
// '{“rows”:[‘
// 
// rows / results
// 
// {
//      “rows”: [
// 
//           {“a”: 1},
//            {“b”: 2}
//       ]
// }
// 
// 
// {“rows”: [
//   {“a”: 1},
//    {“b”: 2}
// ]}
// 
// 
// Write all the peeked data to JSONStream: test if the events work
// How to test ‘rows.*’ though?
//    peek.slice(1,peek.indexOf(‘:’)).trim()
// 
// 
// 
// maybe something like  “results.*"
// {"results":[
// {"seq":5,"id":"deleted","changes":[{"rev":"2-eec205a9d413992850a6e32678485900"}],"deleted":true}
// ],
// "last_seq":5}
// ```
