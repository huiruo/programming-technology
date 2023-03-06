/*
在所有排序算法中最简单。从运行时间的角度来看，冒泡排序是最差的一个。
冒泡排序一共要进行(n-1)次循环,每一次循环都要进行当前n-1次比较
所以一共的比较次数是:

(n-1) + (n-2) + (n-3) + … + 1 = n*(n-1)/2;

所以冒泡排序的时间复杂度是 O(n2)

冒泡排序比较所有相邻的两个项，如果第一个比第二个大，则交换它们。
元素项向上移动至正确的顺序，就好像气泡升至表面一样，冒泡排序因此得名。
*/
function bubbleSort(array) {
    var length = array.length;
    var cost = 0;
    for (var i = 0; i < length; i++) { //{1}
        cost++;
        for (var j = 0; j < length - 1; j++) { //{2}
            cost++;
            if (array[j] > array[j + 1]) {
                swap(array, j, j + 1);
            }
        }
    }
    console.log('cost for bubbleSort with input size ' + length + ' is ' + cost);
    console.log('array:', array);
    /*
    cost for bubbleSort with input size 13 is 169
    array: (13)[1, 2, 3, 3, 4, 5, 5, 7, 8, 8, 9, 10, 10]
    * */
}

function swap(array, index1, index2) {
    var aux = array[index1];
    array[index1] = array[index2];
    array[index2] = aux;
}

bubbleSort([10, 8, 10, 2, 3, 5, 7, 8, 9, 1, 3, 4, 5])
