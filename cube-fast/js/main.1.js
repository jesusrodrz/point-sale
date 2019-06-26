;(function (doc,c) {
  // nos traemos todo lo que contenga Products para detectar los click en cada tarjeta
  const productsContainer = doc.querySelector('.Products')
  // nos traemos todo lo que contenga Edit para detectar los click en cada button
  const editContainer = doc.querySelector('.Edit')
  // Creamos un array donde se meteran todos los iem que se mostraran en la lista
  let store = []
  // Aqui guardamos todas las modificaciones que se hagan con la calculadora
  // para luego buscar el producto y mostrar los cambios en pantalla
  let calculator = { value: '', mode: 'UNIT', product: null, active: false, point: false}
  // Colocamos en la calculadora los valores que tenag el producto a editar
  function setValueOfCalculator(mode) {
    store.map(product => {
      if(product.edit) {
        calculator.product = product
        calculator.active = true
        switch (mode.toUpperCase()) {
          case 'UNIT':
            calculator.value = `${product.unit}`
            break;
          case 'PRICE':
            calculator.value = `${product.price}`
            break;
          case 'OFF':
            calculator.value = `${product.off}`
            break;
        }
      }
    })
  }
  // detectamos el click en Products para luego hacer delegacion de eventos
  productsContainer.addEventListener('click',  (event) => {
    let product
    // navegamos hasta el nodo padre de la tarjeta para obtener la info dentro de manera mas sencilla
    function searchParent(target) {
      // una vez encontrado el nodo que neceitamos obtenemos la info
      if(target.parentNode.classList.contains('card')) {
        let price = target.parentNode.querySelector('.card-price').innerText
        price = parseFloat(price.replace('$','').replace(' ',''))
        // guardamos la info en una variable que luego meteremos al store
        product = {
          container: null,
          name: target.parentNode.querySelector('.content').innerText,
          price: price,
          pay: price,
          unit: 1,
          edit: false,
          off: 0
        }
      } else {
        // si el nodo no es el que buscamos, vamos un nodo mas arriba y seguimso buscando
        searchParent(target.parentNode)
      }
    }
    searchParent(event.target)

    addProductsStore(product)
  })
  // detectamos el click en Edit para luego hacer delegacion de eventos
  editContainer.addEventListener('click', event => {
    let mode = doc.querySelector('.Edit .button.active').getAttribute('value')
    setValueOfCalculator(mode)

    if(calculator.active) {
      let product = {
        container: calculator.product.container,
        name: calculator.product.name,
        price: calculator.product.price,
        pay: calculator.product.pay,
        unit: calculator.product.unit,
        edit: calculator.product.edit,
        off: calculator.product.off
      }
      
      let button = event.target
      let buttons = [...editContainer.querySelectorAll('.button')]

      if(button.nodeName === 'A') {
        button = button
      } else if(button.parentNode.nodeName === 'A') {
        button = button.parentNode
      } else {
        button = button.parentNode.parentNode
      }
    
      let valueButton = button.getAttribute('value') ? button.getAttribute('value').toUpperCase() : null

      switch (valueButton) {
        case 'OFF':
          buttons.map(button => button.classList.remove('active'))
          button.classList.add('active')
          calculator.mode = valueButton
          calculator.value = `${calculator.product.off}`
          break;
        case 'UNIT':
          buttons.map(button => button.classList.remove('active'))
          button.classList.add('active')
          calculator.mode = valueButton
          calculator.value = `${calculator.product.unit}`
          break;
        case 'PRICE':
          buttons.map(button => button.classList.remove('active'))
          button.classList.add('active')
          calculator.mode = valueButton
          calculator.value = `${calculator.product.price}`
          // c(typeof calculator.product.price)
          break;
        case 'CLIENT':
          break;
        case 'PAYMENT':
          break;
        case 'POINT':
          if(calculator.value !== '' && calculator.value !== '0' && calculator.mode !== 'UNIT') {
            calculator.point = true
          }
          break;
        case 'DELETE':
          calculator.value = calculator.value.slice(0,-1)
          if(calculator.value === '') calculator.value = '0'
          // c(calculator.value)
          break;
        default:
          if(calculator.value === '0') calculator.value = ''

          if(calculator.point === true) {
            calculator.value = `${calculator.value}.${valueButton}`
            calculator.point = 0
          } else {
            calculator.value += valueButton
          }
          // c(calculator.value)
          break;
        }
        switch (calculator.mode) {
          case 'UNIT':
            product.unit = parseFloat(calculator.value)
            product.pay = parseFloat((product.price * product.unit).toFixed(2))
            break;
          case 'PRICE':
            c(product.price, product.pay)
            product.price = parseFloat(calculator.value)
            product.pay = parseFloat((product.price * product.unit).toFixed(2))
            c(product.price, product.pay)
            break;
          case 'OFF':
            product.off = parseFloat(calculator.value)
            break;
        }
        // c(calculator.value)
        // valueButton ? c(product) : null
        valueButton ? modifyStoreWithCalculator(product) : null
    } else {
      c('No hay algun producto con la opcion editar activada')
    }
  })
  function modifyStoreWithCalculator(product) {
    store.map(productInStore => {
      if(productInStore.edit) {
        let indexProduct = store.indexOf(productInStore)
        // sacamos el producto antiguo del store y del dom
        // c(productInStore)
        store.splice(indexProduct, 1)
        productInStore.container.remove()
        // agregamos el nuevo producto al store y al dom
        store.push(product)
        printProduct(product,'CREATE')
        c(store)
      }
    })
  }
  // agrega productos al store
  function addProductsStore(product) {
    c('addProductStore')
    if(store.length === 0) {
      store.push(product)
      printProduct(product,'CREATE')
      // c('store inicial', store)
    } else {

      let productExists = store.find(productInStore => productInStore.name === product.name)
      
      if(productExists) {
        productExists.unit += 1
        productExists.pay = parseFloat((productExists.price * productExists.unit).toFixed(2))
        printProduct(productExists,'MODIFY')
        // c('existe', store)
      } else {
        store.push(product)
        printProduct(product,'CREATE')
        // c('push', store)
      }
    }
  }
  // crea o modifica cada elemento del store como un item de la lista
  function printProduct(product,action) {
    if(action === 'CREATE') {
      const itemOfList = doc.createElement('section')
      itemOfList.innerHTML = `
        <p class="product">${product.name}</p>
        <p class="quantity">${product.unit} Unidad(es) a $${product.price}/Unidad</p>
        <p class="pay">Precio a pagar $ ${product.pay}</p>
        <div class="buttons">
          <button class="button edit">
            <span class="icon">
              <i class="fas fa-edit"></i>
            </span>
          </button>
          <button class="button delet">
            <span class="icon">
              <i class="fas fa-times"></i>
            </span>
          </button>
        </div>
      `
      itemOfList.classList.add('List-item')
      doc.querySelector('.List-items').appendChild(itemOfList)
      doc.querySelector('.List-message').classList.add('hidden')
      // detecto los click en cada elemento de la lista para editar o borrar
      itemOfList.addEventListener('click', event => {
        let action
        if(event.target.classList.contains('edit','button')) action = 'EDIT'
        if(event.target.classList.contains('delet','button')) action = 'DELETE'
        modifyStore(product,itemOfList,action)
      })
      // creamos el elemento que muestra el total a pagar
      printPayment()
      store.map(productInStore => {
        if(productInStore.name === product.name) productInStore.container = itemOfList
      })
    }
    if(action === 'MODIFY') {
      let products = [...doc.querySelectorAll('.List-items .product')]
      let productModify = products.find(productEdit => productEdit.innerText === product.name)
      let quantity = productModify.nextElementSibling
      let pay = quantity.nextElementSibling
      quantity.innerText = `${product.unit} Unidad(es) a $${product.price}/Unidad`
      pay.innerText = `Precio a pagar $ ${product.pay}`
      // modificamos el elemento que muestra el total a pagar
      printPayment()
    }
  }
  // modifica los elementos dentro del store
  function modifyStore(product,itemOfList,action) {
    switch (action) {
      case 'DELETE':
        let indexProduct = store.indexOf(product)
        // sacamos el producto del store
        store.splice(indexProduct, 1)
        // removemos el item del DOM
        itemOfList.remove()
        printPayment()
        break;

      case 'EDIT':
        store.map(productsInStore => {
          productsInStore.name === product.name
          ? productsInStore.edit = true
          : productsInStore.edit = false
        })
        // let mode = doc.querySelector('.Edit .button.active').getAttribute('value')
        // setValueOfCalculator(mode)
        break;
    }
  }
  // agrega la seccion que muestra el total a pagar
  function printPayment() {
    // payment almacena la suma de todos los productos
    let payment = 0
    store.map(productInStore => payment += productInStore.pay)
    // store.map(productInStore => c(typeof productInStore.pay))
    // c(payment)
    let impuestos = parseFloat((payment - (payment / 1.18)).toFixed(2))
    
    if(doc.querySelector('.List-payment')) {
      // crea modifica elemento donde se muestra el total a pagar
      listPaymentContainer = doc.querySelector('.List-payment')
      listPaymentContainer.innerHTML = `
        <p class="payment">Total a pagar $ ${payment}</p>
        <p class="impuesto">Impuestos $ ${impuestos}</p>
      `
      // si el total a pagar es 0 lo eliminina
      if(payment === 0) listPaymentContainer.remove()
      // c('existe')
    } else {
      // crea el elemento donde se muestra el total a pagar
      const listPaymentContainer = doc.createElement('article')
      listPaymentContainer.innerHTML = `
        <p class="payment">Total a pagar $ ${payment}</p>
        <p class="impuesto">Impuestos $ ${impuestos}</p>
      `
      listPaymentContainer.classList.add('List-payment')
      doc.querySelector('.List').appendChild(listPaymentContainer)
    }
  }



})(document,console.log)