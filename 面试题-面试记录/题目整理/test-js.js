function toThousands(num) {
  let numA = (num || 0).toString()
  let result = '';

  while (numA.length > 3) {
    result = ',' + numA.slice(-3) + result;
    numA = numA.slice(0, numA.length - 3);
  }

  if (numA) {
    result = numA + result;
  }

  return result;
}

console.log('test:', toThousands(12001900))
