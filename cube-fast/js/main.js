// const Clusterize = require('clusterize.min.js')
const GlobalPayState = {
  customer: null,
  payment: 0,
  validPayment: 0,
  change: 0,
  discount: 0,
  subtotal: 0,
  taxes: 0, // impuestos
  paymentMethods: [], //metodos de pagos
  edit: {
    discount: false
  },
  ticketType: null
}

//create the array that store all the products and their info
//creamos el array que contendrá toda la información de los prodcutos
let store = []
;(function(d, c) {
  // const d = document
  // const c = console.log
  //get the main container so we can detect all clicks and events and delegate them
  //otenemos el container principal para detectar todos los clicks y eventos para luego delegarlos
  const container = d.getElementById('pointSaleContainer')

  let pays = []
  let editStateOptions = {
    active: false,
    currentProduct: null,
    type: 'unit'
  }

  const paymentMethods = {
    due: 0,
    selected: null,
    methods: []
  }
  const tabs = {
    current: null,
    previus: null,
    products: d.querySelector('.Wrapper--products'),
    customers: d.querySelector('.Wrapper--customers'),
    payment: d.querySelector('.Wrapper--payment'),
    valid: d.querySelector('.Wrapper--valid')
  }

  function SavePayment(objectData) {
    objectData.products = store
    $.ajax({
      url: UrlComprobantePago,
      dataType: 'json',
      contentType: 'application/json',
      type: 'POST',
      data: JSON.stringify(objectData)
    }).done(function(data) {
      switch (data.accion) {
        case 'success':
          Swal.fire({
            text: 'Orden procesada',
            type: 'success',
            confirmButtonText: 'Ok'
          }).then(rel => {
            validatePayment()
          })
          break
        case 'error':
          MostrarMensaje('Error de operaci\u00f3n', data.Msj, 'error')
          break
      }
    })
  }

  window.addEventListener('keydown', e => {
    if (tabs.current === tabs.payment && paymentMethods.methods.length > 0) {
      if (e.key === '.' || e.code.indexOf('Digit') !== -1) {
        setEditMethod(e.key)
      } else if (e.code.indexOf('Numpad') !== -1) {
        setEditMethod(e.code.replace('Numpad', ''))
      } else if (e.key === 'Backspace') {
        setEditMethod('delete')
      }
    }
  })
  container.addEventListener('change', e => {
    const cutomersSearch = e.target.closest('.js-search-customers')
    const productsSearch = e.target.closest('.js-search-products')

    if (productsSearch) {
      // c(productsSearch.value)
      if (productsSearch.value === '') {
        stateProducts.search = false
        updateProductsGrid(stateProducts.products, 'refresh')
      }
    } else if (cutomersSearch) {
      stateCustomers.search = false
      updateCustomersTable(stateCustomers.customers, 'refresh')
    }
  })
  container.addEventListener('click', e => {
    //get the event element target
    //obtenemos el elemento que dispara el evento
    const target = e.target

    validateTapHandler(target)
    newOderHandler(target)
    paymentTabHandler(target)

    productGridHandler(target)
    productListHandler(target)
    productEditHandler(target)

    customersTobarHandler(target)
    customersFormHandler(e, target)
    customersTableHandler(target)
  })
  function newOderHandler(target) {
    if (!target.closest('.js-new-order')) {
      return
    }
    store.forEach(product => {
      deleteProduct(product.element)
    })
    if (GlobalPayState.customer) {
      setCustomer('unset')
    }

    paymentMethods.methods.forEach(method => {
      deletePaymentMethod(method)
    })

    clusterizeCustomers.clear()
    clusterizeProducts.clear()

    loadCustomers(1)
    loadProducts(1)

    toggleTab(tabs.valid, tabs.products)
  }
  function validateTapHandler(target) {
    const btn = target.closest('.order-receipt__button')

    if (btn) {
      printReceipt()
    }
  }
  function setTicketTyper(button) {
    // c('state: ' + GlobalPayState.ticketType, 'button: ' + button.value)
    if (this.current === button) {
      return
    }

    GlobalPayState.ticketType = button.value

    button.classList.add('active')
    if (this.current) {
      this.current.classList.remove('active')
    }

    // if (!this.current) {
    this.current = button
    // }

    setPaymentValid(true)
  }
  function paymentTabHandler(target) {
    const customerBtn = target.closest('.js-button-customer-2')
    const methodBtn = target.closest('.js-methods-button')
    const methodBtnDelete = target.closest('.js-method-del')
    const methodElement = target.closest('.js-method')
    const calcBtn = target.closest('.js-calculator-num')
    const calcDel = target.closest('.js-calculator-delete')
    const validateBtb = target.closest('.js-valid-btn')
    const ticketTypeBtn = target.closest('.js-ticket-type')

    if (ticketTypeBtn) {
      setTicketTyper(ticketTypeBtn)
    }

    if (customerBtn) {
      toggleTab(tabs.payment, tabs.customers)
    }
    if (methodBtn) {
      addPaymentMethod(methodBtn)
    }
    if (methodBtnDelete) {
      const element = methodBtnDelete.parentElement.parentElement

      const method = paymentMethods.methods.find(
        method => method.element === element
      )

      deletePaymentMethod(method)
    }
    if (methodElement) {
      const method = paymentMethods.methods.find(
        method => method.element === methodElement
      )
      setPaymentMethod(method)
    }
    if (calcBtn && paymentMethods.selected) {
      const value = calcBtn.value
      setEditMethod(value)
    }
    if (calcDel && paymentMethods.selected) {
      const value = calcDel.value
      setEditMethod(value)
    }

    if (validateBtb) {
      Swal.fire({
        title: 'Procesar!',
        text: '¿Quieres procesar la orden?',
        type: 'question',
        confirmButtonText: 'Si',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        preConfirm: result => {
          c(result)
        }
      }).then(rel => {
        if (rel.value === true) {
          SavePayment(GlobalPayState)

          /*Swal.fire({
                          // title: 'Error!',
                          text: 'Orden procesada',
                          type: 'success',
                          confirmButtonText: 'Ok'
                      }).then(rel => {
                          validatePayment()
                      })*/
        }

        if (rel.dismiss === 'cancel') {
          return
        }
      })
    }
  }

  function customersTableHandler(target) {
    const buttonSelect = target.closest('.js-customers-list-select')
    const buttonEdit = target.closest('.js-customers-list-edit')

    if (buttonSelect) {
      setCustomer(buttonSelect)
    }
    if (buttonEdit) {
      editCustomer(buttonEdit)
    }
  }

  function customersFormHandler(e, target) {
    const buttonSave = target.closest('.customers__button--save')
    const buttonClose = target.closest('.customers__button--close')
    if (buttonClose) {
      e.preventDefault()
      customerForm('close')
    }
    if (buttonSave) {
      // e.preventDefault()
      // saveCustomer()
    }
  }

  function customersTobarHandler(target) {
    const buttonBack = target.closest('.js-button-customers-back')
    const buttonAddCustomer = target.closest('.js-button-customers-add')
    const buttonDeselectCustomer = target.closest(
      '.js-button-customers-deselect'
    )
    const searchBtn = d.querySelector('.js-btn-customers')

    if (searchBtn) {
      const input = d.querySelector('.js-search-customers')
      if (input.value !== '') {
        searchCustomers(input.value)
      }
    }

    if (buttonBack) {
      toggleTab(tabs.current, tabs.products)
    }

    if (buttonAddCustomer) {
      customerForm('active')
    }
    if (buttonDeselectCustomer) {
      setCustomer('unset')
    }
  }

  // handle the buttons in the edit panel
  // maneja los los clicks in the edit panel
  function productEditHandler(target) {
    const numButton = target.closest('.js-button-num')
    const deleteButton = target.closest('.js-button-delete')
    const editButton = target.closest('.js-button-edit')
    const paymentButton = target.closest('.js-button-payment')
    const customerButton = target.closest('.js-button-customer')

    // if the target is the edit options buttons call the setEdit func
    // si el target es uno d elos botones de editar el modo llama la funcion setEditState
    if (editButton) {
      const type = editButton.value
      if (type === 'discount') {
        Swal.fire({
          title: 'Ingresar contraseña',
          input: 'password',
          inputPlaceholder: 'contraseña',
          inputAttributes: {
            maxlength: 10,
            autocapitalize: 'off',
            autocorrect: 'off'
          }
        }).then(rel => {
          setEditState(null, type)
        })
      } else if (type === 'price') {
        Swal.fire({
          title: 'Esta opción esta deshabilitada',
          // text: 'Do you want to continue',
          type: 'error',
          confirmButtonText: 'Ok'
        })
      } else {
        setEditState(null, type)
      }
    }

    if (numButton && editStateOptions.currentProduct) {
      editProduct(editStateOptions.currentProduct, 'num', numButton.value)
    }

    if (deleteButton) {
      editProduct(editStateOptions.currentProduct, 'delete')
    }
    if (customerButton) {
      toggleTab(tabs.products, tabs.customers)
    }
    if (paymentButton) toggleTab(tabs.products, tabs.payment)
  }

  // handle the click un the products list to edit or delete
  // maneja los clicks en la lista de productos para elimninar o borrar
  function productListHandler(target) {
    //chech if the click is a prodcut of the list
    //comprueba si el click es un producto de la lista
    if (target.closest('.List-item')) {
      //get the dom element in the list
      //obtenemos el elmento del dom
      const productEl = target.closest('.List-item')

      if (target.closest('.edit')) {
        const currentProductToEdit = store.find(
          product => product.element === productEl
        )

        setEditState(currentProductToEdit)
      } else if (target.closest('.delet')) {
        deleteProduct(productEl)
      }
    }
  }

  function searchProducts(input) {
    const page = 0
    $.ajax({
      url: UrlListProducts + '?page=' + page,
      type: 'POST',
      data: {
        codigoNombre: input
      }
    }).done(function(data) {
      switch (data.accion) {
        case 'success':
          updateProductsGrid(data.Lista, 'search')
          stateProducts.search = true
          break
        case 'error':
          swal({
            title: 'Error de operaci\u00f3n',
            text: data.Msj,
            type: 'error'
          })
          stateProducts.fetching = false
          break
      }
    })
  }
  function searchCustomers(input) {
    fetch(`data/customers.${input}.json`)
      .then(response => response.json())
      .then(text => {
        stateCustomers.search = true
        updateCustomersTable(text.data, 'search')
      })
  }
  function loadProductBarCode(barcode) {
    c('barcode: ' + barcode)
    $.ajax({
      url: UrlBuscarArticuloCodBarra + '?codBarra=' + barcode,
      type: 'GET'
    }).done(function(data) {
      switch (data.accion) {
        case 'success':
          addProductBarCode(data.articulo)
          break
        case 'error':
          swal({
            title: 'Error de operaci\u00f3n',
            text: data.Msj,
            type: 'error'
          })
          break
      }
    })
  }
  function addProductBarCode(productObj) {
    const product = {
      name: productObj.nombre,
      price: productObj.PrecioVenta,
      unit: 1,
      pay: productObj.MontoDescuento
        ? productObj.MontoDescuento
        : productObj.PrecioVenta,
      element: null,
      isDiscount: productObj.MontoDescuento ? true : false,
      discountPrice: productObj.MontoDescuento,
      discount: productObj.MontoDescuento
        ? Math.round(
            ((Number(productObj.PrecioVenta) -
              Number(productObj.MontoDescuento)) *
              100) /
              productObj.PrecioVenta
          )
        : 0,
      id: productObj.id_articulo,
      edit: {
        unit: false,
        price: false,
        discount: false
      }
    }

    addProductsStore(product)
  }
  function setBarCodeReader(btn) {
    const input = d.querySelector('.js-bar-code-input')
    const viewport = d.querySelector('.viewport-camera')

    const type = 'camera'

    function setQuagga(action) {
      // if(!this.quagga)
      if (action === 'close') {
        Quagga.stop()
        viewport.classList.remove('active')
        return
      }
      // c('ok')
      viewport.classList.add('active')
      Quagga.init(
        {
          inputStream: {
            name: 'Live',
            type: 'LiveStream',
            target: viewport // Or '#yourElement' (optional)
          },
          decoder: {
            readers: ['code_128_reader']
          }
        },
        function(err) {
          if (err) {
            console.log(err)
            return
          }
          console.log('Initialization finished. Ready to start')
          Quagga.start()
        }
      )

      Quagga.onDetected(codeHandler)
      // Quagga.onProcessed(codeHandler)

      function codeHandler(data) {
        if (!this.ready) {
          this.ready = true
          setTimeout(() => {
            this.ready = false
          }, 1000)
        } else {
          return
        }

        // c(data)

        const sing = viewport.querySelector('span')

        sing.classList.add('active')

        sing.addEventListener('transitionend', function animation() {
          sing.classList.remove('active')
          sing.removeEventListener('animationend', animation)
        })
        
        loadProductBarCode(data.codeResult.code)
      }
    }

    if (!this.state) {
      this.state = true
      btn.classList.add('is-active')
      if (type === 'camera') {
        setQuagga()
      } else {
        input.addEventListener('keydown', readCode)
        input.focus()
      }
    } else {
      this.state = false
      btn.classList.remove('is-active')
      if (type === 'camera') {
        setQuagga('close')
      } else {
        input.removeEventListener('keydown', readCode)
        input.blur()
      }
    }

    function readCode(event) {
      if (event.key === 'Enter') {
        loadProductBarCode(input.value)
        input.value = ''
      }
    }
  }

  //this func handle all the clicks in the grid product section
  //esta función maneja todos los clicks en el grid de productos
  function productGridHandler(target) {
    const barCodeBtn = target.closest('.js-bar-code-btn')
    const searchBtn = target.closest('.js-btn-products')
    const toggleEdit = target.closest('.js-toggle-btn')
    if (toggleEdit) {
      const editPanel = d.querySelector('.Wrapper-left')

      editPanel.classList.toggle('active')
      toggleEdit.querySelector('i').classList.toggle('mdi-close')
      toggleEdit.querySelector('i').classList.toggle('mdi-menu')
    }
    if (barCodeBtn) {
      setBarCodeReader(barCodeBtn)
    }
    if (searchBtn) {
      const input = d.querySelector('.js-search-products')
      if (input.value !== '') {
        searchProducts(input.value)
      }
    }

    //detectamos si el target un producto
    //detect if the target is a product
    if (target.closest('.card')) {
      const element = target.closest('.card')
      const price = element.querySelector('.price').innerText
      const name = element.querySelector('.content').innerText
      const discount = element.querySelector('.discount').innerText
      const id = element.getAttribute('data-id')
      const discountUnit = element
        .querySelector('.discount')
        .getAttribute('data-discount-unit')
      //creamos esta constante para almacenar la información del producto
      //create this const to store the product information
      const product = {
        name,
        price,
        unit: 1,
        pay: element.classList.contains('is-discount') ? discount : price,
        element: null,
        isDiscount: element.classList.contains('is-discount'),
        discountPrice: discount,
        discount: discountUnit,
        id: id,
        edit: {
          unit: false,
          price: false,
          discount: false
        }
      }

      addProductsStore(product)
    }
  }

  //add and update the product store
  //agraga y actualiza el store
  function addProductsStore(product) {
    const productExists = store.find(
      productInStore => productInStore.name === product.name
    )

    //if the product exists update the unit and pay price
    // si el producto existe actualiza la unidad y el precio a pagar
    if (productExists) {
      productExists.unit = Number(productExists.unit) + 1
      productExists.pay = productExists.isDiscount
        ? (
            Number(productExists.discountPrice) * Number(productExists.unit)
          ).toFixed(2)
        : (Number(productExists.price) * Number(productExists.unit)).toFixed(2)

      modifyViewProduct(productExists)
      product = productExists
    } else {
      // si no existe crea uno producto
      store.push(product)
      product.element = printProduct(product)
      if (product.discount) {
        modifyViewProduct(product)
      }
    }

    setEditState(product)
  }

  // print the products in the dom
  // muestra los productos en el dom
  function printProduct(product) {
    const item = d.createElement('article')

    item.innerHTML = `
    <p class="product">${product.name}</p>
    <p class="quantity"><span class="js-product-unit">${
      product.unit
    }</span> Unidad(es) a S/.<span class="js-product-price">${
      product.price
    }</span>/Unidad</p>
    <p class="discount hidden">Descuento de <span  class="js-product-discount"></span>%</p>
    <p class="pay">Precio a pagar S/. <span class="js-product-pay">${
      product.pay
    }</span></p>
    <div class="buttons">
      <button class="button edit">
        <span class="icon">
          <i class="mdi mdi-table-edit"></i>
        </span>
      </button>
      <button class="button delet">
        <span class="icon">
          <i class="mdi mdi-close"></i>
        </span>
      </button>
    </div>
  `

    item.classList.add('List-item')
    d.querySelector('.List-items').appendChild(item)
    d.querySelector('.List-message').classList.add('hidden')

    printPayment()
    return item
  }

  // modify the price in the dom tree
  // modifica el precio en el dom
  function modifyViewProduct(product) {
    const unitEl = product.element.querySelector('.js-product-unit')
    const payEl = product.element.querySelector('.js-product-pay')
    const priceEl = product.element.querySelector('.js-product-price')
    const discountEl = product.element.querySelector('.js-product-discount')

    if (Number(product.discount) > 0) {
      discountEl.parentElement.classList.remove('hidden')
    } else {
      discountEl.parentElement.classList.add('hidden')
    }

    unitEl.innerText = product.unit
    payEl.innerText = product.pay
    priceEl.innerText = product.price
    discountEl.innerText = product.discount
    printPayment()
  }

  // delete the producto in store ad remove from the dom
  // Borrra el producto del store y lo remueve del dom
  function deleteProduct(productElement) {
    //create a new array without the product to delete
    //creamos un nuevo array sin el producto a borrar
    store = store.filter(product => product.element !== productElement)
    //remove the dom element
    //removemos el elemento del dom
    productElement.remove()

    //actualizamos el precio total
    //update the total price
    printPayment()
  }
  // agrega la seccion que muestra el total a pagar
  // add the total payment section
  function printPayment() {
    // payment almacena la suma de todos los productos
    //store the sum of all product
    let payment = 0
    let discount = false
    let totalPayment = 0
    store.map(productInStore => (payment += Number(productInStore.pay)))
    const taxes = parseFloat(
      (
        payment *
        Number(
          d.querySelector('#pointSaleContainer').getAttribute('data-impuesto')
        )
      ).toFixed(2)
    )

    //payment sing in payment tab
    const paymentSing = d.querySelector('.js-payment-sing')
    const paymentMethod = d.querySelector('.mtd-due')

    totalPayment = payment

    if (GlobalPayState.discount && GlobalPayState.discount > 0) {
      payment = payment - Number(GlobalPayState.discount)
      // payment - (Number(payment) * Number(GlobalPayState.discount)) / 100
      discount = true
    }

    if (d.querySelector('.List-payment')) {
      // crea modifica elemento donde se muestra el total a pagar
      listPaymentContainer = d.querySelector('.List-payment')
      listPaymentContainer.innerHTML = `
      <p class="payment">Total a pagar S/. ${payment}</p>
      <p class="impuesto">Subtotal S/. ${payment - taxes}</p>
      ${
        discount
          ? '<p class="impuesto">Con descuento de ' +
            (Number(GlobalPayState.discount) * 100) / totalPayment +
            '%</p>'
          : ''
      }
      <p class="impuesto">Impuestos S/. ${taxes}</p>
    `
      // si el total a pagar es 0 lo eliminina
      if (payment === 0) listPaymentContainer.remove()
      // c('existe')
    } else {
      // crea el elemento donde se muestra el total a pagar
      const listPaymentContainer = d.createElement('article')
      listPaymentContainer.innerHTML = `
      <p class="payment">Total a pagar S/. ${payment}</p>
      ${
        discount
          ? '<p class="impuesto">Con descuento de ' +
            GlobalPayState.discount +
            '%</p>'
          : ''
      }
      <p class="impuesto">Impuestos S/. ${taxes}</p>
    `
      listPaymentContainer.classList.add('List-payment')
      d.querySelector('.List').appendChild(listPaymentContainer)
    }
    if (paymentMethod) paymentMethod.innerText = payment

    paymentSing.innerText = payment

    GlobalPayState.payment = payment
    paymentMethods.due = payment
    GlobalPayState.subtotal = payment - taxes
    GlobalPayState.taxes = taxes
    GlobalPayState.totalPayment = totalPayment
  }

  // set and update edit state and the current product to edit
  //  configura y actualiza el estado de la edición y el producto a editar
  function setEditState(product = null, action = 'unit') {
    //get the options buttons (price, discount, unit)
    //obtenemos los botones de opciones (precio, descuento, unidad)
    const buttons = {
      price: d.querySelector('.js-button-edit[value="price"]'),
      discount: d.querySelector('.js-button-edit[value="discount"]'),
      unit: d.querySelector('.js-button-edit[value="unit"]')
    }

    // add active class to the button
    // agregamos la clase active al boton
    buttons[action].classList.add('active')

    // if the button if diferent from the current one remove the class
    // si el button es diferente del actual removemos la clase
    if (action !== editStateOptions.type) {
      buttons[editStateOptions.type].classList.remove('active')
    }

    // add active class to the edit button in the list product and remove in old one
    if (product) {
      product.element.classList.add('active')
    }
    if (
      editStateOptions.currentProduct &&
      editStateOptions.currentProduct !== product
    ) {
      editStateOptions.currentProduct.element.classList.remove('active')
    }

    // actulizamos los datos
    // update the data
    editStateOptions.type = action
    editStateOptions.currentProduct = product
      ? product
      : editStateOptions.currentProduct
    editStateOptions.active = true
    // c(editStateOptions)
  }

  function editProduct(product, action, value) {
    // check the type and action(type of button) and update de unit
    // comprueba el tipo opción y el typo de boton para actualizar la unidad
    if (editStateOptions.type === 'unit') {
      if (action === 'num') {
        if (
          (Number(value) === 0 || value === '.') &&
          product.unit.toString().length === 1 &&
          !product.edit.unit
        ) {
          return
        }
        // check the product.edit var if is false assing the button value if not concat the unit value with the button value
        // comprueba la var product.edit si es falsa asigna el valor del boton si no concatena el valor de la unidad con el del boton
        const unit = product.edit.unit ? product.unit.toString() + value : value

        // update the product
        // actualiza el producto
        product.edit.unit = true
        product.unit = unit
        product.pay = (Number(product.price) * Number(product.unit)).toFixed(2)

        modifyViewProduct(product)
      }

      if (action === 'delete') {
        //if unit is 0 delet the product
        if (Number(product.unit) < 1) {
          deleteProduct(product.element)
        }

        // remove the last num unless that only have one digit and set ti "0"
        // remueve el ultimo digito y si solo tiene uno asigna "0"
        const unit =
          product.unit.toString().length > 1
            ? product.unit.slice(0, product.unit.length - 1)
            : '0'

        product.unit = unit
        product.edit.unit = unit === '0' ? false : true
        product.pay = (Number(product.price) * Number(product.unit)).toFixed(2)

        modifyViewProduct(product)
      }
    }

    if (editStateOptions.type === 'price') {
      if (action === 'num') {
        if (
          (Number(value) === 0 || value === '.') &&
          product.price.toString().length === 1 &&
          !product.edit.price
        ) {
          return
        }
        const price = product.edit.price
          ? product.price.toString() + value
          : value

        product.price = price
        product.edit.price = price === '0' ? false : true
        product.pay = (Number(product.price) * Number(product.unit)).toFixed(2)
        modifyViewProduct(product)
      }
      if (action === 'delete') {
        //if unit is 0 delet the product
        if (Number(product.price) < 1) {
          deleteProduct(product.element)
        }

        // remove the last num unless that only have one digit and set ti "0"
        // remueve el ultimo digito y si solo tiene uno asigna "0"
        const price =
          product.price.toString().length > 1
            ? product.price.slice(0, product.price.length - 1)
            : '0'

        product.price = price
        product.edit.price = price === '0' ? false : true
        product.pay = (Number(product.price) * Number(product.unit)).toFixed(2)

        modifyViewProduct(product)
      }
    }
    if (editStateOptions.type === 'discount') {
      if (action === 'num') {
        if (
          (Number(value) === 0 || value === '.') &&
          GlobalPayState.discount.toString().length === 1 &&
          !GlobalPayState.edit.discount
        ) {
          return
        }

        const discount =
          GlobalPayState.edit.discount && GlobalPayState.discount !== 0
            ? GlobalPayState.discount.toString() + value
            : value
        GlobalPayState.edit.discount = discount === '0' ? false : true
        GlobalPayState.discount = discount
        printPayment()
      }
      if (action === 'delete') {
        // remove the last num unless that only have one digit and set ti "0"
        // remueve el ultimo digito y si solo tiene uno asigna "0"
        const discount =
          GlobalPayState.discount.toString().length > 1
            ? GlobalPayState.discount.slice(
                0,
                GlobalPayState.discount.length - 1
              )
            : ''

        GlobalPayState.discount = discount

        printPayment()
      }
    }
  }

  function toggleTab(current, newTab) {
    // if(tabs)
    current.classList.remove('active')
    // newTab.classList.add('active')

    if (newTab === 'prev') {
      tabs.previus.classList.add('active')
      current.classList.remove('active')
      tabs.current = current
      tabs.previus = current
      return
    }

    newTab.classList.add('active')
    tabs.current = newTab
    tabs.previus = current
  }
  function customerForm(action) {
    if (!this.form) {
      this.form = d.querySelector('.customers__form')
    }

    if (action === 'active') {
      this.form.classList.add('active')
    }
    if (action === 'close') {
      this.form.classList.remove('active')
      const form = this.form

      setForm(form, 'clear')
    }
    // c(this.form)
  }

  function setForm(form, action, customer) {
    const name = form.querySelector('.js-input-name')
    const id = form.querySelector('.js-input-id')
    const type = form.querySelector('.js-input-type')
    const tel = form.querySelector('.js-input-tel')
    const email = form.querySelector('.js-input-email')
    // const tat =  d.getelmen
    if (action === 'clear') {
      name.value = ''
      id.value = ''
      type.options[0].selected = true
      tel.value = ''
      email.value = ''
    }

    if (action === 'set') {
      name.value = customer.razon_social
      id.value = customer.nro_documento

      const options = [...type.options]
      const option = options.find(e => e.value === customer.GrupoPersona)
      // const index = option ? option.index :0

      if (option) {
        option.selected = true
      }
      tel.value = customer.telefono_fijo
      email.value = customer.email
    }
  }

  function saveCustomer() {
    const name = form.querySelector('.js-input-name')
    const id = form.querySelector('.js-input-id')
    const type = form.querySelector('.js-input-type')
    const tel = form.querySelector('.js-input-tel')
    const email = form.querySelector('.js-input-email')

    const customer = {
      id_persona: null,
      razon_social: name.value,
      nro_documento: id.value,
      GrupoPersona: type.options[type.selectedIndex].value,
      telefono_fijo: tel.value,
      email: email.value
    }

    setCustomer(customer)

    // c(customer)

    clusterizeProducts.prepend(customer)
  }

  const getCustomerData = button => {
    const tds = [...button.closest('tr').getElementsByTagName('td')]

    const nro_documento = tds[0].innerText
    const id_persona = tds[0].getAttribute('data-id')
    const razon_social = tds[1].innerText
    const GrupoPersona = tds[2].innerText
    const telefono_fijo = tds[3].innerText
    const email = tds[4].innerText

    return {
      id_persona: id_persona,
      razon_social: razon_social,
      nro_documento: nro_documento,
      GrupoPersona: GrupoPersona,
      telefono_fijo: telefono_fijo,
      email: email
    }
  }

  function setCustomer(param) {
    if (!this.customerTextSpan) {
      // this is for the product tab
      this.customerTextSpan = d.querySelector('.js-button-custome-text')

      // this is for the payment tab
      this.customerTextSpan2 = d.querySelector('.js-button-custome-text-2')
      this.textDefault = this.customerTextSpan.innerText
      this.deselectBtn = d.querySelector('.js-button-customers-deselect')
    }

    if (param === 'unset') {
      this.customerTextSpan.innerText = this.textDefault
      this.customerTextSpan2.innerText = this.textDefault

      this.deselectBtn.classList.remove('active')
      GlobalPayState.customer = null
      if (GlobalPayState.validPayment === true) {
        setPaymentValid()
      }
      return
    }

    function isElement(element) {
      return element instanceof Element || element instanceof HTMLDocument
    }

    const customer = !isElement(param) ? param : getCustomerData(param)

    this.customerTextSpan.innerText = customer.razon_social
    this.customerTextSpan2.innerText = customer.razon_social
    GlobalPayState.customer = customer
    this.deselectBtn.classList.add('active')
    toggleTab(tabs.customers, 'prev')
    if (GlobalPayState.validPayment === false) {
      setPaymentValid(true)
    }
  }

  function editCustomer(param) {
    const form = d.querySelector('.customers__form')
    const customer = getCustomerData(param)
    if (customer) {
      setForm(form, 'set', customer)
      customerForm('active')
    }
  }
  function addPaymentMethod(btn) {
    const methodName = btn.innerText
    const mtdLength = paymentMethods.methods.length
    if (mtdLength > 0 && paymentMethods.methods[mtdLength - 1].tenderet <= 0) {
      return
    }

    const method = {
      name: methodName,
      element: printPaymentMethods(methodName),
      tenderet: 0,
      change: 0,
      due: 0,
      selected: true
    }

    paymentMethods.methods.push(method)
    GlobalPayState.paymentMethods = paymentMethods.methods
    setPaymentMethod(method)
    togglePaymentMethodTap('active')
  }
  function togglePaymentMethodTap(action) {
    const sing = d.querySelector('.Payment__sign')
    const methods = d.querySelector('.Payment__methods')
    if (!this.state) this.state = false

    if (action === 'active' && this.state === false) {
      sing.classList.remove('active')
      methods.classList.add('active')
      this.state = true

      return
    }
    if (action === 'inactive' && this.state === true) {
      sing.classList.add('active')
      methods.classList.remove('active')
      this.state = false
    }
  }
  function deletePaymentMethod(method) {
    paymentMethods.methods = paymentMethods.methods.filter(
      methods => methods !== method
    )
    paymentMethods.selected = null
    method.element.remove()

    if (paymentMethods.methods.length === 0) {
      togglePaymentMethodTap('inactive')
    }
    GlobalPayState.paymentMethods = paymentMethods.methods
  }
  function setPaymentMethod(method) {
    if (paymentMethods.selected && paymentMethods.selected !== method) {
      paymentMethods.selected.element.classList.remove('is-selected')
    }

    method.selected = true
    if (method.element) {
      method.element.classList.add('is-selected')
    }
    paymentMethods.selected = method
  }
  function setEditMethod(value) {
    const method = paymentMethods.selected

    if (value === 'delete') {
      method.tenderet = Number(
        method.tenderet
          .toString()
          .slice(0, method.tenderet.toString().length - 1)
      )
    } else {
      method.tenderet =
        method.tenderet.toString().length > 0 && Number(method.tenderet) !== 0
          ? method.tenderet.toString() + value
          : value
    }

    modifyPaymentMethod()
  }
  function modifyPaymentMethod() {
    const due = paymentMethods.methods.reduce((due, method) => {
      const currentDue = (due - method.tenderet).toFixed(2)

      if (currentDue <= 0) {
        method.change = currentDue
        GlobalPayState.change = Math.abs(currentDue)
        paymentMethods.due = currentDue
      } else if (currentDue > 0) {
        method.due = due
        paymentMethods.due = currentDue
        method.change = 0
        GlobalPayState.change = 0
      }
      modifyViewPaymentMethod(method)
      return currentDue
    }, GlobalPayState.payment)

    if (due <= 0 && GlobalPayState.payment > 0 && GlobalPayState.customer) {
      setPaymentValid(true)
    } else {
      setPaymentValid(false)
    }

    paymentMethods.due = due
  }

  function setPaymentValid(action) {
    const btn = d.querySelector('.js-valid-btn')
    if (
      action &&
      GlobalPayState.ticketType &&
      GlobalPayState.payment > 0 &&
      GlobalPayState.customer &&
      paymentMethods.due <= 0
    ) {
      GlobalPayState.validPayment = true
      btn.removeAttribute('disabled')
      btn.classList.add('is-success')
    } else {
      GlobalPayState.validPayment = false
      btn.setAttribute('disabled', true)
      btn.classList.remove('is-success')
      // btn.sa
    }
  }
  function printReceipt() {
    printJS({
      printable: 'order-receipt',
      type: 'html',
      targetStyles: ['*'],
      style: `
      .order-receipt__file {
        max-width: 8cm;
        font-size: 0.7em;
        color: #000;
      }
      .order-receipt__file * {
        color: inherit;
      }
      .company-logo {
        display: block;
        width: 100%;
        height: auto;
      }
      .company-fig {
        margin: -0.5em;
        margin-bottom: 0;
      }
      .receipt__section {
        border: solid 1px #000;
        padding: 0.5em;
        margin-bottom: 1em;
      }
      .receipt__company {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .order-receipt__file table {
        display: block;
      }
      .order-receipt__file p {
        text-align: center;
      }
      .order-receipt__file h3 {
        font-size: 1em;
      }
    `
    })
  }
  function validatePayment() {
    toggleTab(tabs.payment, tabs.valid)
    const change = d.querySelector('.js-change-field')
    const section = d.querySelector('.order-receipt__file')
    change.innerText = GlobalPayState.change

    const table1 = document.createElement('table')
    table1.appendChild(document.createElement('tbody'))
    const table2 = document.createElement('table')
    table2.appendChild(document.createElement('tbody'))

    table1.classList.add('receipt__section')
    table2.classList.add('receipt__section')

    const customerField = d.querySelector('.js-receipt-customer')
    const idField = d.querySelector('.js-receipt-id')
    const dateField = d.querySelector('.js-receipt-date')

    const date = new Date()
    const dd = String(date.getDate()).padStart(2, '0')
    const mm = String(date.getMonth() + 1).padStart(2, '0') //January is 0!
    const yyyy = date.getFullYear()
    const time = date.getHours() + ':' + date.getMinutes()

    const today = mm + '/' + dd + '/' + yyyy

    customerField.innerText = GlobalPayState.customer.razon_social
    idField.innerText = GlobalPayState.customer.nro_documento
    dateField.innerText = today + ' ' + time

    section.appendChild(table1)
    section.appendChild(table2)
    // section.insertBefore(document.createElement('br'), table2)
    // section.insertBefore(document.createElement('br'), table1)
    const tr = d.createElement('tr')
    tr.innerHTML = `
    <th>Producto</td>
    <th>Unidad</td>
    <th>Precio</td>
  `
    table1.appendChild(tr)
    store.map(product => {
      const tr = d.createElement('tr')
      tr.innerHTML = `
      <td>${product.name}</td>
      <td>${Number(product.unit).toFixed(2)}</td>
      <td>${Number(product.pay).toFixed(2)}</td>
    `
      table1.appendChild(tr)
    })

    table2.innerHTML = `
  <tr>
    <td><strong>Total:</strong></td>
    <td></td>
    <td>${Number(GlobalPayState.payment).toFixed(2)}</td>
  </tr>
  `
    paymentMethods.methods.map(method => {
      const tr = d.createElement('tr')
      tr.innerHTML = `
      <td>${method.name}</td>
      <td></td>
      <td>${Number(method.tenderet).toFixed(2)}</td>
    `
      table2.appendChild(tr)
    })
    if (GlobalPayState.change > 0) {
      const tr = d.createElement('tr')

      tr.innerHTML = `
      <td>Cambio:</td>
      <td></td>
      <td>${Number(GlobalPayState.change).toFixed(2)}</td>
    `
      table2.appendChild(tr)
    }
  }
  function modifyViewPaymentMethod(method) {
    const element = method.element
    const due = element.querySelector('.mtd-due')
    const change = element.querySelector('.change')
    const tenderet = element.querySelector('.Payment__tendered')
    due.innerText = method.due
    change.innerText =
      Number(method.change) === 0 ? '' : Math.abs(Number(method.change))
    // change.innerText = method.change
    tenderet.innerText = method.tenderet === 0 ? '' : method.tenderet
    const tfoot = d.querySelector('.due')

    if (
      paymentMethods.due > 0 &&
      paymentMethods.due != GlobalPayState.payment
    ) {
      tfoot.innerText = paymentMethods.due
      tfoot.parentElement.parentElement.classList.remove('hidden')
    } else {
      tfoot.innerText = ''
      tfoot.parentElement.parentElement.classList.add('hidden')
    }
  }
  function printPaymentMethods(name) {
    const tbody = d.querySelector('.tbody')
    const selected = tbody.querySelector('.is-selected')
    const tr = d.createElement('tr')
    if (selected) {
      selected.classList.remove('is-selected')
    }
    tr.classList.add('is-selected')
    tr.innerHTML = `
    <td class="mtd-due">${
      paymentMethods.methods.length < 1
        ? GlobalPayState.payment
        : paymentMethods.due
    }</td>
    <td class="Payment__tendered"></td>
    <td class="change"></td>
    <td>${name}</td>
    <td>
      <button
        class="button danger is-small is-close js-method-del"
      >
        <i class="mdi cb-icon mdi-close"></i>
      </button>
    </td>
    `
    tbody.appendChild(tr)

    return tr
  }
})(document, console.log)
$(document).ready(function() {
  $('.customers__form').bootstrapValidator({
    live: 'enabled',
    message: 'This value is not valid',
    submitButtons: 'button[type="submit"]',
    trigger: null,
    fields: {
      tipoSocio: {
        validators: {
          notEmpty: {
            message: 'Selecione el tipo de socio'
          }
        }
      },
      direccion: {
        validators: {
          notEmpty: {
            message: 'Ingrese dirección'
          }
        }
      },
      razon_social: {
        validators: {
          notEmpty: {
            message: 'Ingrese el nombre'
          }
        }
      },
      nro_documento: {
        validators: {
          notEmpty: {
            message: 'Ingrese el numero de documento'
          }
        }
      }
    }
  })
})

