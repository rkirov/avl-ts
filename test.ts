import {assert, expect} from 'chai';
import {singleton, insert, AVL, NonLeafAVL} from './avl';

function assertNonLeaf<N>(t: AVL<N>): NonLeafAVL<N> {
  if (t.type == 'leaf') throw 'leaf found';
  return t as any;
}

// in-order
function traverse<N>(t: AVL<N>): number[] {
  if (t.type == 'leaf') return [];
  // is TS smart enough to infer t is NonLeafAVL.
  let r = traverse(t.left);
  r.push(t.v);
  r = r.concat(traverse(t.right));
  return r;
}

function includes<N>(t: AVL<N>, n: number): boolean {
  if (t.type == 'leaf') return false;
  if (t.v == n) return true;
  if (t.v < n) return includes(t.right, n);
  return includes(t.left, n);
}

function h<N>(t: AVL<N>): number {
  if (t.type == 'leaf') return 0;
  return Math.max(h(t.left), h(t.right)) + 1;
}

function verifyBalance<N>(t: AVL<N>): boolean {
  if (t.type == 'leaf') return true;
  return verifyBalance(t.left) && verifyBalance(t.right) && Math.abs(h(t.left) - h(t.right)) < 2;
}

// really N should be equal to times.
// The user will have to statically know times and pass the parameter :/
function randomGrow<N>(bound: number, times: number): AVL<N> {
  // really t is of type AVL<0..N> = AVL<0> | AVL<1> | ... | AVL<N>
  let t: any = singleton(Math.floor(Math.random() * bound));
  for (let i = 1; i < times; ) {
    let n = Math.floor(Math.random() * bound);
    if (includes(t, n)) continue;
    t = insert(n, t).v;
    i++;
  }
  return t;
}

function repeat(s: string, t: number): string {
  let r = '';
  for (let i = 0; i < t; i++) {
    r += s; 
  }
  return r;
}

function pprint<N>(t: AVL<N>, indent=0) {
  if (t.type == 'leaf') return;
  pprint(t.left, indent + 4);
  console.log(repeat(' ', indent) + t.v + ' ' + t.type)
  pprint(t.right, indent + 4);
}

describe('AVL', () => {
  it('should create singletons', () => {
    let t = singleton(0);
    expect(t.v).to.equal(0);
  });

  it('should insert', () => {
    let t = insert(2, insert(1, singleton(0)).v).v;
    expect(t.type).to.equal('bal');
    let t2 = assertNonLeaf(t);
    expect(t2.v).to.equal(1);
  });

  it('should do the right thing for random inserts (100 tries)', () => {
    for (let i = 0; i < 100; i++) {
      let t = randomGrow<10>(100, 10);
      pprint(t);
      let expectedSortedL = traverse(t);
      console.log(expectedSortedL);
      let actualSortedL = expectedSortedL.concat().sort((a, b) => a - b);
      expect(expectedSortedL).eql(actualSortedL);
    }
  });

  it('should produce balanced trees for random trees (100 tries)', () => {
    for (let i = 0; i < 100; i++) {
      let t = randomGrow<10>(100, 10);
      expect(verifyBalance(t)).to.be.true;
    }
  });
});
