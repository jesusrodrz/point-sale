var locale = window.navigator.userLanguage || window.navigator.language;
$(function () {
    $('[data-toggle="popover"]').popover();
    $('[data-toggle="tooltip"]').tooltip();
    /*Funcion para cargar Modal Buscar usuario Rol*/
    $("#AddUser").click(function () {
        var UrlModal = $("#UsuarioModal").data('url');
        $.get(UrlModal, function (data) {
            $("#MostrarModalUsuario").html(data);
            $("#UsuarioModal").modal('show');
        });
    });

    /*Funcion para cargar calendario*/
    $('.calendar-form').on('click',function (e) {
        $(this).datetimepicker({
            icons: {
                time: "fa fa-clock-o",
                date: "fa fa-calendar",
                up: "fa fa-arrow-up",
                down: "fa fa-arrow-down"
            },
            locale: locale,
            format: "DD/MM/YYYY"
        });
        e.preventDefault();
    });
    $(document).on('click', '.calendar-form', function (e) {
        $(this).datetimepicker({
            icons: {
                time: "fa fa-clock-o",
                date: "fa fa-calendar",
                up: "fa fa-arrow-up",
                down: "fa fa-arrow-down"
            },
            locale: locale,
            format: "DD/MM/YYYY"
        });
        e.preventDefault();
    });
    /*Funcion para cargar calendario y hora*/
    $(document).on('click', '.calendartimer-form', function (e) {
        $(this).datetimepicker({
            icons: {
                time: "fa fa-clock-o",
                date: "fa fa-calendar",
                up: "fa fa-arrow-up",
                down: "fa fa-arrow-down"
            },
            locale: locale,
            format: "DD/MM/YYYY HH:mm:ss"
        });
        e.preventDefault();
    });
    /*Funcion para mantener el filtro en pantalla*/
    $('.filter-main').on('click', function (e) {
        e.stopPropagation();
    });
    /*Funcion para agregar clase a una fila de la tabla*/
    $('.table-main').find('tbody').on('click', 'tr', function (e) {
        if ($(this).hasClass('selected-row')) {
            $(this).removeClass('selected-row').removeAttr("style");
        } else {
            $('tr.selected-row').removeClass('selected-row').removeAttr("style");
            $(this).addClass('selected-row').css("cssText", 'background-color : #41b3f9 !important');
        }
    });

    swalConfirm = function (sTitle, sText, callback) {
        swal({
            title: sTitle,
            text: sText,
            type: "info",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Aceptar",
            cancelButtonText: "Cancelar",
            closeOnConfirm: true
        }, callback);
        return false;
    };
});

/**
 * Funcion Cargar Modal
 * @param {string} IdModal id modal.
 * @param {string} UrlModal Url Modal.
 */
function CargarModal(UrlModal, IdModal, InfoModal) {
    $.get(UrlModal, function (data) {
        $("#" + InfoModal).html(data);
        $("#" + IdModal).modal('show');
    }).fail(function (jqXHR, textStatus, errorThrown) {
        if (jqXHR.status === 0) {
            MostrarErrores(textStatus + " Sin conexión verifque");
        } else if (jqXHR.status === 400) {
            MostrarErrores(textStatus + " error pagina no encontrada [400]");
        } else if (jqXHR.status === 500) {
            MostrarErrores(textStatus + " Interno [500]");
        }
    });
}

/* Funcion para limpiar Modal */
function ClearModal(modal, content) {
    $("#" + modal + "").modal('hide');
    $("#" + content + "").html('');
}
/**
 * Funcion para mostrar mensajes de error en los formularios
 * @param string Msj Mensaje a mostrar
 */
function MostrarErrores(Msj) {
    $('.alerttop').find('small').append(Msj);
    var test = $('.alerttop').fadeToggle(350).css({ 'z-index': '10005' });
}
/**
 * Funcion Cargar Panel
 * @param TitlePanel Titulo Panel
 * @param ThemePanel Thema Panel
 * @param {string} Url.
 * @returns {string} Panel.
 */
function CargarPanel(TitlePanel,ThemePanel,Url,Width = 850,Height = 600) {
    var Panel = $.jsPanel({
        closeOnEscape: true,
        position: 'center-top 0 60',
        show: 'animated fadeInDownBig',
        headerTitle: TitlePanel,
        theme: ThemePanel,
        contentOverflow: {
            horizontal: 'hidden',
            vertical: 'scroll'
        },
        container: document.body,
        contentSize: {
            width: function () { return Math.min(Width, window.innerWidth * 0.9); },
            height: function () { return Math.min(Height, window.innerHeight * 0.9); }
        },
        content: ' ... ',
        callback: function (panel) {
            $.get(Url, function (data) {
                $(panel.content).html(data);
                switch (data.accion) {
                    case "error":
                        MostrarMensaje('Error de operación', data.Msj, "error");
                        panel.close();
                        break;
                    default:
                        $(panel.content).html(data);
                        break;
                }
            });
        },
        onwindowresize: false
    }).css({ 'z-index': 9999 });
    return Panel;
}

/**
 * Funcion Cargar Tipo de Cambio
 * @param UrlAccion Url Accion
 * @param IdSelect Select
 * @param FechaInput Fecha Input
 * @param TipoCambioInput Tipo de cambio valor
 * @param IdTipoCambioInput Id Tipo de cambio
 */