const stateCustomers = {
  pages: null,
  currentPage: 1,
  fetching: false,
  customers: [],
  search: false
}
const stateProducts = {
  pages: null,
  currentPage: 1,
  fetching: false,
  products: [],
  search: false
}

const clusterizeProducts = new Clusterize({
  scrollId: 'products',
  contentId: 'contentArea',
  callbacks: {
    scrollingProgress: progress => {
      if (
        stateProducts.currentPage <= stateProducts.pages &&
        progress.toFixed(2) > 60 &&
        !stateProducts.search
      ) {
        loadProducts(stateProducts.currentPage)
      }
    }
  }
})

const clusterizeCustomers = new Clusterize({
  scrollId: 'tableCustomers',
  contentId: 'contentAreaCustomer',
  callbacks: {
    scrollingProgress: progress => {
      if (
        stateCustomers.currentPage <= stateCustomers.pages &&
        progress.toFixed(2) > 60 &&
        !stateCustomers.search
      ) {
        loadCustomers(stateCustomers.currentPage)
      }
    }
  }
})

function updateCustomersTable(customers, action = null) {
  if (action !== 'refresh') {
    stateCustomers.customers = stateCustomers.customers.concat(customers)
  }

  const customersHTML = customers.map(customer => {
    const tr = `
  <tr>
    <td data-id="${customer.id_persona}">${customer.nro_documento}</td>
    <td>${customer.razon_social}</td>
    <td>${customer.GrupoPersona}</td>
    <td>${customer.telefono_fijo}</td>
    <td>${customer.email}</td>
    <td class="table__buttons">
      <button
        class="button is-small is-success  js-customers-list-select"
      >
        <i class="mdi cb-icon mdi-account-check"></i>
      </button>
      <button
        class="button is-small js-customers-list-edit"
      >
        <i class="mdi cb-icon mdi-account-edit"></i>
      </button>
    </td>
  </tr>  
  `
    return tr
  })

  if (action === 'search') {
    clusterizeCustomers.update(customersHTML)
    return
  } else if (action === 'refresh') {
    clusterizeCustomers.update(customersHTML)
    return
  }
  clusterizeCustomers.append(customersHTML)
}
function updateProductsGrid(products, action = null) {
  if (action !== 'refresh') {
    stateProducts.products = stateProducts.products.concat(products)
  }

  const productsHTML = products.map(product => {
    const discountPercentage = product.MontoDescuento
      ? Math.round(
          ((Number(product.PrecioVenta) - Number(product.MontoDescuento)) *
            100) /
            product.PrecioVenta
        )
      : 0

    const card = `
    <div class="card ${product.MontoDescuento ? 'is-discount' : ''}" data-id="${
      product.IdArticulo
    }">
      <div class="card-image">
        <figure class="image is-4by3">
          <img
            src="${
              product.img
                ? product.img
                : 'https://bulma.io/images/placeholders/1280x960.png'
            }"
            alt="Placeholder image"
          />
        </figure>
      </div>
      <div class="card-content">
        <div class="media">
          <div class="content">
          ${product.Nombre}
          </div>
        </div>
      </div>
      <div class="card-text">
        <div class="card-item"><span>Unidad:</span><span>${
          product.UnidadMedida
        }</span></div>
        <div class="card-item"><span>Stock:</span><span>${
          product.CantidadActual
        }</span></div>
      </div>
      <div class="card-price" data-discount="-${discountPercentage}%">S/. <span class="price">${
      product.PrecioVenta
    }</span></div>
      <div class="card-discount"> S/. <span data-discount-unit="${discountPercentage}" class="price discount">${
      product.MontoDescuento
    }</span>
      </div>
    </div>`

    return card
  })

  function reduceProducts(array, dimension) {
    const res = array.reduce((a, c, i) => {
      return i % dimension === 0 ? a.concat([array.slice(i, i + dimension)]) : a
    }, [])

    return res.map(e => '<div class="Products">' + e.join('') + '</div>')
  }
  let productRows

  if (window.innerWidth > 1200) {
    productRows = reduceProducts(productsHTML, 5)
  } else if (window.innerWidth > 1024) {
    productRows = reduceProducts(productsHTML, 4)
  } else if (window.innerWidth > 800) {
    productRows = reduceProducts(productsHTML, 3)
  } else if (window.innerWidth > 380) {
    productRows = reduceProducts(productsHTML, 2)
  } else {
    productRows = productsHTML.map(
      products => '<div class="Products">' + products + '</div>'
    )
  }

  if (action === 'search') {
    clusterizeProducts.update(productRows)
    return
  } else if (action === 'refresh') {
    clusterizeProducts.update(productRows)
    return
  }
  clusterizeProducts.append(productRows)
}

