/*
改进后:
如果从内循环减去外循环中已跑过的轮数，就可以避免内循环中所有不必要的比较（行{1}）。
O(n)
*/
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

function modifiedBubbleSort(array, compareFn = defaultCompare) {
    const { length } = array;
    let cost = 0;
    for (let i = 0; i < length; i++) {
        // console.log('--- ');
        for (let j = 0; j < length - 1 - i; j++) { // 1
            cost++;
            // console.log('compare ' + array[j] + ' with ' + array[j + 1]);
            if (compareFn(array[j], array[j + 1]) === Compare.BIGGER_THAN) {
                // console.log('swap ' + array[j] + ' with ' + array[j + 1]);
                swap(array, j, j + 1);
            }
        }
    }

    console.log('cost for bubbleSort with input size ' + length + ' is ' + cost);
    console.log('array:', array);
    /*
    cost for bubbleSort with input size 13 is 78
    array: [
       1, 2, 3, 3, 4,  5,
       5, 7, 8, 8, 9, 10,
      10
    ]
    * */
    return array;
}

modifiedBubbleSort([10, 8, 10, 2, 3, 5, 7, 8, 9, 1, 3, 4, 5])
