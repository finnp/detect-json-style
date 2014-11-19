module.exports = function detect(chunk) {
  chunk = chunk.trim()
  var format
  if(chunk[0] === '[') {
    // [{"a": 1, "b": 2},{"a": 1, "b": 2}]
    format = {format: 'json', style: 'array', selector: '*'}
    
    // maybe we already have the full array?
    if(lastChar(chunk) === ']' && JSONcheck(chunk)) return format
    // else still could be valid, e.g. [{"a": 1, b:[1,2,3]
    
    var afterArray = chunk.slice(1).trim()
    if(afterArray[0] ==='{') {
      var splittedArray = splitArray(afterArray)
      if(!splittedArray.error) {
        splittedArray.pop() // ignore last element?
        var validElements = splittedArray.every(function (elem) {
          return JSONcheck(elem)
        })
        if(validElements) return format
      }
    }
    
    return null
  } else if(chunk[0] === '{') {
    
    // '{"whatever": 1}' 
    // '{"rows": [{"a": 1, "b": 2}]}'
    
    // or '{"rows": [{"a": 1,'
    
    
    // '{"whatever": }' possible but meh not detectable
    
    if(objectEnding(chunk) === chunk.length - 1) {
      // probably type '{"rows": [{"a": 1, "b": 2}]}'
      
      // check that it's not a single 'ndjson' object
      if(JSONcheck(chunk)) {
        // '{"whatever": 1}' 
        // '{"rows": [{"a": 1, "b": 2}]}'
        var obj = JSON.parse(chunk)
        for(key in obj) {
          if(obj[key].length && typeof obj[key][0] === 'object')
            return {format: 'json', style: 'object', selector: key + '.*'}
        }
        return {format: 'json', style: 'multiline', selector: null}
      }
      
      // assuming: '{"rows": [{"a": 1, 
      format = {format: 'json', style: 'object'}
      
      return format
      
    } else {
      // probably '{"a":1, "b": 2}{"a": 2, "b": 1}' (or pretty printed somehow)
      format = {format: 'json', style: 'multi', selector: null} // could be ndjson, but doesn't have to
      if(lastChar(chunk) === '}' && JSONcheck(chunk)) return format // only one element
      var splittedObjects = splitObjects(chunk)
      
      // maybe count number of { and } in the last element to find cut off objects
      splittedObjects.pop()
      var validObjElements = splittedObjects.every(function (elem) {
        return JSONcheck(elem)
      })
      if(validObjElements) return format
    }
    
    return null
  }
}

function splitObjects(str) {
  var count = 0
  var lastPos = 0
  var parts = []
  for(var i = 0; i < str.length; i++) {
    if(str[i] === '{') count++
    else {
      if(str[i] === '}') {
        count--
        if(count === 0) {
          parts.push(str.slice(lastPos, i + 1).trim())
          lastPos = i + 1
        }
      }
    }

  }
  return parts
}

// [  {"a": 1}   ,   {"b":1,"c":2},{"a": [1,2,3]}..]
// array of objects!
// first character needs to be '{'
function splitArray(str) {
  var count = 0
  var lastPos = 0
  var parts = []
  var searchComma = false
  for(var i = 0; i < str.length; i++) {
    if(str[i] === '{') 
      if(searchComma) return {error: true}
      else count++
    else if(str[i] === '}') count--
    else if(str[i] === ',') searchComma = false
    if(count === 0) {
      parts.push(str.slice(lastPos, i).trim())
      lastPos = i
      searchComma = true
    }
  }
  return parts
}


function objectEnding(str) {
  // e.g. '{"a": {"a": 1}},{"a":' would find the comma
  var count = 0
  for(var i = 0; i < str.length; i++) {
    if(str[i] === '{') count++
    else if(str[i] === '}') count--
    if(count === 0) return i
  }
  return i
}

function lastChar(str) {
  return str[str.length - 1]
}

function JSONcheck(str) {
  try {
    JSON.parse(str)
  } catch(e) {
    return false
  }
  return true
}