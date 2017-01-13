import {assert, expect} from 'chai';

import {AVL, insert, NonLeafAVL, singleton} from './avl';

function assertNonLeaf<N>(t: AVL<N>): NonLeafAVL<N> {
  if (t.type == 'leaf') throw 'leaf found';
  return t as any;
}

// in-order
function traverse<N>(t: AVL<N>): number[] {
  if (t.type == 'leaf') return [];
  // is TS smart enough to infer t is NonLeafAVL.
  return traverse(t.left).concat(t.v).concat(traverse(t.right));
}

// really N should be equal to times.
// The user will have to statically know times and pass the parameter :/
function randomGrow<N>(bound: number, times: number): AVL<N> {
  // really t is of type AVL<0..N> = AVL<0> | AVL<1> | ... | AVL<N>
  let t: any = singleton(Math.floor(Math.random() * bound));
  for (let i = 1; i < times; i++) {
    let n = Math.floor(Math.random() * bound);
    t = insert(n, t).v;
  }
  return t;
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
      let t = randomGrow<10>(30, 10);
      let expectedSortedL = traverse(t);
      let actualSortedL = expectedSortedL.concat().sort();
      expect(expectedSortedL).to.equal(actualSortedL);
    }
  });
});