const getPages = (recordsTotal, recordsPages) => {
  return recordsTotal % recordsPages !== 0
    ? Math.ceil(recordsTotal / recordsPages)
    : recordsTotal / recordsPages
}

function loadProducts(index) {
  stateProducts.pages = 5
  if (!stateProducts.fetching) {
    stateProducts.fetching = true

    fetch(`data/products${index ? '.' + index : ''}.json`)
      .then(response => {
        if (!response.ok) {
          throw Error(response.statusText)
        }
        stateProducts.fetching = false
        stateProducts.currentPage++
        return response.json()
      })
      .then(text => {
        //Success
        updateProductsGrid(text.data)
      })
      .catch(err => {
        // Error
        stateProducts.fetching = false
      })
  }
}

function loadCustomers(index) {
  stateCustomers.pages = 3
  if (!stateCustomers.fetching) {
    stateCustomers.fetching = true

    fetch(`data/customers${index ? '.' + index : ''}.json`)
      .then(response => {
        if (!response.ok) {
          throw Error(response.statusText)
        }
        stateCustomers.fetching = false
        stateCustomers.currentPage++

        return response.json()
      })
      .then(text => {
        //Success
        updateCustomersTable(text.data)
      })
      .catch(err => {
        // Error
        console.log(err)
        stateCustomers.fetching = false
      })
  }
}

loadProducts(1)
loadCustomers(1)
