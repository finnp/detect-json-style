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
    
  // negative tests  
  d = detect('{\n"a":\n 1}\n randomstuffhere {\n"b":\n 1}')
  t.notOk(d, 'no non-white characters allowed between objects')
  
  t.end()
  
  // detect('{"a":', function (d.selector) {
  //   t.equals(d.selector, null, 'edge case single object cutoff')
  // })
})

test('detect JSONStream.parse("*")', function (t) {
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
    
  t.end()
})

test('detect JSONStream.parse("xyz.*")', function (t) {
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
    
  t.end()
})

test('negative tests', function (t) {
  t.notOk(detect('a,b,c'), 'csv header')
  t.notOk(detect('data\n10\n20'), 'one row csv')
  t.notOk(detect('a,b\n{"a":1},{"b:2"}'), 'csv with json')
  t.notOk(detect(''), 'empty')
  t.notOk(detect('{}}}{'), 'scrumbled {')
  t.notOk(detect('[]]]['), 'scrumbled [')
  t.end()
})