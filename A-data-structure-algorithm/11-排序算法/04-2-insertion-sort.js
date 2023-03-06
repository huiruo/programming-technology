const Compare = {
  LESS_THAN: -1,
  BIGGER_THAN: 1,
  EQUALS: 0
};

function defaultCompare(a, b) {
  if (a === b) {
    return Compare.EQUALS;
  }
  return a < b ? Compare.LESS_THAN : Compare.BIGGER_THAN;
}

function swap(array, index1, index2) {
  const aux = array[index1];
  array[index1] = array[index2];
  array[index2] = aux;
}

const insertionSort = (array, compareFn = defaultCompare) => {
  const { length } = array;
  let temp;
  for (let i = 1; i < length; i++) { // 2
    let j = i;  // 3
    temp = array[i];  // 4
    // console.log('to be inserted ' + temp);
    while (j > 0 && compareFn(array[j - 1], temp) === Compare.BIGGER_THAN) {  // 5
      // console.log('shift ' + array[j - 1]);
      array[j] = array[j - 1];    // 6
      j--;
    }
    // console.log('insert ' + temp);
    array[j] = temp;  // 7
  }
  return array;
};

const array = [52, 63, 14, 59, 68, 35, 8, 67, 45, 99];
insertionSort(array)
console.log('array', array)