function CargarTipoCambio(UrlAccion,IdSelect, FechaInput, TipoCambioInput, IdTipoCambioInput ) {
    $.ajax({
        type: "POST",
        url: UrlAccion,
        dataType: 'json',
        data: {
            IdMoneda: $(IdSelect).val(),
            Fecha: $(FechaInput).val()
        }
    }).done(function (data) {
        switch (data.accion) {
            case "succes":
                $(TipoCambioInput).val(data.TipoCambio);
                $(IdTipoCambioInput).val(data.IdTipoCambio);
                break;
            case "error":
                $(TipoCambioInput).val('0.00');
                $(IdTipoCambioInput).val('');
                MostrarMensaje('Error de operación', data.Msj, 'error');
                break;
        }
    })
}

function ConvertToDecimal(numero, decimales) {
    if (numero == undefined || numero == '') numero = '0.00';
    else numero = numero.toString().split(',').join('');
    if (typeof decimales == 'undefined') return parseFloat(numero); 
    else return redondear(numero, decimales);
}

function redondear(cantidad, decimales) {
    var cantidad = parseFloat(cantidad);
    var decimales = parseFloat(decimales);
    decimales = (!decimales ? 2 : decimales);
    return Math.round(cantidad * Math.pow(10, decimales)) / Math.pow(10, decimales);
} 

function ConvertToString(monto, nroDecimales) {
    if (monto == undefined) return '0.00';
    var i = 0;
    var pos;
    var decimales = '';
    var valor = monto.toString();
    var max = valor.length;
    for (var j = 0; j < max; j++) {
        if (valor.charAt(j) == '.') {
            pos = j;
            break;
        }
    }
    var monto_redondeo = redondear(monto, nroDecimales);
    //alert(monto_redondeo);
    valor = monto_redondeo.toString();
    pos = parseInt(pos);
    if (pos > 0) {
        decimales = valor.substring(pos + 1, valor.length);
        decimales = Rellena_Ceros(decimales, nroDecimales - decimales.length);
    }
    else
        decimales = Rellena_Ceros(decimales, nroDecimales);

    //if (decimales == '') decimales = '00';
    var entero = parseInt(monto_redondeo);
    var tmp = parseInt(entero / 1000);
    var miles;
    var centenas;
    var total_miles;
    if (tmp > 0) {
        total_miles = tmp.toString().length;
    }
    else
        total_miles = 0;

    if (total_miles > 0) {
        miles = entero.toString().substring(0, total_miles);
        centenas = entero % 1000;
        centenas = centenas.toString()
        var cen = centenas.length;
        if (cen == 1)
            centenas = '00' + centenas;
        else if (cen == 2)
            centenas = '0' + centenas;

        resultado = miles + ',' + centenas;
    }
    else
        resultado = entero;

    resultado = resultado + '.' + decimales;
    return resultado;
}

function Rellena_Ceros(cadena, N)  // Funcion que antepone ceros a una cadena hasta alcazar
{                                 // una longitud N. Si N es menor que la longitud, no pone ninguno.
    var k = 0;
    var resultado = cadena.toString();
    //alert(resultado);
    //alert(resultado.length);
    //for (k=resultado.length; k<N; k++)
    for (k; k < N; k++)
        resultado = resultado.toString() + "0";
    return resultado;
}

/*Cerrar Alerta*/
$(".myadmin-alert .closed").click(function (event) {
    $(this).parents(".myadmin-alert").find('small').text('');
    $(this).parents(".myadmin-alert").fadeToggle(350);
    return false;
});

function MostrarMensaje(sTitle, sText, sType) {
    swal({
        title: sTitle,
        text: sText,
        type: sType,
        confirmButtonText: "OK"
    });
}

/**
 * Gets the data table height based upon the browser page
 * height and the data table vertical position.
 * 
 * @return  Data table height, in pixels.
 */
function jsGetDataTableHeightPx(idTabla) {
    // set default return height
    var retHeightPx = 350;

    // no nada if there is no dataTable (container) element
    var dataTable = document.getElementById(idTabla);
    if (!dataTable) {
        return retHeightPx;
    }

    // do nada if we can't determine the browser height
    var pageHeight = $(window).height();
    if (pageHeight < 0) {
        return retHeightPx;
    }

    // determine the data table height based upon the browser page height
    var dataTableHeight = pageHeight - 320; //default height
    var dataTablePos = $("#" + idTabla).offset();
    if (dataTablePos != null && dataTablePos.top > 0) {
        // the data table height is the page height minus the top of the data table,
        // minus space for any buttons at the bottom of the page
        dataTableHeight = pageHeight - dataTablePos.top - 120;

        // clip height to min. value
        retHeightPx = Math.max(100, dataTableHeight);
    }
    return retHeightPx;
}

function OpenVentanaMaximizada(pagina, name) {
    var sOptions;
    sOptions = 'status=yes,menubar=no,scrollbars=yes,resizable=no,toolbar=no';
    sOptions = sOptions + ',width=' + (screen.availWidth - 10).toString();
    sOptions = sOptions + ',height=' + (screen.availHeight - 122).toString();
    sOptions = sOptions + ',screenX=0,screenY=0,left=0,top=0';
    wOpen = window.open(pagina, name, sOptions);
    wOpen.moveTo(0, 0);
    wOpen.resizeTo(screen.availWidth, screen.availHeight);
}