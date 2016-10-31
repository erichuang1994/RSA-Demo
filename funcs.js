"use strict";
function getSBox(SBox, chunks) {
  var row = (chunks[0] << 1) + chunks[5];
  var col = array2int(chunks.slice(1, 1 + 4));
  return SBox[row * 16 + col];
}
function genF(k) {
  function f(r) {
    var mask = xor(expanded(table_E, r), k);
    var p = [];
    for (var i = 0; i < 8; ++i) {
      p.concat(getSBox(table_S[i], mask.slice(6 * i, 6 * i + 6)));
    }
    return p;
  }
  return f;
}

function g(m, f) {
  var l = m.slice(0, 32);
  var r = m.slice(32, 64);
  return r.concat(xor(l, f(r)));
}

function genSubkey(key) {
  // 注意移位方向？？
  function cycleLeftShift(nums, len) {
    var ret = new Array(nums.length);
    for (var i = 0; i < ret.length; ++i) {
      ret[i] = nums[(i + len) % ret.length];
    }
    return ret;
  }
  var shiftLeftBits = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];
  var keys = [];
  // permuted choice 1
  var pc1 = permutation(table_PC1, key);
  var C = pc1.slice(0,0+28);
  var D = pc1.slice(28,28+28);
  for(var i = 0;i<MAXROUND;++i){
    C=cycleLeftShift(C, shiftLeftBits[i]);
    D=cycleLeftShift(D,shiftLeftBits[i]);
    keys.push(permutation(table_PC2, C.concat(D)));
  }
  return keys;
}

function blockCipher(block, key, mode) {
  var subkeys = genSubkey(key);
  if(mode === DECRYPTMODE){
    subkeys.reverse();
  }
  var m = permutation(table_IP, block);
  for(var i = 0;i<MAXROUND;++i){
    m = g(m, genF(subkeys[i]));
  }
  // don't need reverse in the last round
  m = m.slice(32, 64).concat(m.slice(0, 32));
  // Inverse Initial Permutation
  var result = permutation(table_FP,m);
  return result;
}
function getKey(){
  var key = document.getElementById("key").value.trim();
  var ret = [];
  if(key.length!=64){
    alert("key's length should be 64!!!");
    throw "keys length error";
  }
  for(var i = 0;i<64;++i){
    if(key[i] === '1'){
      ret[i] = 1;
    }else if(key[i] === '0'){
      ret[i] = 0;
    }else{
      alert("key should be binary string!!!");
      throw "keys error";
    }
  }
  return ret;
}
function getInput(){
  var input = document.getElementById("input").value.trim();
  console.log("input is",input);
  if(input.length%64!=0){
    alert("input's length isn't in multiples of 64,will padding 0");
  }
  input = input.concat(Array((64-(input.length%64))%64).join("0"));
  var ret = [];
  for(var i = 0;i<input.length;i+=64){
    var tmp=[];
    for(var j = 0;j<64;++j){
      if(input[i+j]==='1'){
        tmp[j]=1;
      }else if(input[i+j]==='0'){
        tmp[j]=0;
      }else{
        alert("input should be binary string!!!");
        throw("input invalid");
      }
    }
    ret.push(tmp);
  }
  return ret;
}
function showresult(blocks){
  var result = "";
  for(var i = 0;i<blocks.length;++i){
    result+=blocks[i].join('');
  }
  document.getElementById("cipher").value = result;
}
function CBCEncryption(){
  var blocks = getInput();
  var key = getKey();
  var result = [];
  var last ;
  last = blockCipher(blocks[0], key,ENCRYPTMODE);
  result.push(last);
  for(var i = 1;i<blocks.length;++i){
    result[i] = blockCipher(xor(blocks[i], last), key, ENCRYPTMODE);
    last = result[i].slice();
  }
  console.log('result:', result);
  showresult(result);
}
function CBCDecryption(){
  var blocks = getInput();
  var key = getKey();
  var result = [];
  for(var i = blocks.length-1;i>=0;--i){
    if(i){
      result[i]=xor(blockCipher(blocks[i], key, DECRYPTMODE), blocks[i-1]);
    }else{
      result[i]=blockCipher(blocks[i], key, DECRYPTMODE);
    }
  }
  console.log('result:', result);
  showresult(result);
}
function str2array(str){
  var blocks = [];
  for(var i = 0;i<str.length;++i){
    blocks.push(int2array(str[i].charCodeAt(0)));
  }
  return blocks;
}