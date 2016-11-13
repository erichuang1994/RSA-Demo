function User(name, msgStr, buttonStr){
  this.rsa = null;
  this.des = null;
  this.msgSelector=document.getElementById(msgStr);
  this.buttonSelector=document.getElementById(buttonStr);
  this.name = name;
}

User.prototype.appendmsg = function(msg, m, c){
  var ele = document.createElement("p");
  ele.innerText = this.name+" reveive:"+msg;
  ele.addEventListener('click',function(){
    document.getElementById("des-before").value = m;
    document.getElementById("des-after").value = c;
  })
  var msgBoard = document.getElementById("ms-board");
  msgBoard.appendChild(ele);
  return;
}

User.prototype.rec = function(c){
  var cstr = "";
  for(var i = 0;i<c.length;++i){
    cstr=cstr.concat(c[i].join(''));
  }
  console.log(this.name,' recive:', cstr);
  var m = CBCDecrypt(c, this.des)
  var mstr = "";
  for(var i = 0;i<m.length;++i){
    mstr = mstr.concat(m[i].join(''));
  }
  console.log("after des decrypt:", mstr);
  var m = new BigInteger(mstr, 2);
  console.log(b64_to_utf8(hex2b64(m.toRadix(16))));
  this.appendmsg(b64_to_utf8(hex2b64(m.toRadix(16))), mstr, cstr);
}

User.prototype.send = function(receiver){
  if(this.des == null){
    alert("should initiate des key first");
    return;
  }
  var ms = this.msgSelector.value;
  var input = new BigInteger(b64tohex(utf8_to_b64(ms)), 16);
  console.log("before des:",input.toRadix(2));
  var blocks = bin2input(input.toRadix(2));
  var c = CBCEncrypt(blocks, this.des);
  for(var i = 0;i<c.length;++i){
    console.log("after des:", c[i].join(''));
  }
  receiver.rec(c);
  this.msgSelector.value = "";
}

function genRSA(){
  RSA = new RSAKey();
  RSA.gen(128);
  var n = document.getElementById("n");
  var e = document.getElementById("e");
  var d = document.getElementById("d");
  n.value = RSA.n.toRadix(2);
  e.value = RSA.e.toRadix(2);
  d.value = RSA.d.toRadix(2);
  alice.rsa = RSA;
  bob.rsa = RSA;
}

function encryptDES(){
  if(!("RSA" in window)){
    genRSA();
  }
  var deskey = document.getElementById('des').value.trim();
  console.log("deskey:", deskey);
  if(deskey.length !== 64){
    alert("deskey'length should be 64");
    return;
  }
  var MDES = new BigInteger(deskey, 2);
  var CDES = RSA.encrypt(MDES);
  document.getElementById('cdes').value = CDES.toRadix(2);
  console.log('rsa encrypt:', CDES.toRadix(2));
  console.log('rsa decipher:', RSA.decipher(CDES).toRadix(2));
  alice.des = RSA.decipher(CDES).toRadix(2);
  bob.des = RSA.decipher(CDES).toRadix(2);
}

alice = new User('alice', 'alice-msg', 'alice-send');
bob = new User('bob', 'bob-msg', 'bob-send');
alice.buttonSelector.addEventListener('click',function(){alice.send(bob)});
bob.buttonSelector.addEventListener('click',function(){bob.send(alice)});
