

const array = [1, 2, 3]

for (element of array) {
  doSomething(element).catch((error) => {
    console.log(error)
    doSomething(element)
  })
}

function doSomething(element) {
  return new Promise((resolve, reject) => {
    let rand = Math.round(Math.random())
    console.log(rand)
    console.log('Element ' + element)

    if (rand === 1) {
      resolve("Yes")
    } else {
      reject("No")
    }
  })
}
