// Depends on jsbn.js and rng.js
function genPrime(len){
  var rng = new SecureRandom();
  var p = new BigInteger(len, len, rng);
  return p;
}
function extEuclid(a, b){
  if(a.mod(b).equals(BigInteger.ZERO)){
    return [BigInteger.ZERO, BigInteger.ONE];
  }
  [tmpx, tmpy] = extEuclid(b, a.mod(b));
  return [tmpy, tmpx.subtract(a.divide(b).multiply(tmpy))];
}
function RSAKey(){
  this.n = null;
  this.e = null;
  this.d = null;
}
RSAKey.prototype.gen=function(len){
  if(len==null){
    alert("len is null");
    return;
  }
  var p = genPrime(len/2);
  var q = genPrime(len/2+(len%2));
  // console.log(p);console.log(q);
  while(q.equals(p)){
    q = genPrime(len/2+(len%2));
  }
  this.n = p.multiply(q);
  if(this.n.bitLength() !== len){
    this.gen(len);
    return;
  }
  console.log('p:', p.toRadix(2));
  console.log('q:', q.toRadix(2));
  var one = new BigInteger("1");
  var fn = p.subtract(one).multiply(q.subtract(one));
  this.e = new BigInteger("65537");
  var [tmpx, tmpy] = extEuclid(this.e, fn);
  this.d = tmpx.mod(fn).add(fn).mod(fn);
}

RSAKey.prototype.encrypt=function(m){
  var c = m.modPow(this.e, this.n);
  return c;
}
RSAKey.prototype.decipher=function(c){
  var m = c.modPow(this.d, this.n);
  return m;
}
