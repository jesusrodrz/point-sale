const data = ['chicken', '10 lbs', 'hot sauce', '4 cups', 'celery', '1 stalk']

function reduceProducts(array, dimension) {
  const res = array.reduce((a, c, i) => {
    return i % dimension === 0 ? a.concat([array.slice(i, i + dimension)]) : a
  }, [])

  return res.map(e => e.join(''))
}

reduceProducts(data)

console.log(reduceProducts(data, 2))
