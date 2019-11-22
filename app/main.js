function BitArray(n) {
  this.n = n;
  this.len = Math.ceil(n / 32);
  this.ary = new Uint32Array(this.len);
}
BitArray.prototype.get = function(index) {
  return ((this.ary[index >> 5] >> (index%32)) & 1) === 1;
}
BitArray.prototype.set = function(index) {
  this.ary[index >> 5] |= 1 << (index%32);
}
BitArray.prototype.setall = function(value) {
  for (let i = 0; i < this.len; i++) {
    this.ary[i] = value;
  }
}
BitArray.prototype.reset = function(index) {
  this.ary[index >> 5] &= ~(1 << (index%32));
}
BitArray.prototype.flip = function(index) {
  this.ary[index >> 5] ^= 1 << (index%32);
}
BitArray.prototype.call_if_true = function(that, func) {
  for (let i = 0; i < this.len; i++) {
    for (let bits = this.ary[i]; bits; bits &= bits-1) {
      const bit = bits & -bits;
      const j = 31 - Math.clz32(bit);
      if (i * 32 + j < this.n) {
        func.call(that, i * 32 + j);
      }
    }
  }
}

function primeList(n) {
  let bitarray = new BitArray(n+1);
  bitarray.setall(~0);
  bitarray.reset(0);
  bitarray.reset(1);
  for (let i = 2; i*i <= n; i++) {
    if (bitarray.get(i)) {
      for (let j = i*i; j <= n; j += i) {
        bitarray.reset(j);
      }
    }
  }
  let ary = [];
  bitarray.call_if_true(this, function(index) {
    ary.push(index);
  });
  return ary;
}

function Sieve(n) {
  this.n = n;
  this.small_primes = [];
}
Sieve.prototype.init = function() {
  this.small_primes = primeList(this.n);
}
Sieve.prototype.sieveRange = function(start, length) {
  if (start + length >= this.n * this.n) throw "Out of range";
  let bitarray = new BitArray(length);
  bitarray.setall(~0);
  for (let i = 0; i < this.small_primes.length; i++) {
    const p = this.small_primes[i];
    if (p*p >= start + length) break;
    for (let j = (p - start%p) % p; j < length; j += p) {
      bitarray.reset(j);
    }
  }
  let ary = [];
  bitarray.call_if_true(this, function(index) {
    ary.push(start + index);
  });
  return ary;
}

let sieve = new Sieve(10000000);

window.onload = function() {
  sieve.init();
}

function is_valid_time(num) {
  num %= 1000000;
  if (num / 10000 >= 24) return false;
  num %= 10000;
  if (num / 100 >= 60) return false;
  num %= 100;
  return num < 60;
}

function calc(date_value) {
  let date = new Date(date_value);
  let num = date.getFullYear() * 10000 + (date.getMonth()+1) * 100 + date.getDate();
  num *= 1000000;
  let list = sieve.sieveRange(num, 240000);
  let result = [];
  for (let i = 0; i < list.length; i++) {
    if (is_valid_time(list[i])) {
      result.push(list[i]);
    }
  }
  return result.join(", ");
}
