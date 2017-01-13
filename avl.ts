export type Z = {};
export type Succ<N> = {
  prev: N
};
export type One = Succ<Z>;
type add_two<N> = Succ<Succ<N>>;

export type NonLeafAVL<N> = Balanced<N>| RightHeavy<N>| LeftHeavy<N>;
export type AVL<N> = Leaf | NonLeafAVL<N>;
type Leaf = {
  type: 'leaf'
};
type Balanced<N> = {
  left: AVL<N>,
  v: number,
  right: AVL<N>,
  type: 'bal'
};
type LeftHeavy<N> = {
  left: AVL<Succ<N>>,
  v: number,
  right: AVL<N>,
  type: 'lh'
};
type RightHeavy<N> = {
  left: AVL<N>,
  v: number,
  right: AVL<Succ<N>>,
  type: 'rh'
};

let leaf: Leaf = {type: 'leaf'};

type AVL_I<N> = {
  type: 'grew',
  v: NonLeafAVL<Succ<N>>
}|{type: 'same', v: AVL<N>};

// convinience constructors.
function Balanced<N>(left: AVL<N>, v: number, right: AVL<N>): Balanced<N> {
  return {left: left, v: v, right: right, type: 'bal'};
}

function LeftHeavy<N>(left: AVL<Succ<N>>, v: number, right: AVL<N>): LeftHeavy<N> {
  return {left: left, v: v, right: right, type: 'lh'};
}

function RightHeavy<N>(left: AVL<N>, v: number, right: AVL<Succ<N>>): RightHeavy<N> {
  return {left: left, v: v, right: right, type: 'rh'};
}

function Grew<N>(t: NonLeafAVL<N>): AVL_I<N> {
  return {type: 'grew', v: t};
}

function Same<N>(t: AVL<N>): AVL_I<N> {
  return {type: 'same', v: t};
}

export function singleton(x: number): Balanced<One> {
  return {left: leaf, v: x, right: leaf, type: 'bal'};
}

export function insert<N>(x: number, t: AVL<N>): AVL_I<N> {
  if (t.type === 'leaf') return Grew(singleton(x));
  let {right, v: key, left} = t;
  if (t.type === 'bal') {
    if (x == key) {
      return Same(t);
    } else if (x < key) {
      let {type, v: new_left} = insert(x, left);
      if (type == 'grew') return Grew(LeftHeavy(new_left, key, right));
      return Same(Balanced(new_left, key, right));
    } else {
      let {type, v: new_right} = insert(x, right);
      if (type == 'grew') return Grew(RightHeavy(left, key, new_right));
      return Same(Balanced(left, key, new_right));
    }
  } else if (t.type === 'lh') {
    if (x == key) {
      return Same<N>(t);
    } else if (x < key) {
      let {type, v: res} = insert(x, left);
      if (type == 'same') {
        return Same(LeftHeavy(res, key, right));
      } else {
        if (res.type == 'bal') throw new Error('unreachable pattern not detected');
        if (res.type == 'lh') {
          return Same(Balanced(res.left, res.v, Balanced(res.right, key, right)));
        } else if (res.type == 'rh') {
          let left_right = res.right;
          if (left_right.type == 'lh') {
            return Same(Balanced(
                Balanced(res.left, res.v, left_right.left), left_right.v,
                RightHeavy(left_right.right, key, right)));
          } else if (left_right.type == 'bal') {
            return Same(Balanced(
                Balanced(res.left, res.v, left_right.left), left_right.v,
                Balanced(left_right.right, key, right)));
          } else if (left_right.type == 'rh') {
            return Same(Balanced(
                LeftHeavy(res.left, res.v, left_right.left), left_right.v,
                Balanced(left_right.right, key, right)));
          }
        }
      }
    } else {
      let {type, v: res} = insert(x, right);
      if (type == 'grew') return Same(Balanced(left, key, res));
      return Same(LeftHeavy(left, key, res));
    }
  } else if (t.type == 'rh') {
    if (x == key) {
      // t appears to be correctly narrowed to RightHeavy<N>, but still
      // TS does not infer the type parameter correctly. A TS bug?
      return Same<N>(t);
    } else if (x < key) {
      let {type, v: res} = insert(x, left);
      if (type == 'grew') return Same(Balanced(res, key, right));
      if (type == 'same') return Same(RightHeavy(res, key, right));
    } else if (x > key) {
      let {type, v: res} = insert(x, right);
      if (type == 'same') return Same(RightHeavy(left, key, res));
      if (type == 'grew') {
        if (res.type == 'bal') throw new Error('unreachable pattern detected');
        if (res.type == 'lh') {
          let right_right = res.right;
          let right_left = res.left;
          let right_key = res.v;
          if (right_left.type == 'bal') {
            return Same(Balanced(
                Balanced(left, key, right_left.left), right_left.v,
                Balanced(right_left.right, right_key, right_right)));
          } else if (right_left.type == 'lh') {
            return Same(Balanced(
                Balanced(left, key, right_left.left), right_left.v,
                RightHeavy(right_left.right, right_key, right_right)));
          } else if (right_left.type == 'rh') {
            return Same(Balanced(
                LeftHeavy(left, key, right_left.left), right_left.v,
                Balanced(right_left.right, right_key, right_right)));
          }
        }
        if (res.type == 'rh') {
          return Same(Balanced(Balanced(left, key, res.left), res.v, res.right));
        }
      }
    }
  }
  throw new Error('unreachable; end of function');
}
